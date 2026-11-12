import {defineConfig} from 'vite';
import {readFileSync,renameSync} from 'node:fs';
import {resolve} from 'node:path';
export default defineConfig(({mode})=>{
 const broker=mode==='broker';
 let config:unknown=null;
 // Private local build input, public fields ONLY. No env dump, debug token or secret.
 if(process.env.SAFE_TO_SEND_BROKER_CONFIG){
  config=JSON.parse(readFileSync(process.env.SAFE_TO_SEND_BROKER_CONFIG,'utf8'));
  const c=config as Record<string,unknown>,f=c?.firebase as Record<string,unknown>;
  if(!c||Object.keys(c).sort().join()!=='firebase,recaptchaEnterpriseSiteKey'||!f||Object.keys(f).sort().join()!=='apiKey,appId,projectId')throw Error('Only public broker metadata allowed');
 }
 const deviceConfig=config?{...(config as {firebase:Record<string,string>}).firebase,appId:'1:794092402064:web:5b3e44ad9cab0a51a8af15'}:null;
 return {define:{__BROKER_CONFIG__:JSON.stringify(broker?config:null),__DEVICE_CONFIG__:JSON.stringify(deviceConfig)},build:{outDir:broker?'dist-cloud':'dist',rollupOptions:{input:resolve(broker?'broker/index.html':'index.html')}},plugins:broker?[{name:'broker-index',closeBundle(){renameSync('dist-cloud/broker/index.html','dist-cloud/index.html');}}]:[]};
});
