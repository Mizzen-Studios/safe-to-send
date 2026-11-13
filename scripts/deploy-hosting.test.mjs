import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,mkdtempSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {spawnSync} from 'node:child_process';
import {parseArgs,validateMetadata,validateTargets} from './deploy-hosting.mjs';
const source='a'.repeat(40),args=['--source',source,'--config','/private/public.json'];
const metadata=()=>({firebase:{projectId:'safe-to-send-2026',appId:'1:794092402064:web:4e263548738bdb75a8af15',apiKey:'AIza'+'x'.repeat(35)},recaptchaEnterpriseSiteKey:'6L'+'x'.repeat(30)});
const read=name=>JSON.parse(readFileSync(new URL('../'+name,import.meta.url)));
test('default plan and explicit execute only',()=>{
 assert.equal(parseArgs(args).execute,false);assert.equal(parseArgs([...args,'--execute']).execute,true);
 for(const bad of [[],['--execute'],[...args,'--yes'],[...args,'--execute','--execute'],['--source','HEAD','--config','x'],[...args,'--config','y']])assert.throws(()=>parseArgs(bad));
});
test('strict public metadata allowlist and project/app identity',()=>{
 validateMetadata(metadata());
 for(const key of ['debugToken','token','secret','FIREBASE_APPCHECK_DEBUG_TOKEN']){
  const c=metadata();c[key]='never-accepted';assert.throws(()=>validateMetadata(c));
  const d=metadata();d.firebase[key]='never-accepted';assert.throws(()=>validateMetadata(d));
 }
 for(const change of [c=>c.firebase.projectId='other',c=>c.firebase.appId='other',c=>c.firebase.apiKey='',c=>c.recaptchaEnterpriseSiteKey='']){const c=metadata();change(c);assert.throws(()=>validateMetadata(c));}
});
test('existing two-site mapping preserved; resource/hooks refused',()=>{
 const rc=read('.firebaserc'),config=read('firebase.json');validateTargets(rc,config);
 for(const change of [c=>c.functions={},c=>c.hosting[0].public='other',c=>c.hosting[0].predeploy=['echo nope'],c=>c.hosting[0].site='other']){const c=structuredClone(config);change(c);assert.throws(()=>validateTargets(rc,c));}
 const wrong=structuredClone(rc);wrong.targets['safe-to-send-2026'].hosting.raw=['other'];assert.throws(()=>validateTargets(wrong,config));
});
test('invalid CLI and wrong source stop offline before deploy',()=>{
 for(const a of [[],['--execute'],['--source','0'.repeat(40),'--config','/missing']]){
  const r=spawnSync(process.execPath,[new URL('./deploy-hosting.mjs',import.meta.url).pathname,...a],{encoding:'utf8',env:{...process.env,PATH:''}});
  assert.equal(r.status,1);assert.match(r.stderr,/Release gate failed/);assert.doesNotMatch(r.stdout,/EXECUTE|Deploy command completed/);
 }
});
test('deploy is after plan return and only pinned Hosting targets',()=>{
 const s=readFileSync(new URL('./deploy-hosting.mjs',import.meta.url),'utf8');
 assert.ok(s.indexOf('if(!opts.execute)')<s.indexOf("run('firebase'"));
 assert.equal(s.split("run('firebase'").length-1,1);
 assert.ok(s.includes("'--only','hosting:raw,hosting:cloud'"));
});

test('clean candidate plan never invokes Firebase: offline fixture gates',()=>{
 const base=resolve('.openclaw/tmp');mkdirSync(base,{recursive:true});const root=mkdtempSync(resolve(base,'release-contract-'));
 mkdirSync(resolve(root,'scripts'));mkdirSync(resolve(root,'bin'));
 copyFileSync(new URL('./deploy-hosting.mjs',import.meta.url),resolve(root,'scripts/deploy-hosting.mjs'));
 for(const name of ['.firebaserc','firebase.json'])copyFileSync(new URL('../'+name,import.meta.url),resolve(root,name));
 writeFileSync(resolve(root,'.gitignore'),['.openclaw/','node_modules/','dist/','dist-cloud/'].join('\n'));
 writeFileSync(resolve(root,'bin/npm'),'#!/bin/sh\nexit 0\n',{mode:0o755});
 writeFileSync(resolve(root,'bin/firebase'),'#!/bin/sh\necho FORBIDDEN_FIREBASE >&2\nexit 99\n',{mode:0o755});
 writeFileSync(resolve(root,'scripts/deploy-hosting.test.mjs'),'// Offline fixture gate only');
 const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'}).toString().trim();
 git('init');git('add','.');git('-c','user.name=Offline test','-c','user.email=test@example.invalid','commit','-m','fixture');
 for(const dir of ['dist','dist-cloud']){mkdirSync(resolve(root,dir));writeFileSync(resolve(root,dir,'index.html'),'offline fixture');}
 const tsc=resolve(root,'node_modules/typescript/bin');mkdirSync(tsc,{recursive:true});writeFileSync(resolve(tsc,'tsc'),'');
 const config=resolve(root,'.openclaw/public.json');mkdirSync(resolve(root,'.openclaw'),{recursive:true});writeFileSync(config,JSON.stringify(metadata()));
 const result=spawnSync(process.execPath,[resolve(root,'scripts/deploy-hosting.mjs'),'--source',git('rev-parse','HEAD'),'--config',config],{encoding:'utf8',env:{...process.env,PATH:resolve(root,'bin')+':'+process.env.PATH}});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/PLAN_ONLY/);assert.doesNotMatch(result.stderr,/FORBIDDEN_FIREBASE/);
 const receipt=JSON.parse(readFileSync(resolve(root,'.openclaw/tmp/release/candidate.json')));assert.equal(receipt.deploymentRequested,false);assert.equal(receipt.artifacts.length,2);
});
