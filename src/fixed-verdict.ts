import type {Claim} from './hybrid';
/** Syntax tolerance only. Source bytes and IDs are never normalized. */
export function responseJSON(raw:string):any {
 if(raw.length>100000)throw Error('Oversize local response');
 return JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
}
export function fixedChecks(raw:string,original:string,claims:Claim[]):string {
 const x=responseJSON(raw);
 if(!x||Object.keys(x).join()!=='checks'||!Array.isArray(x.checks))throw Error('Invalid local checks');
 const seen=new Set<string>();
 const checks=x.checks.map((v:any)=>{
 if(!v||Object.keys(v).sort().join()!=='evidence,id,status'||typeof v.id!=='string'||seen.has(v.id)||!claims.some(c=>c.id===v.id)||typeof v.status!=='string'||!Array.isArray(v.evidence)||v.evidence.length>10)throw Error('Invalid local check');
 seen.add(v.id);
 const status=({match:'supported',mismatch:'mismatch',unsure:'unknown',supported:'supported',unsupported:'unsupported',unknown:'unknown'} as Record<string,string>)[v.status.toLowerCase()];
 if(!status)throw Error('Invalid local status');
 // Invalid quotes make only this claim uncertain. Never repair or fuzzy-search.
 const valid=v.evidence.every((e:any)=>e&&Object.keys(e).join()==='quote'&&typeof e.quote==='string'&&e.quote.trim()&&e.quote.length<=5000&&original.includes(e.quote));
 return {id:v.id,status:valid?status:'unknown',evidence:valid?v.evidence:[]};
 });
 // Missing IDs are explicit uncertainty, not fabricated model decisions.
 for(const c of claims)if(!seen.has(c.id))checks.push({id:c.id,status:'unknown',evidence:[]});
 return JSON.stringify({checks});
}
/** Small bounded requests: at most four short claims / 1600 claim characters.
 * Long explanation/draft fields stay intact, alone, never silently truncated. */
export function claimBatches(claims:Claim[]):Claim[][] {
 const batches:Claim[][]=[];
 for(const c of claims){const last=batches.at(-1);if(!last||last.length>=4||last.reduce((n,x)=>n+x.value.length,0)+c.value.length>1600)batches.push([c]);else last.push(c);}
 return batches;
}
