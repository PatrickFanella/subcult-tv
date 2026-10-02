"""Verify original import identities against preserved Git history, not the live tree."""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = ROOT.parent
manifest = json.loads((ROOT / 'docs/history/import-manifest.json').read_text())
receipt = json.loads((REPOSITORY / 'docs/cleanup-receipt.json').read_text())
revision = receipt['original_studio_import']
entries = [entry for entry in manifest['files'] if entry.get('git_tracked', True)]
queries = ''.join(f"{revision}:{entry['destination']}\n" for entry in entries)
output = subprocess.check_output(['git', 'cat-file', '--batch'], input=queries.encode(), cwd=REPOSITORY)
offset = 0
for entry in entries:
    end = output.index(b'\n', offset)
    header = output[offset:end].split()
    if len(header) != 3 or header[1] != b'blob':
        raise ValueError(f"Original import blob missing: {entry['destination']}")
    length = int(header[2])
    data = output[end + 1:end + 1 + length]
    offset = end + 1 + length + 1
    if data.startswith(b'version https://git-lfs.github.com/spec/v1\n'):
        digest = next(line.split(b'oid sha256:', 1)[1].decode() for line in data.splitlines() if line.startswith(b'oid sha256:'))
    else:
        digest = hashlib.sha256(data).hexdigest()
    if digest != entry['sha256']:
        raise ValueError(f"Original import hash differs: {entry['destination']}")
print(f'Verified {len(entries)} original tracked import blobs/LFS identities at {revision[:12]}.')
print('Current production integrity is checked by check-studio and check-library.')
