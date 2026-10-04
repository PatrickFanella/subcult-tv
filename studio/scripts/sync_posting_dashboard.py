#!/usr/bin/env python3
"""Sync only the redacted posting snapshot; never transfer runner state or secrets."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

REMOTE = '''
from pathlib import Path
import hashlib,json,os,subprocess,sys,tempfile
data=sys.stdin.buffer.read(2_000_001)
assert len(data)<=2_000_000
value=json.loads(data)
assert value['version']==1 and value['publishing_enabled'] is False
container=json.loads(subprocess.check_output(['docker','inspect','subcult-tv-api']))[0]
mounts=[m for m in container['Mounts'] if m['Destination']=='/studio']
assert len(mounts)==1
root=Path(mounts[0]['Source']).resolve()
assert root.is_relative_to(Path('/home/onnwee/.local/share/subcult-tv/studio-bundles'))
target=root/'posting.json'
assert target.is_file() and not target.is_symlink()
fd,name=tempfile.mkstemp(prefix='.posting-',dir=root)
try:
 with os.fdopen(fd,'wb') as out:out.write(data);out.flush();os.fsync(out.fileno())
 os.replace(name,target)
finally:
 if os.path.exists(name):os.unlink(name)
print(json.dumps({'sha256':hashlib.sha256(data).hexdigest(),'drafts':len(value['drafts']),'runs':len(value['runs'])}))
'''

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-root',type=Path,required=True)
    parser.add_argument('--state',type=Path,required=True)
    args=parser.parse_args()
    assert args.state.is_dir(), 'Runner state is unavailable'
    spec=importlib.util.spec_from_file_location('export_posting',args.source_root/'scripts/export_posting.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    data=json.dumps(module.snapshot(args.state),indent=2).encode()+b'\n'
    assert len(data)<=2_000_000
    # Python source is one quoted remote argument; no credential or source text enters shell code.
    import shlex
    result=subprocess.run(['ssh','nuc','python3 -c '+shlex.quote(REMOTE)],input=data,stdout=subprocess.PIPE,check=True)
    receipt=json.loads(result.stdout)
    assert receipt['sha256']==hashlib.sha256(data).hexdigest()
    print(json.dumps(receipt))

if __name__=='__main__':main()
