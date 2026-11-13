// Not a product Vite mode: no product config/env loading, no deploy or cloud API.
import {build} from 'vite';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
export const CSP="default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors 'none'; worker-src 'none'";
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=resolve(root,'.openclaw/tmp/device-eval-dist');
export async function buildCollector(){
 const paths=['src/nano.ts','src/hybrid.ts','src/eval-corpus.ts','operator/device-eval/core.ts','operator/device-eval/native.ts','operator/device-eval/page.ts','operator/device-eval/run.mjs','package-lock.json'];
 const hashes=Object.fromEntries(await Promise.all(paths.map(async p=>[p,createHash('sha256').update(await readFile(resolve(root,p))).digest('hex')])));
 const source={commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}).trim(),sha256:hashes};
 await build({root,configFile:false,envDir:false,publicDir:false,define:{__EVAL_SOURCE__:JSON.stringify(source)},build:{outDir:out,emptyOutDir:true,rollupOptions:{input:resolve(root,'operator/device-eval/index.html')}}});
}
export function staticHandler(directory=out){return async(req,res)=>{
 const port=req.socket.localPort;
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)||!['GET','HEAD'].includes(req.method)){res.writeHead(403);res.end();return;}
 const path=(req.url??'').split('?')[0];
 let relative;
 if(path==='/')relative='operator/device-eval/index.html';
 else if(path.startsWith('/assets/') && /^[a-zA-Z0-9_-]+[.](js|css)$/.test(path.slice(8)))relative=path.slice(1);
 else{res.writeHead(404);res.end();return;}
 try{const file=resolve(directory,relative);const info=await stat(file);if(!info.isFile())throw Error('Not a file');
 const body=await readFile(file);res.writeHead(200,{'Content-Security-Policy':CSP,'Content-Type':extname(file)==='.html'?'text/html; charset=utf-8':extname(file)==='.js'?'text/javascript; charset=utf-8':'text/css','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end();}
};}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2]??'serve';if(!['build','serve'].includes(mode))throw Error('Usage: node operator/device-eval/run.mjs [build|serve]');
 await buildCollector();
 if(mode==='serve'){
  // Canonical Safe to Send port; fail rather than steal it or auto-increment.
  const server=createServer(staticHandler());server.listen(5192,'127.0.0.1',()=>console.log('OPERATOR ONLY: http://127.0.0.1:5192/ — never publish this build'));
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close());
 }
}
