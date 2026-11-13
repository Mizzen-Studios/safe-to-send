import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseTextDetection,validateQuoteVerification} from '../src/nano';
import type {Claim} from '../src/hybrid';
it('preserves actual council hallucination and verifier evidence errors, without repairing the receipt',()=>{
 const bytes=readFileSync(new URL('../docs/evidence/quote-eval-43348904459/receipt.json',import.meta.url));
 expect(createHash('sha256').update(bytes).digest('hex')).toBe('05c78db27a2fa6c9f9e2a194ccd004395fa13cf93849ad73c2705068e3966b60');
 const receipt=JSON.parse(bytes.toString());
 const detector=receipt.detectors.find((d:{id:string})=>d.id==='council-03');
 const detectorCall=detector.capture.nativeCalls.find((c:{operation:string})=>c.operation==='prompt');
 const input=detectorCall.input[0].content[0].value as string;
 const source=JSON.parse(input.slice(input.lastIndexOf('\n')+1)).original;
 expect(()=>parseTextDetection(detector.capture.rawOutputs[0],source)).toThrow('absent');
 for(const id of ['hmrc-02','nhs-05','tenancy-04']){
  const trial=receipt.verifiers.find((v:{id:string;status:string})=>v.id===id&&v.status==='error');
  const calls=trial.capture.nativeCalls.filter((c:{operation:string})=>c.operation==='prompt');
  const call=calls[calls.length-1];const prompt=call.input[0].content[0].value as string;
  const data=JSON.parse(prompt.slice(prompt.lastIndexOf('\n')+1)) as {original:string;claims:Claim[]};
  expect(()=>validateQuoteVerification(trial.capture.rawOutputs.at(-1),data.original,data.claims)).toThrow('absent');
 }
});
