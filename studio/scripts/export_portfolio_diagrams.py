#!/usr/bin/env python3
"""Rebuild the selected diagram/terminal exports without overwriting later edits."""

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'docs/portfolio-visual-provenance.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    manifest = json.loads(MANIFEST.read_text())
    entries = [entry for entry in manifest['files']
               if entry['kind'] in ('implementation-diagram', 'terminal-render')]
    for entry in entries:
        for field, expected in [('source', entry['sourceSha256']), ('target', entry['sha256'])]:
            if digest(ROOT / entry[field]) != expected:
                raise SystemExit(f'Preserve the modified {field} before regenerating: {entry[field]}')
    subprocess.run([sys.executable, str(ROOT / 'studio/scripts/generate_portfolio_diagrams.py')], check=True)
    with tempfile.TemporaryDirectory(prefix='subcult-portfolio-export-') as temporary:
        work = Path(temporary)
        fonts = [ROOT / 'studio/brands' / slug / 'fonts'
                 for slug in ('rekolekt', 'pirs', 'super-productivity-mcp', 'subsets')]
        config = work / 'fonts.conf'
        config.write_text('<fontconfig>' + ''.join(f'<dir>{path}</dir>' for path in fonts)
                          + f'<cachedir>{work / "font-cache"}</cachedir></fontconfig>')
        environment = dict(os.environ, FONTCONFIG_FILE=str(config))
        for entry in entries:
            source, target = ROOT / entry['source'], ROOT / entry['target']
            outlined = work / source.name
            subprocess.run(['inkscape', str(source), '--export-text-to-path', '--export-plain-svg',
                            f'--export-filename={outlined}'], env=environment, check=True, capture_output=True)
            if entry['kind'] == 'implementation-diagram':
                target.write_bytes(outlined.read_bytes())
            else:
                raster = outlined.with_suffix('.png')
                subprocess.run(['inkscape', str(outlined), f'--export-filename={raster}'],
                               env=environment, check=True, capture_output=True)
                with Image.open(raster) as image:
                    image.convert('RGB').save(target, 'WEBP', quality=90, method=6)
            entry.update(sourceSha256=digest(source), sha256=digest(target))
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    media_path = ROOT / 'studio/media/catalog.json'
    media = json.loads(media_path.read_text())
    by_path = {entry['source'].removeprefix('studio/media/'): entry for entry in entries}
    for asset in media['assets']:
        if entry := by_path.get(asset['file']):
            asset.update(sha256=entry['sourceSha256'], bytes=(ROOT / entry['source']).stat().st_size)
    media_path.write_text(json.dumps(media, indent=2, ensure_ascii=False) + '\n')
    print(f'Exported {len(entries)} selected diagrams and terminal renders.')


if __name__ == '__main__':
    main()
