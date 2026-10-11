"""Web assets and design-system copy for Tadooer, from the Tadooer pack artwork.

Writes brands/tadooer/product/: favicon.svg (outlined), apple-touch-icon.png (180),
icon-512.png and icon-maskable-512.png for the web manifest (the mark inside the
maskable safe zone on crust) and og.png (1200x630, no URL: the planner has no public
domain and no sign-up). Text is converted to paths so browsers render the SVGs without
the pack fonts.

When TADOOER_SOURCE names a productivity-suite checkout, copies its design system into
brands/tadooer/design-system/ and records each file's SHA-256 in source-provenance.json.
The copy made on October 2, 2026 came from ~/.t3/worktrees/productivity-suite/t3code-300198f7.
Studio tightened the copied README on October 3, 2026, so the copy step no longer runs by
default: a fresh copy replaces that wording and its provenance notes.
Run before build_packs.py so the pack manifest includes these files.
"""
from pathlib import Path
import datetime, hashlib, json, os, shutil, subprocess
from PIL import Image
R = Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE'] = str(R / 'fontconfig.xml')
import design_helpers as H
import tadooer_assets as TD
d = next(b for b in json.loads((R / 'brands.json').read_text()) if b['slug'] == 'tadooer')
OUT = R.parent / 'brands/tadooer/product'
OUT.mkdir(parents=True, exist_ok=True)

def outlined(name, body, w, h):
    raw = OUT / f'.{name}.raw.svg'; raw.write_text(H.svg(body, w, h, f'Tadooer {name}'))
    dest = OUT / f'{name}.svg'
    subprocess.run(['inkscape', str(raw), '--export-text-to-path', '--export-plain-svg', '--export-type=svg', '--export-filename=' + str(dest)], check=True, capture_output=True)
    raw.unlink()
    return dest

def png(svg, name, w, opaque=True):
    subprocess.run(['rsvg-convert', '-w', str(w), '-o', str(OUT / name), str(svg)], check=True)
    if opaque: Image.open(OUT / name).convert('RGB').save(OUT / name, optimize=True)

outlined('favicon', TD.mark(d, 0, 0, 160), 160, 160)
icon = outlined('.apple-touch-icon', H.rect(0, 0, 180, 180, TD.CRUST) + TD.mark(d, 0, 0, 180), 180, 180)
png(icon, 'apple-touch-icon.png', 180); icon.unlink()
# The manifest icon is the suite icon at full bleed on crust; the maskable icon keeps the mark
# inside the 80 percent safe zone so a circular or squircle mask does not cut the disc.
icon = outlined('.icon-512', H.rect(0, 0, 512, 512, TD.CRUST) + TD.mark(d, 0, 0, 512), 512, 512)
png(icon, 'icon-512.png', 512); icon.unlink()
icon = outlined('.icon-maskable-512', H.rect(0, 0, 512, 512, TD.CRUST) + TD.mark(d, 51, 51, 410), 512, 512)
png(icon, 'icon-maskable-512.png', 512); icon.unlink()
og = H.rect(0, 0, 1200, 630, d['bg'])
og += TD.mark(d, 80, 72, 88)
og += TD.wordmark(d, 192, 142, size=84)
og += H.txt(80, 204, d['tag'], 20, d['safe_label'], d['label'])
og += H.rect(80, 222, 200, 6, d['accent'])
og += H.txt(80, 324, d['headline'][0], 56, d['fg'], d['display'], 700, maxw=520) + H.txt(80, 390, d['headline'][1], 56, d['fg'], d['display'], 700, maxw=520)
og += H.txt(80, 468, 'A private planner for one owner.', 26, d['fg'], d['body'], maxw=520) + H.txt(80, 504, 'Self-hosted. No sign-up.', 26, d['fg'], d['body'], maxw=520)
og += H.txt(80, 570, 'TADOOER / BY SUBCULT · PRIVATE, SELF-HOSTED', 18, d['safe_label'], d['label'])
og += TD.day(d, 640, 60, 480, 510)
ogsvg = outlined('.og', og, 1200, 630); png(ogsvg, 'og.png', 1200); ogsvg.unlink()
(OUT / 'README.md').write_text('# Tadooer product web assets\n\n`tadooer_product_assets.py` generates these files from the Tadooer pack artwork. Text is outlined. `favicon.svg`, `apple-touch-icon.png`, `icon-512.png` and `icon-maskable-512.png` go in `apps/web/public/` and the web manifest. `og.png` has no URL because the planner has no public domain. The owner approved its headline with the rest of the pack on October 10, 2026. Copy the files into the product. To change one, regenerate it here; do not edit the copies.\n')

# Design-system copy with provenance. Skipped unless TADOOER_SOURCE is set: Studio's copy of the
# README was tightened on October 3, 2026, and a fresh copy replaces that wording.
DS = R.parent / 'brands/tadooer/design-system'
if not os.environ.get('TADOOER_SOURCE'):
    print(sorted(p.name for p in OUT.iterdir()), 'design-system copy kept; set TADOOER_SOURCE to re-copy')
else:
    CHECKOUT = Path(os.environ['TADOOER_SOURCE'])
    SRC = CHECKOUT / 'docs/design'
    if DS.exists(): shutil.rmtree(DS)
    files = []
    for p in sorted(SRC.rglob('*')):
        if p.is_file():
            rel = p.relative_to(SRC); dest = DS / rel; dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, dest)
            files.append({'path': str(rel), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size})
    revision = subprocess.run(['git', '-C', str(SRC), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    branch = subprocess.run(['git', '-C', str(SRC), 'branch', '--show-current'], capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(['git', '-C', str(SRC), 'status', '--porcelain', '--', 'docs/design', 'apps/web/public/suite-icon.svg'], capture_output=True, text=True).stdout.strip()
    mark_source = CHECKOUT / 'apps/web/public/suite-icon.svg'
    (DS / 'source-provenance.json').write_text(json.dumps({
        'source_repository': 'subculture-collective/productivity-suite',
        'source_path': 'docs/design/',
        'source_checkout': str(CHECKOUT),
        'source_branch': branch,
        'source_head': revision,
        'source_docs_committed': not dirty,
        'copied_at': datetime.date.today().isoformat(),
        'mark_source': {'path': 'apps/web/public/suite-icon.svg', 'sha256': hashlib.sha256(mark_source.read_bytes()).hexdigest(), 'note': 'tadooer_assets.mark redraws this geometry in the pack colours; the product file is the master'},
        'files': files}, indent=2) + '\n')
    print(sorted(p.name for p in OUT.iterdir()), len(files), 'design-system files')
