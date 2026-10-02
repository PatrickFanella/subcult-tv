#!/usr/bin/env python3
"""Prepare a bounded private dashboard snapshot from runner receipts and draft results."""
from datetime import datetime, timezone
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path, limit=2_000_000):
    if not path.is_file() or path.is_symlink() or path.stat().st_size > limit:
        return None
    try:
        return json.loads(path.read_text())
    except (ValueError, OSError):
        return None


def snapshot(state=None):
    cfg = json.loads((ROOT/'automation/social-posting/config.json').read_text())
    schedules = []
    for mode in ('plan', 'radar', 'review'):
        timer = ROOT/f'automation/social-posting/social-posting-{mode}.timer'
        schedules.append({'mode':mode, 'calendar':[line.split('=',1)[1] for line in timer.read_text().splitlines() if line.startswith('OnCalendar=')]})
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
        if not isinstance(receipt, dict) or receipt.get('mode') not in ('plan','radar','review'):
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
            media = draft.get('media') or {}
            record['media'] = {k:media.get(k,[] if k=='asset_ids' else '') for k in ('mode','asset_ids','alt_text','brief')}
            data['drafts'].append(record)
    data['drafts'] = data['drafts'][:200]
    data['checks'] = list({check['text']:check for check in data['checks']}.values())[:60]
    return data
