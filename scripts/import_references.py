#!/usr/bin/env python3
"""Copy a verified snapshot of design references; leave a running downloader alone."""
import argparse
import hashlib
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAGS = {'y2k': 'Y2K', 'neo-brutalism': 'Neo-Brutalism', 'memphis': 'Memphis',
        'swiss': 'Swiss', 'hand drawn': 'Hand drawn', 'retro': 'Retro',
        'minimalist': 'Minimalist', 'monospace': 'Monospace', 'editorial': 'Editorial',
        'gradient': 'Gradients', '3d': '3D', 'portfolio': 'Portfolio', 'serif': 'Serif',
        'dark': 'Dark', 'light': 'Light', 'motion': 'Motion', 'geometric': 'Geometric'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def import_library(source, destination):
    source, destination = source.resolve(), destination.resolve()
    if source == destination or source in destination.parents or destination in source.parents:
        raise ValueError('Import source and destination must be separate directories')
    destination.mkdir(parents=True, exist_ok=True)
    copied, entries = {}, []

    def copy_file(path, expected=None):
        relative = path.relative_to(source)
        path.resolve().relative_to(source)
        data = path.read_bytes()
        digest = sha(data)
        if expected and digest != expected:
            raise ValueError(f'Hash mismatch: {relative}')
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        copied[str(relative)] = {'sha256': digest, 'bytes': len(data)}

    # Curated collections are copied in full, including measurements and galleries.
    for name in ('2026-10-02-websites', '2026-10-02-style-research', 'ESS'):
        for path in sorted((source / name).rglob('*')):
            if path.is_file() and '__pycache__' not in path.parts:
                copy_file(path)
    for path in sorted((source / 'scripts').glob('*.py')):
        copy_file(path)
    for name in ('README.md', 'scripts/README.md'):
        if (source / name).is_file():
            copy_file(source / name)

    def record(id, name, url, collection, folder, doc, summary, tags, provenance):
        images = sorted([p for p in folder.rglob('*') if p.suffix.lower() in
                         ('.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif')])
        images.sort(key=lambda p: (0 if p.name in ('settled.png', 'refero-reference.jpg', 'screenshot.jpg') else 1, str(p)))
        attachments = sorted([p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() in ('.md', '.json', '.css')])
        entries.append({'id': id, 'name': name, 'url': url, 'collection': collection,
                        'summary': summary, 'tags': sorted({tag[:1].upper() + tag[1:] for tag in tags}),
                        'document': str(doc.relative_to(destination)),
                        'images': [str(p.relative_to(destination)) for p in images],
                        'attachments': [str(p.relative_to(destination)) for p in attachments],
                        'provenance': provenance})

    websites = destination / '2026-10-02-websites'
    notes = json.loads((websites / 'editorial-notes.json').read_text())
    for item in json.loads((websites / 'sites.json').read_text()):
        note = notes[item['id']]
        record('website-' + item['id'], item['name'], item['url'], 'Website studies',
               websites / item['id'], websites / item['id'] / 'GUIDE.md', note['direction'],
               [part.strip() for part in note['category'].split('/')],
               {'kind': 'Curated site study', 'observedAt': '2026-10-02',
                'evidence': note['status'], 'limits': note['limits']})
    styles = destination / '2026-10-02-style-research'
    notes = json.loads((styles / 'editorial-notes.json').read_text())
    for item in json.loads((styles / 'sources.json').read_text()):
        note = notes[item['id']]
        record('study-' + item['id'], item['name'], item['live'], 'Style studies',
               styles / 'examples' / item['id'], styles / 'examples' / item['id'] / 'DESIGN.md',
               note[1], [item['category']],
               {'kind': 'Curated style study', 'observedAt': '2026-10-02',
                'referenceUrl': item.get('refero', ''), 'assessment': note[0], 'limits': note[3]})
    record('website-ess', 'Ethical Skeptic Society', 'https://ess.org/events/', 'Website studies',
           destination / 'ESS', destination / 'ESS/design-system.md',
           'Editorial design and event calendar reference.', ['Editorial', 'Events'],
           {'kind': 'Curated site study', 'observedAt': '2026-10-02'})

    # Read the atomically written manifest once. Only its completed bytes enter the snapshot.
    archive = source / 'refero-archive'
    snapshot = json.loads((archive / 'manifest.json').read_text()) if (archive / 'manifest.json').exists() else {'styles': {}}
    for id, item in sorted(snapshot['styles'].items()):
        if item.get('status') not in ('success', 'partial') or not item.get('exports'):
            continue
        if not re.fullmatch(r'[a-f0-9-]{36}', id):
            raise ValueError('Invalid Refero style ID')
        folder = archive / 'styles' / id
        for export in item['exports']:
            if Path(export['path']).name != export['path']:
                raise ValueError('Invalid export filename')
            copy_file(folder / export['path'], export['sha256'])
        meta_path = folder / 'metadata.json'
        copy_file(meta_path)
        meta = json.loads(meta_path.read_text())
        if item.get('screenshot'):
            image = item['screenshot']
            if Path(image['path']).name != image['path']:
                raise ValueError('Invalid screenshot filename')
            copy_file(folder / image['path'], image['sha256'])
        target_folder = destination / 'refero-archive/styles' / id
        doc = target_folder / item['exports'][0]['path']
        text = doc.read_text()
        name = re.sub(r'\s*[—–-]\s*Style Reference\s*$', '', meta.get('title', id))
        summary = next((line.lstrip('> ').strip() for line in text.splitlines() if line.startswith('> ')), '')
        # These are search aids derived from the reference prose, not verified style classifications.
        tags = [label for term, label in TAGS.items() if term not in ('dark', 'light', 'serif')
                and re.search(r'\b' + re.escape(term) + r'\b', text[:6000], re.I)]
        theme = re.search(r'\*\*Theme:\*\*\s*(dark|light)\b', text, re.I)
        if theme:
            tags.append(theme[1].capitalize())
        if re.search(r'(?<!sans-)(?<!sans )\bserif\b', text[:6000], re.I):
            tags.append('Serif')
        record('refero-' + id, name, item['sourceUrl'], 'Refero archive', target_folder, doc,
               summary, tags, {'kind': 'Refero interpreted reference',
                               'fetchedAt': meta.get('fetchedAt'), 'referenceUrl': item['sourceUrl'],
                               'screenshotCaptureDate': 'unknown', 'tagBasis': 'Keywords in reference prose',
                               'limits': meta.get('scope', 'Third-party reference; not an official design system.')})
    catalog = {'version': 1, 'importedAt': datetime.now(timezone.utc).isoformat(), 'entries': entries}
    (destination / 'catalog.json').write_text(json.dumps(catalog, indent=2) + '\n')
    (destination / 'import-manifest.json').write_text(json.dumps({'source': str(source),
        'importedAt': catalog['importedAt'], 'files': copied}, indent=2) + '\n')
    return catalog


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=Path.home() / 'Documents/Design References')
    parser.add_argument('--output', type=Path, default=ROOT / 'references')
    args = parser.parse_args()
    catalog = import_library(args.source, args.output)
    print(f"Imported {len(catalog['entries'])} references")
