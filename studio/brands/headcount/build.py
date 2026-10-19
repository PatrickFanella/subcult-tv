"""Headcount brand pack generator (October 19, 2026).

Builds the Headcount pack from brand.json: marks and lockups in dark, light and
monochrome; web icons and the link preview; social and video layouts; tokens in
JSON and CSS for both themes; fonts with licenses; and the hash-bound manifest.
Channel names in layouts are bars, and numbers and headlines are sample copy.

    python3 build.py                       # rebuild the pack
    python3 build.py --export DIR          # also copy the product's web assets to DIR
    python3 build.py --product-root REPO   # refresh design-system/ from the product first

Needs rsvg-convert, Inkscape (outlined lockups), fontconfig with the Studio fonts,
Pillow and fontTools (WOFF2 export). Run on Kvant.
"""
from pathlib import Path
import argparse, base64, hashlib, html, json, os, shutil, subprocess, sys
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parents[1]
TOOLS = STUDIO / 'brand-tools'
os.environ['FONTCONFIG_FILE'] = str(TOOLS / 'fontconfig.xml')
B = json.loads((HERE / 'brand.json').read_text())
DARK, LIGHT = B['themes']['dark'], B['themes']['light']
F = B['fonts']


# ------------------------------------------------------------------ helpers
def svg(w, h, body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" '
            f'aria-label="{html.escape(label)}"><title>{html.escape(label)}</title>{body}</svg>\n')


def rect(x, y, w, h, fill, rx=0, op=None, stroke=None, sw=0):
    o = f' opacity="{op}"' if op is not None else ''
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{rx:g}" fill="{fill}"{o}{s}/>'


def text(x, y, s, size, fill, font, weight=400, anchor='start', spacing=0):
    sp = f' letter-spacing="{spacing:.2f}"' if spacing else ''
    return (f'<text x="{x:g}" y="{y:g}" font-family="{html.escape(font)}" font-weight="{weight}" font-size="{size:g}" '
            f'fill="{fill}" text-anchor="{anchor}"{sp}>{html.escape(s)}</text>')


def g(body, x, y, size):
    return f'<g transform="translate({x:g} {y:g}) scale({size / B["mark"]["unit"]:.6f})">{body}</g>'


def write(rel, w, h, body, label, export_w=None):
    p = HERE / (rel + '.svg')
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(svg(w, h, body, label))
    ET.parse(p)
    subprocess.run(['rsvg-convert', '-w', str(export_w or w), '-o', str(p.with_suffix('.png')), str(p)], check=True)
    return p


def outline(src):
    dst = src.with_name(src.stem + '-outlined.svg')
    subprocess.run(['inkscape', str(src), '--export-text-to-path', '--export-plain-svg', '-o', str(dst)],
                   check=True, capture_output=True)
    ET.parse(dst)
    return dst


def embed(path, x, y, w, h):
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{base64.b64encode(path.read_bytes()).decode()}"/>'


def contrast(a, b):
    def lum(c):
        v = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        v = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in v]
        return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]
    x, y = sorted([lum(a), lum(b)])
    return round((y + .05) / (x + .05), 2)


# ---------------------------------------------------------------- the mark
def glyph(ink, slash):
    """Four tally strokes, the last two hollow, and the fifth stroke as a slash."""
    m = B['mark']
    st, line = m['stroke'], m['hollow_line']
    s = ''
    for i, x in enumerate(m['strokes_x']):
        if i < m['solid']:
            s += rect(x, st['y'], st['w'], st['h'], ink, st['w'] / 2)
        else:
            h = line / 2
            s += rect(x + h, st['y'] + h, st['w'] - line, st['h'] - line, 'none', (st['w'] - line) / 2, stroke=ink, sw=line)
    (x1, y1), (x2, y2) = m['slash']['from'], m['slash']['to']
    s += f'<path d="M{x1:g} {y1:g} L{x2:g} {y2:g}" stroke="{slash}" stroke-width="{m["slash"]["width"]:g}" stroke-linecap="round"/>'
    return s


def glyph_small(ink, slash):
    """The 32px-and-under glyph: three wider strokes, the last hollow, so it survives a favicon grid."""
    m = B['small_mark']
    s = ''
    for i, x in enumerate(m['strokes_x']):
        if i < m['solid']:
            s += rect(x, m['y'], m['w'], m['h'], ink, 1)
        else:
            h = m['hollow_line'] / 2
            s += rect(x + h, m['y'] + h, m['w'] - m['hollow_line'], m['h'] - m['hollow_line'], 'none', .6, stroke=ink, sw=m['hollow_line'])
    (x1, y1), (x2, y2) = m['slash']['from'], m['slash']['to']
    return s + f'<path d="M{x1:g} {y1:g} L{x2:g} {y2:g}" stroke="{slash}" stroke-width="{m["slash"]["width"]:g}" stroke-linecap="round"/>'


def tile(size, theme, pad=None, small=False):
    pad = size / 8 if pad is None else pad
    mark = glyph_small if small else glyph
    return rect(0, 0, size, size, theme['bg'], size * 5 / 24) + g(mark(theme['fg'], theme['accent']), pad, pad, size - 2 * pad)


def word(t):
    """Amber wordmark on dark; ink on light, where amber text would fail contrast."""
    return t['wordmark']


def wordmark(x, baseline, size, color):
    return text(x, baseline, B['wordmark'], size, color, F['display'], 700, spacing=size * .04)


def lockup(theme, ink, slash, word, bg=True):
    s = rect(0, 0, 560, 128, theme['bg']) if bg else ''
    return s + g(glyph(ink, slash), 16, 16, 96) + wordmark(132, 94, 76, word)


# ------------------------------------------------------- shared chart motif
VIEWERS = [.30, .32, .31, .34, .36, .35, .52, .71, .86, .92, .95, .93, .96, .94, .97]
CHATTERS = [.20, .22, .21, .23, .24, .23, .25, .24, .26, .25, .24, .26, .25, .24, .25]
QBARS = [0, 0, 0, 1, 0, 1, 2, 3, 3, 3, 3, 2, 3, 3, 3]


def chart(t, x, y, w, h, legend=True, size=13):
    step = w / (len(VIEWERS) - 1)
    out = ''.join(f'<path d="M{x:g} {y + h * i / 4:.1f}H{x + w:g}" stroke="{t["line"]}" stroke-width="1"/>' for i in range(5))
    for series, col in ((VIEWERS, t['fg']), (CHATTERS, t['secondary'])):
        pts = ' '.join(f'{x + i * step:.1f},{y + h - v * h:.1f}' for i, v in enumerate(series))
        out += f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="{max(2, w / 260):.1f}" stroke-linejoin="round" stroke-linecap="round"/>'
    bw = step * .7
    for i, q in enumerate(QBARS):
        out += rect(x + i * step - bw / 2, y + h + h * .07, bw, h * .065, t['ramp'][q], 2)
    if legend:
        out += rect(x, y - size * 2.2, size * 1.4, 4, t['fg'], 2) + text(x + size * 2, y - size * 1.7, 'VIEWERS', size, t['muted'], F['label'])
        out += rect(x + size * 10, y - size * 2.2, size * 1.4, 4, t['secondary'], 2) + text(x + size * 12, y - size * 1.7, 'CHATTERS', size, t['muted'], F['label'])
    return out


def footer(t, w, y, sample=True):
    s = text(w - 72, y, B['tag'], 18, t['muted'], F['label'], anchor='end')
    if sample:
        s += text(72, y, 'SAMPLE LAYOUT / NOT FOR PUBLICATION', 14, t['muted'], F['label'])
    return s


def support(t, x, y, size, gap):
    return ''.join(text(x, y + i * gap, line, size, t['muted'], F['body']) for i, line in enumerate(B['support']))


# ----------------------------------------------------------------- layouts
def banner(t, w=1500, h=500):
    off = (h - 500) / 2
    s = rect(0, 0, w, h, t['bg']) + g(glyph(t['fg'], t['accent']), 72, 64 + off, 96) + wordmark(188, 140 + off, 76, word(t))
    s += text(72, 264 + off, B['headline'], 54, t['fg'], F['display'], 700)
    s += support(t, 72, 312 + off, 22, 30)
    s += rect(900, 56 + off, 528, 300, t['panel'], 6) + chart(t, 930, 112 + off, 468, 180)
    return s + footer(t, w, h - 30)


def square(t):
    s = rect(0, 0, 1080, 1080, t['bg']) + g(glyph(t['fg'], t['accent']), 72, 72, 80) + wordmark(168, 136, 64, word(t))
    s += text(72, 300, 'Counting who is', 88, t['fg'], F['display'], 700) + text(72, 392, 'actually in the room.', 88, t['fg'], F['display'], 700)
    s += support(t, 72, 456, 26, 36)
    s += rect(72, 560, 936, 380, t['panel'], 6) + chart(t, 108, 630, 864, 230, size=15)
    return s + f'<path d="M72 990H1008" stroke="{t["line"]}" stroke-width="2"/>' + footer(t, 1080, 1030)


def landscape(t):
    s = rect(0, 0, 1200, 675, t['bg']) + g(glyph(t['fg'], t['accent']), 64, 56, 64) + wordmark(140, 108, 52, word(t))
    s += text(64, 230, B['headline'], 50, t['fg'], F['display'], 700) + support(t, 64, 276, 21, 30)
    s += rect(64, 340, 1072, 250, t['panel'], 6) + chart(t, 92, 390, 1016, 140)
    return s + text(1136, 640, B['tag'], 16, t['muted'], F['label'], anchor='end') + text(64, 640, 'SAMPLE LAYOUT', 14, t['muted'], F['label'])


def story(t):
    s = rect(0, 0, 1080, 1920, t['bg']) + g(glyph(t['fg'], t['accent']), 80, 160, 112) + wordmark(212, 248, 88, word(t))
    for i, line in enumerate(('Counting who', 'is actually', 'in the room.')):
        s += text(80, 520 + i * 120, line, 124, t['fg'], F['display'], 700)
    s += support(t, 80, 860, 30, 42)
    s += rect(80, 1000, 920, 560, t['panel'], 6) + chart(t, 120, 1090, 840, 360, size=17)
    return s + text(80, 1780, 'SAMPLE LAYOUT', 18, t['muted'], F['label']) + text(1000, 1780, B['tag'], 20, t['muted'], F['label'], anchor='end')


def quote(t):
    s = rect(0, 0, 1080, 1080, t['bg']) + rect(72, 120, 10, 420, t['accent'], 5)
    for i, line in enumerate(('A score is a reason', 'to look, not a', 'verdict.')):
        s += text(124, 220 + i * 110, line, 96, t['fg'], F['display'], 700)
    s += text(124, 620, 'SAMPLE QUOTE / REPLACE BEFORE PUBLICATION', 18, t['muted'], F['label'])
    s += g(glyph(t['fg'], t['accent']), 72, 900, 72) + wordmark(160, 960, 56, word(t))
    return s + text(1008, 960, B['tag'], 18, t['muted'], F['label'], anchor='end')


def release(t):
    s = rect(0, 0, 1080, 1080, t['bg']) + g(glyph(t['fg'], t['accent']), 72, 72, 64) + wordmark(148, 124, 52, word(t))
    s += rect(72, 220, 220, 44, t['accent'], 4) + text(182, 251, 'CHANGELOG', 20, DARK['bg'], F['label'], 700, anchor='middle')
    s += text(72, 380, 'Release title', 104, t['fg'], F['display'], 700) + text(72, 470, 'goes here.', 104, t['fg'], F['display'], 700)
    for i in range(4):
        y = 580 + i * 72
        s += rect(72, y, 18, 18, t['accent'], 2) + rect(112, y, [620, 520, 700, 460][i], 18, t['fg'], 9, .8)
    return s + text(72, 1010, 'SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION', 16, t['muted'], F['label']) + text(1008, 1010, B['tag'], 16, t['muted'], F['label'], anchor='end')


def screenshot_frame(t):
    s = rect(0, 0, 1600, 1000, t['bg']) + g(glyph(t['fg'], t['accent']), 64, 44, 48) + wordmark(124, 84, 40, word(t))
    s += text(1536, 80, B['tag'], 16, t['muted'], F['label'], anchor='end')
    s += rect(64, 128, 1472, 808, t['panel'], 6, stroke=t['line'], sw=2)
    s += rect(64, 128, 1472, 40, t['raised'], 6) + ''.join(rect(84 + i * 22, 142, 12, 12, t['line'], 6) for i in range(3))
    s += text(800, 560, 'SCREENSHOT 1440 × 760', 24, t['muted'], F['label'], anchor='middle')
    return s


def og(t):
    s = rect(0, 0, 1200, 630, t['bg']) + g(glyph(t['fg'], t['accent']), 64, 64, 72) + wordmark(152, 124, 60, word(t))
    s += text(64, 270, 'Counting who is', 64, t['fg'], F['display'], 700) + text(64, 336, 'actually in the room.', 64, t['fg'], F['display'], 700)
    s += support(t, 64, 400, 22, 32)
    s += rect(700, 168, 436, 300, t['panel'], 6) + chart(t, 724, 220, 388, 180, size=12)
    return s + text(64, 580, B['tag'], 18, t['muted'], F['label'])


def title_card(t):
    s = rect(0, 0, 1920, 1080, t['bg']) + g(glyph(t['fg'], t['accent']), 160, 160, 128) + wordmark(316, 268, 104, word(t))
    s += text(160, 560, 'Episode or video title', 120, t['fg'], F['display'], 700)
    s += text(160, 640, 'One supporting line in Public Sans.', 40, t['muted'], F['body'])
    s += rect(160, 760, 1600, 160, t['panel'], 6) + chart(t, 200, 790, 1520, 80, legend=False)
    return s + text(1760, 1000, 'SAMPLE TITLE CARD', 22, t['muted'], F['label'], anchor='end')


def end_card(t):
    s = rect(0, 0, 1920, 1080, t['bg']) + g(glyph(t['fg'], t['accent']), 760, 300, 400)
    s += text(960, 820, B['wordmark'], 120, word(t), F['display'], 700, anchor='middle', spacing=4.8)
    return s + text(960, 900, B['tag'], 26, t['muted'], F['label'], anchor='middle')


def thumbnail(t):
    s = rect(0, 0, 1280, 720, t['bg']) + g(glyph(t['fg'], t['accent']), 64, 56, 72) + wordmark(152, 116, 58, word(t))
    s += text(64, 330, 'Thumbnail title', 112, t['fg'], F['display'], 700) + text(64, 440, 'in two lines.', 112, t['fg'], F['display'], 700)
    s += rect(64, 520, 1152, 140, t['panel'], 6) + chart(t, 92, 540, 1096, 80, legend=False)
    return s


def lower_third(t):
    s = rect(96, 840, 900, 136, t['bg'], 6, .94) + rect(96, 840, 10, 136, t['accent'], 3)
    s += g(glyph(t['fg'], t['accent']), 136, 868, 80)
    s += text(240, 910, 'Name or channel', 48, t['fg'], F['display'], 700) + text(240, 950, 'ROLE OR CONTEXT', 22, t['muted'], F['label'])
    return s


# -------------------------------------------------------------- tokens etc.
def check_theme(name, t):
    c = {'fg': contrast(t['fg'], t['bg']), 'fg_panel': contrast(t['fg'], t['panel']),
         'muted': contrast(t['muted'], t['bg']), 'muted_panel': contrast(t['muted'], t['panel']),
         'accent_ink': contrast(t['accent_ink'], t['bg']), 'accent_ink_panel': contrast(t['accent_ink'], t['panel']),
         'secondary_panel': contrast(t['secondary'], t['panel']), 'tertiary_panel': contrast(t['tertiary'], t['panel']),
         'wordmark': contrast(t['wordmark'], t['bg']), 'critical_panel': contrast(t['critical'], t['panel']),
         'accent_fill_vs_dark_text': contrast(t['accent'], DARK['bg']),
         'ramp_panel': [contrast(x, t['panel']) for x in t['ramp']]}
    text_keys = ('fg', 'fg_panel', 'muted', 'muted_panel', 'accent_ink', 'accent_ink_panel', 'critical_panel', 'accent_fill_vs_dark_text')
    bad = [k for k in text_keys if c[k] < 4.5] + [k for k in ('secondary_panel', 'tertiary_panel', 'wordmark') if c[k] < 3]
    bad += [f'ramp[{i}]' for i, v in enumerate(c['ramp_panel'][1:], 1) if v < 3] + (['ramp[0]'] if c['ramp_panel'][0] < 2 else [])
    if bad:
        sys.exit(f'{name} theme fails contrast: {bad} {c}')
    return c


def css_vars(t):
    keys = ['bg', 'panel', 'raised', 'line', 'fg', 'muted', 'accent', 'accent_ink', 'wordmark', 'secondary', 'tertiary', 'critical']
    v = ''.join(f'  --hc-{k.replace("_", "-")}: {t[k]};\n' for k in keys)
    return v + ''.join(f'  --hc-q{i + 1}: {x};\n' for i, x in enumerate(t['ramp']))


def tokens(contrasts):
    data = {k: B[k] for k in ('brand', 'slug', 'wordmark', 'direction', 'status', 'direction_selection', 'repository', 'score_name')}
    data.update(default_theme='dark', themes=B['themes'], contrast=contrasts,
                theme_rules='Text 4.5:1 on bg and panel; accent is a fill and mark colour, with dark text on it; accent_ink is the accent for text; '
                            'wordmark is the wordmark colour per theme; secondary (chatters) and tertiary (follows) are chart series and need 3:1 on panel; ramp steps 2 to 4 need 3:1 on panel; step 1 is a warm grey for low scores and needs 2:1.',
                fonts={'display': F['display'], 'body': F['body'], 'label': F['label']},
                spacing=B['spacing'], radii=B['radii'], mark_clear_space=B['mark_clear_space'],
                mark_min_width_px=B['mark_min_width_px'], lockup_min_width_px=B['lockup_min_width_px'])
    (HERE / 'tokens.json').write_text(json.dumps(data, indent=2) + '\n')
    css = ('/* Headcount tokens. Generated by build.py from brand.json; edit there. Dark is the default theme. */\n'
           f':root {{\n{css_vars(DARK)}  --hc-font-display: "{F["display"]}", "Arial Narrow", sans-serif;\n'
           f'  --hc-font-body: "{F["body"]}", system-ui, sans-serif;\n  --hc-font-label: "{F["label"]}", ui-monospace, monospace;\n'
           '  --hc-radius-panel: 6px;\n  --hc-radius-control: 4px;\n}\n'
           f'@media (prefers-color-scheme: light) {{\n  :root:not([data-theme="dark"]) {{\n{css_vars(LIGHT).replace("  --", "    --")}  }}\n}}\n'
           f':root[data-theme="light"] {{\n{css_vars(LIGHT)}}}\n')
    (HERE / 'tokens.css').write_text(css)


def fonts():
    dest = HERE / 'fonts'
    dest.mkdir(exist_ok=True)
    for files in F['files'].values():
        for name in files:
            shutil.copy2(TOOLS / 'fonts' / name, dest / name)
    sources = [s for s in json.loads((TOOLS / 'fonts/sources.json').read_text()) if s['family'] in F['files']]
    (dest / 'sources.json').write_text(json.dumps(sources, indent=2) + '\n')


def favicon_ico(png, dst):
    from PIL import Image
    Image.open(png).save(dst, sizes=[(16, 16), (32, 32)])


def build():
    t, l = DARK, LIGHT
    contrasts = {'dark': check_theme('dark', t), 'light': check_theme('light', l)}
    fonts()
    # Marks: tile (primary), paper (light), glyph-only and one-colour.
    write('logos/mark-primary', 128, 128, tile(128, t), 'Headcount mark', 512)
    write('logos/mark-light', 128, 128, tile(128, l), 'Headcount mark, light', 512)
    write('logos/mark-glyph', 24, 24, glyph(t['fg'], t['accent']), 'Headcount glyph for dark backgrounds', 512)
    write('logos/mark-glyph-light', 24, 24, glyph(l['fg'], l['accent']), 'Headcount glyph for light backgrounds', 512)
    write('logos/mark-mono-dark', 24, 24, glyph(l['fg'], l['fg']), 'Headcount one-colour mark, dark ink', 512)
    write('logos/mark-mono-light', 24, 24, glyph('#ffffff', '#ffffff'), 'Headcount one-colour mark, white', 512)
    # Presentation attributes do not resolve var(), so the themed copy colours through style attributes.
    body = glyph('INK', 'SLASH')
    for attr in ('fill', 'stroke'):
        body = body.replace(f'{attr}="INK"', f'style="{attr}:var(--hc-fg, currentColor)"').replace(f'{attr}="SLASH"', f'style="{attr}:var(--hc-accent, #f2b53a)"')
    themed = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="Headcount"><title>Headcount</title>'
              + body + '</svg>\n')
    (HERE / 'logos/mark-themed.svg').write_text(themed)
    for name, theme, ink, slash, word, bg in (('lockup-primary', t, t['fg'], t['accent'], t['accent'], True),
                                               ('lockup-light', l, l['fg'], l['accent'], l['fg'], True),
                                               ('lockup-mono-dark', l, l['fg'], l['fg'], l['fg'], False),
                                               ('lockup-mono-light', t, '#ffffff', '#ffffff', '#ffffff', False)):
        outline(write(f'logos/{name}', 560, 128, lockup(theme, ink, slash, word, bg), 'Headcount lockup', 1120))
    # Product web assets.
    write('product/favicon', 32, 32, tile(32, t, 2, small=True), 'Headcount', 32)
    write('logos/mark-small', 24, 24, glyph_small(t['fg'], t['accent']), 'Headcount small-size glyph', 96)
    write('product/icon-192', 192, 192, tile(192, t), 'Headcount', 192)
    write('product/icon-512', 512, 512, tile(512, t), 'Headcount', 512)
    write('product/apple-touch-icon', 180, 180, rect(0, 0, 180, 180, t['bg']) + g(glyph(t['fg'], t['accent']), 30, 30, 120), 'Headcount', 180)
    write('product/icon-maskable', 512, 512, rect(0, 0, 512, 512, t['bg']) + g(glyph(t['fg'], t['accent']), 128, 128, 256), 'Headcount', 512)
    write('product/favicon-16', 16, 16, tile(16, t, 1, small=True), 'Headcount', 16)
    favicon_ico(HERE / 'product/favicon.png', HERE / 'product/favicon.ico')
    write('product/og', 1200, 630, og(t), 'Headcount link preview')
    write('product/og-light', 1200, 630, og(l), 'Headcount link preview, light')
    # Social and video layouts.
    write('social/banner-x-bluesky', 1500, 500, banner(t), 'Headcount banner')
    write('social/banner-tall-master', 1500, 600, banner(t, 1500, 600), 'Headcount banner, taller master')
    write('social/avatar', 512, 512, tile(512, t, 80).replace(f'rx="{512 * 5 / 24:g}"', 'rx="0"', 1), 'Headcount avatar')
    write('social/square-post', 1080, 1080, square(t), 'Headcount square post')
    write('social/square-post-light', 1080, 1080, square(l), 'Headcount square post, light')
    write('social/landscape-template', 1200, 675, landscape(t), 'Headcount landscape layout')
    write('social/story-template', 1080, 1920, story(t), 'Headcount story layout', 540)
    write('social/quote-template', 1080, 1080, quote(t), 'Headcount quote layout')
    write('social/release-template', 1080, 1080, release(t), 'Headcount release layout')
    write('social/screenshot-frame', 1600, 1000, screenshot_frame(t), 'Headcount screenshot frame')
    write('video/title-card', 1920, 1080, title_card(t), 'Headcount video title card', 1280)
    write('video/lower-third', 1920, 1080, lower_third(t), 'Headcount transparent lower third', 1280)
    write('video/end-card', 1920, 1080, end_card(t), 'Headcount video end card', 1280)
    write('video/thumbnail', 1280, 720, thumbnail(t), 'Headcount video thumbnail')
    # Same eight-second preview the shared render_video_previews.py makes: title card, then end card.
    v = HERE / 'video'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', '4', '-i', str(v / 'title-card.png'),
                    '-loop', '1', '-framerate', '30', '-t', '4', '-i', str(v / 'end-card.png'), '-filter_complex',
                    '[0:v]fade=t=in:st=0:d=0.2,fade=t=out:st=3.8:d=0.2[v0];[1:v]fade=t=in:st=0:d=0.2,fade=t=out:st=3.8:d=0.2[v1];[v0][v1]concat=n=2:v=1:a=0,format=yuv420p[v]',
                    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-threads', '2', '-movflags', '+faststart',
                    '-fflags', '+bitexact', '-flags:v', '+bitexact', str(v / 'template-preview.mp4')], check=True)
    tokens(contrasts)
    # Gallery preview: the same six slots the shared packs use.
    sh = ''
    for i, rel in enumerate(('social/banner-x-bluesky', 'social/square-post', 'social/story-template', 'social/screenshot-frame', 'video/title-card', 'video/lower-third')):
        x, y = (i % 2) * 800, (i // 2) * 600
        sh += rect(x, y, 800, 600, '#eae6de') + text(x + 24, y + 36, rel.split('/')[1], 19, '#242226', 'Space Grotesk', 700)
        sh += embed(HERE / (rel + '.svg'), x + 24, y + 60, 752, 506)
    write('pack-preview', 1600, 1800, sh, 'Headcount pack preview')
    board()
    manifest()


def board():
    """Brand board: marks, lockups, both themes' swatches and the type roles."""
    s = rect(0, 0, 1440, 960, '#eae6de') + text(48, 60, 'HEADCOUNT / BRAND BOARD / OCTOBER 19, 2026', 18, '#242226', F['label'])
    s += embed(HERE / 'logos/mark-primary.svg', 48, 96, 200, 200) + embed(HERE / 'logos/mark-light.svg', 272, 96, 200, 200)
    s += embed(HERE / 'logos/lockup-primary.svg', 512, 96, 880, 201) + embed(HERE / 'logos/lockup-light.svg', 512, 312, 440, 100)
    s += embed(HERE / 'logos/lockup-mono-dark.svg', 972, 312, 440, 100)
    for row, (name, t) in enumerate((('DARK', DARK), ('LIGHT', LIGHT))):
        y = 460 + row * 150
        s += text(48, y, name, 16, '#242226', F['label'], 700)
        keys = ['bg', 'panel', 'fg', 'muted', 'accent', 'accent_ink', 'secondary', 'tertiary', 'critical']
        for i, k in enumerate(keys):
            x = 48 + i * 106
            s += rect(x, y + 14, 92, 64, t[k], 4, stroke='#00000022', sw=1) + text(x, y + 98, k, 12, '#242226', F['label']) + text(x, y + 116, t[k], 12, '#5f5d57', F['label'])
        for i, c in enumerate(t['ramp']):
            s += rect(1040 + i * 88, y + 14, 80, 64, c, 4) + text(1040 + i * 88, y + 98, f'q{i + 1}', 12, '#242226', F['label'])
    s += text(48, 810, 'HEADCOUNT 186 644', 64, '#121316', F['display'], 700) + text(48, 846, 'Barlow Condensed Bold: wordmark, headlines, big numbers', 14, '#5f5d57', F['label'])
    s += text(640, 790, 'Public Sans for sentences and tables.', 26, '#121316', F['body']) + text(640, 830, 'JETBRAINS MONO / LABELS / 0123456789', 22, '#121316', F['label'])
    s += text(48, 920, 'Quotient ramp: low scores are warm grey, higher scores deepen into amber. The accent hex itself is never a score colour.', 14, '#5f5d57', F['label'])
    write('brand-board', 1440, 960, s, 'Headcount brand board')


def manifest():
    old = HERE / 'asset-manifest.json'
    previous = [e['path'] for e in json.loads(old.read_text())['files']] if old.exists() else []
    rank = {p: i for i, p in enumerate(previous)}
    from PIL import Image
    entries = []
    files = [p for p in HERE.rglob('*') if p.is_file() and p.name != 'asset-manifest.json'
             and not {'__pycache__', '.font-cache'} & set(p.relative_to(HERE).parts)]
    for p in sorted(files, key=lambda p: (rank.get(str(p.relative_to(HERE)), len(rank)), str(p.relative_to(HERE)))):
        e = {'path': str(p.relative_to(HERE)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
        if p.suffix == '.png':
            im = Image.open(p)
            e.update(width=im.width, height=im.height, mode=im.mode)
        entries.append(e)
    old.write_text(json.dumps({'brand': B['brand'], 'direction': B['direction'], 'status': B['status'], 'files': entries}, indent=2) + '\n')
    print(B['brand'], len(entries), 'files')


EXPORT = ['product/favicon.svg', 'product/favicon.ico', 'product/icon-192.png', 'product/icon-512.png', 'product/apple-touch-icon.png',
          'product/icon-maskable.png', 'product/og.png', 'logos/mark-themed.svg', 'tokens.css']


def export(dest):
    """Copy the product's web assets and WOFF2 fonts to dest, with a receipt."""
    from fontTools.ttLib import TTFont
    dest.mkdir(parents=True, exist_ok=True)
    rows = []
    for rel in EXPORT:
        shutil.copy2(HERE / rel, dest / Path(rel).name)
        rows.append(rel)
    fdest = dest / 'fonts'
    fdest.mkdir(exist_ok=True)
    for family, files in F['files'].items():
        for name in files:
            src = HERE / 'fonts' / name
            if name.endswith('.ttf'):
                font = TTFont(src)
                font.flavor = 'woff2'
                font.save(fdest / (src.stem + '.woff2'))
                rows.append(f'fonts/{name} -> fonts/{src.stem}.woff2')
            else:
                shutil.copy2(src, fdest / name)
                rows.append(f'fonts/{name}')
    receipt = {'brand': B['brand'], 'source': 'subcult-tv studio/brands/headcount', 'status': B['status'],
               'files': [{'path': str(p.relative_to(dest)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                         for p in sorted(dest.rglob('*')) if p.is_file() and p.name != 'brand-export.json'],
               'copied': rows, 'rule': 'Generated copies. Change the pack in Studio and export again; do not edit these files.'}
    (dest / 'brand-export.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print('Exported', len(receipt['files']), 'files to', dest)


def product_copy(root):
    """Copy the product's design-system document into design-system/ with its source hash."""
    src = root / 'docs/design-system.md'
    dest = HERE / 'design-system'
    dest.mkdir(exist_ok=True)
    shutil.copy2(src, dest / 'README.md')
    rev = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    (dest / 'source-provenance.json').write_text(json.dumps({
        'source': 'subculture-collective/headcount docs/design-system.md', 'revision': rev,
        'sha256': hashlib.sha256(src.read_bytes()).hexdigest(),
        'rule': 'The product repository is the editing source; refresh with --product-root.'}, indent=2) + '\n')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--export', type=Path, help='copy the product web assets and WOFF2 fonts here')
    ap.add_argument('--skip-build', action='store_true', help='export the committed pack without rebuilding')
    ap.add_argument('--product-root', type=Path, help='headcount checkout to copy docs/design-system.md from')
    a = ap.parse_args()
    if a.product_root:
        product_copy(a.product_root.resolve())
    if not a.skip_build:
        build()
    if a.export:
        export(a.export.resolve())
