#!/usr/bin/env python3
"""Prepare a bounded private dashboard snapshot from runner receipts and draft results."""
from datetime import datetime, timezone
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path, limit=2_000_000):
    if not path.is_file() or path.is_symlink() or path.stat().st_size > limit:
        return None
    try:
        return json.loads(path.read_text())
    except (ValueError, OSError):
        return None


PLATFORMS = ('instagram', 'x', 'bluesky')
MEDIA_KINDS = ('illustration', 'type', 'screenshot')
SCORE_KEYS = ('hook', 'story', 'specificity', 'reason', 'voice', 'reader_value', 'flow', 'ending', 'honesty')
HEX64 = re.compile(r'^[a-f0-9]{64}$')
MAX_IMAGE_BYTES = 900 * 1024


def derived_platform(mode):
    """Older runs lack a platform: Changemaker prepares Instagram, plan/radar prepare X."""
    return 'instagram' if mode == 'changemaker' else 'x'


def text(value, limit):
    return value[:limit] if isinstance(value, str) else ''


def strings(value, count, limit):
    if not isinstance(value, list):
        return []
    return [item[:limit] for item in value if isinstance(item, str) and item.strip()][:count]


def source_titles(draft):
    """Sources travel as titles only. URLs and private identifiers stay on Kvant."""
    titles = []
    for item in draft.get('sources') or []:
        title = item.get('title') if isinstance(item, dict) else item if isinstance(item, str) else ''
        title = URL.sub('', title or '').strip(' -—:')
        if title:
            titles.append(title[:200])
    if not titles and isinstance(draft.get('evidence'), str):
        # Changemaker evidence lines read "<id>: <title> — <url>".
        for line in draft['evidence'].splitlines()[1:]:
            match = EVIDENCE_LINE.match(line)
            if match:
                titles.append(URL.sub('', match.group(1)).strip(' -—:')[:200])
    return [t for t in titles if t][:8]


URL = re.compile(r'https?://\S+')
EVIDENCE_LINE = re.compile(r'^[^:]{1,120}:\s+(.+?)\s+—\s+https?://\S+\s*$')


def prepared_image(value, state, media_files):
    """Export only verified image metadata; the state-relative path never leaves Kvant."""
    if not isinstance(value, dict) or state is None:
        return None
    sha, name = value.get('sha256'), value.get('file')
    if not isinstance(sha, str) or not HEX64.match(sha) or not isinstance(name, str) or not name:
        return None
    path = state/name
    try:
        if path.is_symlink() or not path.resolve().is_relative_to(state) or not path.is_file():
            return None
        size = path.stat().st_size
    except OSError:
        return None
    if size > MAX_IMAGE_BYTES or path.suffix.lower() not in ('.jpg', '.jpeg'):
        return None
    image = {'sha256': sha, 'bytes': size}
    for key in ('width', 'height'):
        image[key] = value.get(key) if isinstance(value.get(key), int) and 0 < value.get(key) <= 10000 else 0
    if media_files is not None:
        media_files[sha] = path
    return image


def optional_fields(draft, media, state, media_files):
    """Optional craft fields from the staged pipeline; older runs simply omit them."""
    record = {}
    craft = draft.get('craft')
    if isinstance(craft, dict):
        scores = craft.get('scores') if isinstance(craft.get('scores'), dict) else {}
        record['craft'] = {
            'angle': text(craft.get('angle'), 600), 'reader': text(craft.get('reader'), 400),
            'reason': text(craft.get('reason'), 600), 'pattern': text(craft.get('pattern'), 200),
            'predicted': text(craft.get('predicted'), 400),
            'scores': {k: scores[k] for k in SCORE_KEYS if isinstance(scores.get(k), int) and 1 <= scores[k] <= 5},
            'alternatives': strings(craft.get('alternatives'), 4, 2200)}
    checklist = strings(draft.get('checklist'), 12, 400)
    if checklist:
        record['checklist'] = checklist
    sources = source_titles(draft)
    if sources:
        record['sources'] = sources
    if isinstance(draft.get('supersedes'), str) and draft['supersedes']:
        record['supersedes'] = draft['supersedes'][:200]
    if media.get('kind') in MEDIA_KINDS:
        record['media'] = {'kind': media['kind']}
    if isinstance(media.get('headline'), str) and media['headline'].strip():
        record.setdefault('media', {})['headline'] = media['headline'][:200]
    image = prepared_image(media.get('image'), state, media_files)
    if image:
        record.setdefault('media', {})['image'] = image
    candidates = [c for c in (prepared_image(v, state, media_files) for v in (media.get('candidates') or [])[:6]) if c]
    if candidates:
        record.setdefault('media', {})['candidates'] = candidates
    return record


def snapshot(state=None, source_root=None, media_files=None):
    """Return the redacted snapshot. When media_files is a dict, it receives
    sha256 -> Path for each prepared JPEG referenced by an exported draft."""
    source_root = source_root or ROOT
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    schedules = []
    for mode in ('plan', 'radar', 'review'):
        timer = source_root/f'automation/social-posting/social-posting-{mode}.timer'
        schedules.append({'mode':mode, 'calendar':[line.split('=',1)[1] for line in timer.read_text().splitlines() if line.startswith('OnCalendar=')]})
    timer = ROOT/'automation/postiz-dashboard/changemaker-instagram.timer'
    schedules.append({'mode':'changemaker', 'calendar':[line.split('=',1)[1] for line in timer.read_text().splitlines() if line.startswith('OnCalendar=')]})
    data = {'version':1, 'generated_at':datetime.now(timezone.utc).isoformat(),
            'connected': bool(state and state.is_dir()), 'publishing_enabled':False,
            'timezone':cfg['timezone'], 'first_week':cfg['first_week'], 'schedules':schedules,
            'accounts':[{'account':account,'times':lane['times'],'weekly_cap':lane['weekly_cap']} for account,lane in cfg['cadence'].items()],
            'runs':[], 'drafts':[], 'checks':[]}
    if not data['connected']:
        return data
    state = state.resolve()
    # Only receipt-bearing completed runs qualify. Prompts, events and SQLite stay local.
    candidates = sorted((state/'runs').glob('*/receipt.json'), reverse=True)[:60]
    candidates += [state/'latest.json', state/'radar-latest.json']
    receipts = {}
    for path in candidates:
        receipt = read(path, 64_000)
        if not isinstance(receipt, dict) or receipt.get('mode') not in ('plan','radar','review','changemaker'):
            continue
        if not path.resolve().is_relative_to(state):
            continue
        observed = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat()
        key = receipt.get('run_id') or receipt['mode']+'-'+observed
        receipts[key] = {**{k:receipt.get(k) for k in ('mode','status','week','run_id','draft_count','checked_at')},'observed_at':observed}
    data['runs'] = sorted(receipts.values(), key=lambda r:r['observed_at'], reverse=True)[:30]
    seen_plans = set()
    for run in data['runs']:
        run_id = run.get('run_id')
        if run['status'] != 'success' or not isinstance(run_id,str) or run_id in ('.','..') or '/' in run_id or '\\' in run_id:
            continue
        if run['mode']=='plan':
            if run['week'] in seen_plans:continue
            seen_plans.add(run['week'])
        result_path = state/'runs'/run_id/'result.json'
        if not result_path.resolve().is_relative_to(state):continue
        result = read(result_path)
        if not isinstance(result,dict):continue
        for check in result.get('open_checks',[])[:30]:
            if isinstance(check,str):data['checks'].append({'run_id':run_id,'text':check[:4000]})
        for i,draft in enumerate(result.get('drafts',[])[:30]):
            if not isinstance(draft,dict) or draft.get('account') not in cfg['cadence']:continue
            record = {key:draft.get(key,'') for key in ('account','text','due_at','expires_at','evidence','next_check')}
            record.update(id=f'{run_id}:{i}',run_id=run_id,mode=run['mode'],week=run.get('week') or '',approval='unapproved')
            record['platform'] = draft.get('platform') if draft.get('platform') in PLATFORMS else derived_platform(run['mode'])
            media = draft.get('media') or {}
            record['media'] = {k:media.get(k,[] if k=='asset_ids' else '') for k in ('mode','asset_ids','alt_text','brief')}
            extra = optional_fields(draft, media, state, media_files)
            record['media'].update(extra.pop('media', {}))
            record.update(extra)
            data['drafts'].append(record)
    data['drafts'] = data['drafts'][:200]
    data['checks'] = list({check['text']:check for check in data['checks']}.values())[:60]
    return data
