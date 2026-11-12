import {it,expect,vi} from 'vitest';
import {PrivacyGate,restore} from '../src/privacy';
import {parseJourney,restoreJourney,runJourney,syntheticTransport} from '../src/journey';
import {letters} from '../src/fixtures';
import {cloudTransport} from '../src/cloud';
const example={explanation:'Hello [NAME_1]',deadlines:[{date:'2026-11-30',evidence:'reply by 30 November 2026',action:'Respond'}],actions:['Check [NAME_1]'],draft:'Dear [NAME_1]'};
async function approved(){const g=new PrivacyGate();g.load(letters[0].text);await g.detect(async()=>letters[0].truth);g.approve();return g;}
it('restores all structured text fields, preserving JSON-hostile values locally',()=>{
 const value='Maya "Quote"\n[NI_2] \\';const j=restoreJourney(JSON.stringify(example),{'[NAME_1]':value});
 expect(j.draft).toBe('Dear '+value);expect(j.actions[0]).toBe('Check '+value);expect(j.deadlines[0].date).toBe('2026-11-30');
});
it.each(['[NAME_99]','[name_1]','[NAME_1','NAME_1]','[NAME_ 1]','[NAME_01]'])('rejects unknown or damaged placeholder %s',(token)=>{expect(()=>restore(token,{'[NAME_1]':'Maya'})).toThrow();});
it('handles repeated placeholders and does not recursively expand restored values',()=>{expect(restore('[NAME_1] / [NAME_1]',{'[NAME_1]':'[NI_2]'})).toBe('[NI_2] / [NI_2]');});
it.each(['2026-02-30','tomorrow','2026-1-01',''])('rejects malformed calendar date %s',date=>{expect(()=>parseJourney(JSON.stringify({...example,deadlines:[{...example.deadlines[0],date}]}))).toThrow();});
it('keeps relative deadlines unresolved and rejects unexpected or empty fields',()=>{
 expect(parseJourney(JSON.stringify({...example,deadlines:[{date:null,evidence:'within 14 days',action:'Check the letter date'}]})).deadlines[0].date).toBeNull();
 for(const value of [{...example,extra:'x'},{...example,actions:[]},{...example,explanation:''},{...example,deadlines:[{date:null}]}])expect(()=>parseJourney(JSON.stringify(value))).toThrow();
 expect(()=>parseJourney('x'.repeat(50001))).toThrow('large');
});
it('sends the exact approved payload to synthetic transport and only restores locally',async()=>{
 const g=await approved(),preview=g.applicationPreview;const transport=vi.fn(syntheticTransport);
 const result=await runJourney(g,transport,'synthetic-template');expect(result.draft).toContain('Maya Fiction');
 expect(transport).toHaveBeenCalledWith(preview);expect(preview).not.toContain('Maya Fiction');expect(g.phase).toBe('done');
});
it('requires fresh review after edit, never invokes transport without approval',async()=>{
 const g=await approved(),transport=vi.fn(syntheticTransport);g.edit(g.highlights);await expect(runJourney(g,transport,'mock')).rejects.toThrow('approval');expect(transport).not.toHaveBeenCalled();
});
it('discards an in-flight structured response after letter replacement',async()=>{
 const g=await approved();let finish!:(s:string)=>void;const result=runJourney(g,()=>new Promise(r=>finish=r),'mock');g.load('replacement');finish(JSON.stringify(example));await expect(result).rejects.toThrow('changed');expect(g.phase).toBe('blocked');
});
it('fails closed on response schema or unknown placeholder errors',async()=>{
 for(const response of ['not JSON',JSON.stringify({...example,draft:'[NAME_999]'})]){const g=await approved();await expect(runJourney(g,async()=>response,'mock')).rejects.toThrow();expect(g.phase).toBe('blocked');expect(()=>g.approve()).toThrow();}
});
it('hard-locks cloud before App Check, SDK model construction or fetch',async()=>{
 const fetch=vi.spyOn(globalThis,'fetch');await expect(cloudTransport(null!,null!,'{}')).rejects.toThrow('Cloud locked');expect(fetch).not.toHaveBeenCalled();fetch.mockRestore();
});
