// Real candidate UI + real SDK/provider, private registered development App Check.
// Routes ONLY static candidate bytes; never mocks attestation/provider responses.
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const RAW='https://safe-to-send-2026.web.app',BROKER='https://safe-to-send-cloud-2026.web.app';
const secret=JSON.parse(await readFile(process.env.SAFE_SEND_DEBUG_FILE));
const hosting=JSON.parse(await readFile('firebase.json')).hosting;
const report={classification:'REAL_CANDIDATE_UI_REAL_CLOUD_PRIVATE_DEVELOPMENT_APPCHECK_NOT_PRODUCTION_ATTESTATION',checkedAt:new Date().toISOString(),nanoInference:'NOT_RUN',modelIdentity:'UNKNOWN',providerPosts:[],leaks:[],pageErrors:[]};
const sentinels=['Maya Fiction','14 Imaginary Lane','ZZ1 1ZZ','AB123456C'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 const context=await browser.newContext({viewport:{width:390,height:900},acceptDownloads:true});
 await context.addInitScript(({origin,token})=>{if(location.origin===origin)globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN=token;},{origin:BROKER,token:secret.token});
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(![RAW,BROKER].includes(u.origin))return route.continue();
 const raw=u.origin===RAW,root=resolve(raw?'dist':'dist-cloud'),path=resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));
 assert.ok(path.startsWith(root+'/'));try{await route.fulfill({status:200,headers:{...Object.fromEntries(hosting.find(h=>h.target===(raw?'raw':'cloud')).headers[0].headers.map(h=>[h.key,h.value])),'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'},body:await readFile(path)});}catch{await route.fulfill({status:404,body:''});}});
 context.on('request',r=>{const u=new URL(r.url()),body=r.postData()??'';for(const value of sentinels)if(body.includes(value)||r.url().includes(value))report.leaks.push({origin:u.origin,path:u.pathname});if(u.hostname==='firebasevertexai.googleapis.com'&&r.method()==='POST')report.providerPosts.push({body,sha256:createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)});});
 context.on('response',async r=>{if(new URL(r.url()).hostname==='firebasevertexai.googleapis.com')try{report.providerResponse=await r.json();}catch{report.providerResponseStatus=r.status();}});
 const p=await context.newPage();p.on('pageerror',()=>report.pageErrors.push('PAGE_ERROR_REDACTED'));
 await p.goto(RAW+'/');await p.locator('#check').click();report.capability=JSON.parse(await p.locator('#capability').textContent());
 await p.locator('#regex').click();assert.equal(await p.locator('#explain').count(),0);await p.locator('#local-answer').click();assert.match(await p.locator('#local-answer-status').textContent(),/unavailable.*no fallback/i);
 await p.locator('#synthetic-confirm').check();await p.locator('#review-confirm').check();await p.locator('#approve').click();assert.equal(report.providerPosts.length,0);
 const approved=await p.locator('#payload').textContent();for(const s of sentinels)assert.ok(!approved.includes(s));
 await p.locator('#cloud-explain').click();await p.waitForFunction(()=>document.querySelector('#draft')||document.querySelector('#status').textContent.includes('refused or failed'),{},{timeout:130000});
 report.acceptedAnswer=await p.locator('#draft').count()===1;report.status=await p.locator('#status').textContent();
 const text=await p.locator('#wire-ledger').textContent();report.ledger=text.startsWith('[')?JSON.parse(text):[];
 report.exactBodyParity=report.providerPosts.length===1&&report.ledger.length===1&&report.providerPosts[0].body===report.ledger[0].body&&report.providerPosts[0].sha256===report.ledger[0].sha256;
 if(report.acceptedAnswer){await p.locator('#verify-local').click();assert.match(await p.locator('#verification-status').textContent(),/unavailable/);await p.locator('#draft').fill('SYNTHETIC locally edited reply.');assert.match(await p.locator('#verification-status').textContent(),/Draft edited/);assert.ok(await p.locator('#verify-local').isDisabled());const pending=p.waitForEvent('download');await p.getByRole('button',{name:'Download draft locally'}).click();const d=await pending;report.downloadName=d.suggestedFilename();report.downloadMatches=String(await readFile(await d.path()))==='SYNTHETIC locally edited reply.';await p.locator('#letter').fill('SYNTHETIC revised letter');report.revisionInvalidates=await p.locator('#draft').count()===0&&await p.locator('#approve').count()===0;}
 await mkdir('.openclaw/tmp/web-final',{recursive:true});await writeFile('.openclaw/tmp/web-final/real-cloud.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,providerPosts:report.providerPosts.map(({body,...x})=>x),ledger:report.ledger.map(({body,...x})=>x)},null,2));
 assert.ok(report.acceptedAnswer);assert.ok(report.exactBodyParity);assert.deepEqual(report.leaks,[]);assert.deepEqual(report.pageErrors,[]);assert.ok(report.downloadMatches);assert.ok(report.revisionInvalidates);
}finally{await browser.close();}
