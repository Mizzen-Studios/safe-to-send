import {it,expect} from 'vitest';
import {parseTextDetection,piiKinds} from '../src/nano';
const raw='📨 Dear Maya Synthetic, Maya Synthetic';
it('validates UTF-16 offsets without requiring transcription or finding text; preserves exact occurrences',()=>{
 const spans=[{start:8,end:22,kind:'NAME'},{start:24,end:38,kind:'NAME'}];expect(raw.slice(8,22)).toBe('Maya Synthetic');expect(parseTextDetection(JSON.stringify({spans}),raw)).toEqual(spans);expect(parseTextDetection('{"spans":[]}',raw)).toEqual([]);
});
it.each([
 {start:-1,end:3,kind:'NAME'}, {start:3,end:3,kind:'NAME'}, {start:3,end:2,kind:'NAME'},
 {start:0,end:999,kind:'NAME'}, {start:1.5,end:3,kind:'NAME'}, {start:0,end:1.5,kind:'NAME'},
 {start:'0',end:3,kind:'NAME'}, {start:0,end:'3',kind:'NAME'}, {start:null,end:3,kind:'NAME'},
 {start:0,end:3,kind:'PERSONAL'}, {start:0,end:3,kind:'name'}, {start:0,end:3,kind:5},
 {start:0,end:1,kind:'NAME'}, {start:1,end:2,kind:'NAME'},
 {start:0,end:2,kind:'NAME',text:'📨'}, {start:0,end:2}, null, []
])('rejects bounds/type/kind errors and split surrogate pairs %j',(span)=>{expect(()=>parseTextDetection(JSON.stringify({spans:[span]}),raw)).toThrow('Invalid Nano offset');});
it('accepts complete surrogate pair boundaries and all supported PII kinds',()=>{for(const kind of piiKinds)expect(parseTextDetection(JSON.stringify({spans:[{start:0,end:2,kind}]}),raw)).toEqual([{start:0,end:2,kind}]);});
it.each([null,[],{}, {spans:null},{spans:{}},{spans:[],letter:raw},{transcription:raw,findings:[]},{spans:[],transcription:raw},{spans:[],findings:[]}])('rejects whole-letter and mixed/wrong schemas %j',(response)=>{expect(()=>parseTextDetection(JSON.stringify(response),raw)).toThrow('Invalid Nano offset response');});
it('bounds response count and bytes; malformed JSON errors never echo source',()=>{
 expect(()=>parseTextDetection(JSON.stringify({spans:Array.from({length:1001},()=>({start:0,end:2,kind:'NAME'}))}),raw)).toThrow();expect(()=>parseTextDetection(' '.repeat(100001),raw)).toThrow();let error:unknown;try{parseTextDetection(raw,raw);}catch(e){error=e;}expect(String(error)).toBe('Error: Invalid Nano offset response');expect(String(error)).not.toContain('Maya');
});
it('normalizes unsorted/overlapping spans only after validating each offset and kind',()=>{expect(parseTextDetection(JSON.stringify({spans:[{start:10,end:20,kind:'NAME'},{start:8,end:15,kind:'ADDRESS'}]}),raw)).toEqual([{start:8,end:20,kind:'ADDRESS'}]);});
