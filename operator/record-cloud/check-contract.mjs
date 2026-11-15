import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('cloud capture only uploads authenticated ciphertext, never plaintext or credentials',async()=>{
 const w=await readFile(new URL('../../.github/workflows/record-desktop-cloud.yml',import.meta.url),'utf8');
 for(const text of ['runs-on: ubuntu-latest','timeout-minutes: 10','persist-credentials: false','capture.aes256gcm','retention-days: 2'])assert.ok(w.includes(text),text);
 assert.ok(!w.includes('path: .openclaw/tmp/record-cloud-private'));
 const e=await readFile(new URL('encrypt.mjs',import.meta.url),'utf8');
 assert.ok(e.includes('aes-256-gcm'));assert.ok(e.includes('getAuthTag'));
});
test('genuine headed sandboxed recording does not replace provider, local model or response',async()=>{
 const s=await readFile(new URL('run.mjs',import.meta.url),'utf8');
 for(const text of ['headless:false','chromiumSandbox:true','if(![RAW,BROKER].includes(u.origin))return route.continue','providerPosts[0].body===report.ledger[0].body','revisionInvalidates',"normalProductionAttestation:'NOT_PROVEN'","console.log('::add-mask::'+secret.token)"])assert.ok(s.includes(text),text);
 assert.ok(!s.includes('--no-sandbox'));assert.ok(!s.includes(".on('console'"));
});
