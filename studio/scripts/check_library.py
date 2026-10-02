"""Validate current asset metadata and the originals retained by repository cleanup."""
from pathlib import Path
import argparse
import hashlib
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = ROOT.parent
LIBRARY = ROOT / 'branding/library'


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
    manifests = [LIBRARY / 'asset-manifest.json', ROOT / 'branding/patrick/asset-manifest.json', ROOT / 'branding/patrick/waveform-variations/manifest.json']
    manifests += sorted((LIBRARY / 'brands').glob('*/asset-manifest.json'))
    assets = sum(check_manifest(path) for path in manifests)
    if args.check_cleanup_originals:
        receipt = json.loads((REPOSITORY / 'docs/cleanup-receipt.json').read_text())
        for name, expected in receipt['retained_svg_sha256'].items():
            source = REPOSITORY / name
            if not source.is_file() or digest(source) != expected:
                raise ValueError(f'Preserved original changed since cleanup: {name}')
        print(f'Verified {len(receipt["retained_svg_sha256"])} exact SVG hashes from the cleanup baseline.')
    svgs = list(LIBRARY.rglob('*.svg')) + list((ROOT / 'branding/patrick').rglob('*.svg'))
    for path in svgs:
        ET.parse(path)
    print(f'Verified {len(manifests)} manifests ({assets} entries) and {len(svgs)} current SVGs.')


if __name__ == '__main__':
    main()
