import type {Capture,Lifecycle} from './core';
export async function sha(value:unknown){const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');}
/** Operator-only wrapper around the genuine native provider. No fake responses.
 * Preserves production prompt/schema bytes; adds abort signals and destroys sessions.
 * Install BEFORE createNano: Firebase captures LanguageModel in its constructor. */
export function recordNativeProvider():Lifecycle{
 const g=globalThis as any,original=g.LanguageModel;
 if(typeof original?.create!=='function'||typeof original?.availability!=='function')throw Error('Native LanguageModel API absent; NOT_RUN');
 const descriptor=Object.getOwnPropertyDescriptor(g,'LanguageModel');
 let active:{signal:AbortSignal;capture:Capture}|undefined,closed=false;
 const sessions=new Set<any>();
 const destroy=(session:any)=>{sessions.delete(session);try{session.destroy();}catch{/* already destroyed */}};
 const wrapper=new Proxy(original,{get(target,key){
  if(key==='availability')return async(...args:any[])=>{
   const op=active;if(closed||!op||op.signal.aborted)throw Error('Inactive evaluation');
   const start=performance.now(),call:any={operation:'availability',status:'pending',options:structuredClone(args),startedAt:new Date().toISOString()};op.capture.nativeCalls.push(call);
   try{const value=await target.availability(...args);call.status='success';call.value=value;return value;}catch(e){call.status='error';call.error=String(e);op.capture.nativeErrors.push({operation:'availability',error:String(e)});throw e;}finally{call.latencyMs=performance.now()-start;}
  };
  if(key==='create')return async(options:any={})=>{
   const op=active;if(closed||!op||op.signal.aborted)throw Error('Inactive evaluation');
   const start=performance.now();
   const call:any={operation:'create',status:'pending',options:{...options,monitor:options.monitor?'SDK_DOWNLOAD_MONITOR':undefined},startedAt:new Date().toISOString()};op.capture.nativeCalls.push(call);
   try{
    const session=await target.create({...options,signal:op.signal});
    if(closed||op!==active||op.signal.aborted){destroy(session);throw Error('Late native session destroyed');}
    sessions.add(session);call.status='success';call.latencyMs=performance.now()-start;
    const abort=()=>destroy(session);op.signal.addEventListener('abort',abort,{once:true});
    return new Proxy(session,{get(s,k){
     if(k==='destroy')return ()=>{op.signal.removeEventListener('abort',abort);destroy(s);};
     if(k==='prompt')return async(input:any,promptOptions:any={})=>{
      if(closed||op!==active||op.signal.aborted)throw Error('Inactive evaluation prompt');
      const before=performance.now();
      const p:any={operation:'prompt',status:'pending',input:structuredClone(input),schema:structuredClone(promptOptions.responseConstraint),startedAt:new Date().toISOString()};op.capture.nativeCalls.push(p);
      try{const raw=await s.prompt(input,{...promptOptions,signal:op.signal});
       if(closed||op!==active||op.signal.aborted)throw Error('Late native output discarded');
       op.capture.rawOutputs.push(raw);p.status='success';return raw;
      }catch(e){p.status='error';p.error=String(e);op.capture.nativeErrors.push({operation:'prompt',error:String(e)});throw e;}
      finally{p.latencyMs=performance.now()-before;}
     };
     const value=Reflect.get(s,k,s);return typeof value==='function'?value.bind(s):value;
    }});
   }catch(e){call.status='error';call.error=String(e);call.latencyMs=performance.now()-start;op.capture.nativeErrors.push({operation:'create',error:String(e)});throw e;}
  };
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
 Object.defineProperty(g,'LanguageModel',{configurable:true,writable:true,value:wrapper});
 return {begin(signal,capture){if(closed||active)throw Error('Invalid native lifecycle');active={signal,capture};},end(){active=undefined;for(const s of [...sessions])destroy(s);},close(){if(closed)return;closed=true;active=undefined;for(const s of [...sessions])destroy(s);if(descriptor)Object.defineProperty(g,'LanguageModel',descriptor);else delete g.LanguageModel;}};
}
export async function hashCaptures(run:any){
 for(const row of [run.initialization,...run.detectors,...run.verifiers])for(const c of row.capture.nativeCalls)if(c.operation==='prompt'){c.promptSha256=await sha(c.input);c.schemaSha256=await sha(c.schema);}
 return run;
}
