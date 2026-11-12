import {it,expect,vi,afterEach} from 'vitest';
import {mockAcceptedCloudJourney} from './mock-cloud-journey';
afterEach(()=>vi.unstubAllGlobals());
import {PrivacyGate} from '../src/privacy';
import {runJourney,reviewedJourney,type Journey} from '../src/journey';
import {startManualReview,runLocalAnswer,runTwoKey,parseVerification,claimsFromJourney} from '../src/hybrid';
import {inferRoles,replyEnvelope,validateDraftRoles} from '../src/roles';
const raw='Dear Rowan Invented,\nA brand new synthetic letter. Please pay £25 by 30 November 2026. Email rowan@example.invalid.';
const j:Journey={explanation:'Pay £25.',deadlines:[{date:'2026-11-30',evidence:'by 30 November 2026',action:'Pay £25'}],actions:['Pay £25'],draft:'Dear sender,\nPlease confirm the amount.\nKind regards,\n[NAME_1]'};
function manual(){const g=new PrivacyGate();g.load(raw);startManualReview(g);g.edit(g.highlights.filter(s=>s.kind!=='DATE'));g.addSpan({start:5,end:19,kind:'NAME'});return g;}
async function answered(){const g=manual();g.approve();await mockAcceptedCloudJourney(g,j);return g;}
it('accepts an arbitrary reviewed synthetic letter without fixture identity and sends exact approved redacted revision only',async()=>{
 const g=manual(),transport=vi.fn(async()=>JSON.stringify(j));await expect(runJourney(g,transport,'mock')).rejects.toThrow('approval');g.approve();const payload=g.applicationPreview;await runJourney(g,transport,'mock');expect(transport).toHaveBeenCalledWith(payload);expect(payload).not.toContain('Rowan Invented');expect(payload).not.toContain('rowan@example.invalid');expect(g.ledger).toHaveLength(1);
});
it('manual selection add/remove invalidates approval; all redactions removed cannot be approved',()=>{const g=manual();g.approve();const r=g.currentRevision;g.removeSpan(0);expect(g.currentRevision).toBeGreaterThan(r);expect(g.phase).toBe('review');g.edit([]);expect(()=>g.approve()).toThrow('Unredacted original');expect(()=>g.removeSpan(-1)).toThrow();});
it('manual review invalidates in-flight detection and cloud responses',async()=>{const g=manual();let finish!:(s:never[])=>void;const p=g.detect(()=>new Promise(r=>finish=r));g.manual([]);finish([]);await expect(p).rejects.toThrow('changed');expect(g.phase).toBe('review');});
it('uses semantic recipient not first name token; rejects reversed reply addressee and signature',()=>{
 const letter='From [NAME_1]\nDear [NAME_2],\nContact [EMAIL_3].';expect(inferRoles(letter)).toEqual({sender:null,recipient:'[NAME_2]'});expect(replyEnvelope(letter).signature).toBe('[NAME_2]');expect(()=>validateDraftRoles('Dear [NAME_2],\nHi',letter)).toThrow('addressee');expect(()=>validateDraftRoles('Dear sender,\nHi\nKind regards,\n[NAME_1]',letter)).toThrow('signature');expect(()=>replyEnvelope(letter,{recipient:'[NAME_99]',sender:null})).toThrow();
});
it('validates exact original offsets, downgrades fabricated evidence, never exposes private evidence',()=>{
 const claims=claimsFromJourney(j);const quote='Please pay £25 by 30 November 2026';const start=raw.indexOf(quote);const checks=claims.map(c=>({id:c.id,status:'supported',evidence:[{start,end:start+quote.length,quote}]}));
 const good=parseVerification(JSON.stringify({checks}),raw,claims);expect(good.status).toBe('supported');expect(good.coverage).toEqual({scope:'submitted-claims',claimCount:claims.length,uncheckedFields:[]});expect(JSON.stringify(good)).not.toContain(quote);checks[0].evidence[0].start++;expect(parseVerification(JSON.stringify({checks}),raw,claims).status).toBe('unknown');checks[0].status='mismatch';checks[0].evidence[0].start--;expect(parseVerification(JSON.stringify({checks}),raw,claims).status).toBe('mismatch');
});
it('rejects omitted, duplicate and invented claim ids',()=>{const claims=claimsFromJourney(j);for(const checks of [[],claims.map(()=>({id:claims[0].id,status:'unknown',evidence:[]})),claims.map(c=>({id:'invented-'+c.id,status:'unknown',evidence:[]}))])expect(()=>parseVerification(JSON.stringify({checks}),raw,claims)).toThrow();});
it('two-key binds unchanged accepted answer, reports mismatch, strips evidence, never calls a cloud transport',async()=>{
 const g=await answered();const verify=vi.fn(async(original:string,claims:ReturnType<typeof claimsFromJourney>)=>JSON.stringify({checks:claims.map(c=>({id:c.id,status:'mismatch',evidence:[{start:0,end:4,quote:original.slice(0,4)}]}))}));const nano={answer:vi.fn(),verify};const result=await runTwoKey(g,nano,j);expect(result.status).toBe('complete');if(result.status==='complete'){expect(result.result.status).toBe('mismatch');expect(JSON.stringify(result)).not.toContain('Dear');}expect(verify).toHaveBeenCalledTimes(1);await expect(runTwoKey(g,nano,{...j,actions:['Invented']})).rejects.toThrow('unchanged');g.load('replacement');await expect(runTwoKey(g,nano,j)).rejects.toThrow('Current approved');expect(verify).toHaveBeenCalledTimes(1);
});
it('local unavailable/error never egresses or echoes provider errors or original',async()=>{const g=manual(),fetch=vi.spyOn(globalThis,'fetch');expect((await runLocalAnswer(g,null)).status).toBe('unavailable');expect((await runTwoKey(g,null,j)).status).toBe('unavailable');const nano={answer:vi.fn(async()=>{throw Error(raw)}),verify:vi.fn()};const result=await runLocalAnswer(g,nano);expect(result.status).toBe('unavailable');expect(JSON.stringify(result)).not.toContain('Rowan');expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();});
it('local answer redacts known private values and discards stale results',async()=>{const g=manual();const nano={answer:vi.fn(async()=>JSON.stringify({...j,explanation:'Hello Rowan Invented'})),verify:vi.fn()};const result=await runLocalAnswer(g,nano);expect(JSON.stringify(result)).not.toContain('Rowan Invented');let finish!:(s:string)=>void;const p=runLocalAnswer(g,{...nano,answer:()=>new Promise(r=>finish=r)});g.load('replacement');finish(JSON.stringify(j));await expect(p).rejects.toThrow('changed');});
it('accepted answer snapshots cannot be mutated to authorize changed verification',async()=>{const g=await answered();const x=reviewedJourney(g);x.redacted.actions[0]='forged';expect(reviewedJourney(g).redacted.actions[0]).toBe('Pay £25');});

it('newer local operation invalidates an earlier response even for an unchanged source revision',async()=>{
 const g=manual();let finish!:(s:string)=>void;const old=runLocalAnswer(g,{answer:()=>new Promise(r=>finish=r),verify:vi.fn()});await runLocalAnswer(g,null);finish(JSON.stringify(j));await expect(old).rejects.toThrow('newer operation');
});
it('source edits discard an in-flight two-key response',async()=>{
 const g=await answered();let finish!:(s:string)=>void;const pending=runTwoKey(g,{answer:vi.fn(),verify:()=>new Promise(r=>finish=r)},j);g.load('new synthetic letter');finish('{"checks":[]}');await expect(pending).rejects.toThrow('changed');
});
it('unknown/unsupported are explicit outcomes, and unrelated dates/amount evidence cannot be called supported',()=>{
 const claims=claimsFromJourney(j);const checks=claims.map(c=>({id:c.id,status:'supported',evidence:[{start:0,end:4,quote:'Dear'}]}));expect(parseVerification(JSON.stringify({checks}),raw,claims).status).toBe('unknown');checks.forEach(c=>c.status='unsupported');expect(parseVerification(JSON.stringify({checks}),raw,claims).status).toBe('unsupported');checks.forEach(c=>c.status='unknown');expect(parseVerification(JSON.stringify({checks}),raw,claims).status).toBe('unknown');
});

it('submits complete explanation and draft, including written-out amounts; omitted fields cannot earn support',async()=>{
 const altered={...j,explanation:'You have been evicted and must leave tomorrow.',draft:'Dear sender,\nI admit owing ten thousand pounds.\nKind regards,\n[NAME_1]'};
 const g=manual();g.approve();await mockAcceptedCloudJourney(g,altered);
 const verify=vi.fn(async(original:string,claims:ReturnType<typeof claimsFromJourney>)=>JSON.stringify({checks:claims.map(c=>({id:c.id,status:c.kind==='explanation'||c.kind==='draft'?'unsupported':'supported',evidence:[{start:0,end:4,quote:original.slice(0,4)}]}))}));
 const result=await runTwoKey(g,{answer:vi.fn(),verify},altered);
 const claims=verify.mock.calls[0][1];expect(claims).toContainEqual({id:'explanation',kind:'explanation',value:altered.explanation});expect(claims.find(c=>c.kind==='draft')?.value).toContain('ten thousand pounds');
 expect(result.status==='complete'&&result.result.status).toBe('unsupported');
 const subset=claims.filter(c=>c.kind==='action');const checks=subset.map(c=>({id:c.id,status:'supported',evidence:[{start:0,end:4,quote:'Dear'}]}));
 const partial=parseVerification(JSON.stringify({checks}),raw,subset);expect(partial.status).toBe('unknown');expect(partial.coverage.uncheckedFields).toEqual(['explanation','draft']);
});
it('generic transports cannot become the cloud key even when labelled gemini',async()=>{
 const g=manual();g.approve();await runJourney(g,async()=>JSON.stringify(j),'gemini-3.5-flash-lite');
 const verify=vi.fn();await expect(runTwoKey(g,{answer:vi.fn(),verify},j)).rejects.toThrow('cloud response');expect(verify).not.toHaveBeenCalled();
});
it('requires a recognized canonical greeting and signoff; rejects alternate-envelope role bypasses',()=>{
 const letter='Dear [NAME_1],\nContact [NAME_2].';
 for(const draft of ['Hello [NAME_1],\nReply.\nBest wishes,\n[NAME_2]','Dear sender,\nReply.\nBest wishes,\n[NAME_2]','Dear sender,\nReply.','Dear sender,\nReply.\nKind regards,\n[NAME_1]\nPS: From [NAME_2]'])expect(()=>validateDraftRoles(draft,letter)).toThrow();
 expect(()=>validateDraftRoles('Dear sender,\nReply.\nKind regards,\n[NAME_1]',letter)).not.toThrow();
});
