"""Offline final private media verification; never publishes or touches recovery copy."""
from pathlib import Path
import hashlib,json,subprocess
R=Path(__file__).resolve().parents[1]
import argparse
a=argparse.ArgumentParser();a.add_argument('--output-dir',required=True);args=a.parse_args()
D=Path(args.output_dir).resolve()
p=D/'safe-to-send-private-roughcut.mp4'
m=json.loads((D/'shot-manifest.json').read_text())
i=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_format','-show_streams','-of','json',str(p)]))
s=i['streams'];assert len(s)==1 and s[0]['codec_type']=='video' and s[0]['codec_name']=='h264'
assert (s[0]['width'],s[0]['height'])==(1920,1080)
assert 0<float(i['format']['duration'])<=180
assert abs(float(i['format']['duration'])-149.8)<.002
assert int(s[0]['nb_read_frames'])==4494
assert hashlib.sha256(p.read_bytes()).hexdigest()==m['videoSha256']
subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(p),'-f','null','-'],check=True,capture_output=True)
m.update(videoBytes=p.stat().st_size,frameCount=int(s[0]['nb_read_frames']),resolution=[1920,1080],fullDecode='PASS',productionAppCheck='NOT_PROVEN',narration='NOT_RECORDED',ownerReview='REQUIRED',upload='NOT_AUTHORIZED',sampleFrames=[])
for t in [0,12,18,35,36,44,48,64,76,94,107,108,124,138,149]:
 f=D/('sample-%03d.png'%t)
 subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss',str(t),'-i',str(p),'-frames:v','1',str(f)],check=True)
 m['sampleFrames'].append({'seconds':t,'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(R/'submission/PRIVATE_ROUGHCUT_FINAL_2026-11-25.json').write_text(json.dumps(m,indent=2)+chr(10))
(D/'verification.json').write_text(json.dumps(i,indent=2)+chr(10))
print(json.dumps({k:m[k] for k in ['videoSha256','videoBytes','actualDuration','frameCount','fullDecode']}))
