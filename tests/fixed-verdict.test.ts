import {it,expect} from 'vitest';
import {fixedChecks,claimBatches} from '../src/fixed-verdict';
import {partialTextDetection} from '../src/nano';
import {parseVerification,type Claim} from '../src/hybrid';
import {automaticReviewSpans} from '../src/manual-suggestions';
const check=(source:string,value:string,kind:Claim['kind']='action',quote=source,status='MATCH')=>{
 const claims:Claim[]=[{id:'x',kind,value}];
 return parseVerification(fixedChecks(JSON.stringify({checks:[{id:'x',status,evidence:[{quote}]}]}),source,claims),source,claims).checks[0].status;
};
it('permits fence/status case syntax only, preserves exact quote bytes and IDs',()=>{
 const claims:Claim[]=[{id:'Exact',kind:'action',value:'Call.'}];
 const raw='\x60\x60\x60json\n'+JSON.stringify({checks:[{id:'Exact',status:'match',evidence:[{quote:'Call.'}]}]})+'\n\x60\x60\x60';
 expect(JSON.parse(fixedChecks(raw,'Call.',claims)).checks[0].status).toBe('supported');
 expect(()=>fixedChecks(raw.replace('Exact','exact'),'Call.',claims)).toThrow();
});
it('wrong quotes and missing IDs become explicit uncertainty; duplicates are errors',()=>{
 const claims:Claim[]=[{id:'x',kind:'action',value:'Call.'}];
 expect(JSON.parse(fixedChecks('{"checks":[]}','Call.',claims)).checks).toEqual([{id:'x',status:'unknown',evidence:[]}]);
 expect(check('Call.','Call.','action','Call!')).toBe('unknown');
 const c={id:'x',status:'MATCH',evidence:[]};expect(()=>fixedChecks(JSON.stringify({checks:[c,c]}),'Call.',claims)).toThrow();
});
it.each([
 ['Do not transfer funds.','Transfer funds immediately.','action'],
 ['Your payment is overdue.','Your payment is overdue. Your payment authorizes unlimited withdrawals.','explanation'],
 ['Your payment is overdue.','Your payment is overdue. I admit owing £9000.','draft'],
 ['Pay GBP 250 and GBP 100.','GBP 25','amount'],
 ['Please call our office.',JSON.stringify({date:'2099-01-01',action:'',evidence:''}),'deadline'],
 ['Please pay twenty pounds.','No monetary amount is stated.','explanation'],
 ['Please pay €250.','No monetary amount is stated.','explanation'],
 ['Please call our office.','Vacate your home.','action']
] as const)('never promotes unsupported whole-claim evidence %s', (source,value,kind)=>expect(check(source,value,kind)).toBe('unknown'));
it('grounds planted deadline and amount differences independently of model label',()=>{
 expect(check('Please reply by 30 November 2026.',JSON.stringify({date:'2026-12-31',evidence:'',action:''}),'deadline')).toBe('mismatch');
 expect(check('Balance £24.50.','£25.51','amount')).toBe('mismatch');
 expect(check('If asked, pay £24.50 or £30.00.','£25.51','amount')).toBe('unknown');
});
it('small batches never truncate long explanation/draft or omit actions',()=>{
 const claims:Claim[]=[{id:'e',kind:'explanation',value:'x'.repeat(1800)},{id:'d',kind:'draft',value:'y'.repeat(1800)},...Array.from({length:12},(_,i)=>({id:String(i),kind:'action' as const,value:'Call.'}))];
 const batches=claimBatches(claims);expect(batches.flat()).toEqual(claims);expect(batches.every(b=>b.length<=4)).toBe(true);expect(batches[0]).toEqual([claims[0]]);
});
it('partial detector findings retain valid repeated Unicode and count invalid quotes, never repair them',()=>{
 const original='Élodie\n8 Example House\nÉlodie';
 const r=partialTextDetection(JSON.stringify({findings:[{quote:'Élodie',kind:'NAME'},{quote:'8 Example House',kind:'ADDRESS'},{quote:'Elodie',kind:'NAME'}]}),original);
 expect(r.invalidFindings).toBe(1);expect(r.spans.map(s=>original.slice(s.start,s.end))).toEqual(['Élodie','8 Example House','Élodie']);
});
it('precision filters preserve PII in addresses/name context and automatic deadlines stay visible',()=>{
 const text='Élodie\nExample House\nDOB: 2000-01-01\nReply by 2026-11-30\nBalance £24.50.\nreceipt date unknown.';
 const values=[['Élodie','NAME'],['Example House','ADDRESS'],['2000-01-01','DATE'],['2026-11-30','DATE'],['Balance £24.50.','SORT_CODE'],['receipt date unknown.','ADDRESS']];
 const spans=values.map(([q,kind])=>({start:text.indexOf(q),end:text.indexOf(q)+q.length,kind}));
 expect(automaticReviewSpans(text,spans).map(s=>text.slice(s.start,s.end))).toEqual(['Élodie','Example House','2000-01-01']);
});
