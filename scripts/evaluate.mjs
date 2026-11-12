// Offline only. Vite loads the existing TypeScript modules; no new dependency.
import {createServer} from 'vite';
import {readFile} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {evalCorpus,regexEvaluation,characterCounts,CORPUS_VERSION}=await server.ssrLoadModule('/src/eval-corpus.ts');
 const {regexSpans}=await server.ssrLoadModule('/src/regex.ts');
 const mode=process.argv[2]??'regex';
 if(mode==='regex')console.log(JSON.stringify(regexEvaluation(),null,2));
 else if(mode==='export')console.log(JSON.stringify({corpusVersion:CORPUS_VERSION,letters:evalCorpus},null,2));
 else if(mode==='import'){
  const run=JSON.parse(await readFile(process.argv[3],'utf8'));
  if(run.corpusVersion!==CORPUS_VERSION||run.provenance!=='REAL_ON_DEVICE'||!run.browser||!run.os||!run.model||!run.recordedAt||!Number.isFinite(run.initializationMs)||run.initializationMs<0||!Array.isArray(run.results))throw Error('Missing real-device provenance');
  if(!run.results.length)throw Error('No results: keep model metrics NOT_RUN');
  const seen=new Set(),rows=[];
  for(const r of run.results){
   const l=evalCorpus.find(l=>l.id===r.id);
   if(!l||seen.has(r.id)||r.transcription!==l.text||!Number.isFinite(r.latencyMs)||r.latencyMs<0||!Array.isArray(r.spans))throw Error('Unknown/duplicate id, invalid time, spans, or transcription mismatch');
   seen.add(r.id);
   const nano=characterCounts(l.text,l.truth,r.spans),combined=characterCounts(l.text,l.truth,[...r.spans,...regexSpans(l.text)]);
   rows.push({id:r.id,nano,combined,latencyMs:r.latencyMs});
  }
  const aggregate=key=>{const c=rows.reduce((a,r)=>({tp:a.tp+r[key].tp,actual:a.actual+r[key].actual,predicted:a.predicted+r[key].predicted}),{tp:0,actual:0,predicted:0});return {...c,recall:c.actual?c.tp/c.actual:null,precision:c.predicted?c.tp/c.predicted:null};};
  const decisions=run.twoKeyDecisions??[],decisionIds=new Set();let caught=0,falseAlarms=0,mutations=0,controls=0;
  for(const d of decisions){
   const l=evalCorpus.find(l=>l.id===d.id),key=d.id+':'+d.variant;
   if(!l||decisionIds.has(key)||!['control','deadline','amountPence','action'].includes(d.variant)||typeof d.rejected!=='boolean'||!Number.isFinite(d.latencyMs)||d.latencyMs<0)throw Error('Invalid two-key decision');
   decisionIds.add(key);
   if(d.variant==='control'){controls++;falseAlarms+=Number(d.rejected);}else{mutations++;caught+=Number(d.rejected);}
  }
  console.log(JSON.stringify({status:'IMPORTED_OPERATOR_MEASUREMENTS_NOT_INDEPENDENTLY_ATTESTED',coverage:rows.length+'/'+evalCorpus.length,corpusVersion:CORPUS_VERSION,nano:aggregate('nano'),combined:aggregate('combined'),initializationMs:run.initializationMs,latencyMs:rows.map(r=>r.latencyMs),twoKeyModelCatchRate:mutations?caught/mutations:'NOT_RUN',twoKey:{caught,mutations,falseAlarms,controls},rows},null,2));
 }else throw Error('Usage: node scripts/evaluate.mjs [regex|export|import results.json]');
}finally{await server.close();}
