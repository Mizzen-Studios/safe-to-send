import {initializeApp,type FirebaseOptions} from 'firebase/app';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';
import {cloudTransport,requireAppCheck} from './cloud';
import {assertCloudRelease,BROKER_ORIGIN,RAW_ORIGIN} from './cloud-policy';
import {brokerHandler} from './broker-handler';
import {captureSDK} from './wire-capture';
import {exact} from './handoff-protocol';
declare const __BROKER_CONFIG__:unknown;
type Config={firebase:FirebaseOptions;recaptchaEnterpriseSiteKey:string};
function config():Config{
 const c=__BROKER_CONFIG__;
 if(!exact(c,['firebase','recaptchaEnterpriseSiteKey'])||typeof c.recaptchaEnterpriseSiteKey!=='string'||!/^6L[\w-]{20,100}$/.test(c.recaptchaEnterpriseSiteKey))throw Error('Broker config missing');
 const f=c.firebase;
 if(!exact(f,['apiKey','projectId','appId'])||f.projectId!=='safe-to-send-2026'||f.appId!=='1:794092402064:web:4e263548738bdb75a8af15'||typeof f.apiKey!=='string'||!/^AIza[\w-]{30,50}$/.test(f.apiKey))throw Error('Broker app config invalid');
 return c as Config;
}
// No top-level App Check, SDK model, script or network initialization.
if(location.origin===BROKER_ORIGIN&&location.search===''&&location.hash===''&&window.parent!==window){
 window.addEventListener('message',brokerHandler(window.parent,async r=>{
  assertCloudRelease();
  const c=config();
  const app=initializeApp(c.firebase,'safe-to-send-isolated-cloud');
  // MUST precede getAI and model creation. Never configure or log a debug token.
  const check=initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(c.recaptchaEnterpriseSiteKey),isTokenAutoRefreshEnabled:false});
  await requireAppCheck(app,check);
  const result=await captureSDK(c.firebase.projectId!,r.payload,()=>cloudTransport(app,check,r.payload));
  return {response:result.failed?null:result.value!,wire:result.wire,error:result.failed?'CLOUD_FAILED':null};
 },reply=>window.parent.postMessage(reply,RAW_ORIGIN)));
}
