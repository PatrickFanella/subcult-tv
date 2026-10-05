"""Validate current asset metadata and the originals retained by repository cleanup."""
from pathlib import Path
import argparse
import hashlib
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = ROOT.parent
TOOLS = ROOT / 'brand-tools'
BRANDS = ROOT / 'brands'
STUDIES = [ROOT / 'studies' / name for name in ('clpr-directions', 'corkboard-directions', 'patrick-logo-study')]


def relocate(name, relocations):
    """Map a path recorded at the cleanup baseline to its current location."""
    for entry in relocations:
        for old, new in entry['moves']:
            if name == old or name.startswith(old.rstrip('/') + '/'):
                name = new + name[len(old):]
                break
    return name


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_manifest(path):
    data = json.loads(path.read_text())
    rows = data if isinstance(data, list) else data.get('files', data.get('assets', []))
    for row in rows:
        source = (path.parent / row['path']).resolve()
        if not source.is_relative_to(path.parent.resolve()) or not source.is_file():
            raise ValueError(f'Missing or unsafe manifested asset: {source}')
        if digest(source) != row['sha256'] or ('bytes' in row and source.stat().st_size != row['bytes']):
            raise ValueError(f'Manifest differs from current asset: {source}')
    if isinstance(data, dict):
        for row in data.get('sources', []):
            source = ROOT / row['path']
            if not source.is_file() or digest(source) != row['sha256']:
                raise ValueError(f'Authoritative source hash differs: {source}')
    return len(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-cleanup-originals', action='store_true', help='Compare current SVGs with the one-time cleanup baseline')
    args = parser.parse_args()
    manifests = [ROOT / 'asset-manifest.json', TOOLS / 'patrick/asset-manifest.json', TOOLS / 'patrick/waveform-variations/manifest.json']
    manifests += sorted(BRANDS.glob('*/asset-manifest.json'))
    assets = sum(check_manifest(path) for path in manifests)
    if args.check_cleanup_originals:
        receipt = json.loads((REPOSITORY / 'docs/cleanup-receipt.json').read_text())
        # The baseline map is a record and is never rewritten. A deliberate regeneration is
        # listed in a dated `superseded` entry, and the newest entry for a path is checked.
        superseded = {}
        for entry in receipt.get('superseded', []):
            unknown = set(entry['svg_sha256']) - set(receipt['retained_svg_sha256'])
            if unknown:
                raise ValueError(f'Superseding entry names SVGs outside the baseline: {sorted(unknown)[:3]}')
            superseded.update(entry['svg_sha256'])
        relocations = receipt.get('relocations', [])
        for name, expected in receipt['retained_svg_sha256'].items():
            source = REPOSITORY / relocate(name, relocations)
            if not source.is_file() or digest(source) != superseded.get(name, expected):
                raise ValueError(f'Preserved original changed since cleanup: {name}')
        baseline = len(receipt['retained_svg_sha256']) - len(superseded)
        print(f'Verified {baseline} exact SVG hashes from the cleanup baseline and {len(superseded)} recorded regenerations.')
    svgs = [path for folder in [BRANDS, TOOLS, *STUDIES] for path in folder.rglob('*.svg')]
    for path in svgs:
        ET.parse(path)
    print(f'Verified {len(manifests)} manifests ({assets} entries) and {len(svgs)} current SVGs.')


if __name__ == '__main__':
    main()
