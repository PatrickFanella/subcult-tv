#!/usr/bin/env python3
"""Build the Chatty Cat identity (B / Pixel cat) across its palettes and export web assets.

Everything editable is in brand.json: the pixel grid that draws the cat, the palette
table and the fonts. Standalone generator in the Subsets pattern. Needs rsvg-convert,
Inkscape and fontconfig with the bundled fonts (run on Kvant).

    python3 build.py                                   # rebuild the pack in the default palette
    python3 build.py --palette violet                  # main layouts and product export in another palette
    python3 build.py --custom "bg=#101010,fg=#f0f0f0,face=#ff66aa,cursor=#66ffcc"
    python3 build.py --export /path/to/chatty-cat/web/public
    python3 build.py --product-root /path/to/chatty-cat   # refresh design-system/ copy with provenance

Every palette always gets its own mark, lockup, avatar, favicon and tokens under palettes/.
Rows in the artwork are bars, not words; headlines are sample copy.
"""
import argparse
import hashlib
import json
import os
import shutil
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LIBRARY = ROOT.parents[1] / 'brand-tools'
FONT_SOURCE = LIBRARY / 'fonts'
FONT_FILES = ['CascadiaMono-Regular.ttf', 'CascadiaMono-Bold.ttf', 'Public-Sans-0.ttf', 'Public-Sans-1.ttf',
              'cascadiamono-OFL.txt', 'publicsans-OFL.txt']
CONFIG = json.loads((ROOT / 'brand.json').read_text())
MONO = CONFIG['fonts']['label']
SANS = CONFIG['fonts']['body']
ENV = os.environ | {'FONTCONFIG_FILE': str(ROOT / 'fontconfig.xml')}
TAG = 'SELF-HOSTED TWITCH CHAT / BY SUBCULT'
SAMPLE = 'SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION'
WORD = CONFIG['wordmark']


# --- colour helpers ----------------------------------------------------------
def luminance(color):
    v = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return round((y + .05) / (x + .05), 2)


def mix(a, b, t):
    """sRGB mix of a toward b by t (0..1)."""
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(x + (y - x) * t) for x, y in zip(pa, pb))


def palette(name, raw):
    """Expand a four-colour row into the roles the layouts use."""
    for k in ('bg', 'fg', 'face', 'cursor'):
        if not isinstance(raw.get(k), str) or len(raw[k]) != 7 or raw[k][0] != '#':
            raise SystemExit(f'palette {name}: {k} must be a #rrggbb colour')
    p = dict(name=name, bg=raw['bg'], fg=raw['fg'], face=raw['face'], cursor=raw['cursor'], source=raw.get('source', ''))
    p['panel'] = mix(p['bg'], p['fg'], .07)
    p['line'] = mix(p['bg'], p['fg'], .22)
    p['muted'] = mix(p['bg'], p['fg'], .6)
    p['third'] = mix(p['face'], p['fg'], .45)
    p['contrast'] = {'fg': contrast(p['fg'], p['bg']), 'face': contrast(p['face'], p['bg']), 'cursor': contrast(p['cursor'], p['bg']),
                     'muted': contrast(p['muted'], p['bg'])}
    p['light'] = luminance(p['bg']) > .4
    return p


# --- svg helpers -------------------------------------------------------------
def save(name, content):
    file = ROOT / name
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content)
    if file.suffix == '.svg':
        ET.parse(file)
    return file


def svg(width, height, content, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-label="{label}"><title>{label}</title>{content}</svg>\n')


def png(source, target, width, height=None):
    args = ['rsvg-convert', '-w', str(width)] + (['-h', str(height)] if height else []) + ['-o', str(target), str(source)]
    subprocess.run(args, check=True, env=ENV)


def outline(source, target):
    result = subprocess.run(['inkscape', str(source), '--export-text-to-path', '--export-plain-svg',
                             f'--export-filename={target}'], env=ENV, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-600:])
    ET.parse(target)


def rect(x, y, w, h, fill, rx=0, op=None):
    o = f' opacity="{op}"' if op is not None else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{o}/>'


def text(x, y, s, size, color, font=SANS, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing}"' if spacing else ''
    return f'<text x="{x}" y="{y}" font-family="{font}" font-weight="{weight}" font-size="{size}" fill="{color}" text-anchor="{anchor}"{sp}>{s}</text>'


def write_svg_png(name, width, height, body, label, export_w=None, outlined=False):
    source = save(name + '.svg', svg(width, height, body, label))
    png(source, ROOT / (name + '.png'), export_w or width)
    if outlined:
        outline(source, ROOT / (name + '-outlined.svg'))


# --- the mark -----------------------------------------------------------------
PIX = CONFIG['pixels']
COLS = max(len(r) for r in PIX)
if COLS > 12 or len(PIX) > 12:
    raise SystemExit('pixels: at most 12 columns and 12 rows')
CELL = 24 / 12
OFFSET_Y = (24 - len(PIX) * CELL) / 2


def pixel_paths():
    """Two path strings on a 24-unit canvas: the face cells and the cursor cells."""
    face, cursor = [], []
    for r, row in enumerate(PIX):
        for c, ch in enumerate(row):
            x, y = c * CELL, OFFSET_Y + r * CELL
            cell = f'M{x:g} {y:g}h{CELL + .02:g}v{CELL + .02:g}h-{CELL + .02:g}z'
            if ch == '#':
                face.append(cell)
            elif ch == 'o':
                cursor.append(cell)
    return ''.join(face), ''.join(cursor)


FACE_PATH, CURSOR_PATH = pixel_paths()


def mark(p, x=0, y=0, size=24, mono=False, face=None, cursor=None):
    f = face or (p['fg'] if mono else p['face'])
    c = cursor or (p['fg'] if mono else p['cursor'])
    return (f'<g transform="translate({x} {y}) scale({size / 24:.6f})" shape-rendering="crispEdges">'
            f'<path fill="{f}" d="{FACE_PATH}"/><path fill="{c}" d="{CURSOR_PATH}"/></g>')


def themed_mark():
    """Inline-able SVG whose colours follow CSS custom properties, with the default palette as fallback."""
    d = palette('default', CONFIG['palettes'][CONFIG['default_palette']])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Chatty Cat" shape-rendering="crispEdges">'
            f'<title>Chatty Cat</title><path fill="var(--cat-face, {d["face"]})" d="{FACE_PATH}"/>'
            f'<path fill="var(--cat-cursor, {d["cursor"]})" d="{CURSOR_PATH}"/></svg>\n')


def wordmark(p, x, baseline, size, color=None):
    return text(x, baseline, WORD, size, color or p['face'], MONO, 700, spacing=f'{-size * .01:.2f}')


# --- motif ---------------------------------------------------------------------
PATTERN = [(3, 16, 11), (5, 11, 7), (2, 18, 0), (4, 9, 13), (6, 14, 5), (3, 7, 0), (5, 17, 9), (2, 12, 6)]


def log_block(p, x, y, width, rows, row_h=26, live=True):
    names = [p['face'], p['cursor'], p['third']]
    out = []
    unit = width / 40
    h = row_h * .42
    for i in range(rows):
        nu, tu, eu = PATTERN[i % len(PATTERN)]
        ry = y + i * row_h
        out.append(rect(x, ry, unit * 3, h, p['fg'], h / 2, .35))
        nx = x + unit * 4
        out.append(rect(nx, ry, unit * nu, h, names[i % 3], h / 2))
        tx = nx + unit * (nu + 1)
        out.append(rect(tx, ry, unit * tu, h, p['fg'], h / 2, .8))
        if eu:
            out.append(rect(tx + unit * (tu + 1), ry, unit * eu, h, p['fg'], h / 2, .45))
    if live:
        out.append(rect(x + width - unit * 2.5, y + (rows - 1) * row_h, unit * 2.5, h, p['cursor'], 2))
    return ''.join(out)


def sparkline(p, x, y, w, h, color=None, stroke=3):
    color = color or p['cursor']
    vals = [.2, .35, .3, .5, .42, .7, .55, .62, .9, .7, .78, .6, .85, 1.0, .74]
    step = w / (len(vals) - 1)
    pts = ' '.join(f'{x + i * step:.1f},{y + h - v * h:.1f}' for i, v in enumerate(vals))
    lx, ly = x + w, y + h - vals[-1] * h
    return (f'<polygon points="{x},{y + h} {pts} {x + w},{y + h}" fill="{color}" opacity=".12"/>'
            f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linejoin="round" stroke-linecap="round"/>'
            f'<rect x="{lx - stroke * 2:.1f}" y="{ly - stroke * 2:.1f}" width="{stroke * 4}" height="{stroke * 4}" fill="{color}"/>')


def chips(p, x, y, labels, size=13):
    out = []
    for label in labels:
        w = size * .62 * len(label) + size * 1.2
        out.append(rect(x, y, w, size * 1.7, p['line'], 3) + text(x + size * .6, y + size * 1.2, label, size, p['fg'], MONO))
        x += w + size * .6
    return ''.join(out)


def header_strip(p, x, y, width):
    s = rect(x, y, width, 64, p['panel'], 6) + mark(p, x + 14, y + 14, 36) + text(x + 62, y + 41, WORD, 24, p['face'], MONO, 700)
    s += chips(p, x + 230, y + 17, ['room 1', 'room 2', 'room 3', 'room 4', 'room 5', 'room 6'])
    s += rect(x + width - 196, y + 27, 10, 10, p['cursor']) + text(x + width - 178, y + 37, 'connected', 14, p['muted'], MONO)
    s += sparkline(p, x + width - 84, y + 18, 66, 28, p['face'], 2)
    return s


def footer(p, width, height):
    return (f'<path d="M64 {height - 86}H{width - 64}" stroke="{p["line"]}" stroke-width="2"/>'
            + text(64, height - 44, 'CHAT.SUBCULT.TV', 18, p['muted'], MONO) + text(width - 64, height - 44, TAG, 18, p['muted'], MONO, anchor='end'))


def canvas(p, w, h):
    return rect(0, 0, w, h, p['bg'])


def layout(p, name, width, height, headline, support=None, rows=None):
    m = 64
    story = 'story' in name
    top = 300 if story else int(height * .13)
    parts = [canvas(p, width, height), header_strip(p, m, top - 120 if story else 56, width - 2 * m)]
    size = min(76, width / 15)
    y = top + 90 if story else top + 110
    for i, line in enumerate(headline):
        parts.append(text(m, y + i * size * 1.2, line, size, p['fg'], MONO, 700))
    y += len(headline) * size * 1.2
    if support:
        parts.append(text(m, y + 4, support, size * .36, p['muted'], SANS))
        y += size * .7
    rows = rows or (12 if story else 6)
    log_w = width - 2 * m
    panel_h = rows * 26 + 32
    parts.append(rect(m, y + 20, log_w, panel_h, p['panel'], 6) + log_block(p, m + 20, y + 40, log_w - 40, rows, 26))
    parts.append(sparkline(p, m, y + 20 + panel_h + 48, log_w, 56))
    parts.append(text(m, height - 108, SAMPLE, 16, p['muted'], MONO) + footer(p, width, height))
    return svg(width, height, ''.join(parts), f'Chatty Cat {name}')


def ico(pngs):
    header = struct.pack('<HHH', 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries, data = b'', b''
    for size, blob in pngs:
        entries += struct.pack('<BBBBHHII', size % 256, size % 256, 0, 0, 1, 32, len(blob), offset)
        data += blob
        offset += len(blob)
    return header + entries + data


def asset_entry(p, relative):
    entry = {'path': relative, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
    if p.suffix == '.svg':
        element = ET.parse(p).getroot()
        if 'width' in element.attrib:
            entry['dimensions'] = {'width': float(element.attrib['width']), 'height': float(element.attrib['height'])}
    elif p.suffix == '.png':
        w, h = struct.unpack('>II', p.read_bytes()[16:24])
        entry['dimensions'] = {'width': w, 'height': h}
    return entry


# --- builders ---------------------------------------------------------------------
def build_palette_set(palettes):
    """Mark, lockup, avatar, favicon and tokens for every palette, plus the palette sheet."""
    rows = []
    for name, p in palettes.items():
        base = f'palettes/{name}'
        write_svg_png(f'{base}/mark', 128, 128, canvas(p, 128, 128) + mark(p, 16, 16, 96), f'Chatty Cat mark, {name} palette', 512)
        write_svg_png(f'{base}/lockup', 600, 128, canvas(p, 600, 128) + mark(p, 16, 16, 96) + wordmark(p, 136, 94, 72), f'Chatty Cat lockup, {name} palette', 1200)
        write_svg_png(f'{base}/avatar', 512, 512, canvas(p, 512, 512) + mark(p, 64, 64, 384), f'Chatty Cat avatar, {name} palette')
        save(f'{base}/favicon.svg', svg(24, 24, rect(0, 0, 24, 24, p['bg'], 5) + mark(p), f'Chatty Cat, {name}'))
        save(f'{base}/tokens.css', f':root[data-cat-palette="{name}"] {{\n' + ''.join(f'  --cat-{k}: {p[k]};\n' for k in ('bg', 'fg', 'face', 'cursor', 'panel', 'line', 'muted')) + '}\n')
        rows.append(p)
    # Sheet: four columns of palette cards.
    cols = 4
    cw, ch = 400, 300
    sheet_h = 120 + ((len(rows) + cols - 1) // cols) * ch + 40
    s = rect(0, 0, cols * cw + 80, sheet_h, '#f0ece4') + text(40, 56, 'CHATTY CAT / PALETTES / EDIT brand.json AND REBUILD', 18, '#17131d', MONO)
    for i, p in enumerate(rows):
        x = 40 + (i % cols) * cw
        y = 100 + (i // cols) * ch
        s += rect(x, y, cw - 24, ch - 24, p['bg'], 8) + mark(p, x + 24, y + 24, 96) + wordmark(p, x + 136, y + 86, 40)
        s += text(x + 24, y + 160, p['name'], 22, p['fg'], MONO, 700)
        s += text(x + 24, y + 190, f'bg {p["bg"]}  fg {p["fg"]}', 14, p['muted'], MONO)
        s += text(x + 24, y + 212, f'face {p["face"]}  cursor {p["cursor"]}', 14, p['muted'], MONO)
        c = p['contrast']
        s += text(x + 24, y + 244, f'contrast fg {c["fg"]}  face {c["face"]}  cursor {c["cursor"]}', 13, p['muted'], MONO)
        s += sparkline(p, x + 24, y + 256, cw - 72, 8, p['cursor'], 2)
    write_svg_png('palettes', cols * cw + 80, sheet_h, s, 'Chatty Cat palette sheet')
    return rows


def build_logos(p):
    write_svg_png('logos/mark-primary', 128, 128, canvas(p, 128, 128) + mark(p, 16, 16, 96), 'Chatty Cat mark', 512)
    save('logos/mark-glyph.svg', svg(24, 24, mark(p), 'Chatty Cat glyph'))
    save('logos/mark-themed.svg', themed_mark())
    for variant, ink in (('mono-dark', '#ffffff'), ('mono-light', '#111111')):
        write_svg_png(f'logos/mark-{variant}', 128, 128, mark(p, 16, 16, 96, face=ink, cursor=ink), f'Chatty Cat mark, {variant}', 512)
        write_svg_png(f'logos/lockup-{variant}', 600, 128, mark(p, 16, 16, 96, face=ink, cursor=ink) + wordmark(p, 136, 94, 72, ink), f'Chatty Cat lockup, {variant}', 1200, outlined=True)
    write_svg_png('logos/lockup-primary', 600, 128, canvas(p, 600, 128) + mark(p, 16, 16, 96) + wordmark(p, 136, 94, 72), 'Chatty Cat lockup', 1200, outlined=True)


def build_product(p, palettes):
    prod = ROOT / 'product'
    prod.mkdir(exist_ok=True)
    favicon = svg(24, 24, rect(0, 0, 24, 24, p['bg'], 5) + mark(p), 'Chatty Cat')
    (prod / 'favicon.svg').write_text(favicon)
    (prod / 'icon-src.svg').write_text(favicon)
    (prod / 'mark-themed.svg').write_text(themed_mark())
    for f in ('favicon.svg', 'mark-themed.svg'):
        ET.parse(prod / f)
    for size in (16, 32, 48, 180, 192, 512):
        png(prod / 'favicon.svg', prod / f'icon-{size}.png', size)
    (prod / 'apple-touch-icon.png').write_bytes((prod / 'icon-180.png').read_bytes())
    (prod / 'icon-180.png').unlink()
    save('product/icon-maskable.svg', svg(24, 24, rect(0, 0, 24, 24, p['bg']) + mark(p, 3.6, 3.6, 16.8), 'Chatty Cat maskable icon'))
    png(prod / 'icon-maskable.svg', prod / 'icon-maskable-512.png', 512)
    (prod / 'favicon.ico').write_bytes(ico([(s, (prod / f'icon-{s}.png').read_bytes()) for s in (16, 32, 48)]))
    for s in (16, 32, 48):
        (prod / f'icon-{s}.png').unlink()
    og = canvas(p, 1200, 630) + mark(p, 72, 64, 88) + wordmark(p, 184, 128, 64)
    og += text(72, 262, CONFIG['tagline'], 58, p['fg'], MONO, 700) + text(72, 316, CONFIG['support'], 24, p['muted'], SANS)
    og += rect(72, 356, 1056, 170, p['panel'], 6) + log_block(p, 92, 376, 1016, 5, 28)
    og += text(72, 586, 'CHAT.SUBCULT.TV', 20, p['muted'], MONO) + text(1128, 586, TAG, 20, p['muted'], MONO, anchor='end')
    write_svg_png('product/og', 1200, 630, og, 'Chatty Cat link preview')
    (prod / 'palettes.json').write_text(json.dumps({'default': p['name'], 'palettes': {n: {k: q[k] for k in ('bg', 'fg', 'face', 'cursor', 'panel', 'line', 'muted')} for n, q in palettes.items()}}, indent=2) + '\n')


def build_social_and_video(p):
    banner = canvas(p, 1500, 500) + mark(p, 72, 76, 120) + wordmark(p, 216, 168, 86)
    banner += text(72, 268, 'six channels.', 56, p['fg'], MONO, 700) + text(72, 330, 'one scrollback.', 56, p['fg'], MONO, 700)
    banner += text(72, 372, CONFIG['support'], 23, p['muted'], SANS)
    banner += rect(900, 64, 528, 300, p['panel'], 6) + log_block(p, 920, 86, 488, 10, 27)
    banner += sparkline(p, 72, 400, 1356, 50) + text(1428, 476, TAG, 18, p['muted'], MONO, anchor='end')
    write_svg_png('social/banner-x-bluesky', 1500, 500, banner, 'Chatty Cat banner')
    write_svg_png('social/banner-tall-master', 1500, 600, canvas(p, 1500, 600) + f'<g transform="translate(0 50)">{banner}</g>', 'Chatty Cat banner, taller master')
    write_svg_png('social/avatar', 512, 512, canvas(p, 512, 512) + mark(p, 64, 64, 384), 'Chatty Cat avatar')
    save('social/square-post.svg', layout(p, 'square post', 1080, 1080, ['six channels.', 'one scrollback.'], CONFIG['support']))
    save('social/landscape-template.svg', layout(p, 'landscape template', 1600, 900, ['six channels. one scrollback.'], 'YOUR APPROVED CAPTION'))
    save('social/story-template.svg', layout(p, 'story template', 1080, 1920, ['six channels.', 'one', 'scrollback.'], 'Replace this line with approved copy.'))
    quote = canvas(p, 1080, 1080) + header_strip(p, 64, 56, 952) + text(64, 300, '"', 150, p['face'], MONO, 700)
    quote += text(64, 420, 'add the exact quote.', 60, p['fg'], MONO, 700) + text(64, 500, 'keep its context.', 60, p['fg'], MONO, 700)
    quote += f'<path d="M64 580H1016" stroke="{p["face"]}" stroke-width="5"/>' + text(64, 650, 'SOURCE / SPEAKER / DATE', 24, p['muted'], MONO) + text(64, 700, 'ORIGINAL URL / TIMESTAMP', 22, p['muted'], MONO)
    quote += text(64, 972, SAMPLE, 16, p['muted'], MONO) + footer(p, 1080, 1080)
    save('social/quote-template.svg', svg(1080, 1080, quote, 'Chatty Cat quote template'))
    release = canvas(p, 1080, 1080) + header_strip(p, 64, 56, 952) + text(64, 300, 'what changed', 72, p['fg'], MONO, 700)
    for i, line in enumerate(['01 / a verified change', '02 / a useful consequence', '03 / a direct destination']):
        release += text(64, 400 + i * 80, line, 32, p['fg'], SANS)
    release += rect(64, 680, 952, 190, p['panel'], 6) + log_block(p, 84, 700, 912, 6, 28)
    release += text(64, 972, SAMPLE, 16, p['muted'], MONO) + footer(p, 1080, 1080)
    save('social/release-template.svg', svg(1080, 1080, release, 'Chatty Cat release template'))
    frame = canvas(p, 1600, 1000) + header_strip(p, 64, 56, 1472)
    frame += f'<rect x="64" y="160" width="1472" height="680" rx="6" fill="none" stroke="{p["face"]}" stroke-width="3"/>'
    frame += text(84, 520, 'Place a verified screenshot here. Crop credentials, private panes and personal data.', 28, p['muted'], SANS)
    frame += text(64, 892, SAMPLE, 16, p['muted'], MONO) + footer(p, 1600, 1000)
    save('social/screenshot-frame.svg', svg(1600, 1000, frame, 'Chatty Cat screenshot frame'))
    for name in ['square-post', 'landscape-template', 'story-template', 'quote-template', 'release-template', 'screenshot-frame']:
        w = ET.parse(ROOT / f'social/{name}.svg').getroot().attrib['width']
        png(ROOT / f'social/{name}.svg', ROOT / f'social/{name}.png', int(float(w)))
    title = canvas(p, 1920, 1080) + mark(p, 96, 96, 120) + wordmark(p, 240, 186, 84)
    title += text(96, 480, 'six channels.', 108, p['fg'], MONO, 700) + text(96, 606, 'one scrollback.', 108, p['fg'], MONO, 700)
    title += sparkline(p, 96, 820, 1728, 90) + text(96, 984, SAMPLE, 18, p['muted'], MONO) + text(1824, 984, TAG, 18, p['muted'], MONO, anchor='end')
    write_svg_png('video/title-card', 1920, 1080, title, 'Chatty Cat title card')
    thumb = canvas(p, 1920, 1080) + rect(96, 96, 1040, 888, p['panel'], 8) + log_block(p, 128, 136, 976, 28, 30)
    thumb += mark(p, 1232, 120, 96) + wordmark(p, 1352, 190, 64)
    thumb += text(1232, 420, 'six channels.', 92, p['fg'], MONO, 700) + text(1232, 540, 'one log.', 92, p['fg'], MONO, 700) + text(1232, 984, SAMPLE, 18, p['muted'], MONO)
    write_svg_png('video/thumbnail', 1920, 1080, thumb, 'Chatty Cat thumbnail')
    end = canvas(p, 1920, 1080) + mark(p, 840, 300, 240) + text(960, 650, WORD, 96, p['face'], MONO, 700, anchor='middle')
    end += text(960, 730, 'chat.subcult.tv', 40, p['fg'], MONO, anchor='middle') + text(960, 984, TAG, 18, p['muted'], MONO, anchor='middle')
    write_svg_png('video/end-card', 1920, 1080, end, 'Chatty Cat end card')
    lower = rect(96, 840, 760, 144, p['bg'], 6, .96) + rect(96, 840, 10, 144, p['face'], 3)
    lower += mark(p, 130, 868, 88) + text(240, 905, 'TITLE / SPEAKER', 40, p['fg'], MONO, 700) + text(240, 955, 'A short line of context.', 28, p['muted'], SANS)
    write_svg_png('video/lower-third', 1920, 1080, lower, 'Chatty Cat lower third')
    fgc = p['fg'][5:7] + p['fg'][3:5] + p['fg'][1:3]
    bgc = p['bg'][5:7] + p['bg'][3:5] + p['bg'][1:3]
    save('video/captions.ass', '[Script Info]\nTitle: Chatty Cat captions\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n'
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
         f'Style: Default,{SANS},48,&H00{fgc.upper()},&H00{fgc.upper()},&H00{bgc.upper()},&HBE{bgc.upper()},0,0,0,0,100,100,0,0,3,2,0,2,120,120,90,1\n\n[Events]\n'
         'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Replace with the actual spoken words.\n')


def build_board(p, palettes):
    board = canvas(p, 1440, 960) + text(64, 58, f'CHATTY CAT / PIXEL CAT / {p["name"].upper()} PALETTE', 16, p['muted'], MONO) + f'<path d="M64 88H1376" stroke="{p["line"]}"/>'
    board += mark(p, 64, 140, 160) + wordmark(p, 256, 262, 118) + text(262, 306, 'by SUBCULT · chat.subcult.tv', 18, p['muted'], MONO)
    for i, (name, color) in enumerate([('BG', p['bg']), ('PANEL', p['panel']), ('FG', p['fg']), ('FACE', p['face']), ('CURSOR', p['cursor']), ('MUTED', p['muted'])]):
        x = 64 + i * 222
        board += rect(x, 378, 200, 96, color, 4) + f'<rect x="{x}" y="378" width="200" height="96" rx="4" fill="none" stroke="{p["line"]}"/>' + text(x, 506, f'{name} / {color.upper()}', 15, p['fg'], MONO)
    board += text(64, 606, CONFIG['tagline'], 60, p['fg'], MONO, 700) + text(64, 654, CONFIG['support'], 22, p['muted'], SANS)
    board += text(64, 710, 'CASCADIA MONO / PUBLIC SANS', 16, p['muted'], MONO)
    # Palette strip: every palette's mark in a row.
    n = len(palettes)
    step = min(72, 1312 / n)
    for i, q in enumerate(palettes.values()):
        x = 64 + i * step
        board += rect(x, 748, step - 8, 64, q['bg'], 6) + mark(q, x + (step - 8 - 44) / 2, 758, 44)
    board += text(64, 846, f'{n} PALETTES / ADD ONE IN brand.json / --palette NAME AT BUILD / data-cat-palette AT RUNTIME', 14, p['muted'], MONO)
    board += rect(64, 870, 1312, 50, p['panel'], 6) + log_block(p, 84, 884, 1272, 1, 26)
    board += text(64, 944, 'ORIGINAL PIXEL MARK / LICENSED FONTS / BARS NOT WORDS / SUBCULT STUDIO', 12, p['muted'], MONO)
    write_svg_png('brand-board', 1440, 960, board, 'Chatty Cat brand board')
    shutil.copyfile(ROOT / 'brand-board.svg', ROOT / 'pack-preview.svg')
    shutil.copyfile(ROOT / 'brand-board.png', ROOT / 'pack-preview.png')


def build_tokens(p, palettes):
    tokens = {'brand': CONFIG['name'], 'slug': CONFIG['slug'], 'wordmark': WORD, 'direction': CONFIG['direction'], 'status': CONFIG['asset_status'],
              'direction_selection': CONFIG['direction_selection'], 'lineage': CONFIG['lineage'], 'repository': CONFIG['repository'],
              'default_palette': p['name'], 'palettes': {n: {k: q[k] for k in ('bg', 'fg', 'face', 'cursor', 'panel', 'line', 'muted', 'contrast', 'source')} for n, q in palettes.items()},
              'palette_rules': CONFIG['palette_rules'], 'pixels': PIX, 'fonts': CONFIG['fonts'], 'spacing': [4, 8, 12, 16, 20, 24, 32, 48, 64, 96],
              'radii': {'control': 4, 'panel': 6, 'tile': '5/24 of the icon width'}, 'mark_clear_space': '25% of mark height', 'mark_min_width_px': 16,
              'lockup_min_width_px': 160, 'customisation': {
                  'build_time': 'python3 build.py --palette <name> or --custom "bg=#..,fg=#..,face=#..,cursor=#.."',
                  'runtime': 'set data-cat-palette="<name>" on <html> with tokens.css, or set --cat-face and --cat-cursor yourself; logos/mark-themed.svg follows them when inlined',
                  'shape': 'edit the pixels grid in brand.json (12 columns; # face, o cursor) and rebuild'},
              'product_interface': {'rules_document': 'docs/design-system.md in the product repository',
                                    'app_palette_axes': 'colour x shade x variant in web/src/palettes.css; the brand palettes above are those colours at their default shades',
                                    'source': 'chatty-cat web/src/palettes.css and display-data.ts, read October 11, 2026'}}
    save('tokens.json', json.dumps(tokens, indent=2) + '\n')
    css = f':root {{\n' + ''.join(f'  --cat-{k}: {p[k]};\n' for k in ('bg', 'fg', 'face', 'cursor', 'panel', 'line', 'muted')) + ''.join(f'  --font-{k}: "{v}";\n' for k, v in CONFIG['fonts'].items()) + '}\n'
    for n, q in palettes.items():
        css += f':root[data-cat-palette="{n}"] {{' + ' '.join(f'--cat-{k}: {q[k]};' for k in ('bg', 'fg', 'face', 'cursor', 'panel', 'line', 'muted')) + ' }\n'
    save('tokens.css', css)


def copy_design_system(product_root):
    source = product_root / 'docs/design-system.md'
    target = ROOT / 'design-system'
    target.mkdir(exist_ok=True)
    shutil.copyfile(source, target / 'README.md')
    shutil.copyfile(ROOT / 'tokens.css', target / 'tokens.css')
    head = subprocess.run(['git', '-C', str(product_root), 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()
    dirty = subprocess.run(['git', '-C', str(product_root), 'status', '--porcelain', '--', 'docs/design-system.md'], capture_output=True, text=True, check=True).stdout.strip()
    provenance = {'source_repository': CONFIG['repository'], 'source_path': 'docs/design-system.md', 'source_checkout': str(product_root),
                  'source_head': head, 'source_doc_committed': not dirty, 'copied_at': subprocess.run(['date', '+%Y-%m-%d'], capture_output=True, text=True).stdout.strip(),
                  'files': [asset_entry(q, str(q.relative_to(target))) for q in sorted(target.rglob('*')) if q.is_file() and q.name != 'source-provenance.json']}
    (target / 'source-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')


def export(target, p):
    target = target.resolve()
    prod = ROOT / 'product'
    selected = ['favicon.svg', 'favicon.ico', 'icon-src.svg', 'mark-themed.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'og.png', 'palettes.json']
    entries = []
    for name in selected:
        shutil.copyfile(prod / name, target / name)
        entries.append(asset_entry(prod / name, name))
    (target / 'brand-export.json').write_text(json.dumps({'brand': CONFIG['slug'], 'palette': p['name'], 'status': CONFIG['asset_status'],
                                                          'source': 'subcult-tv studio/brands/chatty-cat/product/', 'rule': 'Regenerate in Studio and copy; do not edit these copies.',
                                                          'assets': entries}, indent=2) + '\n')
    return entries


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--palette', default=CONFIG['default_palette'], help='palette for the main layouts and product export')
    parser.add_argument('--custom', help='ad-hoc palette "bg=#..,fg=#..,face=#..,cursor=#.." built as palette "custom" and used for the main layouts')
    parser.add_argument('--export', type=Path, help='product web/public directory to receive the selected icons and link preview')
    parser.add_argument('--product-root', type=Path, help='chatty-cat checkout; copies docs/design-system.md into design-system/ with provenance')
    args = parser.parse_args()
    raw = dict(CONFIG['palettes'])
    if args.custom:
        raw['custom'] = dict(kv.split('=', 1) for kv in args.custom.split(',')) | {'source': 'command line'}
        args.palette = 'custom'
    palettes = {n: palette(n, r) for n, r in raw.items()}
    if args.palette not in palettes:
        raise SystemExit(f'unknown palette {args.palette}; known: {", ".join(palettes)}')
    p = palettes[args.palette]
    if p['contrast']['fg'] < 4.5:
        raise SystemExit(f'palette {p["name"]}: fg on bg is {p["contrast"]["fg"]}:1; text needs 4.5:1')
    for q in palettes.values():
        if q['contrast']['face'] < 3 or q['contrast']['cursor'] < 3:
            print(f'warning: palette {q["name"]} has face {q["contrast"]["face"]}:1 or cursor {q["contrast"]["cursor"]}:1 under 3:1')
    for stale in ('logos', 'social', 'video', 'product', 'palettes', 'fonts'):
        shutil.rmtree(ROOT / stale, ignore_errors=True)
    (ROOT / 'fonts').mkdir(exist_ok=True)
    for name in FONT_FILES:
        shutil.copyfile(FONT_SOURCE / name, ROOT / 'fonts' / name)
    catalog = json.loads((FONT_SOURCE / 'sources.json').read_text())
    save('fonts/sources.json', json.dumps([r for r in catalog if r['family'] in CONFIG['fonts'].values()], indent=2) + '\n')
    save('fontconfig.xml', f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>{ROOT / "fonts"}</dir><cachedir>{ROOT / ".font-cache"}</cachedir></fontconfig>')
    build_tokens(p, palettes)
    build_palette_set(palettes)
    build_logos(p)
    build_product(p, palettes)
    build_social_and_video(p)
    build_board(p, palettes)
    if args.product_root:
        copy_design_system(args.product_root.resolve())
    register = {'owner': 'SUBCULT Studio', 'direction': CONFIG['direction'] + '; ' + CONFIG['direction_selection'],
                'mark': CONFIG['mark_status'], 'motif': CONFIG['motif'],
                'lineage': CONFIG['lineage'] + '. The original Twitch-glyph PWA icon is retired; no Twitch artwork is reused.',
                'copy': 'Headline and support lines are sample copy in the Chatty Cat voice (content/VOICE.md). Rows in the artwork are bars, not messages.',
                'fonts': 'Studio licensed font collection; OFL texts included. Cascadia Mono is bundled; Public Sans is in the Studio collection.',
                'palettes': 'phosphor and amber are the two phosphor looks; the other fourteen are the app colours at their default shades, derived from web/src/palettes.css.',
                'claims': 'content/social/Product Claims Register.md, entry C-CHAT; product README and docs/parity.md',
                'publication': CONFIG['asset_status']}
    save('source-register.json', json.dumps(register, indent=2) + '\n')
    manifest = {'brand': CONFIG['slug'], 'palette': p['name'], 'status': CONFIG['asset_status'], 'assets': []}
    for q in sorted(ROOT.rglob('*')):
        if q.is_file() and '.font-cache' not in q.parts and q.name not in ('asset-manifest.json', 'fontconfig.xml') and not q.name.endswith('.pyc'):
            manifest['assets'].append(asset_entry(q, str(q.relative_to(ROOT))))
    save('asset-manifest.json', json.dumps(manifest, indent=2) + '\n')
    exported = export(args.export, p) if args.export else []
    shutil.rmtree(ROOT / '.font-cache', ignore_errors=True)
    (ROOT / 'fontconfig.xml').unlink(missing_ok=True)
    print(f'Built Chatty Cat only ({p["name"]} palette, {len(palettes)} palettes): {len(manifest["assets"])} assets; {len(exported)} exported.')


if __name__ == '__main__':
    main()
