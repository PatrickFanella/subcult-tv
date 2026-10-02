#!/usr/bin/env python3
"""Prepare social drafts and review delivery with read-only provider tools."""
from __future__ import annotations

import argparse
from datetime import date, datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import tempfile
from zoneinfo import ZoneInfo
from sources import changemaker_context
import media
import bluesky

HERE = Path(__file__).resolve().parent
BEGIN = '<!-- social-posting-runner:begin -->'
END = '<!-- social-posting-runner:end -->'
BUFFER_TOOLS = ['get_account', 'list_channels', 'get_channel', 'list_posts']
SP_TOOLS = ['get_projects', 'get_tasks', 'get_task']


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', dir=path.parent, delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(text)
        stream.flush()
        os.fsync(stream.fileno())
    os.chmod(temporary, 0o600)
    os.replace(temporary, path)


def week_for(now: datetime, first: str, requested: str | None = None) -> str:
    week = requested or now.strftime('%G-W%V')
    if not re.fullmatch(r'\d{4}-W\d{2}', week):
        raise ValueError('Week must use YYYY-Www')
    year, number = map(int, week.split('-W'))
    date.fromisocalendar(year, number, 1)
    return max(week, first) if requested is None else week


def managed_update(original: str, section: str, expected: str | None) -> str:
    block = BEGIN+'\n'+section.strip()+'\n'+END
    count = original.count(BEGIN)
    if count == 0:
        if END in original:
            raise ValueError('Unpaired managed-section marker')
        return original.rstrip()+'\n\n'+block+'\n'
    if count != 1 or original.count(END) != 1:
        raise ValueError('Ambiguous managed-section markers')
    start, stop = original.index(BEGIN), original.index(END)+len(END)
    if stop <= start or expected is None or digest(original[start:stop]) != expected:
        raise ValueError('Managed section was edited; preserving it for human review')
    return original[:start]+block+original[stop:]


def objects(result: dict) -> list:
    parsed = []
    for content in (result or {}).get('content', []):
        if content.get('type') == 'text':
            try:
                parsed.append(json.loads(content['text']))
            except (ValueError, KeyError):
                pass
    return parsed


def verify_evidence(events: list[dict], cfg: dict) -> dict:
    calls = [e['item'] for e in events if e.get('type') == 'item.completed'
             and e.get('item', {}).get('type') == 'mcp_tool_call']
    for call in calls:
        allowed = BUFFER_TOOLS if call['server'] == 'buffer' else SP_TOOLS if call['server'] == 'super-productivity' else []
        if call['tool'] not in allowed:
            raise ValueError('Unexpected provider tool: '+call['server']+'/'+call['tool'])
    successful = [c for c in calls if c.get('status') == 'completed' and not c.get('error')
                  and not c.get('result', {}).get('isError')
                  and not any(isinstance(obj, dict) and (obj.get('error') or obj.get('httpCode', 200) >= 400)
                              for obj in objects(c.get('result', {})))]
    def data(tool, server='buffer'):
        return [obj for c in successful if c['server'] == server and c['tool'] == tool for obj in objects(c['result'])]
    accounts = data('get_account')
    if not any(cfg['organization_id'] in [o['id'] for o in x.get('organizations', [])] for x in accounts if isinstance(x, dict)):
        raise ValueError('Buffer workspace was not confirmed by actual tool output')
    channel_lists = [x for x in data('list_channels') if isinstance(x, list)]
    channels = {c['id']: c for rows in channel_lists for c in rows}
    for cid in cfg['channels'].values():
        if cid not in channels or channels[cid].get('isDisconnected') or channels[cid].get('isLocked'):
            raise ValueError('Expected Buffer channel missing, disconnected or locked')
    if not data('list_posts'):
        raise ValueError('Buffer post inspection was not confirmed')
    for project in cfg['projects']:
        if not any(c['server'] == 'super-productivity' and c['tool'] == 'get_tasks'
                   and c.get('arguments', {}).get('projectId') == project for c in successful):
            raise ValueError('Live task inspection missing for project '+project)
    return {'organization_id': cfg['organization_id'], 'channel_ids': sorted(cfg['channels'].values()),
            'successful_read_calls': len(successful)}


def source_context(cfg: dict, directory: Path) -> dict:
    vault = Path(cfg['vault'])
    notes = {rel: (vault/rel).read_text() for rel in cfg['notes']}
    snapshots = []
    for repo in cfg['repositories']:
        path = Path(repo['path'])
        if not path.exists():
            raise ValueError('Source checkout missing for '+repo['product'])
        env = dict(os.environ, GIT_TERMINAL_PROMPT='0')
        result = subprocess.run(['git', '-C', str(path), 'fetch', '--quiet', repo['remote'], 'main'],
                                capture_output=True, text=True, timeout=90, env=env)
        if result.returncode:
            raise ValueError('Source refresh failed for '+repo['product'])
        ref = repo['remote']+'/main'
        sha = subprocess.check_output(['git', '-C', str(path), 'rev-parse', ref], text=True).strip()
        docs = {}
        for document in repo['documents']:
            result = subprocess.run(['git', '-C', str(path), 'show', ref+':'+document],
                                    capture_output=True, text=True, timeout=10)
            if result.returncode:
                raise ValueError('Scope document missing for '+repo['product']+': '+document)
            docs[document] = result.stdout[:10000]
        snapshots.append({'product': repo['product'], 'revision': sha, 'documents': docs})
    context = {'notes': notes, 'repositories': snapshots}
    context['media_library'] = media.context(cfg)
    context['posting_guidance'] = (vault/cfg['editorial_guide']).read_text()
    context['editorial_style'] = (Path.home()/'.codex/skills/unslop/SKILL.md').read_text()
    atomic_write(directory/'sources.json', json.dumps(context, indent=2)+'\n')
    return context


def codex_command(cfg: dict, directory: Path) -> list[str]:
    args = [cfg['codex'], 'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
            '-s', 'read-only', '-m', cfg['model'], '--json', '--output-schema', str(HERE/'result.schema.json'),
            '-o', str(directory/'result.json')]
    settings = {
        'approval_policy': 'never', 'web_search': 'disabled', 'features.shell_tool': False,
        'model_reasoning_effort': 'low',
        'mcp_servers.buffer.url': 'https://mcp.buffer.com/mcp',
        'mcp_servers.buffer.required': True, 'mcp_servers.buffer.enabled_tools': BUFFER_TOOLS,
        'mcp_servers.super-productivity.command': cfg['sp_command'],
        'mcp_servers.super-productivity.required': True,
        'mcp_servers.super-productivity.enabled_tools': SP_TOOLS,
        'mcp_servers.super-productivity.env.SP_MCP_DATA_DIR': cfg['sp_data'],
    }
    for server, names in [('buffer', BUFFER_TOOLS), ('super-productivity', SP_TOOLS)]:
        for name in names:
            settings[f'mcp_servers.{server}.tools.{name}.approval_mode'] = 'approve'
    for key, value in settings.items():
        args += ['-c', key+'='+json.dumps(value)]
    return args+['-']


def validate_result(result: dict, cfg: dict, week: str, bank: str, prepared_slots: list | None = None, now: datetime | None = None) -> None:
    if result['week'] != week or len(result['drafts']) > sum(lane['weekly_cap'] for lane in cfg['cadence'].values()):
        raise ValueError('Unexpected week or draft count')
    candidate_ids = set(re.findall(r'\| ([A-Z]+-\d+) \|', bank))
    seen = set()
    counts = {}
    daily_counts = {}
    reserved = {}
    for slot in prepared_slots or []:
        due = datetime.fromisoformat(slot['due_at'])
        local = due.astimezone(ZoneInfo(cfg['timezone']))
        if local.strftime('%G-W%V') != week:
            continue
        account = slot['account']
        counts[account] = counts.get(account, 0)+1
        day_key = (account, local.date())
        daily_counts[day_key] = daily_counts.get(day_key, 0)+1
        reserved.setdefault(account, []).append(due)
    for draft in result['drafts']:
        if draft['candidate_id'] not in candidate_ids or draft['account'] not in cfg['channels']:
            raise ValueError('Unknown bank entry or account')
        if draft['account'] == 'clpr' and not draft['candidate_id'].startswith('CLPR-'):
            raise ValueError('Non-CLPR material routed to CLPR')
        key = (draft['account'], draft['due_at'])
        if key in seen or not draft['text'].strip() or len(draft['text']) > 280:
            raise ValueError('Duplicate slot or oversized/empty X draft')
        seen.add(key)
        due = datetime.fromisoformat(draft['due_at'])
        if due.tzinfo is None or due.astimezone(ZoneInfo(cfg['timezone'])).strftime('%G-W%V') != week:
            raise ValueError('Draft time is not in the requested local week')
        if now is not None and due <= now:
            raise ValueError('Draft time is already past')
        for other in reserved.get(draft['account'], []):
            if abs((due-other).total_seconds()) < 90*60:
                raise ValueError('Draft conflicts with prepared capacity or spacing')
        reserved.setdefault(draft['account'], []).append(due)
        local = due.astimezone(ZoneInfo(cfg['timezone']))
        lane = cfg['cadence'][draft['account']]
        # Retain the original standard Thursday slot for existing pilot notes.
        times = lane['times']+(['09:22'] if draft['account'] == 'subcult' and local.weekday() == 3 else [])
        if (due.utcoffset() != local.utcoffset() or local.weekday() not in lane['days']
                or local.strftime('%H:%M') not in times or local.second or local.microsecond):
            raise ValueError('Draft time does not match the account cadence')
        counts[draft['account']] = counts.get(draft['account'], 0)+1
        if counts[draft['account']] > lane['weekly_cap']:
            raise ValueError('Account weekly cap exceeded')
        day_key = (draft['account'], local.date())
        daily_counts[day_key] = daily_counts.get(day_key, 0)+1
        if daily_counts[day_key] > len(lane['times']):
            raise ValueError('Account daily cap exceeded')
        # JSON contains drafts only; there is no approval or dispatch state to invent.
        if any(k in draft for k in ['approval', 'approved', 'published']):
            raise ValueError('Generated output cannot grant publishing approval')


def render_result(result: dict, run_id: str, mode: str) -> str:
    lines = [f'## Automated {mode} — {result["week"]}', '', f'Run: `{run_id}`. Drafts only; no posts submitted.', '',
             result['summary'], '', '### Current observations', '']
    lines += ['- '+x for x in result['observations']]
    lines += ['', '### Drafts awaiting review', '']
    for draft in result['drafts']:
        lines += [f'#### {draft["candidate_id"]} / {draft["account"]}', '',
                  f'Intended time: {draft["due_at"]}. State: `draft`.', '', draft['text'], '',
                  'Evidence boundary: '+draft['evidence'], '', 'Asset/check still needed: '+draft['next_check'], '']
        lines += media.render_choice(draft.get('media'))
    lines += ['### Open checks', '']+['- '+x for x in result['open_checks']]
    return '\n'.join(lines)


def execute(cfg: dict, mode: str, week: str, force: bool = False) -> dict:
    state = Path(cfg['state']);state.mkdir(parents=True, exist_ok=True);state.chmod(0o700)
    with (state/'runner.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status': 'already_running'}
        database = sqlite3.connect(state/'runs.sqlite3')
        database.execute('CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, mode TEXT, week TEXT, status TEXT, started TEXT, detail TEXT)')
        database.execute('CREATE TABLE IF NOT EXISTS sections (mode TEXT, week TEXT, hash TEXT, PRIMARY KEY(mode,week))')
        previous = database.execute('SELECT status FROM runs WHERE mode=? AND week=? ORDER BY started DESC LIMIT 1', (mode, week)).fetchone()
        if previous and previous[0] == 'success' and not force:
            return {'status': 'already_complete', 'mode': mode, 'week': week}
        vault = Path(cfg['vault']);folder = vault/'001 Projects/Works/Social Posts'
        target = folder/(week+' Content Posts.md') if mode == 'plan' else folder/(week+' Publishing Review.md')
        if mode == 'review' and not (folder/(week+' Content Posts.md')).exists():
            return {'status': 'no_weekly_plan', 'mode': mode, 'week': week}
        year, number = map(int, week.split('-W'))
        if mode == 'review' and datetime.now(ZoneInfo(cfg['timezone'])).date() < date.fromisocalendar(year, number, 1):
            return {'status': 'pilot_not_started', 'mode': mode, 'week': week}
        now = datetime.now(timezone.utc);run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-'+mode
        directory = state/'runs'/run_id;directory.mkdir(parents=True);directory.chmod(0o700)
        database.execute('INSERT INTO runs VALUES (?,?,?,?,?,?)', (run_id,mode,week,'running',now.isoformat(),''));database.commit()
        try:
            original = target.read_text() if target.exists() else f'---\ntitle: {week} '+('Content Posts' if mode == 'plan' else 'Publishing Review')+'\ntype: work\nstatus: active\nstage: draft\nweek-of: '+week+'\n---\n\n# '+week+' '+('Content Posts' if mode == 'plan' else 'Publishing Review')+'\n\n[[Social Posts Workbench]] · [[Social Posting Automation Plan]]\n'
            expected = database.execute('SELECT hash FROM sections WHERE mode=? AND week=?', (mode,week)).fetchone()
            # Check edits before paying for another model run.
            managed_update(original, 'preflight', expected[0] if expected else None)
            context = source_context(cfg, directory)
            if mode == 'plan':
                context['existing_weekly_note'] = original
                has_slots = database.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='timely_slots'").fetchone()
                context['prepared_slots'] = [{'account':account, 'due_at':due}
                    for account,due,expiry in database.execute('SELECT account,due_at,expires_at FROM timely_slots')
                    if datetime.fromisoformat(expiry) > now] if has_slots else []
            try:
                context['changemaker'] = changemaker_context(cfg['switchyard'], now)
            except Exception as error:
                context['changemaker'] = {'status':'unavailable', 'reason':type(error).__name__, 'drafts':[]}
            context['recent_weekly_notes'] = {p.name: p.read_text()[:6000]
                for p in sorted(folder.glob('* Content Posts.md'), reverse=True)
                if re.fullmatch(r'\d{4}-W\d{2} Content Posts\.md', p.name)
                and p.name[:8] < week}
            context['recent_weekly_notes'] = dict(list(context['recent_weekly_notes'].items())[:6])
            if mode == 'review':
                context['weekly_note'] = (folder/(week+' Content Posts.md')).read_text()
                context['timely_notes'] = {p.name:p.read_text()[:6000]
                    for p in sorted((folder/'Timely Drafts').glob('*.md'))[-21:]
                    if date.fromisoformat(p.name[:10]).strftime('%G-W%V') == week}
            prompt = (HERE/'prompt.md').read_text()+'\n\n'+json.dumps({'mode':mode,'week':week,'now':now.isoformat(),
                'organization_id':cfg['organization_id'],'channels':cfg['channels'],'projects':cfg['projects'],
                'cadence':cfg['cadence'], 'context':context})
            atomic_write(directory/'request.txt', prompt)
            environment = dict(os.environ)
            for name in ['OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL']:
                environment.pop(name, None)
            with (directory/'events.jsonl').open('w') as events_out, (directory/'stderr.log').open('w') as errors:
                completed = subprocess.run(codex_command(cfg, directory), input=prompt, stdout=events_out,
                    stderr=errors, text=True, cwd=directory, env=environment, timeout=900)
            if completed.returncode:
                raise ValueError('Codex job failed; inspect the private run directory')
            events = [json.loads(line) for line in (directory/'events.jsonl').read_text().splitlines() if line.strip()]
            evidence = verify_evidence(events, cfg)
            result = json.loads((directory/'result.json').read_text())
            bank = context['notes'][next(x for x in cfg['notes'] if x.endswith('SUBCULT Social Content Idea Pool.md'))]
            validate_result(result, cfg, week, bank, context.get('prepared_slots', []), now if mode == 'plan' else None)
            catalog = media.context(cfg)
            for draft in result['drafts']:
                media.validate_choice(draft.get('media'), catalog, draft['account'])
            media.save_requests(directory, result)
            bluesky.save(directory, result, cfg)
            if mode == 'review' and result['drafts']:
                raise ValueError('A delivery review cannot create new drafts')
            section = render_result(result, run_id, mode)
            updated = managed_update(original, section, expected[0] if expected else None)
            if target.exists() and target.read_text() != original:
                raise ValueError('Weekly note changed during run; preserving human edits')
            atomic_write(target, updated)
            section_hash = digest(BEGIN+'\n'+section.strip()+'\n'+END)
            database.execute('INSERT OR REPLACE INTO sections VALUES (?,?,?)', (mode,week,section_hash))
            receipt = {'status':'success','mode':mode,'week':week,'run_id':run_id,'note':str(target),'draft_count':len(result['drafts']),
                       'provider_evidence':evidence,'publishing_enabled':False,'checked_at':now.isoformat()}
            atomic_write(directory/'receipt.json',json.dumps(receipt,indent=2)+'\n')
            database.execute('UPDATE runs SET status=?, detail=? WHERE id=?', ('success',json.dumps(receipt),run_id));database.commit()
            atomic_write(state/'latest.json',json.dumps(receipt,indent=2)+'\n')
            return receipt
        except Exception as error:
            receipt = {'status':'failed','mode':mode,'week':week,'run_id':run_id,'error':str(error),'publishing_enabled':False}
            database.execute('UPDATE runs SET status=?, detail=? WHERE id=?', ('failed',json.dumps(receipt),run_id));database.commit()
            atomic_write(state/'latest.json',json.dumps(receipt,indent=2)+'\n')
            raise
        finally:
            database.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['plan','review','status'])
    parser.add_argument('--config', type=Path, default=HERE/'config.json')
    parser.add_argument('--week')
    parser.add_argument('--refresh', action='store_true', help='Refresh only an unchanged machine-owned section')
    args = parser.parse_args();os.umask(0o077)
    cfg = json.loads(args.config.read_text())
    if args.mode == 'status':
        path = Path(cfg['state'])/'latest.json'
        print(path.read_text() if path.exists() else '{"status":"never_run"}');return 0
    week = week_for(datetime.now(ZoneInfo(cfg['timezone'])), cfg['first_week'], args.week)
    try:
        result = execute(cfg,args.mode,week,args.refresh)
        print(json.dumps(result));return 0
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(json.dumps({'status':'failed','error':str(error)}));return 1


if __name__ == '__main__':
    raise SystemExit(main())
