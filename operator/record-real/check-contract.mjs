// TEST_ONLY selector contract: this fake never enters the product build or runner.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {journey,allowed,LIMITS,DEVICE_CONFIG} from './run.mjs';
test('TEST_ONLY fake exercises the automation contract, never proves inference',async()=>{
 const clicks=[],checks=[];const fake={locator(selector){return {scrollIntoViewIfNeeded:async()=>{},inputValue:async()=>selector==='#letter'?'Maya Fiction / 21 Imaginary Lane / ZZ1 1ZZ / AB123456C / UTR 1234567890':'A local draft',evaluate:async()=>true,click:async()=>{clicks.push(selector);},check:async()=>{checks.push(selector);},isDisabled:async()=>true,isEnabled:async()=>true,count:async()=>selector==='#two-key'?0:3,textContent:async()=> '0 cloud handoff attempts · 0 captured SDK HTTP bodies',innerText:async()=>selector==='#payload'?JSON.stringify({letter:'Dear [NAME_1]'}):'0 cloud handoff attempts · 0 captured SDK HTTP bodies'};},waitForFunction:async()=>{}};
 const steps=[];await journey(fake,async(name,fn)=>{steps.push(name);await fn();});assert.equal(steps.length,7);assert.deepEqual(clicks,['#detect','#approve','#local-answer']);assert.deepEqual(checks,['#synthetic-confirm','#review-confirm']);
});
test('network policy and timing fail closed',()=>{
 for(const u of ['http://127.0.0.1:5192/','http://127.0.0.1:5192/assets/x.js','data:text/plain,x','blob:http://127.0.0.1:5192/id'])assert(allowed(u));
 for(const u of ['https://firebasevertexai.googleapis.com/','https://safe-to-send-cloud-2026.web.app/','http://127.0.0.1:5193/'])assert(!allowed(u));assert.equal(LIMITS.takeMs,175000);assert.equal(LIMITS.prewarmMs,900000);assert.match(DEVICE_CONFIG.apiKey,/not-a-credential/);
});
test('unchanged product selectors, union and local route remain the real path',async()=>{
 const main=await readFile('src/main.ts','utf8'),nano=await readFile('src/nano.ts','utf8'),run=await readFile('operator/record-real/run.mjs','utf8');
 for(const id of ['detect','letter','review','payload','approve','synthetic-confirm','review-confirm','local-answer','journey','draft','cloud-count'])assert(main.includes(id));
 assert(main.includes('...r.spans,...regexSpans(text)'));assert(main.includes('await runLocalAnswer(gate,nanoReady&&nano?nano:null)'));assert(nano.includes('async answer(original:string)'));assert(nano.includes('InferenceMode.ONLY_ON_DEVICE'));assert(nano.includes('InferenceSource.ON_DEVICE'));
 for(const forbidden of ['chromium.launch(','addInitScript','syntheticTransport','TEST_ONLY','SAFE_TO_SEND_BROKER_CONFIG','launchPersistentContext'])assert(!run.includes(forbidden));assert(run.includes('envDir:false'));assert(run.includes('launchNative(chromium,variant)'));assert(run.includes("'-f','x11grab'"));assert(run.includes("'Page.startScreencast'"));
});
test('manual workflow remains bounded, free and profile-free',async()=>{
 const w=await readFile('.github/workflows/record-real-local.yml','utf8');for(const fragment of ['workflow_dispatch:','runs-on: ubuntu-latest','timeout-minutes: 30','max-parallel: 1','persist-credentials: false','cancel-in-progress: false'])assert(w.includes(fragment));assert(!w.includes('secrets.'));assert(!w.includes('record-real-profile/'));assert(!w.includes('push:'));assert(!w.includes('pull_request:'));
});

test('TEST_ONLY recording visibly selects missed details rather than faking detector output',async()=>{
 const {reviewMisses,SAMPLE_PRIVATE_VALUES}=await import('./run.mjs');
 const text=SAMPLE_PRIVATE_VALUES.join(' / ');let payload=text,selection;const selected=[];
 const fake={waitForTimeout:async()=>{},locator(selector){return {scrollIntoViewIfNeeded:async()=>{},inputValue:async()=>text,innerText:async()=>JSON.stringify({letter:payload}),evaluate:async(fn,range)=>{selection=range;}};},getByRole(role,options){assert.equal(options.name,'Add selected redaction');return {click:async()=>{const value=text.slice(selection.start,selection.end);selected.push(value);payload=payload.replace(value,'[MANUALLY_REDACTED]');}};}};
 await reviewMisses(fake);assert.deepEqual(selected,SAMPLE_PRIVATE_VALUES);
 for(const value of SAMPLE_PRIVATE_VALUES)assert(!payload.includes(value));
});
