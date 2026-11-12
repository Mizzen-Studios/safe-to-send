// Synthetic-only isolated Chromium QA. Uses an existing Playwright installation.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const config=JSON.parse(await readFile('firebase.json','utf8'));
const headers=Object.fromEntries(config.hosting.headers[0].headers.map(h=>[h.key,h.value]));
const server=createServer(async(req,res)=>{
 try{let path=resolve('dist','.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(resolve('dist')+'/'))path=resolve('dist/index.html');
 const body=await readFile(path);res.writeHead(200,{...headers,'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise((yes,no)=>{server.once('error',no);server.listen(5192,'127.0.0.1',yes);});
let browser;
try{
 await mkdir('.openclaw/tmp/browser-downloads',{recursive:true});
 browser=await chromium.launch({downloadsPath:resolve('.openclaw/tmp/browser-downloads'),executablePath:process.env.CHROMIUM_PATH??chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({acceptDownloads:true});
 const page=await context.newPage(),errors=[],external=[],consoleErrors=[],results=[],fixtureResults=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5192/')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push({url:r.url(),method:r.method()});});
 await page.addInitScript(()=>{Object.defineProperty(globalThis,'LanguageModel',{value:undefined,configurable:true});globalThis.__fetchAttempts=[];const original=globalThis.fetch;globalThis.fetch=(...args)=>{globalThis.__fetchAttempts.push(String(args[0]));return original(...args);};globalThis.__violations=[];document.addEventListener('securitypolicyviolation',e=>globalThis.__violations.push({directive:e.effectiveDirective,blocked:e.blockedURI}));});
 await page.goto('http://127.0.0.1:5192/');await page.locator('#demo').waitFor();
 for(const width of [390,768,1440]){
 await page.setViewportSize({width,height:1000});
 await page.locator('#demo').click();assert.equal(await page.locator('#approve').isDisabled(),true);
 assert.equal(await page.locator('#explain').isDisabled(),true);
 const payload=await page.locator('#payload').textContent();assert.ok(!payload.includes('Maya Fiction'));assert.ok(payload.includes('[NAME_1]'));
 await page.locator('#review-confirm').check();await page.locator('#approve').click();assert.equal(await page.locator('#explain').isEnabled(),true);
 await page.locator('#explain').click();await page.locator('#draft').waitFor();assert.ok((await page.locator('#draft').inputValue()).includes('Maya Fiction'));
 assert.ok((await page.locator('#journey').textContent()).includes('2026-11-30'));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
 await page.screenshot({path:'docs/evidence/reviewed-journey-'+width+'.png',fullPage:true});
 await page.locator('#letter').fill('SYNTHETIC replacement');assert.equal(await page.locator('#draft').count(),0);assert.equal(await page.locator('#approve').count(),0);
 results.push({width,mandatoryReview:true,redactedPayload:true,localRestore:true,deadlineVisible:true,sourceEditInvalidates:true,overflow});
 }
 // Keyboard approval, all supplied fixtures, local draft editing and download.
 for(const id of ['hmrc','dwp','nhs','council','landlord']){
 await page.locator('#sample').selectOption(id);await page.locator('#demo').click();
 await page.locator('#review-confirm').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#approve').isEnabled(),true);
 await page.locator('#approve').focus();await page.keyboard.press('Enter');await page.locator('#explain').click();await page.locator('#draft').waitFor();
 const result=await page.locator('#journey').textContent();assert.ok(result.includes('not AI inference'));
 if(id==='dwp')assert.ok(result.includes('Date unresolved'));
 if(id==='landlord')assert.ok(result.includes('No deadlines extracted'));
 await page.locator('#draft').fill('SYNTHETIC edited reply');const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download draft locally'}).click();const download=await downloaded;assert.equal(await download.failure(),null);const downloadedPath=await download.path();const content=await readFile(downloadedPath,'utf8');assert.equal(content,'SYNTHETIC edited reply');
 fixtureResults.push({id,keyboardApproval:true,structuredResult:true,editedDraftDownload:true});
 }
 await page.locator('#sample').selectOption('hmrc');
 // Result-to-redaction revision must also invalidate approval and the completed result.
 await page.locator('#demo').click();await page.locator('#review-confirm').check();await page.locator('#approve').click();await page.locator('#explain').click();await page.locator('#draft').waitFor();
 await page.getByRole('button',{name:'Remove NAME 1',exact:true}).click();assert.equal(await page.locator('#draft').count(),0);assert.equal(await page.locator('#approve').isDisabled(),true);assert.equal(await page.locator('#explain').isDisabled(),true);
 // Explicit missing-LanguageModel browser path must reject before any fetch.
 await page.getByText('Run the Nano research test',{exact:true}).click();await page.locator('#config').fill(JSON.stringify({apiKey:'synthetic-not-a-key',projectId:'synthetic',appId:'synthetic'}));await page.locator('#initialize').click();await page.getByRole('status').filter({hasText:'initialization failed'}).waitFor();
 assert.equal(await page.locator('#detect').isDisabled(),true);
 const appFetchAttempts=await page.evaluate(()=>globalThis.__fetchAttempts);assert.deepEqual(appFetchAttempts,[]);assert.deepEqual(external,[]);
 // Negative CSP probe: synthetic marker only; browser must refuse BEFORE an HTTP request.
 const probe=await page.evaluate(async()=>{try{await fetch('https://example.invalid/negative-egress-probe',{method:'POST',body:'SYNTHETIC_ONLY'});return 'unexpected success';}catch{return 'blocked';}});assert.equal(probe,'blocked');
 await page.waitForFunction(()=>globalThis.__violations.some(x=>x.directive==='connect-src'));
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 const evidence={checkedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),classification:'LOCAL_SYNTHETIC_QA_NOT_INFERENCE',browser:await browser.version(),appBuild:'local dist served with unchanged firebase.json headers; not deployed',viewports:results,fixtures:fixtureResults,redactionEditInvalidates:true,missingLanguageModel:{initializationRefused:true,appFetchAttempts},externalBrowserRequests:external,cspProbe:{result:probe,violations:await page.evaluate(()=>globalThis.__violations)},pageErrors:errors,consoleErrors,nanoInference:'NOT_RUN — unavailable VM; missing API deliberately forced for guard test',cloudInference:'NOT_RUN — hard-locked; no App Check or cloud configured',ledger:'Application payload only; no SDK HTTP body exists'};
 await writeFile('docs/evidence/reviewed-journey-browser.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
