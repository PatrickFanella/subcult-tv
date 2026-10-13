"""Export the selected public brand files for the product pages added October 12, 2026.

Copies each pack's mark, brand hero and fonts where the site uses them into
public/brand/<slug>/, converts the pack's social image to public/og/<slug>.jpg
where the pack owns it,
verifies every source against its pack manifest and records the selection in
docs/site-brand-provenance.json for scripts/check-public-assets.py.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[2]
BRANDS = REPO / 'studio/brands'

# slug -> (mark source, hero source or None, og source or None, fonts to serve)
SELECTION = {
    'chatty-cat': ('logos/mark-primary.svg', None, 'product/og.png', ['fonts/CascadiaMono-Regular.ttf', 'fonts/CascadiaMono-Bold.ttf', 'fonts/cascadiamono-OFL.txt']),
    # Marks for the products whose share images are captured from their landing heroes (October 13, 2026).
    'clpr': ('logos/mark-primary.svg', None, None, []),
    'patchwork': ('logos/mark-primary.svg', None, None, []),
    'hasanara': ('logos/mark-primary.svg', None, None, []),
    'rekolekt': ('logos/mark-primary.svg', None, None, []),
    'subcult-os': ('product/mark-tight-outlined.svg', None, None, []),
    'undertow': ('logos/mark-primary.svg', None, None, []),
    'prichal': ('logos/mark-primary.svg', None, None, []),
    'kork': ('logos/mark-primary.svg', None, None, ['fonts/AtkinsonHyperlegibleNext-Regular.otf', 'fonts/AtkinsonHyperlegibleNext-Bold.otf', 'fonts/atkinsonhyperlegiblenext-OFL.txt']),
    # Tadooer's pack, including its owner-approved share image, replaces the captured hero.
    'tadooer': ('logos/mark-primary.svg', None, 'product/og.png', ['fonts/Inter-0.ttf', 'fonts/Inter-1.ttf', 'fonts/inter-OFL.txt', 'fonts/Atkinson-Hyperlegible-Mono-0.ttf', 'fonts/Atkinson-Hyperlegible-Mono-1.ttf', 'fonts/atkinsonhyperlegiblemono-OFL.txt']),
    'backline': ('product/mark.svg', None, 'product/og.png', ['product/fonts/Oswald.woff2', 'product/fonts/Space-Grotesk.woff2', 'product/fonts/JetBrains-Mono.woff2', 'product/fonts/oswald-OFL.txt', 'product/fonts/spacegrotesk-OFL.txt', 'product/fonts/jetbrainsmono-OFL.txt']),
}
SITE_PACKS = ['arkhiv', 'overlaid', 'pirs', 'tmux-popups', 'omarchy-monitor-bar', 'omarchy-superproductivity', 'omarchy-plugin-spool', 'omarchy-plugin-shelfish', 'obsidian-plugin-metronome-tuner', 'super-productivity-mcp']
HEROES = {'overlaid', 'pirs', 'super-productivity-mcp'}
for slug in SITE_PACKS:
    SELECTION[slug] = ('product/mark.svg', 'product/hero.svg' if slug in HEROES else None, 'product/og.png', [])


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def manifest_hashes(pack: Path) -> dict:
    data = json.loads((pack / 'asset-manifest.json').read_text())
    rows = data if isinstance(data, list) else data.get('files', data.get('assets', []))
    return {row['path']: row['sha256'] for row in rows}


def export(site: Path) -> list:
    rows = []
    for slug, (mark, hero, og, fonts) in SELECTION.items():
        pack = BRANDS / slug
        approved = manifest_hashes(pack)
        selected = {f'public/brand/{slug}/mark.svg': mark}
        if hero:
            selected[f'public/brand/{slug}/hero.svg'] = hero
        for font in fonts:
            selected[f'public/brand/{slug}/fonts/{Path(font).name}'] = font
        for target, source in selected.items():
            src = pack / source
            if approved.get(source) != digest(src):
                raise SystemExit(f'{slug}: {source} is not in the pack manifest with its current hash')
            dest = site / target
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
            rows.append({'source': str(src.relative_to(REPO)), 'target': target, 'sha256': digest(src)})
        if og is None:
            continue
        src = pack / og
        if approved.get(og) != digest(src):
            raise SystemExit(f'{slug}: {og} is not in the pack manifest with its current hash')
        with Image.open(src) as image:
            if image.size != (1200, 630):
                raise SystemExit(f'{slug}: {og} is {image.size}, expected 1200x630')
            dest = site / 'public/og' / f'{slug}.jpg'
            dest.parent.mkdir(parents=True, exist_ok=True)
            image.convert('RGB').save(dest, quality=93)
        rows.append({'source': str(src.relative_to(REPO)), 'sourceSha256': digest(src), 'target': f'public/og/{slug}.jpg', 'sha256': digest(dest), 'conversion': 'RGB JPEG quality 93'})
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site-root', type=Path, default=REPO)
    args = parser.parse_args()
    site = args.site_root.resolve()
    if not (site / 'content/projects.json').is_file():
        raise SystemExit('Destination must be a subcult-tv checkout')
    rows = export(site)
    receipt = {
        'repository': 'subculture-collective/subcult-tv',
        'brands': sorted(SELECTION),
        'approval': 'Chatty Cat and Backline identities were owner-selected (October 11 and October 4, 2026); Tadooer was owner-approved on October 10, 2026; clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal and Kork are the selected production packs. The ten site packs were generated by studio/brand-tools/site_packs.py on October 12, 2026 and accepted by the owner on October 13, 2026.',
        'generator': 'studio/scripts/export_site_brands.py',
        'files': rows,
    }
    (site / 'docs/site-brand-provenance.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(f'Exported {len(rows)} files for {len(SELECTION)} brands into {site}')


if __name__ == '__main__':
    main()
