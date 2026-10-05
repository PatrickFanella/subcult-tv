#!/usr/bin/env python3
"""Prepare one unapproved Instagram showcase draft for a live product; never dispatch.

Usage: showcase.py --product kork --state ~/.local/state/social-posting --source-root ~/Work/Subcult/subcult-tv/studio
The draft lands beside the Changemaker drafts so the review dashboard shows it.
"""
import argparse
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path

import craft
from changemaker_instagram import posting_slots, checklist, image_record, recent_captions
from runner import atomic_write

HERE = Path(__file__).resolve().parent


def execute(product, source_root, state):
    os.umask(0o077)
    cfg = json.loads((HERE/'config.json').read_text())
    if product not in craft.ART or product == 'subcult':
        raise SystemExit('Unknown product: choose one of '+', '.join(p for p in craft.ART if p != 'subcult'))
    now = datetime.now(timezone.utc)
    run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-changemaker'
    directory = state/'runs'/run_id
    directory.mkdir(parents=True, mode=0o700)
    claims = (source_root/'content/social/Product Claims Register.md').read_text()
    staged = craft.showcase(cfg, product, claims, directory/'craft', recent=recent_captions(state, now))
    drafts = []
    for n, (draft, slot) in enumerate(zip(staged['drafts'], posting_slots(cfg, now, len(staged['drafts'])))):
        if not draft['text'].strip() or len(draft['text']) > 2200 or 'git.subcult.tv' in draft['text']:
            continue
        media = {'mode': 'capture' if draft['media_record'].get('kind') == 'screenshot' else 'library', 'asset_ids': [],
                 'brief': draft['media']['kind']+': '+(draft['media']['headline'] or draft['angle']),
                 'alt_text': draft['alt_text'], 'kind': draft['media_record'].get('kind'), 'headline': draft['media_record'].get('headline', '')}
        image = Path(draft['image']) if draft['image'] else None
        if image and image.is_file():
            media['image'] = image_record(image, state)
        drafts.append({'account': draft['account'], 'platform': 'instagram', 'text': draft['text'], 'due_at': slot.isoformat(),
                       'expires_at': (now+timedelta(days=14)).isoformat(),
                       'evidence': 'Showcase of '+product+' from the claims register and its live page, captured '+now.date().isoformat(),
                       'next_check': draft['next_check'], 'checklist': checklist(draft['next_check']), 'media': media,
                       'craft': {**draft['craft'], 'angle': draft['angle'], 'product': product, 'kind': 'showcase'}})
    atomic_write(directory/'result.json', json.dumps({'drafts': drafts, 'open_checks': staged['open_checks']}, indent=2)+'\n')
    receipt = {'mode': 'changemaker', 'kind': 'showcase', 'product': product, 'status': 'success', 'run_id': run_id,
               'draft_count': len(drafts), 'checked_at': now.isoformat(), 'source_identities': [], 'publishing_enabled': False}
    atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
    return receipt


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--product', required=True)
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(execute(args.product, args.source_root, args.state)))
