import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LIMITS,ORIGIN,pageRequestAllowed,validateReceipt} from './ci.mjs';
test('TEST_ONLY wiring: manual free Ubuntu single job and bounded harvesting',async()=>{
 const workflow=await readFile('.github/workflows/nano-evaluation.yml','utf8');
 assert.match(workflow,/workflow_dispatch:/);assert.doesNotMatch(workflow,/push:|pull_request:|schedule:|matrix:|windows|larger|gpu-latest/);
 for(const text of ['runs-on: ubuntu-latest','max-parallel: 1','timeout-minutes: 60','github.event.repository.private == false','persist-credentials: false','include-hidden-files: true','if: always()','xvfb-run -a node operator/device-eval/ci.mjs'])assert(workflow.includes(text));
 assert.equal(LIMITS.initializationMs,900000);assert.equal(LIMITS.callMs,60000);assert.equal(LIMITS.totalMs,2700000);assert.equal(LIMITS.snapshotMs,30000);
 const ci=await readFile('operator/device-eval/ci.mjs','utf8');
 for(const text of ["launchNative(chromium,variant)","variantConfig({NANO_CHANNEL:'stable'})","page.locator('#start').click","page.waitForEvent('download'","download.saveAs(path)","page.locator('#stop').click","captureDiagnostics(context,out,'before')","captureDiagnostics(context,out,'after')","createServer(staticHandler())"])assert(ci.includes(text),text);
 for(const forbidden of ['launchPersistentContext','addInitScript','exposeFunction','.fulfill(','LanguageModel =','.prompt(','.generateContent(','.initializeDeviceModel(','fetch('])assert(!ci.includes(forbidden),forbidden);
 const core=await readFile('operator/device-eval/core.ts','utf8');assert(core.includes('initializationTimeoutMs??900000'));assert(core.includes('callTimeoutMs??60000'));
 const native=await readFile('scripts/nano-ci/native-chrome.mjs','utf8');assert(native.includes('22*1024**3'));assert(native.includes('connectOverCDP'));
});
test('TEST_ONLY network allows only collector origin and local blobs/data',()=>{
 assert.equal(ORIGIN,'http://127.0.0.1:5192');for(const u of [ORIGIN+'/',ORIGIN+'/assets/test.js','blob:'+ORIGIN+'/fake','data:text/plain,synthetic'])assert(pageRequestAllowed(u));
 for(const u of ['https://firebase.googleapis.com/','https://evil.invalid/','http://127.0.0.1:5193/','http://localhost:5192/'])assert(!pageRequestAllowed(u));
});
test('TEST_ONLY validation keeps unknown/error/partial distinct; not model evidence',()=>{
 const r={provenance:'REAL_ON_DEVICE',source:{commit:'TEST_ONLY'},initialization:{status:'success'},detectors:Array.from({length:32},()=>({status:'success'})),verifiers:Array.from({length:128},()=>({status:'rejected'})),coverage:{detectors:{planned:32},verifiers:{planned:128}}};
 assert(validateReceipt(r));for(const status of ['unknown','error','timeout','aborted','not_run']){const x=structuredClone(r);x.verifiers[0].status=status;assert(!validateReceipt(x));}
 assert.throws(()=>validateReceipt({...r,provenance:'TEST_ONLY'}));assert.throws(()=>validateReceipt({...r,detectors:[]}));assert(!validateReceipt({provenance:'NOT_RUN',source:r.source,initialization:{status:'error'}}));
});
