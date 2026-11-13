// Operator-only runner orchestration. Never serves receipts or injects model output.
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile,rename,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildCollector,staticHandler,CSP} from './run.mjs';
import {variantConfig} from '../../scripts/nano-ci/variants.mjs';
import {launchNative} from '../../scripts/nano-ci/native-chrome.mjs';
import {captureDiagnostics,readEffectiveArgs,sanitize} from '../../scripts/nano-ci/diagnostics.mjs';
export const LIMITS=Object.freeze({initializationMs:900000,callMs:60000,totalMs:45*60000,snapshotMs:30000,downloadMs:30000,stopGraceMs:30000,plannedDetectors:32,plannedVerifiers:128});
export const ORIGIN='http://127.0.0.1:5192';
export function pageRequestAllowed(url){const u=new URL(url);return u.origin===ORIGIN||u.protocol==='blob:'||u.protocol==='data:';}
export function validateReceipt(r){
 if(!['REAL_ON_DEVICE','NOT_RUN'].includes(r.provenance)||!r.initialization||!r.source?.commit)throw Error('Invalid collector receipt');
 if(r.detectors && (r.detectors.length!==32||r.verifiers?.length!==128))throw Error('Incomplete planned row accounting');
 if(r.detectors && (r.coverage?.detectors?.planned!==32||r.coverage?.verifiers?.planned!==128))throw Error('Invalid denominators');
 return r.provenance==='REAL_ON_DEVICE'&&r.initialization.status==='success'&&r.detectors?.every(x=>x.status==='success')&&r.verifiers?.every(x=>['accepted','rejected'].includes(x.status));
}
export async function run(){
 if(process.platform!=='linux'||process.arch!=='x64'||process.env.GITHUB_REPOSITORY_VISIBILITY!=='public')throw Error('Only free standard public Ubuntu x64 workflow authorized');
 const {chromium}=await import('../../scripts/nano-ci/.driver/node_modules/playwright/index.mjs');
 const out=resolve('.openclaw/tmp/device-eval-artifacts');await mkdir(out,{recursive:true});
 const variant=variantConfig({NANO_CHANNEL:'stable'});variant.profile=resolve('.openclaw/tmp/device-eval-profile');
 const proof={at:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),limits:LIMITS,variant,launch:{mode:'native-process-attachCDP',playwrightLaunchDefaults:false,sandboxDisabled:false},network:{CSP,blockedPageRequests:[]},video:'NOT_RECORDED: screenshot sequence is not video',errors:[],status:'STARTING'};
 let native,context,page,server,receipt,complete=false,nextSnapshot=0;
 const error=e=>proof.errors.push(sanitize(String(e?.message??e)));
 const save=async()=>{await writeFile(resolve(out,'progress.json.tmp'),JSON.stringify(proof,null,2));await rename(resolve(out,'progress.json.tmp'),resolve(out,'progress.json'));};
 const snapshot=async()=>{proof.updatedAt=new Date().toISOString();if(page&&!page.isClosed()){try{proof.progress=await page.locator('#status').innerText({timeout:5000});proof.downloadReady=await page.locator('#download').isEnabled({timeout:5000});await page.screenshot({path:resolve(out,'screen-'+String(nextSnapshot++).padStart(3,'0')+'.png'),timeout:10000});}catch(e){error(e);}}await save();};
 const harvest=async()=>{
  // Actual Blob download, not page-evaluate extraction or an upload endpoint.
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:LIMITS.downloadMs}),page.locator('#download').click({timeout:5000})]);
  if(await download.failure())throw Error('Receipt download failed');
  const path=resolve(out,'receipt.json');await download.saveAs(path);await download.delete();
  const bytes=await readFile(path);receipt=JSON.parse(bytes);complete=validateReceipt(receipt);
  if(receipt.source.commit!==proof.sourceCommit){complete=false;throw Error('Receipt source commit mismatch');}
  proof.receipt={file:'receipt.json',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,provenance:receipt.provenance,coverage:receipt.coverage,complete};
 };
 try{
  await save();await buildCollector();server=createServer(staticHandler());await new Promise((yes,no)=>{server.once('error',no);server.listen(5192,'127.0.0.1',yes);});
  native=await launchNative(chromium,variant);context=native.context;proof.nativeArgs=native.args;
  await context.route('**/*',route=>{if(pageRequestAllowed(route.request().url()))return route.continue();proof.network.blockedPageRequests.push({origin:new URL(route.request().url()).origin,method:route.request().method()});return route.abort('blockedbyclient');});
  page=context.pages()[0]??await context.newPage();page.on('pageerror',error);
  const cdp=await context.browser().newBrowserCDPSession();proof.chrome=await cdp.send('Browser.getVersion');proof.effectiveCommandLine=await readEffectiveArgs(context,cdp);proof.gpu=await cdp.send('SystemInfo.getInfo').then(x=>x.gpu).catch(e=>({error:sanitize(e.message)}));await cdp.detach();
  if(proof.effectiveCommandLine.arguments.some(x=>/^--(no-sandbox|disable-component-update|disable-background-networking|disable-features)(=|$)/.test(x)||/BypassPerfRequirement/.test(x)))throw Error('Forbidden native argument');
  await page.goto(ORIGIN,{waitUntil:'load',timeout:30000});await page.locator('#start').waitFor({state:'visible'});
  proof.before=await captureDiagnostics(context,out,'before');await page.bringToFront();
  // Only real trusted UI activation starts initialization; no evaluate/model API calls.
  await page.locator('#start').click({timeout:10000});proof.status='COLLECTING';proof.startedAt=new Date().toISOString();await snapshot();
  const deadline=Date.now()+LIMITS.totalMs;let next=Date.now()+LIMITS.snapshotMs;
  while(!await page.locator('#download').isEnabled({timeout:5000})){
   if(Date.now()>=deadline){proof.status='DEADLINE_STOP';await page.locator('#stop').click({timeout:5000});await page.locator('#download').waitFor({state:'visible',timeout:LIMITS.stopGraceMs});await page.waitForFunction(()=>!document.querySelector('#download').disabled,null,{timeout:LIMITS.stopGraceMs});break;}
   await page.waitForTimeout(1000);if(Date.now()>=next){await snapshot();next=Date.now()+LIMITS.snapshotMs;}
  }
  await harvest();proof.status=complete?'COMPLETE_COVERAGE':'PARTIAL_OR_NOT_RUN';
 }catch(e){error(e);proof.status='HARNESS_ERROR';
  // Best-effort abort and genuine partial export even on orchestration failure.
  if(page&&!page.isClosed()&&!receipt)try{if(await page.locator('#stop').isEnabled({timeout:3000}))await page.locator('#stop').click({timeout:5000});await page.waitForFunction(()=>!document.querySelector('#download').disabled,null,{timeout:LIMITS.stopGraceMs});await harvest();}catch(e){error(e);}
 }finally{
  await snapshot();if(context)try{proof.after=await captureDiagnostics(context,out,'after');}catch(e){error(e);}
  try{await native?.close();}catch(e){error(e);}if(server)await new Promise(r=>server.close(r));
  for(const name of ['hardware.json','installation.json'])try{await writeFile(resolve(out,name),await readFile(resolve('scripts/nano-ci/artifacts',name)));}catch(e){error(e);}
  const hashes={};for(const name of (await readdir(out)).sort())if(!['progress.json','proof.json','manifest.json'].includes(name)){const bytes=await readFile(resolve(out,name));hashes[name]={sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}
  proof.artifacts=hashes;await save();await writeFile(resolve(out,'proof.json'),JSON.stringify(proof,null,2));const bytes=await readFile(resolve(out,'proof.json'));hashes['proof.json']={sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};await writeFile(resolve(out,'manifest.json'),JSON.stringify({sourceCommit:proof.sourceCommit,artifacts:hashes},null,2));
 }
 return complete&&proof.errors.length===0?0:1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.exit(await run());}catch(e){console.error(sanitize(e.message));process.exit(1);}}
