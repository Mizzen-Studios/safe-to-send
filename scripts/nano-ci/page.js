import {initializeApp} from 'firebase/app';
import {getAI,getGenerativeModel,GoogleAIBackend,InferenceMode,InferenceSource} from 'firebase/ai';
const events=[];window.probe={events,stages:{},ready:false};
function log(type,data){const entry={at:new Date().toISOString(),type,data};events.push(entry);document.querySelector('#log').textContent+=JSON.stringify(entry)+'\n';console.log(JSON.stringify(entry));}
const options={expectedInputs:[{type:'text',languages:['en']},{type:'image'}],expectedOutputs:[{type:'text',languages:['en']}]};
const schema={type:'object',additionalProperties:false,properties:{code:{type:'string'}},required:['code']};
const canvas=document.querySelector('canvas');const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,700,180);ctx.fillStyle='black';ctx.font='36px sans-serif';ctx.fillText('SYNTHETIC TEST LETTER',24,64);ctx.fillText('Code: BLUE-472',24,125);
const image=canvas.toDataURL('image/png');const prompt='Read the code in the provided synthetic image. Return JSON with exactly one property code containing the code. No personal data is present.';
function validate(raw){const parsed=JSON.parse(raw);if(Object.keys(parsed).length!==1||parsed.code!=='BLUE-472')throw Error('Schema/fixture mismatch: '+raw);return parsed;}
function monitor(m){m.addEventListener('downloadprogress',e=>log('downloadprogress',{loaded:e.loaded,total:e.total}));}
async function run(name,fn){window.probe.stages[name]={status:'RUNNING'};try{const start=performance.now();const result=await fn();window.probe.stages[name]={status:'PASS',durationMs:performance.now()-start,result};log(name,window.probe.stages[name]);}catch(e){window.probe.stages[name]={status:'FAIL',name:e.name,error:e.message};log(name,window.probe.stages[name]);}}
document.querySelector('#direct').onclick=()=>run('direct',async()=>{
 if(typeof globalThis.LanguageModel?.create!=='function')throw Error('LanguageModel missing; no substitute');
 // create() is invoked in the real user-click handler, before any await.
 const pending=LanguageModel.create({...options,monitor});
 const session=await pending;try{const bitmap=await createImageBitmap(await (await fetch(image)).blob());const raw=await session.prompt([{role:'user',content:[{type:'text',value:prompt},{type:'image',value:bitmap}]}],{responseConstraint:schema});return {raw,validated:validate(raw)};}finally{session.destroy();}
});
document.querySelector('#sdk').onclick=()=>run('sdk',async()=>{
 if(typeof globalThis.LanguageModel?.create!=='function')throw Error('LanguageModel missing; SDK not initialized');
 // SDK 13.2 checks these strings even for ONLY_ON_DEVICE. These are invalid,
 // non-secret placeholders, NOT a Firebase project or usable credentials.
 // No inCloudParams, no App Check, and CSP denies HTTP egress.
 const ai=getAI(initializeApp({apiKey:'INVALID_LOCAL_ONLY_NOT_A_KEY',projectId:'invalid-local-only',appId:'invalid-local-only'},'nano-ci-device'),{backend:new GoogleAIBackend()});
 const model=getGenerativeModel(ai,{mode:InferenceMode.ONLY_ON_DEVICE,onDeviceParams:{createOptions:options,promptOptions:{responseConstraint:schema}}});
 const pending=model.initializeDeviceModel(progress=>log('sdk-downloadprogress',{progress}));await pending;
 const result=await model.generateContent([{type:'text',text:prompt},{type:'inlineData',inlineData:{mimeType:'image/png',data:image.split(',')[1]}}]);
 if(result.response.inferenceSource!==InferenceSource.ON_DEVICE)throw Error('Non-device inference refused');
 const raw=result.response.text();return {inferenceSource:result.response.inferenceSource,raw,validated:validate(raw)};
});
log('browser',{userAgent:navigator.userAgent,secureContext:isSecureContext,languageModel:typeof globalThis.LanguageModel});
if(globalThis.LanguageModel){for(const [name,input] of [['text',{expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:options.expectedOutputs}],['image',options]]){try{log('availability-'+name,await LanguageModel.availability(input));}catch(e){log('availability-'+name,{error:e.message});}}}
window.probe.ready=true;
