import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parseVerification} from '../src/hybrid';
import {partialTextDetection} from '../src/nano';
const path='docs/evidence/fixed-eval-43716506683/receipt.json';
const bytes=readFileSync(path),r=JSON.parse(bytes.toString());
it('keeps the genuine receipt immutable and its model-MATCH planted deadline independently contradicted',()=>{
 expect(createHash('sha256').update(bytes).digest('hex')).toBe('45c997d36bacf68da3104bd4f5fe128f8a2abff8db9baa41f1f10d6fdf90ca52');
 const row=r.verifiers.find((v:any)=>v.trialId==='trial-021');
 const prompt=row.capture.nativeCalls.find((c:any)=>c.operation==='prompt').input[0].content[0].value;
 const data=JSON.parse(prompt.split('\n').at(-1));
 expect(JSON.parse(row.capture.rawOutputs[0]).checks[0].status).toBe('MATCH');
 expect(parseVerification(row.rawJson,data.original,data.claims).checks).toEqual(row.checks);
 expect(row.checks[0].status).toBe('mismatch');expect(row.status).toBe('rejected');
 const partial=r.detectors.find((v:any)=>v.invalidFindings);const input=partial.capture.nativeCalls.find((c:any)=>c.operation==='prompt').input[0].content[0].value;
 expect(partialTextDetection(partial.rawJson,JSON.parse(input.split('\n').at(-1)).original).invalidFindings).toBe(1);
 expect(r.coverage.verifiers).toMatchObject({planned:128,accepted:2,rejected:1,unknown:125,error:0,timeout:0,not_run:0});
});
it('labels the legacy one-decided-mutation rate as subset-only, preserves all unresolved denominator counts',()=>{
 const x=JSON.parse(execFileSync(process.execPath,['scripts/evaluate.mjs','import',path],{encoding:'utf8'}));
 expect(x.twoKeyModelCatchRateScope).toBe('DECIDED_SUBSET_ONLY_NOT_FULL_CORPUS_ACCURACY');
 expect(x.twoKey).toMatchObject({caught:1,mutations:1,controls:2,falseAlarms:0,plannedMutations:96,plannedControls:32,undecidedOrUnavailableMutations:95,undecidedOrUnavailableControls:30,observedCaughtOverPlanned:1/96});
},15000);
