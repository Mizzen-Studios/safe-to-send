import {expect,it} from 'vitest';
import {evalCorpus,regexEvaluation,characterCounts,mismatchedClaimFields} from '../src/eval-corpus';
import {letters} from '../src/fixtures';
it('keeps UI contracts unchanged and annotates 32 synthetic notices',()=>{
 expect(letters).toHaveLength(5);expect(evalCorpus).toHaveLength(32);expect(new Set(evalCorpus.map(l=>l.id)).size).toBe(32);
 for(const source of ['HMRC','DWP','NHS','Council','Tenancy'])expect(evalCorpus.filter(l=>l.source===source)).toHaveLength(6);
 expect(evalCorpus.some(l=>l.locale!=='en-GB')).toBe(true);
 for(const l of evalCorpus){expect(l.text).toContain('SYNTHETIC');expect(l.text).not.toMatch(/[⟦⟧]/);characterCounts(l.text,l.truth,l.truth);for(const s of l.truth)expect(l.text.slice(s.start,s.end).length).toBeGreaterThan(0);for(const e of l.text.matchAll(/[\w.+-]+@[^\s<>]+/g))expect(e[0]).toContain('example.invalid');}
 expect(evalCorpus.find(l=>l.id==='negative-01')!.truth).toEqual([]);
});
it('merges overlaps, gives partial credit, and rejects invalid offsets',()=>{
 const s=(start:number,end:number)=>({start,end,kind:'NAME'});
 expect(characterCounts('abcdef',[s(1,4)],[s(2,4),s(3,5)])).toEqual({tp:2,actual:3,predicted:3});
 expect(()=>characterCounts('abc',[],[s(-1,2)])).toThrow();
});
it('tests 96 deliberate claim mutations against a deterministic oracle, NOT a model',()=>{
 for(const l of evalCorpus){expect(mismatchedClaimFields(l.claim,l.claim)).toEqual([]);for(const m of l.mutations)expect(mismatchedClaimFields(l.claim,m.claim)).toEqual([m.field]);}
});
it('reports measured regex coverage without inventing model results',()=>{
 const r=regexEvaluation();expect(r.actual).toBeGreaterThan(r.tp);expect(r.predicted).toBeGreaterThan(r.tp);expect(r.nano).toBe('NOT_RUN');expect(r.twoKeyModelCatchRate).toBe('NOT_RUN');console.log('32_LETTER_REGEX',JSON.stringify(r));
});
