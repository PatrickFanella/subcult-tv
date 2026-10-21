#!/usr/bin/env python3
"""Maintain private demonstration evidence and observed results; report campaign decisions."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path


def read(path, default):
    if not path.exists():
        return default
    if path.is_symlink() or path.stat().st_size > 4_000_000:
        raise ValueError('Invalid campaign record file')
    return json.loads(path.read_text())


def validate(record, projects):
    if record.get('project') not in projects:
        raise ValueError('Unknown campaign project')
    pillar = record.get('pillar_id')
    if pillar not in [p['id'] for p in projects[record['project']]['pillars']]:
        raise ValueError('Unknown campaign theme')
    for key in ('id', 'source', 'observed_at', 'kind'):
        if not isinstance(record.get(key), str) or not record[key].strip() or len(record[key]) > 1000:
            raise ValueError('Missing or invalid '+key)
    at = datetime.fromisoformat(record['observed_at'].replace('Z', '+00:00'))
    if at.tzinfo is None or at > datetime.now(timezone.utc):
        raise ValueError('Observation must be a dated past observation with timezone')
    if record['kind'] == 'asset':
        for key in ('file', 'rights', 'journey', 'revision', 'result'):
            if not isinstance(record.get(key), str) or not record[key].strip():
                raise ValueError('Asset needs '+key)
        path = Path(record['file'])
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 200_000_000:
            raise ValueError('Asset must be a bounded existing regular file')
        sha = hashlib.sha256(path.read_bytes()).hexdigest()
        if not isinstance(record.get('passed'), bool):
            raise ValueError('Asset needs an explicit journey pass/fail')
        if record.get('sha256') != sha or record.get('inspected') is not True:
            raise ValueError('Asset needs matching hash and explicit inspected result')
    elif record['kind'] == 'result':
        for key in ('draft_id', 'metric', 'window_start', 'window_end'):
            if not isinstance(record.get(key), str) or not record[key].strip():
                raise ValueError('Result needs '+key)
        start = datetime.fromisoformat(record['window_start'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(record['window_end'].replace('Z', '+00:00'))
        if start.tzinfo is None or end.tzinfo is None or not start <= end <= at:
            raise ValueError('Invalid observation window')
        for key in ('numerator', 'denominator'):
            n = record.get(key)
            if isinstance(n, bool) or not isinstance(n, (float, int)) or not math.isfinite(n) or n < 0:
                raise ValueError('Result needs nonnegative counts and denominator')
        if record['numerator'] > record['denominator']:
            raise ValueError('Numerator exceeds denominator')
        if record.get('action_metric') not in (True, False):
            raise ValueError('Declare whether this measures a product action')
    else:
        raise ValueError('Unknown campaign record kind')


def report(state, projects, channels=None):
    records = read(state/'campaign-records.json', [])
    feedback = read(state/'owner-feedback.json', [])
    accounts = {channel: account for account, channel in (channels or {}).items()}
    provider = read(state/'provider-metrics.json', [])
    attribution = {}
    for path in (state/'runs').glob('*/result.json'):
        saved = read(path, {})
        for index, draft in enumerate(saved.get('drafts', [])):
            campaign = (draft.get('craft') or {}).get('campaign', {})
            if campaign.get('project') and campaign.get('pillar_id'):
                key = (draft.get('account', ''), hashlib.sha256(draft.get('text', '').encode()).hexdigest())
                attribution.setdefault(key, []).append((campaign['project'], campaign['pillar_id'], path.parent.name+':'+str(index)))
    out = {}
    for project, p in projects.items():
        themes = []
        for pillar in p['pillars']:
            rows = [r for r in records if r.get('project') == project and r.get('pillar_id') == pillar['id']]
            assets, results = [], []
            for r in rows:
                try:
                    validate(r, projects)
                except (ValueError, OSError):
                    continue
                (assets if r['kind'] == 'asset' else results).append(r)
            comparable = {}
            for r in results:
                if r['action_metric'] and r['denominator'] > 0:
                    comparable.setdefault(r['metric'], set()).add(r['draft_id'])
            latest_assets = {}
            for asset in sorted(assets, key=lambda a: a['observed_at']):
                latest_assets[asset['journey']] = asset
            enough = any(len(ids) >= 2 for ids in comparable.values())
            decision = 'review_results' if enough else 'collect_comparable_results'
            if not assets:
                decision = 'capture_demonstration'
            elif any(not r['passed'] for r in latest_assets.values()):
                decision = 'fix_journey_before_distribution'
            observations = [{**row, 'draft_id': attribution[(accounts.get(row['channel_id'], ''), row['text_sha256'])][0][2]} for row in provider
                if len(attribution.get((accounts.get(row.get('channel_id'), ''), row.get('text_sha256')), [])) == 1
                and attribution[(accounts.get(row['channel_id'], ''), row['text_sha256'])][0][:2] == (project, pillar['id'])]
            themes.append({'provider_observations': observations[:20], 'pillar_id': pillar['id'], 'theme': pillar.get('story', pillar['id']), 'asset_ids': [r['id'] for r in assets],
                           'assets': [{k:r[k] for k in ('id','source','sha256','rights','journey','revision','result','passed','observed_at')} for r in assets],
                           'capture_task': '' if assets else p.get('first_use_check', 'Record and inspect a real permitted task.'),
                           'result_ids': [r['id'] for r in results], 'decision': decision,
                           'results': [{k:r[k] for k in ('id','metric','draft_id','numerator','denominator','window_start','window_end','source','action_metric')} for r in results]})
        relevant = []
        for item in feedback:
            draft_id = item.get('draft_id', '')
            run, _, index = draft_id.rpartition(':')
            if run in ('', '.', '..') or '/' in run or '\\' in run or not index.isdigit():
                continue
            saved = read(state/'runs'/run/'result.json', {})
            drafts = saved.get('drafts', [])
            if int(index) < len(drafts) and (drafts[int(index)].get('craft') or {}).get('campaign', {}).get('project') == project:
                relevant.append({k:item.get(k) for k in ('decision','note','reasons','original_text','final_text','draft_id')})
        out[project] = {'themes': themes, 'measurement': p.get('measurement', ''),
                        'owner_feedback': relevant[:20],
                        'note': 'No automatic strategy promotion. Review comparable product actions and journey failures; missing measures are unavailable.'}
    return {'generated_at': datetime.now(timezone.utc).isoformat(), 'projects': out,
            'provider_observation_count': len(provider),
            'unattributed_provider_observations': [r for r in provider if len(attribution.get((accounts.get(r.get('channel_id'), ''), r.get('text_sha256')), [])) != 1][:30],
            'provider_note': 'Dated Buffer observations; metric refresh can lag. Post text matches are exact and ambiguous matches remain unattributed. Engagement is not adoption.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--strategies', type=Path, default=Path(__file__).resolve().parents[2]/'content/marketing/strategies.json')
    parser.add_argument('--record', type=Path, help='Add one inspected asset or observed result by immutable ID')
    args = parser.parse_args()
    projects = json.loads(args.strategies.read_text())['projects']
    args.state.mkdir(parents=True, exist_ok=True)
    from runner import atomic_write
    if args.record:
        record = json.loads(args.record.read_text())
        validate(record, projects)
        records = read(args.state/'campaign-records.json', [])
        previous = next((r for r in records if r.get('id') == record['id']), None)
        if previous and previous != record:
            raise ValueError('Record ID already exists with different evidence; use a new ID')
        if previous is None:
            atomic_write(args.state/'campaign-records.json', json.dumps(records+[record], indent=2)+'\n')
    cfg = json.loads((Path(__file__).parent/'config.json').read_text())
    result = report(args.state, projects, cfg.get('channels'))
    atomic_write(args.state/'campaign-review.json', json.dumps(result, indent=2)+'\n')
    print(json.dumps({'projects': len(result['projects']), 'report': str(args.state/'campaign-review.json')}))


if __name__ == '__main__':
    main()
