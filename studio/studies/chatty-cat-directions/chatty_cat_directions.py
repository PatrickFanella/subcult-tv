"""Chatty Cat direction comparison (October 11, 2026).

Builds four candidate identities for the rename of Chat Thing to Chatty Cat into
chatty-cat-directions/: mark (primary and mono), lockup, banner, square post and
avatar per direction, plus comparison.png and index.html. All marks are original
geometry drawn here. Rows in the artwork are bars, not words. Headlines are sample
copy. Needs rsvg-convert and fontconfig with the Studio fonts (run on Kvant).
"""
from pathlib import Path
import base64, html, json, os, subprocess, hashlib
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
TOOLS = HERE.parents[1] / 'brand-tools'
os.environ['FONTCONFIG_FILE'] = str(TOOLS / 'fontconfig.xml')
TAG = 'SELF-HOSTED TWITCH CHAT / BY SUBCULT'


def svg(w, h, body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" '
            f'aria-label="{html.escape(label)}"><title>{html.escape(label)}</title>{body}</svg>\n')


def rect(x, y, w, h, fill, rx=0, op=None):
    o = f' opacity="{op}"' if op is not None else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{o}/>'


def text(x, y, s, size, fill, font, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing}"' if spacing else ''
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


# Shared merged-log motif: timestamp, coloured name block, text bars. Bars, not words.
PATTERN = [(3, 16, 11), (5, 11, 7), (2, 18, 0), (4, 9, 13), (6, 14, 5), (3, 7, 0), (5, 17, 9), (2, 12, 6)]


def log_block(d, x, y, width, rows, row_h=26, live=True):
    names = [d['accent'], d['secondary'], d['third'], d['accent'], d['secondary'], d['third']]
    out = []
    unit = width / 40
    h = row_h * .42
    for i in range(rows):
        nu, tu, eu = PATTERN[i % len(PATTERN)]
        ry = y + i * row_h
        out.append(rect(x, ry, unit * 3, h, d['fg'], h / 2, .35))
        nx = x + unit * 4
        out.append(rect(nx, ry, unit * nu, h, names[i % len(names)], h / 2))
        tx = nx + unit * (nu + 1)
        out.append(rect(tx, ry, unit * tu, h, d['fg'], h / 2, .8))
        if eu:
            out.append(rect(tx + unit * (tu + 1), ry, unit * eu, h, d['fg'], h / 2, .45))
    if live:
        out.append(rect(x + width - unit * 2.5, y + (rows - 1) * row_h, unit * 2.5, h, d['secondary'], 2))
    return ''.join(out)


# ------------------------------------------------------------------ A / Log cat
A = dict(key='a-log-cat', title='A / Log cat: the merged log with ears',
         note='The current Chat Thing direction carried over. The log tile grows two ears; everything else stays: '
              'shell black, amber names, the green live block, Atkinson Hyperlegible Next and Mono.',
         bg='#151519', panel='#1d2229', tile='#2a3039', fg='#e8e6e3', muted='#aaa4b7', accent='#e8a33d', secondary='#35d07f', third='#5a9fe8',
         display='Atkinson Hyperlegible Next', body='Atkinson Hyperlegible Next', label='Atkinson Hyperlegible Mono',
         wordmark='chatty cat', wordfont='Atkinson Hyperlegible Mono', wordweight=700, wordspacing=-0.02,
         headline=['All six channels', 'in one scrollback.'], support='Self-hosted Twitch chat, with your display settings.')


def a_mark(d, mono=False):
    tile = d['fg'] if mono else d['tile']
    ink = d['bg'] if mono else d['fg']
    name = d['bg'] if mono else d['accent']
    live = d['bg'] if mono else d['secondary']
    s = f'<path d="M4 7 L4.5 1.2 L9.5 5.5 H14.5 L19.5 1.2 L20 7 Z" fill="{tile}"/>' + rect(0, 5, 24, 19, tile, 4.5)
    rows = [(8.8, 4, 10.5), (13.2, 6, 8.5), (17.6, 3, 5.5)]
    for y, nw, tw in rows:
        s += rect(4, y, nw, 3, name, .75) + rect(4 + nw + 1.5, y, tw, 3, ink, .75)
    s += rect(15.5, 17.6, 4.5, 3, live, .75)
    return s


# ------------------------------------------------------------- B / Pixel cat
B = dict(key='b-pixel-cat', title='B / Pixel cat: console phosphor',
         note='An eight-bit cat face with a cursor for a mouth, from the mirc and phosphor presets the app ships. '
              'Console black, phosphor green, amber cursor, Cascadia Mono.',
         bg='#0b0f0c', panel='#121a14', fg='#cfeedd', muted='#7ea38c', accent='#7dff9a', secondary='#e8a33d', third='#8fb3f0',
         display='Cascadia Mono', body='Public Sans', label='Cascadia Mono',
         wordmark='chatty_cat', wordfont='Cascadia Mono', wordweight=700, wordspacing=-0.01,
         headline=['six channels.', 'one scrollback.'], support='self-hosted twitch chat. your palette, your font, your line height.')
PIX = ['.#........#.', '.##......##.', '.###....###.', '.##########.', '.##########.', '.#..####..#.',
       '.##########.', '.####..####.', '..########..', '...######...']


def b_mark(d, mono=False):
    face = d['fg'] if mono else d['accent']
    cursor = d['fg'] if mono else d['secondary']
    s = ''
    for r, row in enumerate(PIX):
        for c, ch in enumerate(row):
            if ch == '#':
                s += rect(c * 2, 2 + r * 2, 2.02, 2.02, face)
    s += rect(10, 16, 4, 2.02, cursor)
    return s


# ---------------------------------------------------------- C / Bubble cat
C = dict(key='c-bubble-cat', title='C / Bubble cat: the speech bubble is the head',
         note='A speech bubble with ears and a tail, two dot eyes. Paper and ink from the cream preset, amber and '
              'VIP pink as accents, Alegreya Sans for warmth. The one light-canvas candidate.',
         bg='#f3eee6', panel='#ffffff', fg='#1e1a22', muted='#665d70', accent='#b7791a', secondary='#c2255c', third='#3368b0',
         display='Alegreya Sans', body='Public Sans', label='JetBrains Mono',
         wordmark='chatty cat', wordfont='Alegreya Sans', wordweight=700, wordspacing=-0.01,
         headline=['Six channels,', 'one scrollback.'], support='Self-hosted Twitch chat that keeps your settings.')


def c_mark(d, mono=False):
    ink = d['fg']
    eye = d['bg']
    s = (f'<path d="M3.5 5.5 L4.5 0.8 L9 4.6 H15 L19.5 0.8 L20.5 5.5 Z" fill="{ink}"/>' + rect(2, 4, 20, 15, ink, 4.5)
         + f'<path d="M5.5 18.5 L4 23.5 L10 18.5 Z" fill="{ink}"/>')
    s += f'<circle cx="9" cy="11.5" r="1.6" fill="{eye}"/><circle cx="15" cy="11.5" r="1.6" fill="{eye}"/>'
    if not mono:
        s += rect(10.6, 14.6, 2.8, 1.4, d['accent'], .7)
    return s


# ------------------------------------------------------------ D / Whiskers
D = dict(key='d-whiskers', title='D / Whiskers: chat rows as whiskers',
         note='Ears, two eyes, an amber nose, and six whiskers that are chat rows of different lengths. '
              'Night blue, lavender and amber, Fraunces for the wordmark.',
         bg='#1b1d2b', panel='#242738', fg='#ece9f4', muted='#a39fb8', accent='#b9a5f0', secondary='#e8a33d', third='#5fd98a',
         display='Fraunces', body='Inter', label='IBM Plex Mono',
         wordmark='chatty cat', wordfont='Fraunces', wordweight=700, wordspacing=-0.02,
         headline=['All six channels.', 'One scrollback.'], support='Self-hosted Twitch chat, your display settings kept.')


def d_mark(d, mono=False):
    ink = d['fg']
    ear = d['fg'] if mono else d['accent']
    nose = d['fg'] if mono else d['secondary']
    s = f'<path d="M5 7.5 L6 1.5 L10.5 5.5 Z" fill="{ear}"/><path d="M19 7.5 L18 1.5 L13.5 5.5 Z" fill="{ear}"/>'
    s += f'<circle cx="8.5" cy="8.5" r="1.5" fill="{ink}"/><circle cx="15.5" cy="8.5" r="1.5" fill="{ink}"/>'
    s += f'<path d="M10.4 11.2 H13.6 L12 13.4 Z" fill="{nose}"/>'
    for y, lw, rw in [(12.4, 7, 7), (15.0, 8.5, 8.5), (17.6, 6, 6)]:
        s += rect(9.5 - lw, y, lw, 1.7, ink, .85) + rect(14.5, y, rw, 1.7, ink, .85)
    return s


DIRECTIONS = [(A, a_mark), (B, b_mark), (C, c_mark), (D, d_mark)]


def wordmark(d, x, baseline, size, color):
    return text(x, baseline, d['wordmark'], size, color, d['wordfont'], d['wordweight'], spacing=size * d['wordspacing'])


def lockup(d, mark):
    return g(mark(d), 16, 16, 96) + wordmark(d, 136, 94, 74, d['accent'] if d['key'] != 'c-bubble-cat' else d['fg'])


def sparkline(d, x, y, w, h):
    vals = [.2, .35, .3, .5, .42, .7, .55, .62, .9, .7, .78, .6, .85, 1.0, .74]
    step = w / (len(vals) - 1)
    pts = ' '.join(f'{x + i * step:.1f},{y + h - v * h:.1f}' for i, v in enumerate(vals))
    return (f'<polygon points="{x},{y + h} {pts} {x + w},{y + h}" fill="{d["secondary"]}" opacity=".12"/>'
            f'<polyline points="{pts}" fill="none" stroke="{d["secondary"]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>')


def banner(d, mark):
    namecol = d['fg'] if d['key'] == 'c-bubble-cat' else d['accent']
    s = rect(0, 0, 1500, 500, d['bg']) + g(mark(d), 72, 76, 120) + wordmark(d, 216, 168, 86, namecol)
    s += text(72, 268, d['headline'][0], 56, d['fg'], d['display'], 700) + text(72, 330, d['headline'][1], 56, d['fg'], d['display'], 700)
    s += text(72, 372, d['support'], 23, d['muted'], d['body'])
    s += rect(900, 64, 528, 300, d['panel'], 6) + log_block(d, 920, 86, 488, 10, 27)
    s += sparkline(d, 72, 400, 1356, 50) + text(1428, 476, TAG, 18, d['muted'], d['label'], anchor='end')
    return s


def post(d, mark):
    namecol = d['fg'] if d['key'] == 'c-bubble-cat' else d['accent']
    s = rect(0, 0, 1080, 1080, d['bg']) + g(mark(d), 64, 64, 96) + wordmark(d, 176, 136, 64, namecol)
    s += text(64, 330, d['headline'][0], 84, d['fg'], d['display'], 700) + text(64, 424, d['headline'][1], 84, d['fg'], d['display'], 700)
    s += text(64, 490, d['support'], 26, d['muted'], d['body'])
    s += rect(64, 540, 952, 230, d['panel'], 6) + log_block(d, 84, 562, 912, 7, 28)
    s += sparkline(d, 64, 820, 952, 56) + text(64, 966, 'SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION', 16, d['muted'], d['label'])
    s += f'<path d="M64 996H1016" stroke="{d["muted"]}" stroke-opacity=".4" stroke-width="2"/>'
    s += text(64, 1034, 'CHAT.SUBCULT.TV', 18, d['muted'], d['label']) + text(1016, 1034, TAG, 18, d['muted'], d['label'], anchor='end')
    return s


def main():
    cards = []
    record = []
    for d, mark in DIRECTIONS:
        k = d['key']
        write(f'{k}/logos/mark-primary', 128, 128, rect(0, 0, 128, 128, d['bg']) + g(mark(d), 16, 16, 96), d['title'] + ' mark', 512)
        write(f'{k}/logos/mark-mono', 128, 128, g(mark(d, True), 16, 16, 96), d['title'] + ' mono mark', 512)
        write(f'{k}/logos/lockup-primary', 600, 128, rect(0, 0, 600, 128, d['bg']) + lockup(d, mark), d['title'] + ' lockup', 1200)
        write(f'{k}/social/banner-x-bluesky', 1500, 500, banner(d, mark), d['title'] + ' banner')
        write(f'{k}/social/square-post', 1080, 1080, post(d, mark), d['title'] + ' square post')
        write(f'{k}/social/avatar', 512, 512, rect(0, 0, 512, 512, d['bg']) + g(mark(d), 64, 64, 384), d['title'] + ' avatar')
        record.append({'key': k, 'title': d['title'], 'colors': {n: d[n] for n in ('bg', 'fg', 'accent', 'secondary', 'third', 'muted')},
                       'fonts': {'display': d['display'], 'body': d['body'], 'label': d['label'], 'wordmark': d['wordfont']},
                       'contrast': {'text': contrast(d['fg'], d['bg']), 'accent': contrast(d['accent'], d['bg']), 'secondary': contrast(d['secondary'], d['bg']), 'muted': contrast(d['muted'], d['bg'])}})
        cards.append((d, mark))
    # Comparison sheet: one row per direction with mark, lockup, banner and square post.
    sheet = rect(0, 0, 1800, 2440, '#f0ece4') + text(48, 56, 'CHATTY CAT / FOUR DIRECTIONS / OCTOBER 11, 2026', 18, '#17131d', 'JetBrains Mono')
    for i, (d, mark) in enumerate(cards):
        y = 100 + i * 580
        sheet += text(48, y + 28, d['title'], 30, '#17131d', 'Space Grotesk', 700)
        sheet += embed(HERE / f'{d["key"]}/logos/mark-primary.svg', 48, y + 50, 180, 180)
        sheet += embed(HERE / f'{d["key"]}/logos/lockup-primary.svg', 300, y + 50, 560, 119)
        sheet += embed(HERE / f'{d["key"]}/social/banner-x-bluesky.svg', 300, y + 190, 900, 300)
        sheet += embed(HERE / f'{d["key"]}/social/square-post.svg', 1236, y + 50, 516, 516)
        for j, line in enumerate([d['display'], d['body'] + ' / ' + d['label'], d['bg'] + ' ' + d['fg'], d['accent'] + ' ' + d['secondary']]):
            sheet += text(48, y + 262 + j * 22, line, 13, '#62576b', 'JetBrains Mono')
    write('comparison', 1800, 2440, sheet, 'Chatty Cat direction comparison')
    page = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Chatty Cat directions</title><style>body{margin:0;background:#f0ece4;color:#17131d;font:16px/1.5 system-ui}header,footer{padding:24px 32px}'
            'a{color:#56308e}img{width:100%;display:block;background:#fff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:32px;padding:0 32px 32px}'
            'article{border-top:2px solid #17131d;padding-top:12px}.row{display:grid;grid-template-columns:1fr 3fr;gap:12px;align-items:start}.note{color:#62576b;font-size:14px}'
            'table{font-size:13px;border-collapse:collapse}td{padding:2px 8px 2px 0}</style></head><body><header><h1>Chatty Cat: four directions</h1>'
            '<p>Candidates for renaming Chat Thing to Chatty Cat. Each shows the mark, lockup, banner and square post. Marks are original; chat rows are bars; headlines are sample copy. '
            'Nothing here is approved for a profile or a post. <a href="comparison.png">Open the comparison sheet</a>.</p></header><div class="grid">']
    for d, _ in cards:
        k = d['key']
        c = next(r for r in record if r['key'] == k)['contrast']
        page.append(f'<article><h2>{html.escape(d["title"])}</h2><p class="note">{html.escape(d["note"])}</p>'
                    f'<div class="row"><img src="{k}/logos/mark-primary.png" alt="{html.escape(d["title"])} mark"><img src="{k}/logos/lockup-primary.png" alt="{html.escape(d["title"])} lockup"></div>'
                    f'<img src="{k}/social/banner-x-bluesky.png" alt="{html.escape(d["title"])} banner"><img src="{k}/social/square-post.png" alt="{html.escape(d["title"])} square post">'
                    f'<table><tr><td>Canvas</td><td>{d["bg"]}</td><td>Text</td><td>{d["fg"]} ({c["text"]}:1)</td></tr>'
                    f'<tr><td>Accent</td><td>{d["accent"]} ({c["accent"]}:1)</td><td>Secondary</td><td>{d["secondary"]} ({c["secondary"]}:1)</td></tr>'
                    f'<tr><td>Display</td><td>{html.escape(d["display"])}</td><td>Body / label</td><td>{html.escape(d["body"])} / {html.escape(d["label"])}</td></tr></table></article>')
    page.append('</div><footer><p>Generated by <code>chatty_cat_directions.py</code>. Ordinary text needs 4.5:1; large text 3:1. On C the amber is for artwork and large type only.</p></footer></body></html>\n')
    (HERE / 'index.html').write_text(''.join(page))
    files = [{'path': str(p.relative_to(HERE)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
             for p in sorted(HERE.rglob('*')) if p.is_file() and p.name not in ('manifest.json',) and not p.name.endswith('.pyc')]
    (HERE / 'manifest.json').write_text(json.dumps({'study': 'chatty-cat-directions', 'date': '2026-10-11', 'status': 'proposed; no direction selected',
                                                     'directions': record, 'files': files}, indent=2) + '\n')
    print('Built', len(files), 'files for four Chatty Cat directions.')


if __name__ == '__main__':
    main()
