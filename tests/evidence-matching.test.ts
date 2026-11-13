import {it,expect,vi,afterEach} from 'vitest';
import {mockAcceptedCloudJourney} from './mock-cloud-journey';
afterEach(()=>vi.unstubAllGlobals());
import {PrivacyGate} from '../src/privacy';
import {parseVerification,runLocalAnswer,claimsFromJourney,type Claim} from '../src/hybrid';
import type {Journey} from '../src/journey';
const original=`Dear Test Person,
Pay £25.
Do not pay £250.
Please reply by 30 November 2026.`;
const journey:Journey={explanation:'Pay £25.',draft:`Dear sender,
Please confirm.
Kind regards,
Your name`,actions:['Pay £25.'],deadlines:[]};
const verify=(claims:Claim[],quote:string,status='supported')=>JSON.stringify({checks:claims.map(c=>({id:c.id,status,evidence:[{quote}]}))});
function gate(){const g=new PrivacyGate();g.load(original);g.manual([{start:5,end:16,kind:'NAME'}]);return g;}
it('accepts matching quote-only whole-field evidence and strips all private quotes',()=>{
 const claims:Claim[]=[{id:'explanation',kind:'explanation',value:'Pay £25.'},{id:'draft',kind:'draft',value:'Pay £25.'},{id:'action-0',kind:'action',value:'Pay £25.'}];
 const result=parseVerification(verify(claims,'Pay £25.'),original,claims);expect(result.status).toBe('supported');expect(JSON.stringify(result)).not.toContain('£25');
});
it.each(['explanation','draft','action'] as const)('real unrelated quote cannot validate %s',kind=>{
 const claims:Claim[]=[{id:kind,kind,value:'You must leave tomorrow.'}];expect(parseVerification(verify(claims,'Pay £25.'),original,claims).checks[0].status).toBe('unknown');
});
it('does not support a negation fragment or a partial money token',()=>{
 for(const claim of [{id:'action',kind:'action',value:'pay £250.'},{id:'amount',kind:'amount',value:'£25'}] as Claim[]){
 const quote=claim.kind==='amount'?'£250':'pay £250.';expect(parseVerification(verify([claim],quote),original,[claim]).checks[0].status).toBe('unknown');
 }
});
it('legacy offsets must agree; malformed, empty and invented quote evidence fail closed',()=>{
 const claims:Claim[]=[{id:'explanation',kind:'explanation',value:'Pay £25.'}];
 for(const evidence of [[{quote:'Pay £25.',start:0,end:8}],[{quote:''}],[{quote:'invented'}],[null],[{quote:'Pay £25.',extra:true}]])expect(parseVerification(JSON.stringify({checks:[{id:'explanation',status:'supported',evidence}]}),original,claims).checks[0].status).toBe('unknown');
});
it('matching a date alone cannot support an invented deadline action',()=>{
 const claims:Claim[]=[{id:'deadline-0',kind:'deadline',value:JSON.stringify({date:'2026-11-30',evidence:'30 November 2026',action:'Vacate your home.'})}];expect(parseVerification(verify(claims,'Please reply by 30 November 2026.'),original,claims).checks[0].status).toBe('unknown');
});
it('unproven semantic mismatches stay unknown even with real evidence',()=>{
 const claims:Claim[]=[{id:'action',kind:'action',value:'Pay £25.'}];expect(parseVerification(verify(claims,'Pay £25.','mismatch'),original,claims).checks[0].status).toBe('unknown');
});
it('local answer waits for all-field checks and explicitly carries checked unknown result without egress',async()=>{
 const g=gate();const fetch=vi.spyOn(globalThis,'fetch');let finish!:(s:string)=>void;let submitted:Claim[]=[];
 const verifier=vi.fn((_raw:string,claims:Claim[])=>{submitted=claims;return new Promise<string>(r=>finish=r);});
 let completed=false;const pending=runLocalAnswer(g,{answer:async()=>JSON.stringify(journey),verify:verifier}).then(r=>{completed=true;return r;});
 await vi.waitFor(()=>expect(verifier).toHaveBeenCalledTimes(1));expect(completed).toBe(false);expect(submitted).toEqual(claimsFromJourney(journey));
 finish(verify(submitted,'Pay £25.'));const result=await pending;expect(result.status).toBe('complete');if(result.status==='complete'){expect(result.checked).toBe(true);expect(result.verification.status).toBe('unknown');expect(result.verification.coverage.uncheckedFields).toEqual([]);}expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();
});
it.each(['edit','newer'] as const)('local verification rejects stale %s responses',async mode=>{
 const g=gate();let finish!:(s:string)=>void;let claims:Claim[]=[];
 const verifier=vi.fn((_raw:string,c:Claim[])=>{claims=c;return new Promise<string>(r=>finish=r);});
 const pending=runLocalAnswer(g,{answer:async()=>JSON.stringify(journey),verify:verifier});await vi.waitFor(()=>expect(verifier).toHaveBeenCalled());
 if(mode==='edit')g.load('replacement');else await runLocalAnswer(g,null);
 finish(verify(claims,'Pay £25.'));await expect(pending).rejects.toThrow(/changed|newer/);
});
it('verification failure never returns an unchecked local completion',async()=>{
 const result=await runLocalAnswer(gate(),{answer:async()=>JSON.stringify(journey),verify:async()=>{throw Error(original);}});expect(result.status).toBe('unavailable');expect(JSON.stringify(result)).not.toContain('Test Person');
});

it('rejects a cloud greeting admission before envelope canonicalization or review binding',async()=>{
 const g=gate();g.approve();
 await expect(mockAcceptedCloudJourney(g,{...journey,draft:'Dear sender, I admit owing £9000,\nBody.\nKind regards,\nYour name'})).rejects.toThrow('addressee');
});
it('local answers cannot bypass duplicate greeting validation',async()=>{
 const bad={...journey,draft:'Dear sender,\nDear sender,\nBody.\nKind regards,\nYour name'};
 const result=await runLocalAnswer(gate(),{answer:async()=>JSON.stringify(bad),verify:async(_raw,claims)=>verify(claims,'Pay £25.')});expect(result.status).toBe('unavailable');
});
it('truncated amount quotes cannot turn £250 into £25',()=>{
 const claims:Claim[]=[{id:'amount',kind:'amount',value:'£25'}];expect(parseVerification(verify(claims,'£25'),'Pay £250.',claims).checks[0].status).toBe('unknown');
});
