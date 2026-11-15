import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const workflow=read('.github/workflows/emulator-cloud-demo.yml'), runner=read('android/scripts/emulator-cloud-record.py');
test('runtime token is not a compile argument or artifact path',()=>{
 assert.ok(workflow.indexOf('assembleRelease')<workflow.indexOf('SAFE_SEND_EMULATOR_DEBUG_TOKEN'));
 const artifacts=workflow.split('path: |')[1];
 assert.ok(artifacts.includes('receipt.json')); assert.ok(artifacts.includes('labelled-emulator.mp4'));
 for(const forbidden of ['.apk','reports','logcat','shared_prefs']) assert.ok(!artifacts.includes(forbidden));
 assert.ok(runner.includes("os.environ.pop('SAFE_SEND_EMULATOR_DEBUG_TOKEN')"));
 assert.ok(runner.includes('input=xml')); assert.ok(!runner.includes('print(token'));
 assert.ok(runner.includes("adb('logcat','-c')")); assert.ok(runner.includes("adb('shell','pm','clear',app)"));
});
test('actual cloud harness cannot silently substitute fixtures or local review success',()=>{
 const source=read('android/app/src/androidTest/java/com/mizzen/safetosend/EmulatorCloudTest.kt');
 for(const text of ['FirebaseProvider()','getAppCheckToken(false)','exactApprovedApplicationText','UNAVAILABLE_EMULATOR_NO_NANO_PROOF','IN_CLOUD.toString()','assertNotNull(vm.privacy.currentAnswer())']) assert.ok(source.includes(text));
 assert.ok(!source.includes('TestOnlyProvider()'));
 assert.ok(workflow.includes('NOT HTTP or production attestation'));
});
test('canary proof precedes secret read and guard observes live unfiltered buffers',()=>{
 assert.ok(runner.indexOf("instrument('EmulatorLoggingTest',")<runner.indexOf("os.environ.pop('SAFE_SEND_EMULATOR_DEBUG_TOKEN')"));
 for(const text of ["'persist.log.tag.'","'ERROR'","'logcat','-d','-b','all'","PUBLIC_LOG_BUFFER_LIVENESS_CANARY","assert canary.encode() not in logs","assert not sdk_secret_log_detected"]) assert.ok(runner.includes(text));
 assert.ok(workflow.includes('default: true'));
});
