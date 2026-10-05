"""Web assets, design-system copy and landing page for Dedhed, from the Dedhed pack artwork.

Writes brands/dedhed/product/: favicon.svg, apple-touch-icon.png (180), hero.svg (the
tape shelf, transparent) and og.png (1200x630, no URL: the pilot has no public domain).
Text is converted to paths so browsers render the SVGs without the pack fonts.

When DEDHED_SOURCE names a dedhed checkout, copies its design-system proposal into
brands/dedhed/design-system/ and records each file's SHA-256 in source-provenance.json.
The copy made on October 2, 2026 came from ~/.t3/worktrees/dedhed/t3code-859bfaaf.
Studio reworded the copied README and example pages on October 3, 2026, so the copy step
no longer runs by default: a fresh copy replaces that wording and its provenance notes.
Run before build_packs.py so the pack manifest includes these files.
"""
from pathlib import Path
import datetime, hashlib, json, os, shutil, subprocess
R = Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE'] = str(R / 'fontconfig.xml')
import design_helpers as H
import dedhed_assets as DH
d = next(b for b in json.loads((R / 'brands.json').read_text()) if b['slug'] == 'dedhed')
OUT = R.parent / 'brands/dedhed/product'
OUT.mkdir(parents=True, exist_ok=True)

def outlined(name, body, w, h):
    raw = OUT / f'.{name}.raw.svg'; raw.write_text(H.svg(body, w, h, f'Dedhed {name}'))
    dest = OUT / f'{name}.svg'
    subprocess.run(['inkscape', str(raw), '--export-text-to-path', '--export-plain-svg', '--export-type=svg', '--export-filename=' + str(dest)], check=True, capture_output=True)
    raw.unlink()
    return dest

def png(svg, name, w):
    subprocess.run(['rsvg-convert', '-w', str(w), '-o', str(OUT / name), str(svg)], check=True)

outlined('favicon', DH.mark(d, 0, 0, 160), 160, 160)
icon = outlined('.apple-touch-icon', H.rect(0, 0, 180, 180, d['bg']) + DH.mark(d, 10, 10, 160), 180, 180)
png(icon, 'apple-touch-icon.png', 180); icon.unlink()
outlined('hero', DH.shelf(d, 0, 0, 720, 440), 720, 440)
og = H.rect(0, 0, 1200, 630, d['bg'])
og += DH.wordmark(d, 80, 150, size=96)
og += H.txt(80, 196, d['tag'], 20, d['safe_label'], d['label'])
og += H.rect(80, 214, 200, 6, d['accent'])
og += H.txt(80, 320, d['headline'][0], 58, d['fg'], d['display'], 700, maxw=520) + H.txt(80, 388, d['headline'][1], 58, d['fg'], d['display'], 700, maxw=520)
og += H.txt(80, 470, 'Pull a tape off the shelf, or tune in', 26, d['fg'], d['body'], maxw=520) + H.txt(80, 506, 'to whatever everyone else is hearing.', 26, d['fg'], d['body'], maxw=520)
og += H.txt(80, 570, 'DEDHED / BY SUBCULT · PRIVATE PILOT', 18, d['safe_label'], d['label'])
og += DH.shelf(d, 620, 60, 500, 510, rows=5)
ogsvg = outlined('.og', og, 1200, 630); png(ogsvg, 'og.png', 1200); ogsvg.unlink()
(OUT / 'README.md').write_text('# Dedhed product web assets\n\n`dedhed_product_assets.py` generates these files from the Dedhed pack artwork. Text is outlined. `og.png` has no URL because the pilot has no public domain. Copy the files into the product. To change one, regenerate it here; do not edit the copies.\n')

# Design-system copy with provenance. Skipped unless DEDHED_SOURCE is set: Studio's copy was
# reworded on October 3, 2026, and a fresh copy replaces that wording.
DS = R.parent / 'brands/dedhed/design-system'
if not os.environ.get('DEDHED_SOURCE'):
    print(sorted(p.name for p in OUT.iterdir()), 'design-system copy kept; set DEDHED_SOURCE to re-copy')
else:
    SRC = Path(os.environ['DEDHED_SOURCE']) / 'docs/design'
    if DS.exists(): shutil.rmtree(DS)
    files = []
    for p in sorted(SRC.rglob('*')):
        if p.is_file():
            rel = p.relative_to(SRC); dest = DS / rel; dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, dest)
            files.append({'path': str(rel), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size})
    revision = subprocess.run(['git', '-C', str(SRC), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(['git', '-C', str(SRC), 'status', '--porcelain', '--', 'docs/design'], capture_output=True, text=True).stdout.strip()
    (DS / 'source-provenance.json').write_text(json.dumps({
        'source_repository': 'subculture-collective/dedhed',
        'source_path': 'docs/design/',
        'source_checkout': str(SRC.parents[1]),
        'source_head': revision,
        'source_docs_committed': not dirty,
        'copied_at': datetime.date.today().isoformat(),
        'inspiration': 'docs/inspo/ in the same repository (eleven cassette photographs, commit e5843b1)',
        'files': files}, indent=2) + '\n')
    print(sorted(p.name for p in OUT.iterdir()), len(files), 'design-system files')
