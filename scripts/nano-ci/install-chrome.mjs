import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,access,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {variantConfig} from './variants.mjs';
const variant=variantConfig(),out=resolve('scripts/nano-ci/artifacts');await mkdir(out,{recursive:true});
let source;
if(process.platform==='linux'){
 const pkg=variant.channel==='stable'?'google-chrome-stable':'google-chrome-unstable';
 source='https://dl.google.com/linux/direct/'+pkg+'_current_amd64.deb';
 const file=resolve(out,'chrome.deb');
 execFileSync('curl',['--fail','--location','--max-time','180',source,'--output',file],{stdio:'inherit'});
 execFileSync('sudo',['apt-get','install','-y',file],{stdio:'inherit',timeout:240000});
 await unlink(file);
}else if(process.platform==='win32'){
 // Google Omaha tagged standalone installers; verify Authenticode BEFORE execution.
 const guid=variant.channel==='canary'?'4ea16ac7-fd5a-47c3-875b-dbf4a2008c20':variant.channel==='dev'?'401c381f-e0de-4b85-8bd8-3f3f14fbda57':'8a69d345-d564-463c-aff1-a69d9e530f96';
 const appGuid=guid;
 const tag='appguid={'+appGuid+'}&lang=en&needsadmin='+ (variant.channel==='canary'?'false':'true')+'&ap=x64-'+(variant.channel==='stable'?'stable':variant.channel);
 source='https://dl.google.com/tag/s/'+encodeURIComponent(tag)+'/chrome/install/ChromeStandaloneSetup64.exe';
 const file=resolve(out,'chrome-installer.exe');
 const response=await fetch(source,{signal:AbortSignal.timeout(180000)});if(!response.ok)throw Error('Official installer HTTP '+response.status);
 await writeFile(file,new Uint8Array(await response.arrayBuffer()));
 const ps='$ErrorActionPreference="Stop"; $file="'+file.replaceAll("'","''")+'"; $s=Get-AuthenticodeSignature -FilePath $file; if ($s.Status -ne "Valid" -or $s.SignerCertificate.Subject -notmatch "O=Google (LLC|Inc)") { throw "Invalid Google installer signature" }; $p=Start-Process -FilePath $file -ArgumentList "/silent","/install" -Wait -PassThru; if($p.ExitCode -ne 0){throw "Chrome installer failed"}';
 execFileSync('powershell',['-NoProfile','-Command',ps],{stdio:'inherit',timeout:240000});
 await unlink(file);
}else throw Error('Unsupported platform');
await access(variant.executable);
await writeFile(resolve(out,'installation.json'),JSON.stringify({channel:variant.channel,source,executable:variant.executable,distribution:'Google Chrome, not Chrome for Testing; runtime version recorded by probe'},null,2));
