/** Allowlisted codes only. Optional raw observer is in-memory and operator-installed, never persisted by product. */
const codes=new Set(['REVIEW_REQUIRED','ANSWER_GENERATION','ANSWER_SCHEMA','ANSWER_EVIDENCE','VERIFICATION_GENERATION','VERIFICATION_SCHEMA','ANSWER_REDACTION','ANSWER_REPLY_ENVELOPE','MODEL_CREATE','MODEL_INITIALIZE','MODEL_GENERATE','INFERENCE_SOURCE','RESPONSE_TEXT','VERIFIER_WIRE_SCHEMA']);
export class LocalOperationError extends Error{constructor(readonly code:string){super('On-device operation unavailable; no cloud fallback.');}}
export function localFailureCode(error:unknown,stage:string){const code=error instanceof LocalOperationError?error.code:stage;return codes.has(code)?code:'LOCAL_UNAVAILABLE';}
export function localExceptionCode(error:unknown){const name=error&&typeof error==='object'&&'name' in error?String(error.name):'';return new Set(['AbortError','NotSupportedError','SyntaxError','TypeError','QuotaExceededError','InvalidStateError','OperationError','NotAllowedError','UnknownError','Error']).has(name)?name:'UNCLASSIFIED';}
type Diagnostic={operation:string;stage:string;raw?:string;exception?:string};
let observer:((value:Diagnostic)=>void)|undefined;
export function observeLocalDiagnostics(listener:(value:Diagnostic)=>void){observer=listener;return()=>{observer=undefined;};}
export function emitLocalDiagnostic(value:Diagnostic){observer?.({...value,raw:value.raw?.slice(0,100000)});}
