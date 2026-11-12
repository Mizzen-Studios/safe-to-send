import {letters} from './fixtures';
import type {Span} from './privacy';
/** Current cloud release is a controlled fixture verification, not a raw-letter release. */
export function assertSyntheticCloudScope(source:string,selected:string,displayed:string,syntheticMode:boolean,spans:Span[]){
 const fixture=letters.find(x=>x.text===source);
 if(!syntheticMode||!fixture||source!==selected||source!==displayed)throw Error('Cloud release accepts only unchanged supplied synthetic fixtures');
 for(const truth of fixture.truth)for(let i=truth.start;i<truth.end;i++)if(!spans.some(s=>s.start<=i&&s.end>i))throw Error('Every known synthetic personal detail must remain redacted before cloud verification');
}
