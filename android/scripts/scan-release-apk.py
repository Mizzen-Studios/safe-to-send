#!/usr/bin/env python3
"""Offline release preparation guard; never prints matched credentials or APK content."""
import argparse, hashlib, json, pathlib, re, zipfile
p=argparse.ArgumentParser(); p.add_argument('apk'); p.add_argument('--sha', required=True); args=p.parse_args()
path=pathlib.Path(args.apk)
if not re.fullmatch(r'[0-9a-f]{40}', args.sha): raise SystemExit('Full source SHA required')
# Android App Check debug enrollment tokens are UUID-shaped; conservative false positives block publication.
patterns=[rb'DebugAppCheckProvider',rb'FIREBASE_APPCHECK_DEBUG_TOKEN',rb'(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',rb'AIzaSyDEBUG',rb'gh[pousr]_[A-Za-z0-9]{20,}']
with zipfile.ZipFile(path) as z:
 for info in z.infolist():
  if info.file_size>100_000_000: raise SystemExit('Oversized APK entry rejected')
  data=z.read(info)
  if any(re.search(pattern,data) for pattern in patterns): raise SystemExit('BLOCKED: forbidden debug/credential marker in release APK (value withheld)')
print(json.dumps({'sourceSha':args.sha,'apk':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'releaseMarkerScan':'PASS','signed':'UNVERIFIED; use apksigner verify --print-certs separately'}))
