// TEST_ONLY: no real downloads, PowerShell, sudo, or Chrome execution.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {writeFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {installChrome_TEST_ONLY} from './install-chrome.mjs';

async function fixture(t){
 const base=resolve('.installer-test-scratch');await mkdir(base,{recursive:true});
 const root=await mkdtemp(join(base,"runner's [$literal]-"));
 t.after(async()=>{await rm(root,{recursive:true,force:true});await rm(base,{recursive:true,force:true});});
 const out=join(root,'artifacts'),executable=join(root,'chrome.exe');await writeFile(executable,'mock Chrome');
 return {root,out,executable};
}
for(const channel of ['stable','dev','canary'])test('Windows '+channel+' uses pwsh and verification before install; cleans staging',async t=>{
 const f=await fixture(t);let calls=0,source;
 await installChrome_TEST_ONLY({variant:{channel,executable:f.executable},platform:'win32',env:{RUNNER_TEMP:f.root},out:f.out,
  download:async url=>{source=url;return {ok:true,arrayBuffer:async()=>new Uint8Array([1,2]).buffer};},
  run:(command,args,options)=>{
   calls++;assert.equal(command,'pwsh');assert.deepEqual(args.slice(0,3),['-NoProfile','-NonInteractive','-Command']);
   assert.equal(options.stdio,'inherit');assert.equal(options.timeout,240000);
   const ps=args[3];
   const ordered=['Import-Module Microsoft.PowerShell.Security -ErrorAction Stop','Get-Command -Name Get-AuthenticodeSignature','Microsoft.PowerShell.Security\\Get-AuthenticodeSignature -LiteralPath $file -ErrorAction Stop','$s.Status -ne "Valid"','$null -eq $s.SignerCertificate','$s.SignerCertificate.Subject -notmatch','Start-Process','if($p.ExitCode -ne 0)'];
   let prior=-1;for(const part of ordered){const pos=ps.indexOf(part);assert.ok(pos>prior,part);prior=pos;}
   assert.ok(ps.includes("runner''s [$literal]"));assert.ok(ps.includes('O=Google (LLC|Inc)'));
   assert.ok(!/ExecutionPolicy|Bypass|Continue|catch/.test(ps));
   const staging=readdirSync(f.root).find(name=>name.startsWith('.nano-chrome-install-'));
   assert.ok(staging);assert.ok(existsSync(join(f.root,staging,'chrome-installer.exe')));
   assert.deepEqual(readdirSync(f.out),[]);
  }});
 assert.equal(calls,1);assert.equal(new URL(source).hostname,'dl.google.com');
 const tag=decodeURIComponent(new URL(source).pathname);assert.ok(tag.includes('ap=x64-'+channel));assert.ok(tag.includes('needsadmin='+(channel==='canary'?'false':'true')));
 assert.deepEqual((await readdir(f.root)).sort(),['artifacts','chrome.exe']);
 assert.deepEqual(await readdir(f.out),['installation.json']);
 assert.equal(JSON.parse(await readFile(join(f.out,'installation.json'),'utf8')).channel,channel);
});
for(const failure of ['module import','missing cmdlet','invalid signature','installer exit','download','HTTP','body'])test('Windows failure '+failure+' propagates and removes all installer bytes',async t=>{
 const f=await fixture(t),error=new Error('mock '+failure);let ran=false;
 const options={variant:{channel:'stable',executable:f.executable},platform:'win32',env:{GITHUB_WORKSPACE:f.root},out:f.out,
  download:async()=>{if(failure==='download')throw error;return {ok:failure!=='HTTP',status:503,arrayBuffer:async()=>{if(failure==='body')throw error;return new Uint8Array([1,2]).buffer;}};},
  run:()=>{ran=true;throw error;}};
 await assert.rejects(installChrome_TEST_ONLY(options),failure==='HTTP'?/HTTP 503/:e=>e===error);
 assert.equal(ran,!['download','HTTP','body'].includes(failure));
 assert.deepEqual((await readdir(f.root)).sort(),['artifacts','chrome.exe']);assert.deepEqual(await readdir(f.out),[]);
});
for(const channel of ['stable','dev'])for(const failure of ['none','curl','apt'])test('Linux '+channel+' '+failure+' cleanup outside artifacts',async t=>{
 const f=await fixture(t),calls=[],error=new Error('mock '+failure);let file;
 const action=installChrome_TEST_ONLY({variant:{channel,executable:f.executable},platform:'linux',env:{RUNNER_TEMP:f.root},out:f.out,
  download:async()=>{throw Error('unexpected fetch');},
  run:(command,args)=>{calls.push(command);if(command==='curl'){file=args.at(-1);assert.ok(!file.startsWith(f.out));writeFileSync(file,'partial deb');if(failure==='curl')throw error;}else{assert.equal(command,'sudo');assert.ok(existsSync(file));assert.deepEqual(args,['apt-get','install','-y',file]);if(failure==='apt')throw error;}}});
 if(failure==='none')await action;else await assert.rejects(action,e=>e===error);
 assert.deepEqual(calls,failure==='curl'?['curl']:['curl','sudo']);assert.ok(!existsSync(file));
 assert.deepEqual((await readdir(f.root)).sort(),['artifacts','chrome.exe']);assert.deepEqual(await readdir(f.out),failure==='none'?['installation.json']:[]);
});
test('TEST_ONLY seam is rejected outside node test and requires mocks',async()=>{
 await assert.rejects(installChrome_TEST_ONLY({}),/requires mocked/);
 assert.throws(()=>execFileSync(process.execPath,['--input-type=module','-e',"import {installChrome_TEST_ONLY} from './scripts/nano-ci/install-chrome.mjs'; await installChrome_TEST_ONLY({});"],{env:{...process.env,NODE_TEST_CONTEXT:''},stdio:'pipe'}),/TEST_ONLY: run with node --test/);
});
