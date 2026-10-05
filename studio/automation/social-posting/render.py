#!/usr/bin/env python3
"""Render a 4:5 Instagram JPEG from brand-pack type, marks and an optional image.

Layouts: `illustration` (full-bleed art with a type panel), `type` (a typographic
card) and `screenshot` (a captured public page framed on the brand field). Text is
set by the browser from the pack fonts, never by an image model. The output meets
the dashboard upload limits: 1080 x 1350 JPEG under 900 KB.
"""
import argparse
import base64
import html
import io
import json
import re
from pathlib import Path
import subprocess
import tempfile

from PIL import Image

HERE = Path(__file__).resolve().parent
LIBRARY = HERE.parents[1]/'branding/library'
WIDTH, HEIGHT = 1080, 1350
MAX_BYTES = 900 << 10


def brand(slug):
    for item in json.loads((LIBRARY/'brands.json').read_text()):
        if item['slug'] == slug:
            return item
    raise ValueError('Unknown brand: '+slug)


def luminance(hex_color):
    r, g, b = (int(hex_color.lstrip('#')[i:i+2], 16)/255 for i in (0, 2, 4))
    return 0.2126*r + 0.7152*g + 0.0722*b


def font_faces(*families):
    sources = json.loads((LIBRARY/'fonts/sources.json').read_text())
    css = []
    for family in dict.fromkeys(families):
        entry = next((s for s in sources if s['family'] == family), None)
        files = (entry or {}).get('files') or sorted(p.name for p in (LIBRARY/'fonts').glob(family.replace(' ', '-')+'-*.ttf'))
        for name in files:
            path = LIBRARY/'fonts'/name
            if not path.is_file():
                continue
            weight = '700' if 'Bold' in name else ('400' if 'Regular' in name else '100 900')
            style = 'italic' if name.endswith('-1.ttf') and family in ('Fraunces', 'Newsreader', 'Libre Baskerville') else 'normal'
            css.append(f"@font-face{{font-family:'{family}';src:url('{path.as_uri()}');font-weight:{weight};font-style:{style};}}")
    return '\n'.join(css)


def data_uri(path, mime=None):
    path = Path(path)
    mime = mime or {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}[path.suffix.lower()]
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode()


def svg_colors(text, depth=0):
    """Hex fill colors in an SVG, including SVGs embedded as base64 images."""
    colors = re.findall(r'(?:fill|stop-color)\s*[=:]\s*"?(#[0-9a-fA-F]{6})', text)
    if depth < 2:
        for payload in re.findall(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', text):
            colors += svg_colors(base64.b64decode(payload).decode('utf-8', 'replace'), depth + 1)
    return colors


def lockup(slug, bg):
    """Pick a lockup by measured contrast with the field; prefer colored over mono lockups."""
    logos = LIBRARY/'brands'/slug/'logos'
    scored = []
    for path in sorted(logos.glob('lockup-*-outlined.svg')) or sorted(logos.glob('lockup-*.svg')):
        fills = [f for f in svg_colors(path.read_text()) if f.lower() != bg.lower()]
        if fills:
            worst = min(abs(luminance(f) - luminance(bg)) for f in fills)
            mean = sum(abs(luminance(f) - luminance(bg)) for f in fills)/len(fills)
            scored.append((('mono' not in path.name) and worst >= 0.12, mean, path))
    if not scored:
        return ''
    return data_uri(max(scored, key=lambda t: (t[0], t[1]))[2])


def type_motif(slug, b, kicker):
    """Per-brand signature graphic for the typographic card: (html, headline css, text top)."""
    bg, fg, accent, secondary = b['bg'], b['fg'], b['accent'], b['secondary']
    if slug == 'patchwork':
        return (f'<div style="position:absolute;right:-60px;top:70px;width:420px;height:300px;background:{secondary};'
                f'border-radius:46px 18px 52px 22px;transform:rotate(-6deg);outline:6px dashed {bg};outline-offset:-26px"></div>'
                f'<div style="position:absolute;right:170px;top:250px;width:220px;height:170px;background:#f2c84b;'
                f'border-radius:30px 12px 34px 14px;transform:rotate(8deg);outline:5px dashed {bg};outline-offset:-18px"></div>', '', 470)
    if slug == 'subcult-os':
        return (f'<div style="position:absolute;left:84px;top:96px;width:620px;height:250px;background:{accent};border-radius:8px;'
                f'transform:rotate(-3deg);padding:34px 40px;font-family:\'Space Mono\';color:#fff">'
                f'<div style="font-size:26px;letter-spacing:.18em">SUBCULT OS / ADMIT ONE</div>'
                f'<div style="margin-top:36px;height:70px;background:repeating-linear-gradient(90deg,#fff 0 6px,transparent 6px 11px,#fff 11px 14px,transparent 14px 22px)"></div></div>',
                'text-transform:uppercase', 470)
    if slug == 'hasanara':
        return (f'<div style="position:absolute;left:84px;right:84px;top:96px;border-top:10px solid {fg};border-bottom:3px solid {fg};height:26px"></div>'
                f'<div style="position:absolute;left:84px;right:84px;top:150px;font-family:\'JetBrains Mono\';font-size:26px;letter-spacing:.12em;color:{accent};display:flex;justify-content:space-between">'
                f'<span>THE RECORD</span><span>{html.escape(kicker.upper())}</span></div>'
                f'<div style="position:absolute;left:84px;right:84px;top:200px;border-top:3px solid {fg}"></div>', '', 300)
    if slug == 'rekolekt':
        rows = ''.join(f'<div style="display:flex;gap:28px;margin-bottom:22px"><span style="color:{accent}">[{t}]</span>'
                       f'<span style="flex:1;height:18px;margin-top:10px;background:{secondary};opacity:.55;max-width:{w}px"></span></div>'
                       for t, w in (('00:41:07', 520), ('00:41:12', 640), ('00:41:19', 430)))
        return (f'<div style="position:absolute;left:84px;right:84px;top:110px;font-family:\'JetBrains Mono\';font-size:30px">{rows}</div>', '', 470)
    if slug == 'undertow':
        bars = ''.join(f'<div style="width:46px;height:{h}px;background:{accent if i % 2 else secondary}"></div>'
                       for i, h in enumerate((120, 220, 160, 300, 240, 140, 260, 180, 90, 200, 150, 110)))
        return (f'<div style="position:absolute;left:84px;right:84px;top:90px;height:300px;display:flex;align-items:flex-end;gap:14px">{bars}</div>',
                f'text-shadow:6px 0 0 {accent},-6px 0 0 {secondary}', 470)
    if slug == 'clpr':
        return (f'<div style="position:absolute;right:90px;top:120px;width:420px;height:250px;border-radius:22px;background:{accent};transform:rotate(6deg)"></div>'
                f'<div style="position:absolute;right:140px;top:150px;width:420px;height:250px;border-radius:22px;background:#1d1a27;border:4px solid {fg};transform:rotate(-4deg)">'
                f'<div style="position:absolute;left:170px;top:80px;width:0;height:0;border-left:80px solid {accent};border-top:46px solid transparent;border-bottom:46px solid transparent"></div></div>',
                'text-transform:uppercase', 480)
    if slug == 'kork':
        return (f'<div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 30%, #c8955c 0 2px, transparent 3px) 0 0/28px 28px"></div>'
                f'<div style="position:absolute;left:70px;right:70px;top:300px;bottom:230px;background:{secondary};transform:rotate(-2deg);box-shadow:10px 14px 0 rgba(0,0,0,.18)"></div>'
                f'<div style="position:absolute;left:50%;top:270px;width:54px;height:54px;border-radius:50%;background:{accent};box-shadow:4px 6px 0 rgba(0,0,0,.25)"></div>', '', 380)
    return (f'<div style="position:absolute;left:84px;top:84px;width:170px;height:170px;background:{accent}"></div>'
            f'<div style="position:absolute;right:84px;top:84px;width:60px;height:60px;border:6px solid {fg};border-radius:50%"></div>', '', 380)


def page(layout, slug, headline, kicker, image=None):
    b = brand(slug)
    bg, fg, accent, secondary = b['bg'], b['fg'], b['accent'], b['secondary']
    dark = luminance(bg) < 0.5
    display, body, label = b['display'], b['body'], b.get('label') or b['body']
    words = len(headline.split())
    size = 112 if words <= 4 else 96 if words <= 6 else 82
    upper = 'uppercase' if display in ('Oswald', 'Barlow Condensed', 'Archivo Black') else 'none'
    logo = lockup(slug, bg)
    art = data_uri(image) if image else ''
    head = html.escape(headline)
    kick = html.escape(kicker)
    base = f"""<!doctype html><html><head><meta charset="utf-8"><style>
{font_faces(display, body, label)}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{WIDTH}px;height:{HEIGHT}px;overflow:hidden;background:{bg};color:{fg}}}
.kicker{{font-family:'{label}';font-size:30px;letter-spacing:.14em;text-transform:uppercase;color:{b.get('safe_label') or accent}}}
.headline{{font-family:'{display}';font-weight:700;font-size:{size}px;line-height:1.02;text-transform:{upper};letter-spacing:-.01em;text-wrap:balance}}
.logo{{height:72px}}
</style></head><body>"""
    if layout == 'illustration':
        return base+f"""
<div style="position:absolute;inset:0;background:url('{art}') center/cover no-repeat"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(to bottom, {bg}00 0%, {bg}d9 38%, {bg} 62%)"></div>
<div style="position:absolute;left:72px;right:72px;bottom:72px;display:flex;flex-direction:column;gap:26px">
  {f'<div class="kicker">{kick}</div>' if kick else ''}
  <div class="headline">{head}</div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:18px">
    <div style="width:120px;height:10px;background:{accent}"></div>
    {f'<img class="logo" src="{logo}">' if logo else ''}
  </div>
</div></body></html>"""
    if layout == 'screenshot':
        return base+f"""
<div style="position:absolute;left:72px;right:72px;top:72px;display:flex;flex-direction:column;gap:20px">
  {f'<div class="kicker">{kick}</div>' if kick else ''}
  <div class="headline" style="font-size:{min(size, 84)}px">{head}</div>
</div>
<div style="position:absolute;left:50%;{'bottom:-60px' if head else 'top:140px'};transform:translateX(-50%) rotate(-2deg);width:{560 if head else 640}px;height:{900 if head else 1030}px;border-radius:44px;border:14px solid {fg};overflow:hidden;box-shadow:24px 24px 0 {accent}">
  <img src="{art}" style="width:100%;display:block">
</div>
{f'<img class="logo" src="{logo}" style="position:absolute;right:72px;bottom:72px;height:56px">' if logo else ''}
</body></html>"""
    motif, head_style, text_top = type_motif(slug, b, kick)
    return base+f"""
{motif}
<div style="position:absolute;left:84px;right:84px;top:{text_top}px;display:flex;flex-direction:column;gap:34px">
  {f'<div class="kicker">{kick}</div>' if kick and slug not in ('subcult-os',) else ''}
  <div class="headline" style="font-size:{size+18}px;{head_style}">{head}</div>
</div>
{f'<img class="logo" src="{logo}" style="position:absolute;left:84px;bottom:84px;height:72px">' if logo else ''}
</body></html>"""


def chromium_screenshot(target, out_png, width, height, scale=1):
    subprocess.run(['chromium', '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
                    '--allow-file-access-from-files', f'--window-size={width},{height}',
                    f'--force-device-scale-factor={scale}', '--virtual-time-budget=8000',
                    f'--screenshot={out_png}', target],
                   check=True, capture_output=True, timeout=120)


def capture(url, out_png):
    """Capture a public page at phone size (390 x 844 CSS pixels at 2x)."""
    if not url.startswith('https://'):
        raise ValueError('Screenshots are limited to public HTTPS pages')
    chromium_screenshot(url, out_png, 390, 844, scale=2)
    return Path(out_png)


def to_jpeg(png, out_jpeg):
    image = Image.open(png).convert('RGB').resize((WIDTH, HEIGHT), Image.LANCZOS)
    for quality in (92, 88, 84, 80, 76, 72, 68):
        buffer = io.BytesIO()
        image.save(buffer, 'JPEG', quality=quality, optimize=True, progressive=True)
        if buffer.tell() <= MAX_BYTES:
            Path(out_jpeg).write_bytes(buffer.getvalue())
            return Path(out_jpeg)
    raise ValueError('Could not fit the image under 900 KB')


def render(layout, slug, headline, kicker, out_jpeg, image=None):
    if layout not in ('illustration', 'type', 'screenshot'):
        raise ValueError('Unknown layout')
    if layout != 'type' and not image:
        raise ValueError(layout+' needs an image')
    with tempfile.TemporaryDirectory() as tmp:
        document = Path(tmp)/'card.html'
        document.write_text(page(layout, slug, headline, kicker, image))
        png = Path(tmp)/'card.png'
        chromium_screenshot(document.as_uri(), png, WIDTH, HEIGHT)
        return to_jpeg(png, out_jpeg)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('layout', choices=['illustration', 'type', 'screenshot'])
    parser.add_argument('brand')
    parser.add_argument('headline')
    parser.add_argument('out')
    parser.add_argument('--kicker', default='')
    parser.add_argument('--image')
    parser.add_argument('--url', help='capture this public page for the screenshot layout')
    args = parser.parse_args()
    image = args.image
    if args.layout == 'screenshot' and args.url:
        image = capture(args.url, Path(args.out).with_suffix('.capture.png'))
    print(render(args.layout, args.brand, args.headline, args.kicker, args.out, image))
