#!/usr/bin/env python3
"""Host-only edit of genuine existing footage. Output MUST remain outside Git."""
import argparse, pathlib, subprocess, json, hashlib, textwrap
from PIL import Image, ImageDraw, ImageFont
p=argparse.ArgumentParser();p.add_argument('--output-dir',required=True);a=p.parse_args()
R=pathlib.Path(__file__).resolve().parents[1];D=pathlib.Path(a.output_dir).resolve()
assert R not in D.parents and D!=R, 'Output must be outside product repository'
D.mkdir(parents=True,exist_ok=True);D.chmod(0o700)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def run(args):subprocess.run(args,check=True)
def card(name,title,lines):
 im=Image.new('RGB',(1920,1080),'#101e2d');d=ImageDraw.Draw(im)
 d.text((90,65),'SAFE TO SEND  /  PRIVATE SILENT ROUGHCUT',font=ImageFont.truetype(font,32),fill='#85daca')
 d.text((90,170),title,font=ImageFont.truetype(font,60),fill='white')
 y=300
 for line in lines:
  for row in textwrap.wrap(line,65):
   d.text((90,y),row,font=ImageFont.truetype(font,38),fill='#e4eaf0');y+=58
  y+=25
 im.save(D/(name+'.png'))
def encode(name,duration,source=None,caption='',mode='',still=False):
 idx=len(segments);out=D/('%02d-%s.mp4'%(idx,name));txt=D/(name+'.txt');txt.write_text(caption)
 base=['ffmpeg','-nostdin','-y','-v','error','-threads','2']
 if source is None:base+=['-loop','1','-i',str(D/(name+'.png'))];vf='scale=1920:1080,fps=30'
 else:
  base+=['-i',str(R/source)]
  vf='scale=1760:900:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:110:color=0x101e2d,fps=30'
  # Banners occupy reserved margins, never replace the observed result.
  vf+=",drawtext=fontfile="+font+":text='"+mode+"':fontsize=32:fontcolor=0x85daca:x=55:y=25"
  vf+=",drawtext=fontfile="+font+":textfile="+str(txt)+":fontsize=29:fontcolor=white:x=55:y=1010"
 base+=['-t',str(duration),'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-threads','2',str(out)]
 run(base);segments.append(out)
segments=[]
card('intro','Two separate real experiments',[
 'Synthetic letters only. Human review before any cloud handoff.',
 'Desktop: genuine on-device detection; local explanation FAILS.',
 'Android emulator: manual redaction and accepted cloud response.',
 'Not a continuous hybrid success. Not a finished narrated film.'])
encode('intro',12)
encode('desktop',45.533333,'docs/evidence/desktop-2026-11-15/take-raw.mp4','Real desktop take, full length at 1x. Detection plus patterns; local answer unavailable / invalid.','DESKTOP / REAL TAKE / MODEL ID UNKNOWN / NO CLOUD SEND')
card('separation','The local answer failed closed',[
 'LOCAL ANSWER FAIL: unavailable or invalid. No fallback reply.',
 'Five known synthetic values were highlighted by detection + patterns; model contribution is not isolated.',
 'The next clip is a separate Android emulator experiment.',
 'Development App Check is NOT normal production attestation.'])
encode('separation',12)
encode('emulator',32.134777,'docs/evidence/emulator-2026-11-15/accepted-cloud-labelled.mp4','Full take at 1x: manual redaction, accepted cloud. TEST_ONLY mutation is NOT cloud or Nano proof.','ANDROID EMULATOR / NANO UNAVAILABLE / DEVELOPMENT APP CHECK')
card('limits','Evidence is partial, not a guarantee',[
 'SDK application ledger is not captured HTTP transport.',
 'Actual component/model identity: UNKNOWN. No physical Nano inference shown.',
 'Detection evaluation: 90.02% recall / 69.58% precision (synthetic).',
 'Verifier: 14/128 planned decided; 72 attempted, 57 unknown, 1 aborted, 56 not run. Target FAILED.'])
encode('limits',18)
card('pixel','Physical Pixel slots - NOT CAPTURED',[
 'Awaiting authorized recording slots; these are placeholders, not footage.',
 'Normal production App Check token and enforced cloud acceptance: NOT_RUN.',
 'Physical Nano text/photo and planted-error review: NOT_RUN.',
 'No emulator or development token substitutes for those gates.'])
encode('pixel',14)
card('outro','Private draft - owner review only',[
 'Solo entrant Olly, using AI coding assistance; November 9 preparatory spike disclosed.',
 'Explores inspectable control, not guaranteed privacy, legal accuracy or reliable verification.',
 'New desktop pass may replace the old take only after real success is verified.',
 'Silent captioned roughcut. No filmed outro. No upload or public release.'])
encode('outro',14)
(D/'concat.txt').write_text(''.join("file '"+str(x)+"'\n" for x in segments))
run(['ffmpeg','-nostdin','-y','-v','error','-f','concat','-safe','0','-i',str(D/'concat.txt'),'-c','copy','-movflags','+faststart',str(D/'safe-to-send-private-roughcut.mp4')])
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
manifest={'classification':'PRIVATE_SILENT_CAPTIONED_ROUGHCUT_NOT_FINISHED_FILM','baseline':'7930eec','speed':'all real clips 1x; no speedups; complete clips; separate title cards','timeline':[{'start':0,'end':12,'asset':'intro card'},{'start':12,'end':57.533333,'asset':'desktop full 0..45.533333'},{'start':57.533333,'end':69.533333,'asset':'failure/separation card'},{'start':69.533333,'end':101.668110,'asset':'emulator full 0..32.134777'},{'start':101.668110,'end':119.668110,'asset':'limits card'},{'start':119.668110,'end':133.668110,'asset':'physical Pixel NOT_CAPTURED card'},{'start':133.668110,'end':147.668110,'asset':'outro card'}],'sources':[{'path':s,'sha256':sha(R/s),'rawOrEdited':kind} for s,kind in [('docs/evidence/desktop-2026-11-15/take-raw.mp4','raw observed screen capture'),('docs/evidence/emulator-2026-11-15/accepted-cloud-labelled.mp4','genuine observed capture with existing disclosure banner')]],'videoSha256':sha(D/'safe-to-send-private-roughcut.mp4'),'audio':'none','componentModelIdentity':'UNKNOWN','physicalPixel':'NOT_CAPTURED','newDesktopPass':'NOT_INCLUDED_PENDING_PARENT_VERIFICATION'}
manifest['sourceReceipts']={'desktop':{'sourceCommit':'a383e70785d81a06b7fd821aa46e70839aa60fda','receipt':'docs/evidence/desktop-2026-11-15/receipt.json','capture':'real X11 screen recording; ONLY_ON_DEVICE detector plus product pattern union; local answer failure'},'emulator':{'sourceCommit':'3968e52','receipt':'android/docs/evidence/emulator-safe-2026-11-15/receipt.json','capture':'real emulator capture; pre-existing truthful banner; development App Check; Nano unavailable'}}
manifest['frameMapping']='At 30fps title cards hold their generated document. Desktop output [12,57.533333) maps source t=output-12; emulator [69.533333,101.666667) maps source t=output-69.533333. fps resampling may duplicate observed frames, never infer new UI states.'
(D/'shot-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
