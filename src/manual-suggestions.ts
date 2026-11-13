import {regexSpans} from './regex';
import {validateSpans,type Span} from './privacy';
/** Suggestions only: never a guarantee that personal information is absent.
 * Dates are not automatically hidden unless explicitly labelled as birth dates.
 * Operator-selected redactions are deliberately outside this helper. */
export function automaticReviewSpans(text:string,spans:Span[]):Span[]{
 return validateSpans(text,spans.filter(s=>{
  if(s.kind!=='DATE')return true;
  const lineStart=text.lastIndexOf('\n',s.start-1)+1;
  return /(?:date of birth|birth date|born|DOB)\s*[:=-]?\s*$/i.test(text.slice(lineStart,s.start));
 }));
}
export function manualReviewSuggestions(text:string):Span[]{
 const out=automaticReviewSpans(text,regexSpans(text));
 const add=(value:string,kind:string)=>{let at=0;while((at=text.indexOf(value,at))!==-1){out.push({start:at,end:at+value.length,kind});at+=value.length;}};
 const word=String.raw`[\p{Lu}][\p{L}\p{M}'’-]*`;
 const name=new RegExp(String.raw`(?:^|\n)(?:Dear|Hello|Hi|Name:|Recipient:)[ \t]+(${word}(?:[ \t]+${word}){0,3})(?=,|[ \t]*\r?$)`,'gmu');
 for(const m of text.matchAll(name)){if(!/^(?:Sir|Madam|Sender|Customer|Resident|Occupier|Team|Sir or Madam)$/i.test(m[1]))add(m[1],'NAME');}
 const signature=new RegExp(String.raw`(?:^|\n)(?:Kind regards|Yours sincerely|Yours faithfully|Regards|Best wishes),?\r?\n[ \t]*(${word}(?:[ \t]+${word}){0,3})(?=[ \t]*\r?$)`,'gmu');
 for(const m of text.matchAll(signature))if(!/^(?:Your name|The Team)$/i.test(m[1]))add(m[1],'NAME');
 const address=/\b\d{1,5}[A-Za-z]?[ \t]+(?:[\p{L}\p{M}'’-]+[ \t]+){0,5}(?:Street|Road|Lane|Avenue|Close|Drive|Way|Court|Crescent|Terrace|Place|Gardens|Grove|Mews)\b/giu;
 for(const m of text.matchAll(address))out.push({start:m.index!,end:m.index!+m[0].length,kind:'ADDRESS'});
 return validateSpans(text,out);
}
