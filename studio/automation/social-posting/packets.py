"""Load selected campaign packets and record immutable provenance, never capability proof."""
from datetime import date
import hashlib
import json
from pathlib import Path
import subprocess


def selected(root, records):
    out = {}
    for record in records:
        path = root/record['path']
        if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
            raise ValueError('Packet path leaves marketing root')
        raw = path.read_bytes()
        if len(raw) > 100_000 or hashlib.sha256(raw).hexdigest() != record['sha256']:
            raise ValueError('Packet hash or size mismatch')
        out[record['path']] = raw.decode()
    return out


def load(root, today=None, refresh=True):
    today = today or date.today()
    path = root/'packets.json'
    if not path.exists():
        return {}
    registry = json.loads(path.read_text())
    if registry.get('version') != 1:
        raise ValueError('Invalid packet registry')
    out = {}
    for key, entry in registry['projects'].items():
        docs = selected(root, entry['files'])
        flags = []
        if date.fromisoformat(entry['review_after']) < today:
            flags.append('Packet review is overdue; recheck positioning, offer and journey.')
        revision = 'studio-content'
        upstream = entry.get('upstream')
        if upstream:
            try:
                args = ['git', '-C', upstream['checkout']]
                if refresh:
                    subprocess.run(args+['fetch', '--quiet', upstream['remote'], upstream['ref']],
                                   capture_output=True, check=True, timeout=90)
                revision = subprocess.check_output(args+['rev-parse', upstream['remote']+'/'+upstream['ref']], text=True, timeout=10).strip()
                for name in upstream['documents']:
                    raw = subprocess.check_output(args+['show', revision+':'+name], timeout=10)
                    if len(raw) > 100_000:
                        raise ValueError('Packet too large')
                    docs[name] = raw.decode()
                if not refresh:
                    flags.append('Upstream refresh disabled; using locally observed revision.')
            except (OSError, ValueError, subprocess.SubprocessError):
                docs.update(selected(root, entry['fallback']))
                revision = entry['captured_revision']
                flags.append('Upstream packet unavailable; using dated captured snapshot. Recheck before approval.')
        fingerprint = hashlib.sha256(json.dumps(docs, sort_keys=True).encode()).hexdigest()
        out[key] = {'owner': entry['owner'], 'revision': revision, 'sha256': fingerprint,
                    'review_after': entry['review_after'], 'status': 'needs_review' if flags else 'current',
                    'flags': flags, 'documents': docs}
    return out
