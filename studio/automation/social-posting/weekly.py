#!/usr/bin/env python3
"""Prepare the weekly Instagram post: this week's work, then one call to action; never dispatch.

Runs mid-week for the coming weekly slot (config `weekly_cta`). Each run writes a new
caption and image from the week's Changemaker digests, so nothing is reposted. The ask
rotates through `weekly_cta.rotation` by ISO week. One draft per collection week (the ISO
week of the run in the owner's timezone); reruns are no-ops, and a run whose next slot is
more than seven days away records `missed_week` instead of drafting this week's evidence
into next week's slot. Configuration comes from the canonical checkout (`--source-root`),
like the sibling jobs. The draft lands beside the Changemaker drafts so the review dashboard shows it.
"""
import argparse
from datetime import datetime, timedelta, timezone
from preparation_lock import acquire
import json
import os
from pathlib import Path
from zoneinfo import ZoneInfo

from changemaker_instagram import checklist, image_record, recent_captions, taken_slots
from feedback import owner_feedback
import job_status
from runner import atomic_write
from changes import changes_context
from sources import complete_changemaker_digest

HERE = Path(__file__).resolve().parent
JOB = 'changemaker-weekly'
MAX_SLOT_DAYS = 7


def next_slot(cfg, now):
    """The first weekly slot at least 48 hours ahead."""
    weekly = cfg['weekly_cta']
    zone = ZoneInfo(cfg.get('timezone', 'America/Chicago'))
    hour, minute = map(int, weekly['time'].split(':'))
    earliest = now+timedelta(hours=48)
    day = earliest.astimezone(zone).date()
    while True:
        slot = datetime(day.year, day.month, day.day, hour, minute, tzinfo=zone)
        if slot.weekday() == weekly['weekday'] and slot >= earliest:
            return slot
        day += timedelta(days=1)


def week_of(moment):
    year, week, _ = moment.isocalendar()
    return f'{year}-W{week:02d}'


def collection_week(cfg, now):
    """The ISO week the run collects for: the current week in the owner's timezone.

    Keyed on the run, not the slot: a late catch-up run drafts this week's evidence
    without marking next week as prepared.
    """
    return week_of(now.astimezone(ZoneInfo(cfg.get('timezone', 'America/Chicago'))))


def call_to_action(cfg, slot):
    rotation = cfg['weekly_cta']['rotation']
    return rotation[slot.isocalendar()[1] % len(rotation)]


def prepared_weeks(state):
    weeks = set()
    for path in (state/'runs').glob('*-changemaker/receipt.json'):
        if path.is_symlink() or path.stat().st_size > 64000:
            continue
        try:
            receipt = json.loads(path.read_text())
        except (ValueError, OSError):
            continue
        if receipt.get('kind') == 'weekly' and receipt.get('status') == 'success':
            weeks.add(receipt.get('week'))
    return weeks


def week_evidence(context):
    """Merged pull requests from every complete digest in the window, renumbered W1, W2, ...

    Digest item IDs restart in each digest, so they are replaced to keep them unique.
    """
    items, seen, digests = [], set(), []
    for digest in context.get('drafts', []):
        try:
            complete_changemaker_digest({'drafts': [digest]})
        except ValueError:
            continue
        digests.append(digest)
        for item in digest['evidence'].get('items', []):
            if item.get('kind') != 'pull request' or item.get('state') != 'merged' or item.get('url') in seen:
                continue
            seen.add(item.get('url'))
            items.append({**item, 'id': f'W{len(items)+1}', 'digest_id': item.get('id'), 'digest_run': digest['run_id']})
    return items, digests


def validate(draft, items, cta, account):
    text = draft['text']
    if draft['account'] != account or not set(draft['source_ids']) <= items.keys():
        raise ValueError('Invalid weekly account or sources')
    if not text.strip() or len(text) > 2200 or 'git.subcult.tv' in text.casefold():
        raise ValueError('Invalid public Instagram caption')
    if cta['address'].casefold() not in text.casefold():
        raise ValueError('Weekly caption does not name its call-to-action address')
    if any(k in draft for k in ('approval', 'approved', 'published')):
        raise ValueError('Draft cannot grant approval')


def execute(source_root, state, now=None):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    # The same canonical configuration as the daily job, so weekly_slot() and next_slot() agree.
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    started = datetime.now(timezone.utc)
    with (state/'runner.lock').open('a') as lock:
        try:
            acquire(lock)
        except TimeoutError as error:
            job_status.write(state, JOB, 'failed', started=started, reason='Lock timeout: '+str(error)[:200])
            raise
        now = now or datetime.now(timezone.utc)
        week = collection_week(cfg, now)
        if week in prepared_weeks(state):
            job_status.write(state, JOB, 'skipped', started=started, reason='already_prepared '+week)
            return {'status': 'already_prepared', 'mode': 'changemaker', 'kind': 'weekly', 'week': week,
                    'publishing_enabled': False}
        run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-changemaker'
        directory = state/'runs'/run_id
        directory.mkdir(parents=True, mode=0o700)
        try:
            receipt = _prepare(cfg, source_root, state, now, week, run_id, directory)
        except Exception as error:
            failed = {'mode': 'changemaker', 'kind': 'weekly', 'week': week, 'status': 'failed', 'run_id': run_id,
                      'draft_count': 0, 'checked_at': now.isoformat(), 'error': type(error).__name__,
                      'source_identities': [], 'publishing_enabled': False}
            atomic_write(directory/'receipt.json', json.dumps(failed, indent=2)+'\n')
            job_status.write(state, JOB, 'failed', run_id=run_id, started=started, reason=type(error).__name__)
            raise
    status = 'success' if receipt['status'] == 'success' else 'skipped'
    job_status.write(state, JOB, status, run_id=run_id, started=started, reason=receipt['status']+' '+week)
    return receipt


def _prepare(cfg, source_root, state, now, week, run_id, directory):
    weekly = cfg['weekly_cta']
    slot = next_slot(cfg, now)
    cta = call_to_action(cfg, slot)
    if slot-now > timedelta(days=MAX_SLOT_DAYS):
        # The week's slot has passed; this week's evidence must not fill next week's post.
        receipt = {'mode': 'changemaker', 'kind': 'weekly', 'week': week, 'cta': cta['id'], 'status': 'missed_week',
                   'run_id': run_id, 'draft_count': 0, 'checked_at': now.isoformat(), 'slot': slot.isoformat(),
                   'source_identities': [], 'publishing_enabled': False}
        atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
        return receipt
    context = changes_context(cfg, now, days=weekly.get('days', 7))
    evidence_items, digests = week_evidence(context)
    items = {i['id']: i for i in evidence_items}
    evidence = {'items': evidence_items, 'digest_runs': [d['run_id'] for d in digests]}
    atomic_write(directory/'sources.json', json.dumps(evidence, indent=2)+'\n')
    import craft
    claims = (source_root/'content/social/Product Claims Register.md').read_text()
    digest_text = '\n\n---\n\n'.join(d['draft'] for d in digests)
    staged = craft.weekly(cfg, evidence, digest_text, claims, cta, weekly['account'], directory/'craft',
                          recent=recent_captions(state, now), extra={'owner_feedback': owner_feedback(state)})
    drafts = []
    for n, draft in enumerate(staged['drafts'][:1]):
        validate(draft, items, cta, weekly['account'])
        bound = [items[s] for s in draft['source_ids']]
        proof = f'Weekly post for {week}; call to action: {cta["id"]} ({cta["address"]})\n'
        proof += 'Collections: '+', '.join(evidence['digest_runs'] or ['none in the window'])+'\n'
        proof += '\n'.join(i['id']+': '+i['title']+' — '+i['url'] for i in bound)
        plan = draft['media']
        media = {'mode': 'generate' if plan['kind'] == 'illustration' else 'capture' if plan['kind'] == 'screenshot' else 'library',
                 'asset_ids': [], 'brief': plan['kind']+': '+(plan['headline'] or draft['angle']),
                 'alt_text': draft.get('alt_text', ''), 'kind': draft['media_record'].get('kind', plan['kind']),
                 'headline': draft['media_record'].get('headline', plan['headline'])}
        image = Path(draft['image']) if draft['image'] else None
        if image and image.is_file() and image.resolve().is_relative_to(state.resolve()):
            media['image'] = image_record(image, state)
        next_check = (draft['next_check'].rstrip()+' Confirm '+cta['address']+' is in the Instagram bio links.').strip()
        drafts.append({'account': draft['account'], 'platform': 'instagram', 'text': draft['text'],
                       'due_at': slot.isoformat(), 'expires_at': slot.isoformat(), 'evidence': proof,
                       'next_check': next_check, 'checklist': checklist(next_check), 'media': media,
                       'craft': {**draft['craft'], 'angle': draft['angle'], 'product': draft['product'],
                                 'kind': 'weekly', 'week': week, 'cta': cta['id'],
                                 'visual_checks': draft['media_record'].get('checks', [])[-1:]}})
    open_checks = list(staged['open_checks'])
    if drafts and slot.astimezone(timezone.utc) in taken_slots(state, now):
        open_checks.append('Another prepared draft already holds this weekly slot; move one of them before approving.')
    atomic_write(directory/'result.json', json.dumps({'drafts': drafts, 'open_checks': open_checks}, indent=2)+'\n')
    receipt = {'mode': 'changemaker', 'kind': 'weekly', 'week': week, 'cta': cta['id'],
               'status': 'success' if drafts else 'no_draft', 'run_id': run_id, 'draft_count': len(drafts),
               'checked_at': now.isoformat(), 'source_identities': [], 'publishing_enabled': False}
    atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
    return receipt


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state)))
