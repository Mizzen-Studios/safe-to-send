import {restore, type PrivacyGate} from './privacy';
import {replyEnvelope,validateDraftRoles,localizeReplyEnvelope} from './roles';
import {CloudHandoff,validateAcceptedHandoff,acceptedHandoffReceipt} from './handoff-client';
import {CLOUD_MODEL} from './cloud-policy';
const cloudReviewed=new WeakMap<PrivacyGate,{handoff:CloudHandoff;payload:string;revision:number;response:string}>();
const reviewed=new WeakMap<PrivacyGate,{revision:number;redacted:Journey;restored:Journey}>();
export function reviewedJourney(gate:PrivacyGate){const x=reviewed.get(gate);if(!x||x.revision!==gate.currentRevision||gate.phase!=='done')throw Error('Current approved cloud response required');return {revision:x.revision,redacted:parseJourney(JSON.stringify(x.redacted)),restored:parseJourney(JSON.stringify(x.restored))};}
/** Unlike generic runJourney, this requires a successful production peer + wire handoff. */
export async function runCloudJourney(gate:PrivacyGate,handoff:CloudHandoff):Promise<Journey>{
 const revision=gate.currentRevision,payload=gate.applicationPreview,previous=acceptedHandoffReceipt(handoff);
 let acceptedResponse='';
 const result=await runJourney(gate,async sent=>{
  const response=await handoff.send(sent,revision,()=>gate.currentRevision);
  if(acceptedHandoffReceipt(handoff)===previous||!validateAcceptedHandoff(handoff,sent,revision,response))throw Error('Validated cloud handoff required');
  acceptedResponse=response;const parsed=parseJourney(response);parsed.draft=localizeReplyEnvelope(parsed.draft,JSON.parse(sent).letter);return JSON.stringify(parsed);
 },CLOUD_MODEL);
 if(gate.currentRevision!==revision||gate.phase!=='done'||!validateAcceptedHandoff(handoff,payload,revision,acceptedResponse))throw Error('Current validated cloud handoff required');
 cloudReviewed.set(gate,{handoff,payload,revision,response:acceptedResponse});
 return result;
}
export function reviewedCloudJourney(gate:PrivacyGate){
 const a=cloudReviewed.get(gate);
 if(!a||a.revision!==gate.currentRevision||!validateAcceptedHandoff(a.handoff,a.payload,a.revision,a.response))throw Error('Current approved cloud response required');
 return reviewedJourney(gate);
}
export type Journey={explanation:string;deadlines:{date:string|null;evidence:string;action:string}[];actions:string[];draft:string};
const keys=(x:unknown,allowed:string[]):Record<string,unknown>=>{
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join()!==[...allowed].sort().join())throw Error('Unexpected response shape');
 return x as Record<string,unknown>;
};
const text=(x:unknown):string=>{if(typeof x!=='string'||!x.trim()||x.length>12000)throw Error('Invalid response text');return x;};
export function parseJourney(json:string):Journey{
 if(json.length>50000)throw Error('Response too large');
 const x=keys(JSON.parse(json),['explanation','deadlines','actions','draft']);
 if(!Array.isArray(x.deadlines)||x.deadlines.length>20||!Array.isArray(x.actions)||!x.actions.length||x.actions.length>20)throw Error('Invalid response lists');
 return {explanation:text(x.explanation),draft:text(x.draft),actions:x.actions.map(text),deadlines:x.deadlines.map(d=>{
 const v=keys(d,['date','evidence','action']);
 if(v.date!==null&&(typeof v.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||!Number.isFinite(Date.parse(v.date))||new Date(v.date).toISOString().slice(0,10)!==v.date))throw Error('Invalid deadline date');
 return {date:v.date as string|null,evidence:text(v.evidence),action:text(v.action)};
 })};
}
/** Validate structure before restoration, then restore strings, not serialized JSON. */
export function restoreJourney(json:string,mapping:Record<string,string>):Journey{
 const j=parseJourney(json),r=(s:string)=>restore(s,mapping);
 return {explanation:r(j.explanation),draft:r(j.draft),actions:j.actions.map(r),deadlines:j.deadlines.map(d=>({...d,evidence:r(d.evidence),action:r(d.action)}))};
}
export async function runJourney(gate:PrivacyGate,transport:(payload:string)=>Promise<string>,model:string):Promise<Journey>{
 cloudReviewed.delete(gate);
 // send validates and restores only after revision-bound response acceptance.
 const approvedLetter=JSON.parse(gate.applicationPreview).letter as string;
 const revision=gate.currentRevision;
 let redacted:Journey|undefined;
 const restored=await gate.sendStructured(transport,model,(json,mapping)=>{
 const parsed=parseJourney(json);
 for(const deadline of parsed.deadlines)if(!approvedLetter.includes(deadline.evidence))throw Error('Deadline evidence absent from approved letter');
 validateDraftRoles(parsed.draft,approvedLetter);
 redacted=parsed;
 return restoreJourney(json,mapping);
 });
 reviewed.set(gate,{revision,redacted:redacted!,restored});
 return restored;
}
/** Deterministic synthetic demonstration, not model inference and never a network call. */
export async function syntheticTransport(payload:string):Promise<string>{
 const letter=JSON.parse(payload).letter as string;
 const envelope=replyEnvelope(letter);
 const cases=[
 {match:'Your tax return needs a correction.',explanation:'The sender asks you to correct your tax return.',evidence:'Please reply by 30 November 2026.',date:'2026-11-30',action:'Check which correction is needed and respond.',draft:'Please tell me which part of my tax return needs correcting and what evidence you require.'},
 {match:'We need evidence of your housing costs within 14 days.',explanation:'The sender asks for evidence of housing costs within 14 days. The letter has no dated reference for calculating a due date.',evidence:'within 14 days',date:null,action:'Check the dated original or confirm the due date with the sender.',draft:'Please confirm which housing cost documents you need and the exact deadline.'},
 {match:'Your appointment is 21 November 2026.',explanation:'The letter gives an appointment date and asks you to call if you cannot attend.',evidence:'Your appointment is 21 November 2026.',date:'2026-11-21',action:'Check the appointment time and whether you can attend.',draft:'Please confirm the time and location of my appointment.'},
 {match:'Your council tax payment is overdue.',explanation:'The sender says council tax is overdue and asks you to discuss a payment plan.',evidence:'Please contact us before 25/11/2026',date:'2026-11-25',action:'Contact the council before this date. This is a before-date, not an inclusive due date.',draft:'I would like to discuss a payment plan. Please confirm my balance and the available options.'},
 {match:'Please pay the outstanding rent',explanation:'The sender requests outstanding rent. No payment deadline is stated in this synthetic letter.',evidence:'',date:null,action:'Check the claimed balance and payment details independently before paying.',draft:'Please provide a breakdown of the outstanding rent and confirm the due date.'}
 ];
 const scenario=cases.find(x=>letter.includes(x.match));
 if(!scenario)throw Error('Synthetic template only supports the unchanged supplied fixtures');
 return JSON.stringify({explanation:'LOCAL SYNTHETIC TEMPLATE — not AI inference. '+scenario.explanation,deadlines:scenario.evidence?[{date:scenario.date,evidence:scenario.evidence,action:scenario.action}]:[],actions:[scenario.action,'Verify the sender using independently trusted contact details.'],draft:envelope.salutation+'\n'+scenario.draft+'\nKind regards,\n'+envelope.signature});
}
