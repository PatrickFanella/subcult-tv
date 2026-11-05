"""Export one selected product identity with source hashes and destination drift checks."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

STUDIO = Path(__file__).resolve().parents[1]
REPOSITORY = STUDIO.parent
PUBLIC = {
    'bill-nye-tv': 'web/public', 'democracy-now-tv': 'web/public',
    'video-archive-template': 'web/public', 'anarchist-archive': 'web/public',
    'arkhiv-riot-grrrl': 'web/public', 'lineage': 'web/public',
    'clustr': 'frontend/public', 'commons': 'public', 'envelope-editor': 'public',
    'edda': 'frontend/public', 'switchyard': 'web/public',
    'deadweb-relay': 'web/static',
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def export(slug, root, check=False):
    root = root.resolve()
    pack = STUDIO / 'brands' / slug
    manifest = json.loads((pack / 'asset-manifest.json').read_text())
    expected = {row['path']: row['sha256'] for row in manifest['files']}
    assert expected, 'An empty pack cannot be exported'
    for name, sha in expected.items():
        assert digest(pack / name) == sha, f'Studio source drift: {name}'
    receipt = root / 'docs/brand' / slug / 'export.json'
    old = json.loads(receipt.read_text()) if receipt.exists() else {}
    # A refresh must preserve later product edits rather than rewriting their baseline.
    if not check:
        for row in old.get('files', []):
            assert digest(root / row['target']) == row['sha256'], f'Product asset drift: {row["target"]}'
    selected = {'GUIDE.md': f'docs/brand/{slug}/GUIDE.md',
                'product/readme-lockup.png': f'docs/brand/{slug}/readme-lockup.png',
                'social/avatar.png': f'docs/brand/{slug}/avatar.png'}
    if slug in PUBLIC:
        public = PUBLIC[slug]
        for name in ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png', 'mark.svg']:
            selected['product/' + name] = f'{public}/brand/{slug}/{name}'
        # The shared Arkhiv source also serves its own identity: keep the collection
        # export namespaced and select it only in the Anarchist deployment profile.
        if slug != 'anarchist-archive':
            for name in ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png']:
                selected['product/' + name + '#root'] = f'{public}/{name}'
    rows = []
    for source_name, target_name in selected.items():
        source_name = source_name.split('#')[0]
        source = pack / source_name
        target = root / target_name
        sha = digest(source)
        assert sha == expected[source_name], source_name
        if check:
            assert digest(target) == sha, f'Export differs: {target_name}'
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        rows.append(dict(source=str(source.relative_to(REPOSITORY)), target=target_name,
                         sha256=sha, transformation='unchanged copy'))
    if not check:
        revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPOSITORY, text=True).strip()
        receipt.write_text(json.dumps(dict(studio_repository='subculture-collective/subcult-tv',
                                          studio_revision=revision, brand=slug, files=rows), indent=2) + '\n')
    return rows


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('product_root', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    print(f'{args.slug}: {len(export(args.slug, args.product_root, args.check))} assets verified')
