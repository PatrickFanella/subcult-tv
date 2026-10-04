#!/usr/bin/env python3
"""Build Backline's outlined SVG masters and web exports.

Requires fonttools (including its woff extra) and rsvg-convert.
Run: python build_assets.py [--product-root /path/to/discord-spywatcher]
"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


SOURCE = Path(__file__).resolve().parent
WEB = SOURCE / 'product'
INK = '#100b19'
PURPLE = '#8b5cf6'
GREEN = '#00ff88'
PAPER = '#f0ece4'


def svg(width, height, content, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
            f'width="{width}" height="{height}" role="img" aria-label="{label}">'
            f'<title>{label}</title>{content}</svg>\n')


def text_paths(text, font_name, size, x, baseline, color):
    font = TTFont(SOURCE / 'fonts' / font_name)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    content = []
    for character in text:
        glyph_name = cmap[ord(character)]
        pen = SVGPathPen(glyphs)
        glyphs[glyph_name].draw(pen)
        content.append(f'<path fill="{color}" transform="translate({x:.3f} {baseline}) '
                       f'scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}"/>')
        x += font['hmtx'][glyph_name][0] * scale
    font.close()
    return ''.join(content), x


def mark(x=0, y=0, size=128, color=INK, accent=GREEN):
    # Original geometric BL monogram: a notched B and an L on a shared baseline.
    return (f'<g transform="translate({x} {y}) scale({size / 128})">'
            f'<path fill="{color}" fill-rule="evenodd" d="M12 12H56L70 26V52L62 60'
            'L70 68V94L56 108H12ZM30 30V50H50V30ZM30 70V90H50V70Z"/>'
            f'<path fill="{color}" d="M82 12H100V90H116V108H82Z"/>'
            f'<path fill="{accent}" d="M12 116H116V128H12Z"/></g>')


def wordmark(x, baseline, size, color):
    paths, end = text_paths('BACKLINE', 'Oswald.ttf', size, x, baseline, color)
    return paths + f'<rect x="{x}" y="{baseline + 9}" width="{end - x:.3f}" height="8" fill="{color}"/>'


def write(name, width, height, content, label, raster=False):
    master = SOURCE / 'masters' / f'{name}.svg'
    master.write_text(svg(width, height, content, label))
    ET.parse(master)
    (WEB / f'{name}.svg').write_bytes(master.read_bytes())
    if raster:
        subprocess.run(['rsvg-convert', '-w', str(width), '-h', str(height),
                        '-o', str(WEB / f'{name}.png'), str(master)], check=True)


def main():
    (SOURCE / 'masters').mkdir(parents=True, exist_ok=True)
    (WEB / 'fonts').mkdir(parents=True, exist_ok=True)
    for license in (SOURCE / 'fonts').glob('*-OFL.txt'):
        (WEB / 'fonts' / license.name).write_bytes(license.read_bytes())
    for name in ['Oswald', 'Space-Grotesk', 'JetBrains-Mono']:
        font = TTFont(SOURCE / 'fonts' / f'{name}.ttf', recalcTimestamp=False)
        font.flavor = 'woff2'
        font.save(WEB / 'fonts' / f'{name}.woff2')
        font.close()
    write('mark', 128, 128, mark(), 'Backline BL monogram')
    write('mark-light', 128, 128, mark(color=PAPER), 'Backline BL monogram in paper and green')
    write('wordmark', 470, 132, wordmark(8, 102, 112, INK), 'Backline wordmark')
    write('wordmark-light', 470, 132, wordmark(8, 102, 112, PAPER), 'Backline wordmark in paper')
    write('lockup', 610, 152, mark(8, 8, 128) + wordmark(160, 108, 104, INK), 'Backline logo')
    write('lockup-light', 610, 152, mark(8, 8, 128, PAPER) + wordmark(160, 108, 104, PAPER), 'Backline logo in paper and green')
    write('favicon', 64, 64, f'<rect width="64" height="64" rx="8" fill="{PURPLE}"/>' + mark(6, 4, 52, accent=INK), 'Backline browser icon')
    write('avatar', 512, 512, f'<rect width="512" height="512" fill="{PURPLE}"/>' + mark(100, 80, 312), 'Backline bot avatar', True)
    write('apple-touch-icon', 180, 180, f'<rect width="180" height="180" fill="{PURPLE}"/>' + mark(28, 20, 124), 'Backline touch icon', True)
    title, _ = text_paths('KEEP YOUR', 'Oswald.ttf', 124, 64, 275, INK)
    title2, _ = text_paths('PEOPLE TOGETHER.', 'Oswald.ttf', 124, 64, 420, INK)
    label, _ = text_paths('DISCORD COMMUNITY TOOLS / PRIVATE PILOT', 'JetBrains-Mono.ttf', 18, 64, 545, INK)
    og = f'<rect width="1200" height="630" fill="{PURPLE}"/>' + wordmark(64, 112, 66, INK)
    og += f'<rect x="64" y="313" width="1064" height="126" fill="{GREEN}"/>' + title + title2 + label + mark(1034, 42, 110)
    write('og', 1200, 630, og, 'Backline. Keep your people together. Discord community tools. Private pilot.', True)
    square = f'<rect width="1080" height="1080" fill="{PAPER}"/><rect width="1080" height="244" fill="{PURPLE}"/>'
    square += wordmark(64, 158, 104, INK) + mark(840, 44, 160)
    for line, baseline in [('KEEP YOUR', 452), ('PEOPLE', 636), ('TOGETHER.', 820)]:
        paths, _ = text_paths(line, 'Oswald.ttf', 168, 64, baseline, INK)
        square += paths
    square += f'<rect x="64" y="877" width="952" height="8" fill="{INK}"/>'
    paths, _ = text_paths('DISCORD COMMUNITY TOOLS / PRIVATE PILOT', 'JetBrains-Mono.ttf', 20, 64, 960, INK)
    write('social-square', 1080, 1080, square + paths, 'Backline. Keep your people together. Private pilot.', True)
    banner = f'<rect width="1500" height="500" fill="{PURPLE}"/>' + wordmark(440, 204, 168, INK)
    paths, _ = text_paths('THE TOOLS BEHIND YOUR COMMUNITY.', 'Space-Grotesk.ttf', 30, 440, 318, INK)
    write('social-banner', 1500, 500, banner + paths + mark(104, 102, 248), 'Backline. The tools behind your community.', True)
    entries = []
    for path in sorted(WEB.rglob('*')):
        if path.is_file() and path.name != 'asset-manifest.json':
            entries.append({'path': str(path.relative_to(WEB)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size})
    manifest = {'brand': 'Backline', 'direction': 'Poster Crew', 'source': 'Studio branding/library/brands/backline/build_assets.py and fonts/',
                'selection': 'Owner selected Poster Crew in this thread; assets prepared for review.', 'files': entries}
    (SOURCE / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--product-root', type=Path)
    args = parser.parse_args()
    if args.product_root:
        target = args.product_root.resolve() / 'frontend/public/brand/backline'
        for entry in entries:
            destination = target / entry['path']
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes((WEB / entry['path']).read_bytes())
        receipt = args.product_root.resolve() / 'brand/backline/source-provenance.json'
        receipt.parent.mkdir(parents=True, exist_ok=True)
        receipt.write_text(json.dumps({'source_repository': 'https://git.subcult.tv/subculture-collective/subcult-tv', 'source_path': 'studio/branding/library/brands/backline', 'direction': 'Poster Crew', 'files': entries}, indent=2) + '\n')
    print(f'Built {len(entries)} Backline files in {WEB}')


if __name__ == '__main__':
    main()
