import {request,trustedPeer,type HandoffRequest,type HandoffReply} from './handoff-protocol';
import {RAW_ORIGIN} from './cloud-policy';
/** One request per iframe lifetime, consumed before async work. Reload creates a new
 * WindowProxy session/nonce. Foreign windows and malformed messages never run AI. */
export function brokerHandler(parentWindow:MessageEventSource,generate:(r:HandoffRequest)=>Promise<Pick<HandoffReply,'response'|'wire'|'error'>>,send:(r:HandoffReply)=>void){
 let consumed=false;
 return async(e:MessageEvent)=>{
  if(consumed||!trustedPeer(e,RAW_ORIGIN,parentWindow)||!request(e.data))return;
  consumed=true;
  const r=e.data;const b={version:r.version,nonce:r.nonce,requestId:r.requestId,revision:r.revision,type:'result' as const};
  try{send({...b,...await generate(r)});}catch{send({...b,response:null,wire:null,error:'CLOUD_FAILED'});}
 };
}
