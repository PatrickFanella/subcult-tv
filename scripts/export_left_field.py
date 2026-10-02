"""Export the approved Left Field asset selection to a subcult-tv checkout."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / 'branding/2026-10-01-packs/brands/left-field'


def export(site):
    site=site.resolve()
    if not (site/'content/projects.json').is_file():
        raise ValueError('Destination must be a subcult-tv checkout')
    manifest=json.loads((PACK/'asset-manifest.json').read_text())
    hashes={entry['path']:entry['sha256'] for entry in manifest['files']}
    selected={
        'public/brand/left-field/mark.svg':'logos/mark-primary-outlined.svg',
        'public/brand/left-field/hero.svg':'product/hero-outlined.svg',
        'public/og/left-field.jpg':'product/og.jpg',
    }
    for path in sorted((PACK/'fonts').iterdir()):
        if path.is_file():
            selected['public/brand/left-field/fonts/'+path.name]='fonts/'+path.name
    files=[]
    for target,source in selected.items():
        path=PACK/source
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        if hashes.get(source)!=digest:
            raise ValueError('Source manifest mismatch: '+source)
        dest=site/target
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(path,dest)
        files.append({'source':str(path.relative_to(ROOT)),'target':target,'sha256':digest})
    provenance={'repository':'https://git.subcult.tv/subculture-collective/subcult-studio',
                'revision':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),
                'brand':'Left Field','direction':'The field ledger',
                'approval':'User approved the LF baseline/intersection revision on 2026-10-02',
                'files':files}
    (site/'docs/left-field-brand-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
    print(f'Exported {len(files)} approved Left Field assets; provenance written.')


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--site-root',type=Path,required=True)
    export(parser.parse_args().site_root)
