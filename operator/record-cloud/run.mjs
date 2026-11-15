import {chromium} from '../../scripts/nano-ci/.driver/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const OUT=resolve('.openclaw/tmp/record-cloud-private');
await (await import('node:fs/promises')).mkdir(OUT,{recursive:true,mode:0o700});
const RAW='https://safe-to-send-2026.web.app',BROKER='https://safe-to-send-cloud-2026.web.app';
const secret=JSON.parse(process.env.CLOUD_RECORD_DEBUG_JSON);
console.log('::add-mask::'+secret.token);
const hosting=JSON.parse(await readFile('firebase.json')).hosting;
const hash=s=>createHash('sha256').update(s).digest('hex');
const report={classification:'GENUINE_HEADED_DESKTOP_SEPARATE_CLOUD_TAKE_PRIVATE_DEVELOPMENT_APPCHECK_NOT_PRODUCTION_ATTESTATION',source:process.env.GITHUB_SHA,productSource:'440ec1e0aa70644ecde8288e8dc2d6f93e302b2f',checkedAt:new Date().toISOString(),nanoInference:'NOT_RUN_THIS_TAKE',normalProductionAttestation:'NOT_PROVEN',staticServing:'EXACT_LOCAL_CANDIDATE_BYTES_AT_REAL_ORIGINS',providerPosts:[],leaks:[],pageErrors:[],events:[]};
let browser,ff;const start=Date.now();const event=stage=>report.events.push({stage,elapsedMs:Date.now()-start});
try{
 browser=await chromium.launch({headless:false,executablePath:'/usr/bin/google-chrome',chromiumSandbox:true,args:['--disable-dev-shm-usage','--window-size=1600,1000','--window-position=0,0','--start-fullscreen']});
 const context=await browser.newContext({viewport:{width:1600,height:1000},acceptDownloads:true});
 await context.addInitScript(({origin,token})=>{if(location.origin===origin)globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN=token;},{origin:BROKER,token:secret.token});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(![RAW,BROKER].includes(u.origin))return route.continue();const raw=u.origin===RAW,root=resolve(raw?'dist':'dist-cloud'),path=resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));assert.ok(path.startsWith(root+'/'));try{await route.fulfill({status:200,headers:{...Object.fromEntries(hosting.find(h=>h.target===(raw?'raw':'cloud')).headers[0].headers.map(h=>[h.key,h.value])),'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'},body:await readFile(path)});}catch{await route.fulfill({status:404,body:''});}});
 context.on('request',r=>{const u=new URL(r.url()),body=r.postData()??'';for(const s of ['Maya Fiction','14 Imaginary Lane','ZZ1 1ZZ','AB123456C'])if(body.includes(s)||r.url().includes(s))report.leaks.push({origin:u.origin,path:u.pathname});if(u.hostname==='firebasevertexai.googleapis.com'&&r.method()==='POST')report.providerPosts.push({body,sha256:hash(body),bytes:Buffer.byteLength(body)});});
 context.on('response',async r=>{const u=new URL(r.url());if(u.hostname==='firebaseappcheck.googleapis.com')report.appCheckExchangeStatus=r.status();if(u.hostname==='firebasevertexai.googleapis.com'){report.providerStatus=r.status();try{const x=await r.json();report.providerResponse={modelVersion:x.modelVersion??null,finishReason:x.candidates?.[0]?.finishReason??null};}catch{}}});
 const p=await context.newPage();p.on('pageerror',()=>report.pageErrors.push('PAGE_ERROR_REDACTED'));await p.goto(RAW);report.browser=await browser.version();
 ff=spawn('ffmpeg',['-y','-f','x11grab','-video_size','1600x1000','-framerate','15','-i',process.env.DISPLAY,'-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p',OUT+'/desktop-cloud-raw.mp4'],{stdio:['pipe','ignore','ignore']});event('CAPTURE_STARTED');
 await p.waitForTimeout(2500);await p.locator('#regex').click();event('MANUAL_LOCAL_REDACTION_REVIEW');await p.locator('#payload').scrollIntoViewIfNeeded();await p.waitForTimeout(3500);
 const approved=await p.locator('#payload').textContent();report.approvedApplicationPayloadSha256=hash(approved);report.approvedApplicationPayload=JSON.parse(approved);assert.equal(report.providerPosts.length,0);report.zeroProviderPostsBeforeApproval=true;
 await p.locator('#synthetic-confirm').check();await p.locator('#review-confirm').check();await p.waitForTimeout(2000);await p.locator('#approve').click();event('IMMUTABLE_PAYLOAD_APPROVED_NOT_SENT');assert.equal(report.providerPosts.length,0);await p.waitForTimeout(2500);
 await p.locator('#cloud-explain').click();event('EXPLICIT_SEND_CLICK');await p.waitForFunction(()=>document.querySelector('#draft')||document.querySelector('#status').textContent.includes('refused or failed'),{},{timeout:130000});event('REAL_CLOUD_RESULT');
 report.acceptedAnswer=await p.locator('#draft').count()===1;report.status=await p.locator('#status').textContent();const ledger=await p.locator('#wire-ledger').textContent();report.ledger=ledger.startsWith('[')?JSON.parse(ledger):[];
 report.exactBodyParity=report.providerPosts.length===1&&report.ledger.length===1&&report.providerPosts[0].body===report.ledger[0].body&&report.providerPosts[0].sha256===report.ledger[0].sha256;
 if(report.acceptedAnswer){await p.locator('#journey').scrollIntoViewIfNeeded();report.actualDraft=await p.locator('#draft').inputValue();await p.waitForTimeout(6500);await p.screenshot({path:OUT+'/cloud-response.png'});await p.locator('#draft').scrollIntoViewIfNeeded();await p.waitForTimeout(4500);await p.locator('#verify-local').click();report.verifierStatus=await p.locator('#verification-status').textContent();await p.waitForTimeout(3000);}
 await p.locator('summary').filter({hasText:'Privacy ledger'}).click();await p.locator('#wire-ledger').scrollIntoViewIfNeeded();event('SDK_BODY_LEDGER_DISPLAYED');await p.waitForTimeout(6500);await p.screenshot({path:OUT+'/wire-ledger.png'});
 if(report.acceptedAnswer){await p.locator('#draft').fill('SYNTHETIC locally edited reply.');report.editInvalidatesChecks=(await p.locator('#verification-status').textContent()).includes('Draft edited')&&await p.locator('#verify-local').isDisabled();await p.locator('#letter').fill('SYNTHETIC revised letter');report.revisionInvalidates=await p.locator('#draft').count()===0&&await p.locator('#approve').count()===0;await p.locator('#status').scrollIntoViewIfNeeded();event('REVISION_INVALIDATES_RESULT_AND_APPROVAL');await p.waitForTimeout(3500);}
 report.pass=report.acceptedAnswer&&report.exactBodyParity&&report.leaks.length===0&&report.pageErrors.length===0&&report.revisionInvalidates&&report.appCheckExchangeStatus===200&&report.providerStatus===200;
}catch(e){report.failureStage=report.events.at(-1)?.stage??'BROWSER_SANDBOX_LAUNCH';report.failureCode=e.name;report.pass=false;}
finally{if(ff){ff.stdin.write('q');await new Promise(r=>ff.on('exit',r));event('CAPTURE_STOPPED');}if(browser)await browser.close();await writeFile(OUT+'/receipt.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({classification:report.classification,source:report.source,pass:report.pass,failureStage:report.failureStage,providerStatus:report.providerStatus,exactBodyParity:report.exactBodyParity}));}
