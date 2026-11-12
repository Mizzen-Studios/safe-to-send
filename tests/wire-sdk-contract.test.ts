import {journeyResponseSchema} from '../src/cloud-schema';
// REAL SDK serialization, MOCKED NETWORK/provider response. NOT inference or DevTools proof.
import {it,expect,vi,afterEach} from 'vitest';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode} from 'firebase/ai';
import {captureSDK} from '../src/wire-capture';
import {cloudInstruction} from '../src/privacy';
import {CLOUD_MODEL} from '../src/cloud-policy';
afterEach(()=>vi.unstubAllGlobals());
it('captures actual pinned Firebase SDK serialized request bytes (MOCK NETWORK, no AI)',async()=>{
 vi.stubGlobal('location',{href:'https://safe-to-send-cloud-2026.web.app/'});
 let sent='';vi.stubGlobal('fetch',vi.fn(async(_url,init)=>{sent=init.body;return new Response(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:'{"mock":true}'}]},finishReason:'STOP'}]}),{status:200,headers:{'Content-Type':'application/json'}});}));
 const app=initializeApp({apiKey:'synthetic-not-a-key',projectId:'safe-to-send-2026',appId:'synthetic-app'},'wire-contract');
 try{
 const model=getGenerativeModel(getAI(app,{backend:new GoogleAIBackend()}),{mode:InferenceMode.ONLY_IN_CLOUD,inCloudParams:{model:CLOUD_MODEL,generationConfig:{responseMimeType:'application/json',responseSchema:journeyResponseSchema}}});
 const payload=JSON.stringify({instruction:cloudInstruction,letter:'[NAME_1] owes £10'});
 const r=await captureSDK('safe-to-send-2026',payload,()=>model.generateContent([{type:'text',text:payload}]));
 expect(r.failed).toBe(false);expect(sent).not.toBe('');expect(r.wire?.body).toBe(sent);expect(r.wire?.utf8Bytes).toBe(new TextEncoder().encode(sent).length);expect(JSON.parse(sent).contents[0].parts[0].text).toBe(payload);
 }finally{await deleteApp(app);}
});
