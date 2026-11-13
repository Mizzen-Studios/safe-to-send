import {variantConfig} from './variants.mjs';
import {launchNative} from './native-chrome.mjs';
import {captureDiagnostics,sanitize,readEffectiveArgs} from './diagnostics.mjs';
import {chromium} from './.driver/node_modules/playwright/index.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,relative,isAbsolute} from 'node:path';
const base=resolve('scripts/nano-ci'),out=resolve(base,'artifacts');await mkdir(out,{recursive:true});
const variant=variantConfig();
const result={variant,at:new Date().toISOString(),classification:'NOT_RUN',headless:false,channel:variant.channel,flags:variant.flags,errors:[],blockedPageRequests:[],console:[]};
// Browser-managed model downloads are distinct from page-origin connections.
// CSP + request routing deny ALL non-local page HTTP, including SDK fallback.
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://127.0.0.1').pathname;const file=resolve(base,'site','.'+(path==='/'?'/index.html':path));const rel=relative(resolve(base,'site'),file);if(rel.startsWith('..')||isAbsolute(rel))throw Error('path');const body=await readFile(file);res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(file)]??'application/octet-stream','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src data:; object-src 'none'; base-uri 'none'; form-action 'none'"});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(5193,'127.0.0.1',r));
let context,page,timer,native;
const registrationBudgetMs=180000;
const forbiddenArgs=['--disable-component-update','--disable-background-networking','--disable-features','--no-sandbox'];
result.launch={mode:'native-process-attachCDP',playwrightLaunchDefaults:false,sandboxDisabled:false,registrationBudgetMs,video:'NOT_RECORDED_CDP_ATTACH'};
const persist=async()=>{if(page&&!page.isClosed()){try{result.page=await page.evaluate(()=>window.probe);await page.screenshot({path:resolve(out,'screen.png')});}catch(e){result.errors.push(e.message);}}await writeFile(resolve(out,'result.json'),JSON.stringify(result,(_,v)=>typeof v==='string'?sanitize(v):v,2));};
try{
 native=await launchNative(chromium,variant);context=native.context;
 page=context.pages()[0]??await context.newPage();
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:5193'||['data:','blob:'].includes(u.protocol))return route.continue();result.blockedPageRequests.push({origin:u.origin,method:route.request().method()});return route.abort('blockedbyclient');});
 page.on('console',m=>{result.console.push({type:m.type(),text:sanitize(m.text())});console.log(sanitize(m.text()));});page.on('pageerror',e=>result.errors.push(e.message));
 const cdp=await context.newCDPSession(page);result.chrome=await cdp.send('Browser.getVersion');await cdp.detach();
 const browserCDP=await context.browser().newBrowserCDPSession();
 const commandLine=await readEffectiveArgs(context,browserCDP);result.commandLineSource=commandLine.source;result.commandLineCdpError=commandLine.cdpError;result.effectiveArgs=commandLine.arguments.map(sanitize);
 if(result.effectiveArgs.some(x=>forbiddenArgs.some(f=>x===f||x.startsWith(f+'='))))throw Error('Forbidden component suppression or disabled sandbox remains in effective launch');
 result.gpu=await browserCDP.send('SystemInfo.getInfo').then(x=>({gpu:x.gpu})).catch(e=>({error:e.message}));await browserCDP.detach();
 await page.goto('http://127.0.0.1:5193');await page.waitForFunction(()=>window.probe?.ready,{},{timeout:60000});
 await persist();
 timer=setInterval(()=>{persist().catch(console.error);},15000);
 await captureDiagnostics(context,out,'initial');
 const registrationStart=Date.now();result.registrationSamples=[];
 do {
  const sample=await page.evaluate(()=>window.sampleAvailability());result.registrationSamples.push(sample);
  if(['available','downloadable','downloading'].includes(sample.text))break;
  const remaining=registrationBudgetMs-(Date.now()-registrationStart);if(remaining<=0)break;
  await page.waitForTimeout(Math.min(15000,remaining));
 }while(true);
 await captureDiagnostics(context,out,'after-registration-wait');await page.bringToFront();
 // Genuine Playwright button clicks provide activation. Each stage has a bounded
 // download/inference wait; a failure does not suppress the SDK attempt.
 for(const stage of ['text','direct','sdk']){
 await page.click('#'+stage);try{await page.waitForFunction(s=>['PASS','FAIL'].includes(window.probe.stages[s]?.status),stage,{timeout:stage==='text'?6*60000:3*60000});}catch(e){result.errors.push(stage+': '+e.message);break;}
 await persist();await captureDiagnostics(context,out,'after-'+stage);await page.bringToFront();
 }
 result.page=await page.evaluate(()=>window.probe);
 result.classification=['direct','sdk'].every(s=>result.page.stages[s]?.status==='PASS')?'REAL_ON_DEVICE_IMAGE_SCHEMA_PASS':'FAILED_OR_UNAVAILABLE_NOT_INFERENCE_PROOF';
}catch(e){result.errors.push(e.message);result.classification='LAUNCH_OR_RUNTIME_BLOCKED';}
finally{clearInterval(timer);await persist();try{await native?.close();}catch(e){result.errors.push('close: '+e.message);}server.close();await writeFile(resolve(out,'result.json'),JSON.stringify(result,(_,v)=>typeof v==='string'?sanitize(v):v,2));console.log(JSON.stringify(result,(_,v)=>typeof v==='string'?sanitize(v):v,2));}
// Force exit after flushed artifacts: SDK/background browser handles must not
// keep a completed or failed probe alive until the job timeout.
process.exit(result.classification==='REAL_ON_DEVICE_IMAGE_SCHEMA_PASS'?0:1);
