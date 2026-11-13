// Hosting-only release gate. No Firebase invocation without explicit --execute.
import {readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const PROJECT='safe-to-send-2026';
const sha256=data=>createHash('sha256').update(data).digest('hex');
const exact=(obj,keys)=>obj && typeof obj==='object' && !Array.isArray(obj) && Object.keys(obj).sort().join()===keys.sort().join();
export function parseArgs(args){
 const options={execute:false};
 for(let i=0;i<args.length;i++){
  const key=args[i];
  if(key==='--execute'){if(options.execute)throw Error('Duplicate execute flag');options.execute=true;}
  else if(['--source','--config'].includes(key)){
   const name=key.slice(2);if(options[name]||!args[i+1]||args[i+1].startsWith('--'))throw Error('Invalid argument');options[name]=args[++i];
  }else throw Error('Unknown argument');
 }
 if(!/^[0-9a-f]{40}$/.test(options.source??'')||!options.config)throw Error('Require --source FULL_SHA --config PRIVATE_PUBLIC_METADATA_JSON [--execute]');
 return options;
}
export function validateMetadata(c){
 if(!exact(c,['firebase','recaptchaEnterpriseSiteKey'])||!exact(c.firebase,['apiKey','appId','projectId']))throw Error('Only allowlisted public metadata permitted');
 const f=c.firebase;
 if(f.projectId!==PROJECT||f.appId!=='1:794092402064:web:4e263548738bdb75a8af15'||typeof f.apiKey!=='string'||!/^AIza[\w-]{30,50}$/.test(f.apiKey)||typeof c.recaptchaEnterpriseSiteKey!=='string'||!/^6L[\w-]{20,100}$/.test(c.recaptchaEnterpriseSiteKey))throw Error('Invalid release metadata');
}
export function validateTargets(rc,config){
 if(rc.projects?.default!==PROJECT||JSON.stringify(rc.targets?.[PROJECT]?.hosting)!==JSON.stringify({raw:[PROJECT],cloud:['safe-to-send-cloud-2026']}))throw Error('Hosting mapping changed; review required');
 if(!Array.isArray(config.hosting)||config.hosting.length!==2||Object.keys(config).join()!=='hosting')throw Error('Hosting-only config required');
 for(const [target,dir] of [['raw','dist'],['cloud','dist-cloud']]){
  const h=config.hosting.find(x=>x.target===target);
  if(!h||h.public!==dir||h.site||h.predeploy||h.postdeploy||h.redirects||h.rewrites?.length!==1||h.rewrites[0].source!=='**'||h.rewrites[0].destination!=='/index.html')throw Error('Unexpected Hosting configuration');
 }
}
function inventory(dir){
 const files=[];
 function walk(path){for(const name of readdirSync(path).sort()){
  const p=resolve(path,name),stat=lstatSync(p);if(stat.isSymbolicLink())throw Error('Build symlink refused');
  if(stat.isDirectory())walk(p);else if(stat.isFile()){const data=readFileSync(p);files.push({path:relative(process.cwd(),p),bytes:data.length,sha256:sha256(data)});}
 }}walk(resolve(dir));
 if(!files.some(f=>f.path===dir+'/index.html'))throw Error('Missing built entry');return files;
}
export function main(args){
 const opts=parseArgs(args);
 const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
 const run=(cmd,args,env=process.env)=>execFileSync(cmd,args,{stdio:'inherit',env});
 const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
 const assertSource=()=>{if(git('rev-parse','HEAD')!==opts.source||git('status','--porcelain','--untracked-files=all'))throw Error('Exact clean source SHA required');};
 assertSource();
 const rc=JSON.parse(readFileSync('.firebaserc','utf8')),config=JSON.parse(readFileSync('firebase.json','utf8'));
 validateTargets(rc,config);
 const metadataBytes=readFileSync(resolve(opts.config));validateMetadata(JSON.parse(metadataBytes));
 // Public-metadata input is copied to an ignored snapshot; never log values or private paths.
 const out=resolve('.openclaw/tmp/release');mkdirSync(out,{recursive:true});
 const snapshot=resolve(out,'public-metadata.json');writeFileSync(snapshot,metadataBytes,{mode:0o600});
 const env={...process.env,SAFE_TO_SEND_BROKER_CONFIG:snapshot};
 // Fresh lockfile install, no dependency lifecycle scripts. No provider calls in these gates.
 run('npm',['ci','--ignore-scripts'],env);
 run(process.execPath,['--test','scripts/deploy-hosting.test.mjs'],env);
 run('npm',['test'],env);
 run('npm',['run','test:operator'],env);
 run(process.execPath,['node_modules/typescript/bin/tsc','-p','operator/device-eval/tsconfig.json'],env);
 run('npm',['run','build'],env);
 assertSource();
 const artifacts=[...inventory('dist'),...inventory('dist-cloud')];
 const receipt={classification:'HOSTING_CANDIDATE_NOT_LIVE_VERIFICATION',source:opts.source,node:process.version,project:PROJECT,targets:['raw','cloud'],metadataSha256:sha256(metadataBytes),configSha256:sha256(readFileSync('firebase.json')),mappingSha256:sha256(readFileSync('.firebaserc')),gates:['lockfile-install','offline-release-contract','unit','operator','operator-typecheck','production-typecheck-dual-build'],artifacts,deploymentRequested:opts.execute};
 writeFileSync(resolve(out,'candidate.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({mode:opts.execute?'EXECUTE':'PLAN_ONLY',source:opts.source,project:PROJECT,targets:['raw','cloud'],artifacts:artifacts.length,receipt:'.openclaw/tmp/release/candidate.json'}));
 if(!opts.execute){console.log('No deployment performed. Owner approval and release review remain required.');return;}
 // Explicit project and both existing Hosting targets only: no rules, Functions or resources.
 assertSource();
 run('firebase',['deploy','--project',PROJECT,'--only','hosting:raw,hosting:cloud','--config','firebase.json','--non-interactive'],env);
 console.log('Deploy command completed; live artifact parity and real-browser smoke verification are still required.');
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main(process.argv.slice(2));}catch{console.error('Release gate failed; no further steps run. Inspect the preceding gate output (private metadata is never printed).');process.exitCode=1;}
}
