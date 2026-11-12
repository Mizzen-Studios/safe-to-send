// Synthetic-only isolated Chromium QA. Uses an existing Playwright installation.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const config=JSON.parse(await readFile('firebase.json','utf8'));
const headers=Object.fromEntries((Array.isArray(config.hosting)?config.hosting.find(h=>h.target==="raw"):config.hosting).headers[0].headers.map(h=>[h.key,h.value]));
const server=createServer(async(req,res)=>{
 try{let path=resolve('dist','.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(resolve('dist')+'/'))path=resolve('dist/index.html');
 const body=await readFile(path);res.writeHead(200,{...headers,'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise((yes,no)=>{server.once('error',no);server.listen(5192,'127.0.0.1',yes);});

let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext();const page=await context.newPage();const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5192/')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto('http://127.0.0.1:5192/');
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.setViewportSize({width:390,height:900});
 // Manual mode works with arbitrary synthetic text, not a fixture identity.
 await page.locator('#letter').fill('Dear Zora Example, synthetic reference 12345678. Please reply soon.');await page.locator('#regex').click();
 assert.equal(await page.locator('#cloud-explain').isDisabled(),true);
 await page.locator('#letter').focus();await page.keyboard.press('Home');await page.keyboard.press('Control+Home');
 await page.locator('#letter').evaluate(t=>t.setSelectionRange(5,17));
 await page.getByRole('button',{name:'Add selected redaction',exact:true}).click();assert.ok(!(await page.locator('#payload').textContent()).includes('Zora Example'));
 await page.locator('#synthetic-confirm').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#approve').isDisabled(),true);
 await page.locator('#review-confirm').focus();await page.keyboard.press('Space');await page.locator('#approve').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#cloud-explain').isEnabled(),true);
 await page.getByRole('button',{name:'Remove PERSONAL 1',exact:true}).click();assert.equal(await page.locator('#cloud-explain').isDisabled(),true);assert.equal(await page.locator('#approve').isDisabled(),true);
 // No redactions can never approve whole original.
 await page.locator('#letter').fill('Entirely invented text without patterns');await page.locator('#regex').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();assert.equal(await page.locator('#cloud-explain').isDisabled(),true);
 // Local template is explicitly not inference. Save edited result to actual IndexedDB.
 await page.locator('#demo').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();await page.locator('#explain').click();await page.locator('#draft').waitFor();await page.locator('#draft').fill('Synthetic edited local draft');await page.locator('#save-title').fill('<img src=x onerror=alert(1)>');await page.locator('#reminder').fill('2026-11-01');await page.locator('#save-letter').click();await page.getByRole('status').filter({hasText:'Saved on this device only'}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Saved on device',exact:true}).click();await page.getByText('Synthetic edited local draft',{exact:false}).waitFor();assert.equal(await page.locator('#history-list img').count(),0);assert.ok((await page.locator('#history-list').textContent()).includes('Reminder 2026-11-01'));
 await page.getByRole('button',{name:'Delete <img src=x onerror=alert(1)>',exact:true}).click();await page.getByText('No saved letters.',{exact:false}).waitFor();
 // Direct real IndexedDB adapter CRUD and reload isolation, no fake DB dependency.
 await page.getByRole('button',{name:'Letter',exact:true}).click();await page.locator('#demo').click();await page.locator('#synthetic-confirm').check();await page.locator('#review-confirm').check();await page.locator('#approve').click();await page.locator('#explain').click();await page.locator('#save-letter').click();await page.getByRole('status').filter({hasText:'Saved on this device only'}).waitFor();await page.getByRole('button',{name:'Saved on device',exact:true}).click();page.once('dialog',d=>d.accept());await page.locator('#clear-history').click();await page.getByText('No saved letters.',{exact:false}).waitFor();
 const other=await browser.newContext();const otherPage=await other.newPage();await otherPage.goto('http://127.0.0.1:5192/');await otherPage.getByRole('button',{name:'Saved on device',exact:true}).click();await otherPage.getByText('No saved letters.',{exact:false}).waitFor();await other.close();
 await page.getByRole('button',{name:'Letter',exact:true}).click();await page.locator('#file').setInputFiles({name:'synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic dropped letter 12345678')});await page.waitForFunction(()=>document.querySelector('#letter').value==='Synthetic dropped letter 12345678');
 await page.locator('#check').click();await page.getByRole('button',{name:'Evidence',exact:true}).click();assert.equal(await page.locator('#results').isVisible(),false);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log(JSON.stringify({classification:'LOCAL_UI_QA_NOT_INFERENCE',viewports:[390,768,1440],keyboardApproval:true,arbitrarySyntheticManualReview:true,redactionRevisionInvalidation:true,zeroRedactionRefused:true,indexedDB:{save:true,reload:true,delete:true,clear:true,contextIsolation:true},savedContentEscaped:true,textFile:true,externalRequests:external,pageErrors:errors,nanoInference:'NOT_RUN',cloudInference:'NOT_RUN'},null,2));
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
