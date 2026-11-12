// Synthetic protocol/module tests, not cloud or Nano inference.
import {it,expect,vi,afterEach} from 'vitest';
import {PrivacyGate} from '../src/privacy';
import {CloudHandoff,validateAcceptedHandoff} from '../src/handoff-client';
import {runJourney,runCloudJourney,reviewedJourney,reviewedCloudJourney,syntheticTransport} from '../src/journey';
import {runTwoKey} from '../src/hybrid';
import {letters} from '../src/fixtures';
import {mockAcceptedCloudJourney} from './mock-cloud-journey';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
function fixture(){const g=new PrivacyGate();g.load(letters[0].text);g.manual(letters[0].truth);g.approve();return g;}
it('refuses an actual local template as a two-key cloud provenance even with cloud model label',async()=>{
 const g=fixture();await runJourney(g,syntheticTransport,'gemini-3.5-flash-lite');const j=reviewedJourney(g).redacted,verify=vi.fn();
 expect(()=>reviewedCloudJourney(g)).toThrow('cloud response');await expect(runTwoKey(g,{answer:vi.fn(),verify},j)).rejects.toThrow('cloud response');expect(verify).not.toHaveBeenCalled();
});
it('monkeypatched send cannot brand a fake cloud answer',async()=>{
 const g=fixture(),client=new CloudHandoff(),payload=g.applicationPreview;
 const response=await syntheticTransport(payload);vi.spyOn(client,'send').mockResolvedValue(response);
 await expect(runCloudJourney(g,client)).rejects.toThrow('Validated cloud handoff');
 expect(validateAcceptedHandoff(client,payload,g.currentRevision,response)).toBe(false);expect(()=>reviewedCloudJourney(g)).toThrow('cloud response');
});
it('production protocol acceptance brands a response; source edits revoke the journey key',async()=>{
 const template=fixture(),payload=template.applicationPreview,j=JSON.parse(await syntheticTransport(payload));
 const g=fixture();const {handoff}=await mockAcceptedCloudJourney(g,j);
 expect(validateAcceptedHandoff(handoff,payload,g.currentRevision,JSON.stringify(j))).toBe(true);
 expect(reviewedCloudJourney(g).redacted).toEqual(j);
 const copied=new CloudHandoff();copied.ledger.push(...handoff.ledger);vi.spyOn(copied,'send').mockResolvedValue(JSON.stringify(j));
 await expect(runCloudJourney(fixture(),copied)).rejects.toThrow('Validated cloud handoff');
 g.load('new synthetic source');expect(()=>reviewedCloudJourney(g)).toThrow('cloud response');
});

it('replaying an older accepted tuple through monkeypatched send cannot establish a fresh cloud key',async()=>{
 const g=fixture(),j=JSON.parse(await syntheticTransport(g.applicationPreview));const {handoff}=await mockAcceptedCloudJourney(g,j);
 const next=fixture();expect(next.currentRevision).toBe(g.currentRevision);expect(next.applicationPreview).toBe(g.applicationPreview);
 vi.spyOn(handoff,'send').mockResolvedValue(JSON.stringify(j));
 await expect(runCloudJourney(next,handoff)).rejects.toThrow('Validated cloud handoff');expect(()=>reviewedCloudJourney(next)).toThrow('cloud response');
});
