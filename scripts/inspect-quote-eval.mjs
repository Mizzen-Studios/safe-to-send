// Offline inspection only; never supplies or repairs model output.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
const [dir,out]=process.argv.slice(2);
if(!dir||!out)throw Error('Usage: node scripts/inspect-quote-eval.mjs ARTIFACT_DIR OUTPUT_JSON');
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile(resolve(dir,'receipt.json')),r=JSON.parse(bytes),p=JSON.parse(await readFile(resolve(dir,'proof.json'))),m=JSON.parse(await readFile(resolve(dir,'manifest.json')));
const verified=[];
for(const [name,v] of Object.entries(m.artifacts)){const b=await readFile(resolve(dir,name));assert.equal(hash(b),v.sha256,name);assert.equal(b.length,v.bytes,name);verified.push(name);}
assert.equal(hash(bytes),p.receipt.sha256);assert.equal(r.source.commit,p.sourceCommit);assert.equal(r.detectors.length,32);assert.equal(r.verifiers.length,128);
for(const [name,expected] of Object.entries(r.source.sha256))assert.equal(hash(await readFile(name)),expected,name);
const rows=[r.initialization,...r.detectors,...r.verifiers];let prompts=0,nativeErrors=0;
for(const row of rows){nativeErrors+=row.capture.nativeErrors.length;for(const c of row.capture.nativeCalls)if(c.operation==='prompt'){prompts++;assert.equal(hash(JSON.stringify(c.input)),c.promptSha256);assert.equal(hash(JSON.stringify(c.schema)),c.schemaSha256);assert.equal(c.status,'success');}}
const counts=rows=>Object.fromEntries(['success','accepted','rejected','unknown','error','timeout','aborted','not_run'].map(s=>[s,rows.filter(r=>r.status===s).length]));
for(const [name,rows] of Object.entries({detectors:r.detectors,verifiers:r.verifiers,mutations:r.verifiers.filter(x=>x.variant!=='control'),controls:r.verifiers.filter(x=>x.variant==='control')})){assert.equal(rows.length,r.coverage[name].planned);for(const [s,n] of Object.entries(counts(rows)))assert.equal(n,r.coverage[name][s]);}
const percentile=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.ceil(xs.length*p)-1];
const timing=rows=>({n:rows.length,p50Ms:percentile(rows.map(x=>x.latencyMs),.5),p95Ms:percentile(rows.map(x=>x.latencyMs),.95)});
const errors=rows=>Object.fromEntries([...new Set(rows.filter(x=>x.status==='error').map(x=>x.error))].map(e=>[e,rows.filter(x=>x.error===e).length]));
const server=await createServer({configFile:false,envDir:false,publicDir:false,logLevel:'error',server:{middlewareMode:true}});
try{
const {evalCorpus,characterCounts}=await server.ssrLoadModule('/src/eval-corpus.ts');const {regexSpans}=await server.ssrLoadModule('/src/regex.ts');
let regex={tp:0,actual:0,predicted:0};for(const row of r.results){const l=evalCorpus.find(x=>x.id===row.id),c=characterCounts(l.text,l.truth,regexSpans(l.text));for(const k of Object.keys(regex))regex[k]+=c[k];}regex={...regex,recall:regex.tp/regex.actual,precision:regex.tp/regex.predicted};
const summary={run:'https://github.com/Mizzen-Studios/safe-to-send/actions/runs/43348904459',source:r.source,receiptSha256:hash(bytes),receiptBytes:bytes.length,modelIdentity:{status:'UNKNOWN',reportedName:null,reason:'Exact model identity/revision is not exposed or attested. Receipt model string is an operator label, not a measured identity.'},browser:p.chrome,os:r.os,proofStatus:p.status,proofErrors:p.errors,pageNetwork:p.network,coverage:r.coverage,nativePromptCount:prompts,nativeErrors,verifiedManifestFiles:verified,initializationMs:r.initializationMs,timing:{detectorSuccessfulSubset:timing(r.detectors.filter(x=>x.status==='success')),detectorAllAttempted:timing(r.detectors),verifierAllAttempted:timing(r.verifiers)},detectorErrors:r.detectors.filter(x=>x.status!=='success').map(x=>({id:x.id,status:x.status,error:x.error,rawOutputs:x.capture.rawOutputs})),verifierErrors:errors(r.verifiers),regexSameSuccessfulSubset:regex,fullCorpusTruthCharacters:evalCorpus.reduce((n,l)=>n+characterCounts(l.text,l.truth,[]).actual,0),limitations:r.limits};
await writeFile(out,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
}finally{await server.close();}
