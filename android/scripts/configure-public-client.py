#!/usr/bin/env python3
"""Public Firebase client identifiers only. Not server credentials or token material.
Opt-in CI configured source build; NEVER add signing keys/passwords/debug tokens here.
"""
from pathlib import Path
import os
CONFIG = "firebase.appId=1:794092402064:android:fd7223549ef6ecf5a8af15\nfirebase.apiKey=AIzaSyD9RtCvcJfViS9rS1XdCtTBzKvJsvtMtV4\nappcheck.androidSiteKey=6LeIciEuAAAAAIEYGD-hchOsfTZevc_TRAvSJN4O\n"
p=Path("private.properties") if Path("app/build.gradle.kts").exists() else Path("android/private.properties")
fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,"w") as f: f.write(CONFIG)
