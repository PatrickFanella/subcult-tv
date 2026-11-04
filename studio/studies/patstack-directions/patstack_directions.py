#!/usr/bin/env python3
"""patstack direction comparison (November 3, 2026).

Renders comparison.svg/png (the nine candidates as palette and type tiles), index.html
and manifest.json for the patstack brand-direction study. The reviewable previews were
built as a private Design canvas; their source files are kept in canvas/ and hashed here.
Needs rsvg-convert and fontconfig with the Studio fonts. Fonts that the Studio does not
bundle (Courier Prime, Saira Stencil One, Archivo, IBM Plex Sans) are named, not drawn.
"""
import hashlib
import html
import json
import os
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOOLS = HERE.parents[1] / 'brand-tools'
os.environ['FONTCONFIG_FILE'] = str(TOOLS / 'fontconfig.xml')
DATE = '2026-11-03'
CANVAS = 'https://claude.ai/artifact/L12uCteNUx37eWSZtmRFDn'

DIRECTIONS = [
    dict(key='a1-rack', id='A1', title='Rack', lineage='SUBCULT lineage · systems register',
         concept='Ink canvas, paper rack units, acid status lamps, one violet registration block.',
         bg='#100b19', fg='#f0ece4', accent='#00ff88', secondary='#8b5cf6', muted='#a89fb8',
         fonts=dict(display='Oswald', body='Space Grotesk', label='JetBrains Mono'), draw_display='Oswald', caps=True),
    dict(key='a2-broadsheet', id='A2', title='Broadsheet', lineage='SUBCULT lineage · print register',
         concept='The catalog as a printed sheet: paper, heavy ink rules, folios, violet fields.',
         bg='#f0ece4', fg='#100b19', accent='#8b5cf6', secondary='#00ff88', muted='#5e5570',
         fonts=dict(display='Oswald', body='Space Grotesk', label='JetBrains Mono'), draw_display='Oswald', caps=True),
    dict(key='a3-registration', id='A3', title='Registration', lineage='SUBCULT lineage · schematic register',
         concept='The violet field with the stack drawn as registered plates in ink line.',
         bg='#8b5cf6', fg='#100b19', accent='#00ff88', secondary='#f0ece4', muted='#100b19',
         fonts=dict(display='Oswald', body='Space Grotesk', label='JetBrains Mono'), draw_display='Oswald', caps=True),
    dict(key='b1-patchbay', id='B1', title='Patchbay', lineage='Patrick__Eff lineage · systems register',
         concept='Skills routed to hosts by cable on the Patch charcoal panel.',
         bg='#282a36', fg='#f8f8f2', accent='#bd93f9', secondary='#50fa7b', muted='#a5a6b5',
         fonts=dict(display='Space Grotesk', body='Inter', label='JetBrains Mono'), draw_display='Space Grotesk', caps=False),
    dict(key='b2-liner-notes', id='B2', title='Liner Notes', lineage='Patrick__Eff lineage · print register',
         concept='The Patch light treatment on a record sleeve; skills listed like tracks.',
         bg='#f8f8f2', fg='#282a36', accent='#6f3fc4', secondary='#bd93f9', muted='#5c5e70',
         fonts=dict(display='Space Grotesk', body='Inter', label='JetBrains Mono'), draw_display='Space Grotesk', caps=False),
    dict(key='b3-spectrum', id='B3', title='Spectrum', lineage='Patrick__Eff lineage · schematic register',
         concept='Spectrum bars turned sideways into a stack elevation, one accent per layer.',
         bg='#282a36', fg='#f8f8f2', accent='#ff79c6', secondary='#bd93f9', muted='#a5a6b5',
         fonts=dict(display='Space Grotesk', body='Inter', label='JetBrains Mono'), draw_display='Space Grotesk', caps=False),
    dict(key='c1-ledger', id='C1', title='Ledger', lineage='Standalone · systems register',
         concept='Amber phosphor on near-black, mono throughout; a journal of plan, apply, verify, rollback.',
         bg='#0b0905', fg='#e9e1cf', accent='#ffb000', secondary='#16120a', muted='#a0937a',
         fonts=dict(display='IBM Plex Mono', body='IBM Plex Sans (not bundled)', label='IBM Plex Mono'), draw_display='IBM Plex Mono', caps=False),
    dict(key='c2-card-catalog', id='C2', title='Card Catalog', lineage='Standalone · print register',
         concept='Cream stock, blue rules, typewriter entries, a red stamp; honest about retired names.',
         bg='#f3eee2', fg='#1d1b17', accent='#2f5a99', secondary='#b8321f', muted='#6b655a',
         fonts=dict(display='Libre Baskerville', body='Libre Baskerville', label='Courier Prime (not bundled)'), draw_display='Libre Baskerville', caps=False),
    dict(key='c3-manifest', id='C3', title='Manifest', lineage='Standalone · schematic register',
         concept='Kraft ground, stencilled type, a white shipping label with contents and handling.',
         bg='#d9c4a0', fg='#1a1a1a', accent='#f26b1d', secondary='#f7f3ea', muted='#4a3f2e',
         fonts=dict(display='Saira Stencil One (not bundled)', body='Archivo (not bundled)', label='Archivo'), draw_display='Space Grotesk', caps=True),
]

SELECTION = {
    'status': 'owner selected',
    'date': DATE,
    'selected': ['a1-rack', 'a3-registration'],
    'decision': "The owner first narrowed the nine to A1 or A3, both were reviewed with the ui-cliche-audit skill and expanded into a documentation page, a phone version, a terminal session and a poster, and the owner then chose the combination: the A1 Rack system with A3 Registration's plates as the diagram vocabulary.",
    'pack': '../../brands/patstack/GUIDE.md',
}

AUDIT = [
    ('Both', 'Web buttons implied a web app; patstack is a repository and a CLI.', 'Real commands in code blocks and a documentation link.'),
    ('Both', 'The canon defines warning and critical colors with meaning; the tiles showed none.', 'The state set [ACTIVE] [WARNING] [VETO] [ARCHIVE], each mapped to a real installer result.'),
    ('A1', 'The skill card used a left accent stripe, the stock left-border card.', 'A rack unit with ears, slot number and lamp.'),
    ('A1', 'The slot label U01 meant nothing.', 'The rack is the fleet: six hosts with state from the 2026-10-19 deployment record.'),
    ('A1', 'Scanlines were a fashionable texture.', 'Kept on posters only; documentation is undecorated.'),
    ('A3', 'The isometric exploded stack is a stock dev-tool landing motif.', 'Flat misregistered plates for source, plan and installed trees; registration means hashes, modes and symlink targets agree.'),
    ('A3', 'A full violet reading ground tires over a page.', 'Violet field with a paper sheet; documentation reads on paper.'),
    ('A3', 'Acid crosshairs on violet are 3.16:1, decorative only.', 'Ink crosshairs carry the motif at small sizes.'),
]


def luminance(c):
    v = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def contrast(a, b):
    x, y = sorted([luminance(a), luminance(b)])
    return round((y + .05) / (x + .05), 2)


def rect(x, y, w, h, fill, stroke=None):
    s = f' stroke="{stroke}" stroke-width="1"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"{s}/>'


def text(x, y, s, size, fill, font, weight=400, spacing=0, anchor='start'):
    sp = f' letter-spacing="{spacing}"' if spacing else ''
    return (f'<text x="{x}" y="{y}" font-family="{html.escape(font, quote=True)}" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}"{sp}>{html.escape(s)}</text>')


def tile(d, x, y, w=620, h=420):
    out = [rect(x, y, w, h, d['bg'], '#3b2470')]
    chip = d['accent'] if contrast(d['bg'], d['accent']) >= 4.5 else d['fg']
    chip_text = d['bg'] if contrast(d['bg'], chip) >= 4.5 else d['fg']
    out.append(rect(x + 24, y + 24, 40, 24, chip))
    out.append(text(x + 44, y + 41, d['id'], 13, chip_text, 'JetBrains Mono', 700, anchor='middle'))
    selected = d['key'] in SELECTION['selected']
    out.append(text(x + 76, y + 41, d['lineage'].upper() + ('  ·  SELECTED' if selected else ''), 11, d['muted'], 'JetBrains Mono', 400, 1))
    title = d['title'].upper() if d['caps'] else d['title']
    out.append(text(x + 24, y + 112, title, 56, d['fg'], d['draw_display'], 700, -0.5 if not d['caps'] else 0.5))
    words = d['concept'].split()
    lines, line = [], ''
    for word in words:
        if len(line) + len(word) + 1 > 62:
            lines.append(line)
            line = word
        else:
            line = (line + ' ' + word).strip()
    lines.append(line)
    for i, l in enumerate(lines[:3]):
        out.append(text(x + 24, y + 146 + i * 20, l, 14, d['muted'], 'Space Grotesk'))
    swatches = [('bg', 'ground'), ('fg', 'text'), ('accent', 'accent'), ('secondary', 'second'), ('muted', 'muted')]
    for i, (k, name) in enumerate(swatches):
        sx = x + 24 + i * 116
        out.append(rect(sx, y + 222, 100, 44, d[k], d['muted']))
        out.append(text(sx, y + 284, d[k].upper(), 10, d['muted'], 'JetBrains Mono'))
        out.append(text(sx, y + 298, name.upper(), 10, d['muted'], 'JetBrains Mono', 400, 1))
    sample = 'AUTHOR ONCE. DEPLOY GUARDED.' if d['caps'] else 'Author once. Deploy guarded.'
    out.append(text(x + 24, y + 350, sample, 26, d['fg'], d['draw_display'], 700))
    fonts = ' · '.join(f"{k} {v}" for k, v in d['fonts'].items())
    out.append(text(x + 24, y + 380, fonts.upper(), 10, d['muted'], 'JetBrains Mono', 400, .8))
    out.append(text(x + 24, y + 398, f"TEXT {contrast(d['fg'], d['bg'])}:1 · ACCENT {contrast(d['accent'], d['bg'])}:1 · MUTED {contrast(d['muted'], d['bg'])}:1", 10, d['muted'], 'JetBrains Mono', 400, .8))
    return ''.join(out)


def comparison():
    w, h = 1960, 1480
    body = [rect(0, 0, w, h, '#f0ece4')]
    body.append(text(40, 52, 'PATSTACK · NINE BRAND DIRECTIONS · ROWS ARE LINEAGE, COLUMNS ARE REGISTER (SYSTEMS, PRINT, SCHEMATIC)', 14, '#5e5570', 'JetBrains Mono', 400, 1))
    body.append(text(1920, 52, f'OWNER SELECTED A1 + A3 ON {DATE}', 14, '#100b19', 'JetBrains Mono', 700, 1, 'end'))
    for i, d in enumerate(DIRECTIONS):
        col, row = i % 3, i // 3
        body.append(tile(d, 40 + col * 640, 80 + row * 450))
    body.append(text(40, 1448, 'CONTRAST MEASURED WITH WCAG RELATIVE LUMINANCE FROM THE HEX VALUES SHOWN · FONTS MARKED NOT BUNDLED ARE DRAWN IN A STUDIO FONT HERE · RENDERED PREVIEWS LIVE ON THE PRIVATE DESIGN CANVAS', 11, '#5e5570', 'JetBrains Mono', 400, .8))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" '
           f'aria-label="patstack direction comparison: nine palette and type tiles"><title>patstack direction comparison</title>{"".join(body)}</svg>\n')
    p = HERE / 'comparison.svg'
    p.write_text(svg)
    ET.parse(p)
    subprocess.run(['rsvg-convert', '-w', str(w), '-o', str(HERE / 'comparison.png'), str(p)], check=True)


def index():
    rows = ''.join(
        f'<tr><td><code>{d["id"]}</code></td><td><strong>{html.escape(d["title"])}</strong>{" · selected" if d["key"] in SELECTION["selected"] else ""}</td>'
        f'<td>{html.escape(d["lineage"])}</td><td>{html.escape(d["concept"])}</td>'
        f'<td><code>{d["bg"]}</code> <code>{d["fg"]}</code> <code>{d["accent"]}</code></td>'
        f'<td>{html.escape(" · ".join(d["fonts"].values()))}</td></tr>' for d in DIRECTIONS)
    audit = ''.join(f'<tr><td>{a}</td><td>{html.escape(b)}</td><td>{html.escape(c)}</td></tr>' for a, b, c in AUDIT)
    page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>patstack directions</title><style>body{{margin:0;background:#f0ece4;color:#17131d;font:16px/1.5 system-ui}}main{{max-width:1200px;margin:0 auto;padding:32px 24px}}h1,h2{{font-weight:700;letter-spacing:-.01em}}img{{max-width:100%;height:auto;border:1px solid #c9c2d6}}table{{border-collapse:collapse;width:100%;font-size:14px;margin:16px 0}}th,td{{text-align:left;vertical-align:top;padding:8px 10px;border-bottom:1px solid #c9c2d6}}code{{font:13px/1.4 "JetBrains Mono",ui-monospace,monospace}}.k{{font:12px/1.4 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#5e5570}}</style></head><body><main>
<p class="k">SUBCULT Studio · direction study · {DATE}</p>
<h1>patstack: nine directions, one selection</h1>
<p>patstack is the owner's agent skill stack. Nine candidate systems were built on one private Design canvas with the same content on every tile: lockup, headline, one real skill card, two actions, palette and type roles. Rows are lineage (SUBCULT, Patrick__Eff, standalone); columns are register (systems, print, schematic). The owner narrowed the field to A1 Rack or A3 Registration, both were reviewed with the interface originality audit and expanded into a documentation page, a phone version, a terminal session and a poster, and the owner chose the combination.</p>
<p><strong>Selection:</strong> {html.escape(SELECTION["decision"])} The production pack is <a href="{SELECTION["pack"]}">brands/patstack</a>.</p>
<h2>Comparison sheet</h2>
<p><a href="comparison.png"><img src="comparison.png" alt="Nine tiles, three by three, each with a direction name, its lineage, five color swatches with hex codes, a headline sample in its display font and its fonts and measured contrast; A1 Rack and A3 Registration are marked selected."></a></p>
<p class="k">Rendered application previews are on the private canvas: <a href="{CANVAS}">{CANVAS}</a>. Their source files are in <a href="canvas/">canvas/</a> (one HTML file per artboard plus canvas.json); they render inside the canvas runtime, not as standalone pages.</p>
<h2>The nine</h2>
<table><thead><tr><th>ID</th><th>Direction</th><th>Lineage · register</th><th>Concept</th><th>Ground · text · accent</th><th>Fonts</th></tr></thead><tbody>{rows}</tbody></table>
<h2>What the audit changed in A1 and A3</h2>
<table><thead><tr><th>Tile</th><th>Finding</th><th>Replacement</th></tr></thead><tbody>{audit}</tbody></table>
<h2>Sources</h2>
<ul>
<li>SUBCULT Visual Language, Brand Voice, Messaging System and the Project and Sub-Brand Map (SUBCULT vault, Strategy/Identity/Canon).</li>
<li>Selected packs: SUBCULT C poster press and Patrick__Eff Patch (brand-tools/brands.json, brands/subcult, brands/patrick__eff).</li>
<li>Omarchy subcult theme palette for the state colors.</li>
<li>patstack README and docs/OPERATING-MODEL.md for every fact shown; the 2026-10-19 fleet deployment record for host states.</li>
<li>Marks are original sketches; none redraws the SC_ master or the PF frame.</li>
</ul>
<p class="k">Selection is not publication. No post, profile or site was changed by this study.</p>
</main></body></html>
'''
    (HERE / 'index.html').write_text(page)


def manifest():
    directions = []
    for d in DIRECTIONS:
        directions.append({'key': d['key'], 'id': d['id'], 'title': d['title'], 'lineage': d['lineage'], 'concept': d['concept'],
                           'colors': {k: d[k] for k in ('bg', 'fg', 'accent', 'secondary', 'muted')}, 'fonts': d['fonts'],
                           'contrast': {'text': contrast(d['fg'], d['bg']), 'accent': contrast(d['accent'], d['bg']),
                                        'secondary': contrast(d['secondary'], d['bg']), 'muted': contrast(d['muted'], d['bg'])},
                           'selected': d['key'] in SELECTION['selected']})
    files = [{'path': str(p.relative_to(HERE)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
             for p in sorted(HERE.rglob('*')) if p.is_file() and p.name != 'manifest.json' and '__pycache__' not in p.parts]
    (HERE / 'manifest.json').write_text(json.dumps({
        'study': 'patstack-directions', 'date': DATE, 'status': 'owner selected: combination of A1 Rack and A3 Registration',
        'selection': SELECTION, 'canvas': CANVAS, 'audit': [{'tile': a, 'finding': b, 'replacement': c} for a, b, c in AUDIT],
        'directions': directions, 'files': files}, indent=2) + '\n')


if __name__ == '__main__':
    comparison()
    index()
    manifest()
    print(HERE)
