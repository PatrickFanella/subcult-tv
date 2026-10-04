"""Export the approved Subsets identity and real TUI rendering to the public site."""
import argparse
import hashlib
import html
import json
import os
import shutil
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PACK = REPO / 'studio/branding/library/brands/subsets'

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def export(site, product):
    site, product = site.resolve(), product.resolve()
    if not (site/'content/projects.json').is_file():
        raise ValueError('Destination must be a subcult-tv checkout')
    capture_path = product/'site/assets/tui-capture.json'
    capture = json.loads(capture_path.read_text())
    frame = capture['frames']['skills']
    if capture.get('columns') != 80 or max(map(len, frame.splitlines())) > 80:
        raise ValueError('Expected the reviewed 80-column TUI capture')
    lines = ''.join(f'<text x="96" y="{210+i*30}" font-family="JetBrains Mono" font-size="21" xml:space="preserve" fill="#eef1ef">{html.escape(line)}</text>' for i,line in enumerate(frame.splitlines()))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><rect width="1440" height="900" fill="#d9dedc"/><rect x="80" y="128" width="1290" height="650" rx="8" fill="#17201e"/><rect x="64" y="96" width="1290" height="650" rx="8" fill="#17201e" stroke="#64716c"/><text x="96" y="154" font-family="Space Grotesk" font-weight="700" font-size="27" fill="#94f7b7">subsets / terminal</text>{lines}<text x="64" y="834" font-family="JetBrains Mono" font-size="20" fill="#17201e">ACTUAL TUI RENDER / SAMPLE SKILLS / {html.escape(capture["version"])}</text></svg>'
    (PACK/'product').mkdir(exist_ok=True)
    (PACK/'product/hero.svg').write_text(svg)
    (PACK/'product/tui-provenance.json').write_text(json.dumps({'sourceCommit':capture['sourceCommit'],'sourceDirty':capture.get('sourceDirty'),'tuiSourceSha256':capture.get('tuiSourceSha256'),'version':capture['version'],'captureSha256':digest(capture_path),'kind':capture['kind'],'generator':'studio/scripts/export_subsets.py'},indent=2)+'\n')
    env = os.environ | {'FONTCONFIG_FILE':str(PACK/'fontconfig.xml')}
    subprocess.run(['inkscape',str(PACK/'product/hero.svg'),'--export-text-to-path','--export-plain-svg',f'--export-filename={PACK/"product/hero-outlined.svg"}'],env=env,check=True,capture_output=True)
    # Refresh the source manifest after adding the original product illustration.
    subprocess.run(['python3',str(PACK/'build.py')],check=True)
    exported = json.loads((product/'site/assets/brand/brand-export.json').read_text())
    selected = {f'public/brand/subsets/{x["path"]}':x['path'] for x in exported['assets']}
    selected['public/brand/subsets/product/hero.svg']='product/hero-outlined.svg'
    rows=[]
    manifest=json.loads((PACK/'asset-manifest.json').read_text())
    approved={x['path']:x['sha256'] for x in manifest['assets']}
    for target, source in selected.items():
        p=PACK/source
        if approved.get(source)!=digest(p):
            raise ValueError('Source manifest mismatch: '+source)
        dest=site/target
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(p,dest)
        rows.append({'source':str(p.relative_to(REPO)),'target':target,'sha256':digest(p)})
    from PIL import Image
    (site/'public/og').mkdir(exist_ok=True)
    Image.open(PACK/'social/og.png').convert('RGB').save(site/'public/og/subsets.jpg',quality=93)
    rows.append({'source':'studio/branding/library/brands/subsets/social/og.png','sourceSha256':digest(PACK/'social/og.png'),'target':'public/og/subsets.jpg','sha256':digest(site/'public/og/subsets.jpg'),'conversion':'RGB JPEG quality 93'})
    (site/'docs/subsets-brand-provenance.json').write_text(json.dumps({'repository':'subculture-collective/subcult-tv','brand':'Subsets','direction':'Personal Utility','approval':'Owner approved branding and public landing on October 4, 2026','files':rows},indent=2)+'\n')
    # Public product repository: a smaller selection, without private guides/fonts.
    target=product/'assets/brand'
    rows=[]
    for relative in ['logos/mark-primary.svg','logos/mark-mono.svg','logos/lockup-primary-outlined.svg','social/banner-x-bluesky.png','social/avatar.png']:
        p=PACK/relative; dest=target/relative; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(p,dest)
        rows.append({'path':relative,'sha256':digest(p),'bytes':p.stat().st_size})
    (target/'brand-export.json').write_text(json.dumps({'brand':'subsets','status':'approved identity','assets':rows},indent=2)+'\n')
    print(f'Exported Subsets public assets, original TUI illustration, and repository branding.')

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--site-root',type=Path,required=True)
    parser.add_argument('--product-root',type=Path,required=True)
    args=parser.parse_args()
    export(args.site_root,args.product_root)
