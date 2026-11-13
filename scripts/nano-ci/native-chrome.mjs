import {spawn} from 'node:child_process';
import {mkdir,readFile,statfs} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function launchNative(chromium,variant){
 if(process.arch!=='x64')throw Error('Only standard x64 runners authorized');
 await mkdir(variant.profile,{recursive:true});
 const disk=await statfs(variant.profile);
 if(disk.bavail*disk.bsize<22*1024**3)throw Error('Profile volume has less than 22 GiB free; no automatic cleanup');
 // No Playwright launch defaults, no --no-sandbox, no eligibility override in native rows.
 const args=[...variant.flags,'--user-data-dir='+variant.profile,'--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--window-size=1280,900','about:blank'];
 const child=spawn(variant.executable,args,{stdio:['ignore','pipe','pipe'],windowsHide:false});
 let failure,stderr='';child.on('error',e=>failure=e);child.stderr.on('data',d=>{stderr=(stderr+d.toString()).slice(-16000);});child.stdout.resume();
 let browser;
 try{
  const deadline=Date.now()+30000;
  while(Date.now()<deadline){
   if(failure)throw failure;
   if(child.exitCode!==null)throw Error('Native Chrome exited '+child.exitCode+' '+stderr);
   try{const endpoint=parseDevToolsEndpoint(await readFile(resolve(variant.profile,'DevToolsActivePort'),'utf8'));browser=await chromium.connectOverCDP(endpoint,{timeout:2000});break;}catch{await new Promise(r=>setTimeout(r,250));}
  }
  if(!browser)throw Error('Native Chrome CDP startup timeout '+stderr);
  const context=browser.contexts()[0];if(!context)throw Error('No persistent native context');
  return {context,args,close:async()=>{try{const cdp=await browser.newBrowserCDPSession();await cdp.send('Browser.close');}finally{await browser.close().catch(()=>{});if(child.exitCode===null)child.kill();}}};
 }catch(e){if(child.exitCode===null)child.kill();throw e;}
}

export function parseDevToolsEndpoint(value){
 const [port,path]=value.trim().split(/\r?\n/);
 if(!/^\d+$/.test(port)||Number(port)<1||Number(port)>65535||!/^\/devtools\/browser\/[a-zA-Z0-9-]+$/.test(path??''))throw Error('Invalid local Chrome DevTools endpoint');
 return 'ws://127.0.0.1:'+Number(port)+path;
}
