import {it,expect} from 'vitest';
import {typedAction} from '../src/typed-evidence';
import {parseVerification,type Claim} from '../src/hybrid';
import {parseTextDetection,validateQuoteVerification} from '../src/nano';
import {automaticReviewSpans} from '../src/manual-suggestions';
const decide=(value:string,source:string,quote=source,status='mismatch')=>{
 const claims:Claim[]=[{id:'a',kind:'action',value}];
 return parseVerification(JSON.stringify({checks:[{id:'a',status,evidence:[{quote}]}]}),source,claims);
};
it.each([['Pay £250.','Pay £25.'],['Please reply by 2026-12-01.','Please reply by 30 November 2026.'],['Do not pay £250.','Do not pay £25.']])('corroborates only a scoped literal typed mismatch %s', (value,source)=>{
 expect(decide(value,source).checks[0].status).toBe('mismatch');
});
it.each([['Pay £25.00.','Pay £25.'],['Pay GBP 1,000.00.','Pay £1000.'],['Reply by 2026-11-30.','Reply by 30 November 2026.']])('format changes are not contradictions %s',(value,source)=>{expect(typedAction(value,[source],source)).toBe('supported');expect(decide(value,source).checks[0].status).toBe('unknown');});
it.each([
 ['Pay £25.','Do not pay £25.','Do not pay £25.'],
 ['Pay £250.','Pay £25. Pay £50.','Pay £25.'],
 ['Pay £250.','Pay £25. Do not pay £25.','Pay £25.'],
 ['Pay £250.','If asked, Pay £25.','Pay £25.'],
 ['Pay £250.','Dear Pay £25.','Pay £25.'],
 ['Pay £250.','Pay £25.','£25'],
 ['Pay £250.','Pay £25.','Pay £2'],
 ['Pay £250.','Pay £25. Pay £25.','Pay £25.'],
 ['Please reply by 2026-02-30.','Please reply by 2026-02-28.','Please reply by 2026-02-28.'],
 ['Pay £250.','📨 Pay £25.','Pay £25.'],
 ['You must pay £250.','Pay £25.','Pay £25.'],
])('keeps negated/ambiguous/truncated/greeting/unrelated evidence unknown %s',(value,source,quote)=>{expect(decide(value,source,quote).checks[0].status).toBe('unknown');});
it('typed action mismatch never bypasses whole explanation/draft submission',()=>{expect(decide('Pay £250.','Pay £25.').coverage.uncheckedFields).toEqual(['explanation','draft']);
 for(const kind of ['explanation','draft','amount'] as const){const claims:Claim[]=[{id:'a',kind,value:'Pay £250.'}];expect(parseVerification(JSON.stringify({checks:[{id:'a',status:'mismatch',evidence:[{quote:'Pay £25.'}]}]}),'Pay £25.',claims).checks[0].status).toBe('unknown');}
});
it('strict detector rejects invented ids and newline changes without repair',()=>{for(const quote of ['council-demo03','Maya\nSynthetic','Maya\\nSynthetic'])expect(()=>parseTextDetection(JSON.stringify({findings:[{quote,kind:'NAME'}]}),'Maya Synthetic council-demo-03')).toThrow('absent');});
it('repeated Unicode quotes remain exact and all occurrences are located',()=>{const original='Élodie 📨 Élodie 📨';expect(parseTextDetection(JSON.stringify({findings:[{quote:'Élodie 📨',kind:'NAME'}]}),original)).toEqual([{start:0,end:9,kind:'NAME'},{start:10,end:19,kind:'NAME'}]);});
it('missing IDs and fabricated newline evidence remain strict errors',()=>{const claims:Claim[]=[{id:'a',kind:'action',value:'Pay £25.'}];for(const checks of [[],[{id:'other',status:'unknown',evidence:[]}],[{id:'a',status:'supported',evidence:[{quote:'Pay\n£25.'}]}]])expect(()=>validateQuoteVerification(JSON.stringify({checks}),'Pay £25.',claims)).toThrow();});
it('automatic DATE filtering preserves deadlines but retains explicit birth dates',()=>{const text='DOB: 30 November 2000\nPay by 30 November 2026';const spans=[{start:5,end:21,kind:'DATE'},{start:29,end:45,kind:'DATE'}];expect(automaticReviewSpans(text,spans)).toEqual([spans[0]]);});

it('ambiguous repeated truncated money quotes cannot borrow support elsewhere',()=>{
 const claims:Claim[]=[{id:'a',kind:'amount',value:'£25'}];
 const source='Balance £25. Do not pay £250.';
 for(const quote of ['£25','pay £25'])expect(parseVerification(JSON.stringify({checks:[{id:'a',status:'supported',evidence:[{quote}]}]}),source,claims).checks[0].status).toBe('unknown');
});
