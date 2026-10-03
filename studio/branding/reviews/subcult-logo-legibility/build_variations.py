"""Build review-only SVG variations from the preserved SUBCULT master."""
from pathlib import Path
import copy
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent.parent / 'library/references/subcult-mark-master.svg'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)


import sys
sys.path.insert(0, str(ROOT.parent.parent / "library"))
from subcult_assets import make_mark, node


OPTIONS = [
    ('original', 'Current master', 'Separate extension; thin C and registration lines.'),
    ('a-integrated', 'A / Integrated original', 'Same lettering; one continuous underscore.'),
    ('b-heavy-outline', 'B / Heavier outline', 'Thicker C; registration lines removed.'),
    ('c-solid', 'C / Solid letters', 'Filled C; registration lines removed.'),
    ('d-compact', 'D / Compact', 'Filled letters; no block; tighter framing.'),
    ('b-registration', 'B / With registration lines', 'Heavier outline; dark lines with dark letters, green lines with white letters.'),
    ('c-registration', 'C / With registration lines', 'Solid C; dark lines with dark letters, green lines with white letters.'),
]
THEMES = [('color', 'Dark ink / purple', '#8b5cf6'),
          ('reverse', 'White / green outline / dark', '#100b19'),
          ('mono', 'White / dark', '#100b19')]


def text(parent, x, y, value, size=16, fill='#ffffff'):
    e = node('text', x=x, y=y, font_family='sans-serif', font_size=size, fill=fill)
    e.text = value
    parent.append(e)


def build_board(options, filename):
    height = 130 + 244 * len(options)
    board = node('svg', width=1500, height=height, viewBox=f'0 0 1500 {height}')
    board.append(node('rect', width=1500, height=height, fill='#17151c'))
    text(board, 30, 42, 'SUBCULT / Registration line studies' if filename == 'registration-comparison' else 'SUBCULT / Logo legibility studies', 28)
    text(board, 30, 72, 'Review concepts. Small samples render at their labeled pixel widths; inspect at 100%.', 16, '#c9c3d1')
    records = []
    for row, (key, label, detail) in enumerate(options):
        y = 105 + row * 244
        text(board, 30, y + 22, label, 20)
        text(board, 30, y + 46, detail, 14, '#c9c3d1')
        for col, (theme, caption, bg) in enumerate(THEMES):
            mark = make_mark(key, theme)
            name = f'{key}-{theme}.svg'
            ET.ElementTree(mark).write(ROOT / name, encoding='utf-8', xml_declaration=True)
            x = 30 + col * 490
            panel_y = y + 60
            board.append(node('rect', x=x, y=panel_y, width=470, height=170, rx=6, fill=bg))
            fg = '#100b19' if theme == 'color' else '#ffffff'
            if theme == 'reverse' and key in ('original', 'a-integrated'):
                caption = 'White / green fill / dark'
            if theme == 'reverse' and key == 'd-compact':
                caption = 'White / dark'
            if key in ('b-registration', 'c-registration') and theme == 'mono':
                caption = 'White / green lines / dark'
            text(board, x + 14, panel_y + 23, caption, 14, fg)
            cursor = x + 12
            for size in (112, 64, 48, 32, 24, 16):
                sample = copy.deepcopy(mark)
                sample.set('x', str(cursor))
                sample.set('y', str(panel_y + 34 + (112-size)/2))
                sample.set('width', str(size))
                sample.set('height', str(size))
                board.append(sample)
                text(board, cursor, panel_y + 158, str(size), 12, fg)
                cursor += size + 19
            if key != 'original':
                records.append({'path': name, 'sha256': hashlib.sha256((ROOT/name).read_bytes()).hexdigest()})
    ET.ElementTree(board).write(ROOT/f'{filename}.svg', encoding='utf-8', xml_declaration=True)
    subprocess.run(['rsvg-convert', str(ROOT/f'{filename}.svg'), '-o', str(ROOT/f'{filename}.png')], check=True)
    return records


def main():
    records = build_board(OPTIONS, 'comparison')
    build_board(OPTIONS[-2:], 'registration-comparison')
    manifest = {'status': 'review-only', 'source': str(SOURCE.relative_to(ROOT.parent.parent.parent.parent)),
                'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
                'underscore': 'Single closed path from x=126.56219 to 215.57934; no overlay rectangle.',
                'files': records}
    (ROOT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print(f'Built {len(records)} concept SVGs and comparison board in {ROOT}')


if __name__ == '__main__':
    main()
