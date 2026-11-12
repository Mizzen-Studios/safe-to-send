// REAL browser + SDK serialization. MOCK App Check + provider. NEVER real AI proof.
import {build} from 'vite';
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const RAW='https://safe-to-send-2026.web.app',BROKER='https://safe-to-send-cloud-2026.web.app';
const temp=resolve('.openclaw/tmp/handoff-browser');await mkdir(temp,{recursive:true});
const mockConfig={firebase:{apiKey:'AIza'+'s'.repeat(35),projectId:'safe-to-send-2026',appId:'1:794092402064:web:4e263548738bdb75a8af15'},recaptchaEnterpriseSiteKey:'6L'+'s'.repeat(35)};
for(const [name,entry] of [['raw','index.html'],['broker','broker/index.html']])await build({configFile:false,logLevel:'warn',define:{__BROKER_CONFIG__:JSON.stringify(mockConfig)},resolve:{alias:{'firebase/app-check':resolve('scripts/fixtures/appcheck-mock.ts')}},plugins:[{name:'TEST-ONLY-unlock',enforce:'pre',transform(code,id){if(id.endsWith('/src/cloud-policy.ts'))return code.replace('CLOUD_RELEASE_ENABLED:boolean=false','CLOUD_RELEASE_ENABLED:boolean=true');}}],build:{outDir:resolve(temp,name),rollupOptions:{input:resolve(entry)}}});
const config=JSON.parse(await readFile('firebase.json','utf8'));
const hosting=target=>Object.fromEntries(config.hosting.find(x=>x.target===target).headers[0].headers.map(h=>[h.key,h.value]));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const context=await browser.newContext();const unexpected=[],bodies=[],pageErrors=[],safeRequestMetadata=[];let delayReply=false,releaseReply;
 await context.addInitScript(({broker,noAttestation})=>{if(location.origin===broker)globalThis.__mockNoAttestation=noAttestation;},{broker:BROKER,noAttestation:false});
 await context.route('**/*',async route=>{
  const r=route.request(),u=new URL(r.url());
  if(u.origin===RAW||u.origin===BROKER){
   const isRaw=u.origin===RAW;let pathname=u.pathname;if(pathname==='/')pathname=isRaw?'/index.html':'/broker/index.html';
   try{const path=resolve(temp,isRaw?'raw':'broker','.'+pathname);assert.ok(path.startsWith(temp+'/'));const body=await readFile(path);await route.fulfill({status:200,headers:{...hosting(isRaw?'raw':'cloud'),'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'},body});}catch{await route.fulfill({status:404,body:''});}return;
  }
  if(u.origin==='https://firebasevertexai.googleapis.com'&&u.pathname.endsWith(':generateContent')){
   const body=r.postData()??'';bodies.push(body);
   assert.equal(r.frame().url(),BROKER+'/');assert.equal(u.search,'');assert.ok(!body.includes('Maya Fiction'));assert.ok(!body.includes('14 Imaginary Lane'));
   const brokerFrame=r.frame();assert.equal(await brokerFrame.evaluate(()=>globalThis.__mockCheckInitialized),true);
   safeRequestMetadata.push({origin:u.origin,path:u.pathname,method:r.method(),bodyUtf8Bytes:Buffer.byteLength(body),bodySha256:createHash('sha256').update(body).digest('hex')});
   if(delayReply)await new Promise(r=>releaseReply=r);
   try{await route.fulfill({status:200,headers:{'Access-Control-Allow-Origin':BROKER},contentType:'application/json',body:JSON.stringify({candidates:[{content:{role:'model',parts:[{text:JSON.stringify({explanation:'MOCK PROVIDER, NOT INFERENCE: check the request.',deadlines:[],actions:['Check original.'],draft:'Dear sender,\nA synthetic note from [NAME_1]. <img src=https://evil.invalid/leak onerror=alert(1)>\nKind regards,\n[NAME_1]'})}]},finishReason:'STOP'}]})});}catch{}return;
  }
  unexpected.push({origin:u.origin,path:u.pathname});await route.abort();
 });
 const page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(RAW+'/');await page.locator('#demo').click();assert.equal(bodies.length,0);assert.equal(await page.locator('iframe').count(),0);assert.equal(await page.locator('#cloud-explain').isDisabled(),true);
 await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();assert.equal(bodies.length,0);assert.equal(await page.locator('iframe').count(),0);
 await page.locator('#cloud-explain').click();await page.locator('#draft').waitFor();
 assert.equal(bodies.length,1);assert.ok((await page.locator('#draft').inputValue()).includes('Maya Fiction'));assert.equal(await page.locator('#journey img').count(),0);assert.equal(await page.locator('iframe').count(),0);
 const ledger=JSON.parse(await page.locator('#wire-ledger').textContent());assert.equal(ledger.length,1);assert.equal(ledger[0].body,bodies[0]);assert.equal(ledger[0].utf8Bytes,Buffer.byteLength(bodies[0]));assert.equal(ledger[0].sha256,createHash('sha256').update(bodies[0]).digest('hex'));
 // Scope checks happen again at dispatch, even without an input event.
 await page.locator('#demo').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();const beforeScope=bodies.length;await page.locator('#letter').evaluate(el=>el.value='SYNTHETIC_CHANGED_WITHOUT_EVENT');await page.locator('#cloud-explain').click();assert.equal(bodies.length,beforeScope);assert.equal(await page.locator('iframe').count(),0);
 await page.locator('#demo').click();while(await page.getByRole('button',{name:/^Remove /}).count())await page.getByRole('button',{name:/^Remove /}).first().click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();assert.equal(await page.locator('#cloud-explain').isDisabled(),true);assert.equal(bodies.length,beforeScope);assert.equal(await page.locator('iframe').count(),0);
 // Negative egress on raw origin. No external route may be reached.
 const probe=await page.evaluate(async()=>{try{await fetch('https://example.invalid/raw-probe',{method:'POST',body:'SYNTHETIC_RAW_SENTINEL'});return 'FAIL';}catch{return 'blocked';}});assert.equal(probe,'blocked');
 // Stale async result: cancel iframe on source edit before mocked provider returns.
 await page.locator('#demo').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();delayReply=true;await page.locator('#cloud-explain').click();await page.waitForFunction(()=>document.querySelector('iframe')!==null);for(let i=0;!releaseReply&&i<500;i++)await new Promise(r=>setTimeout(r,10));assert.ok(releaseReply,'mock request not observed');
 await page.locator('#letter').fill('SYNTHETIC_CHANGED_SOURCE');assert.equal(await page.locator('iframe').count(),0);releaseReply();await page.waitForTimeout(80);assert.equal(await page.locator('#draft').count(),0);
 assert.deepEqual(unexpected,[]);assert.deepEqual(pageErrors,[]);
 // Missing attestation must prevent the real SDK from reaching even a mocked AI endpoint.
 await context.addInitScript(({broker})=>{if(location.origin===broker)globalThis.__mockNoAttestation=true;},{broker:BROKER});
 delayReply=false;await page.locator('#demo').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();const beforeDenied=bodies.length;await page.locator('#cloud-explain').click();await page.getByRole('status').filter({hasText:'refused or failed'}).waitFor();assert.equal(bodies.length,beforeDenied);
 const evidence={checkedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),classification:'REAL_BROWSER_REAL_SDK_SERIALIZATION_MOCK_APPCHECK_MOCK_PROVIDER_NOT_INFERENCE',browser:await browser.version(),productionReleaseSwitch:'true for reviewed synthetic input; App Check/provider are mocked in this suite',origins:[RAW,BROKER],mandatoryApproval:true,noIframeBeforeExplicitCloudSend:true,redactedOnlyBody:true,htmlResponseNotExecuted:true,localRestoration:true,bodyLedgerEqualsMockedNetworkBody:true,sha256AndUtf8Parity:true,staleSourceEditDestroysIframe:true,missingAttestationPreventsSDKRequest:true,rawConnectProbe:probe,unexpectedRequests:unexpected,pageErrors,requests:safeRequestMetadata,nanoInference:'NOT_RUN',cloudInference:'NOT_RUN — mocked provider',appCheckServerEnforcement:'NOT_TESTED — mock',deployedDevToolsParity:'NOT_TESTED'};
 await mkdir('docs/evidence',{recursive:true});await writeFile('docs/evidence/cloud-handoff-mocked-browser.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}finally{await browser.close();}
