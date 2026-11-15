import {sourceSentences,typedField} from './typed-evidence';
import type {Claim} from './hybrid';
const words=(s:string)=>new Set(s.toLowerCase().match(/[a-z]{3,}/g)?.filter(w=>!['the','and','you','your','this','that','with','for','from','are','was','will','must','please','sender','dear','regards','name','kind','stated','monetary','amount','before','date'].includes(w))??[]);
const moneyLike=/(?:[£$€¥]|\b(?:GBP|USD|EUR|pounds?|dollars?|euros?|pence|balance|fee|cost|repayment|rent)\b)/i;
/** Model-assisted, NOT an entailment proof. Requires complete source units,
 * relevance, polarity, numeric boundaries and coverage of every prose assertion. */
export function semanticEvidence(claim:Claim,quotes:string[],original:string):boolean {
 if(!quotes.length)return false;
 const units=sourceSentences(original);
 if(!quotes.every(q=>units.some(s=>q===s||q.includes(s))))return false;
 if(claim.kind==='amount')return typedField(claim,quotes,original)==='supported';
 if(claim.kind==='deadline'){
  try{
   const d=JSON.parse(claim.value);
   if(d.action||d.evidence)return false;
   if(d.date!==null)return typedField(claim,quotes,original)==='supported';
   // Absence is a model judgment over complete source, not any unrelated quote.
   return quotes.includes(original)&&!units.some(s=>/\b(?:by|before|on|appointment|inspection)\b/i.test(s)&&/\b\d{1,4}[/. -]\d/.test(s)&&!/\b(?:birth|DOB|issue date|not a deadline)\b/i.test(s));
  }catch{return false;}
 }
 if(claim.value==='No monetary amount is stated.')return quotes.includes(original)&&!moneyLike.test(original);
 const b=words(quotes.join(' '));
 const assertions=sourceSentences(claim.value).filter(s=>words(s).size);
 return assertions.length>0&&assertions.every(s=>{
  const a=words(s),overlap=[...a].filter(w=>b.has(w));
  if(!overlap.length)return false;
  // One shared word cannot validate a new appended assertion.
  if((claim.kind==='explanation'||claim.kind==='draft')&&[...a].some(w=>!b.has(w)))return false;
  if(/\b(?:admit|owe|password|authorizes|withdrawals)\b/i.test(s)&&!units.includes(s))return false;
  // Do not let an affirmative paraphrase borrow a negated obligation.
  if(!/\b(?:not|never|no|without)\b/i.test(s)&&quotes.some(q=>/\b(?:not|never|no)\b/i.test(q)&&[...words(q)].some(w=>a.has(w))))return false;
  // Every number/currency token must occur as a complete token in evidence.
  for(const n of s.match(/(?:[£$€]|GBP\s*|USD\s*)?\d[\d,.]*/g)??[]){
   const at=quotes.join(' ').indexOf(n);if(at<0||/[\d,.]/.test(quotes.join(' ')[at+n.length]??''))return false;
  }
  return true;
 });
}
