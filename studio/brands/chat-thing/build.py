#!/usr/bin/env python3
"""Build the Chat Thing identity (The merged log) and export the product's web assets.

Standalone generator in the Subsets pattern: it reads brand.json, writes editable SVG
masters, tokens, guide-adjacent records and a hash-bound manifest, and renders PNGs.
Rendering needs rsvg-convert, inkscape (text to path) and fontconfig with only the
bundled fonts. Run from anywhere:

    python3 build.py                      # rebuild this pack only
    python3 build.py --export /path/to/chatty-cat/web/public
    python3 build.py --product-root /path/to/chatty-cat   # refresh design-system/ copy

The mark, layouts and sample copy are original. Message rows in the artwork are bars,
not words, so no layout shows a real or invented chat message.
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
FONT_FILES = ['Atkinson-Hyperlegible-Mono-0.ttf', 'Atkinson-Hyperlegible-Mono-1.ttf',
              'AtkinsonHyperlegibleNext-Regular.otf', 'AtkinsonHyperlegibleNext-Bold.otf',
              'atkinsonhyperlegiblemono-OFL.txt', 'atkinsonhyperlegiblenext-OFL.txt']
CONFIG = json.loads((ROOT / 'brand.json').read_text())
C = CONFIG['colors']
L = CONFIG['light']
MONO = CONFIG['fonts']['label']
SANS = CONFIG['fonts']['display']
ENV = os.environ | {'FONTCONFIG_FILE': str(ROOT / 'fontconfig.xml')}
TAG = 'SELF-HOSTED TWITCH CHAT / BY SUBCULT'
SAMPLE = 'SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION'


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


def luminance(color):
    v = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return round((y + .05) / (x + .05), 2)


# --- mark -------------------------------------------------------------------
# Original geometry on a 24-unit grid: a rounded tile holding three message rows.
# Each row is a name block followed by a text bar; the last row ends in the live block.
ROWS = [(5.0, 4.0, 10.5), (10.5, 6.0, 8.5), (16.0, 3.0, 5.5)]


def mark(tile=C['background'], text=C['text'], name=C['accent'], live=C['secondary'], x=0, y=0, size=24, tile_fill=True):
    s = size / 24
    parts = [f'<g transform="translate({x} {y}) scale({s:.6f})">']
    if tile_fill and tile:
        parts.append(f'<rect width="24" height="24" rx="5" fill="{tile}"/>')
    for row_y, name_w, text_w in ROWS:
        parts.append(f'<rect x="4" y="{row_y}" width="{name_w}" height="3" rx=".75" fill="{name}"/>')
        parts.append(f'<rect x="{4 + name_w + 1.5}" y="{row_y}" width="{text_w}" height="3" rx=".75" fill="{text}"/>')
    parts.append(f'<rect x="15.5" y="16" width="4.5" height="3" rx=".75" fill="{live}"/>')
    parts.append('</g>')
    return ''.join(parts)


def wordmark(x, baseline, size, color):
    return (f'<text x="{x}" y="{baseline}" font-family="{MONO}" font-weight="700" font-size="{size}" '
            f'letter-spacing="{-size * .02:.2f}" fill="{color}">Chat Thing</text>')


def text(x, y, s, size, color, font=SANS, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing}"' if spacing else ''
    return f'<text x="{x}" y="{y}" font-family="{font}" font-weight="{weight}" font-size="{size}" fill="{color}" text-anchor="{anchor}"{sp}>{s}</text>'


# --- the merged-log motif --------------------------------------------------
NAME_COLORS = [C['accent'], C['good'], C['wiki'], C['vip'], C['accent'], C['secondary']]
PATTERN = [(3, 16, 11), (5, 11, 7), (2, 18, 0), (4, 9, 13), (6, 14, 5), (3, 7, 0), (5, 17, 9), (2, 12, 6)]


def log_block(x, y, width, rows, row_h=22, text_color=None, dim=None, scale=1.0, live=True):
    """Rows of timestamp, coloured name block and text bars. Bars, not words."""
    text_color = text_color or C['text']
    dim = dim or C['muted']
    out = []
    unit = width / 40
    for i in range(rows):
        name_u, text_u, extra_u = PATTERN[i % len(PATTERN)]
        ry = y + i * row_h
        h = row_h * .42
        out.append(f'<rect x="{x}" y="{ry:.1f}" width="{unit * 3:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{dim}" opacity=".55"/>')
        nx = x + unit * 4
        out.append(f'<rect x="{nx:.1f}" y="{ry:.1f}" width="{unit * name_u:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{NAME_COLORS[i % len(NAME_COLORS)]}"/>')
        tx = nx + unit * (name_u + 1)
        out.append(f'<rect x="{tx:.1f}" y="{ry:.1f}" width="{unit * text_u:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{text_color}" opacity=".82"/>')
        if extra_u:
            ex = tx + unit * (text_u + 1)
            out.append(f'<rect x="{ex:.1f}" y="{ry:.1f}" width="{unit * extra_u:.1f}" height="{h:.1f}" rx="{h / 2:.1f}" fill="{text_color}" opacity=".5"/>')
    if live:
        ly = y + (rows - 1) * row_h
        lx = x + width - unit * 2.5
        out.append(f'<rect x="{lx:.1f}" y="{ly:.1f}" width="{unit * 2.5:.1f}" height="{row_h * .42:.1f}" rx="2" fill="{C["secondary"]}"/>')
    return ''.join(out)


def sparkline(x, y, width, height, color=None, stroke=3):
    """The header rate graph: a message-rate polyline with the live end marked."""
    color = color or C['secondary']
    values = [.2, .35, .3, .5, .42, .7, .55, .62, .9, .7, .78, .6, .85, 1.0, .74]
    step = width / (len(values) - 1)
    pts = ' '.join(f'{x + i * step:.1f},{y + height - v * height:.1f}' for i, v in enumerate(values))
    last = f'{x + width:.1f},{y + height - values[-1] * height:.1f}'.split(',')
    area = f'<polygon points="{x},{y + height} {pts} {x + width},{y + height}" fill="{color}" opacity=".12"/>'
    return (area + f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linejoin="round" stroke-linecap="round"/>'
            f'<circle cx="{last[0]}" cy="{last[1]}" r="{stroke * 2}" fill="{color}"/>')


def channel_chips(x, y, labels, size=18, color=None, ink=None):
    color = color or C['line']
    ink = ink or C['text']
    out = []
    for label in labels:
        w = size * .62 * len(label) + size * 1.2
        out.append(f'<rect x="{x}" y="{y}" width="{w:.1f}" height="{size * 1.7:.1f}" rx="4" fill="{color}"/>')
        out.append(text(x + size * .6, y + size * 1.2, label, size, ink, MONO))
        x += w + size * .6
    return ''.join(out)


def header_strip(x, y, width, ink=None, panel=None):
    """A compact version of the product header: wordmark, six channel chips, status and rate."""
    ink = ink or C['text']
    panel = panel or C['surface']
    out = [f'<rect x="{x}" y="{y}" width="{width}" height="64" rx="6" fill="{panel}"/>']
    out.append(mark(x=x + 14, y=y + 14, size=36))
    out.append(text(x + 62, y + 41, 'Chat Thing', 24, C['accent'], MONO, 700))
    out.append(channel_chips(x + 220, y + 17, ['room 1', 'room 2', 'room 3', 'room 4', 'room 5', 'room 6'], 13, C['line'], ink))
    out.append(f'<circle cx="{x + width - 190}" cy="{y + 32}" r="5" fill="{C["good"]}"/>')
    out.append(text(x + width - 178, y + 37, 'connected', 14, C['muted'], MONO))
    out.append(sparkline(x + width - 84, y + 18, 66, 28, C['accent'], 2))
    return ''.join(out)


def footer(width, height, ink=None):
    ink = ink or C['muted']
    return (f'<path d="M64 {height - 86}H{width - 64}" stroke="{C["line"]}" stroke-width="2"/>'
            + text(64, height - 44, 'CHAT.SUBCULT.TV', 18, ink, MONO) + text(width - 64, height - 44, TAG, 18, ink, MONO, anchor='end'))


def canvas(width, height, color=None):
    return f'<rect width="{width}" height="{height}" fill="{color or C["background"]}"/>'


def layout(name, width, height, headline, support=None, sample=True, rows=None):
    """Shared poster: header strip, headline, support line, merged log and footer."""
    m = 64
    top = 300 if 'story' in name else int(height * .13)
    parts = [canvas(width, height), header_strip(m, top - 120 if 'story' in name else 56, width - 2 * m)]
    size = min(84, width / 14)
    y = top + 90 if 'story' in name else top + 110
    for i, line in enumerate(headline):
        parts.append(text(m, y + i * size * 1.12, line, size, C['text'], SANS, 700))
    y += len(headline) * size * 1.12
    if support:
        parts.append(text(m, y + 8, support, size * .38, C['muted'], SANS))
        y += size * .7
    rows = rows or (12 if 'story' in name else 6)
    log_w = width - 2 * m
    parts.append(f'<rect x="{m}" y="{y + 20}" width="{log_w}" height="{rows * 26 + 32}" rx="6" fill="{C["surface"]}"/>')
    parts.append(log_block(m + 20, y + 40, log_w - 40, rows, 26))
    parts.append(sparkline(m, height - 160 if 'story' not in name else height - 300, log_w, 56))
    if sample:
        parts.append(text(m, height - 108, SAMPLE, 16, C['muted'], MONO))
    parts.append(footer(width, height))
    return svg(width, height, ''.join(parts), f'Chat Thing {name}')


def write_svg_png(name, width, height, body, label, export_w=None, outlined=False):
    source = save(name + '.svg', svg(width, height, body, label))
    png(source, ROOT / (name + '.png'), export_w or width)
    if outlined:
        outline(source, ROOT / (name + '-outlined.svg'))


def ico(pngs):
    """Pack PNG byte strings into one .ico (PNG-compressed entries)."""
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


def build_tokens():
    product = {
        'default_screen': {'colour': 'gray', 'shade': 7, 'variant': 'standard', 'font': 'sans', 'size_px': 14, 'line_height': 1.3,
                           'canvas_oklch': 'oklch(.25 .016 255)', 'canvas_hex_approx': C['surface'], 'text_oklch': 'oklch(.95 .015 255)',
                           'accent': C['accent'], 'good': C['good'], 'danger': C['danger'], 'vip': C['vip'], 'wiki': C['wiki'], 'spark': C['secondary']},
        'shell': {'background': C['background'], 'panel': '#1d1d24', 'text': C['text'], 'muted': C['muted'], 'line': C['line'],
                  'manifest_theme_color': C['background'], 'note': 'web/src/style.css :root before a palette is applied; also the PWA manifest colours'},
        'light_shell': {'background': L['background'], 'panel': L['surface'], 'text': L['text'], 'muted': L['muted'], 'line': L['line'], 'accent': '#654394',
                        'note': 'web/src/style.css :root[data-theme=light]; the cream palette at shade 1 is the light chat default'},
        'axes': {'colours': ['violet', 'gray', 'red', 'wine', 'green', 'ember', 'solarized', 'nord', 'lavender', 'sepia', 'salmon', 'ice', 'cream', 'mirc'],
                 'shades': ['white', 'lightest', 'light', 'pale', 'mid', 'dim', 'dusk', 'dark', 'deep', 'black', 'murk', 'twilight'],
                 'variants': ['standard', 'phosphor', 'grain', 'contrast'],
                 'derived_tokens': ['--bg', '--text', '--panel', '--line', '--text-dim', '--aux', '--popline', '--texture'],
                 'semantic_tokens': ['--accent', '--good', '--danger', '--vip', '--wiki', '--spark']},
        'shape': {'control_radius_px': 4, 'panel_radius_px': 6, 'gutter_px': 20, 'gutter_narrow_px': 12, 'row_padding_px': 5, 'border': '1px solid var(--line)'},
        'focus': '2px solid var(--accent), 2px offset',
        'type': {'chat_default': 'ui-sans-serif system stack at 14px/1.3, user-selectable from 29 stacks, 7 to 32px',
                 'chrome_labels': 'inherits the chat font; 11 to 12px for metadata and status',
                 'brand_faces_scope': 'wordmark, icons, marketing and documentation only; the chat log keeps the user font menu'},
        'source': 'chatty-cat web/src/style.css, palettes.css, display-data.ts and display.ts, read October 11, 2026',
        'rules_document': 'docs/design-system.md in the product repository',
    }
    tokens = {'brand': CONFIG['name'], 'slug': CONFIG['slug'], 'direction': CONFIG['direction'], 'status': CONFIG['asset_status'],
              'direction_selection': CONFIG['direction_selection'], 'lineage': CONFIG['lineage'], 'repository': CONFIG['repository'],
              'colors': C, 'light': L, 'fonts': CONFIG['fonts'], 'spacing': [4, 8, 12, 16, 20, 24, 32, 48, 64, 96],
              'radii': {'control': 4, 'panel': 6, 'tile': '5/24 of the mark width'},
              'mark_clear_space': '25% of mark height', 'mark_min_width_px': 24, 'lockup_min_width_px': 180,
              'contrast': {'text_on_background': contrast(C['text'], C['background']), 'accent_on_background': contrast(C['accent'], C['background']),
                           'secondary_on_background': contrast(C['secondary'], C['background']), 'muted_on_background': contrast(C['muted'], C['background']),
                           'text_on_surface': contrast(C['text'], C['surface']), 'accent_on_surface': contrast(C['accent'], C['surface']),
                           'light_text_on_background': contrast(L['text'], L['background']), 'light_accent_on_background': contrast(L['accent'], L['background']),
                           'light_secondary_on_background': contrast(L['secondary'], L['background'])},
              'product_interface': product}
    save('tokens.json', json.dumps(tokens, indent=2) + '\n')
    css = ':root {\n' + ''.join(f'  --brand-{k}: {v};\n' for k, v in C.items())
    css += ''.join(f'  --font-{k}: "{v}";\n' for k, v in CONFIG['fonts'].items()) + '}\n'
    css += ':root[data-theme=light] {\n' + ''.join(f'  --brand-{k}: {v};\n' for k, v in L.items()) + '}\n'
    save('tokens.css', css)
    return tokens


def build_logos():
    variants = {
        'primary': dict(tile=C['background'], text=C['text'], name=C['accent'], live=C['secondary'], ink=C['text']),
        'dark': dict(tile='#000000', text=C['text'], name=C['accent'], live=C['secondary'], ink=C['text']),
        'light': dict(tile=L['text'], text=L['background'], name=C['accent'], live=C['secondary'], ink=L['text']),
        'mono-dark': dict(tile=None, text='#ffffff', name='#ffffff', live='#ffffff', ink='#ffffff'),
        'mono-light': dict(tile=None, text=L['text'], name=L['text'], live=L['text'], ink=L['text']),
    }
    for variant, v in variants.items():
        m = mark(v['tile'], v['text'], v['name'], v['live'], x=16, y=16, size=96, tile_fill=v['tile'] is not None)
        write_svg_png(f'logos/mark-{variant}', 128, 128, m, f'Chat Thing mark, {variant}', 512)
        lock = mark(v['tile'], v['text'], v['name'], v['live'], x=16, y=16, size=96, tile_fill=v['tile'] is not None) + wordmark(136, 94, 72, v['ink'])
        write_svg_png(f'logos/lockup-{variant}', 600, 128, lock, f'Chat Thing lockup, {variant}', 1200, outlined=True)
    # The tile-less glyph for contexts that supply their own ground.
    save('logos/mark-glyph.svg', svg(24, 24, mark(None, C['text'], C['accent'], C['secondary'], tile_fill=False), 'Chat Thing mark glyph'))


def build_product():
    prod = ROOT / 'product'
    prod.mkdir(exist_ok=True)
    favicon = svg(24, 24, mark(), 'Chat Thing')
    (prod / 'favicon.svg').write_text(favicon)
    ET.parse(prod / 'favicon.svg')
    (prod / 'icon-src.svg').write_text(favicon)
    for size in (16, 32, 48, 180, 192, 512):
        png(prod / 'favicon.svg', prod / f'icon-{size}.png', size)
    (prod / 'apple-touch-icon.png').write_bytes((prod / 'icon-180.png').read_bytes())
    (prod / 'icon-180.png').unlink()
    # Maskable: the tile fills the canvas and the rows stay inside the central safe circle.
    maskable = f'<rect width="24" height="24" fill="{C["background"]}"/>' + mark(None, x=3.6, y=3.6, size=16.8, tile_fill=False)
    save('product/icon-maskable.svg', svg(24, 24, maskable, 'Chat Thing maskable icon'))
    png(prod / 'icon-maskable.svg', prod / 'icon-maskable-512.png', 512)
    (prod / 'favicon.ico').write_bytes(ico([(16, (prod / 'icon-16.png').read_bytes()), (32, (prod / 'icon-32.png').read_bytes()), (48, (prod / 'icon-48.png').read_bytes())]))
    for size in (16, 32, 48):
        (prod / f'icon-{size}.png').unlink()
    # Open Graph image: lockup, one line, the log, no release claim.
    og = canvas(1200, 630) + mark(x=72, y=64, size=88) + text(184, 128, 'Chat Thing', 64, C['accent'], MONO, 700)
    og += text(72, 262, CONFIG['tagline'], 58, C['text'], SANS, 700)
    og += text(72, 316, 'Self-hosted Twitch chat client. Six merged channels, your display settings.', 24, C['muted'], SANS)
    og += f'<rect x="72" y="356" width="1056" height="170" rx="6" fill="{C["surface"]}"/>' + log_block(92, 376, 1016, 5, 28)
    og += text(72, 586, 'CHAT.SUBCULT.TV', 20, C['muted'], MONO) + text(1128, 586, TAG, 20, C['muted'], MONO, anchor='end')
    write_svg_png('product/og', 1200, 630, og, 'Chat Thing link preview')


def build_social_and_video():
    # 1500x500 banner: lockup left, headline right of centre, sparkline along the bottom.
    banner = canvas(1500, 500) + mark(x=72, y=80, size=120) + text(216, 170, 'Chat Thing', 84, C['accent'], MONO, 700)
    banner += text(72, 290, CONFIG['tagline'], 62, C['text'], SANS, 700) + text(72, 340, 'Self-hosted Twitch chat, with your display settings.', 26, C['muted'], SANS)
    banner += f'<rect x="900" y="64" width="528" height="300" rx="6" fill="{C["surface"]}"/>' + log_block(920, 86, 488, 10, 27)
    banner += sparkline(72, 400, 1356, 50) + text(1428, 476, TAG, 18, C['muted'], MONO, anchor='end')
    write_svg_png('social/banner-x-bluesky', 1500, 500, banner, 'Chat Thing banner')
    tall = canvas(1500, 600) + f'<g transform="translate(0 50)">{banner}</g>'
    write_svg_png('social/banner-tall-master', 1500, 600, tall, 'Chat Thing banner, taller master')
    avatar = canvas(512, 512) + mark(x=64, y=64, size=384)
    write_svg_png('social/avatar', 512, 512, avatar, 'Chat Thing avatar')
    save('social/square-post.svg', layout('square post', 1080, 1080, ['All six channels', 'in one scrollback.'], 'Self-hosted Twitch chat, with your display settings.'))
    save('social/landscape-template.svg', layout('landscape template', 1600, 900, ['All six channels in one scrollback.'], 'YOUR APPROVED CAPTION'))
    save('social/story-template.svg', layout('story template', 1080, 1920, ['All six', 'channels in', 'one scrollback.'], 'Replace this line with approved copy.'))
    quote = canvas(1080, 1080) + header_strip(64, 56, 952) + text(64, 300, '“', 150, C['accent'], SANS, 700)
    quote += text(64, 420, 'Add the exact quote.', 64, C['text'], SANS, 700) + text(64, 500, 'Keep its context.', 64, C['text'], SANS, 700)
    quote += f'<path d="M64 580H1016" stroke="{C["accent"]}" stroke-width="5"/>' + text(64, 650, 'SOURCE / SPEAKER / DATE', 24, C['muted'], MONO) + text(64, 700, 'ORIGINAL URL / TIMESTAMP', 22, C['muted'], MONO)
    quote += text(64, 972, SAMPLE, 16, C['muted'], MONO) + footer(1080, 1080)
    save('social/quote-template.svg', svg(1080, 1080, quote, 'Chat Thing quote template'))
    release = canvas(1080, 1080) + header_strip(64, 56, 952) + text(64, 300, 'What changed', 78, C['text'], SANS, 700)
    for i, line in enumerate(['01 / A verified change', '02 / A useful consequence', '03 / A direct destination']):
        release += text(64, 400 + i * 80, line, 32, C['text'], SANS)
    release += f'<rect x="64" y="680" width="952" height="190" rx="6" fill="{C["surface"]}"/>' + log_block(84, 700, 912, 6, 28)
    release += text(64, 972, SAMPLE, 16, C['muted'], MONO) + footer(1080, 1080)
    save('social/release-template.svg', svg(1080, 1080, release, 'Chat Thing release template'))
    frame = canvas(1600, 1000) + header_strip(64, 56, 1472)
    frame += f'<rect x="64" y="160" width="1472" height="680" rx="6" fill="none" stroke="{C["accent"]}" stroke-width="3"/>'
    frame += text(84, 520, 'Place a verified screenshot here. Crop credentials, private panes and personal data.', 28, C['muted'], SANS)
    frame += text(64, 892, SAMPLE, 16, C['muted'], MONO) + footer(1600, 1000)
    save('social/screenshot-frame.svg', svg(1600, 1000, frame, 'Chat Thing screenshot frame'))
    for name in ['square-post', 'landscape-template', 'story-template', 'quote-template', 'release-template', 'screenshot-frame']:
        w = ET.parse(ROOT / f'social/{name}.svg').getroot().attrib['width']
        png(ROOT / f'social/{name}.svg', ROOT / f'social/{name}.png', int(float(w)))
    # Video: 1920x1080 with a 96px outer margin.
    title = canvas(1920, 1080) + mark(x=96, y=96, size=120) + text(240, 186, 'Chat Thing', 84, C['accent'], MONO, 700)
    title += text(96, 480, 'All six channels', 112, C['text'], SANS, 700) + text(96, 606, 'in one scrollback.', 112, C['text'], SANS, 700)
    title += sparkline(96, 820, 1728, 90) + text(96, 984, SAMPLE, 18, C['muted'], MONO) + text(1824, 984, TAG, 18, C['muted'], MONO, anchor='end')
    write_svg_png('video/title-card', 1920, 1080, title, 'Chat Thing title card')
    thumb = canvas(1920, 1080) + f'<rect x="96" y="96" width="1040" height="888" rx="8" fill="{C["surface"]}"/>' + log_block(128, 136, 976, 28, 30)
    thumb += mark(x=1232, y=120, size=96) + text(1352, 190, 'Chat Thing', 64, C['accent'], MONO, 700)
    thumb += text(1232, 420, 'Six channels.', 100, C['text'], SANS, 700) + text(1232, 540, 'One log.', 100, C['text'], SANS, 700)
    thumb += text(1232, 984, SAMPLE, 18, C['muted'], MONO)
    write_svg_png('video/thumbnail', 1920, 1080, thumb, 'Chat Thing thumbnail')
    end = canvas(1920, 1080) + mark(x=840, y=300, size=240) + text(960, 650, 'Chat Thing', 96, C['accent'], MONO, 700, anchor='middle')
    end += text(960, 730, 'chat.subcult.tv', 40, C['text'], MONO, anchor='middle') + text(960, 984, TAG, 18, C['muted'], MONO, anchor='middle')
    write_svg_png('video/end-card', 1920, 1080, end, 'Chat Thing end card')
    lower = f'<rect x="96" y="840" width="760" height="144" rx="6" fill="{C["background"]}" opacity=".96"/><rect x="96" y="840" width="10" height="144" rx="3" fill="{C["accent"]}"/>'
    lower += mark(x=130, y=868, size=88) + text(240, 905, 'TITLE / SPEAKER', 40, C['text'], SANS, 700) + text(240, 955, 'A short line of context.', 28, C['muted'], SANS)
    write_svg_png('video/lower-third', 1920, 1080, lower, 'Chat Thing lower third')
    save('video/captions.ass', '[Script Info]\nTitle: Chat Thing captions\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n'
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
         f'Style: Default,{SANS},48,&H00E3E6E8,&H00E3E6E8,&H00191515,&HBE191515,0,0,0,0,100,100,0,0,3,2,0,2,120,120,90,1\n\n[Events]\n'
         'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Replace with the actual spoken words.\n')


def build_board():
    board = canvas(1440, 960) + text(64, 58, 'CHAT THING / THE MERGED LOG / PROPOSED IDENTITY', 16, C['muted'], MONO) + f'<path d="M64 88H1376" stroke="{C["line"]}"/>'
    board += mark(x=64, y=140, size=160) + text(256, 262, 'Chat Thing', 124, C['accent'], MONO, 700) + text(262, 306, 'by SUBCULT · chat.subcult.tv', 18, C['muted'], MONO)
    swatches = [('SHELL', C['background']), ('LOG', C['surface']), ('TEXT', C['text']), ('AMBER', C['accent']), ('SPARK', C['secondary']), ('MUTED', C['muted'])]
    for i, (name, color) in enumerate(swatches):
        x = 64 + i * 222
        board += f'<rect x="{x}" y="378" width="200" height="96" rx="4" fill="{color}" stroke="{C["line"]}"/>' + text(x, 506, f'{name} / {color.upper()}', 15, C['text'], MONO)
    board += text(64, 620, CONFIG['tagline'], 60, C['text'], SANS, 700) + text(64, 668, 'Self-hosted Twitch chat client. Six merged channels, your display settings.', 22, C['muted'], SANS)
    board += text(64, 724, 'ATKINSON HYPERLEGIBLE NEXT / ATKINSON HYPERLEGIBLE MONO', 16, C['muted'], MONO)
    board += f'<rect x="64" y="760" width="1312" height="150" rx="6" fill="{C["surface"]}"/>' + log_block(84, 780, 1272, 4, 30)
    board += text(64, 940, 'ORIGINAL VECTOR MARK / LICENSED FONTS / BARS NOT WORDS / SUBCULT STUDIO', 12, C['muted'], MONO)
    write_svg_png('brand-board', 1440, 960, board, 'Chat Thing brand board')
    shutil.copyfile(ROOT / 'brand-board.svg', ROOT / 'pack-preview.svg')
    shutil.copyfile(ROOT / 'brand-board.png', ROOT / 'pack-preview.png')


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
                  'files': [asset_entry(p, str(p.relative_to(target))) for p in sorted(target.rglob('*')) if p.is_file() and p.name != 'source-provenance.json']}
    (target / 'source-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')


def export(target):
    target = target.resolve()
    prod = ROOT / 'product'
    selected = ['favicon.svg', 'favicon.ico', 'icon-src.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'og.png']
    entries = []
    for name in selected:
        shutil.copyfile(prod / name, target / name)
        entries.append(asset_entry(prod / name, name))
    (target / 'brand-export.json').write_text(json.dumps({'brand': CONFIG['slug'], 'status': CONFIG['asset_status'], 'source': 'subcult-tv studio/brands/chat-thing/product/',
                                                          'rule': 'Regenerate in Studio and copy; do not edit these copies.', 'assets': entries}, indent=2) + '\n')
    return entries


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--export', type=Path, help='product web/public directory to receive the selected icons and link preview')
    parser.add_argument('--product-root', type=Path, help='chatty-cat checkout; copies docs/design-system.md into design-system/ with provenance')
    args = parser.parse_args()
    (ROOT / 'fonts').mkdir(exist_ok=True)
    for name in FONT_FILES:
        shutil.copyfile(FONT_SOURCE / name, ROOT / 'fonts' / name)
    catalog = json.loads((FONT_SOURCE / 'sources.json').read_text())
    save('fonts/sources.json', json.dumps([r for r in catalog if r['family'] in CONFIG['fonts'].values()], indent=2) + '\n')
    save('fontconfig.xml', f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>{ROOT / "fonts"}</dir><cachedir>{ROOT / ".font-cache"}</cachedir></fontconfig>')
    for check, (a, b) in {'text on background': (C['text'], C['background']), 'accent on background': (C['accent'], C['background']),
                          'secondary on background': (C['secondary'], C['background']), 'light text on background': (L['text'], L['background'])}.items():
        if contrast(a, b) < 4.5:
            raise SystemExit(f'{check} is {contrast(a, b)}:1; ordinary text needs 4.5:1')
    build_tokens()
    build_logos()
    build_product()
    build_social_and_video()
    build_board()
    if args.product_root:
        copy_design_system(args.product_root.resolve())
    register = {'owner': 'SUBCULT Studio', 'direction': CONFIG['direction'] + '; ' + CONFIG['direction_selection'],
                'mark': CONFIG['mark_status'], 'motif': CONFIG['motif'],
                'lineage': CONFIG['lineage'] + '. The original Twitch-glyph PWA icon is retired; no Twitch artwork is reused.',
                'copy': 'Headline and support lines are sample copy in the Chat Thing voice (content/VOICE.md). Rows in the artwork are bars, not messages.',
                'fonts': 'Studio licensed font collection; OFL texts included. Both families are already in the product font menu.',
                'claims': 'content/social/Product Claims Register.md, entry C-CHAT; product README and docs/parity.md',
                'publication': CONFIG['asset_status']}
    save('source-register.json', json.dumps(register, indent=2) + '\n')
    manifest = {'brand': CONFIG['slug'], 'status': CONFIG['asset_status'], 'assets': []}
    for p in sorted(ROOT.rglob('*')):
        if p.is_file() and '.font-cache' not in p.parts and p.name not in ('asset-manifest.json', 'fontconfig.xml') and not p.name.endswith('.pyc'):
            manifest['assets'].append(asset_entry(p, str(p.relative_to(ROOT))))
    save('asset-manifest.json', json.dumps(manifest, indent=2) + '\n')
    exported = export(args.export) if args.export else []
    shutil.rmtree(ROOT / '.font-cache', ignore_errors=True)
    (ROOT / 'fontconfig.xml').unlink(missing_ok=True)
    print(f'Built Chat Thing only: {len(manifest["assets"])} assets; {len(exported)} exported.')


if __name__ == '__main__':
    main()
