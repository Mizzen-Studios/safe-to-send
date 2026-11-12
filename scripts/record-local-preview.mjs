// Records the real local synthetic-template journey, never claimed as model inference.
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const out=resolve('.openclaw/tmp/preview-frames');await mkdir(out,{recursive:true});
const hosting=JSON.parse(await readFile('firebase.json','utf8')).hosting.find(h=>h.target==='raw');
const headers=Object.fromEntries(hosting.headers[0].headers.map(h=>[h.key,h.value]));
const server=createServer(async(req,res)=>{try{const relative=new URL(req.url,'http://local').pathname;const path=resolve('dist','.'+(relative==='/'?'/index.html':relative));if(!path.startsWith(resolve('dist')+'/'))throw Error('path');res.writeHead(200,{...headers,'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[extname(path)]??'application/octet-stream'});res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
let b;const external=[];
try{
 b=await chromium.launch({headless:true,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1200,height:900}});p.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!/^(data|blob):/.test(r.url()))external.push(r.url());});
 await p.goto(origin);await p.screenshot({path:out+'/01.png'});
 await p.locator('#demo').click();await p.locator('#review').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/02.png'});
 await p.locator('#synthetic-confirm').check();await p.locator('#review-confirm').check();await p.locator('#approve').click();await p.locator('#payload').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/03.png'});
 await p.locator('#explain').click();await p.locator('#draft').waitFor();await p.locator('#journey').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/04.png'});
 assert.equal(external.length,0);assert.ok((await p.locator('#journey').textContent()).includes('not AI inference'));
 await writeFile(out+'/receipt.json',JSON.stringify({classification:'REAL_UI_LOCAL_SYNTHETIC_TEMPLATE_NOT_MODEL_INFERENCE',checkedAt:new Date().toISOString(),externalRequests:external,frames:4,viewport:{width:1200,height:900},nanoInference:'NOT_RUN',cloudInference:'NOT_RUN',browserSandbox:'disabled in isolated screenshot harness; not security attestation'},null,2));
 console.log('Captured four actual UI frames; no cloud or Nano inference; zero external requests.');
}finally{await b?.close();await new Promise(r=>server.close(r));}
