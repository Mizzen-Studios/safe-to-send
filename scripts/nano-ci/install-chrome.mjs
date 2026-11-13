import {execFileSync} from 'node:child_process';
import {mkdir,writeFile,access,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {variantConfig} from './variants.mjs';

async function installChrome({variant,platform,env,out,run=execFileSync,download=fetch}){
 await mkdir(out,{recursive:true});
 if(!['linux','win32'].includes(platform))throw Error('Unsupported platform');
 // Never put large downloaded executables in the always-uploaded evidence directory.
 const staging=await mkdtemp(join(resolve(env.RUNNER_TEMP??env.GITHUB_WORKSPACE??process.cwd()),'.nano-chrome-install-'));
 let source;
 try{
  if(platform==='linux'){
   const pkg=variant.channel==='stable'?'google-chrome-stable':'google-chrome-unstable';
   source='https://dl.google.com/linux/direct/'+pkg+'_current_amd64.deb';
   const file=resolve(staging,'chrome.deb');
   run('curl',['--fail','--location','--max-time','180',source,'--output',file],{stdio:'inherit'});
   run('sudo',['apt-get','install','-y',file],{stdio:'inherit',timeout:240000});
  }else{
   // Google Omaha tagged standalone installers; verify Authenticode BEFORE execution.
   const guid=variant.channel==='canary'?'4ea16ac7-fd5a-47c3-875b-dbf4a2008c20':variant.channel==='dev'?'401c381f-e0de-4b85-8bd8-3f3f14fbda57':'8a69d345-d564-463c-aff1-a69d9e530f96';
   const tag='appguid={'+guid+'}&lang=en&needsadmin='+(variant.channel==='canary'?'false':'true')+'&ap=x64-'+(variant.channel==='stable'?'stable':variant.channel);
   source='https://dl.google.com/tag/s/'+encodeURIComponent(tag)+'/chrome/install/ChromeStandaloneSetup64.exe';
   const file=resolve(staging,'chrome-installer.exe');
   const response=await download(source,{signal:AbortSignal.timeout(180000)});
   if(!response.ok)throw Error('Official installer HTTP '+response.status);
   await writeFile(file,new Uint8Array(await response.arrayBuffer()));
   // Stay in PowerShell 7 like the Actions shell, rather than spawning legacy powershell.exe.
   // Explicit import surfaces the underlying module error instead of a generic autoload failure.
   // https://learn.microsoft.com/powershell/module/microsoft.powershell.core/import-module
   // https://learn.microsoft.com/powershell/module/microsoft.powershell.security/get-authenticodesignature
   const ps=
    '$ErrorActionPreference="Stop"; '+
    'Import-Module Microsoft.PowerShell.Security -ErrorAction Stop; '+
    '$null=Get-Command -Name Get-AuthenticodeSignature -Module Microsoft.PowerShell.Security -CommandType Cmdlet -ErrorAction Stop; '+
    "$file='"+file.replaceAll("'","''")+"'; "+
    '$s=Microsoft.PowerShell.Security\\Get-AuthenticodeSignature -LiteralPath $file -ErrorAction Stop; '+
    'if ($s.Status -ne "Valid" -or $null -eq $s.SignerCertificate -or $s.SignerCertificate.Subject -notmatch "(?:^|,\\s*)O=Google (LLC|Inc)(?:,|$)") { throw ("Invalid Google installer signature: status={0}; detail={1}" -f $s.Status,$s.StatusMessage) }; '+
    '$p=Start-Process -FilePath $file -ArgumentList "/silent","/install" -Wait -PassThru -ErrorAction Stop; '+
    'if($p.ExitCode -ne 0){throw ("Chrome installer failed: exit code {0}" -f $p.ExitCode)}';
   run('pwsh',['-NoProfile','-NonInteractive','-Command',ps],{stdio:'inherit',timeout:240000});
  }
 }finally{
  // Includes HTTP/write, signature/module, curl/apt and installer failures.
  await rm(staging,{recursive:true,force:true});
 }
 await access(variant.executable);
 await writeFile(resolve(out,'installation.json'),JSON.stringify({channel:variant.channel,source,executable:variant.executable,distribution:'Google Chrome, not Chrome for Testing; runtime version recorded by probe'},null,2));
}

// Explicit in-process test seam only; no environment/config switch can bypass real CLI verification.
export async function installChrome_TEST_ONLY(options){
 if(!process.env.NODE_TEST_CONTEXT)throw Error('TEST_ONLY: run with node --test');
 if(typeof options.run!=='function'||typeof options.download!=='function')throw Error('TEST_ONLY requires mocked execution and download');
 return installChrome(options);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 await installChrome({variant:variantConfig(),platform:process.platform,env:process.env,out:resolve('scripts/nano-ci/artifacts')});
}
