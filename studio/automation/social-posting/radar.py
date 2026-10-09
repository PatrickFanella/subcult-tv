#!/usr/bin/env python3
"""Prepare fresh discoveries and quote-post candidates; never publish."""
from datetime import datetime, timedelta, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
from zoneinfo import ZoneInfo

import runner
from sources import changemaker_context, discovery_inputs


def candidates(cfg, now):
    found = discovery_inputs(cfg['discovery'], now)
    try:
        changemaker = changemaker_context(cfg['switchyard'], now)
    except Exception as error:
        changemaker = {'status':'unavailable','drafts':[]}
        found['warnings'].append('Changemaker unavailable: '+type(error).__name__)
    for digest in changemaker['drafts']:
        for item in digest['evidence'].get('items', []):
            updated = datetime.fromisoformat(item['updated_at'].replace('Z','+00:00'))
            if not timedelta(0) <= now-updated <= timedelta(hours=48):
                continue
            identity = hashlib.sha256((item['url']+'@'+item['updated_at']).encode()).hexdigest()[:16]
            found['items'].append({'id':'CM-'+identity,
                'kind':'current', 'title':item.get('title',''), 'url':item['url'],
                'observed_at':now.isoformat(), 'published_at':item['updated_at'],
                'excerpt':item.get('excerpt',''), 'run_id':digest['run_id'],
                'evidence_sha256':digest['evidence_sha256'],
                'evidence_boundary':'Internal project activity. Not deployment proof; never expose private repository URLs in public copy.'})
    found['changemaker'] = changemaker
    found['items'] = list({item['id']:item for item in found['items']}.values())
    return found


def validate(result, context, cfg, now):
    if len(result['drafts']) > 3:
        raise ValueError('Too many timely drafts in one batch')
    sources = {item['id']:item for item in context['items']}
    seen = set()
    slots = {}
    weekly_counts = {}
    for slot in context.get('prepared_slots', []):
        due = datetime.fromisoformat(slot['due_at'])
        local = due.astimezone(ZoneInfo(cfg['timezone']))
        slots.setdefault((slot['account'],local.date()),[]).append(due)
        key=(slot['account'],local.strftime('%G-W%V'))
        weekly_counts[key]=weekly_counts.get(key,0)+1
    for draft in result['drafts']:
        if draft['account'] not in cfg['channels'] or not draft['source_ids']:
            raise ValueError('Timely draft requires a known account and actual source')
        if not set(draft['source_ids']) <= sources.keys():
            raise ValueError('Timely draft references an uncollected source')
        if not draft['text'].strip() or len(draft['text']) > 280 or 'git.subcult.tv' in draft['text']:
            raise ValueError('Invalid public timely copy')
        due = datetime.fromisoformat(draft['due_at'])
        expiry = datetime.fromisoformat(draft['expires_at'])
        if due.tzinfo is None or expiry.tzinfo is None or not now < due <= expiry <= now+timedelta(hours=24):
            raise ValueError('Timely draft is expired or outside its 24-hour window')
        local = due.astimezone(ZoneInfo(cfg['timezone']))
        if due.utcoffset() != local.utcoffset():
            raise ValueError('Timely slot must use Chicago local offset')
        lane = cfg['cadence'][draft['account']]
        key = (draft['account'], local.date())
        prior = slots.setdefault(key, [])
        if len(prior) >= len(lane['times']) or any(abs((due-other).total_seconds()) < 5400 for other in prior):
            raise ValueError('Timely account capacity or spacing exceeded')
        prior.append(due)
        week_key=(draft['account'],local.strftime('%G-W%V'))
        weekly_counts[week_key]=weekly_counts.get(week_key,0)+1
        if weekly_counts[week_key] > lane['weekly_cap']:
            raise ValueError('Timely weekly capacity exceeded')
        if draft['account'] == 'clpr' and not any('clpr' in json.dumps(sources[s]).casefold()
                or 'twitch' in sources[s].get('title','').casefold() for s in draft['source_ids']):
            raise ValueError('Timely source does not belong on CLPR')
        if draft['kind'] == 'quote':
            original = draft['quote_url']
            if not original or not any(sources[s]['kind'] == 'quote' and sources[s]['url'] == original for s in draft['source_ids']):
                raise ValueError('Quote draft lacks an original captured post')
            if original not in draft['text']:
                raise ValueError('Quote copy must include the exact original URL')
        elif draft['quote_url'] is not None:
            raise ValueError('Non-quote draft cannot attach a quote URL')
        # One useful destination per discovered source, avoiding coordinated duplicates.
        if seen.intersection(draft['source_ids']):
            raise ValueError('A timely source was reused within the batch')
        seen.update(draft['source_ids'])


def execute(cfg):
    os.umask(0o077)
    state = Path(cfg['state'])
    now = datetime.now(timezone.utc)
    with (state/'runner.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status':'already_running', 'mode':'radar'}
        with sqlite3.connect(state/'runs.sqlite3') as db:
            db.execute('CREATE TABLE IF NOT EXISTS timely_seen (source_id TEXT PRIMARY KEY, run_id TEXT, prepared_at TEXT)')
            db.execute('CREATE TABLE IF NOT EXISTS timely_slots (run_id TEXT, account TEXT, due_at TEXT, expires_at TEXT, PRIMARY KEY(run_id,account,due_at))')
            context = candidates(cfg, now)
            context['items'] = [i for i in context['items'] if not db.execute('SELECT 1 FROM timely_seen WHERE source_id=?',(i['id'],)).fetchone()]
            if not context['items']:
                receipt = {'status':'no_fresh_sources', 'mode':'radar', 'checked_at':now.isoformat(),
                    'changemaker_status':context['changemaker']['status'], 'warnings':context['warnings'], 'publishing_enabled':False}
                runner.atomic_write(state/'radar-latest.json', json.dumps(receipt,indent=2)+'\n')
                return receipt
            run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-radar'
            directory = state/'runs'/run_id;directory.mkdir(mode=0o700)
            claims = runner.paths.social(cfg)/'Product Claims Register.md'
            week = now.astimezone(ZoneInfo(cfg['timezone'])).strftime('%G-W%V')
            weekly = runner.paths.drafts(cfg)/(week+' Content Posts.md')
            context['media_library'] = runner.media.context(cfg)
            context['posting_guidance'] = (runner.paths.root(cfg)/cfg['editorial_guide']).read_text()
            context['claims_register'] = claims.read_text()
            context['owner_feedback'] = runner.feedback.owner_feedback(Path(cfg['state']), ('x', 'bluesky'), 30)
            context['editorial_style'] = (Path.home()/'.codex/skills/unslop/SKILL.md').read_text()
            context['weekly_plan'] = weekly.read_text() if weekly.exists() else 'No current-week plan.'
            timely_folder = runner.paths.drafts(cfg)/'Timely Drafts'
            context['recent_timely_notes'] = {p.name:p.read_text()[:6000]
                for p in sorted(timely_folder.glob('*.md'))[-12:]}
            context['prepared_slots'] = [{'account':account,'due_at':due}
                for account,due,expiry in db.execute('SELECT account,due_at,expires_at FROM timely_slots')
                if datetime.fromisoformat(expiry) > now]
            context['prepared_slots'] += [{'account':account,'due_at':due}
                for account,due in re.findall(r'#### [^\n]+ / (patrick|subcult|clpr)\s+Intended time: ([^ .]+)',context['weekly_plan'])
                if datetime.fromisoformat(due) > now]
            runner.atomic_write(directory/'sources.json',json.dumps(context,indent=2)+'\n')
            prompt=(runner.HERE/'radar-prompt.md').read_text()+'\n\n'+json.dumps({'now':now.isoformat(),
                'timezone':cfg['timezone'],'channels':cfg['channels'],'organization_id':cfg['organization_id'],
                'cadence':cfg['cadence'],'context':context})
            runner.atomic_write(directory/'request.txt',prompt)
            command = runner.codex_command(cfg,directory)
            command[command.index('--output-schema')+1] = str(runner.HERE/'radar.schema.json')
            # Native web search is discovery/verification only; write tools remain unavailable.
            command[command.index('web_search="disabled"')] = 'web_search="live"'
            env = dict(os.environ)
            for key in ['OPENAI_API_KEY','CODEX_API_KEY','OPENAI_BASE_URL']:
                env.pop(key,None)
            with (directory/'events.jsonl').open('w') as out, (directory/'stderr.log').open('w') as err:
                result = subprocess.run(command,input=prompt,text=True,stdout=out,stderr=err,env=env,cwd=directory,timeout=900)
            if result.returncode:
                raise ValueError('Timely draft preparation failed; inspect private run evidence')
            events=[json.loads(line) for line in (directory/'events.jsonl').read_text().splitlines() if line.strip()]
            proof=runner.verify_evidence(events,cfg)
            result=json.loads((directory/'result.json').read_text())
            originals=[draft.get('text') for draft in result['drafts']]
            if result['drafts'] and cfg.get('polish', True):
                import craft
                craft.polish_short(cfg, result['drafts'], directory, owner=context['owner_feedback'])
            try:
                validate(result,context,cfg,now)
            except ValueError:
                for draft,text in zip(result['drafts'],originals):
                    draft['text']=text
                validate(result,context,cfg,now)
            catalog = runner.media.context(cfg)
            for draft in result['drafts']:
                runner.media.validate_choice(draft.get('media'), catalog, draft['account'])
            runner.media.save_requests(directory, result)
            runner.bluesky.save(directory, result, cfg)
            folder=runner.paths.drafts(cfg)/'Timely Drafts'
            target=folder/(now.astimezone(ZoneInfo(cfg['timezone'])).strftime('%Y-%m-%d %H-%M-%S')+' '+run_id+' Timely Drafts.md')
            lines=['---','type: work','status: active','stage: draft','---','', '# Timely drafts', '',
                '[[Timely Posting Plan]] · [[Social Posts Workbench]]','',
                f'Run: `{run_id}`. All copy unapproved. No posts submitted. Trend-driven material requires a deliberate human posting decision.', '',result['summary'],'']
            for draft in result['drafts']:
                lines += [f'## {draft["kind"]} / {draft["account"]}', '',draft['text'],'',
                    f'Proposed: {draft["due_at"]}. Expires: {draft["expires_at"]}.', '',
                    'Sources: '+', '.join(draft['source_ids']), '', 'Evidence: '+draft['evidence'], '',
                    'Before posting: '+draft['next_check'], '']
                lines += runner.media.render_choice(draft.get('media'))
            lines += ['## Open checks','']+['- '+item for item in result['open_checks']]
            runner.atomic_write(target,'\n'.join(lines)+'\n')
            for draft in result['drafts']:
                db.executemany('INSERT OR IGNORE INTO timely_seen VALUES (?,?,?)',[(s,run_id,now.isoformat()) for s in draft['source_ids']])
                db.execute('INSERT INTO timely_slots VALUES (?,?,?,?)',(run_id,draft['account'],draft['due_at'],draft['expires_at']))
            db.commit()
            receipt={'status':'success','mode':'radar','run_id':run_id,'note':str(target),
                'draft_count':len(result['drafts']),'provider_evidence':proof,'changemaker_status':context['changemaker']['status'],
                'checked_at':now.isoformat(),'publishing_enabled':False}
            runner.atomic_write(directory/'receipt.json',json.dumps(receipt,indent=2)+'\n')
            runner.atomic_write(state/'radar-latest.json',json.dumps(receipt,indent=2)+'\n')
            return receipt


if __name__ == '__main__':
    cfg=json.loads((runner.HERE/'config.json').read_text())
    try:
        print(json.dumps(execute(cfg)))
    except Exception as error:
        receipt={'status':'failed','mode':'radar','error_type':type(error).__name__,'error':str(error),'publishing_enabled':False}
        runner.atomic_write(Path(cfg['state'])/'radar-latest.json',json.dumps(receipt,indent=2)+'\n')
        print(json.dumps(receipt));raise SystemExit(1)
