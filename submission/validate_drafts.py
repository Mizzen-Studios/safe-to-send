"""Offline draft artifact checks; no browser/device/model execution."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
paths = [ROOT / 'docs/VM_PIXEL_WIRELESS_PLAN.md', *sorted((ROOT / 'submission').glob('*.md')), ROOT / 'submission/ARCHITECTURE.html']
count = 0
for path in paths:
    source = path.read_text()
    pattern = r'\]\(([^)]+)\)' if path.suffix == '.md' else r'href="([^"]+)"'
    for match in re.finditer(pattern, source):
        link = match.group(1)
        if link.startswith(('https:', 'http:', '#')):
            continue
        dest, _, anchor = link.partition('#')
        target = path.parent / dest
        assert target.exists(), (path, link)
        if anchor:
            headings = re.findall(r'^#+ (.+)$', target.read_text(), re.M)
            slugs = [re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in headings]
            assert anchor in slugs, (link, slugs)
        count += 1
    assert not re.search(r'(?<![\w.])(?:10|192\.168|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\.\d+\.\d+', source), path
    print('PASS', path.relative_to(ROOT))
source = (ROOT / 'submission/ARCHITECTURE.html').read_text()
svg = ET.fromstring(re.search(r'<svg.*?</svg>', source, re.S).group())
ns = {'s': 'http://www.w3.org/2000/svg'}
title = 'Safe to Send — reviewed hybrid boundary'
assert svg.find('s:title', ns).text == title
assert '<title>' + title + '</title>' in source
edges = svg.findall('.//s:path[@class="edge"]', ns)
assert len(edges) == 6
assert all(e.attrib['marker-end'] == 'url(#arrow)' for e in edges)
assert not re.search(r'<script|https?://(?!www.w3.org)', source)
print('PASS SVG XML, exact titles, six directed connectors, no external assets;', count, 'internal links')
script = (ROOT / 'submission/VIDEO_SCRIPT_AND_SHOTLIST_DRAFT.md').read_text()
print('Narration words:', sum(len(x.split()) for x in re.findall('“([^”]+)”', script)))

# Evidence is bound to actual bytes; missing captures never acquire invented paths.
import hashlib
import json
import subprocess
index = json.loads((ROOT / 'submission/EVIDENCE_INDEX.json').read_text())
assert index['syntheticOnly'] and not index['continuousHybridJourney']
for item in index['assets']:
    path = ROOT / item['path']
    assert path.is_relative_to(ROOT) and path.is_file()
    assert path.stat().st_size == item['bytes']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256']
    assert item['sourceCommit'] is None or re.fullmatch('[0-9a-f]{40}', item['sourceCommit'])
    if item['sourceCommit'] is None:
        assert item['sourceBinding']
    if item['kind'] == 'video':
        probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type:format=duration', '-of', 'json', str(path)]))
        assert all(x['codec_type'] == 'video' for x in probe['streams'])
        assert abs(float(probe['format']['duration']) - item['durationSeconds']) < .002
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'null', '-'], check=True, capture_output=True)
for missing in index['missing']:
    assert missing['status'] == 'NOT_CAPTURED' and missing['shotStatus'] == 'EXPECTED_NOT_CAPTURED'
    assert 'path' not in missing
cloud = json.loads((ROOT / 'docs/evidence/final-web-real-cloud-2026-11-15.json').read_text())
assert cloud['exactBodyParity'] and cloud['acceptedAnswer']
body = cloud['providerPosts'][0]
assert len(body['body'].encode()) == body['bytes'] == 2515
assert hashlib.sha256(body['body'].encode()).hexdigest() == body['sha256'] == cloud['ledger'][0]['sha256']
assert body['body'] == cloud['ledger'][0]['body']
rows = re.findall(r'^\| (\d+):(\d+)–(\d+):(\d+) \| “([^”]+)”', script, re.M)
end = 0
for m, sec, em, es, words in rows:
    start, stop = int(m)*60+int(sec), int(em)*60+int(es)
    assert start == end and stop > start
    assert len(words.split()) / (stop-start) * 60 <= 130, 'Overfull narration slot'
    end = stop
assert len(rows) == 8 and end == 180
print('PASS actual evidence hashes/source fields, video durations/full decode/no audio, SDK body parity; 180s timeline')
print('Narration estimated words/minute:', round(sum(len(x[4].split()) for x in rows)/3, 1), '; actual rehearsal NOT_CAPTURED')
