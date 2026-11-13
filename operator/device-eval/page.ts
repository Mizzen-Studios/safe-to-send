import {createNano,piiSchema,localVerifierSchema} from '../../src/nano';
import {evalCorpus} from '../../src/eval-corpus';
import {collect} from './core';
import {recordNativeProvider,sha,hashCaptures} from './native';
declare const __EVAL_SOURCE__:unknown;
const start=document.querySelector<HTMLButtonElement>('#start')!,stop=document.querySelector<HTMLButtonElement>('#stop')!,download=document.querySelector<HTMLButtonElement>('#download')!,status=document.querySelector<HTMLElement>('#status')!;
let controller:AbortController|undefined,output:string|undefined;
stop.onclick=()=>controller?.abort();
window.addEventListener('pagehide',()=>controller?.abort());
start.onclick=async()=>{
 start.disabled=true;stop.disabled=false;controller=new AbortController();
 let lifecycle:ReturnType<typeof recordNativeProvider>|undefined;const startedAt=new Date().toISOString(),before=performance.now();
 try{
  lifecycle=recordNativeProvider();
  // Deliberately dummy public identifiers, not app config/credentials. ONLY_ON_DEVICE
  // needs a Firebase app object but performs no Firebase HTTP operation.
  const nano=createNano({apiKey:'operator-only-no-cloud-key',projectId:'operator-only-local',appId:'1:000000000000:web:operatorlocal'});
  const run=await collect(nano,lifecycle,{provenance:'REAL_ON_DEVICE',browser:navigator.userAgent,os:navigator.platform,model:'Browser-managed Gemini Nano; version not exposed/attested by SDK',signal:controller.signal,onProgress:n=>{status.textContent='Collecting locally: '+n+'/160 planned rows';}});
  const receipt={...await hashCaptures(run),provenance:run.results.length||run.verifiers.some(r=>['accepted','rejected','unknown'].includes(r.status))?'REAL_ON_DEVICE':'NOT_RUN',source:__EVAL_SOURCE__,hashes:{corpusSha256:await sha(evalCorpus),piiSchemaSha256:await sha(piiSchema),verifierSchemaSha256:await sha(localVerifierSchema)},timingMethod:'performance.now wall milliseconds per production-adapter operation; includes SDK availability/session init and validation; initialization separate; native subcall timings also retained',attestation:'Operator collection, not independently attested. Browser native API was not mocked by this page.',networkPolicy:'Page connect-src none; browser-managed model downloads outside page CSP permitted'};
  output=JSON.stringify(receipt,null,2);download.disabled=false;
  status.textContent=JSON.stringify({initialization:run.initialization.status,coverage:run.coverage,modelMetrics:run.results.length?'See successful-subset import plus coverage; not full-corpus proof':'NOT_RUN'},null,2);
 }catch(e){
  const blocker={provenance:'NOT_RUN',recordedAt:startedAt,source:__EVAL_SOURCE__,browser:navigator.userAgent,os:navigator.platform,initialization:{status:'error',error:String(e),latencyMs:performance.now()-before},results:[],twoKeyDecisions:[],coverage:{detectors:{planned:32,not_run:32},verifiers:{planned:128,not_run:128}},modelMetrics:'NOT_RUN'};
  output=JSON.stringify(blocker,null,2);download.disabled=false;status.textContent='NOT_RUN / collector blocker: '+String(e);
 }
 finally{lifecycle?.close();stop.disabled=true;}
};
download.onclick=()=>{if(!output)return;const url=URL.createObjectURL(new Blob([output],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='safe-to-send-operator-device-eval.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
