from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/import-manifest.json').read_text())
for entry in manifest['files']:
 p=root/entry['destination']
 if not p.exists() and not entry.get('git_tracked',True):continue
 assert p.is_file(),entry['destination']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==entry['sha256'],entry['destination']
print(f"Verified {len(manifest['files'])} import records against their source hashes (generated archives may be absent).")
