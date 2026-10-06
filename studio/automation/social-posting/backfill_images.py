"""Give prepared Instagram drafts that have no image a planned, rendered and checked one.

Only unexpired drafts whose posting time is still ahead are touched, and only
their `media` entry changes; captions, slots and evidence stay as written.
The previous result.json is kept beside the new one.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil

import craft
from changemaker_instagram import image_record
from runner import atomic_write

HERE = Path(__file__).resolve().parent


def candidates(state, now):
    for result in sorted((state/'runs').glob('*-changemaker/result.json')):
        try:
            data = json.loads(result.read_text())
        except (OSError, ValueError):
            continue
        for n, draft in enumerate(data.get('drafts', [])):
            media = draft.get('media') or {}
            try:
                due = datetime.fromisoformat(draft['due_at'])
                expires = datetime.fromisoformat(draft['expires_at'])
            except (KeyError, ValueError, TypeError):
                continue
            if draft.get('platform', 'instagram') == 'instagram' and not media.get('image') and due > now and expires > now:
                yield result, n, draft


def product_of(draft):
    """Brand from the evidence lines ("<id>: <title> — https://git.../<org>/<repo>/pulls/<n>")."""
    repos = []
    for line in draft.get('evidence', '').splitlines():
        if ' — ' in line:
            parts = line.rsplit(' — ', 1)[1].split('/')
            if len(parts) > 4:
                repos.append(parts[4])
    return craft.brand_for((draft.get('craft') or {}).get('product', ''), repos)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    cfg = json.loads((HERE/'config.json').read_text())
    now = datetime.now(timezone.utc)
    done = []
    for result, n, draft in list(candidates(args.state, now)):
        product = product_of(draft)
        if args.dry_run:
            done.append({'run': result.parent.name, 'draft': n, 'product': product})
            continue
        directory = result.parent/'craft'/'backfill'
        image, made, alt = craft.picture(cfg, draft['text'], product, directory, n)
        if not image or not Path(image).is_file():
            done.append({'run': result.parent.name, 'draft': n, 'product': product, 'image': None})
            continue
        data = json.loads(result.read_text())
        media = data['drafts'][n].setdefault('media', {})
        media.update(kind=made.get('kind', ''), headline=made.get('headline', ''), image=image_record(Path(image), args.state))
        if alt and not media.get('alt_text'):
            media['alt_text'] = alt
        backup = result.with_name('result.before-images.json')
        if not backup.exists():
            shutil.copy2(result, backup)
        atomic_write(result, json.dumps(data, indent=2)+'\n')
        done.append({'run': result.parent.name, 'draft': n, 'product': product, 'kind': media['kind'],
                     'checks_passed': not made.get('unresolved', False)})
    print(json.dumps(done, indent=2))


if __name__ == '__main__':
    main()
