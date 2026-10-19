"""Sus quotient naming and direction study (October 19, 2026).

Builds four candidate identities for the Twitch bot-signal dashboard (working name
"sus quotient") into sus-quotient-directions/: mark (primary and mono), lockup,
banner, avatar and a dashboard screen per direction, plus comparison.png and
index.html. Each direction pairs a name with a mark, palette, type and a quotient
ramp for the charts. All marks are original geometry drawn here. Channel names in
the artwork are bars, not words; numbers and headlines are sample copy. Needs
rsvg-convert and fontconfig with the Studio fonts (run on Kvant).
"""
from pathlib import Path
import base64, html, json, math, os, subprocess, hashlib
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
TOOLS = HERE.parents[1] / 'brand-tools'
os.environ['FONTCONFIG_FILE'] = str(TOOLS / 'fontconfig.xml')
TAG = 'TWITCH TOP 200 / BY SUBCULT'
SUPPORT = ['Viewbot, follow-bot and chat-bot signals for the top 200', 'Twitch channels. Private preview.']


def svg(w, h, body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" '
            f'aria-label="{html.escape(label)}"><title>{html.escape(label)}</title>{body}</svg>\n')


def rect(x, y, w, h, fill, rx=0, op=None, stroke=None, sw=0):
    o = f' opacity="{op}"' if op is not None else ''
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" rx="{rx}" fill="{fill}"{o}{s}/>'


def circle(cx, cy, r, fill, stroke=None, sw=0):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r}" fill="{fill}"{s}/>'


def text(x, y, s, size, fill, font, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing:.2f}"' if spacing else ''
    return (f'<text x="{x}" y="{y}" font-family="{html.escape(font)}" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}"{sp}>{html.escape(s)}</text>')


def write(name, w, h, body, label, export_w=None):
    p = HERE / (name + '.svg')
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(svg(w, h, body, label))
    ET.parse(p)
    subprocess.run(['rsvg-convert', '-w', str(export_w or w), '-o', str(p.with_suffix('.png')), str(p)], check=True)
    return p


def embed(path, x, y, w, h):
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{base64.b64encode(path.read_bytes()).decode()}"/>'


def g(body, x, y, size, unit=24):
    return f'<g transform="translate({x} {y}) scale({size / unit:.6f})">{body}</g>'


def contrast(a, b):
    def lum(c):
        v = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
        return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]
    x, y = sorted([lum(a), lum(b)])
    return round((y + .05) / (x + .05), 2)


# ------------------------------------------------------------- A / Headcount
A = dict(key='a-headcount', name='Headcount', title='A / Headcount: the door clicker',
         note='The tally a door person keeps at a show. Four strokes and the slash; two strokes are hollow, '
              'people counted who never came in. Night ink, counter amber, Barlow Condensed numerals. '
              'Neutral name: it describes counting, not accusing. Common English word, so harder to own in search.',
         bg='#121316', panel='#1b1d22', fg='#ecebe6', muted='#9c9a92', accent='#f2b53a', secondary='#5fc4b8',
         ramp=['#4d4126', '#8a6d26', '#d39a2c', '#ffd77a'],
         display='Barlow Condensed', body='Public Sans', label='JetBrains Mono',
         wordmark='HEADCOUNT', wordfont='Barlow Condensed', wordweight=700, wordspacing=0.04,
         headline='Counting who is actually in the room.')


def a_mark(d, mono=False):
    ink = d['fg']
    slash = d['fg'] if mono else d['accent']
    s = ''
    for i, x in enumerate((4, 8.4, 12.8, 17.2)):
        if i < 2:
            s += rect(x, 3.5, 2.6, 17, ink, 1.3)
        else:
            s += rect(x + .5, 4, 1.6, 16, 'none', .8, stroke=ink, sw=1)
    s += f'<path d="M2 17.2 L22 7.6" stroke="{slash}" stroke-width="2.8" stroke-linecap="round"/>'
    return s


# --------------------------------------------------------------- B / Papered
B = dict(key='b-papered', name='Papered', title='B / Papered: the house that was papered',
         note='Theatre slang: to paper the house is to hand out free tickets so a show looks sold out. '
              'A ticket stub with a seat plan, some seats only outlined. Playbill paper, house red, Fraunces. '
              'The most memorable name and the most pointed; it implies someone did the papering.',
         bg='#f4efe6', panel='#fffdf8', fg='#1d1a1f', muted='#655e66', accent='#b3261e', secondary='#7a5c14',
         ramp=['#f0c4b6', '#cf6a52', '#b3261e', '#6b1410'],
         display='Fraunces', body='Public Sans', label='IBM Plex Mono',
         wordmark='Papered', wordfont='Fraunces', wordweight=700, wordspacing=-0.02,
         headline='Who papered the house this week?', hsize=44)


def b_mark(d, mono=False):
    stub = d['fg'] if mono else d['accent']
    hole = d['bg']
    s = (f'<path d="M2 5 H22 V10 A2 2 0 0 0 22 14 V19 H2 V14 A2 2 0 0 0 2 10 Z" fill="{stub}"/>'
         f'<path d="M16.5 6.5 V17.5" stroke="{hole}" stroke-width="1" stroke-dasharray="1.2 1.2"/>')
    seats = [(6, 9, 1), (9.5, 9, 0), (13, 9, 1), (6, 13.5, 0), (9.5, 13.5, 1), (13, 13.5, 0)]
    for x, y, real in seats:
        s += circle(x, y, 1.45, hole) if real else circle(x, y, 1.05, 'none', hole, .9)
    return s


# ---------------------------------------------------------- C / Sus Quotient
C = dict(key='c-sus-quotient', name='Sus Quotient', title='C / Sus Quotient: the gauge',
         note='Keeps the working name and makes the score the logo: a 0 to 100 gauge with the top band marked and the needle in it. '
              'Instrument black, flag coral, cyan for the chatter line, Space Grotesk. "Sus" is native to the audience '
              'and reads as a joke; the score has to carry the seriousness.',
         bg='#0f1115', panel='#171a20', fg='#e9edf2', muted='#99a1ad', accent='#ff6b5a', secondary='#5ccfe6',
         ramp=['#4a2c2b', '#b04a40', '#ef6a5b', '#ffb3a8'],
         display='Space Grotesk', body='Inter', label='JetBrains Mono',
         wordmark='sus quotient', wordfont='Space Grotesk', wordweight=700, wordspacing=-0.03,
         headline='How sus is that viewer count?')


def _arc_pt(t, r=9, cx=12, cy=16):
    return cx - r * math.cos(t), cy - r * math.sin(t)


def c_mark(d, mono=False):
    track = d['fg'] if mono else d['muted']
    hot = d['fg'] if mono else d['accent']
    x0, y0 = _arc_pt(0)
    x1, y1 = _arc_pt(.68 * math.pi)
    x2, y2 = _arc_pt(math.pi)
    s = (f'<path d="M{x0:.2f} {y0:.2f} A9 9 0 0 1 {x1:.2f} {y1:.2f}" fill="none" stroke="{track}" stroke-width="2.6" stroke-linecap="round" opacity="{1 if mono else .55}"/>'
         f'<path d="M{x1:.2f} {y1:.2f} A9 9 0 0 1 {x2:.2f} {y2:.2f}" fill="none" stroke="{hot}" stroke-width="2.6" stroke-linecap="round"/>')
    nx, ny = _arc_pt(.84 * math.pi, 7.2)
    s += f'<path d="M12 16 L{nx:.2f} {ny:.2f}" stroke="{d["fg"]}" stroke-width="2" stroke-linecap="round"/>' + circle(12, 16, 2.1, d['fg'])
    s += rect(3, 20, 18, 1.6, track, .8, 1 if mono else .55)
    return s


# ------------------------------------------------------------ D / Ghostcount
D = dict(key='d-ghostcount', name='Ghostcount', title='D / Ghostcount: the crowd with holes in it',
         note='A crowd as a dot grid; some dots are rings, viewers with nobody there. Dusk plum, ectoplasm lime, '
              'Inter Tight and IBM Plex Mono. Playful without saying "bot" or "sus", and unused as a product name in '
              'our search. Ghost viewer is already Twitch slang for a silent viewer.',
         bg='#16131c', panel='#1f1b27', fg='#ece8f2', muted='#a39cb0', accent='#c6f16b', secondary='#8fb8ff',
         ramp=['#3a4523', '#677f2b', '#a3cf43', '#dcff8f'],
         display='Inter Tight', body='Inter', label='IBM Plex Mono',
         wordmark='ghostcount', wordfont='Inter Tight', wordweight=700, wordspacing=-0.03,
         headline='The crowd, minus the ghosts.')
GHOSTS = {(0, 2), (1, 0), (1, 3), (2, 1), (3, 2), (3, 3)}


def d_mark(d, mono=False):
    s = ''
    ring = d['fg'] if mono else d['accent']
    for r in range(4):
        for c in range(4):
            x, y = 4.5 + c * 5, 4.5 + r * 5
            s += circle(x, y, 1.45, 'none', ring, 1.1) if (r, c) in GHOSTS else circle(x, y, 2, d['fg'])
    return s


DIRECTIONS = [(A, a_mark), (B, b_mark), (C, c_mark), (D, d_mark)]


def wordmark(d, x, baseline, size, color):
    return text(x, baseline, d['wordmark'], size, color, d['wordfont'], d['wordweight'], spacing=size * d['wordspacing'])


def name_color(d):
    return d['fg'] if d['key'] in ('b-papered', 'c-sus-quotient') else d['accent']


def lockup(d, mark, w=600):
    size = 64 if len(d['wordmark']) > 10 else 74
    return g(mark(d), 16, 16, 96) + wordmark(d, 132, 90, size, name_color(d))


# Viewers versus chatters: the viewer line climbs, chatters stay flat. Shared sample shape.
VIEWERS = [.30, .32, .31, .34, .36, .35, .52, .71, .86, .92, .95, .93, .96, .94, .97]
CHATTERS = [.20, .22, .21, .23, .24, .23, .25, .24, .26, .25, .24, .26, .25, .24, .25]
QBARS = [0, 0, 0, 1, 0, 1, 2, 3, 3, 3, 3, 2, 3, 3, 3]


def chart(d, x, y, w, h, legend=True):
    step = w / (len(VIEWERS) - 1)
    out = ''
    for i in range(5):
        gy = y + h * i / 4
        out += f'<path d="M{x} {gy:.1f}H{x + w}" stroke="{d["muted"]}" stroke-opacity=".18" stroke-width="1"/>'
    for series, col, wid in ((VIEWERS, d['fg'], 3), (CHATTERS, d['secondary'], 3)):
        pts = ' '.join(f'{x + i * step:.1f},{y + h - v * h:.1f}' for i, v in enumerate(series))
        out += f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="{wid}" stroke-linejoin="round" stroke-linecap="round"/>'
    bw = step * .7
    for i, q in enumerate(QBARS):
        out += rect(x + i * step - bw / 2, y + h + 14, bw, 12, d['ramp'][q], 2)
    if legend:
        out += rect(x, y - 30, 18, 4, d['fg'], 2) + text(x + 26, y - 23, 'VIEWERS', 13, d['muted'], d['label'])
        out += rect(x + 130, y - 30, 18, 4, d['secondary'], 2) + text(x + 156, y - 23, 'CHATTERS', 13, d['muted'], d['label'])
    return out


def banner(d, mark):
    s = rect(0, 0, 1500, 500, d['bg']) + g(mark(d), 72, 64, 104) + wordmark(d, 196, 140, 76, name_color(d))
    s += text(72, 268, d['headline'], d.get('hsize', 52), d['fg'], d['display'], 700)
    s += text(72, 314, SUPPORT[0], 22, d['muted'], d['body']) + text(72, 344, SUPPORT[1], 22, d['muted'], d['body'])
    s += rect(900, 56, 528, 300, d['panel'], 6) + chart(d, 930, 112, 468, 180)
    s += text(1428, 470, TAG, 18, d['muted'], d['label'], anchor='end')
    s += text(72, 470, 'SAMPLE LAYOUT / NOT FOR PUBLICATION', 14, d['muted'], d['label'])
    return s


ROWS = [(14, 3, 88, .92), (11, 2, 74, .55), (16, 2, 61, .70), (9, 1, 44, .38), (13, 1, 27, .81), (10, 0, 18, .30), (15, 0, 9, .64), (8, 0, 4, .45)]


def dashboard(d, mark):
    W, H = 1440, 900
    s = rect(0, 0, W, H, d['bg'])
    s += rect(0, 0, W, 64, d['panel']) + f'<path d="M0 64H{W}" stroke="{d["muted"]}" stroke-opacity=".25"/>'
    s += g(mark(d), 28, 16, 32) + wordmark(d, 72, 42, 26 if len(d['wordmark']) > 10 else 28, name_color(d))
    nx = 330
    for i, label in enumerate(('LIVE', 'CHANNELS', 'CATEGORIES', 'SHARED BOTS', 'METHOD')):
        s += text(nx, 38, label, 13, d['fg'] if i == 0 else d['muted'], d['label'], 700 if i == 0 else 400)
        if i == 0:
            s += rect(nx, 50, 36, 3, d['accent'], 1.5)
        nx += len(label) * 9 + 34
    s += rect(1100, 16, 312, 32, d['bg'], 6, stroke=d['muted'], sw=1) + text(1114, 37, 'Search channels or categories', 13, d['muted'], d['body'])
    s += text(1398, 37, '/', 13, d['muted'], d['label'], anchor='end')
    s += text(40, 124, 'Live now', 34, d['fg'], d['display'], 700)
    s += text(40, 152, 'Top 200 Twitch channels, scored every minute. Sample data.', 15, d['muted'], d['body'])
    tiles = [('CHANNELS LIVE', '186'), ('STREAMS SCORED', '644'), ('QUOTIENT 50+', '4'), ('SHARED BOT ACCOUNTS', '312')]
    for i, (lab, val) in enumerate(tiles):
        tx = 40 + i * 345
        s += rect(tx, 180, 325, 108, d['panel'], 6)
        s += text(tx + 20, 210, lab, 12, d['muted'], d['label'])
        s += text(tx + 20, 266, val, 46, d['accent'] if i == 2 else d['fg'], d['display'], 700)
    s += rect(40, 308, 840, 560, d['panel'], 6) + text(64, 344, 'Viewers against chatters', 18, d['fg'], d['display'], 700)
    s += chart(d, 64, 400, 790, 380)
    s += text(64, 836, 'QUOTIENT BY HOUR', 12, d['muted'], d['label'])
    for i, lab in enumerate(('0-24', '25-49', '50-74', '75+')):
        s += rect(300 + i * 110, 826, 16, 12, d['ramp'][i], 2) + text(322 + i * 110, 837, lab, 12, d['muted'], d['label'])
    s += rect(900, 308, 500, 560, d['panel'], 6) + text(924, 344, 'Highest quotient', 18, d['fg'], d['display'], 700)
    s += text(924, 380, 'CHANNEL', 12, d['muted'], d['label']) + text(1376, 380, 'QUOTIENT', 12, d['muted'], d['label'], anchor='end')
    for i, (nw, q, val, vw) in enumerate(ROWS):
        ry = 404 + i * 56
        s += f'<path d="M924 {ry - 14}H1376" stroke="{d["muted"]}" stroke-opacity=".18"/>'
        s += text(924, ry + 16, f'{i + 1:02d}', 13, d['muted'], d['label'])
        s += rect(960, ry + 4, nw * 12, 14, d['fg'], 7, .85) + rect(960, ry + 26, vw * 150, 6, d['muted'], 3, .45)
        s += rect(1268, ry + 2, 62, 20, d['ramp'][q], 4)
        s += text(1376, ry + 18, str(val), 18, d['fg'], d['label'], 700, anchor='end')
    return s


def main():
    cards, record = [], []
    for d, mark in DIRECTIONS:
        k = d['key']
        write(f'{k}/logos/mark-primary', 128, 128, rect(0, 0, 128, 128, d['bg']) + g(mark(d), 16, 16, 96), d['name'] + ' mark', 512)
        write(f'{k}/logos/mark-mono', 128, 128, g(mark(d, True), 16, 16, 96), d['name'] + ' mono mark', 512)
        write(f'{k}/logos/mark-16', 16, 16, rect(0, 0, 16, 16, d['bg']) + g(mark(d), 1, 1, 14), d['name'] + ' favicon check', 64)
        write(f'{k}/logos/lockup-primary', 600, 128, rect(0, 0, 600, 128, d['bg']) + lockup(d, mark), d['name'] + ' lockup', 1200)
        write(f'{k}/social/banner-x-bluesky', 1500, 500, banner(d, mark), d['name'] + ' banner')
        write(f'{k}/social/avatar', 512, 512, rect(0, 0, 512, 512, d['bg']) + g(mark(d), 64, 64, 384), d['name'] + ' avatar')
        write(f'{k}/product/dashboard', 1440, 900, dashboard(d, mark), d['name'] + ' dashboard screen')
        bg = d['panel']
        record.append({'key': k, 'name': d['name'], 'title': d['title'],
                       'colors': {n: d[n] for n in ('bg', 'panel', 'fg', 'accent', 'secondary', 'muted')}, 'quotient_ramp': d['ramp'],
                       'fonts': {'display': d['display'], 'body': d['body'], 'label': d['label'], 'wordmark': d['wordfont']},
                       'contrast': {'text': contrast(d['fg'], d['bg']), 'accent': contrast(d['accent'], d['bg']),
                                    'secondary': contrast(d['secondary'], d['bg']), 'muted': contrast(d['muted'], d['bg']),
                                    'muted_on_panel': contrast(d['muted'], bg),
                                    'ramp_vs_panel': [contrast(c, bg) for c in d['ramp']]}})
        cards.append((d, mark))
    sheet = rect(0, 0, 1800, 2700, '#efece6') + text(48, 56, 'SUS QUOTIENT / FOUR NAMES AND DIRECTIONS / OCTOBER 19, 2026', 18, '#17131d', 'JetBrains Mono')
    for i, (d, mark) in enumerate(cards):
        y = 100 + i * 640
        sheet += text(48, y + 28, d['title'], 30, '#17131d', 'Space Grotesk', 700)
        sheet += embed(HERE / f'{d["key"]}/logos/mark-primary.svg', 48, y + 50, 160, 160)
        sheet += embed(HERE / f'{d["key"]}/logos/lockup-primary.svg', 48, y + 230, 450, 96)
        sheet += embed(HERE / f'{d["key"]}/social/banner-x-bluesky.svg', 48, y + 350, 600, 200)
        sheet += embed(HERE / f'{d["key"]}/product/dashboard.svg', 760, y + 50, 960, 600)
        for j, line in enumerate([f'{d["display"]} / {d["body"]} / {d["label"]}', f'{d["bg"]} {d["fg"]} {d["accent"]} {d["secondary"]}', 'ramp ' + ' '.join(d['ramp'])]):
            sheet += text(240, y + 90 + j * 24, line, 14, '#5d5664', 'JetBrains Mono')
    write('comparison', 1800, 2700, sheet, 'Sus quotient direction comparison')
    page = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Sus quotient: names and directions</title><style>body{margin:0;background:#efece6;color:#17131d;font:16px/1.5 system-ui}header,footer,section{padding:16px 32px}'
            'a{color:#56308e}img{width:100%;display:block}article{border-top:2px solid #17131d;padding:12px 32px 32px}'
            '.row{display:grid;grid-template-columns:1fr 2fr 4fr;gap:16px;align-items:start}.note{color:#5d5664;max-width:70ch}'
            'table{font-size:14px;border-collapse:collapse}td,th{padding:4px 12px 4px 0;text-align:left;vertical-align:top}.sw{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:middle;margin-right:4px}'
            '</style></head><body><header><h1>Sus quotient: four names and directions</h1>'
            '<p>Candidates for naming and branding the Twitch bot-signal dashboard. Each pairs a name with a mark, palette, type and the colour ramp the charts use for the quotient. '
            'Marks are original; channel names in the artwork are bars; numbers and headlines are sample copy. Nothing here is approved for publication. '
            '<a href="comparison.png">Open the comparison sheet</a>.</p></header>'
            '<section><h2>Other names considered</h2><table><tr><th>Name</th><th>Why not a lead</th></tr>'
            '<tr><td>Recount</td><td>Clear meaning, but reads as elections first.</td></tr>'
            '<tr><td>Clicker</td><td>Same door-tally idea as Headcount, more generic.</td></tr>'
            '<tr><td>Lurkmeter</td><td>Lurkers are real viewers; the name points at the wrong people.</td></tr>'
            '<tr><td>Turnstile</td><td>Cloudflare\'s bot check already uses it.</td></tr></table>'
            '<p class="note">Whatever the product is called, the score can stay the sus quotient. It names one number on the page, the way a credit report names a score.</p></section>']
    for d, _ in cards:
        k = d['key']
        c = next(r for r in record if r['key'] == k)['contrast']
        ramp = ''.join(f'<span class="sw" style="background:{x}"></span>' for x in d['ramp'])
        page.append(f'<article><h2>{html.escape(d["title"])}</h2><p class="note">{html.escape(d["note"])}</p>'
                    f'<div class="row"><img src="{k}/logos/mark-primary.png" alt="{html.escape(d["name"])} mark">'
                    f'<div><img src="{k}/logos/lockup-primary.png" alt="{html.escape(d["name"])} lockup"><br><img src="{k}/social/avatar.png" alt="{html.escape(d["name"])} avatar" style="width:40%"></div>'
                    f'<img src="{k}/product/dashboard.png" alt="{html.escape(d["name"])} dashboard screen"></div><br>'
                    f'<img src="{k}/social/banner-x-bluesky.png" alt="{html.escape(d["name"])} banner"><br>'
                    f'<table><tr><td>Canvas</td><td>{d["bg"]} / panel {d["panel"]}</td><td>Text</td><td>{d["fg"]} ({c["text"]}:1)</td></tr>'
                    f'<tr><td>Accent</td><td>{d["accent"]} ({c["accent"]}:1)</td><td>Chatter line</td><td>{d["secondary"]} ({c["secondary"]}:1)</td></tr>'
                    f'<tr><td>Muted</td><td>{d["muted"]} ({c["muted"]}:1, {c["muted_on_panel"]}:1 on panel)</td><td>Quotient ramp</td><td>{ramp} vs panel {", ".join(str(x) for x in c["ramp_vs_panel"])}</td></tr>'
                    f'<tr><td>Type</td><td colspan="3">{html.escape(d["display"])} display, {html.escape(d["body"])} body, {html.escape(d["label"])} labels and numbers</td></tr></table></article>')
    page.append('<footer><p>Generated by <code>sus_quotient_directions.py</code>. Ordinary text needs 4.5:1, large text and chart marks 3:1. '
                'The lowest ramp step is a background tint for low scores, not a mark that has to be found.</p></footer></body></html>\n')
    (HERE / 'index.html').write_text(''.join(page))
    files = [{'path': str(p.relative_to(HERE)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
             for p in sorted(HERE.rglob('*')) if p.is_file() and p.name != 'manifest.json' and not p.name.endswith('.pyc')]
    (HERE / 'manifest.json').write_text(json.dumps({'study': 'sus-quotient-directions', 'date': '2026-10-19', 'status': 'proposed; no direction selected',
                                                     'directions': record, 'files': files}, indent=2) + '\n')
    print('Built', len(files), 'files for four sus quotient directions.')


if __name__ == '__main__':
    main()
