import {chromium} from './.driver/node_modules/playwright/index.mjs';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const base=resolve('scripts/nano-ci'),out=resolve(base,'artifacts');await mkdir(out,{recursive:true});
const result={at:new Date().toISOString(),classification:'NOT_RUN',headless:false,channel:'chrome',flags:['--enable-features=AIPromptAPI,AIPromptAPIMultimodalInput'],errors:[],blockedPageRequests:[],console:[]};
// Browser-managed model downloads are distinct from page-origin connections.
// CSP + request routing deny ALL non-local page HTTP, including SDK fallback.
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://127.0.0.1').pathname;const file=resolve(base,'site','.'+(path==='/'?'/index.html':path));if(!file.startsWith(resolve(base,'site')+'/'))throw Error('path');const body=await readFile(file);res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(file)]??'application/octet-stream','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'unsafe-inline'; img-src 'self' data: blob:; connect-src data:; object-src 'none'; base-uri 'none'; form-action 'none'"});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(5193,'127.0.0.1',r));
let context,page,timer;
const persist=async()=>{if(page&&!page.isClosed()){try{result.page=await page.evaluate(()=>window.probe);await page.screenshot({path:resolve(out,'screen.png')});}catch(e){result.errors.push(e.message);}}await writeFile(resolve(out,'result.json'),JSON.stringify(result,null,2));};
try{
 context=await chromium.launchPersistentContext(resolve(base,'profile'),{channel:'chrome',headless:false,viewport:{width:1280,height:900},recordVideo:{dir:out,size:{width:1280,height:900}},args:result.flags});
 page=context.pages()[0]??await context.newPage();
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:5193'||['data:','blob:'].includes(u.protocol))return route.continue();result.blockedPageRequests.push({origin:u.origin,method:route.request().method()});return route.abort('blockedbyclient');});
 page.on('console',m=>{result.console.push({type:m.type(),text:m.text()});console.log(m.text());});page.on('pageerror',e=>result.errors.push(e.message));
 const cdp=await context.newCDPSession(page);result.chrome=await cdp.send('Browser.getVersion');await cdp.detach();
 await page.goto('http://127.0.0.1:5193');await page.waitForFunction(()=>window.probe?.ready,{},{timeout:60000});
 timer=setInterval(()=>{persist().catch(console.error);},15000);
 // Genuine Playwright button clicks provide activation. Each stage has a bounded
 // download/inference wait; a failure does not suppress the SDK attempt.
 for(const stage of ['direct','sdk']){
 await page.click('#'+stage);try{await page.waitForFunction(s=>['PASS','FAIL'].includes(window.probe.stages[s]?.status),stage,{timeout:stage==='direct'?9*60000:4*60000});}catch(e){result.errors.push(stage+': '+e.message);break;}
 await persist();
 }
 result.page=await page.evaluate(()=>window.probe);
 result.classification=['direct','sdk'].every(s=>result.page.stages[s]?.status==='PASS')?'REAL_ON_DEVICE_IMAGE_SCHEMA_PASS':'FAILED_OR_UNAVAILABLE_NOT_INFERENCE_PROOF';
}catch(e){result.errors.push(e.message);result.classification='LAUNCH_OR_RUNTIME_BLOCKED';}
finally{clearInterval(timer);await persist();try{await context?.close();}catch(e){result.errors.push('close: '+e.message);}server.close();await writeFile(resolve(out,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}
if(result.classification!=='REAL_ON_DEVICE_IMAGE_SCHEMA_PASS')process.exitCode=1;
