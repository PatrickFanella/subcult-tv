#!/usr/bin/env python3
"""Prepare one account's requested tweet, then sync it into private review."""
import argparse
from datetime import datetime, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import re

import craft
import feedback
from runner import atomic_write, source_context
from reroll import call, read_json, sync_dashboard
from changemaker_publications import preparation_settings
from sources import public_url


class TweetPreparationError(ValueError):
    """A bounded, owner-facing drafting failure without provider or path details."""


def validate(result, sources):
    text = result.get('text')
    if text == '' and result.get('source_ids') == []:
        raise TweetPreparationError('No supported tweet could be written for this topic. Try another topic.')
    if not isinstance(text, str) or not text.strip() or len(text) > 280 or 'git.subcult.tv' in text.casefold():
        raise TweetPreparationError('The generated tweet is empty, too long or contains a private link')
    for url in re.findall(r'https?://\S+', text):
        if not public_url(url):
            raise TweetPreparationError('The generated tweet contains a private or invalid URL')
    ids = result.get('source_ids')
    if not isinstance(ids, list) or not ids or any(not isinstance(x, str) for x in ids) or len(ids) != len(set(ids)) or not set(ids) <= sources.keys():
        raise TweetPreparationError('The generated tweet has no valid source references')
    if not isinstance(result.get('next_check'), str) or not result['next_check'].strip() or len(result['next_check']) > 2000:
        raise TweetPreparationError('The generated tweet needs review notes')


def recent_tweets(state):
    texts = []
    for receipt in sorted((state/'runs').glob('*/receipt.json'), reverse=True)[:60]:
        try:
            run = read_json(receipt)
            if run.get('status') != 'success':
                continue
            for d in read_json(receipt.parent/'result.json').get('drafts', []):
                if d.get('platform', 'instagram' if run.get('mode') == 'changemaker' else 'x') == 'x':
                    texts.append(d.get('text', ''))
        except (ValueError, OSError):
            continue
    return texts[:100]


def generate(cfg, source_root, state, job, now):
    account = job.get('account')
    if account not in cfg['cadence'] or account not in cfg['channels']:
        raise TweetPreparationError('This account is not configured for X preparation')
    request_id = int(job['id'])
    if request_id <= 0:
        raise ValueError('Invalid tweet request')
    requested = datetime.fromisoformat(job['requested_at'].replace('Z', '+00:00'))
    run_id = requested.astimezone(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')+f'-ondemand-{request_id}'
    directory = state/'runs'/run_id
    receipt_path = directory/'receipt.json'
    if receipt_path.exists():
        receipt = read_json(receipt_path)
        draft = read_json(directory/'result.json')['drafts'][0]
        if receipt.get('tweet_request') != request_id or receipt.get('status') != 'success' or draft.get('account') != account:
            raise ValueError('The saved tweet does not match this request')
        # An interrupted finish must reuse its draft, never pay for a duplicate.
        return run_id+':0'
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    context = source_context(cfg, directory)
    sources = {f'note:{name}': {'title': name, 'text': text} for name, text in context['notes'].items()}
    sources.update({f"repository:{r['product']}": {'title': r['product'], 'revision': r['revision'],
                                                 'documents': r['documents']} for r in context['repositories']})
    sources.update({'demonstration:'+r['id']: {'title': r['journey'], 'evidence': r}
                    for r in context.get('demonstration_evidence', [])})
    owner = feedback.owner_feedback(state, ('x',), 30)
    recent = recent_tweets(state)
    payload = {**craft.guidance(cfg), 'account': account, 'owner_direction': job.get('note', ''),
               'sources': sources, 'posting_guidance': context['posting_guidance'],
               'owner_feedback': owner, 'recent_tweets': recent}
    result = craft.codex(cfg, craft.stage_prompt('tweet', payload), directory/'craft', 'tweet', 'tweet', effort='high')
    validate(result, sources)
    draft = {'account': account, 'platform': 'x', 'text': result['text'].strip(), 'replies': [],
             'evidence': '\n'.join(f"{key}: {sources[key]['title']}" for key in result['source_ids']),
             'sources': [{'title': sources[key]['title']} for key in result['source_ids']],
             'next_check': result['next_check'], 'approval': 'unapproved',
             'due_at': (now+timedelta(hours=48)).isoformat(), 'expires_at': (now+timedelta(days=7)).isoformat(),
             'media': {'mode': 'none', 'asset_ids': [], 'brief': '', 'alt_text': ''}}
    original = draft['text']
    craft.polish_short(cfg, [draft], directory/'craft', owner=owner)
    try:
        validate({**result, 'text': draft['text']}, sources)
    except ValueError:
        draft['text'] = original
    if draft['text'] in recent:
        raise TweetPreparationError('The generated tweet repeats a recent draft. Try a different topic')
    atomic_write(directory/'result.json', json.dumps({'drafts': [draft], 'open_checks': []}, indent=2)+'\n')
    atomic_write(receipt_path, json.dumps({'mode': 'ondemand', 'status': 'success', 'run_id': run_id,
        'draft_count': 1, 'checked_at': now.isoformat(), 'tweet_request': request_id, 'publishing_enabled': False}, indent=2)+'\n')
    return run_id+':0'


def execute(source_root, state, ingest_env, sync=sync_dashboard):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    cfg['content_root'] = str(source_root.resolve())
    cfg['state'] = str(state.resolve())
    settings = preparation_settings(ingest_env)
    # Serialize source collection and generation with the weekly and radar jobs.
    with (state/'runner.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status': 'busy', 'publishing_enabled': False}
        done = failed = 0
        for _ in range(3):
            jobs = call(settings, '/tweets/claim')
            if not jobs:
                break
            job = jobs[0]
            try:
                draft_id = generate(cfg, source_root, state, job, datetime.now(timezone.utc))
            except Exception as error:
                with (state/'tweet-errors.log').open('a') as log:
                    log.write(f"{datetime.now(timezone.utc).isoformat()} {job.get('id')} {type(error).__name__}: {str(error)[:1000]}\n")
                # Raw provider errors and local paths belong only in the private log.
                message = str(error) if isinstance(error, TweetPreparationError) else 'Tweet preparation failed. Try again or check the preparation job.'
                result = {'status': 'failed', 'error': message}
                failed += 1
            else:
                if not sync():
                    # Keep the claim: after lease expiry, reuse the completed run and
                    # retry its sync. Never report a draft as ready before it arrives.
                    raise RuntimeError('Tweet generated; review snapshot sync must be retried')
                result = {'status': 'done', 'result_draft_id': draft_id}
                done += 1
            call(settings, f"/tweets/{int(job['id'])}", {**result, 'attempts': job['attempts']})
        return {'status': 'success', 'done': done, 'failed': failed, 'publishing_enabled': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state, args.ingest_env)))
