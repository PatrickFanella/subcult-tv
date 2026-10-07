#!/usr/bin/env python3
"""Regenerate prepared Instagram drafts the owner asked to re-roll; never approve or dispatch.

The review page queues a request on the website. This job claims it with the
preparation key, regenerates the caption, the image or both from the original
run's evidence, and writes a new run whose draft supersedes the old one. The
dashboard sync then carries the replacement to the review page.
"""
import argparse
from datetime import datetime, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.request

from changemaker_instagram import image_record, posting_slots, recent_captions, taken_slots
from changemaker_publications import preparation_settings
from runner import atomic_write
from sources import NoRedirect

HERE = Path(__file__).resolve().parent
DRAFT_ID = re.compile(r'^([0-9]{8}T[0-9]{6}(?:\.[0-9]{1,6})?Z-changemaker):([0-9]{1,2})$')
SHA256 = re.compile(r'^[a-f0-9]{64}$')
MODES = ('text', 'image', 'both')


def call(settings, path, payload=None):
    """POST to the website's preparation API; the key can only claim and finish re-rolls."""
    url = settings['POSTING_INGEST_URL']+path
    request = urllib.request.Request(url, data=json.dumps(payload or {}).encode(), method='POST', headers={
        'Authorization': 'Bearer '+settings['POSTING_PREPARATION_KEY'],
        'Content-Type': 'application/json', 'User-Agent': 'SUBCULT-draft-reroll/1.0'})
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        return json.loads(response.read(256_000))


def read_json(path, limit=2_000_000):
    if not path.is_file() or path.is_symlink() or path.stat().st_size > limit:
        raise ValueError(f'{path.name} is unavailable')
    return json.loads(path.read_text())


def original(state, draft_id):
    """The prepared draft and its run's evidence, read from local state only."""
    match = DRAFT_ID.match(draft_id or '')
    if not match:
        raise ValueError('Only prepared Instagram drafts can be re-rolled')
    directory = state/'runs'/match.group(1)
    if not directory.resolve().is_relative_to(state.resolve()):
        raise ValueError('Invalid draft run')
    drafts = read_json(directory/'result.json').get('drafts', [])
    index = int(match.group(2))
    if index >= len(drafts) or drafts[index].get('platform', 'instagram') != 'instagram':
        raise ValueError('The prepared draft is no longer available')
    sources = read_json(directory/'sources.json') if (directory/'sources.json').is_file() else {'items': []}
    return drafts[index], sources


def kept_image(draft, sha, state):
    """The prepared image record to keep; a missing or unknown hash keeps the main image."""
    media = draft.get('media') or {}
    options = [media.get('image')] + list(media.get('candidates') or [])
    options = [o for o in options if isinstance(o, dict) and SHA256.match(o.get('sha256', ''))]
    chosen = next((o for o in options if o['sha256'] == sha), options[0] if options else None)
    if not chosen:
        return None
    path = state/chosen.get('file', '')
    if path.is_symlink() or not path.resolve().is_relative_to(state.resolve()) or not path.is_file():
        return None
    return chosen


def validate_caption(text):
    if not isinstance(text, str) or not text.strip() or len(text) > 2200 or 'git.subcult.tv' in text.casefold():
        raise ValueError('The regenerated caption is invalid')
    return text.strip()


def regenerate(cfg, source_root, state, job, now):
    """Write one replacement run and return its draft ID."""
    if job.get('mode') not in MODES:
        raise ValueError('Unknown re-roll mode')
    old, sources = original(state, job['draft_id'])
    run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-changemaker'
    directory = state/'runs'/run_id
    directory.mkdir(parents=True, mode=0o700)
    import craft
    claims = (source_root/'content/social/Product Claims Register.md').read_text()
    note = (job.get('note') or '').strip()
    draft = json.loads(json.dumps(old))
    media = dict(draft.get('media') or {})
    record = {'mode': job['mode'], 'from': job['draft_id'], 'request': job['id'], 'note': note}
    text = draft['text']
    if job['mode'] == 'image':
        text = validate_caption(job.get('caption') or text)
    if job['mode'] in ('text', 'both'):
        image = kept_image(old, job.get('image_sha256', ''), state) if job['mode'] == 'text' else None
        result = craft.reroll_caption(cfg, {**draft, 'media': media}, sources, claims, directory/'craft', note=note,
                                      image=state/image['file'] if image else None, recent=recent_captions(state, now))
        text = validate_caption(result['text'])
        draft.setdefault('craft', {})['angle'] = result['angle']
        record['changed'] = result['changed']
        if job['mode'] == 'text':
            # Keep only the chosen picture: the alternatives were planned for the old caption.
            media.pop('candidates', None)
            if image:
                media['image'] = image
    if job['mode'] in ('image', 'both'):
        product = (draft.get('craft') or {}).get('product') or 'subcult'
        jpeg, made, alt = craft.picture(cfg, text, product, directory/'craft', 0, recent_kinds=[media.get('kind', '')],
                                        extra={'owner_note': note,
                                               'previous_image': {'kind': media.get('kind', ''), 'headline': media.get('headline', '')}})
        if not jpeg or not Path(jpeg).is_file():
            raise ValueError('Image generation did not produce a usable picture')
        media.pop('candidates', None)
        media.update(kind=made.get('kind', ''), headline=made.get('headline', ''), image=image_record(Path(jpeg), state),
                     alt_text=alt or media.get('alt_text', ''),
                     mode='generate' if made.get('kind') == 'illustration' else 'capture' if made.get('kind') == 'screenshot' else 'library')
        draft.setdefault('craft', {})['visual_checks'] = made.get('checks', [])[-1:]
    draft.update(text=text, media=media, supersedes=job['draft_id'], expires_at=(now+timedelta(days=7)).isoformat())
    try:
        due = datetime.fromisoformat(draft['due_at'])
    except (KeyError, TypeError, ValueError):
        due = now
    if due < now+timedelta(hours=26):
        draft['due_at'] = posting_slots(cfg, now, 1, taken_slots(state, now))[0].isoformat()
    craft_record = draft.setdefault('craft', {})
    craft_record['reroll'] = record
    if job['mode'] != 'image':
        craft_record['alternatives'] = [old['text']]
    atomic_write(directory/'result.json', json.dumps({'drafts': [draft], 'open_checks': []}, indent=2)+'\n')
    receipt = {'mode': 'changemaker', 'status': 'success', 'run_id': run_id, 'draft_count': 1,
               'checked_at': now.isoformat(), 'source_identities': [], 'reroll_of': job['draft_id'],
               'publishing_enabled': False}
    atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
    return run_id+':0'


def sync_dashboard():
    """Start the dashboard sync now instead of waiting for its five-minute timer."""
    try:
        subprocess.run(['systemctl', '--user', 'start', 'posting-dashboard-sync.service'], check=True, timeout=300,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except (OSError, subprocess.SubprocessError):
        return False


def execute(source_root, state, ingest_env, sync=sync_dashboard):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    settings = preparation_settings(ingest_env)
    with (state/'reroll.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status': 'busy'}
        jobs = call(settings, '/rerolls/claim')
        finished = []
        for job in jobs[:3]:
            try:
                result = regenerate(cfg, source_root, state, job, datetime.now(timezone.utc))
                finished.append((job, {'status': 'done', 'result_draft_id': result}))
            except Exception as error:  # report every failure to the owner instead of retrying silently
                (state/'reroll-errors.log').open('a').write(f"{datetime.now(timezone.utc).isoformat()} {job.get('id')} {type(error).__name__}: {str(error)[:1000]}\n")
                finished.append((job, {'status': 'failed', 'error': str(error)[:300] or type(error).__name__}))
        # The replacement must reach the website before the owner is told it is ready.
        synced = sync() if any(r['status'] == 'done' for _, r in finished) else None
        for job, result in finished:
            call(settings, f"/rerolls/{int(job['id'])}", result)
        return {'status': 'success', 'claimed': len(jobs), 'done': sum(r['status'] == 'done' for _, r in finished),
                'failed': sum(r['status'] == 'failed' for _, r in finished), 'synced': synced, 'publishing_enabled': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state, args.ingest_env)))
