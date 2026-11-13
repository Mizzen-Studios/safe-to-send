import {evalCorpus,CORPUS_VERSION,type Claim as CorpusClaim} from '../../src/eval-corpus';
import {parseVerification,type Claim} from '../../src/hybrid';
export const ORDER_SEED=0x51a7e032;
export function claimsFor(c:CorpusClaim):Claim[]{return [
 {id:'c0',kind:'deadline',value:JSON.stringify({date:c.deadline,evidence:'',action:''})},
 {id:'c1',kind:c.amountPence===null?'explanation':'amount',value:c.amountPence===null?'No monetary amount is stated.':'£'+(c.amountPence/100).toFixed(2)},
 {id:'c2',kind:'action',value:c.action}
];}
export function trials(){
 const rows=evalCorpus.flatMap(l=>[{id:l.id,variant:'control',original:l.text,claims:claimsFor(l.claim)},...l.mutations.map(m=>({id:l.id,variant:m.field,original:l.text,claims:claimsFor(m.claim)}))]);
 let seed=ORDER_SEED;
 for(let i=rows.length-1;i>0;i--){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const j=(seed>>>0)%(i+1);[rows[i],rows[j]]=[rows[j],rows[i]];}
 return rows.map((r,i)=>({...r,trialId:'trial-'+String(i).padStart(3,'0')}));
}
export function decision(raw:string,original:string,claims:Claim[]){
 const parsed=parseVerification(raw,original,claims);
 // Three submitted fields, NOT a complete journey. Product aggregate correctly
 // marks explanation/draft coverage incomplete, so score submitted checks only.
 if(parsed.checks.some(c=>c.status==='unknown'))return {status:'unknown' as const,checks:parsed.checks};
 return {status:parsed.checks.some(c=>c.status==='mismatch'||c.status==='unsupported')?'rejected' as const:'accepted' as const,checks:parsed.checks};
}
export type Capture={rawOutputs:string[];nativeCalls:unknown[];nativeErrors:unknown[]};
export type Attempt={status:string;startedAt:string;latencyMs:number;error?:string;capture:Capture;value?:any;[key:string]:unknown};
export type Adapter={initialize:(progress:(n:number)=>void)=>Promise<void>;detect:(text:string)=>Promise<{text:string;spans:unknown[];rawJson:string;latencyMs:number}>;verify:(text:string,claims:Claim[])=>Promise<string>};
export type Lifecycle={begin:(signal:AbortSignal,capture:Capture)=>void;end:()=>void;close:()=>void};
export async function collect(adapter:Adapter,lifecycle:Lifecycle,options:{provenance:'REAL_ON_DEVICE'|'TEST_ONLY';browser:string;os:string;model:string;initializationTimeoutMs?:number;callTimeoutMs?:number;signal?:AbortSignal;onProgress?:(done:number)=>void}){
 const initTimeout=options.initializationTimeoutMs??900000,callTimeout=options.callTimeoutMs??60000;
 if(![initTimeout,callTimeout].every(n=>Number.isFinite(n)&&n>=1&&n<=1800000))throw Error('Invalid timeout');
 let halted=false;
 async function attempt(fn:()=>Promise<unknown>,timeout:number):Promise<Attempt>{
  const capture:Capture={rawOutputs:[],nativeCalls:[],nativeErrors:[]};
  const startedAt=new Date().toISOString(),start=performance.now();
  if(halted||options.signal?.aborted)return {status:'not_run',startedAt,latencyMs:0,capture};
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  let abortListener:()=>void=()=>{};
  try{
   lifecycle.begin(controller.signal,capture);
   const stop=new Promise<never>((_,reject)=>{
    const halt=(status:string)=>{halted=true;controller.abort();reject(Object.assign(Error(status),{evalStatus:status}));};
    abortListener=()=>halt('aborted');options.signal?.addEventListener('abort',abortListener,{once:true});
    timer=setTimeout(()=>halt('timeout'),timeout);
   });
   const value=await Promise.race([Promise.resolve().then(fn),stop]);
   return {status:'success',startedAt,latencyMs:performance.now()-start,capture,value};
  }catch(error){return {status:(error as any)?.evalStatus??'error',startedAt,latencyMs:performance.now()-start,capture,error:String(error)};}
  finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abortListener);controller.abort();lifecycle.end();}
 }
 const recordedAt=new Date().toISOString();
 const detectors:Attempt[]=[],verifiers:Attempt[]=[],results:any[]=[],twoKeyDecisions:any[]=[];
 let initialization:Attempt;
 try{
  initialization=await attempt(()=>adapter.initialize(()=>{}),initTimeout);
  if(initialization.status!=='success')halted=true;
  for(const letter of evalCorpus){
   const row=await attempt(()=>adapter.detect(letter.text),callTimeout);row.id=letter.id;
   if(row.status==='success'){const d=row.value;results.push({id:letter.id,transcription:d.text,spans:d.spans,latencyMs:row.latencyMs});row.rawJson=d.rawJson;delete row.value;}
   detectors.push(row);options.onProgress?.(detectors.length);
  }
  for(const trial of trials()){
   const row=await attempt(async()=>{const raw=await adapter.verify(trial.original,trial.claims);return {raw,decision:decision(raw,trial.original,trial.claims)};},callTimeout);
   Object.assign(row,{trialId:trial.trialId,id:trial.id,variant:trial.variant});
   if(row.status==='success'){
    const d=row.value.decision;row.rawJson=row.value.raw;row.checks=d.checks;row.status=d.status;
    if(d.status!=='unknown')twoKeyDecisions.push({id:trial.id,variant:trial.variant,rejected:d.status==='rejected',latencyMs:row.latencyMs});
    delete row.value;
   }
   verifiers.push(row);options.onProgress?.(32+verifiers.length);
  }
 }finally{lifecycle.close();}
 const statuses=['success','accepted','rejected','unknown','error','timeout','aborted','not_run'] as const;
 const counts=(rows:Attempt[])=>Object.fromEntries(statuses.map(s=>[s,rows.filter(r=>r.status===s).length])) as Record<typeof statuses[number],number>;
 return {corpusVersion:CORPUS_VERSION,provenance:options.provenance,browser:options.browser,os:options.os,model:options.model,recordedAt,initializationMs:initialization!.latencyMs,initialization:initialization!,order:{algorithm:'xorshift32 Fisher-Yates v1',seed:ORDER_SEED},results,twoKeyDecisions,detectors,verifiers,coverage:{detectors:{planned:32,...counts(detectors)},verifiers:{planned:128,...counts(verifiers)},mutations:{planned:96,...counts(verifiers.filter(r=>r.variant!=='control'))},controls:{planned:32,...counts(verifiers.filter(r=>r.variant==='control'))},mutationsDecided:twoKeyDecisions.filter(d=>d.variant!=='control').length,controlsDecided:twoKeyDecisions.filter(d=>d.variant==='control').length},limits:'Three-field authored synthetic text experiment, not complete product two-key journey, image/OCR, real-letter generalization, or independent device attestation.'};
}
