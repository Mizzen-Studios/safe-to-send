import {journeyResponseSchema} from './cloud-schema';
import {cloudInstruction} from './privacy';
import {CLOUD_MODEL} from './cloud-policy';
export const VERSION=1;
export function exact(x:unknown,keys:string[]):x is Record<string,unknown>{return !!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join()===keys.sort().join();}
export function approvedPayload(payload:unknown):asserts payload is string{
 if(typeof payload!=='string'||payload.length>64000)throw Error('Invalid approved payload');
 const x=JSON.parse(payload);
 if(!exact(x,['instruction','letter'])||x.instruction!==cloudInstruction||typeof x.letter!=='string'||!x.letter.trim()||x.letter.length>50000)throw Error('Invalid approved payload');
 if(JSON.stringify({instruction:x.instruction,letter:x.letter})!==payload)throw Error('Noncanonical approved payload');
}
export type Binding={version:1;nonce:string;requestId:string;revision:number};
export type HandoffRequest=Binding&{type:'generate';payload:string};
export type Wire={body:string;utf8Bytes:number;sha256:string;time:string;model:string};
export type HandoffReply=Binding&{type:'result';response:string|null;wire:Wire|null;error:'CLOUD_FAILED'|null};
export function binding(x:Record<string,unknown>):boolean{return x.version===VERSION&&typeof x.nonce==='string'&&/^[a-f0-9]{64}$/.test(x.nonce)&&typeof x.requestId==='string'&&/^[a-f0-9]{64}$/.test(x.requestId)&&Number.isSafeInteger(x.revision)&&(x.revision as number)>=0;}
export function request(x:unknown):x is HandoffRequest{try{if(!exact(x,['version','nonce','requestId','revision','type','payload'])||x.type!=='generate'||!binding(x))return false;approvedPayload(x.payload);return true;}catch{return false;}}
export function correlated(x:unknown,b:Binding):x is HandoffReply{
 return exact(x,['version','nonce','requestId','revision','type','response','wire','error'])&&x.type==='result'&&binding(x)&&x.nonce===b.nonce&&x.requestId===b.requestId&&x.revision===b.revision&&((x.error===null&&typeof x.response==='string'&&x.response.length<=50000)||(x.error==='CLOUD_FAILED'&&x.response===null));
}
export async function digest(body:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body))),x=>x.toString(16).padStart(2,'0')).join('');}
/** SDK shape drift must fail closed BEFORE dispatch. */
export function validateWireBody(body:unknown,payload:string):asserts body is string{
 if(typeof body!=='string'||body.length>100000)throw Error('Invalid SDK body');
 const x=JSON.parse(body);
 if(!exact(x,['contents','generationConfig','safetySettings'])||!Array.isArray(x.safetySettings)||x.safetySettings.length!==0||!Array.isArray(x.contents)||x.contents.length!==1)throw Error('Unexpected SDK body');
 const c=x.contents[0];
 if(!exact(c,['role','parts'])||c.role!=='user'||!Array.isArray(c.parts)||c.parts.length!==1||!exact(c.parts[0],['text'])||c.parts[0].text!==payload)throw Error('SDK payload mismatch');
 if(!exact(x.generationConfig,['responseMimeType','responseSchema'])||x.generationConfig.responseMimeType!=='application/json'||JSON.stringify(x.generationConfig.responseSchema)!==JSON.stringify(journeyResponseSchema))throw Error('Unexpected generation config');
}
export async function validateWire(w:unknown,payload:string):Promise<Wire>{
 if(!exact(w,['body','utf8Bytes','sha256','time','model'])||w.model!==CLOUD_MODEL||typeof w.time!=='string'||!Number.isFinite(Date.parse(w.time)))throw Error('Invalid wire ledger');
 validateWireBody(w.body,payload);
 if(w.utf8Bytes!==new TextEncoder().encode(w.body).length||w.sha256!==await digest(w.body))throw Error('Wire digest mismatch');
 return w as Wire;
}
export function trustedPeer(event:Pick<MessageEvent,'origin'|'source'>,origin:string,source:MessageEventSource|null){return source!==null&&event.source===source&&event.origin===origin;}
