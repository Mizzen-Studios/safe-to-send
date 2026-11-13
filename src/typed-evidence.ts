/** Tiny literal grammar, NOT general entailment or semantic advice validation. */
export type TypedVerdict='supported'|'mismatch'|'unknown';
const money=String.raw`(?:£|GBP )\d+(?:,\d{3})*(?:\.\d{2})?`;
const date=String.raw`(?:\d{4}-\d{2}-\d{2}|\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) \d{4})`;
const patterns=[new RegExp('^(Pay |Do not pay )('+money+')(\\.)$'),new RegExp('^(Please reply by |Reply by |Send evidence by )('+date+')(\\.)$')];
export function sourceSentences(original:string):string[]{
 return original.split(/(?<=[.!?])\s+|[\r\n]+/u).map(s=>s.trim()).filter(Boolean);
}
function key(token:string):string|null{
 if(/^(?:£|GBP )/.test(token)){
  const [units,fraction='00']=token.replace(/^(?:£|GBP )/,'').replaceAll(',','').split('.');
  if(units.length>15)return null;
  return 'GBP:'+(BigInt(units)*100n+BigInt(fraction)).toString();
 }
 const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
 const parts=token.split(' ');
 const iso=parts.length===3?parts[2]+'-'+String(months.indexOf(parts[1])+1).padStart(2,'0')+'-'+parts[0].padStart(2,'0'):token;
 const t=Date.parse(iso);
 return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===iso?iso:null;
}
export function typedAction(value:string,quotes:string[],original:string):TypedVerdict{
 for(const pattern of patterns){
  const target=value.match(pattern);if(!target)continue;
  const related=sourceSentences(original).filter(sentence=>{const m=sentence.match(pattern);return m&&m[3]===target[3];});
  // Multiple possible obligations are ambiguous, even if the model selects one.
  if(related.length!==1||!quotes.includes(related[0]))return 'unknown';
  const source=related[0].match(pattern)!;
  if(source[1]!==target[1])return 'unknown'; // Never strip or invert negation.
  const a=key(target[2]),b=key(source[2]);
  return a===null||b===null?'unknown':a===b?'supported':'mismatch';
 }
 return 'unknown';
}
