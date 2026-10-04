"""Bounded read-only Changemaker and public discovery inputs."""
from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import ipaddress
import json
from pathlib import Path
import re
import shlex
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


def control_settings(path: Path) -> tuple[str, str]:
    selected = {}
    for line in path.read_text().splitlines():
        if line.lstrip().startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        if key.strip() in ['API_PORT', 'SWITCHYARD_CONTROL_READ_TOKEN']:
            parts = shlex.split(value, comments=True)
            selected[key.strip()] = parts[0] if parts else ''
    port = int(selected.get('API_PORT', '18080'))
    token = selected.get('SWITCHYARD_CONTROL_READ_TOKEN')
    if not 1 <= port <= 65535 or not token:
        raise ValueError('Switchyard read credential or control port unavailable')
    return f'http://127.0.0.1:{port}', token


def artifact_bytes(artifact: dict) -> bytes:
    uri = artifact.get('uri', '')
    if not uri.startswith('data:') or ',' not in uri:
        raise ValueError('Expected inline Switchyard artifact')
    header, payload = uri.split(',', 1)
    content = (base64.b64decode(payload, validate=True) if header.endswith(';base64')
               else urllib.parse.unquote_to_bytes(payload))
    if len(content) > 100_000 or hashlib.sha256(content).hexdigest() != artifact.get('sha256'):
        raise ValueError('Switchyard artifact hash or size mismatch')
    return content


def changemaker_context(cfg: dict, now: datetime) -> dict:
    base, token = control_settings(Path(cfg['env_file']))
    page = get_json(base+'/api/runs?limit=100', token)
    runs = [r for r in page['runs'] if r['workflow_id'] == 'changemaker-daily-digest'
            and r['status'] == 'succeeded'
            and datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')) >= now-timedelta(days=3)]
    result = {'status': 'no_recent_run', 'checked_at': now.isoformat(), 'drafts': [],
              'scan_truncated': bool(page.get('next_cursor'))}
    threads = set()
    for run in runs[:6]:
        review = get_json(base+'/api/changemaker/drafts/'+urllib.parse.quote(run['id'], safe=''), token)
        if review['thread_id'] in threads:
            continue
        threads.add(review['thread_id'])
        version = next(v for v in review['versions'] if v['version'] == review['current_version'])
        result['status'] = 'empty' if not version['draft_generated'] else 'available'
        if not version['ready'] or not version['draft_generated'] or version.get('unknown_citations'):
            continue
        draft = artifact_bytes(version['draft'])
        if hashlib.sha256(draft).hexdigest() != version['draft_sha256']:
            raise ValueError('Changemaker draft digest mismatch')
        source_run = version.get('sources_run_id') or version['run_id']
        detail = get_json(base+'/api/runs/'+urllib.parse.quote(source_run, safe=''), token)
        evidence = next(a for a in detail['artifacts'] if a['id'] == version['evidence_artifact_id'])
        evidence_bytes = artifact_bytes(evidence)
        if hashlib.sha256(evidence_bytes).hexdigest() != version['evidence_sha256']:
            raise ValueError('Changemaker evidence digest mismatch')
        result['drafts'].append({'thread_id':review['thread_id'], 'run_id':version['run_id'],
            'version':version['version'], 'state':version['state'], 'draft_sha256':version['draft_sha256'],
            'evidence_sha256':version['evidence_sha256'], 'grounding_status':version['grounding_status'],
            'draft':draft.decode(), 'evidence':json.loads(evidence_bytes),
            'social_approval':False})
        if len(result['drafts']) == 2:
            break
    if result['drafts']:
        result['status'] = 'available'
    return result


def complete_changemaker_digest(context: dict) -> dict:
    """Choose a verified recent digest without relaxing evidence completeness."""
    for digest in context.get('drafts', []):
        evidence = digest.get('evidence', {})
        if (evidence.get('status') == 'complete'
                and not evidence.get('failed_source_count')
                and not evidence.get('omitted_item_count')):
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
