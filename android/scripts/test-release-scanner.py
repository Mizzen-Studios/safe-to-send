#!/usr/bin/env python3
"""Synthetic ZIP fixtures only. No device operations or real tokens."""
import pathlib, subprocess, tempfile, zipfile
script=pathlib.Path(__file__).with_name('scan-release-apk.py')
workspace=pathlib.Path(__file__).resolve().parents[2]/'.openclaw/tmp'
workspace.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(dir=workspace) as temp:
 for index,(data,rejected) in enumerate([(b'public Firebase client config',False),(b'258EAFA5-E914-47DA-95CA-C5AB0DC85B11',False),(b'DebugAppCheckProviderFactory',True),(b'FIREBASE_APPCHECK_DEBUG_TOKEN',True),(b'11111111-2222-3333-4444-555555555555',True),(b'-----BEGIN PRIVATE KEY-----',True)]):
  apk=pathlib.Path(temp)/f'{index}.apk'
  with zipfile.ZipFile(apk,'w') as archive: archive.writestr('classes.dex',data)
  result=subprocess.run(['python3',str(script),str(apk),'--sha','a'*40],capture_output=True)
  assert bool(result.returncode)==rejected, f'fixture {index}'
  assert data not in result.stdout+result.stderr, 'scanner leaked fixture bytes'
print('PASS: 6 synthetic release scanner fixtures; no device/credential operations')
