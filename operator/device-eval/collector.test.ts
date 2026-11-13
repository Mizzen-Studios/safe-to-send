import {afterEach,expect,it,vi} from 'vitest';
import {deleteApp,getApps} from 'firebase/app';
import {createNano,piiSchema,indexedOriginal,verifierSchemaFor} from '../../src/nano';
import {evalCorpus} from '../../src/eval-corpus';
import {collect,trials,claimsFor,decision,type Capture} from './core';
import {recordNativeProvider,hashCaptures} from './native';
import {CSP,staticHandler} from './run.mjs';
const TEST_ONLY={provenance:'TEST_ONLY' as const,browser:'TEST_ONLY injected native mock',os:'TEST_ONLY',model:'TEST_ONLY not a model measurement'};
const lifecycle={begin(){},end(){},close(){}};
afterEach(async()=>{vi.unstubAllGlobals();await Promise.all(getApps().map(deleteApp));});
it('TEST_ONLY: deterministic 128 unique trials, 96 mutations +32 controls; inputs have no labels',()=>{
 const a=trials();expect(a).toEqual(trials());expect(a).toHaveLength(128);expect(new Set(a.map(r=>r.id+':'+r.variant)).size).toBe(128);expect(a.filter(r=>r.variant==='control')).toHaveLength(32);
 for(const t of a){expect(t.claims.map(c=>c.id)).toEqual(['c0','c1','c2']);expect(t.original).not.toContain('⟦');expect(JSON.stringify({original:t.original,claims:t.claims})).not.toMatch(/"(truth|mutations|variant|trialId|expected|rejected)"/);}
});
it('TEST_ONLY: unknown and malformed evidence do not become rejection',()=>{
 const claims=claimsFor(evalCorpus[0].claim),original=evalCorpus[0].text;
 const raw=JSON.stringify({checks:claims.map(c=>({id:c.id,status:c.id==='c0'?'mismatch':'unknown',evidence:[]}))});
 expect(decision(raw,original,claims).status).toBe('unknown');expect(()=>decision('{}',original,claims)).toThrow();
 const evidence=[{start:0,end:original.length,quote:original}];
 const supported=JSON.stringify({checks:claims.map(c=>({id:c.id,status:'supported',evidence}))});expect(decision(supported,original,claims).status).toBe('accepted');
 const rejected=JSON.stringify({checks:claims.map(c=>({id:c.id,status:c.id==='c2'?'unsupported':'supported',evidence}))});expect(decision(rejected,original,claims).status).toBe('rejected');
});
it('TEST_ONLY: failures and unknowns retained separately, successes satisfy importer row contract',async()=>{
 let n=0;const run=await collect({initialize:async()=>{},detect:async text=>({text,spans:[],rawJson:'{"spans":[]}',latencyMs:0}),verify:async(_text,claims)=>{n++;if(n===1)throw Error('TEST_ONLY failure');if(n===2)return 'invalid JSON';return JSON.stringify({checks:claims.map(c=>({id:c.id,status:n===3?'unknown':'unsupported',evidence:[]}))});}},lifecycle,TEST_ONLY);
 expect(run.provenance).toBe('TEST_ONLY');expect(run.results).toHaveLength(32);expect(run.twoKeyDecisions).toHaveLength(125);expect(run.coverage.verifiers.error).toBe(2);expect(run.coverage.verifiers.unknown).toBe(1);expect(run.verifiers[0].error).toContain('TEST_ONLY failure');
 for(const row of run.results){expect(row.transcription).toBe(evalCorpus.find(l=>l.id===row.id)!.text);expect(row.latencyMs).toBeGreaterThanOrEqual(0);expect(row.spans).toEqual([]);}
 for(const row of run.twoKeyDecisions){expect(['control','deadline','amountPence','action']).toContain(row.variant);expect(typeof row.rejected).toBe('boolean');}
});
it('TEST_ONLY: bounded timeout halts remaining calls, closes lifecycle',async()=>{
 const close=vi.fn(),end=vi.fn();let calls=0;
 const run=await collect({initialize:async()=>{},detect:async()=>{calls++;return new Promise(()=>{});},verify:async()=>{throw Error('must not execute');}},{begin(){},end,close},{...TEST_ONLY,callTimeoutMs:5});
 expect(calls).toBe(1);expect(run.detectors[0].status).toBe('timeout');expect(run.coverage.detectors.not_run).toBe(31);expect(run.coverage.verifiers.not_run).toBe(128);expect(run.twoKeyDecisions).toEqual([]);expect(close).toHaveBeenCalledOnce();expect(end).toHaveBeenCalledTimes(2);
});
it('TEST_ONLY: init failure executes no model calls',async()=>{
 const detect=vi.fn();const run=await collect({initialize:async()=>{throw Error('TEST_ONLY unavailable');},detect,verify:vi.fn()},lifecycle,TEST_ONLY);
 expect(run.initialization.status).toBe('error');expect(detect).not.toHaveBeenCalled();expect(run.results).toEqual([]);expect(run.coverage.verifiers.not_run).toBe(128);
});
it('TEST_ONLY: actual production adapter prompts/schemas recorded; raw invalid output survives validation error',async()=>{
 let promptCount=0,destroyed=0;const nativeInputs:any[]=[];
 const fake={availability:async()=> 'available',create:async()=>({destroy(){destroyed++;},prompt:async(input:any,options:any)=>{nativeInputs.push({input,options});promptCount++;if(promptCount===1)return 'TEST_ONLY malformed detection';if(promptCount===2)throw Error('TEST_ONLY native failure');if(promptCount<=32)return '{"spans":[]}';return JSON.stringify({checks:options.responseConstraint.properties.checks.items.properties.id.enum.map((id:string)=>({id,status:'unknown',evidence:[]}))});}})};
 const fetch=vi.fn(()=>{throw Error('TEST_ONLY unexpected network');});vi.stubGlobal('fetch',fetch);
 vi.stubGlobal('LanguageModel',fake);vi.stubGlobal('window',globalThis);vi.stubGlobal('document',{});vi.stubGlobal('isSecureContext',true);
 const recorder=recordNativeProvider();
 const nano=createNano({apiKey:'TEST_ONLY',projectId:'test-only',appId:'test-only'});
 const run=await hashCaptures(await collect(nano,recorder,TEST_ONLY));
 expect(run.initialization.status,JSON.stringify(run.initialization)).toBe('success');expect(run.provenance).toBe('TEST_ONLY');expect(promptCount,JSON.stringify({detector:run.detectors[0],verifier:run.verifiers[0]})).toBe(416);expect(run.results).toHaveLength(30);expect(run.detectors[1].capture.nativeErrors).toEqual([{operation:'prompt',error:'Error: TEST_ONLY native failure'}]);expect(run.detectors[0].capture.rawOutputs).toEqual(['TEST_ONLY malformed detection']);expect(run.detectors[0].status).toBe('error');expect(run.verifiers.every((r:any)=>r.status==='unknown')).toBe(true);expect(run.twoKeyDecisions).toEqual([]);expect(destroyed).toBeGreaterThanOrEqual(416);expect((globalThis as any).LanguageModel).toBe(fake);
 expect(fetch).not.toHaveBeenCalled();
 expect(nativeInputs[0].options.responseConstraint).toEqual(piiSchema);
 for(let i=0;i<32;i++){
  const prompt=nativeInputs[i].input[0].content[0].value;
  expect(JSON.parse(prompt.slice(prompt.indexOf(String.fromCharCode(10))+1))).toEqual(indexedOriginal(evalCorpus[i].text));
  expect(prompt).toContain('Do NOT return transcription');
  expect(prompt).not.toContain('"start":0,"end":1,"kind":"NAME"');
 }
 for(let i=0;i<128;i++){
  const trial=trials()[i],calls=run.verifiers[i].capture.nativeCalls.filter((c:any)=>c.operation==='prompt') as any[];
  expect(calls).toHaveLength(3);expect(run.verifiers[i].capture.rawOutputs).toHaveLength(3);
  expect(JSON.parse(run.verifiers[i].rawJson as string).checks.map((c:any)=>c.id)).toEqual(['c0','c1','c2']);
  for(let j=0;j<3;j++){
   const native=nativeInputs[32+i*3+j],call=calls[j];
   const prompt=native.input[0].content[0].value;
   const data=JSON.parse(prompt.slice(prompt.indexOf(String.fromCharCode(10))+1));
   expect(data).toEqual({source:indexedOriginal(trial.original),claims:[trial.claims[j]]});
   expect(native.options.responseConstraint).toEqual(verifierSchemaFor([trial.claims[j]]));
   expect(JSON.stringify(data)).not.toMatch(/"(truth|annotations|mutations|variant|trialId|expected|rejected)"/);
   expect(call.promptSha256).toMatch(/^[a-f0-9]{64}$/);expect(call.schemaSha256).toMatch(/^[a-f0-9]{64}$/);
   expect(call.input).toEqual(native.input);expect(call.schema).toEqual(native.options.responseConstraint);
  }
 }
 expect(run.coverage).toMatchObject({detectors:{planned:32,success:30,error:2},verifiers:{planned:128,unknown:128},mutations:{planned:96,unknown:96},controls:{planned:32,unknown:32},mutationsDecided:0,controlsDecided:0});
});
it('TEST_ONLY: late native create is destroyed after abort, no cross-trial output',async()=>{
 let resolve:any,destroyed=0;vi.stubGlobal('LanguageModel',{availability:async()=> 'available',create:()=>new Promise(r=>{resolve=r;})});
 const recorder=recordNativeProvider(),controller=new AbortController(),capture:Capture={nativeCalls:[],nativeErrors:[],rawOutputs:[]};recorder.begin(controller.signal,capture);
 const pending=(globalThis as any).LanguageModel.create({});controller.abort();recorder.end();resolve({destroy(){destroyed++;}});await expect(pending).rejects.toThrow('Late native');expect(destroyed).toBe(1);expect(capture.rawOutputs).toEqual([]);recorder.close();
});
it('TEST_ONLY: static handler refuses uploads, source paths and foreign Host; CSP blocks page egress',async()=>{
 expect(CSP).toContain("connect-src 'none'");expect(CSP).toContain("default-src 'none'");expect(CSP).toContain("form-action 'none'");
 const served=vi.fn(),ended=vi.fn();await staticHandler(process.cwd())({method:'GET',url:'/',headers:{host:'127.0.0.1:5192'},socket:{localPort:5192}},{writeHead:served,end:ended});expect(served.mock.calls[0][0]).toBe(200);expect(served.mock.calls[0][1]['Content-Security-Policy']).toBe(CSP);
 const handler=staticHandler();
 for(const req of [{method:'POST',url:'/',headers:{host:'127.0.0.1:5192'}},{method:'GET',url:'/src/nano.ts',headers:{host:'127.0.0.1:5192'}},{method:'GET',url:'/',headers:{host:'evil.invalid'}}]){
  const writeHead=vi.fn(),end=vi.fn();await handler({...req,socket:{localPort:5192}},{writeHead,end});expect(writeHead.mock.calls[0][0]).toBeGreaterThanOrEqual(400);
 }
});

it('TEST_ONLY: a missing batch ID fails closed without synthesizing checks or running later batches',async()=>{
 let prompts=0;
 vi.stubGlobal('LanguageModel',{availability:async()=> 'available',create:async()=>({destroy(){},prompt:async(_input:any,options:any)=>{
  prompts++;
  if(options.responseConstraint.properties.spans)return '{"spans":[]}';
  return '{"checks":[]}';
 }})});
 vi.stubGlobal('window',globalThis);vi.stubGlobal('document',{});vi.stubGlobal('isSecureContext',true);
 const recorder=recordNativeProvider(),nano=createNano({apiKey:'TEST_ONLY',projectId:'test-only',appId:'test-only'});
 const run=await hashCaptures(await collect(nano,recorder,TEST_ONLY));
 expect(prompts).toBe(160);expect(run.provenance).toBe('TEST_ONLY');expect(run.twoKeyDecisions).toEqual([]);
 expect(run.coverage.verifiers).toMatchObject({planned:128,error:128,accepted:0,rejected:0,unknown:0});
 for(const row of run.verifiers){
  expect(row.capture.rawOutputs).toEqual(['{"checks":[]}']);
  const calls=row.capture.nativeCalls.filter((c:any)=>c.operation==='prompt') as any[];
  expect(calls).toHaveLength(1);expect(calls[0].schema.properties.checks).toMatchObject({minItems:1,maxItems:1});
  expect(calls[0].schemaSha256).toMatch(/^[a-f0-9]{64}$/);
 }
});
