// Upload ciphertext only: public-repository Actions artifacts are NOT private storage.
import {createCipheriv,randomBytes} from 'node:crypto';
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve('.openclaw/tmp/record-cloud-private');
const files={};for(const name of await readdir(root))files[name]=(await readFile(resolve(root,name))).toString('base64');
const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',Buffer.from(process.env.CLOUD_RECORD_ENCRYPTION_KEY,'hex'),iv);
const ciphertext=Buffer.concat([cipher.update(JSON.stringify(files)),cipher.final()]);
await mkdir('.openclaw/tmp/record-cloud-encrypted',{recursive:true});
await writeFile('.openclaw/tmp/record-cloud-encrypted/capture.aes256gcm',Buffer.concat([iv,cipher.getAuthTag(),ciphertext]));
console.log('Authenticated encryption complete; plaintext excluded from artifact.');
