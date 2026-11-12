/// <reference types="node" />
import {it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {evalCorpus,regexEvaluation} from '../src/eval-corpus';
function verify(r:any){
 expect(r.status).toBe('MEASURED_REGEX_ONLY');expect(r.method.warmupIterations).toBe(100);expect(r.method.measuredIterations).toBe(500);expect(r.method.detectorCalls).toBe(16000);
 expect(r.corpusSha256).toBe(createHash('sha256').update(JSON.stringify(evalCorpus)).digest('hex'));
 expect(r.perLetter.map((l:any)=>l.id)).toEqual(evalCorpus.map(l=>l.id));
 for(const stats of [r.timing.perCall,r.timing.perCorpusPass,...r.perLetter]){expect(stats.p50Ms).toBeGreaterThanOrEqual(0);expect(stats.p95Ms).toBeGreaterThanOrEqual(stats.p50Ms);}
 expect(r.timing.perCall.samples).toBe(16000);expect(r.timing.perCorpusPass.samples).toBe(500);for(const l of r.perLetter)expect(l.samples).toBe(500);
 expect(r.timing.wallTotalMs).toBeGreaterThanOrEqual(r.timing.measuredDetectorTotalMs);expect(r.timing.meanPerLetterMs).toBeCloseTo(r.timing.measuredDetectorTotalMs/16000,12);
 expect(r.accuracy).toEqual(regexEvaluation());expect(r.nanoLatency).toBe('NOT_RUN');expect(r.combinedLatency).toBe('NOT_RUN');expect(r.twoKeyModelCatchRate).toBe('NOT_RUN');expect(r.environment.browser).toBe('NOT_APPLICABLE_NODE');
}
it('validates the actual committed benchmark receipt without speed thresholds',()=>{verify(JSON.parse(readFileSync('docs/evidence/regex-benchmark.json','utf8')));});
it('runs the bounded offline benchmark and keeps accuracy/model statuses unchanged',()=>{verify(JSON.parse(execFileSync(process.execPath,['scripts/evaluate.mjs','benchmark'],{encoding:'utf8',timeout:15000})));});
