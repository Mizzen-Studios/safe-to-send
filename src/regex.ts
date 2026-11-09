import {validateSpans,type Span} from './privacy';
const rules:[string,RegExp][]=[
 ['NI',/\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi],['NHS',/\b\d{3}\s\d{3}\s\d{4}\b/g],
 ['POSTCODE',/\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/gi],['EMAIL',/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
 ['PHONE',/(?<!\w)(?:\+44\s?\(?0?\)?|0)(?:\d[\s()-]?){9,10}(?!\d)/g],['SORT_CODE',/\b\d{2}[- ]\d{2}[- ]\d{2}\b/g],
 ['ACCOUNT',/\b\d{8}\b/g],['REFERENCE',/\b\d{10}\b/g],['DATE',/\b\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}\b/g],
 ['DATE',/\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi],
 ['REFERENCE',/\b(?:HMRC|DWP|REF|REFERENCE|UTR|NHS)[ :#-]+[A-Z0-9][A-Z0-9/-]{4,}\b/gi]
];
/** Conservative patterns, not an anonymity guarantee. Also catches some deadlines. */
export function regexSpans(text:string):Span[]{const out:Span[]=[];for(const[kind,re]of rules)for(const m of text.matchAll(re))out.push({start:m.index!,end:m.index!+m[0].length,kind});return validateSpans(text,out);}
