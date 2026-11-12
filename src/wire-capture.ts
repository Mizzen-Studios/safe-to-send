import {CLOUD_MODEL} from './cloud-policy';
import {digest,validateWireBody,type Wire} from './handoff-protocol';
/** Temporary broker-only single-flight hook. Observes one allowlisted AI POST BODY.
 * Never reads headers/tokens or any unrelated App Check/recaptcha request. */
let busy=false;
export async function captureSDK<T>(projectId:string,payload:string,operation:()=>Promise<T>):Promise<{value?:T;wire:Wire|null;failed:boolean}>{
 if(busy)throw Error('Cloud busy');busy=true;
 const original=globalThis.fetch;
 const endpoint='https://firebasevertexai.googleapis.com/v1beta/projects/'+projectId+'/models/'+CLOUD_MODEL+':generateContent';
 let wire:Wire|null=null,attempted=false;
 const hook:typeof fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(new URL(url,location.href).origin!=='https://firebasevertexai.googleapis.com')return original(input,init);
  if(url!==endpoint||attempted||init?.method!=='POST')throw Error('Unexpected AI request');
  attempted=true;validateWireBody(init.body,payload);
  const body=init.body;
  wire={body,utf8Bytes:new TextEncoder().encode(body).length,sha256:await digest(body),time:new Date().toISOString(),model:CLOUD_MODEL};
  return original(input,init);
 };
 globalThis.fetch=hook;
 try{const value=await operation();return {value,wire,failed:!wire};}
 catch{return {wire,failed:true};}
 finally{if(globalThis.fetch===hook)globalThis.fetch=original;busy=false;}
}
