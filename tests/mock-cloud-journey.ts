// Synthetic DOM/window protocol peer only. No browser, Firebase SDK or real inference.
import {vi} from 'vitest';
import {CloudHandoff} from '../src/handoff-client';
import {runCloudJourney,type Journey} from '../src/journey';
import type {PrivacyGate} from '../src/privacy';
import {BROKER_ORIGIN,CLOUD_MODEL} from '../src/cloud-policy';
import {digest} from '../src/handoff-protocol';
import {journeyResponseSchema} from '../src/cloud-schema';
export async function mockAcceptedCloudJourney(gate:PrivacyGate,journey:Journey){
 const target=new EventTarget();let frame:any;
 vi.stubGlobal('window',target);
 vi.stubGlobal('document',{createElement:()=>({setAttribute:vi.fn(),contentWindow:{postMessage:vi.fn()},remove:vi.fn()}),body:{append:(f:unknown)=>{frame=f;}}});
 const handoff=new CloudHandoff();
 const pending=runCloudJourney(gate,handoff);
 frame.onload();
 const {payload,...binding}=frame.contentWindow.postMessage.mock.calls[0][0];
 const body=JSON.stringify({contents:[{role:'user',parts:[{text:payload}]}],generationConfig:{responseMimeType:'application/json',responseSchema:journeyResponseSchema},safetySettings:[]});
 const wire={body,utf8Bytes:new TextEncoder().encode(body).length,sha256:await digest(body),time:new Date().toISOString(),model:CLOUD_MODEL};
 target.dispatchEvent(Object.assign(new Event('message'),{origin:BROKER_ORIGIN,source:frame.contentWindow,data:{...binding,type:'result',response:JSON.stringify(journey),wire,error:null}}));
 const result=await pending;return {handoff,result};
}
