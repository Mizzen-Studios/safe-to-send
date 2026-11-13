// Offline synthetic evidence inspection. No inference, repairs or redispatch.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
const [dir,out]=process.argv.slice(2),r=JSON.parse(await readFile(resolve(dir,'receipt.json')));
const hash=b=>createHash('sha256').update(b).digest('hex');
const server=await createServer({configFile:false,envDir:false,publicDir:false,logLevel:'error',server:{middlewareMode:true}});
try {
 const {evalCorpus,characterCounts,regexEvaluation}=await server.ssrLoadModule('/src/eval-corpus.ts');
 const {regexSpans}=await server.ssrLoadModule('/src/regex.ts');
 const {parseTextDetection,validateQuoteVerification,verifierSchemaFor,piiSchema}=await server.ssrLoadModule('/src/nano.ts');
 const {automaticReviewSpans}=await server.ssrLoadModule('/src/manual-suggestions.ts');
 const {trials,decision}=await server.ssrLoadModule('/operator/device-eval/core.ts');
 const contract=JSON.parse(await readFile('shared/nano/contract.json'));
 assert.equal(r.source.commit,'a8757413f8fec8ec74c555ba896db8b18f1559c5');
 assert.equal(r.source.dirty,false);
 const nativeText=c=>{assert.equal(c.input.length,1);assert.equal(c.input[0].role,'user');assert.equal(c.input[0].content.length,1);assert.equal(c.input[0].content[0].type,'text');return c.input[0].content[0].value;};
 const total=rows=>{const c=rows.reduce((a,b)=>({tp:a.tp+b.tp,actual:a.actual+b.actual,predicted:a.predicted+b.predicted}),{tp:0,actual:0,predicted:0});return {...c,fp:c.predicted-c.tp,fn:c.actual-c.tp,recall:c.actual?c.tp/c.actual:null,precision:c.predicted?c.tp/c.predicted:null};};
 const detected=[],falsePositiveExamples=[];let detectorPrompts=0,verifierPrompts=0;const batches={};
 for(const row of r.detectors){
  const l=evalCorpus.find(l=>l.id===row.id),calls=row.capture.nativeCalls.filter(c=>c.operation==='prompt');
  assert.equal(calls.length,1);
  assert.equal(nativeText(calls[0]),contract.detectionPrompt+' '+ '\n'+JSON.stringify({original:l.text}));
  assert.deepEqual(calls[0].schema,piiSchema);detectorPrompts++;
  if(row.status!=='success')continue;
  const raw=parseTextDetection(row.rawJson,l.text),filtered=automaticReviewSpans(l.text,raw),result=r.results.find(x=>x.id===l.id);
  assert.deepEqual(filtered,result.spans);assert.equal(result.transcription,l.text);
  const c=characterCounts(l.text,l.truth,filtered);
  detected.push({id:l.id,adapter:c,regex:characterCounts(l.text,l.truth,regexSpans(l.text)),combined:characterCounts(l.text,l.truth,[...filtered,...regexSpans(l.text)]),rawSpanCount:raw.length,adapterSpanCount:filtered.length});
  for(const s of filtered){const v=characterCounts(l.text,l.truth,[s]);if(v.predicted>v.tp)falsePositiveExamples.push({id:l.id,quote:l.text.slice(s.start,s.end),kind:s.kind,falsePositiveCharacters:v.predicted-v.tp});}
 }
 const expected=trials();
 for(const row of r.verifiers){
  const t=expected.find(t=>t.trialId===row.trialId);assert.equal(row.id,t.id);assert.equal(row.variant,t.variant);
  const calls=row.capture.nativeCalls.filter(c=>c.operation==='prompt');batches[calls.length]=(batches[calls.length]??0)+1;
  const checks=[];
  for(let i=0;i<calls.length;i++){
   const claims=[t.claims[i]];assert.equal(nativeText(calls[i]),contract.verificationPrompt+'\n'+JSON.stringify({original:t.original,claims}));
   assert.deepEqual(calls[i].schema,verifierSchemaFor(claims));verifierPrompts++;
   if(calls[i].status!=='success'){assert.equal(row.status,'timeout');assert.equal(i,calls.length-1);continue;}
   const raw=row.capture.rawOutputs[i];
   try {validateQuoteVerification(raw,t.original,claims);checks.push(...JSON.parse(raw).checks);}catch(e){assert.equal(row.status,'error');assert.equal(i,calls.length-1);assert.equal('Error: '+e.message,row.error);}
  }
  if(['accepted','rejected','unknown'].includes(row.status)){assert.equal(calls.length,3);const d=decision(JSON.stringify({checks}),t.original,t.claims);assert.equal(d.status,row.status);assert.deepEqual(d.checks,row.checks);}
 }
 const statuses=rows=>Object.fromEntries(['accepted','rejected','unknown','error','timeout','aborted','not_run'].map(s=>[s,rows.filter(x=>x.status===s).length]));
 const group=rows=>{const c=statuses(rows),decided=c.accepted+c.rejected;return {planned:rows.length,...c,decided,decidedFraction:decided/rows.length,observedRejectionsOverPlanned:c.rejected/rows.length,decidedSubsetRejectionRate:decided?c.rejected/decided:null};};
 const additionalSourceHashes=Object.fromEntries(await Promise.all(['shared/nano/contract.json','src/manual-suggestions.ts','src/typed-evidence.ts','src/regex.ts','src/privacy.ts'].map(async p=>{const bytes=await readFile(p);assert.equal(hash(bytes),hash(execFileSync('git',['show',r.source.commit+':'+p])));return [p,hash(bytes)];})));
 assert.equal(hash(JSON.stringify(evalCorpus)),r.hashes.corpusSha256);
 const result={verdict:'PARTIAL_FAILED_ACCEPTANCE_GATE',promptInspection:{detectorPrompts,verifierPrompts,total:detectorPrompts+verifierPrompts,verifierBatchHistogram:batches,exactProductionPromptAndSchemaReconstruction:true,expectedLabelsSent:false,reason:'Every captured input equals production guidance plus original only, or original and submitted claim batch. Truth spans, variants, trial ids and expected decisions are absent.'},additionalSourceHashes,additionalSourceHashBinding:'These files match the run head commit; the original receipt hashes only eight source files. No claim that extra hashes were embedded by the collector.',scoring:'UTF-16 character micro counts, successful detector subset only; Nano adapter includes deterministic DATE filtering after exact quote parsing, NOT raw model performance',detectors:{planned:32,successful:detected.length,subsetIds:detected.map(x=>x.id),adapter:total(detected.map(x=>x.adapter)),regexSameSubset:total(detected.map(x=>x.regex)),combinedUnion:total(detected.map(x=>x.combined)),regexFullCorpus:regexEvaluation(),rows:detected,falsePositiveExamples},verifiers:{all:group(r.verifiers),mutations:group(r.verifiers.filter(x=>x.variant!=='control')),controls:group(r.verifiers.filter(x=>x.variant==='control'))},limits:'No expected truth or labels supplied to native API. Candidate claims are authored test inputs, not model-generated cloud answers. This trial score is not full product two-key validation. Null decided rates mean undefined, never zero accuracy.'};
 await writeFile(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({prompts:result.promptInspection,detectors:result.detectors.adapter,verifiers:result.verifiers},null,2));
} finally {await server.close();}
