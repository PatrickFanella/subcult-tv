"""Build the proposed site brand packs listed in site-packs.json.

Each pack is one original geometric mark drawn in code, a lockup, product hero and
link-preview images, sample social layouts, tokens, a guide, alt text and a hash-bound
manifest. Text is converted to paths with Inkscape, so the SVGs need no fonts. Only the
bundled fonts in fonts/ are used, through fontconfig.xml. Rebuilding an unchanged
configuration writes identical bytes.

    python3 studio/brand-tools/site_packs.py            # every pack
    python3 studio/brand-tools/site_packs.py --only pirs
"""
from pathlib import Path
import argparse
import base64
import hashlib
import html
import json
import os
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image, ImageFont

R = Path(__file__).resolve().parent
STUDIO = R.parent
BRANDS_DIR = STUDIO / 'brands'
FONTS = R / 'fonts'
os.environ['FONTCONFIG_FILE'] = str(R / 'fontconfig.xml')
CONFIG = json.loads((R / 'site-packs.json').read_text())
SPACING = [8, 16, 24, 32, 48, 64, 96]
STATUS = ('Proposed identity, generated October 12, 2026 by the site agent from `site-packs.json`; '
          'the owner has not reviewed it. Sample layouts are not approved for publication.')


# ---------------------------------------------------------------- colour and measurement

def luminance(color):
    v = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return sum(a * b for a, b in zip(v, (.2126, .7152, .0722)))


def contrast(a, b):
    low, high = sorted([luminance(a), luminance(b)])
    return (high + .05) / (low + .05)


_font_cache = {}


def font_file(family, weight):
    entry = CONFIG['fonts'][family]
    return FONTS / (entry['bold'] if weight >= 600 else entry['regular'])


def measure(s, family, weight, size, spacing=0):
    key = (family, weight, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(str(font_file(family, weight)), size)
    return _font_cache[key].getlength(s) + spacing * max(len(s) - 1, 0)


def wrap(s, family, weight, size, maxw):
    lines, current = [], ''
    for word in s.split():
        trial = (current + ' ' + word).strip()
        if current and measure(trial, family, weight, size) > maxw:
            lines.append(current)
            current = word
        else:
            current = trial
    return lines + [current] if current else lines


def fit_size(s, family, weight, size, maxw, floor=24):
    """Shrink until the longest word fits, so wrapping never cuts a word."""
    longest = max(s.split(), key=lambda w: measure(w, family, weight, size))
    while size > floor and measure(longest, family, weight, size) > maxw:
        size -= 2
    return size


# ---------------------------------------------------------------- svg primitives

def attrs(**kw):
    return ''.join(f' {k.replace("_", "-")}="{v}"' for k, v in kw.items() if v is not None)


def rect(x, y, w, h, fill='none', rx=0, stroke=None, sw=None):
    return f'<rect{attrs(x=x, y=y, width=w, height=h, rx=rx or None, fill=fill, stroke=stroke, stroke_width=sw)}/>'


def circle(cx, cy, r, fill='none', stroke=None, sw=None):
    return f'<circle{attrs(cx=cx, cy=cy, r=r, fill=fill, stroke=stroke, stroke_width=sw)}/>'


def path(d, stroke=None, sw=None, fill='none', cap='round', join='round'):
    return f'<path{attrs(d=d, fill=fill, stroke=stroke, stroke_width=sw, stroke_linecap=cap, stroke_linejoin=join)}/>'


def text(x, y, s, size, color, family, weight=400, anchor='start', spacing=0):
    return (f'<text x="{x}" y="{y}" fill="{color}" font-family="{html.escape(family, quote=True)}" font-size="{size}"'
            f' font-weight="{weight}" text-anchor="{anchor}"' + (f' letter-spacing="{spacing}"' if spacing else '')
            + f'>{html.escape(s)}</text>')


def svg(body, w, h, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<title>{html.escape(title)}</title>{body}</svg>\n')


def embed(svg_text, x, y, w, h):
    data = base64.b64encode(svg_text.encode()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{data}"/>'


# ---------------------------------------------------------------- marks (512 x 512)
# Each mark takes ink (the single structural colour), accent and secondary. Monochrome
# variants pass the same colour three times. Masks hide lower shapes under upper ones so
# the marks stay readable on any background without fills.

def mask(mid, holes):
    return f'<mask id="{mid}"><rect x="-64" y="-64" width="640" height="640" fill="#fff"/>{holes}</mask>'


def tally_lamp(p, ink, accent, secondary):
    m = f'{p}-tally'
    back = rect(72, 104, 288, 224, rx=28, stroke=ink, sw=26)
    front = rect(152, 184, 288, 224, rx=28, stroke=ink, sw=26)
    hole = rect(152 - 22, 184 - 22, 288 + 44, 224 + 44, fill='#000', rx=40)
    return mask(m, hole) + f'<g mask="url(#{m})">{back}</g>' + front + circle(376, 248, 38, fill=accent)


def pier(p, ink, accent, secondary):
    lines = (path('M48 452 H464', stroke=secondary, sw=5) + path('M472 176 V452', stroke=secondary, sw=5)
             + path('M456 176 H488 M456 452 H488', stroke=secondary, sw=5))
    plank = rect(64, 176, 384, 40, fill=ink, rx=6)
    pilings = ''.join(rect(x, 216, 36, 208, fill=ink) for x in (112, 238, 364))
    return lines + plank + pilings + circle(352, 148, 30, fill=accent)


def popup(p, ink, accent, secondary):
    m = f'{p}-cursor'
    pane = rect(48, 64, 416, 384, rx=12, stroke=ink, sw=14)
    body = rect(152, 172, 208, 172, fill=ink, rx=8) + rect(136, 154, 240, 42, fill=ink, rx=8)
    hole = rect(184, 232, 36, 58, fill='#000')
    return pane + mask(m, hole) + f'<g mask="url(#{m})">{body}</g>' + rect(184, 232, 36, 58, fill=accent)


def photocopy_stack(p, ink, accent, secondary):
    w, h, sw = 264, 344, 14
    sheets = [(104, 72), (132, 100), (160, 128)]  # top, middle, bottom
    out = ''
    for i, (x, y) in reversed(list(enumerate(sheets))):
        holes = ''.join(rect(ux + sw / 2, uy + sw / 2, w - sw, h - sw, fill='#000') for ux, uy in sheets[:i])
        if i == 0 and accent != ink:
            out += (rect(x + 7, y - 6, w, h, stroke=accent, sw=10) + rect(x - 6, y + 7, w, h, stroke=secondary, sw=10))
        sheet = rect(x, y, w, h, stroke=ink, sw=sw)
        if holes:
            m = f'{p}-sheet{i}'
            out += mask(m, holes) + f'<g mask="url(#{m})">{sheet}</g>'
        else:
            out += sheet
    staples = rect(118, 182, 46, 12, fill=ink, rx=3) + rect(118, 246, 46, 12, fill=ink, rx=3)
    return out + staples


def two_monitors(p, ink, accent, secondary):
    out = ''
    for x, bar in ((40, 176), (264, 72)):
        out += rect(x, 136, 208, 160, rx=14, stroke=ink, sw=16)
        out += rect(x + 16, 152, bar, 24, fill=accent, rx=4)
        out += rect(x + 88, 296, 32, 30, fill=ink) + rect(x + 56, 326, 96, 14, fill=ink, rx=4)
    return out


def timer_ring(p, ink, accent, secondary):
    return (circle(256, 224, 150, stroke=ink, sw=12)
            + path('M256 74 A150 150 0 1 1 106 224', stroke=accent, sw=36)
            + rect(176, 424, 160, 24, fill=ink, rx=12))


def cassette(p, ink, accent, secondary):
    return (rect(56, 128, 400, 256, rx=28, stroke=ink, sw=20)
            + rect(136, 200, 240, 112, rx=56, stroke=ink, sw=14)
            + circle(196, 256, 40, stroke=accent, sw=14) + circle(316, 256, 40, stroke=accent, sw=14)
            + circle(196, 256, 16, fill=secondary) + circle(316, 256, 10, fill=ink))


def shelf(p, ink, accent, secondary):
    return (rect(48, 328, 416, 18, fill=ink, rx=4) + rect(80, 346, 18, 40, fill=ink) + rect(414, 346, 18, 40, fill=ink)
            + rect(84, 224, 96, 96, rx=12, stroke=ink, sw=16) + rect(208, 224, 96, 96, rx=12, stroke=ink, sw=16)
            + path('M340 240 L380 286 L420 240', stroke=accent, sw=22))


def metronome(p, ink, accent, secondary):
    ticks = ''.join(path(f'M416 {y} H{464 if y == 280 else 446}', stroke=secondary, sw=8) for y in (180, 230, 280, 330, 380))
    return (path('M208 64 L304 64 L392 440 L120 440 Z', stroke=ink, sw=16)
            + path('M256 404 L306 130', stroke=ink, sw=14) + circle(287, 234, 26, fill=accent) + ticks)


def bridge(p, ink, accent, secondary):
    return (rect(72, 440, 368, 16, fill=ink, rx=4) + rect(104, 272, 44, 168, fill=ink, rx=6) + rect(364, 272, 44, 168, fill=ink, rx=6)
            + path('M126 272 A130 130 0 0 1 386 272', stroke=ink, sw=28) + circle(256, 142, 34, fill=accent))


MARKS = {f.__name__: f for f in (tally_lamp, pier, popup, photocopy_stack, two_monitors, timer_ring, cassette, shelf, metronome, bridge)}


def mark(b, variant='color'):
    c = b['colors']
    ink_light, ink_dark = sorted((c['bg'], c['text']), key=luminance, reverse=True)
    ink, accent, secondary = {
        'color': (c['text'], c['accent'], c['secondary']),
        'mono-dark': (ink_light,) * 3,
        'mono-light': (ink_dark,) * 3,
    }[variant]
    return MARKS[b['mark']](b['slug'], ink, accent, secondary)


def placed_mark(b, x, y, size):
    s = size / 512
    return f'<g transform="translate({x} {y}) scale({s:g})">{mark(b)}</g>'


# ---------------------------------------------------------------- rendering

def run(cmd, **kw):
    result = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if result.returncode:
        raise RuntimeError(f'{cmd[0]} failed: {result.stderr[-800:]}')
    return result


def outline(svg_text):
    """Convert text to paths with Inkscape; returns the plain SVG bytes."""
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = Path(tmp) / 'in.svg', Path(tmp) / 'out.svg'
        src.write_text(svg_text)
        run(['inkscape', str(src), '--export-text-to-path', '--export-plain-svg', '--export-type=svg', f'--export-filename={dst}'])
        return dst.read_text()


def write(dest, name, svg_text, width, outlined=True, png=True):
    p = dest / (name + '.svg')
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(outline(svg_text) if outlined else svg_text)
    ET.parse(p)
    if png:
        run(['rsvg-convert', '-w', str(width), '-o', str(p.with_suffix('.png')), str(p)])
    return p


def write_png(dest, name, svg_text, width):
    dest.mkdir(parents=True, exist_ok=True)
    run(['rsvg-convert', '-w', str(width), '-o', str(dest / (name + '.png'))], input=svg_text)


# ---------------------------------------------------------------- layouts

def label_color(b):
    c = b['colors']
    return c['secondary'] if contrast(c['secondary'], c['bg']) >= 4.5 else c['text']


def label(b, x, y, s, size=22, anchor='start'):
    return text(x, y, s.upper(), size, label_color(b), b['fonts']['label'], 400, anchor, spacing=round(size * .08, 1))


def text_block(b, x, top, width, name_size, body_size, label_line=None, name_gap=28):
    """Label line, wrapped name and wrapped description. Returns (svg, height)."""
    f, c = b['fonts'], b['colors']
    name_size = fit_size(b['name'], f['display'], f['display_weight'], name_size, width)
    names = wrap(b['name'], f['display'], f['display_weight'], name_size, width)
    body = wrap(b['description'], f['body'], 400, body_size, width)
    out, y = '', top
    if label_line:
        out += label(b, x, y, label_line)
        y += 48
    y += name_size * .78
    for line in names:
        out += text(x, round(y, 1), line, name_size, c['text'], f['display'], f['display_weight'])
        y += name_size * 1.1
    y += name_gap
    for line in body:
        out += text(x, round(y, 1), line, body_size, c['text'], f['body'])
        y += body_size * 1.45
    return out, y - top


def centred_block(b, x, w, h, name_size, body_size, label_line=None):
    _, height = text_block(b, x, 0, w, name_size, body_size, label_line)
    top = max(48, round((h - height) / 2 - 8))
    return text_block(b, x, top, w, name_size, body_size, label_line)[0]


def lockup(b):
    f, c = b['fonts'], b['colors']
    size, mark_px = 120, 192
    tw = measure(b['name'], f['display'], f['display_weight'], size)
    w = round(32 + mark_px + 44 + tw + 40)
    body = placed_mark(b, 32, 32, mark_px) + text(32 + mark_px + 44, 128 + size * .36, b['name'], size, c['text'], f['display'], f['display_weight'])
    return svg(body, w, 256, f'{b["name"]} lockup'), w


def hero(b):
    c = b['colors']
    body = rect(0, 0, 1440, 900, fill=c['bg']) + placed_mark(b, 130, 240, 420)
    body += centred_block(b, 660, 684, 900, 84, 32, f'{b["name"]} / by SUBCULT')
    return svg(body, 1440, 900, f'{b["name"]} hero')


def og(b):
    c = b['colors']
    body = rect(0, 0, 1200, 630, fill=c['bg']) + placed_mark(b, 84, 150, 330)
    body += centred_block(b, 470, 650, 630, 64, 28, f'{b["name"]} / by SUBCULT')
    body += label(b, 1120, 586, 'subcult.tv', 22, 'end')
    return svg(body, 1200, 630, f'{b["name"]} link preview')


def banner(b):
    c = b['colors']
    body = rect(0, 0, 1500, 500, fill=c['bg']) + placed_mark(b, 100, 110, 280)
    body += centred_block(b, 440, 960, 500, 72, 30, 'Sample layout · not for publication')
    body += label(b, 1420, 452, f'{b["name"]} / by SUBCULT', 22, 'end')
    return svg(body, 1500, 500, f'{b["name"]} sample banner')


def square(b):
    c = b['colors']
    body = rect(0, 0, 1080, 1080, fill=c['bg']) + placed_mark(b, 96, 96, 320)
    body += label(b, 984, 140, 'Sample layout', 24, 'end')
    body += text_block(b, 96, 520, 888, 76, 34)[0]
    body += label(b, 96, 1000, f'{b["name"]} / by SUBCULT · subcult.tv', 22)
    return svg(body, 1080, 1080, f'{b["name"]} sample square post')


def avatar(b):
    return svg(rect(0, 0, 512, 512, fill=b['colors']['bg']) + placed_mark(b, 96, 96, 320), 512, 512, f'{b["name"]} avatar')


def preview(b, dest, lockup_w):
    """Contact sheet for the gallery: six tiles of the pack's main files."""
    c = b['colors']
    tiles = [('logos/lockup', lockup_w, 256), ('logos/mark', 512, 512), ('product/hero', 1440, 900),
             ('product/og', 1200, 630), ('social/banner', 1500, 500), ('social/square', 1080, 1080)]
    out = ''
    for i, (name, w, h) in enumerate(tiles):
        x, y = (i % 2) * 800, (i // 2) * 600
        out += rect(x, y, 800, 600, fill='#eae6de') + text(x + 24, y + 36, name, 19, '#242226', b['fonts']['label'], 700)
        bw, bh = 752, 506
        s = min(bw / w, bh / h)
        tw, th = round(w * s), round(h * s)
        tx, ty = x + 24 + (bw - tw) // 2, y + 60 + (bh - th) // 2
        if name.startswith('logos/'):
            out += rect(tx, ty, tw, th, fill=c['bg'])
        out += embed((dest / (name + '.svg')).read_text(), tx, ty, tw, th)
    return svg(out, 1600, 1800, f'{b["name"]} pack preview')


# ---------------------------------------------------------------- documents

def tokens(b, ratios):
    f, c = b['fonts'], b['colors']
    roles = {'bg': 'Canvas and the avatar background', 'text': 'Headlines, body copy and the mark',
             'accent': 'The lit element of the mark and emphasis', 'secondary': 'Labels and supporting lines'}
    data = {
        'brand': b['name'], 'slug': b['slug'], 'status': 'proposed', 'direction': b['direction'],
        'generator': 'brand-tools/site_packs.py', 'source': 'brand-tools/site-packs.json',
        'colors': {k: {'value': c[k], 'role': roles[k]} for k in roles},
        'contrast': {f'{k}_on_bg': round(v, 2) for k, v in ratios.items()},
        'contrast_minimums': {'text_on_bg': 4.5, 'accent_on_bg': 3.0},
        'fonts': {'display': {'family': f['display'], 'weight': f['display_weight'], 'role': 'Name and headlines'},
                  'body': {'family': f['body'], 'weight': 400, 'role': 'Descriptions and body copy'},
                  'label': {'family': f['label'], 'weight': 400, 'role': 'Small upper-case labels'}},
        'spacing': SPACING, 'mark_clear_space': '25% of mark height', 'mark_min_width_px': 32,
    }
    css = ':root {\n' + ''.join(f'  --{b["slug"]}-{k}: {c[k]};\n' for k in roles)
    css += ''.join(f'  --{b["slug"]}-font-{k}: "{f[k]}";\n' for k in ('display', 'body', 'label')) + '}\n'
    return json.dumps(data, indent=2) + '\n', css


def guide(b, ratios):
    f, c = b['fonts'], b['colors']
    rows = [('Background', 'bg', 'Canvas'), ('Text', 'text', 'Copy and the mark'),
            ('Accent', 'accent', 'Lit element and emphasis'), ('Secondary', 'secondary', 'Labels and supporting lines')]
    table = '\n'.join(f'| {name} | {c[key]} | {use} | {ratios[key]:.2f}:1 |' if key != 'bg' else f'| {name} | {c[key]} | {use} | — |'
                      for name, key, use in rows)
    return f'''# {b['name']} — Brand guide

{b['name']}: {b['description']}

Status: {STATUS}

## Mark

{b['mark_description']} It is drawn in code; nothing is traced from a product repository or another pack. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. Below that, use nothing.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
{table}

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: {f['display']}, weight {f['display_weight']}, for the name and headlines.
- Body: {f['body']}, regular, for descriptions.
- Label: {f['label']}, regular, upper case with slight tracking, for small labels such as `{b['name'].upper()} / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/site_packs.py --only {b['slug']}` from the repository root. Do not edit the PNG exports by hand.
'''


def alt_text(b):
    n = b['name']
    return f'''# {n} — Alt text starters

- Mark: {b['mark_description']}
- Hero: {b['colors']['bg']} background. On the left, the {n} mark. On the right, the small label {n.upper()} / BY SUBCULT, the name {n} and the line: {b['description']}
- Link preview: The {n} mark at the left, the label {n.upper()} / BY SUBCULT, the name {n}, the line: {b['description']} Bottom right: SUBCULT.TV.
- Banner (sample): The {n} mark at the left, the label SAMPLE LAYOUT · NOT FOR PUBLICATION, the name and the one-line description, and the label {n.upper()} / BY SUBCULT at the bottom right.
- Square (sample): The {n} mark at the top left, SAMPLE LAYOUT at the top right, the name and the one-line description, and {n.upper()} / BY SUBCULT · SUBCULT.TV at the bottom.
- Avatar: The {n} mark centred on {b['colors']['bg']}.

Replace these starters when copy or imagery changes. The sample layouts are not approved for publication.
'''


# ---------------------------------------------------------------- build

def png_entry(p):
    entry = {'path': None, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
    if p.suffix == '.png':
        im = Image.open(p)
        entry.update(width=im.width, height=im.height, mode=im.mode)
    return entry


def build(b):
    c = b['colors']
    ratios = {k: contrast(c[k], c['bg']) for k in ('text', 'accent', 'secondary')}
    if ratios['text'] < 4.5 or ratios['accent'] < 3:
        raise SystemExit(f"{b['slug']}: text/bg {ratios['text']:.2f}:1 needs 4.5:1 and accent/bg {ratios['accent']:.2f}:1 needs 3:1")
    dest = BRANDS_DIR / b['slug']
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    logos, product, social = dest / 'logos', dest / 'product', dest / 'social'

    write(logos, 'mark', svg(mark(b), 512, 512, f'{b["name"]} mark'), 512, outlined=False)
    for variant in ('mono-dark', 'mono-light'):
        write(logos, f'mark-{variant}', svg(mark(b, variant), 512, 512, f'{b["name"]} mark, {variant}'), 512, outlined=False, png=False)
    lockup_svg, lockup_w = lockup(b)
    write(logos, 'lockup', lockup_svg, lockup_w)
    product.mkdir()
    shutil.copyfile(logos / 'mark.svg', product / 'mark.svg')
    write(product, 'hero', hero(b), 1440)
    write(product, 'og', og(b), 1200)
    write(social, 'banner', banner(b), 1500)
    write(social, 'square', square(b), 1080)
    write_png(social, 'avatar', avatar(b), 512)
    write(dest, 'pack-preview', preview(b, dest, lockup_w), 1600)

    fonts = dest / 'fonts'
    fonts.mkdir()
    for family in sorted({b['fonts'][k] for k in ('display', 'body', 'label')}):
        entry = CONFIG['fonts'][family]
        for name in entry['files'] + [entry['license']]:
            shutil.copyfile(FONTS / name, fonts / name)

    tokens_json, tokens_css = tokens(b, ratios)
    (dest / 'tokens.json').write_text(tokens_json)
    (dest / 'tokens.css').write_text(tokens_css)
    (dest / 'GUIDE.md').write_text(guide(b, ratios))
    (dest / 'alt-text.md').write_text(alt_text(b))

    files = []
    for p in sorted(dest.rglob('*')):
        if p.is_file() and p.name != 'asset-manifest.json' and '.font-cache' not in p.parts:
            entry = png_entry(p)
            entry['path'] = str(p.relative_to(dest))
            files.append(entry)
    manifest = {'status': 'proposed', 'brand': b['name'], 'generator': 'brand-tools/site_packs.py', 'files': files}
    (dest / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(b['name'], len(files), 'files', flush=True)


def update_library_manifest():
    """Refresh the Studio-wide manifest rows for these packs and their generator, keeping the
    committed row order and appending new paths in sorted order, as build_packs.py does."""
    manifest = STUDIO / 'asset-manifest.json'
    rows = json.loads(manifest.read_text())
    by_path = {row['path']: row for row in rows}
    paths = [R / 'site_packs.py', R / 'site-packs.json', R / 'README.md', BRANDS_DIR / 'README.md', BRANDS_DIR / 'index.html']
    for b in CONFIG['brands']:
        paths += list((BRANDS_DIR / b['slug']).rglob('*'))
    for p in paths:
        if not p.is_file():
            continue
        relative = str(p.relative_to(STUDIO))
        row = by_path.get(relative, {'path': relative})
        row.update({k: v for k, v in png_entry(p).items() if k != 'path'})
        by_path[relative] = row
    existing = {row['path'] for row in rows}
    updated = [by_path[row['path']] for row in rows] + [by_path[key] for key in sorted(set(by_path) - existing)]
    manifest.write_text(json.dumps(updated, indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--only', metavar='SLUG', help='Build one pack')
    parser.add_argument('--no-library-manifest', action='store_true', help='Skip refreshing studio/asset-manifest.json')
    args = parser.parse_args()
    brands = [b for b in CONFIG['brands'] if not args.only or b['slug'] == args.only]
    if not brands:
        raise SystemExit(f'No pack named {args.only}')
    for b in brands:
        build(b)
    if not args.no_library_manifest:
        update_library_manifest()
    print('Site packs built.')


if __name__ == '__main__':
    main()
