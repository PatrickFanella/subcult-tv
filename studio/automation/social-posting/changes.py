"""Studio-owned collection of merged product changes from Gitea.

The social jobs used to read Switchyard's Changemaker digest, a changelog written
for the operator, and then select from its item list anyway. This module reads the
merged pull requests directly, so selection happens once, in the editorial stages,
with the full pull request body in front of them. Read-only: GET requests with the
installed Gitea agent credential, no writes, no fallback to another identity.

The result keeps the shape the consumers already read (`drafts[0].evidence.items`),
so the brief, weekly, publications and re-roll stages are unchanged. Item IDs are
S1, S2, ... in merge order; identities (URL plus update time) match the earlier
adapter, so already-used sources stay used.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import json
import subprocess
import urllib.parse
import urllib.request

from sources import NoRedirect

DEFAULTS = {
    'base_url': 'https://git.subcult.tv',
    'repositories': [],
    'max_items': 30,
    'max_excerpt_chars': 4000,
    'page_size': 50,
    'max_pages': 4,
    'credential': 'git-credential',
}


def settings(cfg: dict) -> dict:
    merged = {**DEFAULTS, **(cfg.get('changes') or {})}
    if not merged['repositories']:
        raise ValueError('changes.repositories is empty')
    return merged


def gitea_token(options: dict) -> str:
    """Read the agent token through the installed Git credential helper, or a token file."""
    if options.get('token_file'):
        token = open(options['token_file']).read().strip()
    else:
        host = urllib.parse.urlsplit(options['base_url']).hostname or ''
        filled = subprocess.run(['git', 'credential', 'fill'], input=f'protocol=https\nhost={host}\n',
                                capture_output=True, text=True, timeout=20, check=True).stdout
        fields = dict(line.split('=', 1) for line in filled.splitlines() if '=' in line)
        expected = options.get('username')
        if expected and fields.get('username') != expected:
            raise ValueError('Gitea credential helper returned another account')
        token = fields.get('password', '')
    if not token:
        raise ValueError('Gitea credential unavailable')
    return token


def get_gitea(url: str, token: str) -> list | dict:
    request = urllib.request.Request(url, headers={'Authorization': 'token '+token,
                                                   'User-Agent': 'SUBCULT-studio-changes/1.0'}, method='GET')
    with urllib.request.build_opener(NoRedirect).open(request, timeout=20) as response:
        data = response.read(2_000_001)
    if len(data) > 2_000_000:
        raise ValueError('Gitea response exceeds the read budget')
    return json.loads(data)


def utc(value: str) -> str:
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return parsed.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def excerpt(body: str, limit: int) -> str:
    body = (body or '').strip()
    return body if len(body) <= limit else body[:limit].rstrip()+' [truncated]'


def merged_pulls(options: dict, token: str, repository: str, start: datetime, end: datetime) -> list[dict]:
    """Pull requests of one repository merged in (start, end], newest update first from the API."""
    found = []
    for page in range(1, options['max_pages']+1):
        query = urllib.parse.urlencode({'state': 'closed', 'sort': 'recentupdate',
                                        'limit': options['page_size'], 'page': page})
        pulls = get_gitea(f"{options['base_url']}/api/v1/repos/{repository}/pulls?{query}", token)
        if not isinstance(pulls, list) or not pulls:
            break
        for pull in pulls:
            if not pull.get('merged') or not pull.get('merged_at'):
                continue
            merged_at = datetime.fromisoformat(pull['merged_at'].replace('Z', '+00:00'))
            if start < merged_at <= end:
                body = pull.get('body') or ''
                found.append({
                    'source': repository, 'kind': 'pull request', 'number': pull['number'],
                    'title': pull.get('title', ''), 'state': 'merged', 'url': pull['html_url'],
                    'author': (pull.get('user') or {}).get('login', ''),
                    'labels': [label.get('name', '') for label in pull.get('labels') or []],
                    'created_at': utc(pull['created_at']), 'updated_at': utc(pull['updated_at']),
                    'merged_at': utc(pull['merged_at']), 'closed_at': utc(pull.get('closed_at') or pull['merged_at']),
                    'excerpt': excerpt(body, options['max_excerpt_chars']),
                    'body_bytes': len(body.encode()), 'body_sha256': hashlib.sha256(body.encode()).hexdigest(),
                })
        oldest = datetime.fromisoformat(pulls[-1]['updated_at'].replace('Z', '+00:00'))
        if oldest <= start or len(pulls) < options['page_size']:
            break
    return found


def collect_changes(cfg: dict, now: datetime, days: int = 1) -> dict:
    """Merged pull requests from the configured repositories in the last `days`."""
    options = settings(cfg)
    start, end = now-timedelta(days=days), now
    token = gitea_token(options)
    items, failures, counts = [], [], {}
    for repository in options['repositories']:
        try:
            pulls = merged_pulls(options, token, repository, start, end)
        except Exception as error:
            code = getattr(error, 'code', None)
            failures.append({'repository': repository, 'error': type(error).__name__+(f' {code}' if code else '')})
            continue
        counts[repository] = len(pulls)
        items.extend(pulls)
    items.sort(key=lambda item: (item['merged_at'], item['source'], item['number']))
    omitted = [{'url': item['url'], 'reason': f"exceeds max_items {options['max_items']}"}
               for item in items[options['max_items']:]]
    items = items[:options['max_items']]
    for n, item in enumerate(items, 1):
        item['id'] = f'S{n}'
    return {
        'adapter': 'studio-gitea-merged', 'status': 'complete' if not failures else 'partial',
        'window_start': start.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'window_end': end.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'repositories': list(options['repositories']), 'counts': counts,
        'items': items, 'item_count': len(items),
        'omitted_items': omitted, 'omitted_item_count': len(omitted),
        'failures': failures, 'failed_source_count': len(failures),
    }


def collection_note(evidence: dict) -> str:
    lines = [f"Merged changes collected by Studio from Gitea, {evidence['window_start']} to {evidence['window_end']} (UTC).",
             'Repositories: '+', '.join(evidence['repositories'])+'.',
             f"Items: {evidence['item_count']} merged pull requests; {evidence['omitted_item_count']} omitted by the item cap; "
             f"{evidence['failed_source_count']} repositories failed to read.",
             'This is a collection note, not a digest. Every fact comes from the evidence items.']
    return '\n'.join(lines)+'\n'


def changes_context(cfg: dict, now: datetime, days: int = 1) -> dict:
    """Collection in the shape the jobs read: one hash-bound 'draft' holding the evidence."""
    evidence = collect_changes(cfg, now, days)
    context = {'status': 'empty', 'checked_at': now.isoformat(), 'drafts': [], 'adapter': evidence['adapter']}
    if not evidence['items'] and not evidence['failures']:
        return context
    evidence_bytes = json.dumps(evidence, sort_keys=True, separators=(',', ':')).encode()
    note = collection_note(evidence)
    run_id = 'changes-'+now.strftime('%Y%m%dT%H%M%SZ')
    context['status'] = 'available' if evidence['items'] else 'empty'
    context['drafts'].append({
        'thread_id': run_id, 'run_id': run_id, 'version': 1, 'state': 'collected',
        'draft': note, 'draft_sha256': hashlib.sha256(note.encode()).hexdigest(),
        'evidence': evidence, 'evidence_sha256': hashlib.sha256(evidence_bytes).hexdigest(),
        'grounding_status': 'collected', 'social_approval': False,
    })
    return context


if __name__ == '__main__':  # read-only inspection
    import argparse
    from pathlib import Path
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--config', type=Path, default=Path(__file__).with_name('config.json'))
    parser.add_argument('--days', type=int, default=1)
    args = parser.parse_args()
    context = changes_context(json.loads(args.config.read_text()), datetime.now(timezone.utc), args.days)
    for draft in context['drafts']:
        evidence = draft['evidence']
        print(f"{draft['run_id']} {evidence['status']} {evidence['item_count']} items, sha256 {draft['evidence_sha256'][:12]}")
        for item in evidence['items']:
            print(f"  {item['id']} {item['source'].split('/')[-1]} #{item['number']} {item['merged_at']} {item['title']}")
    if not context['drafts']:
        print(context['status'])
