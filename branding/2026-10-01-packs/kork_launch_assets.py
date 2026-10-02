"""Kork launch social drafts, built from the Kork pack artwork (October 2, 2026).

Writes brands/kork/launch/: launch-square (1080x1080), launch-landscape
(1600x900) and launch-story (1080x1920) as editable SVG plus PNG, then adds
them to the Kork asset manifest without rebuilding the rest of the pack.

Copy is limited to claims verified for the October 2, 2026 launch: free to
use, 92 catalog services, 10 theme presets, no cut of tips or sales, and the
live address kork.subcult.tv. The landscape draft embeds a real capture of a
locally run Kork page with placeholder handles (references/kork-demo-page-mobile.png).
These are drafts: rendering them is not approval to publish.
"""
from pathlib import Path
import base64, hashlib, json, os, subprocess, xml.etree.ElementTree as ET
R = Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE'] = str(R / 'fontconfig.xml')
import design_helpers as H
d = next(b for b in json.loads((R / 'brands.json').read_text()) if b['slug'] == 'kork')
PACK = R / 'brands/kork'
OUT = PACK / 'launch'
CAPTURE = R / 'references/kork-demo-page-mobile.png'
INK, PAPER, COBALT, CORK = d['fg'], d['secondary'], d['accent'], d['bg']
DISPLAY, BODY, LABEL = d['display'], d['body'], d['label']
T = H.txt
FACTS = [('92 services', 'SOCIALS / PAYMENTS / CRYPTO'), ('10 themes', 'PLUS YOUR OWN COLORS'), ('No cut', 'OF YOUR TIPS OR SALES')]


def base(w, h):
    return H.rect(0, 0, w, h, CORK) + H.cork_texture(w, h)


def fact_card(x, y, w, h, rot, fact):
    head, sub = fact
    return H.pinned_card(d, x, y, w, h, rot, [(head, h * .25, BODY, 700), (sub, h * .11, LABEL, 400)])


def brand_row(x, y, size):
    return H.corkboard_mark(d, x, y, size) + T(x + size * 1.15, y + size * .72, 'kork', size * .62, INK, DISPLAY, 700)


def square():
    w = h = 600
    s = base(w, h) + T(36, 49, 'NOW LIVE / LINK PAGES / BY SUBCULT', 14, INK, LABEL, maxw=528)
    s += T(36, 132, 'EVERY LINK.', 62, INK, DISPLAY, 700, maxw=528) + T(36, 196, 'ONE BOARD.', 62, INK, DISPLAY, 700, maxw=528)
    s += T(36, 240, 'Free link pages from SUBCULT.', 24, INK, BODY, maxw=528)
    s += fact_card(40, 290, 250, 104, -4, FACTS[0]) + fact_card(312, 280, 250, 104, 4, FACTS[1])
    s += fact_card(150, 412, 270, 104, -2, FACTS[2])
    s += H.line(36, 540, 564, 540, COBALT) + T(36, 572, 'kork.subcult.tv', 18, INK, BODY, 700)
    return s, w, h, 1080


def landscape():
    w, h = 1600, 900
    shot = base64.b64encode(CAPTURE.read_bytes()).decode()
    s = base(w, h) + brand_row(96, 84, 92)
    s += T(96, 290, 'NOW LIVE / LINK PAGES / BY SUBCULT', 22, INK, LABEL, maxw=820)
    s += T(96, 400, 'EVERY LINK.', 104, INK, DISPLAY, 700, maxw=860) + T(96, 510, 'ONE BOARD.', 104, INK, DISPLAY, 700, maxw=860)
    s += T(96, 580, 'Socials, payments, QR codes and more on one page.', 32, INK, BODY, maxw=860)
    s += T(96, 628, 'Free to use. Kork never takes a cut of tips or sales.', 32, INK, BODY, maxw=860)
    s += H.line(96, 760, 920, 760, INK, 3) + T(96, 812, 'kork.subcult.tv', 30, INK, BODY, 700)
    # Real capture on a pinned paper card. Placeholder handles; no real account.
    cx, cy, cw, ch = 1060, 70, 404, 790
    s += '<g transform="rotate(3 1262 465)">' + H.rect(cx + 9, cy + 11, cw, ch, INK, 6)[:-2] + ' opacity=".28"/>'
    s += f'<rect x="{cx}" y="{cy}" width="{cw}" height="{ch}" rx="6" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>'
    s += f'<image x="{cx + 22}" y="{cy + 22}" width="360" height="{360 * 1688 / 780:.1f}" preserveAspectRatio="xMidYMin slice" href="data:image/png;base64,{shot}" clip-path="url(#kork-shot)"/>'
    s += f'<clipPath id="kork-shot"><rect x="{cx + 22}" y="{cy + 22}" width="360" height="{ch - 92}"/></clipPath>'
    s += T(cx + 22, cy + ch - 30, 'REAL PAGE / PLACEHOLDER HANDLES', 16, INK, LABEL, maxw=360)
    s += H.pushpin(cx + cw / 2, cy + 6, 20, COBALT, PAPER) + '</g>'
    return s, w, h, w


def story():
    w, h = 1080, 1920
    s = base(w, h) + brand_row(80, 250, 110)
    s += T(80, 470, 'NOW LIVE / LINK PAGES / BY SUBCULT', 30, INK, LABEL, maxw=920)
    s += T(80, 610, 'EVERY LINK.', 118, INK, DISPLAY, 700, maxw=920) + T(80, 740, 'ONE BOARD.', 118, INK, DISPLAY, 700, maxw=920)
    s += T(80, 830, 'Free link pages from SUBCULT.', 44, INK, BODY, maxw=920)
    s += fact_card(90, 920, 600, 190, -3, FACTS[0]) + fact_card(390, 1150, 600, 190, 4, FACTS[1])
    s += fact_card(120, 1380, 600, 190, -2, FACTS[2])
    s += H.line(80, 1620, 1000, 1620, COBALT, 4) + T(80, 1680, 'kork.subcult.tv', 44, INK, BODY, 700)
    return s, w, h, w


def write(name, body, w, h, exportw):
    svg = OUT / f'{name}.svg'
    svg.write_text(H.svg(body, w, h, f'Kork {name} (draft)'))
    ET.parse(svg)
    subprocess.run(['rsvg-convert', '-w', str(exportw), '-o', str(svg.with_suffix('.png')), str(svg)], check=True)


def refresh_manifest():
    # Same entry format as build_packs.py; existing entries keep their order.
    from PIL import Image
    path = PACK / 'asset-manifest.json'
    manifest = json.loads(path.read_text())
    entries = {e['path']: e for e in manifest['files']}
    for p in sorted(OUT.iterdir()):
        if not p.is_file():
            continue
        entry = {'path': str(p.relative_to(PACK)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
        if p.suffix == '.png':
            im = Image.open(p); entry.update(width=im.width, height=im.height, mode=im.mode)
        if entry['path'] in entries:
            entries[entry['path']].clear(); entries[entry['path']].update(entry)
        else:
            manifest['files'].append(entry)
    path.write_text(json.dumps(manifest, indent=2))


OUT.mkdir(parents=True, exist_ok=True)
for name, build in [('launch-square', square), ('launch-landscape', landscape), ('launch-story', story)]:
    write(name, *build())
(OUT / 'README.md').write_text(
    '# Kork launch drafts\n\nGenerated by `kork_launch_assets.py` from the Kork pack artwork on October 2, 2026. '
    'Copy uses only claims verified at launch; see `content/social/Kork Launch Drafts.md` and the Product Claims Register (C-KORK). '
    'The landscape draft embeds a real capture of a locally run Kork page with placeholder handles '
    '(`references/kork-demo-page-mobile.png`). These are unapproved drafts. Regenerate here instead of editing the PNGs.\n')
refresh_manifest()
print(sorted(p.name for p in OUT.iterdir()))
