"""Corkboard / Kork direction comparison (October 2, 2026).

Builds four directions into corkboard-directions/: mark, lockup, banner,
square post and avatar per direction, plus comparison.png and index.html.
A is the proposed Corkboard pack renamed Kork; B-D are alternatives. All
artwork is original; card destinations are placeholders.
"""
from pathlib import Path
import base64, html, os, subprocess, xml.etree.ElementTree as ET
import sys
HERE = Path(__file__).resolve().parent
R = HERE.parents[1] / 'brand-tools'
os.environ['FONTCONFIG_FILE'] = str(R / 'fontconfig.xml')
sys.path.insert(0, str(R))
import design_helpers as H
T, rect, line = H.txt, H.rect, H.line
OUT = HERE

def write(dest, name, body, w, h, exportw=None):
    p = dest / (name + '.svg'); p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(H.svg(body, w, h, name))
    subprocess.run(['rsvg-convert', '-w', str(exportw or w), '-o', str(p.with_suffix('.png')), str(p)], check=True)
    return p

def embed(path, x, y, w, h):
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{base64.b64encode(path.read_bytes()).decode()}"/>'

def g(body, x, y, size):
    return f'<g transform="translate({x} {y}) scale({size/160})">{body}</g>'

# ---------------------------------------------------------------- A / Kork
A = dict(key='a-kork', name='Kork', title='A / Kork: pinned card',
         note='The proposed Corkboard pack, renamed. Cork field, paper cards, cobalt pushpins, Archivo Black.',
         bg='#d4a56c', fg='#1b130c', accent='#2340e8', secondary='#fbf6ec', safe_label='#1b130c',
         display='Archivo Black', body='Atkinson Hyperlegible Next', label='JetBrains Mono',
         slug='corkboard', url='kork.subcult.tv', wordmark='kork')
def a_mark(d, x, y, size): return H.corkboard_mark(d, x, y, size)
def a_banner(d):
    s = rect(0, 0, 1200, 400, d['bg']) + H.cork_texture(1200, 400)
    s += T(44, 62, 'LINK PAGES / BY SUBCULT', 17, d['fg'], d['label']) + line(44, 82, 640, 82, d['fg'], 3)
    for i, h in enumerate(['EVERY LINK.', 'ONE BOARD.']): s += T(44, 178 + i * 86, h, 78, d['fg'], d['display'], 700, maxw=600)
    s += T(44, 355, d['url'], 20, d['fg'], d['label'])
    s += H.pinned_card(d, 705, 58, 215, 128, -5, [('@yourname', 27, d['body'], 700), ('SOCIAL', 15, d['label'], 400)])
    s += H.pinned_card(d, 950, 92, 200, 124, 6, [('$yourname', 26, d['body'], 700), ('TIPS', 15, d['label'], 400)])
    s += H.pinned_card(d, 800, 222, 150, 150, -3, [], qr=True)
    s += H.pinned_card(d, 985, 250, 170, 104, 4, [('WATCH', 24, d['body'], 700), ('LATEST VIDEO', 13, d['label'], 400)])
    return s
def a_post(d):
    s = rect(0, 0, 600, 600, d['bg']) + H.cork_texture(600, 600) + T(36, 49, 'LINK PAGES / BY SUBCULT', 14, d['fg'], d['label'])
    s += T(36, 140, 'PIN IT UP.', 66, d['fg'], d['display'], 700, maxw=528) + T(36, 190, 'Share one link for everything.', 26, d['fg'], d['body'], maxw=528)
    return s + H.cork_stack(d, 40, 232, 520, 270) + T(36, 572, d['url'], 16, d['fg'], d['label'])

# ------------------------------------------------------- B / Wheatpaste
B = dict(key='b-wheatpaste', name='Corkboard', title='B / Wheatpaste: street poster',
         note='Photocopied flyers pasted on a wall: newsprint, hard black type, safety-orange tape and halftone dots.',
         bg='#eeebe2', fg='#121212', accent='#ff5a1f', secondary='#121212', safe_label='#121212',
         display='Archivo Black', body='Space Grotesk', label='IBM Plex Mono', url='corkboard.subcult.tv', wordmark='CORKBOARD')
def halftone(x, y, w, h, color, step=14, op=.22):
    s = ''
    for j in range(int(h // step)):
        for i in range(int(w // step)):
            r = 1 + 4.2 * (i / max(1, w // step))
            s += f'<circle cx="{x + i * step + step / 2}" cy="{y + j * step + step / 2}" r="{r:.2f}" fill="{color}"/>'
    return f'<g opacity="{op}">{s}</g>'
def tape(x, y, w, h, rot, color):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}" opacity=".88" transform="rotate({rot} {x + w / 2} {y + h / 2})"/>'
def b_mark(d, x, y, size):
    mono = d.get('mono'); ink = d['fg']; tp = d['accent'] if not mono else d['fg']
    paper = d['bg'] if not mono else 'none'
    s = f'<g transform="rotate(-4 80 82)"><rect x="24" y="22" width="112" height="120" fill="{ink}"/>'
    s += T(43, 122, 'C', 104, paper if not mono else d['bg'], 'Archivo Black', 700) + '</g>'
    s += tape(52, 8, 58, 22, -9, tp)
    return g(s, x, y, size)
def b_banner(d):
    s = rect(0, 0, 1200, 400, d['bg']) + halftone(640, 0, 560, 400, d['fg'], 16, .18)
    s += f'<g transform="rotate(-2 330 210)"><rect x="40" y="56" width="600" height="300" fill="{d["fg"]}"/>'
    s += T(70, 170, 'EVERY LINK', 82, d['bg'], d['display'], 700, maxw=540) + T(70, 262, 'ON ONE WALL.', 70, d['bg'], d['display'], 700, maxw=540)
    s += T(70, 322, 'LINK PAGES / BY SUBCULT', 18, d['bg'], d['label']) + '</g>'
    s += tape(300, 36, 120, 34, 4, d['accent']) + tape(560, 330, 110, 32, -6, d['accent'])
    for i, (t1, t2, rot, xx, yy) in enumerate([('@yourname', 'SOCIAL', 3, 720, 70), ('$yourname', 'TIPS', -4, 930, 150), ('SCAN ME', 'QR', 2, 760, 250)]):
        s += f'<g transform="rotate({rot} {xx + 100} {yy + 50})"><rect x="{xx}" y="{yy}" width="210" height="100" fill="#fbfaf6" stroke="{d["fg"]}" stroke-width="3"/>'
        s += T(xx + 18, yy + 52, t1, 30, d['fg'], d['display'], 700, maxw=175) + T(xx + 18, yy + 82, t2, 15, d['fg'], d['label']) + '</g>'
        s += tape(xx + 70, yy - 12, 70, 22, rot * 3, d['accent'])
    return s + T(1200 - 44 - 200, 382, d['url'], 15, d['fg'], d['label'], maxw=200)
def b_post(d):
    s = rect(0, 0, 600, 600, d['bg']) + halftone(300, 300, 300, 300, d['fg'], 14, .2)
    s += f'<g transform="rotate(-3 300 230)"><rect x="40" y="80" width="520" height="290" fill="{d["fg"]}"/>'
    s += T(66, 200, 'STICK IT', 84, d['bg'], d['display'], 700, maxw=470) + T(66, 300, 'UP.', 92, d['accent'], d['display'], 700) + '</g>'
    s += tape(220, 60, 150, 36, 5, d['accent'])
    s += T(40, 452, 'One link. Every place', 30, d['fg'], d['body'], 700) + T(40, 492, 'people can find you.', 30, d['fg'], d['body'], 700)
    return s + T(40, 49, 'LINK PAGES / BY SUBCULT', 14, d['fg'], d['label']) + T(40, 572, d['url'], 16, d['fg'], d['label'])

# ------------------------------------------------------- C / Night board
C = dict(key='c-nightboard', name='Corkboard', title='C / Night board: lit pins',
         note='A dark pegboard where each link is a pin; your pins light up in signal orange. Grotesk type, mono labels.',
         bg='#121317', fg='#f1efe9', accent='#ff7a1a', secondary='#3a3d46', safe_label='#c9c6bf',
         display='Space Grotesk', body='Space Grotesk', label='IBM Plex Mono', url='corkboard.subcult.tv', wordmark='corkboard')
LIT = {(2, 0), (1, 1), (2, 2)}
def c_mark(d, x, y, size):
    mono = d.get('mono'); s = ''
    if not mono: s += rect(8, 8, 144, 144, '#1d1f25', 30)
    else: s += f'<rect x="8" y="8" width="144" height="144" rx="30" fill="none" stroke="{d["fg"]}" stroke-width="6"/>'
    for j in range(3):
        for i in range(3):
            cx, cy = 40 + i * 40, 40 + j * 40
            if (i, j) in LIT: s += f'<circle cx="{cx}" cy="{cy}" r="14" fill="{d["accent"] if not mono else d["fg"]}"/>'
            else: s += f'<circle cx="{cx}" cy="{cy}" r="7" fill="{d["secondary"] if not mono else "none"}"' + (f' stroke="{d["fg"]}" stroke-width="3"' if mono else '') + '/>'
    return g(s, x, y, size)
def c_board(d, x0, y0, cols, rows, gap, lit, labels):
    s = ''
    for j in range(rows):
        for i in range(cols):
            cx, cy = x0 + i * gap, y0 + j * gap
            if (i, j) in lit: s += f'<circle cx="{cx}" cy="{cy}" r="{gap * .28}" fill="{d["accent"]}"/><circle cx="{cx}" cy="{cy}" r="{gap * .48}" fill="{d["accent"]}" opacity=".16"/>'
            else: s += f'<circle cx="{cx}" cy="{cy}" r="{gap * .12}" fill="{d["secondary"]}"/>'
    for (i, j), text in labels.items():
        cx, cy = x0 + i * gap, y0 + j * gap
        s += line(cx + gap * .3, cy, cx + gap * 1.2, cy, d['accent'], 2) + T(cx + gap * 1.35, cy + 7, text, 20, d['fg'], d['label'])
    return s
def c_banner(d):
    s = rect(0, 0, 1200, 400, d['bg'])
    s += T(44, 64, 'LINK PAGES / BY SUBCULT', 17, d['safe_label'], d['label'])
    s += T(44, 190, 'Every link.', 80, d['fg'], d['display'], 700) + T(44, 280, 'One pin.', 80, d['accent'], d['display'], 700)
    s += T(44, 356, d['url'], 19, d['safe_label'], d['label'])
    s += c_board(d, 640, 70, 9, 6, 52, {(1, 0), (3, 1), (2, 3), (5, 4), (1, 5)}, {(3, 1): '@yourname', (5, 4): '$yourname', (1, 5): 'scan / qr'})
    return s
def c_post(d):
    s = rect(0, 0, 600, 600, d['bg']) + T(36, 49, 'LINK PAGES / BY SUBCULT', 14, d['safe_label'], d['label'])
    s += T(36, 140, 'Light up', 64, d['fg'], d['display'], 700) + T(36, 212, 'your pins.', 64, d['accent'], d['display'], 700)
    s += c_board(d, 60, 290, 6, 4, 64, {(0, 0), (2, 1), (1, 3)}, {(2, 1): '@yourname', (1, 3): '$yourname'})
    return s + T(36, 572, d['url'], 16, d['safe_label'], d['label'])

# ------------------------------------------------------- D / Index card
D = dict(key='d-indexcard', name='Corkboard', title='D / Index card: ruled stationery',
         note='Library index cards: cream stock, a red top rule, blue ruled lines and a serif wordmark. Quieter and editorial.',
         bg='#f6efe0', fg='#1f2a44', accent='#c8382e', secondary='#6f8fd8', safe_label='#1f2a44',
         display='Libre Baskerville', body='Public Sans', label='JetBrains Mono', url='corkboard.subcult.tv', wordmark='Corkboard')
def index_card(d, x, y, w, h, rot, lines=(), tab=None):
    mono = d.get('mono'); ink = d['fg']
    s = f'<g transform="rotate({rot} {x + w / 2} {y + h / 2})">'
    if not mono: s += rect(x + 5, y + 6, w, h, ink, 3)[:-2] + ' opacity=".14"/>'
    if tab: s += f'<rect x="{x + 18}" y="{y - 22}" width="{w * .32}" height="26" rx="4" fill="{"#fffaf0" if not mono else "none"}" stroke="{ink}" stroke-width="2"/>' + T(x + 28, y - 4, tab, 13, ink, d['label'])
    s += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{"#fffaf0" if not mono else "none"}" stroke="{ink}" stroke-width="2"/>'
    s += line(x, y + h * .24, x + w, y + h * .24, d['accent'] if not mono else ink, 3)
    for k in range(1, 4): s += line(x, y + h * .24 + k * h * .19, x + w, y + h * .24 + k * h * .19, d['secondary'] if not mono else ink, 1.2)
    for k, (text, size, font, weight) in enumerate(lines): s += T(x + 16, y + h * .24 + (k + 1) * h * .19 - 6, text, size, ink, font, weight, maxw=w - 32)
    return s + '</g>'
def d_mark(d, x, y, size):
    mono = d.get('mono'); ink = d['fg']; paper = '#fffaf0' if not mono else 'none'
    s = f'<rect x="30" y="20" width="46" height="26" rx="5" fill="{paper}" stroke="{ink}" stroke-width="6"/>'
    s += f'<rect x="16" y="40" width="128" height="100" rx="8" fill="{paper}" stroke="{ink}" stroke-width="7"/>'
    s += line(16, 68, 144, 68, d['accent'] if not mono else ink, 9)
    for k in range(2): s += line(32, 94 + k * 22, 128 - k * 30, 94 + k * 22, d['secondary'] if not mono else ink, 7)
    return g(s, x, y, size)
def d_banner(d):
    s = rect(0, 0, 1200, 400, d['bg'])
    s += T(44, 64, 'LINK PAGES / BY SUBCULT', 17, d['fg'], d['label']) + line(44, 84, 600, 84, d['accent'], 3)
    s += T(44, 190, 'Every link,', 66, d['fg'], d['display'], 700) + T(44, 270, 'filed in one place.', 52, d['fg'], d['display'], 400, maxw=560)
    s += T(44, 356, d['url'], 19, d['fg'], d['label'])
    s += index_card(d, 690, 70, 280, 170, -4, [('@yourname', 22, d['body'], 700), ('social', 15, d['label'], 400)], 'SOCIAL')
    s += index_card(d, 880, 180, 280, 170, 3, [('$yourname', 22, d['body'], 700), ('tips', 15, d['label'], 400)], 'TIPS')
    return s
def d_post(d):
    s = rect(0, 0, 600, 600, d['bg']) + T(36, 49, 'LINK PAGES / BY SUBCULT', 14, d['fg'], d['label'])
    s += T(36, 140, 'File it', 62, d['fg'], d['display'], 700) + T(36, 210, 'under you.', 62, d['fg'], d['display'], 400)
    s += index_card(d, 60, 290, 480, 220, -2, [('@yourname', 26, d['body'], 700), ('$yourname', 26, d['body'], 700), ('scan the QR', 20, d['label'], 400)], 'LINKS')
    return s + T(36, 572, d['url'], 16, d['fg'], d['label'])

DIRS = [(A, a_mark, a_banner, a_post), (B, b_mark, b_banner, b_post), (C, c_mark, c_banner, c_post), (D, d_mark, d_banner, d_post)]

def build():
    for d, mark, banner, post in DIRS:
        dest = OUT / d['key']
        variants = [('primary', d['bg'], d['fg'], False), ('dark', '#14111a', '#f5f2eb', False), ('light', '#f5f2eb', '#14111a', False), ('mono-dark', '#14111a', '#ffffff', True), ('mono-light', '#ffffff', '#14111a', True)]
        for vname, bg, fg, mono in variants:
            v = dict(d, bg=bg, fg=fg, mono=mono)
            if vname == 'primary': v = dict(d, mono=False)
            if mono: v.update(accent=fg, secondary=fg)
            write(dest / 'logos', 'mark-' + vname, rect(0, 0, 256, 256, bg) + mark(v, 48, 48, 160), 256, 256)
        wm = T(250, 163, d['wordmark'], 96, d['fg'], d['display'], 700, maxw=700)
        write(dest / 'logos', 'lockup-primary', rect(0, 0, 1000, 260, d['bg']) + mark(dict(d, mono=False), 40, 50, 160) + wm, 1000, 260)
        write(dest / 'social', 'banner-x-bluesky', banner(d), 1200, 400, 1500)
        write(dest / 'social', 'square-post', post(d), 600, 600, 1080)
        write(dest / 'social', 'avatar', rect(0, 0, 512, 512, d['bg']) + mark(dict(d, mono=False), 96, 96, 320), 512, 512)
        print(d['title'], flush=True)
    # Comparison board: one row per direction with banner, post, lockup and marks at 160 and 32 px.
    row = 470; s = rect(0, 0, 2000, 60 + row * len(DIRS), '#eae6de')
    s += T(32, 42, 'Corkboard / Kork: four directions (October 2, 2026). Placeholder copy; marks shown at full size and at 32 px.', 22, '#242226', 'Space Grotesk', 700)
    for k, (d, *_rest) in enumerate(DIRS):
        y = 60 + k * row; dest = OUT / d['key']
        s += T(32, y + 34, d['title'], 26, '#242226', 'Space Grotesk', 700) + T(32, y + 62, d['note'], 17, '#4a4650', 'Space Grotesk', maxw=1900)
        s += embed(dest / 'social/banner-x-bluesky.svg', 32, y + 80, 1050, 350) + embed(dest / 'social/square-post.svg', 1102, y + 80, 350, 350)
        s += embed(dest / 'logos/lockup-primary.svg', 1472, y + 80, 500, 130)
        for i, vname in enumerate(['primary', 'dark', 'light', 'mono-dark']):
            s += embed(dest / f'logos/mark-{vname}.svg', 1472 + i * 126, y + 226, 110, 110)
            s += embed(dest / f'logos/mark-{vname}.svg', 1472 + i * 126 + 39, y + 350, 32, 32)
    write(OUT, 'comparison', s, 2000, 60 + row * len(DIRS))
    arts = ''.join(f'<article><h2>{html.escape(d["title"])}</h2><p>{html.escape(d["note"])}</p><a href="{d["key"]}/social/banner-x-bluesky.png"><img src="{d["key"]}/social/banner-x-bluesky.png" alt="{html.escape(d["name"])} banner, {html.escape(d["title"])}"></a><div class="row"><img src="{d["key"]}/social/square-post.png" alt="{html.escape(d["name"])} square post"><img src="{d["key"]}/logos/lockup-primary.png" alt="{html.escape(d["name"])} logo lockup"></div></article>' for d, *_ in DIRS)
    (OUT / 'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Corkboard / Kork directions</title><style>body{margin:0;background:#f0ece4;color:#17131d;font:16px/1.5 system-ui}header{padding:24px 32px}a{color:#56308e}img{width:100%;display:block}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:32px;padding:32px}.row{display:grid;grid-template-columns:1fr 1.4fr;gap:12px;margin-top:12px;align-items:start}article{min-width:0;border-top:2px solid #17131d;padding-top:12px}h2{font-size:23px;margin:4px 0}</style></head><body><header><a href="..">Brand gallery</a><h1>Corkboard / Kork: four directions</h1><p>A is the proposed Corkboard pack, shown under the name Kork. B–D are alternatives. Copy and destinations are placeholders; QR glyphs encode nothing.</p><p><a href="comparison.png">Comparison board</a></p></header><main class="grid">' + arts + '</main></body></html>\n')
    print('comparison built')

if __name__ == '__main__':
    build()
