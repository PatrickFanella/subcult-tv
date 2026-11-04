#!/usr/bin/env python3
"""Build the patstack identity: the A1 Rack system with A3 Registration's plates.

Standalone generator in the Subsets and Chatty Cat pattern. Everything editable is in
brand.json: colors, fonts, the fleet rows, the state table and the copy. Needs
rsvg-convert, Inkscape and fontconfig with the bundled fonts.

    python3 build.py                                  # rebuild the pack
    python3 build.py --export /path/to/patstack/brand  # copy the handoff selection with hashes

Host rows are the fleet as recorded on 2026-10-19; they are not a live readout. Template
layouts carry a visible sample marker and are not approved posts.
"""
import argparse
import hashlib
import html
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
FONT_FILES = ['Oswald-0.ttf', 'Oswald-1.ttf', 'oswald-OFL.txt',
              'Space-Grotesk-0.ttf', 'Space-Grotesk-1.ttf', 'spacegrotesk-OFL.txt',
              'JetBrains-Mono-0.ttf', 'JetBrains-Mono-1.ttf', 'jetbrainsmono-OFL.txt']
CONFIG = json.loads((ROOT / 'brand.json').read_text())
C = CONFIG['colors']
F = CONFIG['fonts']
DISPLAY, BODY, LABEL = F['display'], F['body'], F['label']
ENV = os.environ | {'FONTCONFIG_FILE': str(ROOT / 'fontconfig.xml')}
WORD = CONFIG['wordmark']
TAG = CONFIG['tag']
HEADLINE = CONFIG['headline']
URL = CONFIG['website']
SAMPLE = 'SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION'
STATE_COLOR = {'active': C['accent'], 'warning': C['warning'], 'veto': C['critical'], 'archive': C['archive']}
STATE_LABEL = {k: v[0] for k, v in CONFIG['states'].items()}


# --- colour helpers ----------------------------------------------------------
def luminance(color):
    v = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return round((y + .05) / (x + .05), 2)


# --- file helpers ------------------------------------------------------------
def save(name, content):
    file = ROOT / name
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content)
    if file.suffix == '.svg':
        ET.parse(file)
    return file


def svg(width, height, content, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-label="{html.escape(label, quote=True)}">'
            f'<title>{html.escape(label)}</title>{content}</svg>\n')


def png(source, target, width):
    subprocess.run(['rsvg-convert', '-w', str(width), '-o', str(target), str(source)], check=True, env=ENV)


def outline(source, target):
    result = subprocess.run(['inkscape', str(source), '--export-text-to-path', '--export-plain-svg',
                             f'--export-filename={target}'], env=ENV, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr[-600:])
    ET.parse(target)


def write(name, width, height, body, label, outlined=False):
    source = save(name + '.svg', svg(width, height, body, label))
    png(source, ROOT / (name + '.png'), width)
    if outlined:
        outline(source, ROOT / (name + '-outlined.svg'))


# --- svg primitives ----------------------------------------------------------
def rect(x, y, w, h, fill, stroke=None, sw=0, op=None, extra=''):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    o = f' opacity="{op}"' if op is not None else ''
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{fill}"{s}{o}{extra}/>'


def text(x, y, s, size, color, font=BODY, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing}"' if spacing else ''
    return (f'<text x="{x:g}" y="{y:g}" font-family="{html.escape(font, quote=True)}" font-weight="{weight}" '
            f'font-size="{size:g}" fill="{color}" text-anchor="{anchor}"{sp}>{html.escape(s)}</text>')


def display(x, y, s, size, color=None, spacing=None):
    return text(x, y, s, size, color or C['text'], DISPLAY, 700, spacing=spacing if spacing is not None else round(size * .01, 2))


def label(x, y, s, size, color=None, spacing=None, anchor='start'):
    return text(x, y, s, size, color or C['muted'], LABEL, 400, anchor, spacing if spacing is not None else round(size * .1, 2))


def crosshair(x, y, size, color, sw=2):
    r = size / 2
    return (f'<g fill="none" stroke="{color}" stroke-width="{sw}">'
            f'<line x1="{x + r:g}" y1="{y:g}" x2="{x + r:g}" y2="{y + size:g}"/>'
            f'<line x1="{x:g}" y1="{y + r:g}" x2="{x + size:g}" y2="{y + r:g}"/>'
            f'<circle cx="{x + r:g}" cy="{y + r:g}" r="{r * .46:g}"/></g>')


# --- the mark ----------------------------------------------------------------
def mark(x=0, y=0, size=72, unit=None, lamp=None, block=None, block_stroke=None):
    """Three rack units with one lit lamp in front of a tilted block, on a 72-unit canvas.

    Unlit lamps are gaps in the unit bar, so the mark reads on any ground. In
    monochrome, pass block=None and block_stroke=<color> to outline the block.
    """
    unit = unit or C['text']
    lamp = lamp or C['accent']
    out = []
    if block:
        out.append(rect(14, 10, 50, 52, block, extra=' transform="rotate(-3.6 39 36)"'))
    elif block_stroke:
        out.append(rect(15.5, 11.5, 47, 49, 'none', block_stroke, 3, extra=' transform="rotate(-3.6 39 36)"'))
    for i, top in enumerate((18, 32, 46)):
        out.append(rect(6, top, 40, 11, unit))
        out.append(rect(51, top, 3, 11, unit))
        if i == 0:
            out.append(rect(46, top + 3, 5, 5, lamp))
    s = size / 72
    return f'<g transform="translate({x:g} {y:g}) scale({s:.6f})">{"".join(out)}</g>'


def mark_variant(variant):
    """Color roles for the four logo variants."""
    if variant == 'primary':
        return dict(unit=C['text'], lamp=C['accent'], block=C['identity'])
    if variant == 'light':
        return dict(unit=C['background'], lamp=C['accent'], block=C['identity'])
    if variant == 'mono-dark':
        return dict(unit=C['text'], lamp=C['text'], block=None, block_stroke=C['text'])
    if variant == 'mono-light':
        return dict(unit=C['background'], lamp=C['background'], block=None, block_stroke=C['background'])
    raise ValueError(variant)


def lockup(x, y, mark_size, variant='primary', tag=True):
    """Mark, wordmark and the tag line, scaled from the mark size."""
    v = mark_variant(variant)
    ink = v['unit']
    tag_color = C['accent'] if variant == 'primary' else (C['muted'] if variant == 'light' else ink)
    word_size = mark_size * .82
    out = [mark(x, y, mark_size, **v),
           display(x + mark_size * 1.22, y + mark_size * .72, WORD, word_size, ink, spacing=round(word_size * .04, 2))]
    if tag:
        out.append(label(x + mark_size * 1.24, y + mark_size * .97, TAG, mark_size * .17, tag_color))
    return ''.join(out)


# --- motifs ------------------------------------------------------------------
def rack(x, y, w, rows, row_h=56, header=True, footnote=None, name_size=22):
    """Rack units: ears, slot number, host name, role, lamp and state label."""
    out = []
    top = y
    if header:
        out.append(rect(x, top, w, 36, C['surface'], C['line'], 1))
        out.append(label(x + 14, top + 23, 'FLEET · 6 HOSTS', 11, C['text']))
        out.append(label(x + w - 14, top + 23, 'LAST RECORDED VERIFY · 2026-10-19', 11, C['muted'], anchor='end'))
        top += 36
    body = len(rows) * row_h
    out.append(rect(x, top, w, body, C['surface'], C['line'], 1))
    show_role = w >= 480
    for i, (slot, name, role, state) in enumerate(rows):
        ry = top + i * row_h
        if i:
            out.append(rect(x, ry, w, 1, C['line']))
        out.append(rect(x + 12, ry + row_h * .36, 6, 6, C['background']))
        out.append(rect(x + 12, ry + row_h * .54, 6, 6, C['background']))
        out.append(label(x + 30, ry + row_h * .62, slot, 12, C['muted']))
        out.append(display(x + 62, ry + row_h * .66, name.upper(), name_size, C['text'], spacing=round(name_size * .03, 2)))
        if show_role:
            out.append(text(x + 62 + name_size * 4.6, ry + row_h * .63, role, 13, C['muted']))
        color = STATE_COLOR[state]
        out.append(rect(x + w - 150, ry + row_h * .5 - 4, 8, 8, color))
        out.append(label(x + w - 134, ry + row_h * .62, STATE_LABEL[state], 12, color, spacing=.7))
    if footnote:
        out.append(label(x, top + body + 18, footnote, 11, C['muted']))
    return ''.join(out)


def plates(x, y, w, h, offset=16, on_paper=False, labels=True, crosshair_color=None):
    """Three plates offset like a misregistered print: installed tree, plan, source tree."""
    front_fill = C['text']
    out = [rect(x + offset * 2, y + offset * 2, w, h, C['line']),
           rect(x + offset, y + offset, w, h, C['accent']),
           rect(x, y, w, h, front_fill, C['background'] if on_paper else None, 2 if on_paper else 0)]
    if labels:
        size = max(10, min(12, w / 26))
        out.append(label(x + offset * 2 + 12, y + offset * 2 + h - 10, 'INSTALLED TREE', size, C['text']))
        out.append(label(x + offset + 12, y + offset + h - 10, 'PLAN · EXPECTED = DESIRED', size, C['background']))
        out.append(label(x + 12, y + h - 10, 'SOURCE TREE', size, C['background']))
    out.append(crosshair(x + w - 18, y - 18, 36, crosshair_color or (C['background'] if on_paper else C['text']), 2))
    return ''.join(out)


def state_chip(x, y, state, size=12):
    color = STATE_COLOR[state]
    return rect(x, y - size + 2, size - 2, size - 2, color) + label(x + size + 6, y, STATE_LABEL[state], size, color, spacing=.7)


def scanlines(w, h):
    """Low-intensity texture; posters only."""
    return (f'<pattern id="scan" width="1" height="5" patternUnits="userSpaceOnUse">'
            f'<rect width="1" height="1" fill="{C["text"]}" opacity=".04"/></pattern>'
            f'<rect width="{w}" height="{h}" fill="url(#scan)"/>')


def ground(w, h, fill=None):
    return rect(0, 0, w, h, fill or C['background'])


def headline(x, y, size, color=None, gap=None):
    gap = gap or size * 1.02
    return ''.join(display(x, y + i * gap, line, size, color) for i, line in enumerate(HEADLINE))


def sample_marker(x, y, color=None):
    return label(x, y, SAMPLE, 16, color or C['muted'])


# --- layouts -----------------------------------------------------------------
def build_logos():
    for variant in ('primary', 'light', 'mono-dark', 'mono-light'):
        v = mark_variant(variant)
        write(f'logos/mark-{variant}', 512, 512, mark(0, 0, 512, **v), f'patstack mark, {variant}')
        write(f'logos/lockup-{variant}', 800, 200, lockup(16, 32, 136, variant), f'patstack lockup, {variant}', outlined=True)


def build_social():
    rows = CONFIG['hosts']
    # X / Bluesky banner
    body = ground(1500, 500) + lockup(62, 48, 72) + headline(62, 290, 96) + label(62, 452, URL, 14)
    body += rack(880, 52, 558, rows, footnote=None) + label(880, 478, CONFIG['hosts_record'].split(' (')[0].upper(), 11)
    write('social/banner-x-bluesky', 1500, 500, body, 'patstack banner: lockup, headline and the six-host rack')
    body = ground(1500, 600) + lockup(62, 72, 80) + headline(62, 330, 104) + label(62, 540, URL, 14)
    body += rack(880, 100, 558, rows) + label(880, 530, CONFIG['hosts_record'].split(' (')[0].upper(), 11)
    write('social/banner-tall-master', 1500, 600, body, 'patstack tall banner master')
    # Square post
    body = ground(1080, 1080) + label(72, 96, TAG, 18, C['muted']) + headline(72, 240, 112)
    body += rack(72, 420, 936, rows) + label(72, 822, CONFIG['hosts_record'].split(' (')[0].upper(), 11)
    body += plates(760, 880, 200, 100, 14) + label(72, 1004, URL, 14)
    write('social/square-post', 1080, 1080, body, 'patstack square post: headline, rack and registration plates')
    # Landscape template
    body = ground(1600, 900) + lockup(72, 72, 80) + headline(72, 330, 112)
    body += plates(1000, 300, 440, 250, 36) + label(1000, 640, 'REGISTRATION · SOURCE = PLAN = INSTALLED', 13, C['text'])
    body += label(72, 800, URL, 14) + sample_marker(72, 840)
    write('social/landscape-template', 1600, 900, body, 'patstack landscape template')
    # Story template: content between y=250 and y=1670
    body = ground(1080, 1920) + lockup(72, 260, 96) + headline(72, 560, 112)
    body += rack(72, 760, 936, rows, row_h=64) + label(72, 1200, CONFIG['hosts_record'].split(' (')[0].upper(), 11)
    body += plates(72, 1280, 400, 220, 28) + label(72, 1600, URL, 16) + sample_marker(72, 1640)
    write('social/story-template', 1080, 1920, body, 'patstack story template')
    # Quote template
    body = ground(1080, 1080) + label(72, 96, 'QUOTE', 18, C['muted']) + lockup(72, 130, 56, tag=False)
    body += rect(72, 300, 936, 420, C['surface'], C['line'], 1) + rect(84, 320, 6, 6, C['background']) + rect(84, 334, 6, 6, C['background'])
    body += text(120, 400, 'Exact quote / attribution / source', 40, C['text'])
    body += text(120, 460, 'Replace with the quoted passage and its source before publication.', 22, C['muted'])
    body += crosshair(960, 316, 36, C['text']) + label(72, 1004, URL, 14) + sample_marker(72, 960)
    write('social/quote-template', 1080, 1080, body, 'patstack quote template')
    # Release template
    body = ground(1080, 1080) + label(72, 96, 'RELEASE', 18, C['muted']) + state_chip(220, 96, 'active', 18)
    body += lockup(72, 130, 56, tag=False)
    body += display(72, 420, 'VERIFIED CHANGE /', 88) + display(72, 510, 'USEFUL CONSEQUENCE', 88)
    body += text(72, 580, 'Artifact, change, status, consequence. Replace before publication.', 22, C['muted'])
    body += plates(640, 700, 300, 150, 20) + label(72, 1004, URL, 14) + sample_marker(72, 960)
    write('social/release-template', 1080, 1080, body, 'patstack release template')
    # Screenshot frame
    body = ground(1600, 1000) + lockup(72, 64, 64)
    body += rect(72, 200, 1456, 660, C['surface'], C['accent'], 2)
    body += text(800, 540, 'Place a verified screenshot here.', 30, C['muted'], anchor='middle')
    body += label(72, 920, URL, 14) + sample_marker(72, 960)
    write('social/screenshot-frame', 1600, 1000, body, 'patstack screenshot frame')
    # Avatar
    write('social/avatar', 512, 512, ground(512, 512) + mark(76, 76, 360, **mark_variant('primary')), 'patstack avatar')


def build_video():
    rows = CONFIG['hosts']
    body = ground(1920, 1080) + lockup(96, 96, 96) + headline(96, 520, 128) + label(96, 800, TAG, 24, C['accent'])
    body += rack(1200, 300, 624, rows, row_h=64) + label(1200, 760, CONFIG['hosts_record'].split(' (')[0].upper(), 11)
    body += label(96, 960, URL, 18)
    write('video/title-card', 1920, 1080, body, 'patstack video title card')
    body = ground(1920, 1080) + lockup(96, 96, 96) + headline(96, 560, 176) + label(96, 860, TAG, 28, C['accent'])
    body += plates(1350, 240, 400, 240, 36)
    write('video/thumbnail', 1920, 1080, body, 'patstack video thumbnail')
    body = ground(1920, 1080) + lockup(560, 400, 200) + label(960, 740, URL, 32, C['text'], anchor='middle')
    body += label(960, 800, 'A SUBCULT TOOL', 22, C['muted'], anchor='middle')
    write('video/end-card', 1920, 1080, body, 'patstack video end card')
    body = rect(96, 820, 1040, 164, C['surface'], C['line'], 2)
    body += rect(112, 870, 6, 6, C['background']) + rect(112, 890, 6, 6, C['background'])
    body += mark(132, 856, 92, **mark_variant('primary'))
    body += display(256, 896, 'TITLE / SPEAKER', 46) + text(256, 948, 'A short line of context.', 30, C['muted'])
    body += rect(1096, 892, 10, 10, C['accent']) + label(1070, 936, '[ACTIVE]', 12, C['accent'], anchor='end')
    write('video/lower-third', 1920, 1080, body, 'patstack transparent lower third')
    save('video/captions.ass',
         '[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n'
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
         'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
         'Style: patstack,Space Grotesk,48,&H00E4ECF0,&H0088FF00,&H00190B10,&H80190B10,-1,0,0,0,100,100,0,0,1,3,0,2,96,96,72,1\n\n'
         '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
         'Dialogue: 0,0:00:00.00,0:00:04.00,patstack,,0,0,0,,Two short lines at most. Check readability at phone size.\n')


def build_product():
    rows = CONFIG['hosts']
    body = ground(1200, 630) + lockup(60, 52, 64) + headline(60, 290, 88) + label(60, 572, URL, 14)
    body += rack(780, 52, 360, rows, row_h=48) + label(780, 420, 'RECORD OF 2026-10-19 · NOT LIVE', 11)
    write('product/og', 1200, 630, body, 'patstack link preview: lockup, headline and the six-host rack')
    write('product/repo-avatar', 512, 512, ground(512, 512) + mark(76, 76, 360, **mark_variant('primary')), 'patstack repository avatar')
    body = ground(1280, 320) + lockup(64, 92, 120) + plates(880, 60, 300, 180, 24)
    write('product/readme-banner', 1280, 320, body, 'patstack README banner: lockup and registration plates')
    write('product/favicon-64', 64, 64, ground(64, 64) + mark(6, 6, 52, **mark_variant('primary')), 'patstack favicon')


def build_board():
    w, h = 1440, 960
    b = ground(w, h)
    b += label(64, 54, 'PATSTACK / A1 RACK + A3 REGISTRATION / OWNER-SELECTED COMBINATION · NOVEMBER 3, 2026', 13)
    b += rect(64, 70, 1312, 1, C['line'])
    b += lockup(64, 110, 120)
    b += plates(1040, 92, 300, 148, 20)
    b += headline(64, 340, 64)
    b += text(64, 440, 'Personal skills, shared skills, profiles and global instructions, installed on every host from a journaled, reversible apply.', 17, C['muted'])
    # mark variants on their grounds
    b += rect(1040, 300, 100, 100, C['background'], C['line'], 1) + mark(1054, 314, 72, **mark_variant('primary'))
    b += rect(1156, 300, 100, 100, C['text']) + mark(1170, 314, 72, **mark_variant('light'))
    b += rect(1272, 300, 100, 100, C['background'], C['line'], 1) + mark(1286, 314, 72, **mark_variant('mono-dark'))
    b += label(1040, 424, 'PRIMARY', 11) + label(1156, 424, 'LIGHT', 11) + label(1272, 424, 'MONO', 11)
    roles = [('background', 'GROUND'), ('surface', 'SURFACE'), ('line', 'LINE'), ('text', 'PAPER'), ('muted', 'MUTED'),
             ('accent', 'ACID · SIGNAL'), ('identity', 'VIOLET · IDENTITY'), ('warning', 'WARNING'), ('critical', 'CRITICAL'), ('archive', 'ARCHIVE')]
    for i, (key, name) in enumerate(roles):
        x = 64 + i * 132
        b += rect(x, 480, 118, 72, C[key], C['line'], 1)
        b += label(x, 574, name, 10, C['text']) + label(x, 590, C[key].upper(), 10)
        if key not in ('background', 'surface', 'line'):
            b += label(x, 606, f'{contrast(C[key], C["background"])}:1 ON GROUND', 10)
    b += rect(64, 636, 1312, 1, C['line'])
    b += label(64, 672, 'DISPLAY · OSWALD 700 CAPS', 11) + display(64, 724, 'GUARDED DEPLOYMENT', 40)
    b += label(64, 768, 'BODY · SPACE GROTESK', 11) + text(64, 800, 'Apply rejects drift from the recorded baseline.', 20, C['text'])
    b += label(64, 844, 'LABEL · JETBRAINS MONO', 11) + label(64, 872, '[ACTIVE] CATALOG/PROPOSED-CATALOG.JSON', 14, C['accent'])
    b += rack(760, 652, 616, CONFIG['hosts'][:3], header=False)
    for i, state in enumerate(('active', 'warning', 'veto', 'archive')):
        b += state_chip(760 + i * 150, 872, state, 12)
    b += rect(64, 900, 1312, 1, C['line'])
    b += label(64, 932, 'ORIGINAL VECTOR MARK / LICENSED FONTS / SUBCULT STUDIO / HOST STATES FROM THE 2026-10-19 RECORD, NOT LIVE', 11)
    write('brand-board', w, h, b, 'patstack brand board')
    shutil.copyfile(ROOT / 'brand-board.svg', ROOT / 'pack-preview.svg')
    shutil.copyfile(ROOT / 'brand-board.png', ROOT / 'pack-preview.png')


# --- documents ---------------------------------------------------------------
def contrast_table():
    pairs = [('text', 'background'), ('muted', 'background'), ('accent', 'background'), ('identity', 'background'),
             ('warning', 'background'), ('critical', 'background'), ('text', 'surface'), ('background', 'accent'),
             ('background', 'identity'), ('background', 'text'), ('critical_on_paper', 'text')]
    return {f'{a}/{b}': contrast(C[a], C[b]) for a, b in pairs}


def write_tokens():
    pairs = contrast_table()
    tokens = {
        'name': 'patstack', 'brand': 'patstack', 'slug': 'patstack', 'wordmark': WORD,
        'direction': CONFIG['direction'], 'status': CONFIG['asset_status'],
        'direction_selection': CONFIG['direction_selection'], 'lineage': CONFIG['lineage'],
        'repository': CONFIG['repository'], 'study': 'studies/patstack-directions',
        'colors': C, 'contrast': pairs,
        'fonts': F,
        'type_roles': {
            'display': 'Oswald 700, uppercase, letter-spacing 1% of size; headlines, host names, the wordmark',
            'body': 'Space Grotesk 400/500/700, sentence case; explanations and descriptions',
            'label': 'JetBrains Mono 400/700, uppercase with 8 to 12% tracking for small labels; status labels, paths, metadata, commands'},
        'spacing': [8, 16, 24, 32, 48, 64, 96],
        'radii': {'all': 0},
        'rules': {
            'identity_text': 'violet is large-text only on the ground (4.58:1); use it for the lineage tag, the mark block and fields',
            'critical_text': 'use critical #ff4055 on the ground and critical_on_paper #d52032 on paper',
            'warning_text': 'orange carries text only on the ground; on paper it is a filled square beside an ink label',
            'texture': 'scanlines at 4% on posters only; documentation and interfaces stay undecorated'},
        'states': {k: {'label': v[0], 'color': C[v[1]], 'meaning': v[2]} for k, v in CONFIG['states'].items()},
        'motifs': {
            'rack_unit': 'ears (two 6 px squares), slot number in mono, host name in display caps, role in body, lamp (8 px square) and state label; rows 48 to 64 px; 1 px line between rows',
            'registration_plates': 'three plates offset by one spacing step: installed tree (line color) at the back, plan (acid) in the middle, source tree (paper) in front; a crosshair at the front plate\'s top right; the plates mean hashes, modes and symlink targets agree',
            'lineage_block': 'the violet block tilted 3.6 degrees appears only in the mark and on posters'},
        'hosts': CONFIG['hosts'], 'hosts_record': CONFIG['hosts_record'],
        'canvas': 'https://claude.ai/artifact/L12uCteNUx37eWSZtmRFDn (private Design canvas with the nine candidates and the deeper A1 and A3 boards)'}
    save('tokens.json', json.dumps(tokens, indent=2) + '\n')
    css = ':root {\n' + ''.join(f'  --patstack-{k.replace("_", "-")}: {v};\n' for k, v in C.items())
    css += f'  --patstack-font-display: "{DISPLAY}", sans-serif;\n  --patstack-font-body: "{BODY}", sans-serif;\n  --patstack-font-label: "{LABEL}", monospace;\n}}\n'
    save('tokens.css', css)
    return pairs


def write_guide(pairs):
    rows = '\n'.join(f'| `{k}` | {C[k]} | {name} |' for k, name in [
        ('background', 'Ground. Pages, posters, the terminal.'),
        ('surface', 'Panels, rack bodies, code blocks.'),
        ('line', 'Rules, borders, the back plate.'),
        ('text', 'Paper. Headlines, body, the front plate and rack units.'),
        ('muted', 'Secondary text, roles, footnotes. Also the archive state.'),
        ('accent', 'Acid. The live signal: the lit lamp, [ACTIVE], the plan plate, filled buttons with ground-colored text.'),
        ('identity', 'Violet. SUBCULT lineage: the mark block, the lineage tag, poster fields. Large text only on the ground.'),
        ('warning', 'Orange. [WARNING]: an external owner changed since the baseline.'),
        ('critical', 'Red. [VETO]: apply refused. Use critical_on_paper on light grounds.'),
    ])
    measured = '\n'.join(f'| {k} | {v}:1 |' for k, v in pairs.items())
    hosts = '\n'.join(f'| {slot} | {name} | {role} | {STATE_LABEL[state]} |' for slot, name, role, state in CONFIG['hosts'])
    states = '\n'.join(f'| {v[0]} | {C[v[1]]} | {v[2]} |' for v in CONFIG['states'].values())
    doc = f'''# patstack — Brand and asset guide

Selected direction: **A1 Rack + A3 Registration**. {CONFIG['asset_status']}

{CONFIG['direction_selection']} The nine candidates, the originality audit and the deeper A1 and A3 boards are recorded in [the direction study](../../studies/patstack-directions/README.md).

patstack is the owner's agent skill stack: personal skills, shared skills, an optional library, profiles and global agent instructions in one private repository ({CONFIG['repository']} on Gitea), installed on every host by a guarded installer that plans against recorded hashes, applies with a journal and verified backups, and refuses to overwrite drift. It has no web application. Its surfaces are the repository (README, Gitea avatar and link preview), documentation pages if they are ever published, the terminal, and occasional posters or posts about the tool.

{CONFIG['lineage']} It is a SUBCULT tool, so the lineage tag reads `A SUBCULT TOOL` and the violet block in the mark points at the parent without redrawing the SC_ master.

## What the system means

- **Rack units** are the fleet. Every list of hosts or installed trees is drawn as rack units: ears, a slot number, the host name in display caps, its role in body text, a lamp and a state label. The rack carries real deployment information; it is never decoration.
- **Registered plates** explain verify and drift. Three flat plates, offset by one spacing step, stand for the installed tree (line color, back), the plan with its expected and desired trees (acid, middle) and the source tree (paper, front). A crosshair sits at the front plate's top right. Registration means the three trees agree on SHA-256 hashes, file modes and symlink targets. A misaligned plate is a refused apply.
- **Status labels are true.** `[ACTIVE]`, `[WARNING]`, `[VETO]` and `[ARCHIVE]` are semantic. Color and text always agree with the installer's real result. Never use a state color for emphasis.
- **Violet marks the tool, never a state.** The lineage cue stays in the mark, the tag and poster fields.

## Color roles

| Token | Color | Use |
| --- | --- | --- |
{rows}

Measured with WCAG relative luminance from the hex values above. Ordinary text needs 4.5:1, large text 3:1.

| Pair | Contrast |
| --- | --- |
{measured}

Violet on the ground passes only for large text; small lineage tags in violet sit inside a line-colored border at 10 to 11 px and should move to muted paper when they must be read at a glance. Acid on violet (3.16:1) is decorative only. Orange on paper is a filled square beside an ink label, not text.

## States

| Label | Color | Meaning |
| --- | --- | --- |
{states}

## Typography and spacing

- **Display:** Oswald 700, uppercase, letter-spacing 1% of the size. Headlines, host names, the wordmark `PATSTACK`. In prose write `patstack` in lowercase.
- **Body:** Space Grotesk, sentence case. Explanations, roles, descriptions.
- **Label:** JetBrains Mono, uppercase with 8 to 12% tracking for small labels; normal case for paths and commands. Status labels, slot numbers, metadata.
- Spacing steps: 8, 16, 24, 32, 48, 64, 96 pixels. Corners are square. One-pixel rules in the line color separate rows; two pixels frame a panel on paper.
- Texture: scanlines at 4% opacity on posters only. Documentation, interfaces and the terminal stay undecorated.

## Mark

{CONFIG['mark_status']} Unlit lamps are gaps in the unit bar, so the mark reads on any ground.

- Variants: `mark-primary` (paper units, acid lamp, violet block) for dark grounds; `mark-light` (ground-colored units) for paper; `mark-mono-dark` and `mark-mono-light` outline the block and keep the lit lamp solid.
- Clear space: one quarter of the mark height on every side. Minimum size: 32 pixels on screen; use the mono mark below 24 pixels. Minimum lockup width: 220 pixels; use the mark alone below that.
- Do not stretch, rotate further, add effects or redraw the units. Where the fonts are not installed, use the outlined lockup exports.

## The fleet rack

| Slot | Host | Role | State |
| --- | --- | --- | --- |
{hosts}

{CONFIG['hosts_record']} Rebuild the pack after a verified fleet deployment and update `brand.json` so the rack stays true. A public post should check whether host names belong in it.

## Surfaces

- **Repository:** `product/repo-avatar.png` is the Gitea avatar, `product/og.png` the link preview, `product/readme-banner.png` the README header, `product/favicon-64.png` a small icon.
- **Documentation pages:** ground, paper text, rack units for hosts, registered plates for the verify diagram, real commands in surface-colored code blocks, no web buttons where there is no web app. Focus rings are 2 px acid on the ground.
- **Terminal:** the installed Omarchy `subcult` theme already carries this palette. A proposed summary line format uses the four labels in their state colors; the installer currently prints JSON.
- **Posters and posts:** the violet block and scanlines are allowed. Keep one headline, the rack or the plates, and the lineage tag.

## Files and rebuilding

`brand.json` and `build.py` are the source configuration and generator. `logos/` holds the four mark and lockup variants with outlined copies; `social/` the avatar, banners, square, landscape, story, quote, release and screenshot layouts; `video/` the title, thumbnail, end card, transparent lower third and a caption style; `product/` the repository exports; `brand-board.svg` is editable and its PNG is the pack preview. `tokens.json` and `tokens.css` record the roles. `source-register.json` records ownership and sources; `asset-manifest.json` binds every file to its SHA-256.

From the repository root:

```sh
rtk proxy python3 studio/brands/patstack/build.py
rtk proxy python3 studio/brands/patstack/build.py --export /path/to/patstack/brand
```

The export copies an explicit selection of original artwork, tokens and licensed fonts and writes `studio-assets.json` with source hashes beside them. The eight-second video preview was not produced; add it when a video surface exists.

## Copy, alt text and sources

Facts come from the patstack README and `docs/OPERATING-MODEL.md`: 52 curated personal skills, 5 shared skills, a 326-skill library, retired names mapped in `catalog/retired-names.json`. The headline `Author once. Deploy guarded.` is sample copy in the SUBCULT voice. Replace template text before publication and describe the finished image in alt text; `alt-text.md` has starters. Studio selection is not permission to publish a post or change a profile.
'''
    save('GUIDE.md', doc)


def write_alt_text():
    save('alt-text.md', '''# patstack alt-text starters

Replace these when copy, states or imagery change. Describe the finished image, including the words in it. Host rows are the fleet record of 2026-10-19; say so when the image is shared outside the fleet.

- **Mark**: Three horizontal paper bars stacked like rack units, the top one with a small acid-green lamp, in front of a violet block tilted slightly to the left.
- **Lockup**: The rack mark beside the word PATSTACK in bold condensed capitals, with the small label AGENT SKILL STACK / A SUBCULT TOOL beneath.
- **Banner**: Near-black banner. Left: the lockup and the headline AUTHOR ONCE. DEPLOY GUARDED. in large capitals, the repository address in small monospace. Right: a rack of six units named kvant, sputnik, soyuz, dozor, almaz and nuc, each with a role and a state label; almaz reads [WARNING] in orange, the others [ACTIVE] in green.
- **Square post**: Near-black square. The label AGENT SKILL STACK / A SUBCULT TOOL, the headline, the six-unit rack, and at the bottom right three small offset plates with a crosshair.
- **Avatar and repository avatar**: The rack mark, large, on a near-black square.
- **Link preview**: Near-black 1200×630 card with the lockup, the headline and a compact six-unit rack.
- **README banner**: Near-black 1280×320 strip with the lockup at the left and three offset registration plates at the right.
- **Brand board**: The lockup, registration plates, mark variants on dark and light tiles, ten color swatches with their codes and contrast, type samples, three rack units and the four state labels.
- **Screenshot frame**: Near-black card with the lockup and an empty acid-outlined frame labelled as the place for a verified screenshot.
- **Lower third**: A dark panel with rack ears, the mark, a title line and a context line over a transparent background, with [ACTIVE] at the right.
''')


def write_register():
    save('source-register.json', json.dumps({
        'owner': 'SUBCULT Studio',
        'direction': CONFIG['direction_selection'],
        'audit': 'The A1 and A3 tiles were reviewed with the ui-cliche-audit skill on November 3, 2026: web buttons became real commands, the left-stripe card became a rack unit, the decorative slot label became the fleet, the isometric stack became registered plates, and the canon state set was added.',
        'mark': CONFIG['mark_status'],
        'motif': CONFIG['motif'],
        'lineage': CONFIG['lineage'],
        'copy': 'Headline and support lines are sample copy in the SUBCULT voice (content/VOICE.md). Facts come from the patstack README and docs/OPERATING-MODEL.md.',
        'hosts': CONFIG['hosts_record'],
        'fonts': 'Studio licensed font collection; OFL texts included for Oswald, Space Grotesk and JetBrains Mono.',
        'claims': 'patstack README (counts, installer behavior), docs/OPERATING-MODEL.md, docs/MARKETING-TOOLS.md (October 19, 2026 deployment record)',
        'canvas': 'https://claude.ai/artifact/L12uCteNUx37eWSZtmRFDn',
        'publication': 'Not performed. Owner selected the direction; pack files are local masters. Social publication and profile changes are separate actions.',
    }, indent=2) + '\n')


def asset_entry(p):
    entry = {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
    if p.suffix == '.svg':
        root = ET.parse(p).getroot()
        if 'width' in root.attrib and 'height' in root.attrib:
            entry['dimensions'] = {'width': float(root.attrib['width']), 'height': float(root.attrib['height'])}
    elif p.suffix == '.png':
        width, height = struct.unpack('>II', p.read_bytes()[16:24])
        entry['dimensions'] = {'width': width, 'height': height}
    return entry


def write_manifest():
    assets = [asset_entry(p) for p in sorted(ROOT.rglob('*'))
              if p.is_file() and p.name != 'asset-manifest.json' and '.font-cache' not in p.parts and '__pycache__' not in p.parts]
    save('asset-manifest.json', json.dumps({'brand': 'patstack', 'status': CONFIG['asset_status'], 'assets': assets}, indent=2) + '\n')


EXPORT = ['tokens.json', 'tokens.css', 'logos/mark-primary.svg', 'logos/mark-light.svg', 'logos/mark-mono-dark.svg',
          'logos/mark-mono-light.svg', 'logos/lockup-primary-outlined.svg', 'logos/lockup-light-outlined.svg',
          'product/og.png', 'product/repo-avatar.png', 'product/readme-banner.svg', 'product/readme-banner.png', 'product/favicon-64.png']


def export(target):
    target.mkdir(parents=True, exist_ok=True)
    revision = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', str(ROOT)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    files = []
    for name in EXPORT:
        source = ROOT / name
        dest = target / Path(name).name
        shutil.copyfile(source, dest)
        files.append({'file': dest.name, 'source': f'studio/brands/patstack/{name}', 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
    (target / 'studio-assets.json').write_text(json.dumps({
        'source': 'subculture-collective/subcult-tv studio/brands/patstack', 'revision': revision,
        'dirty_source': bool(dirty), 'files': files,
        'note': 'Copied from Studio. Change the masters in Studio and rerun the export; do not edit these copies.'}, indent=2) + '\n')
    print(target)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--export', type=Path)
    args = parser.parse_args()
    for name in FONT_FILES:
        (ROOT / 'fonts').mkdir(exist_ok=True)
        shutil.copyfile(FONT_SOURCE / name, ROOT / 'fonts' / name)
    catalog = json.loads((FONT_SOURCE / 'sources.json').read_text())
    save('fonts/sources.json', json.dumps([r for r in catalog if r['family'] in F.values()], indent=2) + '\n')
    save('fontconfig.xml', '<?xml version="1.0"?><fontconfig><dir prefix="relative">fonts</dir><cachedir prefix="relative">.font-cache</cachedir></fontconfig>\n')
    save('.gitignore', '.font-cache/\n__pycache__/\n')
    build_logos()
    build_social()
    build_video()
    build_product()
    build_board()
    pairs = write_tokens()
    write_guide(pairs)
    write_alt_text()
    write_register()
    write_manifest()
    if args.export:
        export(args.export)
    print(ROOT)


if __name__ == '__main__':
    main()
