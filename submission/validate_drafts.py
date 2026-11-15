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
