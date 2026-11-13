import {resolve,join} from 'node:path';
export const channels=['stable','dev','canary'];
export function variantConfig(env=process.env,platform=process.platform){
 const channel=env.NANO_CHANNEL??'stable',diagnostic=env.NANO_DIAGNOSTIC==='requested-perf-bypass';
 if(!channels.includes(channel))throw Error('Unsupported channel');
 if(env.NANO_DIAGNOSTIC&&!diagnostic)throw Error('Unsupported diagnostic');
 if(platform!=='win32'&&channel==='canary')throw Error('Canary is Windows-only in this matrix');
 const id=channel+(diagnostic?'-requested-perf-bypass':'-native');
 const flags=['--enable-features=AIPromptAPI,AIPromptAPIMultimodalInput'+(diagnostic?',OptimizationGuideOnDeviceModel:BypassPerfRequirement/true,PromptAPIForGeminiNano':'')];
 const executable=platform==='win32'?join(channel==='canary'?env.LOCALAPPDATA:env.PROGRAMFILES,'Google',channel==='stable'?'Chrome':channel==='dev'?'Chrome Dev':'Chrome SxS','Application','chrome.exe'):channel==='stable'?'/opt/google/chrome/chrome':'/opt/google/chrome-unstable/chrome';
 return {id,channel,diagnostic,flags,executable,profile:resolve('scripts/nano-ci/profiles',id),normalEligibilityAttested:false,flagSupport:diagnostic?'USER_REQUESTED_UNVERIFIED_MAY_BE_IGNORED':'AIPromptAPI names source-verified for prior Chrome 157; current channel support must be observed'};
}
