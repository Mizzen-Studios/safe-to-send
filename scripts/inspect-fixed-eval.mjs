// Offline replay only. Never launches inference or edits the original receipt.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const [dir,out,runId]=process.argv.slice(2);
if(!dir||!out||!/^\d+$/.test(runId??''))throw Error('Usage: node scripts/inspect-fixed-eval.mjs ARTIFACT_DIR OUTPUT_JSON RUN_ID');
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(resolve(dir,'receipt.json')),r=JSON.parse(bytes);
const proof=JSON.parse(await readFile(resolve(dir,'proof.json'))),manifest=JSON.parse(await readFile(resolve(dir,'manifest.json')));
let manifestCount=0;
for(const [path,v]of Object.entries(manifest.artifacts)){const b=await readFile(resolve(dir,path));assert.equal(hash(b),v.sha256,path);assert.equal(b.length,v.bytes,path);manifestCount++;}
assert.equal(hash(bytes),proof.receipt.sha256);assert.equal(r.source.commit,proof.sourceCommit);assert.equal(r.source.dirty,false);
const sourceHashes={};
for(const [path,h]of Object.entries(r.source.sha256)){const b=execFileSync('git',['show',r.source.commit+':'+path]);assert.equal(hash(b),h,path);sourceHashes[path]=h;}
// Replay must run from the exact evaluated implementation, not a later adapter.
for(const [path,h]of Object.entries(sourceHashes))assert.equal(hash(await readFile(path)),h,path);
assert.equal(r.detectors.length,32);assert.equal(r.verifiers.length,128);
const server=await createServer({configFile:false,envDir:false,publicDir:false,logLevel:'error',server:{middlewareMode:true}});
try {
 const {evalCorpus,characterCounts}=await server.ssrLoadModule('/src/eval-corpus.ts');
 const {regexSpans}=await server.ssrLoadModule('/src/regex.ts');
 const {partialTextDetection,validateQuoteVerification,verifierSchemaFor,verificationPromptFor,piiSchema}=await server.ssrLoadModule('/src/nano.ts');
 const {automaticReviewSpans}=await server.ssrLoadModule('/src/manual-suggestions.ts');
 const {fixedChecks,claimBatches,responseJSON}=await server.ssrLoadModule('/src/fixed-verdict.ts');
 const {trials,decision}=await server.ssrLoadModule('/operator/device-eval/core.ts');
 const contract=JSON.parse(await readFile('shared/nano/contract.json'));
 assert.equal(hash(JSON.stringify(evalCorpus)),r.hashes.corpusSha256);
 const nativeText=c=>{assert.equal(c.input.length,1);assert.equal(c.input[0].role,'user');assert.equal(c.input[0].content.length,1);assert.equal(c.input[0].content[0].type,'text');return c.input[0].content[0].value;};
 const nativeCalls=row=>(row.capture?.nativeCalls??[]).filter(c=>c.operation==='prompt');
 let prompts=0,nativeErrors=0,abortedNativePrompts=0;
 for(const row of [r.initialization,...r.detectors,...r.verifiers]){
  nativeErrors+=(row.capture?.nativeErrors??[]).length;
  for(const c of nativeCalls(row)){prompts++;assert.equal(hash(JSON.stringify(c.input)),c.promptSha256);assert.equal(hash(JSON.stringify(c.schema)),c.schemaSha256);if(c.status!=='success')abortedNativePrompts++;}
 }
 const counts=rows=>Object.fromEntries(['success','accepted','rejected','unknown','error','timeout','aborted','not_run'].map(s=>[s,rows.filter(x=>x.status===s).length]));
 for(const [name,rows]of Object.entries({detectors:r.detectors,verifiers:r.verifiers,mutations:r.verifiers.filter(x=>x.variant!=='control'),controls:r.verifiers.filter(x=>x.variant==='control')})){
  assert.equal(rows.length,r.coverage[name].planned);for(const [s,n]of Object.entries(counts(rows)))assert.equal(n,r.coverage[name][s]);
 }
 const total=rows=>{const c=rows.reduce((a,b)=>({tp:a.tp+b.tp,actual:a.actual+b.actual,predicted:a.predicted+b.predicted}),{tp:0,actual:0,predicted:0});return {...c,fp:c.predicted-c.tp,fn:c.actual-c.tp,recall:c.actual?c.tp/c.actual:null,precision:c.predicted?c.tp/c.predicted:null};};
 const detected=[],falsePositiveExamples=[],falseNegativeExamples=[];
 for(const row of r.detectors){
  const l=evalCorpus.find(l=>l.id===row.id),calls=nativeCalls(row);
  if(row.status==='not_run'){assert.equal(calls.length,0);continue;}
  if(calls.length){assert.equal(calls.length,1);assert.equal(nativeText(calls[0]),contract.detectionPrompt+' '+'\n'+JSON.stringify({original:l.text}));assert.deepEqual(calls[0].schema,piiSchema);}
  if(row.status!=='success')continue;
  const raw=partialTextDetection(row.rawJson,l.text),filtered=automaticReviewSpans(l.text,raw.spans),result=r.results.find(x=>x.id===l.id);
  assert.deepEqual(filtered,result.spans);assert.equal(row.invalidFindings,raw.invalidFindings);assert.equal(result.transcription,l.text);
  detected.push({id:l.id,invalidFindings:raw.invalidFindings,adapter:characterCounts(l.text,l.truth,filtered),regex:characterCounts(l.text,l.truth,regexSpans(l.text)),combined:characterCounts(l.text,l.truth,[...filtered,...regexSpans(l.text)])});
  for(const s of filtered){const v=characterCounts(l.text,l.truth,[s]);if(v.predicted>v.tp)falsePositiveExamples.push({id:l.id,quote:l.text.slice(s.start,s.end),kind:s.kind,falsePositiveCharacters:v.predicted-v.tp});}
  for(const s of l.truth){const mask=new Set(filtered.flatMap(p=>Array.from({length:p.end-p.start},(_,i)=>p.start+i)));let missed=0;for(let i=s.start;i<s.end;i++)if(!mask.has(i))missed++;if(missed)falseNegativeExamples.push({id:l.id,quote:l.text.slice(s.start,s.end),kind:s.kind,missedCharacters:missed});}
 }
 const batchHistogram={},rawStatusCounts={},normalizedStatusCounts={},expected=trials();let reconstructedVerifierPrompts=0,invalidEvidenceCheckCount=0,missingCheckCount=0;
 for(const row of r.verifiers){
  const t=expected.find(t=>t.trialId===row.trialId);assert.equal(row.id,t.id);assert.equal(row.variant,t.variant);
  const calls=nativeCalls(row),batches=claimBatches(t.claims),checks=[];batchHistogram[calls.length]=(batchHistogram[calls.length]??0)+1;
  for(let i=0;i<calls.length;i++){
   assert.ok(i<batches.length);const claims=batches[i];
   assert.equal(nativeText(calls[i]),verificationPromptFor(t.original,claims));assert.deepEqual(calls[i].schema,verifierSchemaFor(claims));reconstructedVerifierPrompts++;
   if(calls[i].status!=='success'){assert.ok(['error','timeout','aborted'].includes(row.status));continue;}
   try{const wire=responseJSON(row.capture.rawOutputs[i]);missingCheckCount+=claims.length-wire.checks.length;for(const c of wire.checks){rawStatusCounts[c.status]=(rawStatusCounts[c.status]??0)+1;if(c.evidence.some(e=>!t.original.includes(e.quote)))invalidEvidenceCheckCount++;}const normalized=fixedChecks(row.capture.rawOutputs[i],t.original,claims);for(const c of JSON.parse(normalized).checks)normalizedStatusCounts[c.status]=(normalizedStatusCounts[c.status]??0)+1;validateQuoteVerification(normalized,t.original,claims);checks.push(...JSON.parse(normalized).checks);}catch(e){assert.equal(row.status,'error');assert.equal(i,calls.length-1);}
  }
  if(['accepted','rejected','unknown'].includes(row.status)){
   assert.equal(calls.length,batches.length);const raw=JSON.stringify({checks});assert.equal(raw,row.rawJson);const d=decision(raw,t.original,t.claims);assert.equal(d.status,row.status);assert.deepEqual(d.checks,row.checks);
  }
 }
 const group=(rows,control)=>{const c=counts(rows),decided=c.accepted+c.rejected,attempted=rows.filter(x=>x.status!=='not_run').length;return {planned:rows.length,attempted,...c,decided,decidedOverPlanned:decided/rows.length,decidedOverAttempted:attempted?decided/attempted:null,trueDecisions:control?c.accepted:c.rejected,falseDecisions:control?c.rejected:c.accepted,decidedSubsetCorrectRate:decided?(control?c.accepted:c.rejected)/decided:null};};
 const timing=rows=>{const values=rows.filter(x=>x.status!=='not_run').map(x=>x.latencyMs).sort((a,b)=>a-b);return {n:values.length,p50Ms:values.length?values[Math.ceil(values.length*.5)-1]:null,p95Ms:values.length?values[Math.ceil(values.length*.95)-1]:null};};
 const controls=group(r.verifiers.filter(x=>x.variant==='control'),true),mutations=group(r.verifiers.filter(x=>x.variant!=='control'),false);
 const fullRegex=evalCorpus.map(l=>characterCounts(l.text,l.truth,regexSpans(l.text)));
 const summary={run:'https://github.com/Mizzen-Studios/safe-to-send/actions/runs/'+runId,source:r.source.commit,sourceHashes,receipt:{sha256:hash(bytes),bytes:bytes.length,manifestCount},modelIdentity:{status:'UNKNOWN',reportedName:null,operatorLabel:r.model,reason:'No actual API-reported model name/revision in receipt; operator label is not identity.'},browser:proof.chrome,proofStatus:proof.status,proofErrors:proof.errors,pageNetwork:proof.network,promptInspection:{prompts,nativeErrors,abortedNativePrompts,reconstructedVerifierPrompts,batchHistogram,exactProductionPromptsAndSchemas:true,expectedLabelsSent:false},detectors:{planned:32,...counts(r.detectors),noticesWithInvalidFindings:detected.filter(x=>x.invalidFindings).map(x=>({id:x.id,invalidFindings:x.invalidFindings})),invalidFindingCount:detected.reduce((n,x)=>n+x.invalidFindings,0),validAdapterNoticeCount:detected.length,fullTruthCharacters:evalCorpus.reduce((n,l)=>n+characterCounts(l.text,l.truth,[]).actual,0),adapter:total(detected.map(x=>x.adapter)),strictCleanSubset:{noticeCount:detected.filter(x=>!x.invalidFindings).length,...total(detected.filter(x=>!x.invalidFindings).map(x=>x.adapter))},prior29NoticeSubset:{excludedIds:['hmrc-04','nhs-02','council-04'],noticeCount:detected.filter(x=>!['hmrc-04','nhs-02','council-04'].includes(x.id)).length,...total(detected.filter(x=>!['hmrc-04','nhs-02','council-04'].includes(x.id)).map(x=>x.adapter))},regexSameSubset:total(detected.map(x=>x.regex)),combinedOfflineUnion:total(detected.map(x=>x.combined)),regexFullCorpus:total(fullRegex),rows:detected,falsePositiveExamples,falseNegativeExamples},verifiers:{rawStatusCounts,normalizedStatusCounts,invalidEvidenceCheckCount,missingCheckCount,planned:128,attempted:r.verifiers.filter(x=>x.status!=='not_run').length,...counts(r.verifiers),mutations,controls,byVariant:Object.fromEntries(['deadline','amountPence','action','control'].map(v=>[v,group(r.verifiers.filter(x=>x.variant===v),v==='control')])),checkStatusCounts:Object.fromEntries(['supported','mismatch','unsupported','unknown'].map(s=>[s,r.verifiers.reduce((n,x)=>n+(x.checks??[]).filter(c=>c.status===s).length,0)])),errors:r.verifiers.filter(x=>['error','timeout','aborted'].includes(x.status)).map(x=>({trialId:x.trialId,id:x.id,status:x.status,error:x.error})),unknownTrials:r.verifiers.filter(x=>x.status==='unknown').map(x=>({trialId:x.trialId,id:x.id,variant:x.variant,checks:x.checks}))},timing:{initializationMs:r.initializationMs,detectorSuccessful:timing(r.detectors.filter(x=>x.status==='success')),detectorAttempted:timing(r.detectors),verifierAttempted:timing(r.verifiers)},limitations:'Authored synthetic 32 notices, 96 mutations and 32 controls, three submitted fields only; not whole product explanation/draft/cloud-generated answers, real letters, images/OCR, Android or device attestation. Character scoring is coverage, not kind correctness. Invalid exact findings are omitted with diagnostics and false negatives retained. No retries or truth labels supplied. Unknown/error/timeout/aborted/not_run are never counted as rejection or accuracy.'};
 await writeFile(out,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({receipt:summary.receipt,detectors:{n:detected.length,adapter:summary.detectors.adapter,invalidFindingCount:summary.detectors.invalidFindingCount},verifiers:{...summary.verifiers,unknownTrials:undefined},timing:summary.timing},null,2));
}finally{await server.close();}
