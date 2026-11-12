import {BROKER_ORIGIN,assertCloudRelease} from './cloud-policy';
import {approvedPayload,correlated,trustedPeer,validateWire,VERSION,type Binding,type Wire} from './handoff-protocol';
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
export class CloudHandoff{
 private cancelActive:(()=>void)|undefined;
 readonly ledger:Wire[]=[];
 cancel(){this.cancelActive?.();}
 async send(payload:string,revision:number,currentRevision:()=>number):Promise<string>{
  assertCloudRelease();approvedPayload(payload);if(this.cancelActive)throw Error('Cloud busy');
  const b:Binding={version:VERSION,nonce:random(),requestId:random(),revision};
  const frame=document.createElement('iframe');frame.hidden=true;frame.title='Isolated approved-redacted cloud broker';frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.src=BROKER_ORIGIN+'/';
  return new Promise((resolve,reject)=>{
   let settled=false,processing=false,sent=false;
   const finish=(error?:Error,response?:string)=>{if(settled)return;settled=true;clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();this.cancelActive=undefined;error?reject(error):resolve(response!);};
   const receive=async(e:MessageEvent)=>{
    if(settled||processing||!trustedPeer(e,BROKER_ORIGIN,frame.contentWindow)||!correlated(e.data,b))return;
    processing=true;
    try{
     if(currentRevision()!==revision)throw Error('Stale cloud reply');
     const reply=e.data;
     const wire=reply.wire?await validateWire(reply.wire,payload):null;
     if(settled)return;
     if(currentRevision()!==revision)throw Error('Stale cloud reply');
     if(wire)this.ledger.push(wire);
     if(reply.error||!wire||reply.response===null)throw Error('Cloud generation refused or failed');
     finish(undefined,reply.response);
    }catch{finish(Error('Cloud response or wire ledger refused'));}
   };
   const timer=setTimeout(()=>finish(Error('Cloud handoff timed out')),120000);
   this.cancelActive=()=>finish(Error('Cloud review invalidated'));
   window.addEventListener('message',receive);
   frame.onload=()=>{if(sent){finish(Error('Unexpected broker reload'));return;}if(!settled&&currentRevision()===revision){sent=true;frame.contentWindow?.postMessage({...b,type:'generate',payload},BROKER_ORIGIN);}else finish(Error('Stale cloud approval'));};
   frame.onerror=()=>finish(Error('Cloud broker unavailable'));
   document.body.append(frame);
  });
 }
}
