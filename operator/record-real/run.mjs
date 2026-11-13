// Operator-only. Builds unchanged product source with inert public SDK metadata.
import {build} from 'vite';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {variantConfig} from '../../scripts/nano-ci/variants.mjs';
import {launchNative} from '../../scripts/nano-ci/native-chrome.mjs';
import {readEffectiveArgs,sanitize} from '../../scripts/nano-ci/diagnostics.mjs';
export const ORIGIN='http://127.0.0.1:5192';
export const LIMITS={prewarmMs:15*60000,callMs:60000,takeMs:175000,totalMs:25*60000};
export const DEVICE_CONFIG={apiKey:'operator-local-only-not-a-credential',projectId:'operator-local-only',appId:'1:0:web:operator-local-only'};
export const allowed=url=>new URL(url).origin===ORIGIN||/^(data|blob):/.test(url);
export async function buildProduct(){
 // Not the normal config: envDir false, no private config, no broker bundle or stub.
 await build({configFile:false,envDir:false,publicDir:false,define:{__DEVICE_CONFIG__:JSON.stringify(DEVICE_CONFIG),__BROKER_CONFIG__:'null'},build:{outDir:'.openclaw/tmp/record-real-dist',emptyOutDir:true}});
}
export function handler(headers){return async(req,res)=>{
 const path=new URL(req.url,ORIGIN).pathname;
 if(req.headers.host!=='127.0.0.1:5192'||!['GET','HEAD'].includes(req.method)||!(path==='/'||/^\/assets\/[a-zA-Z0-9_.-]+$/.test(path))){res.writeHead(403);res.end();return;}
 try{const file=resolve('.openclaw/tmp/record-real-dist',path==='/'?'index.html':'.'+path);const body=await readFile(file);res.writeHead(200,{...headers,'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404);res.end();}
};}
export const SAMPLE_PRIVATE_VALUES=['Maya Fiction','21 Imaginary Lane','ZZ1 1ZZ','AB123456C','UTR 1234567890'];
export async function reviewMisses(page){
 const text=await page.locator('#letter').inputValue();
 for(const value of SAMPLE_PRIVATE_VALUES){
  const start=text.indexOf(value);assert(start>=0,'Expected synthetic sample required');
  const covered=await page.locator('#review .letter').evaluate((el,range)=>{let position=0,covered=0;for(const n of el.childNodes){const end=position+(n.textContent??'').length;if(n.nodeType===1&&n.nodeName==='MARK')covered+=Math.max(0,Math.min(end,range.end)-Math.max(position,range.start));position=end;}return covered===range.end-range.start;},{start,end:start+value.length});
  if(covered)continue;
  await page.locator('#letter').scrollIntoViewIfNeeded();
  await page.locator('#letter').evaluate((el,range)=>{el.focus();el.setSelectionRange(range.start,range.end);},{start,end:start+value.length});
  await page.waitForTimeout(2000);
  await page.getByRole('button',{name:'Add selected redaction',exact:true}).click();
  await page.locator('#review .letter').scrollIntoViewIfNeeded();await page.waitForTimeout(2000);
 }
 const payload=JSON.parse(await page.locator('#payload').innerText()).letter;
 for(const value of SAMPLE_PRIVATE_VALUES)assert(!payload.includes(value),'Review must cover known synthetic detail');
}
export async function journey(page,step){
 await step('original synthetic sample',async()=>{await page.locator('#letter').scrollIntoViewIfNeeded();assert((await page.locator('#letter').inputValue()).length>50);});
 await step('real Nano detection plus product regex union',async()=>{await page.locator('#detect').click();await page.waitForFunction(()=>document.querySelector('#review p')?.textContent.startsWith('On-device detection completed.'),null,{timeout:LIMITS.callMs});assert((await page.locator('#review mark').count())>0);});
 // Never click sample annotations or template. Product rendering is untouched.
 await step('inspect highlights and manually correct any known synthetic details missed by detectors',async()=>{await page.locator('#review .letter').scrollIntoViewIfNeeded();await reviewMisses(page);});
 await step('inspect redacted application preview and require review',async()=>{await page.locator('#payload').scrollIntoViewIfNeeded();assert(await page.locator('#approve').isDisabled());const payload=JSON.parse(await page.locator('#payload').innerText());assert.notEqual(payload.letter,await page.locator('#letter').inputValue());});
 await step('confirm synthetic original and exact payload reviewed',async()=>{await page.locator('#synthetic-confirm').check();assert(await page.locator('#approve').isDisabled());await page.locator('#review-confirm').check();await page.locator('#approve').click();assert(await page.locator('#cloud-explain').isEnabled());});
 await step('Explain on this device with original local input',async()=>{await page.locator('#local-answer').click();await page.waitForFunction(()=>document.querySelector('#journey h2')?.textContent==='Your explanation · On this device',null,{timeout:LIMITS.callMs});assert((await page.locator('#draft').inputValue()).trim().length>0);});
 await step('real local explanation and editable draft',async()=>{await page.locator('#journey').scrollIntoViewIfNeeded();});
 assert.match((await page.locator('#cloud-count').textContent()??''),/^0 cloud handoff attempts · 0 captured SDK HTTP bodies$/);
 assert.equal(await page.locator('#two-key').count(),0);
}
export async function run(){
 if(process.platform!=='linux'||process.arch!=='x64'||process.env.GITHUB_REPOSITORY_VISIBILITY!=='public')throw Error('Only free public standard Ubuntu x64 authorized');
 const {chromium}=await import('../../scripts/nano-ci/.driver/node_modules/playwright/index.mjs');
 const out=resolve('.openclaw/tmp/record-real-artifacts');await mkdir(out,{recursive:true});
 const proof={status:'NOT_RECORDED',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),limits:LIMITS,steps:[],network:{scope:'page CDP + route; not browser model download traffic',externalAttempts:[],requests:[]},model:'unchanged src/nano.ts firebase/ai ONLY_ON_DEVICE; no injected model',cloud:'NOT_RUN',twoKey:'NOT_RUN',errors:[]};
 let native,page,server,encoder,cdp,takeStart,encoderExit,frameCount=0;const frameTiming=[];
 const save=()=>writeFile(resolve(out,'proof.json'),JSON.stringify(proof,null,2));
 const totalTimer=setTimeout(()=>{proof.errors.push('Total deadline exceeded');void save().finally(()=>process.exit(1));},LIMITS.totalMs);
 const step=async(name,action)=>{const s={name,start:new Date().toISOString(),elapsedMs:Date.now()-takeStart};proof.steps.push(s);await save();await action();s.end=new Date().toISOString();await page.screenshot({path:resolve(out,String(proof.steps.length).padStart(2,'0')+'.png'),timeout:5000});await page.waitForTimeout(2200);await save();};
 try{
  await buildProduct();const hosting=JSON.parse(await readFile('firebase.json','utf8')).hosting.find(x=>x.target==='raw');const headers=Object.fromEntries(hosting.headers[0].headers.map(x=>[x.key,x.value]));proof.CSP=headers['Content-Security-Policy'];
  server=createServer(handler(headers));await new Promise((ok,no)=>{server.once('error',no);server.listen(5192,'127.0.0.1',ok);});
  const variant=variantConfig({NANO_CHANNEL:'stable'});variant.profile=resolve('.openclaw/tmp/record-real-profile');native=await launchNative(chromium,variant);proof.launch={args:native.args,sandboxDisabled:false,playwrightLaunchDefaults:false};
  const context=native.context;await context.route('**/*',route=>{if(allowed(route.request().url()))return route.continue();proof.network.externalAttempts.push({origin:new URL(route.request().url()).origin,method:route.request().method()});return route.abort('blockedbyclient');});
  page=context.pages()[0]??await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>proof.errors.push(sanitize(e.message)));
  const browserCDP=await context.browser().newBrowserCDPSession();proof.chrome=await browserCDP.send('Browser.getVersion');proof.effectiveCommandLine=await readEffectiveArgs(context,browserCDP);assert(!proof.effectiveCommandLine.arguments.some(x=>/BypassPerfRequirement|^--(no-sandbox|disable-features|disable-background-networking|disable-component-update)(=|$)/.test(x)));await browserCDP.detach();
  cdp=await context.newCDPSession(page);await cdp.send('Network.enable');cdp.on('Network.requestWillBeSent',e=>{proof.network.requests.push({at:e.timestamp,origin:new URL(e.request.url).origin,method:e.request.method,type:e.type});if(!allowed(e.request.url))proof.network.externalAttempts.push({origin:new URL(e.request.url).origin,method:e.request.method});});
  await page.goto(ORIGIN,{waitUntil:'load'});await page.bringToFront();
  proof.prewarm={start:new Date().toISOString(),includedInTake:false};await save();await page.locator('#initialize').click();await page.waitForFunction(()=>!document.querySelector('#detect').disabled,null,{timeout:LIMITS.prewarmMs});proof.prewarm.end=new Date().toISOString();await page.screenshot({path:resolve(out,'prewarm-ready.png')});
  // Live X11 capture preserves all wall time, scrolling and inference waits (not a slideshow).
  const geometry=execFileSync('xdpyinfo',[],{encoding:'utf8'}).match(/dimensions:\s+(\d+x\d+)/)?.[1];assert(geometry);
  encoder=spawn('ffmpeg',['-nostdin','-y','-f','x11grab','-framerate','15','-video_size',geometry,'-i',process.env.DISPLAY,'-t','175','-an','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p',resolve(out,'take-raw.mp4')],{stdio:['pipe','ignore','pipe']});let encoderError='';encoder.stderr.on('data',d=>encoderError=(encoderError+d).slice(-4000));encoderExit=new Promise((ok,no)=>{encoder.on('error',no);encoder.on('close',code=>(code===0||code===255)?ok():no(Error('ffmpeg failed '+code+' '+encoderError)));});encoderExit.catch(()=>{});
  // Independent CDP live screencast timestamps retained, no response payloads/headers.
  cdp.on('Page.screencastFrame',e=>{frameCount++;frameTiming.push({frame:frameCount,timestamp:e.metadata.timestamp});proof.lastScreencastTimestamp=e.metadata.timestamp;void cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});await cdp.send('Page.startScreencast',{format:'jpeg',quality:50,everyNthFrame:5});
  takeStart=Date.now();proof.take={start:new Date().toISOString(),capture:'ffmpeg live Xvfb x11grab, 15 fps, no audio, no edits'};await save();
  await journey(page,step);await page.waitForTimeout(3000);assert(Date.now()-takeStart<LIMITS.takeMs-1000);assert.equal(proof.network.externalAttempts.length,0);assert.equal(proof.errors.length,0);proof.status='RECORDED_REAL_LOCAL_PRODUCT';
 }catch(e){proof.errors.push(sanitize(e.message));proof.status=takeStart?'TAKE_FAILED_NOT_RELEASE_FOOTAGE':'PREWARM_FAILED_NOT_RECORDED';}
 finally{
  if(cdp)await cdp.send('Page.stopScreencast').catch(()=>{});
  if(encoder){encoder.kill('SIGINT');const killTimer=setTimeout(()=>encoder.kill('SIGKILL'),10000);try{await encoderExit;}catch(e){proof.errors.push(sanitize(e.message));proof.status='ENCODER_FAILED';}finally{clearTimeout(killTimer);}}
  if(takeStart){proof.take.end=new Date().toISOString();proof.take.wallMs=Date.now()-takeStart;proof.take.cdpFrameCount=frameCount;try{proof.video=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',resolve(out,'take-raw.mp4')],{encoding:'utf8'}));assert(Number(proof.video.format.duration)<=175.1);assert(Number(proof.video.format.duration)>1);assert(Math.abs(Number(proof.video.format.duration)*1000-proof.take.wallMs)<3000,'Video must cover wall time without truncation');assert(frameCount>0);await writeFile(resolve(out,'frame-timing.json'),JSON.stringify(frameTiming));execFileSync('ffmpeg',['-v','error','-i',resolve(out,'take-raw.mp4'),'-f','null','-'],{timeout:30000,stdio:'pipe'});}catch(e){proof.errors.push(sanitize(e.message));proof.status='VIDEO_VALIDATION_FAILED';}}
  await native?.close().catch(e=>proof.errors.push(sanitize(e.message)));if(server)await new Promise(r=>server.close(r));clearTimeout(totalTimer);await save();const files={};for(const name of await readdir(out)){const b=await readFile(resolve(out,name));files[name]={bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};}await writeFile(resolve(out,'manifest.json'),JSON.stringify({sourceCommit:proof.sourceCommit,files},null,2));
 }
 return proof.status==='RECORDED_REAL_LOCAL_PRODUCT'&&proof.errors.length===0?0:1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))try{process.exit(await run());}catch(e){console.error(sanitize(e.message));process.exit(1);}
