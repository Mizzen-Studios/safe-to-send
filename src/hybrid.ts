import {type PrivacyGate,redact,restore} from './privacy';
import {parseJourney,reviewedCloudJourney,type Journey} from './journey';
import {validateDraftRoles} from './roles';
import {regexSpans} from './regex';
/** Stable UI contract. Model responses are untrusted and evidence never leaves this module. */
export type Claim={id:string;kind:'deadline'|'amount'|'action'|'explanation'|'draft';value:string};
export type Verdict='supported'|'mismatch'|'unsupported'|'unknown';
export type ClaimCheck={id:string;status:Verdict};
/** Coverage records submitted fields, never a deterministic accuracy/anonymity guarantee. */
export type Verification={status:Verdict;checks:ClaimCheck[];coverage:{scope:'submitted-claims';claimCount:number;uncheckedFields:('explanation'|'draft')[]}};
export type LocalNano={answer:(original:string)=>Promise<string>;verify:(original:string,claims:Claim[])=>Promise<string>};
export type LocalResult<T>={status:'complete';revision:number;result:T}|{status:'unavailable';revision:number;reason:string};
export type LocalAnswerResult=Extract<LocalResult<Journey>,{status:'unavailable'}>|(Extract<LocalResult<Journey>,{status:'complete'}>&{checked:true;verification:Verification});
export const manualSuggestions=(text:string)=>regexSpans(text);
export function startManualReview(gate:PrivacyGate){gate.manual(manualSuggestions(gate.text));}
export function claimsFromJourney(journey:Journey):Claim[]{
 const j=parseJourney(JSON.stringify(journey));
 // Whole fields are claims too: prose, draft admissions and written-out amounts cannot be skipped.
 const claims:Claim[]=[{id:'explanation',kind:'explanation',value:j.explanation},{id:'draft',kind:'draft',value:j.draft}];
 for(const [i,d]of j.deadlines.entries())claims.push({id:'deadline-'+i,kind:'deadline',value:JSON.stringify(d)});
 for(const [i,a]of j.actions.entries())claims.push({id:'action-'+i,kind:'action',value:a});
 const amounts=[...new Set(JSON.stringify(j).match(/(?:£|GBP\s*)\d[\d,]*(?:\.\d{1,2})?/g)??[])];
 amounts.forEach((value,i)=>claims.push({id:'amount-'+i,kind:'amount',value}));
 return claims;
}
/** Conservative textual matching only: paraphrases/contradictions remain unknown.
 * This is not semantic entailment, advice validation or a truth guarantee. */
const normalizeEvidence=(s:string)=>s.normalize('NFC').toLowerCase().replace(/\s+/gu,' ').trim();
function matchesClaim(claim:Claim,quotes:string[],original:string):boolean{
 const contains=(value:string)=>quotes.some(q=>normalizeEvidence(q).includes(normalizeEvidence(value)));
 // Whole prose/action fields must match complete source sentences, not fragments
 // selected out of a negation, condition, attribution or longer instruction.
 const whole=(value:string)=>contains(value)&&original.split(/(?<=[.!?])\s+|[\r\n]+/u).some(sentence=>normalizeEvidence(sentence)===normalizeEvidence(value));
 if(claim.kind==='amount'){
 const amounts=(text:string)=>text.match(/(?:£|GBP\s*)\d[\d,]*(?:\.\d{1,2})?/g)??[];
 return amounts(original).some(amount=>amount===claim.value)&&quotes.some(q=>amounts(q).some(amount=>amount===claim.value));
 }
 if(claim.kind!=='deadline')return whole(claim.value);
 const d=JSON.parse(claim.value) as Journey['deadlines'][number];
 if(!whole(d.action))return false;
 const related=quotes.filter(q=>normalizeEvidence(q).includes(normalizeEvidence(d.evidence))&&normalizeEvidence(q).includes(normalizeEvidence(d.action)));
 if(!related.length)return false;
 if(!d.date)return true;
 const [year,month,day]=d.date.split('-');
 const name=['January','February','March','April','May','June','July','August','September','October','November','December'][Number(month)-1];
 return [d.date,day+'/'+month+'/'+year,Number(day)+'/'+Number(month)+'/'+year,Number(day)+' '+name+' '+year].some(date=>related.some(q=>normalizeEvidence(q).includes(normalizeEvidence(date))));
}
/** Quotes are located against the private original, then discarded. Legacy offsets must also agree. */
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
 const quotes:string[]=[];
 for(const e of v.evidence){
 if(!e||typeof e!=='object'||Array.isArray(e)){valid=false;continue;}
 const keys=Object.keys(e).sort().join();
 if(typeof e.quote!=='string'||!e.quote.trim()||!original.includes(e.quote)){valid=false;continue;}
 if(keys!=='quote'&&(keys!=='end,quote,start'||!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<0||e.end<=e.start||e.end>original.length||original.slice(e.start,e.end)!==e.quote)){valid=false;continue;}
 quotes.push(e.quote);
 }
 const claim=claims.find(c=>c.id===v.id)!;
 // No deterministic contradiction checker exists. Never promote a model's mismatch
 // on the strength of an unrelated (or merely real) quote.
 const status:Verdict=v.status==='mismatch'?'unknown':v.status==='supported'&&(!valid||!quotes.length||!matchesClaim(claim,quotes,original))?'unknown':v.status as Verdict;
 return {id:v.id,status};
 });
 const uncheckedFields=(['explanation','draft'] as const).filter(kind=>!claims.some(c=>c.kind===kind));
 const status:Verdict=checks.some(c=>c.status==='mismatch')?'mismatch':checks.some(c=>c.status==='unsupported')?'unsupported':!checks.length||uncheckedFields.length>0||checks.some(c=>c.status==='unknown')?'unknown':'supported';
 return {status,checks,coverage:{scope:'submitted-claims',claimCount:claims.length,uncheckedFields}};
}
const operations=new WeakMap<PrivacyGate,number>();
function begin(gate:PrivacyGate){const operation=(operations.get(gate)??0)+1;operations.set(gate,operation);return operation;}
function current(gate:PrivacyGate,revision:number,operation:number){if(gate.currentRevision!==revision||operations.get(gate)!==operation)throw Error('Letter changed or newer operation started; local response discarded');}
/** Local-only model answer is returned redacted for safe rendering; raw model text is not exposed. */
export async function runLocalAnswer(gate:PrivacyGate,nano:LocalNano|null):Promise<LocalAnswerResult>{
 const revision=gate.currentRevision,operation=begin(gate);
 if(!nano)return {status:'unavailable',revision,reason:'On-device model unavailable; no fallback.'};
 try{
 const original=gate.text,spans=gate.highlights;
 if(!spans.length||!['review','approved','done'].includes(gate.phase))throw Error('Reviewed redactions required');
 const j=parseJourney(await nano.answer(original));current(gate,revision,operation);
 if(JSON.stringify(j).includes(JSON.stringify(original).slice(1,-1)))throw Error('Whole original echo refused');
 for(const d of j.deadlines)if(!original.includes(d.evidence))throw Error('Invalid local evidence');
 const claims=claimsFromJourney(j);
 const verification=parseVerification(await nano.verify(original,claims),original,claims);current(gate,revision,operation);
 const mapping=redact(original,spans).mapping;
 const safe=(value:string)=>{for(const [token,raw]of Object.entries(mapping).sort((a,b)=>b[1].length-a[1].length))value=value.split(raw).join(token);return value;};
 const result={explanation:safe(j.explanation),draft:safe(j.draft),actions:j.actions.map(safe),deadlines:j.deadlines.map(d=>({...d,evidence:safe(d.evidence),action:safe(d.action)}))};
 validateDraftRoles(result.draft,redact(original,spans).text);
 return {status:'complete',revision,result,checked:true,verification};
 }catch{current(gate,revision,operation);return {status:'unavailable',revision,reason:'Local answer unavailable or invalid; no fallback.'};}
}
/** Two keys: approved redacted cloud answer + separate ONLY_ON_DEVICE evidence check.
 * Input journey must still be redacted. No cloud provider/transport is accepted here. */
export async function runTwoKey(gate:PrivacyGate,nano:LocalNano|null,redactedJourney:Journey):Promise<LocalResult<Verification>>{
 const revision=gate.currentRevision,operation=begin(gate);
 if(!nano)return {status:'unavailable',revision,reason:'On-device verifier unavailable; no fallback.'};
 const binding=reviewedCloudJourney(gate);
 const supplied=JSON.stringify(parseJourney(JSON.stringify(redactedJourney)));
 if(supplied!==JSON.stringify(binding.redacted)&&supplied!==JSON.stringify(binding.restored))throw Error('Verification requires the unchanged revision-bound cloud answer');
 const original=gate.text,mapping=redact(original,gate.highlights).mapping;
 const j=binding.redacted;
 const restoreText=(s:string)=>restore(s,mapping);
 const privateJourney={explanation:restoreText(j.explanation),draft:restoreText(j.draft),actions:j.actions.map(restoreText),deadlines:j.deadlines.map(d=>({...d,evidence:restoreText(d.evidence),action:restoreText(d.action)}))};
 const claims=claimsFromJourney(privateJourney);
 try{const json=await nano.verify(original,claims);current(gate,revision,operation);return {status:'complete',revision,result:parseVerification(json,original,claims)};}
 catch{current(gate,revision,operation);return {status:'unavailable',revision,reason:'Local verification unavailable or invalid; no fallback.'};}
}
