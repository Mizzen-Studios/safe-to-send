import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sanitize,captureDiagnostics} from './diagnostics.mjs';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
test('sanitizer removes URLs, paths and supplied secret shapes',()=>{
 const result=sanitize('https://example.test/path?token=CANARY /home/runner/profile C:\Users\runner\profile person@example.test token=CANARY password: CANARY');
 assert(!result.includes('CANARY'));assert(!result.includes('person@'));assert(!result.includes('runner'));assert(result.includes('https://example.test/[path-redacted]'));
});
test('read-only capture persists sanitized output, deletes raw WebUI video',async()=>{
 const out=await mkdtemp(resolve('.openclaw-diagnostics-test-'));let closed=0,deleted=0,clicks=0;
 const context={newPage:async()=>({goto:async()=>{},waitForTimeout:async()=>{},locator:()=>({waitFor:async()=>{}}),getByRole:()=>({count:async()=>1,click:async()=>{clicks++;}}),evaluate:async()=> 'Broker unavailable token=CANARY /home/runner/profile',video:()=>({delete:async()=>{deleted++;}}),close:async()=>{closed++;}})};
 try{const records=await captureDiagnostics(context,out,'test');assert.equal(records.length,4);assert.equal(closed,4);assert.equal(deleted,4);assert.equal(clicks,2);assert(!(await readFile(resolve(out,'diagnostics-test.json'),'utf8')).includes('CANARY'));}finally{await rm(out,{recursive:true});}
});
