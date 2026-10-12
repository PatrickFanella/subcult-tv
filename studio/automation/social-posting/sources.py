"""Bounded read-only source helpers: digest completeness checks and public discovery inputs.

Merged product changes are collected by `changes.py`.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import ipaddress
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def get_json(url: str, token: str | None = None) -> dict | list:
    headers = {'User-Agent': 'SUBCULT-social-discovery/1.0'}
    if token:
        headers['Authorization'] = 'Bearer '+token
    request = urllib.request.Request(url, headers=headers, method='GET')
    with urllib.request.build_opener(NoRedirect).open(request, timeout=20) as response:
        data = response.read(2_000_001)
    if len(data) > 2_000_000:
        raise ValueError('Source response exceeds the read budget')
    return json.loads(data)


def only_capped(evidence: dict) -> bool:
    """True when every omitted item was dropped by the item cap, not by a read failure.

    Busy days exceed the cap. The included items are still fully collected, and
    drafts may only cite included items, so the cap alone must not block a day.
    """
    omitted = evidence.get('omitted_items') or []
    if len(omitted) != (evidence.get('omitted_item_count') or 0):
        return False
    return all(str(item.get('reason', '')).startswith('exceeds max_items') for item in omitted)


def complete_changemaker_digest(context: dict) -> dict:
    """Choose a verified recent digest. Failed sources and unexplained omissions still block it."""
    for digest in context.get('drafts', []):
        evidence = digest.get('evidence', {})
        if (evidence.get('status') == 'complete'
                and not evidence.get('failed_source_count')
                and only_capped(evidence)):
            return digest
    raise ValueError('Incomplete Changemaker evidence')


def public_url(value: str) -> bool:
    parsed = urllib.parse.urlsplit(value)
    try:
        if parsed.port not in [None, 443]:
            return False
        try:
            if not ipaddress.ip_address(parsed.hostname or '').is_global:
                return False
        except ValueError:
            if '.' not in (parsed.hostname or ''):
                return False
    except ValueError:
        return False
    return (parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username
            and parsed.hostname not in ['localhost', '127.0.0.1', 'git.subcult.tv']
            and not parsed.hostname.endswith(('.local', '.internal')))


def discovery_inputs(cfg: dict, now: datetime) -> dict:
    result = {'observed_at':now.isoformat(), 'items':[], 'warnings':[]}
    try:
        root = 'https://hacker-news.firebaseio.com/v0/'
        ids = get_json(root+'topstories.json')[:cfg.get('hn_scan_limit', 12)]
        for rank, story_id in enumerate(ids, 1):
            item = get_json(root+f'item/{story_id}.json')
            if item.get('deleted') or item.get('dead') or item.get('type') != 'story':
                continue
            published = datetime.fromtimestamp(item['time'], timezone.utc)
            if not timedelta(0) <= now-published <= timedelta(hours=48):
                continue
            if not any(word.casefold() in item.get('title','').casefold() for word in cfg['keywords']):
                continue
            url = item.get('url', f'https://news.ycombinator.com/item?id={story_id}')
            if not public_url(url):
                continue
            result['items'].append({'id':'HN-'+str(story_id), 'kind':'discovery', 'title':item['title'],
                'url':url, 'discussion_url':f'https://news.ycombinator.com/item?id={story_id}',
                'published_at':published.isoformat(), 'observed_at':now.isoformat(),
                'metrics':{'hn_points':item.get('score'), 'hn_comments':item.get('descendants'), 'top_rank':rank},
                'evidence_boundary':'HN title and discussion counts only; inspect the original before making article claims. Not evidence of X popularity.'})
    except Exception as error:
        result['warnings'].append('Public discovery unavailable: '+type(error).__name__)
    inbox = Path(cfg['inbox'])
    if inbox.exists():
        entries = json.loads(inbox.read_text())
        if not isinstance(entries, list) or len(entries) > 100:
            raise ValueError('Timely inbox must be an array of at most 100 entries')
        for entry in entries:
            observed = datetime.fromisoformat(entry['observed_at'])
            if observed.tzinfo is None or not timedelta(0) <= now-observed <= timedelta(hours=48):
                continue
            if not public_url(entry['url']):
                raise ValueError('Inbox entries require a public HTTPS source URL')
            if entry['kind'] not in ['discovery', 'current', 'quote']:
                raise ValueError('Unknown timely inbox kind')
            if entry['kind'] == 'quote' and not re.fullmatch(r'https://(?:x\.com|twitter\.com)/[A-Za-z0-9_]+/status/\d+', entry['url']):
                raise ValueError('Quote requires the original unshortened X post URL')
            material = {k:entry.get(k) for k in ['url','title','excerpt','kind','observed_at']}
            material['id'] = 'INBOX-'+hashlib.sha256(entry['url'].encode()).hexdigest()[:12]
            material['evidence_boundary'] = 'Operator-supplied discovery; independently inspect original and context. Popularity is unverified.'
            result['items'].append(material)
    return result
