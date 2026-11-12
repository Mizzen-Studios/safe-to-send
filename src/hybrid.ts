import {type PrivacyGate,redact,restore} from './privacy';
import {parseJourney,reviewedJourney,type Journey} from './journey';
import {regexSpans} from './regex';
/** Stable UI contract. Model responses are untrusted and evidence never leaves this module. */
export type Claim={id:string;kind:'deadline'|'amount'|'action';value:string};
export type Verdict='supported'|'mismatch'|'unsupported'|'unknown';
export type ClaimCheck={id:string;status:Verdict};
export type Verification={status:Verdict;checks:ClaimCheck[]};
export type LocalNano={answer:(original:string)=>Promise<string>;verify:(original:string,claims:Claim[])=>Promise<string>};
export type LocalResult<T>={status:'complete';revision:number;result:T}|{status:'unavailable';revision:number;reason:string};
export const manualSuggestions=(text:string)=>regexSpans(text);
export function startManualReview(gate:PrivacyGate){gate.manual(manualSuggestions(gate.text));}
export function claimsFromJourney(journey:Journey):Claim[]{
 const j=parseJourney(JSON.stringify(journey));
 const claims:Claim[]=[];
 for(const [i,d]of j.deadlines.entries())claims.push({id:'deadline-'+i,kind:'deadline',value:JSON.stringify(d)});
 for(const [i,a]of j.actions.entries())claims.push({id:'action-'+i,kind:'action',value:a});
 const amounts=[...new Set(JSON.stringify(j).match(/(?:£|GBP\s*)\d[\d,]*(?:\.\d{1,2})?/g)??[])];
 amounts.forEach((value,i)=>claims.push({id:'amount-'+i,kind:'amount',value}));
 return claims;
}
/** Exact private-original offsets/quote are checked, then discarded (never returned or logged).
 * Supported means model-supported with valid evidence, NOT a deterministic truth guarantee. */
export function parseVerification(json:string,original:string,claims:Claim[]):Verification{
 if(json.length>50000)throw Error('Invalid local verification');
 const x=JSON.parse(json);
 if(!x||Object.keys(x).join()!=='checks'||!Array.isArray(x.checks)||x.checks.length!==claims.length)throw Error('Invalid local verification');
 const seen=new Set<string>();
 const checks:ClaimCheck[]=x.checks.map((c:unknown)=>{
 if(!c||typeof c!=='object')throw Error('Invalid local verification');
 const v=c as Record<string,unknown>;
 if(Object.keys(v).sort().join()!=='evidence,id,status'||typeof v.id!=='string'||seen.has(v.id)||!claims.some(c=>c.id===v.id)||!['supported','mismatch','unsupported','unknown'].includes(v.status as string)||!Array.isArray(v.evidence)||v.evidence.length>10)throw Error('Invalid local verification');
 seen.add(v.id);
 let valid=true;
 for(const e of v.evidence){if(!e||Object.keys(e).sort().join()!=='end,quote,start'||!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<0||e.end<=e.start||e.end>original.length||typeof e.quote!=='string'||original.slice(e.start,e.end)!==e.quote)valid=false;}
 const claim=claims.find(c=>c.id===v.id)!;
 const quotes=v.evidence.map((e:{quote?:unknown})=>typeof e?.quote==='string'?e.quote:'').join('\n');
 if(v.status==='supported'&&claim.kind==='amount'&&!quotes.includes(claim.value))valid=false;
 if(v.status==='supported'&&claim.kind==='deadline'){
 const d=JSON.parse(claim.value) as Journey['deadlines'][number];
 if(!quotes.includes(d.evidence))valid=false;
 if(d.date){const [year,month,day]=d.date.split('-');const name=['January','February','March','April','May','June','July','August','September','October','November','December'][Number(month)-1];const variants=[d.date,day+'/'+month+'/'+year,Number(day)+'/'+Number(month)+'/'+year,Number(day)+' '+name+' '+year];if(!variants.some(date=>quotes.toLowerCase().includes(date.toLowerCase())))valid=false;}
 }
 const status=(v.status==='supported'||v.status==='mismatch')&&(!valid||!v.evidence.length)?'unknown':v.status as Verdict;
 return {id:v.id,status};
 });
 const status:Verdict=checks.some(c=>c.status==='mismatch')?'mismatch':checks.some(c=>c.status==='unsupported')?'unsupported':!checks.length||checks.some(c=>c.status==='unknown')?'unknown':'supported';
 return {status,checks};
}
function current(gate:PrivacyGate,revision:number){if(gate.currentRevision!==revision)throw Error('Letter changed; local response discarded');}
/** Local-only model answer is returned redacted for safe rendering; raw model text is not exposed. */
export async function runLocalAnswer(gate:PrivacyGate,nano:LocalNano|null):Promise<LocalResult<Journey>>{
 const revision=gate.currentRevision;
 if(!nano)return {status:'unavailable',revision,reason:'On-device model unavailable; no fallback.'};
 try{
 const original=gate.text,spans=gate.highlights;
 if(!spans.length||!['review','approved','done'].includes(gate.phase))throw Error('Reviewed redactions required');
 const j=parseJourney(await nano.answer(original));current(gate,revision);
 if(JSON.stringify(j).includes(JSON.stringify(original).slice(1,-1)))throw Error('Whole original echo refused');
 for(const d of j.deadlines)if(!original.includes(d.evidence))throw Error('Invalid local evidence');
 const mapping=redact(original,spans).mapping;
 const safe=(value:string)=>{for(const [token,raw]of Object.entries(mapping).sort((a,b)=>b[1].length-a[1].length))value=value.split(raw).join(token);return value;};
 const result={explanation:safe(j.explanation),draft:safe(j.draft),actions:j.actions.map(safe),deadlines:j.deadlines.map(d=>({...d,evidence:safe(d.evidence),action:safe(d.action)}))};
 return {status:'complete',revision,result};
 }catch{current(gate,revision);return {status:'unavailable',revision,reason:'Local answer unavailable or invalid; no fallback.'};}
}
/** Two keys: approved redacted cloud answer + separate ONLY_ON_DEVICE evidence check.
 * Input journey must still be redacted. No cloud provider/transport is accepted here. */
export async function runTwoKey(gate:PrivacyGate,nano:LocalNano|null,redactedJourney:Journey):Promise<LocalResult<Verification>>{
 const revision=gate.currentRevision;
 if(!nano)return {status:'unavailable',revision,reason:'On-device verifier unavailable; no fallback.'};
 const binding=reviewedJourney(gate);
 const supplied=JSON.stringify(parseJourney(JSON.stringify(redactedJourney)));
 if(supplied!==JSON.stringify(binding.redacted)&&supplied!==JSON.stringify(binding.restored))throw Error('Verification requires the unchanged revision-bound cloud answer');
 const original=gate.text,mapping=redact(original,gate.highlights).mapping;
 const j=binding.redacted;
 const restoreText=(s:string)=>restore(s,mapping);
 const privateJourney={explanation:restoreText(j.explanation),draft:restoreText(j.draft),actions:j.actions.map(restoreText),deadlines:j.deadlines.map(d=>({...d,evidence:restoreText(d.evidence),action:restoreText(d.action)}))};
 const claims=claimsFromJourney(privateJourney);
 try{const json=await nano.verify(original,claims);current(gate,revision);return {status:'complete',revision,result:parseVerification(json,original,claims)};}
 catch{current(gate,revision);return {status:'unavailable',revision,reason:'Local verification unavailable or invalid; no fallback.'};}
}
