#!/usr/bin/env python3
"""Runner-private debug secret, never compiled or passed in adb/Gradle arguments."""
import os, subprocess, json, base64, pathlib

def cmd(args, **kw):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, **kw).stdout

def adb(*args, **kw): return cmd(['adb','-s','emulator-5554',*args], **kw)

out=pathlib.Path('emulator-evidence'); out.mkdir(exist_ok=True)
token=os.environ.pop('SAFE_SEND_EMULATOR_DEBUG_TOKEN')
assert len(token)==36 and all(c in 'abcdefABCDEF0123456789-' for c in token)
# SDK 20.1.0 prints its debug secret at DEBUG on provider construction. Suppress
# before any app process starts, and never collect/publish logcat or Gradle reports.
adb('shell','setprop','log.tag.com.google.firebase.appcheck.debug.internal.DebugAppCheckProvider','SUPPRESS')
adb('shell','setprop','log.tag.DebugAppCheckProvider','SUPPRESS')
adb('install','-r','android/app/build/outputs/apk/debug/app-debug.apk')
adb('install','-r','android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk')
app='com.mizzen.safetosend'
enc=lambda s:base64.urlsafe_b64encode(s.encode()).decode().rstrip('=')
key=enc('[DEFAULT]')+'+'+enc('1:794092402064:android:fd7223549ef6ecf5a8af15')
xml=('<?xml version="1.0" encoding="utf-8" standalone="yes" ?><map><string name="com.google.firebase.appcheck.debug.DEBUG_SECRET">'+token+'</string></map>').encode()
record=None
try:
    adb('shell','run-as',app,'mkdir','-p','shared_prefs')
    adb('shell','run-as',app,'sh','-c',"'cat > shared_prefs/com.google.firebase.appcheck.debug.store."+key+".xml'",input=xml)
    record=subprocess.Popen(['adb','-s','emulator-5554','shell','screenrecord','--time-limit','180','/sdcard/emulator-demo.mp4'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    result=subprocess.run(['adb','-s','emulator-5554','shell','am','instrument','-w','-e','class','com.mizzen.safetosend.EmulatorCloudTest','-e','realEmulatorCloud','true',app+'.test/androidx.test.runner.AndroidJUnitRunner'],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,timeout=220)
    # Console output and instrumentation raw results deliberately not uploaded.
    private_logs=adb('logcat','-d')
    if token.encode() in private_logs:
        raise RuntimeError('SDK secret-log suppression failed; raw logs retained only in memory')
    receipt=adb('exec-out','run-as',app,'cat','files/emulator-cloud-receipt.json')
    assert token.encode() not in receipt
    data=json.loads(receipt)
    (out/'receipt.json').write_text(json.dumps(data,indent=2))
finally:
    if record:
        subprocess.run(['adb','-s','emulator-5554','shell','pkill','-2','screenrecord'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        record.wait(timeout=15)
        try: adb('pull','/sdcard/emulator-demo.mp4',str(out/'raw-emulator.mp4'))
        except subprocess.CalledProcessError: pass
    adb('shell','am','force-stop',app)
    adb('shell','pm','clear',app)
    adb('logcat','-c')
assert data['result']=='PASS', 'Sanitized cloud receipt reports failure'
