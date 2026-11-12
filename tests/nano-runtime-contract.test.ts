import {it,expect,vi,afterEach} from 'vitest';
const sdk=vi.hoisted(()=>({initialize:vi.fn(),generate:vi.fn(),model:vi.fn(),ai:vi.fn(),app:vi.fn()}));
vi.mock('firebase/app',()=>({initializeApp:sdk.app}));
vi.mock('firebase/ai',()=>({getAI:sdk.ai,getGenerativeModel:sdk.model,GoogleAIBackend:class{},InferenceMode:{ONLY_ON_DEVICE:'device'},InferenceSource:{ON_DEVICE:'device'}}));
import {createNano} from '../src/nano';
function browser(){vi.stubGlobal('window',{});vi.stubGlobal('document',{});vi.stubGlobal('isSecureContext',true);vi.stubGlobal('LanguageModel',{availability:vi.fn(),create:vi.fn()});sdk.model.mockReturnValue({initializeDeviceModel:sdk.initialize,generateContent:sdk.generate});sdk.initialize.mockResolvedValue(undefined);}
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
it('actual adapter invokes device-only SDK path, without cloud params (SDK MOCK, not inference)',async()=>{
 browser();const nano=createNano({});await nano.initialize(()=>{});sdk.generate.mockResolvedValue({response:{inferenceSource:'device',text:()=>JSON.stringify({transcription:'Dear Maya',findings:[{text:'Maya',kind:'NAME'}]})}});
 expect((await nano.detect('Dear Maya')).spans).toEqual([{start:5,end:9,kind:'NAME'}]);
 expect(sdk.model.mock.calls[0][1].mode).toBe('device');expect(sdk.model.mock.calls[0][1]).not.toHaveProperty('inCloudParams');expect(sdk.generate.mock.calls[0][0][0].type).toBe('text');
});
it('never generates before successful initialization (SDK MOCK)',async()=>{browser();const nano=createNano({});await expect(nano.detect('synthetic')).rejects.toThrow('not initialized');sdk.initialize.mockRejectedValue(Error('interrupted'));await expect(nano.initialize(()=>{})).rejects.toThrow();await expect(nano.detect('synthetic')).rejects.toThrow();expect(sdk.generate).not.toHaveBeenCalled();});
it('rejects non-device source and transcription mismatch (SDK MOCK, post-response detection only)',async()=>{browser();const nano=createNano({});await nano.initialize(()=>{});sdk.generate.mockResolvedValue({response:{inferenceSource:'cloud',text:()=>''}});await expect(nano.detect('synthetic')).rejects.toThrow('non-device');sdk.generate.mockResolvedValue({response:{inferenceSource:'device',text:()=>JSON.stringify({transcription:'changed',findings:[]})}});await expect(nano.detect('synthetic')).rejects.toThrow('transcription');});

it('answer and verifier each use ONLY_ON_DEVICE constrained JSON; no cloud params (SDK MOCK, NOT inference)',async()=>{
 browser();const nano=createNano({});await nano.initialize(()=>{});
 sdk.generate.mockResolvedValue({response:{inferenceSource:'device',text:()=>'{"checks":[]}'}});
 await nano.answer('synthetic original');await nano.verify('synthetic original',[{id:'action-0',kind:'action',value:'Call'}]);
 for(const call of sdk.model.mock.calls){expect(call[1].mode).toBe('device');expect(call[1]).not.toHaveProperty('inCloudParams');expect(call[1].onDeviceParams.promptOptions.responseConstraint.type).toBe('object');}
 expect(sdk.model.mock.calls).toHaveLength(3);
 expect(sdk.model.mock.calls[2][1].onDeviceParams.promptOptions.responseConstraint.properties.checks).toBeDefined();
 sdk.generate.mockResolvedValue({response:{inferenceSource:'cloud',text:()=>''}});await expect(nano.answer('synthetic')).rejects.toThrow('no cloud fallback');
});
it('unavailable model initializes no device session and invokes no generate or fetch (SDK MOCK)',async()=>{
 browser();vi.stubGlobal('LanguageModel',{availability:vi.fn(async()=> 'unavailable'),create:vi.fn()});const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
 const nano=createNano({});await expect(nano.initialize(()=>{})).rejects.toThrow('unavailable');await expect(nano.answer('synthetic')).rejects.toThrow('not initialized');await expect(nano.verify('synthetic',[])).rejects.toThrow('not initialized');expect(sdk.initialize).not.toHaveBeenCalled();expect(sdk.generate).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
});
it('preserves image + schema actual adapter capability (SDK MOCK, NOT successful image inference)',async()=>{
 browser();const nano=createNano({});await nano.initialize(()=>{});sdk.generate.mockResolvedValue({response:{inferenceSource:'device',text:()=>JSON.stringify({transcription:'Dear Synthetic',findings:[{text:'Synthetic',kind:'NAME'}]})}});
 const result=await nano.detect('','not-real-image-bytes');expect(result.text).toBe('Dear Synthetic');expect(sdk.generate.mock.calls[0][0][1]).toEqual({type:'inlineData',inlineData:{mimeType:'image/png',data:'not-real-image-bytes'}});expect(sdk.model.mock.calls[0][1].onDeviceParams.createOptions.expectedInputs).toContainEqual({type:'image'});
});
