import paths
#!/usr/bin/env python3
"""Local social media catalog. No network uploads or publication."""
import argparse
from datetime import datetime, timezone
import fcntl
import hashlib
import html
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

LIBRARY = '001 Projects/Works/Social Posts/Media Library'


def atomic(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', dir=path.parent, delete=False) as f:
        f.write(data)
        temporary = Path(f.name)
    temporary.replace(path)


def file_hash(path):
    with Path(path).open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()


def asset_file(library, asset):
    root = Path(library).resolve()
    path = (root/asset['file']).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError('Missing or unsafe media file: '+asset['id'])
    if file_hash(path) != asset['sha256']:
        raise ValueError('Media bytes changed: '+asset['id'])
    return path


def read_catalog(library):
    path = Path(library)/'catalog.json'
    if not path.exists():
        return {'version':1, 'assets':[]}
    catalog = json.loads(path.read_text())
    if catalog.get('version') != 1 or not isinstance(catalog.get('assets'), list):
        raise ValueError('Unsupported media catalog')
    ids = set()
    for asset in catalog['assets']:
        if asset['id'] in ids:
            raise ValueError('Duplicate media ID')
        ids.add(asset['id'])
        asset_file(library, asset)
    return catalog


def context(cfg):
    library = paths.root(cfg)/cfg.get('media_library', LIBRARY)
    catalog = read_catalog(library)
    return {'library':str(library), 'assets':[a for a in catalog['assets']
        if a['status'] != 'retired' and a['rights'] != 'unknown'],
        'boundary':'Catalog availability and visual review are not publication approval. Generated art is illustration, never workflow or news evidence.'}


def validate_choice(choice, catalog, account):
    if not choice:
        return  # Historical results predate the media schema.
    mode = choice['mode']
    ids = choice['asset_ids']
    if mode not in ['none','library','generate','capture'] or len(ids) > 4 or len(ids) != len(set(ids)):
        raise ValueError('Invalid media selection')
    if mode != 'library' and ids:
        raise ValueError('Only library selections can reference assets')
    if mode == 'library':
        if not ids or not choice['alt_text'].strip() or len(choice['alt_text']) > 1000:
            raise ValueError('Library media needs assets and concise alt text')
        assets = {a['id']:a for a in catalog['assets']}
        for aid in ids:
            asset = assets.get(aid)
            if not asset or asset['status'] == 'retired' or asset['rights'] == 'unknown':
                raise ValueError('Unavailable or uncleared media asset')
            if account not in asset['accounts'] or 'x' not in asset['platforms']:
                raise ValueError('Media account/platform mismatch')
            if asset['kind'] != 'video' and (asset['bytes'] > 5_000_000 or max(asset['width'],asset['height']) >= 8192):
                raise ValueError('Media exceeds conservative Buffer X image limits')
    if mode in ['generate','capture'] and not choice['brief'].strip():
        raise ValueError('Media request needs a production brief')
    if mode == 'generate' and not choice['alt_text'].strip():
        raise ValueError('Generated illustration needs proposed alt text')


def render_choice(choice):
    if not choice:
        return []
    return ['Media: '+choice['mode']+(' — '+', '.join(choice['asset_ids']) if choice['asset_ids'] else ''), '',
            ('Media brief: '+choice['brief']).rstrip(), '', ('Proposed alt text: '+choice['alt_text']).rstrip(), '']


def save_requests(directory, result):
    requests = [{'account':d['account'], 'due_at':d['due_at'], 'text':d['text'], 'media':d['media'],
                 'state':'needs_production', 'publishing_enabled':False}
                for d in result['drafts'] if d.get('media',{}).get('mode') in ['generate','capture']]
    atomic(Path(directory)/'media-requests.json', json.dumps(requests,indent=2)+'\n')


def probe(path):
    result = subprocess.run(['ffprobe','-v','error','-show_entries',
        'stream=codec_type,width,height:format=duration','-of','json',str(path)],
        capture_output=True,text=True,timeout=20,check=True)
    data = json.loads(result.stdout)
    video = next(s for s in data['streams'] if s['codec_type'] == 'video')
    return {'width':video['width'], 'height':video['height'],
            'duration_seconds':float(data.get('format',{}).get('duration',0))}


def add(library, source, *, title, products, accounts, platforms, rights, kind, source_ref, alt_text, prompt='', attribution=''):
    library = Path(library)
    library.mkdir(parents=True,exist_ok=True)
    if rights == 'licensed' and not attribution.strip():
        raise ValueError('Licensed media needs recorded attribution/license terms')
    source = Path(source).resolve()
    if source.suffix.lower() not in ['.png','.jpg','.jpeg','.webp','.gif','.mp4','.webm','.mov']:
        raise ValueError('Unsupported media type')
    metadata = probe(source)
    digest = file_hash(source)
    with (library/'.catalog.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        catalog = read_catalog(library)
        duplicate = next((a for a in catalog['assets'] if a['sha256'] == digest),None)
        if duplicate:
            return duplicate
        aid = 'MEDIA-'+digest[:16]
        relative = 'files/'+aid+source.suffix.lower()
        target = library/relative
        target.parent.mkdir(exist_ok=True)
        if target.exists():
            raise ValueError('Media ID collision; existing bytes preserved')
        shutil.copyfile(source,target)
        asset = {'id':aid,'title':title,'file':relative,'sha256':digest,'bytes':target.stat().st_size,
                 'products':products,'accounts':accounts,'platforms':platforms,'rights':rights,
                 'kind':kind,'source':source_ref,'alt_text':alt_text,'generation_prompt':prompt,
                 'status':'needs_review','created_at':datetime.now(timezone.utc).isoformat(),
                 'attribution':attribution,'uses':[],**metadata}
        catalog['assets'].append(asset)
        atomic(library/'catalog.json',json.dumps(catalog,indent=2,ensure_ascii=False)+'\n')
        return asset


def gallery(library):
    library = Path(library)
    catalog = read_catalog(library)
    rows = []
    for a in catalog['assets']:
        escape = html.escape
        src = escape(a['file'],quote=True)
        visual = (f'<img src="{src}" alt="{escape(a["alt_text"],quote=True)}" loading="lazy">'
                  if a['kind'] in ['image','illustration','screenshot'] else f'<video src="{src}" controls preload="metadata"></video>')
        rows.append(f'<article>{visual}<h2>{escape(a["title"])}</h2><p>{escape(", ".join(a["products"]))}</p>'
                    f'<p>{escape(a["id"])} · {a["width"]} × {a["height"]}</p>'
                    f'<p>{escape(a["status"])} · {escape(a["rights"])} · {escape(a["kind"])}</p>'
                    f'<p>{escape(a["alt_text"])}</p><a href="{src}">Open original</a></article>')
    page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SUBCULT media library</title><style>body{background:#18181b;color:#eee;font:16px system-ui;max-width:1200px;margin:40px auto;padding:0 24px}h1{font-size:42px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{background:#26262a;padding:16px;border-radius:12px}img,video{width:100%;height:auto}a{color:#fb907e}p{line-height:1.5;overflow-wrap:anywhere}</style>
<h1>SUBCULT media library</h1><p>Originals, illustrations and product captures. Asset review is separate from post approval.</p><main>'''+''.join(rows)+'</main></html>'
    atomic(library/'index.html',page)
    return str(library/'index.html')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--library',type=Path)
    sub = parser.add_subparsers(dest='command',required=True)
    add_parser = sub.add_parser('add')
    add_parser.add_argument('source',type=Path)
    for flag in ['title','products','accounts','platforms','source-ref','alt-text']:
        add_parser.add_argument('--'+flag,required=True)
    add_parser.add_argument('--rights',choices=['user_owned','generated','licensed','unknown'],required=True)
    add_parser.add_argument('--kind',choices=['image','illustration','screenshot','video'],required=True)
    add_parser.add_argument('--prompt',default='')
    add_parser.add_argument('--attribution',default='')
    search = sub.add_parser('search')
    search.add_argument('--product')
    sub.add_parser('audit')
    sub.add_parser('gallery')
    args = parser.parse_args()
    cfg = json.loads(Path(__file__).with_name('config.json').read_text())
    library = args.library or paths.root(cfg)/cfg.get('media_library',LIBRARY)
    if args.command == 'add':
        asset = add(library,args.source,title=args.title,products=args.products.split(','),accounts=args.accounts.split(','),
            platforms=args.platforms.split(','),source_ref=args.source_ref,alt_text=args.alt_text,
            rights=args.rights,kind=args.kind,prompt=args.prompt,attribution=args.attribution)
        print(json.dumps(asset,indent=2))
    elif args.command == 'gallery':
        print(gallery(library))
    else:
        catalog = read_catalog(library)
        assets = catalog['assets']
        if args.command == 'search' and args.product:
            assets = [a for a in assets if args.product.casefold() in [p.casefold() for p in a['products']]]
        print(json.dumps({'assets':assets} if args.command=='search' else {'status':'valid','asset_count':len(assets)},indent=2))


if __name__ == '__main__':
    main()
