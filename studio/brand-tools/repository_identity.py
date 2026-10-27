"""Build scoped repository identities from Studio masters; no product UI changes."""
from pathlib import Path
import base64
import hashlib
import html
import json
import shutil
import subprocess
import xml.etree.ElementTree as ET
from functools import lru_cache

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

STUDIO = Path(__file__).resolve().parents[1]
BRANDS = STUDIO / 'brands'
FONTS = STUDIO / 'brand-tools/fonts'


@lru_cache
def font(name):
    return TTFont(FONTS / name)


def text(x, y, value, size, color, face='Space-Grotesk-1.ttf', spacing=0):
    face = font(face)
    glyphs, cmap = face.getGlyphSet(), face.getBestCmap()
    scale, advance, result = size / face['head'].unitsPerEm, 0, []
    for character in value:
        name = cmap.get(ord(character), '.notdef')
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        result.append(f'<path transform="translate({advance:g} 0)" d="{pen.getCommands()}"/>')
        advance += glyphs[name].width + spacing / scale
    return f'<g aria-label="{html.escape(value)}" fill="{color}" transform="translate({x} {y}) scale({scale:g} {-scale:g})">' + ''.join(result) + '</g>'


def svg(width, height, content, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img"><title>{html.escape(title)}</title>{content}</svg>\n'


def rect(x, y, width, height, fill, stroke=None):
    return f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="{fill}"' + (f' stroke="{stroke}" stroke-width="2"' if stroke else '') + '/>'


def render(path, width, height, content, title):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(svg(width, height, content, title))
    ET.parse(path)
    subprocess.run(['rsvg-convert', '-o', str(path.with_suffix('.png')), str(path)], check=True)


def embed(path, x, y, width, height):
    data = base64.b64encode(path.read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{width}" height="{height}" href="data:image/svg+xml;base64,{data}"/>'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def mark(color, accent, variant='manual'):
    if variant == 'socket':
        return f'<path d="M20 20H108V108H20Z M40 40V88H88V40Z" fill="{color}" fill-rule="evenodd"/>' + rect(92, 48, 28, 32, accent)
    if variant == 'index':
        return rect(20, 24, 88, 84, color) + rect(36, 40, 56, 12, accent) + rect(36, 64, 40, 8, accent) + rect(36, 84, 48, 8, accent)
    # Original open G-shaped manual, with a separate indexed orange corner.
    return (f'<path d="M84 20H34Q18 20 18 36V96Q18 112 34 112H110V64H66V82H90V94H38V38H84Z" fill="{color}"/>'
            + rect(92, 20, 18, 32, accent))


def manifest(folder, sources=()):
    path = folder / 'asset-manifest.json'
    data = json.loads(path.read_text()) if path.exists() else {'brand': folder.name, 'files': []}
    key = 'assets' if 'assets' in data else 'files'
    existing = {row['path']: row for row in data.get(key, [])}
    for source in sorted(folder.rglob('*')):
        if not source.is_file() or source == path or '__pycache__' in source.parts or source.suffix == '.pyc':
            continue
        name = str(source.relative_to(folder))
        # Existing packs retain their unrelated records and only add repository exports.
        if folder.name != 'generic-skills' and not name.startswith('repository/'):
            continue
        existing[name] = {'path': name, 'sha256': digest(source), 'bytes': source.stat().st_size}
    data[key] = list(existing.values())
    if sources:
        data['sources'] = [{'path': str(p.relative_to(STUDIO)), 'sha256': digest(p)} for p in sources]
    path.write_text(json.dumps(data, indent=2) + '\n')


def contrast(a, b):
    def luminance(color):
        channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in channels]
        return sum(c * w for c, w in zip(linear, (.2126, .7152, .0722)))
    high, low = sorted((luminance(a), luminance(b)), reverse=True)
    return (high + .05) / (low + .05)


def build_generic():
    folder = BRANDS / 'generic-skills'
    config = json.loads((folder / 'brand.json').read_text())
    bg, ink, accent, muted = [config['colors'][key] for key in ('paper', 'ink', 'accent', 'muted')]
    assert contrast(bg, ink) >= 4.5 and contrast(bg, muted) >= 4.5
    logo = mark(ink, accent)
    render(folder / 'logos/mark-primary.svg', 128, 128, logo, 'Generic Skills open manual mark')
    render(folder / 'logos/mark-mono.svg', 128, 128, mark(ink, ink), 'Generic Skills monochrome mark')
    render(folder / 'logos/lockup-primary-outlined.svg', 760, 140,
           '<g transform="translate(0 6)">' + logo + '</g>' + text(154, 88, 'Generic Skills', 70, ink), 'Generic Skills')
    avatar = rect(0, 0, 512, 512, bg) + '<g transform="translate(64 64) scale(3)">' + logo + '</g>'
    render(folder / 'repository/avatar.svg', 512, 512, avatar, 'Generic Skills repository avatar')
    body = rect(0, 0, 1600, 560, bg)
    body += rect(0, 0, 1600, 12, accent) + text(70, 73, 'PORTABLE AGENT PROCEDURES', 21, muted, 'JetBrains-Mono-0.ttf', 2)
    body += text(64, 242, 'Generic', 160, ink) + text(64, 400, 'Skills', 160, ink)
    body += text(70, 495, 'Practical procedures for your coding agents.', 32, ink, 'Public-Sans-0.ttf')
    body += '<g transform="translate(1184 70) scale(2.25)">' + logo + '</g>'
    body += rect(1070, 391, 456, 103, ink)
    body += text(1098, 431, 'SKILL.md', 25, bg, 'JetBrains-Mono-0.ttf')
    body += text(1098, 467, 'scope / steps / resources', 17, bg, 'JetBrains-Mono-0.ttf')
    render(folder / 'repository/banner.svg', 1600, 560, body, 'Generic Skills — portable agent procedures')
    shutil.copy2(folder / 'repository/banner.png', folder / 'pack-preview.png')
    # Three comparable studies use the same title and representative artifact.
    board = rect(0, 0, 1600, 900, '#ffffff')
    for index, (name, paper, foreground, color, variant) in enumerate([
        ('A / Open Manual', bg, ink, accent, 'manual'),
        ('B / Tool Socket', '#e7edf0', '#203348', '#236d82', 'socket'),
        ('C / Library Index', '#f3f0e4', '#3739a8', '#f4cf4c', 'index')]):
        y = index * 300
        board += rect(0, y, 1600, 294, paper)
        board += f'<g transform="translate(60 {y + 66}) scale(1.25)">' + mark(foreground, color, variant) + '</g>'
        board += text(300, y + 86, name, 24, foreground, 'JetBrains-Mono-0.ttf')
        board += text(296, y + 182, 'Generic Skills', 86, foreground)
        board += text(300, y + 244, 'Practical procedures for your coding agents.', 26, foreground, 'Public-Sans-0.ttf')
        board += rect(1235, y + 66, 300, 170, foreground) + text(1262, y + 133, 'SKILL.md', 27, paper, 'JetBrains-Mono-0.ttf')
        board += text(1262, y + 180, 'scope / steps', 18, paper, 'JetBrains-Mono-0.ttf')
    render(folder / 'directions.svg', 1600, 900, board, 'Three Generic Skills direction studies; A selected for repository use')
    return folder


def build_existing(slug):
    folder = BRANDS / slug
    lockup, avatar = folder / 'logos/lockup-primary-outlined.svg', folder / 'social/avatar.svg'
    if slug == 'headcount':
        bg, fg, accent = '#121316', '#ecebe6', '#f2b53a'
        title, subtitle, label = 'Twitch signals, in context.', 'Viewer, follower and chat patterns. Evidence before conclusions.', 'HEADCOUNT / SUS QUOTIENT'
        label_font = 'JetBrains-Mono-0.ttf'
    else:
        bg, fg, accent = '#0b0f0c', '#cfeedd', '#7dff9a'
        title, subtitle, label = 'A workspace for Twitch chat.', 'Self-hosted chat with a palette, font and layout of your own.', 'CHATTY CAT / TWITCH CHAT'
        label_font = 'CascadiaMono-Regular.ttf'
    assert contrast(bg, fg) >= 4.5 and contrast(bg, accent) >= 4.5
    body = rect(0, 0, 1600, 560, bg) + rect(64, 64, 10, 400, accent)
    body += embed(lockup, 112, 78, 880, 201)
    body += text(112, 356, title, 64, fg, 'Public-Sans-1.ttf')
    body += text(112, 412, subtitle, 28, fg, 'Public-Sans-0.ttf')
    body += text(112, 500, label, 20, accent, label_font, 1)
    render(folder / 'repository/banner.svg', 1600, 560, body, title)
    render(folder / 'repository/avatar.svg', 512, 512, embed(avatar, 0, 0, 512, 512), slug + ' repository avatar')
    (folder / 'repository/source-map.json').write_text(json.dumps({
        'sources': [{'path': str(p.relative_to(STUDIO)), 'sha256': digest(p)} for p in [lockup, avatar]],
        'scope': 'Repository banner and avatar only; approved identity masters retained unchanged.'}, indent=2) + '\n')
    manifest(folder)


if __name__ == '__main__':
    folder = build_generic()
    for name in ['headcount', 'chatty-cat']:
        build_existing(name)
    manifest(folder, [Path(__file__), FONTS / 'Space-Grotesk-1.ttf', FONTS / 'Public-Sans-0.ttf', FONTS / 'JetBrains-Mono-0.ttf'])
    print('Built Generic Skills and the Headcount/Chatty Cat repository exports')
