import {it,expect} from 'vitest';
import {letters} from '../src/fixtures';
import {assertSyntheticCloudScope} from '../src/synthetic-scope';
it('permits unchanged supplied synthetic fixture with every truth character redacted',()=>{for(const l of letters)expect(()=>assertSyntheticCloudScope(l.text,l.text,l.text,true,l.truth)).not.toThrow();});
it('refuses arbitrary source, selected/displayed drift, and Nano-mode cloud sends',()=>{const l=letters[0];for(const args of [[l.text,l.text,l.text,false,l.truth],['arbitrary',l.text,l.text,true,l.truth],[l.text,letters[1].text,l.text,true,l.truth],[l.text,l.text,'changed',true,l.truth]]as const)expect(()=>assertSyntheticCloudScope(args[0],args[1],args[2],args[3],args[4])).toThrow();});
it('refuses removed or partially exposed known fixture PII',()=>{const l=letters[0];expect(()=>assertSyntheticCloudScope(l.text,l.text,l.text,true,[])).toThrow();expect(()=>assertSyntheticCloudScope(l.text,l.text,l.text,true,l.truth.slice(1))).toThrow();expect(()=>assertSyntheticCloudScope(l.text,l.text,l.text,true,l.truth.map((s,i)=>i? s:{...s,start:s.start+1}))).toThrow();});
