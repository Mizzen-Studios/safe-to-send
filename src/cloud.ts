import {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode,InferenceSource} from 'firebase/ai';
import {getToken,type AppCheck} from 'firebase/app-check';
import type {FirebaseApp} from 'firebase/app';
/** Deliberately compile-time false. No URL, localStorage, or config flag can enable this. */
export const CLOUD_RELEASE_ENABLED:boolean=false;
export const CLOUD_MODEL='gemini-3.5-flash-lite';
export function assertCloudRelease(){if(!CLOUD_RELEASE_ENABLED)throw Error('Cloud locked: parent privacy/App Check/free-tier/wire-ledger review required');}
/** Prepared adapter only. Never invoke on the raw-letter origin, even after release review.
 * A future separate-origin handoff must receive only the approved redacted payload.
 * App Check is supplied by that isolated runtime, never initialized with a debug token here.
 */
export async function requireAppCheck(app:FirebaseApp,appCheck:AppCheck):Promise<void>{
 if(!app||!appCheck||appCheck.app!==app)throw Error('App Check required for this app');
 const attestation=await getToken(appCheck,false);
 if(!attestation.token)throw Error('App Check token required');
}
export async function cloudTransport(app:FirebaseApp,appCheck:AppCheck,payload:string):Promise<string>{
 assertCloudRelease(); // Before token retrieval, SDK model creation, or any network operation.
 await requireAppCheck(app,appCheck);
 const input=JSON.parse(payload);
 if(typeof input.letter!=='string'||typeof input.instruction!=='string'||Object.keys(input).sort().join()!=='instruction,letter')throw Error('Invalid approved payload');
 const model=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{mode:InferenceMode.ONLY_IN_CLOUD,inCloudParams:{model:CLOUD_MODEL,generationConfig:{responseMimeType:'application/json'}}});
 const result=await model.generateContent([{type:'text',text:payload}]);
 if(result.response.inferenceSource!==InferenceSource.IN_CLOUD)throw Error('Unexpected inference source');
 return result.response.text();
}
