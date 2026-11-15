#!/usr/bin/env python3
"""Offline release preparation guard; never prints matched credentials or APK content."""
import argparse, hashlib, json, pathlib, re, zipfile
p=argparse.ArgumentParser(); p.add_argument('apk'); p.add_argument('--sha', required=True); args=p.parse_args()
path=pathlib.Path(args.apk)
if not re.fullmatch(r'[0-9a-f]{40}', args.sha): raise SystemExit('Full source SHA required')
# RFC6455 WebSocket ACCEPT_MAGIC is a public protocol constant, not an enrollment token.
# DEX references independently attributed to OkHttp WebSocketProtocol/RealWebSocket and Ktor UtilsKt.
RFC6455_GUID=b'258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
# All OTHER UUID-shaped literals still block publication.
patterns=[rb'DebugAppCheckProvider',rb'FIREBASE_APPCHECK_DEBUG_TOKEN',rb'(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',rb'AIzaSyDEBUG',rb'gh[pousr]_[A-Za-z0-9]{20,}']
with zipfile.ZipFile(path) as z:
 if sum(i.file_size for i in z.infolist())>500_000_000: raise SystemExit('Oversized APK rejected')
 for info in z.infolist():
  if info.file_size>100_000_000: raise SystemExit('Oversized APK entry rejected')
  data=z.read(info)
  for index,pattern in enumerate(patterns):
   candidate=data.replace(RFC6455_GUID,b'[RFC6455 ACCEPT_MAGIC]') if index==2 else data
   if re.search(pattern,candidate): raise SystemExit(f'BLOCKED: forbidden release marker rule {index}; value withheld')
print(json.dumps({'sourceSha':args.sha,'apk':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'releaseMarkerScan':'PASS','signed':'UNVERIFIED; use apksigner verify --print-certs separately'}))
