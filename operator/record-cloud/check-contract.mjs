import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('cloud capture only uploads authenticated ciphertext, never plaintext or credentials',async()=>{
 const w=await readFile(new URL('../../.github/workflows/record-desktop-cloud.yml',import.meta.url),'utf8');
 assert.match(w,/runs-on: ubuntu-latest/);assert.match(w,/timeout-minutes: 10/);
 assert.match(w,/persist-credentials: false/);assert.match(w,/capture.aes256gcm/);
 assert.doesNotMatch(w,/path:.*record-cloud-private/);assert.match(w,/retention-days: 2/);
 const e=await readFile(new URL('encrypt.mjs',import.meta.url),'utf8');
 assert.match(e,/aes-256-gcm/);assert.match(e,/getAuthTag/);
});
test('genuine headed sandboxed recording does not replace provider, local model or response',async()=>{
 const s=await readFile(new URL('run.mjs',import.meta.url),'utf8');
 assert.match(s,/headless:false/);assert.match(s,/chromiumSandbox:true/);assert.doesNotMatch(s,/--no-sandbox/);
 assert.match(s,/if(![RAW,BROKER].includes(u.origin))return route.continue/);
 assert.match(s,/providerPosts[0].body===report.ledger[0].body/);
 assert.match(s,/revisionInvalidates/);assert.match(s,/normalProductionAttestation:'NOT_PROVEN'/);
 assert.match(s,/console.log('::add-mask::'+secret.token)/);
 assert.doesNotMatch(s,/.on('console'/);
});
