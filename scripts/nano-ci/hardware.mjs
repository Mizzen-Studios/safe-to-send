import os from 'node:os';
import {mkdir,writeFile,statfs} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
await mkdir('scripts/nano-ci/artifacts',{recursive:true});
const disk=await statfs('.');
let gpu;
try {gpu=process.platform==='win32'?execFileSync('powershell',['-NoProfile','-Command','Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion | ConvertTo-Json'],{encoding:'utf8'}):execFileSync('lspci',[],{encoding:'utf8'}).split('\n').filter(x=>/VGA|3D|Display/i.test(x));} catch(e){gpu=String(e.message);}
const info={at:new Date().toISOString(),os:os.platform(),release:os.release(),arch:os.arch(),cpu:os.cpus().map(c=>c.model),logicalCpus:os.availableParallelism(),totalRamBytes:os.totalmem(),freeRamBytes:os.freemem(),diskAvailableBytes:disk.bavail*disk.bsize,gpu,runnerImage:process.env.ImageOS,runnerImageVersion:process.env.ImageVersion};
console.log(JSON.stringify(info,null,2));await writeFile('scripts/nano-ci/artifacts/hardware.json',JSON.stringify(info,null,2));
