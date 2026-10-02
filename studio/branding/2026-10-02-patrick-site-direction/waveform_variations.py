"""Open-frame geometry selected by the user; waveform color studies remain reviewable."""
from pathlib import Path
import copy
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
OUT = HERE / 'waveform-variations'
REF = HERE.parent / '2026-10-01-packs/references/patrick-variations/primary-outlined.svg'
FRAME = HERE.parent / '2026-10-01-packs/references/patrick-variations/mono-outlined.svg'
SELECTION = json.loads((HERE / 'logo-selection.json').read_text())
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
OPTIONS = [
    ('01-lavender', '01 / Lavender', '#f8f8f2', '#bd93f9', '#282a36', None),
    ('02-pink', '02 / Pink', '#f8f8f2', '#ff79c6', '#282a36', None),
    ('03-green', '03 / Green', '#f8f8f2', '#50fa7b', '#282a36', None),
    ('04-green-frame', '04 / Green frame', '#50fa7b', '#bd93f9', '#282a36', None),
    ('05-pink-frame', '05 / Pink frame', '#ff79c6', '#bd93f9', '#282a36', None),
    ('06-light', '06 / Light', '#282a36', '#bd93f9', '#f8f8f2', None),
    ('07-quiet', '07 / Quiet', '#f8f8f2', '#44475a', '#282a36', None),
    ('08-echo', '08 / Original echo', '#f8f8f2', '#50fa7b', '#282a36', '#bd93f9'),
]


def waveform(color):
    original = ET.parse(REF).getroot()
    ids = {node.get('id'): node for node in original.iter()}
    outer = ET.Element(f'{{{NS}}}svg', {'width':'512', 'height':'512', 'viewBox':'0 0 160 160'})
    parent = outer
    for group in ('g46', 'g45', 'g35'):
        parent = ET.SubElement(parent, f'{{{NS}}}g', {'transform':ids[group].get('transform')})
    # g22 is the older waveform's thirteen bars, without the old PF or bracket layers.
    bars = copy.deepcopy(ids['g22'])
    bars.set('id', 'waveform-bars')
    for node in bars.iter():
        if node.tag.endswith('path'):
            node.attrib = {'d':node.get('d'), 'fill':color}
    parent.append(bars)
    return outer


def composite(ink, wave, echo=None):
    root = ET.Element(f'{{{NS}}}svg', {'width':'512', 'height':'512', 'viewBox':'0 0 512 512', 'role':'img'})
    ET.SubElement(root, f'{{{NS}}}title').text = 'Patrick__Eff open frame with the original waveform behind PF'
    if echo:
        layer = ET.SubElement(root, f'{{{NS}}}g', {'transform':'translate(-4,4)', 'id':'waveform-echo'})
        layer.append(waveform(echo))
    root.append(waveform(wave))
    foreground = ET.fromstring(FRAME.read_text())
    for node in foreground.iter():
        for key, value in list(node.attrib.items()):
            node.set(key, value.replace('#f8f8f2', ink).replace('#f3f0ed', ink))
        if node.tag.endswith('title'):
            node.text = 'Selected open-frame geometry'
        if node.tag.endswith('desc'):
            node.text = 'Preserved open frame, slash, dot and outlined PF initials.'
    foreground.set('id', 'open-frame-foreground')
    root.append(foreground)
    return root


def render(path):
    ET.parse(path)
    subprocess.run(['rsvg-convert', str(path), '-o', str(path.with_suffix('.png'))], check=True)


def main():
    OUT.mkdir(exist_ok=True)
    fonts = HERE.parent / '2026-10-01-packs/brands/patrick__eff/fonts'
    heading = ImageFont.truetype(str(fonts/'Space-Grotesk-1.ttf'), 29)
    label = ImageFont.truetype(str(fonts/'JetBrains-Mono-0.ttf'), 15)
    board = Image.new('RGB', (1800, 1270), '#282a36')
    draw = ImageDraw.Draw(board)
    draw.text((40, 28), 'PATRICK__EFF / OPEN FRAME + WAVEFORM', font=heading, fill='#f8f8f2')
    draw.text((40, 77), 'Software. Sound. Culture.  /  Seven approved color treatments.', font=label, fill='#a5a6b5')
    entries = []
    approved = [option for option in OPTIONS if option[0] in SELECTION['approved_variations']]
    for i, (slug, title, ink, wave, bg, echo) in enumerate(approved):
        root = composite(ink, wave, echo)
        path = OUT / f'{slug}.svg'
        path.write_text(ET.tostring(root, encoding='unicode')+'\n')
        render(path)
        avatar = copy.deepcopy(root)
        avatar.insert(1, ET.Element(f'{{{NS}}}rect', {'width':'512','height':'512','fill':bg}))
        avatar_path = OUT / f'{slug}-avatar.svg'
        avatar_path.write_text(ET.tostring(avatar, encoding='unicode')+'\n')
        render(avatar_path)
        x = 40+(i%4)*440
        y = 125+(i//4)*550
        draw.rectangle((x, y, x+400, y+518), fill=bg, outline='#44475a', width=1)
        with Image.open(path.with_suffix('.png')) as logo:
            logo = logo.convert('RGBA')
            full = logo.resize((380,380), Image.Resampling.LANCZOS)
            board.paste(full, (x+10,y+12), full)
            small = logo.resize((48,48), Image.Resampling.LANCZOS)
            board.paste(small, (x+326,y+414), small)
        text_color = '#282a36' if bg=='#f8f8f2' else '#f8f8f2'
        draw.text((x+20,y+402), title, font=heading, fill=text_color)
        draw.text((x+20,y+453), f'FRAME {ink.upper()}', font=label, fill=text_color)
        draw.text((x+20,y+478), f'WAVE  {wave.upper()}', font=label, fill=text_color)
        entries.append({'id':slug,'title':title,'frame':ink,'waveform':wave,'background':bg,'echo':echo,'status':'approved'})
    board.save(OUT/'comparison.png')
    cards = ''.join(f'<article style="--bg:{e["background"]};--ink:{e["frame"]}"><h2>{e["title"]}</h2><div class="stage"><img src="{e["id"]}.png" alt="Open frame with {e["title"][5:].lower()} waveform treatment"></div><div class="small"><img src="{e["id"]}.png" width="48" height="48" alt="48 pixel preview"><img src="{e["id"]}-avatar.png" width="80" height="80" class="circle" alt="Circular avatar preview"></div><p>Frame {e["frame"]} · Wave {e["waveform"]}</p><p><a href="{e["id"]}.svg" download>Transparent SVG</a> · <a href="{e["id"]}.png" download>PNG</a> · <a href="{e["id"]}-avatar.png" download>Avatar</a></p></article>' for e in entries)
    (OUT/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patrick__Eff open frame + waveform</title><style>body{margin:0;background:#282a36;color:#f8f8f2;font:16px/1.5 system-ui}main{max-width:1600px;margin:auto;padding:32px}h1{font-size:clamp(32px,5vw,64px);line-height:1.1}a{color:#bd93f9}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px}article{padding:20px;background:#21222c;border:1px solid #44475a}article h2{font-size:24px}.stage,.small{background:var(--bg)}.stage img{width:100%;display:block}.small{display:flex;align-items:center;gap:32px;padding:12px}.circle{border-radius:50%}article p{font-size:14px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #50fa7b;outline-offset:4px}@media(max-width:700px){main{padding:16px}}</style><main><p><a href="../index.html">← Selected design system</a></p><h1>Open frame. Original waveform.</h1><p>The open frame is selected. These seven approved treatments reuse the older thirteen-bar waveform behind PF. The brackets, slash, dot and initials keep their existing geometry.</p><p>Software. Sound. Culture.</p><div class="grid">'+cards+'</div><p><a href="comparison.png">Full comparison board</a></p></main></html>\n')
    sources = [REF, FRAME, HERE/'logo-selection.json', Path(__file__)]
    manifest = {'geometry':'open frame selected by user','color_selection':SELECTION,'waveform':'original g22 bars with original ancestor transforms; no old PF or brackets','sources':[{'path':str(p.relative_to(HERE.parent.parent)), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources], 'variations':entries, 'files':[{'path':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(OUT.iterdir()) if p.is_file() and p.name not in ('manifest.json','verification.json')]}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Generated seven approved open-frame waveform treatments and comparison board.')

if __name__=='__main__':
    main()
