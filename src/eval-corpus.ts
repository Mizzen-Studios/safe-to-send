import type {Span} from './privacy';
import {regexSpans} from './regex';
/** Evaluation only: NEVER silently extend the five UI/send-allowlist fixtures. */
export const CORPUS_VERSION='synthetic-v1';
export type Claim={deadline:string|null;amountPence:number|null;action:string};
export type EvalLetter={id:string;source:string;locale:string;text:string;truth:Span[];claim:Claim;mutations:{field:keyof Claim;claim:Claim}[]};
// Markup is annotation, removed before scoring. All offsets are UTF-16 [start,end).
function annotated(input:string):{text:string;truth:Span[]}{
 let text='',cursor=0;const truth:Span[]=[];
 for(const m of input.matchAll(/⟦([A-Z_]+)\|([^⟧]+)⟧/g)){
 text+=input.slice(cursor,m.index);const start=text.length;text+=m[2];truth.push({start,end:text.length,kind:m[1]});cursor=m.index!+m[0].length;
 }text+=input.slice(cursor);return {text,truth};
}
const cases:[string,string,string,string,Claim][]=[
 ['hmrc-01','HMRC','en-GB','Dear ⟦NAME|Robin Fiction⟧,\n⟦ADDRESS|1 Imaginary Lane⟧, ⟦POSTCODE|ZZ1 1ZZ⟧. UTR ⟦REFERENCE|0000000000⟧. Correct your return by 30 November 2026. Balance £24.50.',{deadline:'2026-11-30',amountPence:2450,action:'Correct your return'}],
 ['hmrc-02','HMRC','en-GB','To: ⟦NAME|Alex Invented⟧; NI: ⟦NI|QQ 00 00 00 C⟧. Send evidence within 14 days. No issue date is provided.',{deadline:null,amountPence:null,action:'Send evidence'}],
 ['hmrc-03','HMRC','en-GB','Hello ⟦NAME|Sam Synthetic⟧. REF: ⟦REFERENCE|HMRC-DEMO003⟧. Contact ⟦EMAIL|sam+tax@example.invalid⟧. Please call before 25/11/2026. £0.00 is due.',{deadline:'2026-11-25',amountPence:0,action:'Call before the stated date'}],
 ['hmrc-04','HMRC','en-GB','Recipient ⟦NAME|Taylor Imaginary⟧\nDOB ⟦DATE|04.05.1980⟧\nPlease check your statement. Illustration: 12-34-56 is a form example, not a bank instruction.',{deadline:null,amountPence:null,action:'Check your statement'}],
 ['hmrc-05','HMRC','en-GB','⟦NAME|Casey Fable⟧ — ⟦ADDRESS|Flat 2, 8 Fiction Terrace⟧. Repayment £1,234.56. Confirm receipt by 2026-12-02.',{deadline:'2026-12-02',amountPence:123456,action:'Confirm receipt'}],
 ['hmrc-06','HMRC','en-GB','For ⟦NAME|Jamie Makebelieve⟧: reference ⟦REFERENCE|DEMO/HMRC/06⟧. Do not pay now; wait for the corrected notice. Policy version 20261112 is public metadata.',{deadline:null,amountPence:null,action:'Wait for the corrected notice'}],
 ['dwp-01','DWP','en-GB','Dear ⟦NAME|Morgan Fiction⟧, NI ⟦NI|QQ000000A⟧. Upload housing evidence by 01/12/2026. Your award is £85.20.',{deadline:'2026-12-01',amountPence:8520,action:'Upload housing evidence'}],
 ['dwp-02','DWP','en-GB','⟦NAME|Avery Invented⟧\n⟦ADDRESS|3 Pretend Walk⟧\n⟦POSTCODE|ZZ2 2ZZ⟧\nReference ⟦REFERENCE|DWP-SYN002⟧. Attend the interview on 2 December 2026.',{deadline:'2026-12-02',amountPence:null,action:'Attend the interview'}],
 ['dwp-03','DWP','en-GB','Contact ⟦EMAIL|benefit.test@example.invalid⟧ for ⟦NAME|Jordan Fable⟧. Ask for a review within one month of receiving this undated letter.',{deadline:null,amountPence:null,action:'Ask for a review'}],
 ['dwp-04','DWP','en-GB','Dear ⟦NAME|Riley Imaginary⟧. DOB: ⟦DATE|1980-05-04⟧. Call ⟦PHONE|07700 900123⟧ by 4/12/2026; outstanding amount £9.99.',{deadline:'2026-12-04',amountPence:999,action:'Call to discuss the outstanding amount'}],
 ['dwp-05','DWP','en-GB','For ⟦NAME|Quinn Synthetic⟧; account ⟦REFERENCE|DWP:DEMO005⟧. No action is required. Guide ID 1234567890 identifies a public publication, not a person.',{deadline:null,amountPence:null,action:'No action required'}],
 ['dwp-06','DWP','en-GB','⟦NAME|Drew Fiction⟧: repayment £100.00. Please request a breakdown, not payment, before 06-12-2026. Reply address ⟦EMAIL|drew@example.invalid⟧.',{deadline:'2026-12-06',amountPence:10000,action:'Request a breakdown before the stated date'}],
 ['nhs-01','NHS','en-GB','Dear ⟦NAME|Harper Invented⟧. NHS number ⟦NHS|000 000 0000⟧. Attend your appointment on 7 December 2026. Fee £0.',{deadline:'2026-12-07',amountPence:0,action:'Attend your appointment'}],
 ['nhs-02','NHS','en-GB','Patient: ⟦NAME|Finley Fable⟧; DOB ⟦DATE|09/08/1970⟧. Phone ⟦PHONE|+44 7700 900456⟧. Book a follow-up within 7 days; issue date absent.',{deadline:null,amountPence:null,action:'Book a follow-up'}],
 ['nhs-03','NHS','en-GB','To ⟦NAME|Rowan Imaginary⟧, ⟦ADDRESS|5 Nowhere Mews⟧. Please confirm attendance by 08.12.2026. Leaflet 12345678 is a public document number.',{deadline:'2026-12-08',amountPence:null,action:'Confirm attendance'}],
 ['nhs-04','NHS','en-GB','⟦NAME|Skyler Synthetic⟧ <⟦EMAIL|skyler.test@example.invalid⟧>. Do not change medication on this letter alone. Ask your clinician for advice.',{deadline:null,amountPence:null,action:'Ask your clinician for advice'}],
 ['nhs-05','NHS','en-GB','For ⟦NAME|Emery Fiction⟧: NHS no. ⟦NHS|0000000000⟧. Appointment 2026-12-09. Call if you cannot attend.',{deadline:'2026-12-09',amountPence:null,action:'Call if unable to attend'}],
 ['nhs-06','NHS','en-GB','Patient ⟦NAME|Sage Invented⟧\n⟦ADDRESS|Unit 6, Example House⟧, ⟦POSTCODE|ZZ3 3ZZ⟧. Request a copy of your results. The service runs 24/7.',{deadline:null,amountPence:null,action:'Request a copy of your results'}],
 ['council-01','Council','en-GB','Dear ⟦NAME|Reese Fable⟧, account ⟦ACCOUNT|00000000⟧. Council tax balance £250.10. Discuss a plan before 10/12/2026.',{deadline:'2026-12-10',amountPence:25010,action:'Discuss a plan before the stated date'}],
 ['council-02','Council','en-GB','⟦NAME|Blair Imaginary⟧\n⟦ADDRESS|7 Pretend Crescent⟧\n⟦POSTCODE|ZZ4 4ZZ⟧. Renew your permit by 11 December 2026. Cost £12.',{deadline:'2026-12-11',amountPence:1200,action:'Renew your permit'}],
 ['council-03','Council','en-GB','To ⟦NAME|Ellis Synthetic⟧: reference ⟦REFERENCE|COUNCIL-DEMO03⟧. Supply occupancy evidence within 21 days of receipt; receipt date unknown.',{deadline:null,amountPence:null,action:'Supply occupancy evidence'}],
 ['council-04','Council','en-GB','For ⟦NAME|Arden Fiction⟧, email ⟦EMAIL|arden@example.invalid⟧. Collection notice: no payment and no response required. Public ward code ZZ9 9ZZ is an example, not an address.',{deadline:null,amountPence:null,action:'No response required'}],
 ['council-05','Council','en-GB','Dear ⟦NAME|Remy Invented⟧. Contact ⟦PHONE|07700-900789⟧. Challenge the £65.00 charge by 12-12-2026; do not assume it is valid.',{deadline:'2026-12-12',amountPence:6500,action:'Challenge the charge'}],
 ['council-06','Council','en-GB','⟦NAME|Parker Fable⟧ — ⟦ADDRESS|9 Fiction Square⟧. Please check the revised statement dated 13/12/2026. That is an issue date, not a deadline.',{deadline:null,amountPence:null,action:'Check the revised statement'}],
 ['tenancy-01','Tenancy','en-GB','Dear ⟦NAME|River Imaginary⟧. Rent balance £725.00. Request a breakdown by 14 December 2026. Do not pay until details are independently verified.',{deadline:'2026-12-14',amountPence:72500,action:'Request a breakdown'}],
 ['tenancy-02','Tenancy','en-GB','Tenant ⟦NAME|Phoenix Synthetic⟧ at ⟦ADDRESS|Flat 10, 2 Imaginary Road⟧, ⟦POSTCODE|ZZ5 5ZZ⟧. Report repairs to ⟦EMAIL|repairs@example.invalid⟧. No deadline stated.',{deadline:null,amountPence:null,action:'Report repairs'}],
 ['tenancy-03','Tenancy','en-GB','To ⟦NAME|Shiloh Fiction⟧. Fictional bank: sort code ⟦SORT_CODE|00-00-00⟧, account ⟦ACCOUNT|00000000⟧. Do not use these invalid test details. Verify payment instructions first.',{deadline:null,amountPence:null,action:'Verify payment instructions'}],
 ['tenancy-04','Tenancy','en-GB','⟦NAME|Kendall Invented⟧: inspection 15/12/2026. Please confirm access. Deposit £900.00 is recorded, not an amount demanded.',{deadline:'2026-12-15',amountPence:90000,action:'Confirm access'}],
 ['tenancy-05','Tenancy','en-GB','For ⟦NAME|Marley Fable⟧, phone ⟦PHONE|07700 900321⟧. Reply within 48 hours of receipt; no receipt timestamp is known. Document example 01/01/2000 is not a DOB.',{deadline:null,amountPence:null,action:'Reply to the notice'}],
 ['tenancy-06','Tenancy','en-GB','Dear ⟦NAME|Dakota Imaginary⟧. Reference ⟦REFERENCE|RENT/DEMO/06⟧. Please dispute any incorrect £42.05 charge before 16.12.2026.',{deadline:'2026-12-16',amountPence:4205,action:'Dispute any incorrect charge before the stated date'}],
 ['nonuk-01','Fictional US agency','en-US','SYNTHETIC US NOTICE. To ⟦NAME|Charlie Synthetic⟧, ⟦ADDRESS|1 Fictional Example Way⟧. Contact ⟦EMAIL|charlie@example.invalid⟧ or ⟦PHONE|+1 202-555-0100⟧. Submit the form by December 17, 2026. Amount USD 12.00.',{deadline:'2026-12-17',amountPence:1200,action:'Submit the form'}],
 ['negative-01','Public guidance','en-GB','This public guide contains no personal data. Form 12345678, version 1234567890, example code 12-34-56, published 18/12/2026. Read the guide; £0 is payable.',{deadline:null,amountPence:0,action:'Read the guide'}],
];
export const evalCorpus:EvalLetter[]=cases.map(([id,source,locale,body,claim])=>({id,source,locale,...annotated('SYNTHETIC EVALUATION ONLY — NOT A REAL NOTICE\n'+body),claim,mutations:[
 {field:'deadline',claim:{...claim,deadline:claim.deadline==='2026-12-31'?null:'2026-12-31'}},
 {field:'amountPence',claim:{...claim,amountPence:(claim.amountPence??0)+101}},
 {field:'action',claim:{...claim,action:'Send your password to the sender immediately'}}
]}));
export function characterCounts(text:string,truth:Span[],predicted:Span[]){
 const mask=(spans:Span[])=>{const out=new Set<number>();for(const s of spans){if(!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end>text.length||s.start>=s.end)throw Error('Invalid evaluation span');for(let i=s.start;i<s.end;i++)out.add(i);}return out;};
 const a=mask(truth),b=mask(predicted);return {tp:[...a].filter(i=>b.has(i)).length,actual:a.size,predicted:b.size};
}
export function regexEvaluation(){
 const rows=evalCorpus.map(l=>({id:l.id,...characterCounts(l.text,l.truth,regexSpans(l.text))}));
 const total=rows.reduce((a,b)=>({tp:a.tp+b.tp,actual:a.actual+b.actual,predicted:a.predicted+b.predicted}),{tp:0,actual:0,predicted:0});
 return {corpusVersion:CORPUS_VERSION,letters:rows.length,rows,...total,recall:total.tp/total.actual,precision:total.tp/total.predicted,nano:'NOT_RUN',combined:'NOT_RUN',latency:'NOT_RUN',twoKeyModelCatchRate:'NOT_RUN'};
}
/** Deterministic ground-truth oracle for validator tests, NOT a Nano verifier. */
export function mismatchedClaimFields(expected:Claim,observed:Claim):(keyof Claim)[]{return (['deadline','amountPence','action'] as const).filter(k=>expected[k]!==observed[k]);}
