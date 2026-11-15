import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const original = readFileSync(new URL('./vm-adb-safe.sh', import.meta.url), 'utf8');
test('offline tripwire: only exact non-device commands reach fake adb', () => {
 const dir = mkdtempSync(join(process.cwd(), '.adb-tripwire-'));
 try {
  const fake = join(dir, 'fake-adb');
  writeFileSync(fake, '#!/bin/sh\nprintf "%s\n" "$@"\nprintf "ENV:%s:%s:%s:%s\n" "$ADB_MDNS_AUTO_CONNECT" "$ADB_MDNS" "$ADB_USB" "$ANDROID_SERIAL"\n');
  chmodSync(fake, 0o700);
  const script = join(dir, 'wrapper');
  writeFileSync(script, original.replace('"$ROOT/usr/bin/adb"', JSON.stringify(fake)));
  const run = args => spawnSync('/bin/sh', [script, ...args], {encoding:'utf8', env:{...process.env, ANDROID_SERIAL:'TRIPWIRE',ADB_SERVER_SOCKET:'tcp:invalid:9', ADB_TRACE:'all'}});
  for (const cmd of ['version','help','start-server','devices']) {
   const r=run([cmd]); assert.equal(r.status,0,r.stderr);
   assert.equal(r.stdout, '-P\n15037\n'+cmd+'\nENV:0:0:0:\n');
  }
  for (const args of [[],['pair'],['connect'],['tcpip'],['shell'],['install'],['kill-server'],['-a'],['devices','-l'],['pair','SECRET'],['start-server','-a']]) {
   const r=run(args); assert.equal(r.status,64); assert.equal(r.stdout,'');
  }
  assert.ok(!original.includes('-a '));
 } finally { rmSync(dir, {recursive:true,force:true}); }
});
