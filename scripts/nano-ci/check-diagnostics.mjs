import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sanitize,captureDiagnostics} from './diagnostics.mjs';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
test('sanitizer removes URLs, paths and supplied secret shapes',()=>{
 const result=sanitize('https://example.test/path?token=CANARY /home/runner/profile C:\Users\runner\profile person@example.test token=CANARY password: CANARY');
 assert(!result.includes('CANARY'));assert(!result.includes('person@'));assert(!result.includes('runner'));assert(result.includes('https://example.test/[path-redacted]'));
});
function fixture({alreadyEnabled=false,blocked=false,emptyBroker=false,badEvents=false}={}){
 const state={enabled:alreadyEnabled,clicks:[],closed:0,deleted:0,urls:[]};
 const locator=selector=>({
  waitFor:async()=>{if(blocked||emptyBroker&&selector==='td.property-name')throw Error('content unavailable token=CANARY');},
  first(){return this;},locator,
  count:async()=>0,
  evaluate:async()=>selector==='on-device-internals-broker-state'?'Broker Properties Device Capable false Manifest Criteria Use Cases Unavailable Reason token=CANARY /home/runner/profile':selector==='on-device-internals-event-log'?(badEvents?'Event Logs':'Event Logs Source Location Log Message'):'diagnostic token=CANARY',
 });
 const context={newPage:async()=>({goto:async u=>state.urls.push(u),waitForTimeout:async()=>{},locator,
  getByRole:(role,{name,exact})=>{assert.equal(exact,true);return {
   count:async()=>name==='Disable internal debugging pages'&&state.enabled?1:0,
   waitFor:async()=>{assert(state.enabled);},
   click:async()=>{assert(['Enable internal debugging pages','Broker State','Event Logs'].includes(name));state.clicks.push(name);if(name==='Enable internal debugging pages')state.enabled=true;},
  };},video:()=>({delete:async()=>state.deleted++}),close:async()=>state.closed++,
 })};return {context,state};
}
async function capture(options,check){
 const out=await mkdtemp(resolve('.openclaw-diagnostics-test-'));const {context,state}=fixture(options);
 try{const records=await captureDiagnostics(context,out,'test');assert.equal(records.length,4);assert.equal(state.closed,4);assert.equal(state.deleted,4);assert(!(await readFile(resolve(out,'diagnostics-test.json'),'utf8')).includes('CANARY'));await check(records[0],state);}finally{await rm(out,{recursive:true});}
}
test('enable debug pages before capture; keep broker and events separate, sanitize, delete raw video',()=>capture({},(entry,state)=>{
 assert.deepEqual(state.urls.slice(0,2),['chrome://chrome-urls/','chrome://on-device-internals/']);
 assert.deepEqual(state.clicks,['Enable internal debugging pages','Broker State','Event Logs']);
 assert.equal(entry.status,'CAPTURED');assert(entry.brokerInspected);
 assert(entry.brokerState.text.includes('Device Capable false'));assert(!entry.brokerState.text.includes('Log Message'));
 assert(entry.eventLogs.text.includes('Log Message'));assert.equal(entry.eventLogs.rowCount,0);
}));
test('already-enabled debug pages are never toggled off',()=>capture({alreadyEnabled:true},(entry,state)=>{
 assert.equal(entry.debugPages.status,'already-enabled');assert.deepEqual(state.clicks,['Broker State','Event Logs']);
}));
test('blocked debug page is explicitly not broker inspection',()=>capture({blocked:true},(entry,state)=>{
 assert.equal(entry.status,'PAGE_UNAVAILABLE');assert.equal(entry.brokerInspected,false);assert.equal(entry.brokerState.inspected,false);assert.equal(entry.eventLogs.inspected,false);assert.equal(entry.debugPages.status,'PAGE_UNAVAILABLE');assert.deepEqual(state.clicks,[]);
}));
test('empty broker shell is not inspection, event capture still attempted',()=>capture({emptyBroker:true},entry=>{
 assert.equal(entry.status,'PAGE_UNAVAILABLE');assert.equal(entry.brokerInspected,false);assert.equal(entry.brokerState.inspected,false);assert.equal(entry.eventLogs.status,'CAPTURED');
}));
test('event headings alone cannot masquerade as complete capture',()=>capture({badEvents:true},entry=>{
 assert.equal(entry.status,'PAGE_UNAVAILABLE');assert.equal(entry.brokerInspected,true);assert.equal(entry.brokerState.status,'CAPTURED');assert.equal(entry.eventLogs.inspected,false);
}));

test('command inspection falls back without changing automation flags',async()=>{
 const {readEffectiveArgs}=await import('./diagnostics.mjs');let closed=false,deleted=false;
 const context={newPage:async()=>({goto:async()=>{},locator:()=>({textContent:async()=> 'chrome --enable-features=AIPromptAPI --no-sandbox'}),close:async()=>{closed=true;},video:()=>({delete:async()=>{deleted=true;}})})};
 const result=await readEffectiveArgs(context,{send:async()=>{throw Error('enable-automation not set');}});
 assert.equal(result.source,'chrome://version');assert(result.arguments.includes('--no-sandbox'));assert(closed&&deleted);
});
