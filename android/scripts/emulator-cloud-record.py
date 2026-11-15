#!/usr/bin/env python3
"""Runner-private debug secret; synthetic canary must pass before secret use."""
import os, subprocess, json, base64, pathlib

def cmd(args, **kw):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, **kw).stdout

def adb(*args, **kw): return cmd(['adb','-s','emulator-5554',*args], **kw)

out=pathlib.Path('emulator-evidence'); out.mkdir(exist_ok=True)
# Supported liblog ERROR threshold, before construction, disposable emulator only.
# Cover both namespaces: persist.log.tag.<tag> takes precedence on Android.
for tag in ['com.google.firebase.appcheck.debug.internal.DebugAppCheckProvider','DebugAppCheckProvider']:
    for prefix in ['log.tag.','persist.log.tag.']:
        adb('shell','setprop',prefix+tag,'ERROR')
        assert adb('shell','getprop',prefix+tag).strip()==b'ERROR'
adb('install','-r','android/app/build/outputs/apk/debug/app-debug.apk')
adb('install','-r','android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk')
app='com.mizzen.safetosend'
enc=lambda s:base64.urlsafe_b64encode(s.encode()).decode().rstrip('=')
key=enc('[DEFAULT]')+'+'+enc('1:794092402064:android:fd7223549ef6ecf5a8af15')
def seed(secret):
    xml=('<?xml version="1.0" encoding="utf-8" standalone="yes" ?><map><string name="com.google.firebase.appcheck.debug.DEBUG_SECRET">'+secret+'</string></map>').encode()
    adb('shell','run-as',app,'mkdir','-p','shared_prefs')
    adb('shell','run-as',app,'sh','-c',"'cat > shared_prefs/com.google.firebase.appcheck.debug.store."+key+".xml'",input=xml)

def instrument(test, *args):
    return subprocess.run(['adb','-s','emulator-5554','shell','am','instrument','-w','-e','class','com.mizzen.safetosend.'+test,*args,app+'.test/androidx.test.runner.AndroidJUnitRunner'],stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,timeout=220)

# PUBLIC UNREGISTERED: never register this canary. No real secret read yet.
canary='00000000-0000-4000-8000-000000000000'
adb('logcat','-c')
try:
    seed(canary)
    instrument('EmulatorLoggingTest','-e','loggingCanary','true')
    logs=adb('logcat','-d','-b','all')
    assert b'PUBLIC_LOG_BUFFER_LIVENESS_CANARY' in logs, 'Guard cannot observe live logs'
    assert canary.encode() not in logs, 'Public SDK canary leaked; secret never loaded'
    proof=json.loads(adb('exec-out','run-as',app,'cat','files/emulator-logging-receipt.json'))
    assert proof['result']=='PASS'
    proof['allLogBuffersCanaryAbsent']=True
    proof['logBufferLivenessProven']=True
    (out/'logging-proof.json').write_text(json.dumps(proof,indent=2))
finally:
    adb('shell','am','force-stop',app)
    adb('shell','pm','clear',app)
    adb('logcat','-c')
if os.environ.get('SAFE_SEND_LOGGING_PROOF_ONLY')=='true':
    raise SystemExit(0)
token=os.environ.pop('SAFE_SEND_EMULATOR_DEBUG_TOKEN')
assert len(token)==36 and all(c in 'abcdefABCDEF0123456789-' for c in token)
record=None
sdk_secret_log_detected=True
data={}
try:
    seed(token)
    record=subprocess.Popen(['adb','-s','emulator-5554','shell','screenrecord','--time-limit','180','/sdcard/emulator-demo.mp4'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    result=instrument('EmulatorCloudTest','-e','realEmulatorCloud','true')
    # Private in-memory check remains mandatory, every buffer, never filtered.
    private_logs=adb('logcat','-d','-b','all')
    sdk_secret_log_detected=token.encode() in private_logs
    receipt=adb('exec-out','run-as',app,'cat','files/emulator-cloud-receipt.json')
    assert token.encode() not in receipt
    assert not sdk_secret_log_detected, 'Secret in private logs; no receipt exported'
    data=json.loads(receipt)
    data['sdkSecretLogDetectedInPrivateMemory']=sdk_secret_log_detected
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
assert not sdk_secret_log_detected, 'SDK secret-log suppression failed; raw logs never exported'
assert data['result']=='PASS', 'Sanitized cloud receipt reports failure'
