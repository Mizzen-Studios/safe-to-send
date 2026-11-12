import type {Journey} from './journey';
export type SavedLetter={id:string;title:string;savedAt:string;reminder:string;journey:Journey};
const DB='safe-to-send-local',STORE='letters';
export class LocalHistory {
 constructor(private factory:IDBFactory=globalThis.indexedDB){}
 private open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(!this.factory){reject(Error('Local saving is unavailable in this browser.'));return;}const r=this.factory.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Close other Safe to Send tabs and try again.'));});}
 private async transaction<T>(mode:IDBTransactionMode,action:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);let value:T;const req=action(tx.objectStore(STORE));req.onsuccess=()=>{value=req.result;};tx.oncomplete=()=>{db.close();resolve(value);};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error??Error('Local save failed.'));};});}
 async save(item:SavedLetter){if(!item.id||!item.title.trim()||item.title.length>100)throw Error('Give this saved letter a title (up to 100 characters).');if(item.reminder&&!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(item.reminder))throw Error('Choose a valid reminder date.');await this.transaction('readwrite',s=>s.put(structuredClone(item)));}
 async list(){return (await this.transaction<SavedLetter[]>('readonly',s=>s.getAll())).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));}
 async delete(id:string){await this.transaction('readwrite',s=>s.delete(id));}
 async clear(){await this.transaction('readwrite',s=>s.clear());}
}
