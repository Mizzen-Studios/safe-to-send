import {it,expect} from 'vitest';
import {parseTextDetection,piiKinds,quoteSpans,validateQuoteVerification} from '../src/nano';
const raw='📨 Dear Maya Synthetic, Maya Synthetic';
const detect=(findings:unknown,text=raw)=>parseTextDetection(JSON.stringify({findings}),text);
it('derives local UTF-16 offsets for all exact repeated quotes',()=>{
 expect(detect([{quote:'Maya Synthetic',kind:'NAME'}])).toEqual([{start:8,end:22,kind:'NAME'},{start:24,end:38,kind:'NAME'}]);expect(detect([])).toEqual([]);
});
it.each([null,[],{}, {quote:'',kind:'NAME'},{quote:' ',kind:'NAME'},{quote:'Maya',kind:'person'},{quote:'Maya',kind:5},{text:'Maya',kind:'NAME'},{quote:'Maya',kind:'NAME',start:8},{quote:'Maya'},{start:8,end:12,kind:'NAME'}])('rejects malformed findings %j',finding=>{expect(()=>detect([finding])).toThrow();});
it.each(['maya Synthetic','Maya  Synthetic','Maya Synthetic','MAYA','Maya Synthetic '])('rejects absent/fuzzy quote %j',quote=>{expect(()=>detect([{quote,kind:'NAME'}])).toThrow('absent');});
it('matches Unicode and escapes exactly, never normalizes or splits surrogate pairs',()=>{
 for(const kind of piiKinds)expect(detect([{quote:'📨',kind}])).toEqual([{start:0,end:2,kind}]);
 for(const quote of ['\ud83d','\udce8'])expect(()=>detect([{quote,kind:'NAME'}])).toThrow('boundary');
 const quote='Élodie\r\n12 \\"Road\\"';const text=quote+'\tCafe\u0301';
 expect(detect([{quote,kind:'ADDRESS'}],text)[0]).toEqual({start:0,end:quote.length,kind:'ADDRESS'});
 expect(()=>detect([{quote:'Café',kind:'NAME'}],text)).toThrow('absent');
});
it('deduplicates findings, handles overlapping repeats, rejects conflicting duplicate labels',()=>{
 expect(detect([{quote:'Maya',kind:'NAME'},{quote:'Maya',kind:'NAME'}])).toEqual(detect([{quote:'Maya',kind:'NAME'}]));
 expect(quoteSpans('ababa',[{quote:'aba',kind:'NAME'}])).toEqual([{start:0,end:5,kind:'NAME'}]);
 expect(()=>detect([{quote:'Maya',kind:'NAME'},{quote:'Maya',kind:'ADDRESS'}])).toThrow('Conflicting');
 const a=[{quote:'Maya',kind:'NAME'},{quote:'Maya Synthetic',kind:'ADDRESS'}];expect(detect(a)).toEqual(detect([...a].reverse()));
});
it.each([null,[],{}, {spans:[]},{findings:null},{findings:{}},{findings:[],letter:raw},{transcription:raw,findings:[]}])('rejects wrong/mixed top-level schemas %j',response=>{expect(()=>parseTextDetection(JSON.stringify(response),raw)).toThrow();});
it('caps response length, finding count, quote length, source length and expanded occurrences',()=>{
 expect(()=>parseTextDetection(' '.repeat(100001),raw)).toThrow();
 expect(()=>detect(Array.from({length:1001},()=>({quote:'Maya',kind:'NAME'})))).toThrow();
 expect(()=>detect([{quote:'x'.repeat(5001),kind:'NAME'}],'x'.repeat(5001))).toThrow();
 expect(()=>detect([],'x'.repeat(50001))).toThrow();
 expect(()=>detect([{quote:'a',kind:'NAME'}],'a'.repeat(1001))).toThrow('Too many');
 let error:unknown;try{parseTextDetection(raw,raw);}catch(e){error=e;}expect(String(error)).toBe('Error: Invalid Nano quote response');
});
const claims=[{id:'a',kind:'action' as const,value:'Call Maya'}];
const verify=(evidence:unknown,status='supported')=>validateQuoteVerification(JSON.stringify({checks:[{id:'a',status,evidence}]}),raw,claims);
it('accepts quote-only evidence contract, without turning exact occurrence into a supported verdict',()=>{
 expect(verify([{quote:'Maya'}])).toBeUndefined();
 // No semantic verdict is synthesized by the adapter validator.
 expect(verify([],'unknown')).toBeUndefined();
});
it.each([[{quote:'Absent'}],[{quote:'maya'}],[{quote:''}],[{quote:'Maya',start:8,end:12}],[{start:8,end:12}],[{quote:'\ud83d'}],Array.from({length:11},()=>({quote:'Maya'}))].map(evidence=>({evidence})))('rejects invalid evidence %j',({evidence})=>{expect(()=>verify(evidence)).toThrow();});
it('rejects bounded/missing/duplicate/invented verifier IDs without synthesis',()=>{
 for(const checks of [[],[{id:'other',status:'unknown',evidence:[]}],[{id:'a',status:'unknown',evidence:[]},{id:'a',status:'unknown',evidence:[]}]] )expect(()=>validateQuoteVerification(JSON.stringify({checks}),raw,claims)).toThrow();
 expect(()=>validateQuoteVerification(' '.repeat(50001),raw,claims)).toThrow();
});
