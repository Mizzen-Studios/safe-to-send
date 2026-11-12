import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export function sanitize(value){
 return String(value).replace(/https?:\/\/[^\s<>"']+/g,u=>{try{return new URL(u).origin+'/[path-redacted]';}catch{return '[url-redacted]';}})
 .replace(/(?:[A-Z]:\\|\/home\/|\/Users\/)[^\s<>"']+/g,'[local-path]')
 .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email]')
 .replace(/((?:token|authorization|api[_-]?key|secret|password)\s*[:=]\s*)[^\s,;]+/gi,'$1[redacted]');
}
export async function captureDiagnostics(context,out,label){
 const records=[];
 // Separate no-video context is not used: diagnostics must observe the probe profile.
 for(const url of ['chrome://on-device-internals/','chrome://policy/','chrome://gpu/','chrome://components/']){
  let tab;const entry={url,at:new Date().toISOString()};
  try{
   tab=await context.newPage();await tab.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
   await tab.waitForTimeout(750);
   if(url.includes('on-device-internals')){
    // Only navigation tabs: never Tools download/override, Reset, or use-case controls.
    const tabs=tab.locator('on-device-internals-app cr-tabs');
    await tabs.waitFor({state:'attached',timeout:5000}).catch(()=>{});
    const broker=tab.getByRole('tab',{name:'Broker State',exact:true});
    if(await broker.count())await broker.click({timeout:3000});
    else entry.brokerTab='not found; full shadow DOM captured';
    await tab.waitForTimeout(500);
    const events=tab.getByRole('tab',{name:'Event Logs',exact:true});
    if(await events.count())await events.click({timeout:3000});
    await tab.waitForTimeout(250);
   }
   entry.text=sanitize(await tab.evaluate(()=>{
    const collect=root=>Array.from(root.childNodes).map(n=>n.nodeType===3?n.textContent:n.nodeType===1&&!['STYLE','SCRIPT'].includes(n.tagName)?collect(n.shadowRoot??n):'').join(' ');
    return collect(document.body).replace(/\s+/g,' ').slice(0,100000);
   }));
  }catch(e){entry.error=sanitize(e.message);}finally{const video=tab?.video();await tab?.close().catch(()=>{});await video?.delete().catch(()=>{});}
  records.push(entry);
 }
 await writeFile(resolve(out,'diagnostics-'+label+'.json'),JSON.stringify(records,null,2));
 return records;
}
