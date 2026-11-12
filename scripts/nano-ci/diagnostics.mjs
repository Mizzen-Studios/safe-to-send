import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export function sanitize(value){
 return String(value).replace(/https?:\/\/[^\s<>"']+/g,u=>{try{return new URL(u).origin+'/[path-redacted]';}catch{return '[url-redacted]';}})
 .replace(/(?:[A-Z]:\\|\/home\/|\/Users\/)[^\s<>"']+/g,'[local-path]')
 .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email]')
 .replace(/((?:token|authorization|api[_-]?key|secret|password)\s*[:=]\s*)[^\s,;]+/gi,'$1[redacted]');
}
// The caller owns a fresh isolated probe profile. This changes only debug-page visibility.
export async function enableDebugPages(tab){
 await tab.goto('chrome://chrome-urls/',{waitUntil:'domcontentloaded',timeout:15000});
 const enabled=tab.getByRole('button',{name:'Disable internal debugging pages',exact:true});
 const enable=tab.getByRole('button',{name:'Enable internal debugging pages',exact:true});
 await tab.locator('chrome-urls-app cr-button').waitFor({state:'visible',timeout:10000});
 if(await enabled.count())return {status:'already-enabled',clicked:false};
 await enable.click({timeout:5000});
 await enabled.waitFor({state:'visible',timeout:5000});
 return {status:'enabled',clicked:true};
}
async function readShadowText(locator){
 return sanitize(await locator.evaluate(root=>{
  const collect=root=>Array.from(root.childNodes).map(n=>n.nodeType===3?n.textContent:n.nodeType===1&&!['STYLE','SCRIPT'].includes(n.tagName)?collect(n.shadowRoot??n):'').join(' ');
  return collect(root.shadowRoot??root).replace(/\s+/g,' ').trim().slice(0,100000);
 }));
}
async function capturePanel(tab,name,selector){
 const panel={status:'PAGE_UNAVAILABLE',inspected:false};
 try{
  await tab.getByRole('tab',{name,exact:true}).click({timeout:5000});
  const content=tab.locator(selector);
  await content.waitFor({state:'visible',timeout:5000});
  // Require populated broker properties, not merely an empty WebUI shell.
  await content.locator(name==='Broker State'?'td.property-name':'th.message').first().waitFor({state:'visible',timeout:5000});
  panel.text=await readShadowText(content);
  const required=name==='Broker State'?['Broker Properties','Manifest Criteria','Unavailable Reason']:['Event Logs','Source Location','Log Message'];
  if(!required.every(x=>panel.text.includes(x)))throw Error(name+' content markers missing');
  panel.rowCount=await content.locator('tbody tr').count();
  panel.status='CAPTURED';panel.inspected=true;
 }catch(e){panel.error=sanitize(e.message);}
 return panel;
}
export async function captureDiagnostics(context,out,label){
 const records=[];
 // Same isolated profile; delete every diagnostic page's raw video, including chrome-urls.
 for(const url of ['chrome://on-device-internals/','chrome://policy/','chrome://gpu/','chrome://components/']){
  let tab;const entry={url,at:new Date().toISOString()};
  try{
   tab=await context.newPage();
   if(url.includes('on-device-internals')){
    entry.status='PAGE_UNAVAILABLE';entry.brokerInspected=false;
    entry.brokerState={status:'PAGE_UNAVAILABLE',inspected:false};
    entry.eventLogs={status:'PAGE_UNAVAILABLE',inspected:false};
    entry.debugPages={status:'PAGE_UNAVAILABLE'};
    entry.debugPages=await enableDebugPages(tab);
   }
   await tab.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
   await tab.waitForTimeout(750);
   if(url.includes('on-device-internals')){
    // Navigation only: never Tools, Reset, Uninstall, Dump or use-case controls.
    entry.brokerState=await capturePanel(tab,'Broker State','on-device-internals-broker-state');
    entry.eventLogs=await capturePanel(tab,'Event Logs','on-device-internals-event-log');
    entry.brokerInspected=entry.brokerState.inspected;
    entry.status=entry.brokerState.inspected&&entry.eventLogs.inspected?'CAPTURED':'PAGE_UNAVAILABLE';
    if(entry.status!=='CAPTURED')entry.text=await readShadowText(tab.locator('body'));
   }else entry.text=await readShadowText(tab.locator('body'));
  }catch(e){entry.error=sanitize(e.message);}finally{const video=tab?.video();await tab?.close().catch(()=>{});await video?.delete().catch(()=>{});}
  records.push(entry);
 }
 await writeFile(resolve(out,'diagnostics-'+label+'.json'),JSON.stringify(records,null,2));
 return records;
}

export async function readEffectiveArgs(context,cdp){
 try{return {source:'CDP',arguments:(await cdp.send('Browser.getBrowserCommandLine')).arguments};}
 catch(e){
  let tab;
  try{
   tab=await context.newPage();await tab.goto('chrome://version/',{waitUntil:'domcontentloaded',timeout:15000});
   const command=await tab.locator('#command_line').textContent({timeout:5000});
   if(!command?.trim())throw Error('Chrome version command line unavailable');
   return {source:'chrome://version',arguments:command.match(/--[^\s]+/g)??[],cdpError:sanitize(e.message)};
  }finally{const video=tab?.video();await tab?.close().catch(()=>{});await video?.delete().catch(()=>{});}
 }
}
