import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {variantConfig} from './variants.mjs';
const env={PROGRAMFILES:'C:/Program Files',LOCALAPPDATA:'C:/Users/runner/AppData/Local'};
test('five native combinations and separate diagnostic have isolated profiles',()=>{
 const variants=[['linux','stable'],['linux','dev'],['win32','stable'],['win32','dev'],['win32','canary']].map(([p,c])=>variantConfig({...env,NANO_CHANNEL:c},p));
 for(const v of variants){assert(!v.flags.join().includes('BypassPerf'));assert(!v.diagnostic);assert.equal(v.normalEligibilityAttested,false);}
 assert.match(variants[4].executable,/Chrome SxS/);
 assert.throws(()=>variantConfig({NANO_CHANNEL:'canary'},'linux'));
 const d=variantConfig({...env,NANO_DIAGNOSTIC:'requested-perf-bypass'},'win32');assert(d.flags[0].includes('OptimizationGuideOnDeviceModel:BypassPerfRequirement/true,PromptAPIForGeminiNano'));assert(d.profile!==variants[2].profile);assert.match(d.flagSupport,/UNVERIFIED/);
});
test('bounded six-job workflow, native launch and privacy controls stay intact',async()=>{
 const workflow=await readFile('.github/workflows/nano-probe.yml','utf8');assert.equal((workflow.match(/- {os:/g)||[]).length,6);assert.match(workflow,/max-parallel: 2/);assert.match(workflow,/timeout-minutes: 25/);assert(!workflow.includes('playwright/cli.js install'));
 const probe=await readFile('scripts/nano-ci/probe.mjs','utf8');assert(!probe.includes('launchPersistentContext'));assert.match(probe,/connect-src data:/);assert(probe.includes("route.abort('blockedbyclient')"));
 const native=await readFile('scripts/nano-ci/native-chrome.mjs','utf8');assert(native.includes('22*1024**3'));assert.match(native,/connectOverCDP/);
});

test('native CDP endpoint parses Unix and Windows line endings without accepting external endpoints',async()=>{
 const {parseDevToolsEndpoint}=await import('./native-chrome.mjs');
 for(const newline of ['\n','\r\n'])assert.equal(parseDevToolsEndpoint('12345'+newline+'/devtools/browser/abc-123'+newline),'ws://127.0.0.1:12345/devtools/browser/abc-123');
 for(const invalid of ['bad','0\n/devtools/browser/abc','12345\nhttps://evil.invalid'])assert.throws(()=>parseDevToolsEndpoint(invalid));
});
