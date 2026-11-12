import {journeyResponseSchema} from './cloud-schema';
import {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode,InferenceSource} from 'firebase/ai';
import {getToken,type AppCheck} from 'firebase/app-check';
import type {FirebaseApp} from 'firebase/app';
import {assertCloudRelease,CLOUD_MODEL} from './cloud-policy';
export {assertCloudRelease,CLOUD_MODEL,CLOUD_RELEASE_ENABLED} from './cloud-policy';
import {approvedPayload} from './handoff-protocol';
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
 approvedPayload(payload);
 await requireAppCheck(app,appCheck);
 const model=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{mode:InferenceMode.ONLY_IN_CLOUD,inCloudParams:{model:CLOUD_MODEL,generationConfig:{responseMimeType:'application/json',responseSchema:journeyResponseSchema}}});
 const result=await model.generateContent([{type:'text',text:payload}]);
 if(result.response.inferenceSource!==InferenceSource.IN_CLOUD)throw Error('Unexpected inference source');
 return result.response.text();
}
