#!/usr/bin/env python3
"""Check explicit public brand selections against their source and output hashes."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors = []
count = 0
for manifest in sorted((ROOT / 'docs').glob('*brand-provenance.json')):
    for entry in json.loads(manifest.read_text())['files']:
        for field in ('source', 'target'):
            path = (ROOT / entry[field]).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():
                errors.append(f'{manifest.name}: missing {field}: {entry[field]}')
            elif hashlib.sha256(path.read_bytes()).hexdigest() != (entry.get('sourceSha256', entry['sha256']) if field == 'source' else entry['sha256']):
                errors.append(f'{manifest.name}: changed {field}: {entry[field]}')
        count += 1
if errors:
    raise SystemExit('\n'.join(errors))
print(f'{count} selected public brand assets match their source and output hashes.')
