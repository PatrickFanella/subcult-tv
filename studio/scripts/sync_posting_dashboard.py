#!/usr/bin/env python3
"""Sync only the redacted posting snapshot and its prepared review JPEGs.

Never transfers runner state, prompts or secrets. Images are limited to those
referenced by current, unapproved Instagram drafts, each verified by SHA-256.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import inspect
import json
from pathlib import Path
import subprocess

MAX_SNAPSHOT = 2_000_000
MAX_IMAGE = 900 * 1024
MAX_MEDIA_TOTAL = 40 * 1024 * 1024
MAX_IMAGES = 120

# The remote side runs on the website host. STORE is importable for tests;
# MAIN locates the live studio bundle and keeps the original safety assertions.
STORE = '''
from pathlib import Path
import hashlib,json,os,re,tempfile
MAX_SNAPSHOT=2_000_000
MAX_IMAGE=900*1024
MAX_MEDIA_TOTAL=40*1024*1024
MAX_IMAGES=120
NAME=re.compile(r'^[a-f0-9]{64}\\.jpg$')
def read_exact(stream,size):
 data=stream.read(size)
 assert len(data)==size,'truncated transfer'
 return data
def atomic(directory,target,data):
 fd,name=tempfile.mkstemp(prefix='.posting-',dir=directory)
 try:
  with os.fdopen(fd,'wb') as out:out.write(data);out.flush();os.fsync(out.fileno())
  os.replace(name,target)
 finally:
  if os.path.exists(name):os.unlink(name)
def store(root,stream):
 header=json.loads(stream.readline(65_537))
 snapshot_size=header['snapshot']
 media=header['media']
 assert isinstance(snapshot_size,int) and 0<snapshot_size<=MAX_SNAPSHOT
 assert isinstance(media,list) and len(media)<=MAX_IMAGES
 assert sum(item['bytes'] for item in media)<=MAX_MEDIA_TOTAL
 data=read_exact(stream,snapshot_size)
 value=json.loads(data)
 assert value['version']==1 and value['publishing_enabled'] is False
 images={}
 for item in media:
  sha,size=item['sha256'],item['bytes']
  assert isinstance(sha,str) and NAME.match(sha+'.jpg') and isinstance(size,int) and 0<size<=MAX_IMAGE
  image=read_exact(stream,size)
  assert hashlib.sha256(image).hexdigest()==sha and image[:3]==b'\\xff\\xd8\\xff'
  images[sha]=image
 assert stream.read(1)==b'','unexpected trailing data'
 # Everything is verified before anything is written.
 target=root/'posting.json'
 assert target.is_file() and not target.is_symlink()
 directory=root/'posting-media'
 if not directory.exists() and not directory.is_symlink():directory.mkdir(mode=0o700)
 assert directory.is_dir() and not directory.is_symlink()
 assert directory.resolve()==root/'posting-media'
 kept=set()
 for sha,image in images.items():
  path=directory/(sha+'.jpg')
  if path.is_symlink():path.unlink()
  if not (path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest()==sha):atomic(directory,path,image)
  kept.add(path.name)
 # Images land before the snapshot that references them.
 atomic(root,target,data)
 removed=0
 for path in directory.iterdir():
  if NAME.match(path.name) and path.name not in kept:path.unlink();removed+=1
 return {'sha256':hashlib.sha256(data).hexdigest(),'drafts':len(value['drafts']),'runs':len(value['runs']),'media':sorted(n[:-4] for n in kept),'media_removed':removed}
'''

MAIN = '''
import subprocess,sys
container=json.loads(subprocess.check_output(['docker','inspect','subcult-tv-api']))[0]
mounts=[m for m in container['Mounts'] if m['Destination']=='/studio']
assert len(mounts)==1
root=Path(mounts[0]['Source']).resolve()
assert root.is_relative_to(Path('/home/onnwee/.local/share/subcult-tv/studio-bundles'))
print(json.dumps(store(root,sys.stdin.buffer)))
'''

REMOTE = STORE + MAIN


def expired(draft, now):
    value = draft.get('expires_at') or draft.get('due_at') or ''
    if not value:
        return False
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00')) <= now
    except ValueError:
        return True


def select_media(data, files, now=None):
    """Pick verified JPEGs for current unapproved Instagram drafts within the caps.

    References that cannot be sent are removed from the snapshot so the review
    page never offers an image the website host does not have.
    """
    now = now or datetime.now(timezone.utc)
    chosen, total = {}, 0
    for draft in data['drafts']:
        media = draft.get('media') or {}
        refs = ([media['image']] if media.get('image') else []) + list(media.get('candidates') or [])
        current = draft.get('platform') == 'instagram' and draft.get('approval') == 'unapproved' and not expired(draft, now)
        kept = []
        for ref in refs:
            sha = ref.get('sha256')
            if not current or sha not in files:
                continue
            if sha not in chosen:
                path = files[sha]
                try:
                    image = path.read_bytes() if path.is_file() and not path.is_symlink() else b''
                except OSError:
                    image = b''
                if (not image or len(image) > MAX_IMAGE or hashlib.sha256(image).hexdigest() != sha
                        or image[:3] != b'\xff\xd8\xff' or total + len(image) > MAX_MEDIA_TOTAL
                        or len(chosen) >= MAX_IMAGES):
                    continue
                chosen[sha] = image
                total += len(image)
            kept.append(ref)
        if media.get('image') and media['image'] not in kept:
            media.pop('image')
        if 'candidates' in media:
            media['candidates'] = [c for c in media['candidates'] if c in kept]
            if not media['candidates']:
                media.pop('candidates')
    return chosen


def payload(data, images):
    snapshot = json.dumps(data, indent=2).encode() + b'\n'
    assert len(snapshot) <= MAX_SNAPSHOT
    header = {'snapshot': len(snapshot), 'media': [{'sha256': sha, 'bytes': len(b)} for sha, b in images.items()]}
    return json.dumps(header).encode() + b'\n' + snapshot + b''.join(images.values()), snapshot


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--exporter', type=Path)
    args = parser.parse_args()
    assert args.state.is_dir(), 'Runner state is unavailable'
    spec = importlib.util.spec_from_file_location('export_posting', args.exporter or args.source_root/'scripts/export_posting.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    files = {}
    # An older installed exporter cannot list images; sync the snapshot alone.
    if 'media_files' in inspect.signature(module.snapshot).parameters:
        data = module.snapshot(args.state, source_root=args.source_root, media_files=files)
    else:
        data = module.snapshot(args.state, source_root=args.source_root)
    images = select_media(data, files)
    body, snapshot = payload(data, images)
    # Python source is one quoted remote argument; no credential or source text enters shell code.
    import shlex
    result = subprocess.run(['ssh', 'nuc', 'python3 -c ' + shlex.quote(REMOTE)], input=body, stdout=subprocess.PIPE, check=True)
    receipt = json.loads(result.stdout)
    assert receipt['sha256'] == hashlib.sha256(snapshot).hexdigest()
    assert receipt['media'] == sorted(images)
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
