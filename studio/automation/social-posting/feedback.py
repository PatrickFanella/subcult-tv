#!/usr/bin/env python3
"""Pull the owner's review feedback into state; read it back for the drafting jobs.

The review page records rejections, revision requests, edited approvals, re-roll
notes and "good post" marks. `pull` reads them with the preparation key, which
can only read feedback, and writes `owner-feedback.json`, newest first. The
drafting jobs and the prompt-tuning job read that file. Nothing here approves,
schedules or publishes.
"""
import argparse
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

FILE = 'owner-feedback.json'
WINDOW_DAYS = 180
LEARNING = ('favorited', 'approved_edited', 'rejected', 'revision_requested', 'reroll_requested')
DRAFT_ID = re.compile(r'^([0-9]{8}T[0-9]{6}(?:\.[0-9]{1,6})?Z-[a-z]+):([0-9]{1,2})$')


def fetch(settings, since):
    from sources import NoRedirect
    url = settings['POSTING_INGEST_URL']+'/feedback?'+urllib.parse.urlencode({'since': since.isoformat().replace('+00:00', 'Z')})
    request = urllib.request.Request(url, headers={
        'Authorization': 'Bearer '+settings['POSTING_PREPARATION_KEY'], 'User-Agent': 'SUBCULT-feedback-pull/1.0'})
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        return json.loads(response.read(8_000_000))


def draft_text(state, draft_id):
    """The prepared text of a draft from its local run, for re-roll notes."""
    match = DRAFT_ID.match(draft_id or '')
    if not match:
        return ''
    path = state/'runs'/match.group(1)/'result.json'
    if not path.is_file() or path.is_symlink() or path.stat().st_size > 2_000_000:
        return ''
    try:
        drafts = json.loads(path.read_text()).get('drafts', [])
        return drafts[int(match.group(2))].get('text', '')
    except (ValueError, IndexError, AttributeError):
        return ''


def records(payload, state):
    """Normalize the API response into the file's records, newest first."""
    out = []
    for d in payload.get('decisions') or []:
        if d.get('decision') not in LEARNING:
            continue
        out.append({'decision': d['decision'], 'platform': d.get('platform', ''), 'account': d.get('account', ''),
                    'draft_id': d.get('draft_id', ''), 'original_text': d.get('original_text', ''),
                    'final_text': d.get('final_text', ''), 'reasons': d.get('reason_codes') or [],
                    'note': d.get('note', ''), 'decided_at': d.get('decided_at', '')})
    for r in payload.get('rerolls') or []:
        out.append({'decision': 'reroll_requested', 'platform': 'instagram', 'account': '',
                    'draft_id': r.get('draft_id', ''), 'original_text': draft_text(state, r.get('draft_id')),
                    'final_text': '', 'reasons': [], 'note': r.get('note', ''), 'mode': r.get('mode', ''),
                    'decided_at': r.get('requested_at', '')})
    return sorted(out, key=lambda r: r['decided_at'], reverse=True)


def pull(state, ingest_env, now=None):
    """Replace the feedback file with the last WINDOW_DAYS of feedback; return the record count."""
    from changemaker_publications import preparation_settings
    from runner import atomic_write
    now = now or datetime.now(timezone.utc)
    result = records(fetch(preparation_settings(ingest_env), now-timedelta(days=WINDOW_DAYS)), state)
    atomic_write(state/FILE, json.dumps(result, indent=1, ensure_ascii=False)+'\n')
    return len(result)


def owner_feedback(state, platforms=None, limit=20):
    """Recent owner feedback, newest first, optionally for some platforms.

    Good-post marks show what to repeat; edited approvals show what the owner
    changes; rejections, revision requests and re-roll notes show what to avoid.
    Plain approvals and snoozes teach nothing and are left out. The file is optional.
    """
    path = state/FILE
    if not path.is_file() or path.is_symlink() or path.stat().st_size > 4_000_000:
        return []
    try:
        data = json.loads(path.read_text())
    except ValueError:
        return []
    keep = []
    for record in data if isinstance(data, list) else []:
        if not isinstance(record, dict) or record.get('decision') not in LEARNING:
            continue
        if platforms and record.get('platform', 'instagram') not in platforms:
            continue
        keep.append({'decision': record['decision'], 'account': record.get('account', ''),
                     'original_text': record.get('original_text', ''), 'final_text': record.get('final_text', ''),
                     'reasons': record.get('reasons') or record.get('reason_codes') or [], 'note': record.get('note', '')})
    return keep[:limit]


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps({'status': 'ok', 'records': pull(args.state, args.ingest_env)}))


if __name__ == '__main__':
    main()
