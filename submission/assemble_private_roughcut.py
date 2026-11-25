#!/usr/bin/env python3
"""Private host-only edit. Real retained segments remain 1x; no fabricated UI."""
import argparse, pathlib, subprocess, json, hashlib, textwrap
from PIL import Image, ImageDraw, ImageFont
p = argparse.ArgumentParser()
p.add_argument('--output-dir', required=True)
a = p.parse_args()
R = pathlib.Path(__file__).resolve().parents[1]
D = pathlib.Path(a.output_dir).resolve()
assert R not in D.parents and D != R, 'Output must be outside product repository'
D.mkdir(parents=True, exist_ok=True)
D.chmod(448)
font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def run(args):
    subprocess.run(args, check=True)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def probe(path):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)]))

def card(name, title, lines):
    im = Image.new('RGB', (1920, 1080), '#101e2d')
    d = ImageDraw.Draw(im)
    d.text((80, 55), 'SAFE TO SEND / PRIVATE EXPERIMENTAL ROUGHCUT', font=ImageFont.truetype(font, 32), fill='#85daca')
    d.text((80, 145), title, font=ImageFont.truetype(font, 54), fill='white')
    y = 255
    for line in lines:
        for row in textwrap.wrap(line, 71):
            d.text((80, y), row, font=ImageFont.truetype(font, 36), fill='#e4eaf0')
            y += 51
        y += 20
    assert y < 1050, (name, y)
    im.save(D / (name + '.png'))
segments = []
timeline = []

def encode(name, duration, source=None, start=0, caption='', mode=''):
    out = D / ('%02d-%s.mp4' % (len(segments), name))
    txt = D / (name + '.txt')
    txt.write_text(caption)
    base = ['ffmpeg', '-nostdin', '-y', '-v', 'error', '-threads', '2']
    if source is None:
        base += ['-loop', '1', '-i', str(D / (name + '.png'))]
        vf = 'scale=1920:1080,fps=30'
    else:
        base += ['-ss', str(start), '-i', str(R / source)]
        vf = 'scale=1760:880:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:100:color=0x101e2d,fps=30'
        vf += ',drawtext=fontfile=' + font + ":text='" + mode + "':fontsize=30:fontcolor=0x85daca:x=55:y=24"
        vf += ',drawtext=fontfile=' + font + ':textfile=' + str(txt) + ':fontsize=28:fontcolor=white:x=55:y=994:line_spacing=9'
    base += ['-t', str(duration), '-vf', vf, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-threads', '2', str(out)]
    run(base)
    actual = float(probe(out)['format']['duration'])
    begin = sum((x['duration'] for x in timeline))
    timeline.append({'name': name, 'start': round(begin, 6), 'end': round(begin + actual, 6), 'duration': actual, 'source': source, 'sourceStart': start if source else None, 'sourceEnd': round(start + actual, 6) if source else None, 'speed': 1 if source else None, 'caption': caption, 'mode': mode})
    segments.append(out)
local = 'docs/evidence/desktop-local-diagnosis-2026-11-15/success/take-raw.mp4'
emu = 'docs/evidence/emulator-2026-11-15/accepted-cloud-labelled.mp4'
card('intro', 'A real local execution, not verification', ['Synthetic letters only. Experimental assistance; human review required.', 'Real desktop ONLY_ON_DEVICE detection, redaction review and local output.', 'Edited: waits omitted. Retained footage is 1x, not continuous real time.', 'Checks UNKNOWN. The generated reply has a direction error.'])
encode('intro', 12)
encode('detection-start', 6, local, 0, 'Synthetic sample. Real detection begins; retained footage at 1x.\nEdited waits omitted; not continuous real time.', 'DESKTOP / ONLY_ON_DEVICE / ACTUAL MODEL ID UNKNOWN')
encode('redaction-review', 18, local, 23, 'Detection + product patterns; human review and redacted payload inspection.\nSource 6-23s omitted. No cloud handoff in this desktop take.', 'DESKTOP / REAL RAW SEGMENT 1x / EDITED WAITS OMITTED')
encode('local-output', 11.666667, local, 124, 'Local output appears; checks UNKNOWN, not verified. Reply direction is poor.\nSource 41-124s wait omitted. Actual output preserved; no replacement UI.', 'DESKTOP / REAL RAW SEGMENT 1x / NOT CONTINUOUS REAL TIME')
card('metadata', 'Component metadata is not model identity', ['nano_v3_cpu_component 2025.8.21.1028: Ready (component metadata).', 'Actual model identity: UNKNOWN / not exposed by the Prompt API.', 'Browser: Chrome 157.0.8103.78. SDK: Firebase 13.2.0.', 'Separate manifest version: 1.20261018.2. Not a model name.'])
encode('metadata', 16)
card('separation', 'A separate emulator cloud experiment', ['Next: genuine Android emulator footage, NOT the desktop local journey.', 'DEVELOPMENT App Check; Nano UNAVAILABLE. Not production attestation.', 'Manual redaction and approved payload; accepted cloud response.', 'TEST_ONLY mutation is not cloud provenance or Nano verification.'])
encode('separation', 12)
encode('emulator', 32.133333, emu, 0, 'Separate emulator take at 1x. DEVELOPMENT App Check / Nano UNAVAILABLE.\nTEST_ONLY mutation is not cloud or Nano proof; not a physical phone.', 'ANDROID EMULATOR / SEPARATE EXPERIMENT / DEVELOPMENT APP CHECK')
card('limits', 'Useful execution evidence, limited quality', ['Local checks UNKNOWN: no truth or reliable-verification guarantee.', 'Actual draft tells the sender to correct their tax return: wrong direction.', 'Human must check and rewrite; original poor output remains in the cut.', 'SDK ledger is not captured HTTP transport. Synthetic-only evidence.'])
encode('limits', 16)
card('measured', 'Final measured limits, not a safety guarantee', ['Verifier: 128 planned / 72 attempted / 14 decided.', '57 unknown / 1 aborted / 56 not run. Target FAILED.', 'All32 adapter: 90.02% character recall / 69.58% precision.', 'Physical devices not evaluated; out of scope for this entry.'])
encode('measured', 14)
card('outro', 'Private draft - owner review only', ['Solo entrant Olly; AI coding assistance and Nov 9 preparatory spike disclosed.', 'Experimental, synthetic-only, human review required. No filmed outro.', 'Historical desktop cloud accepted record exists; video unavailable.', 'Silent captioned edit. No upload, public release or finished-film claim.'])
encode('outro', 12)
(D / 'concat.txt').write_text(''.join(("file '" + str(x) + "'\n" for x in segments)))
final = D / 'safe-to-send-private-roughcut.mp4'
run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(D / 'concat.txt'), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(final)])
info = probe(final)
assert float(info['format']['duration']) <= 180
manifest = {'classification': 'PRIVATE_SILENT_CAPTIONED_ROUGHCUT_NOT_FINISHED_FILM', 'baseline': '440ec1e', 'packageBaseline': '2f00548', 'assemblyDate': '2026-11-25', 'timeline': timeline, 'sources': [{'path': s, 'sha256': sha(R / s), 'sourceCommit': c, 'kind': k, 'probeDuration': float(probe(R / s)['format']['duration'])} for s, c, k in [(local, '04ad3bfdb3dc0f5627cc5d1b43cbfd415c1967be', 'real raw X11 capture'), (emu, '3968e52', 'genuine emulator capture with existing disclosure banner')]], 'desktopReceipt': 'docs/evidence/desktop-local-diagnosis-2026-11-15/43750733786-summary.json', 'desktopWallDuration': 137.802, 'desktopMediaDuration': 135.666667, 'durationCaveat': 'Receipt wall clock and encoded duration differ; cuts use actual encoded PTS, not wall-clock promise.', 'omittedDesktopIntervals': [[6, 23], [41, 124]], 'frameMapping': 'For footage, source time = sourceStart + outputTime - chapter start, at 1x. 15-to-30fps duplicates observed frames; cards are document holds, not UI footage.', 'videoSha256': sha(final), 'actualDuration': float(info['format']['duration']), 'audio': 'none', 'modelIdentity': 'UNKNOWN_NOT_EXPOSED', 'componentMetadata': {'name': 'nano_v3_cpu_component', 'version': '2025.8.21.1028', 'notModelIdentity': True}, 'chrome': '157.0.8103.78', 'firebase': '13.2.0', 'separateManifestVersion': '1.20261018.2', 'localChecks': 'UNKNOWN_NOT_VERIFIED', 'qualityLimitation': 'Wrong reply direction preserved; human rewrite required.', 'physicalDevices': 'NOT_EVALUATED_OUT_OF_SCOPE', 'desktopCloud': 'HISTORICAL_ACCEPTED_RECORD_VIDEO_UNAVAILABLE', 'scope': 'FINAL_NO_PIXEL_EVIDENCE_PACKAGE_NOT_FINISHED_NARRATED_FILM'}
(D / 'shot-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
(D / 'ffprobe.json').write_text(json.dumps(info, indent=2) + '\n')
final.chmod(384)
print(json.dumps(manifest, indent=2))
