#!/usr/bin/env python3
"""Prepare daily website and Patreon review drafts; this key cannot publish."""
import argparse
from datetime import datetime, timedelta, timezone
from preparation_lock import acquire
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import urllib.request

from runner import atomic_write
from changes import changes_context, identity, previous_window_end
import job_status
import strategy
from sources import NoRedirect, complete_changemaker_digest, public_url

HERE = Path(__file__).resolve().parent
JOB = 'changemaker-publications'
# Outcomes whose sources were read by the editor and must not be offered again.
CONSUMING = ('drafts_prepared', 'no_user_facing_change', 'already_prepared')


def used_sources(state):
    """Identities of every source an earlier publications run read, from its receipts."""
    used = set()
    runs = state/'runs'
    if not runs.is_dir():
        return used
    for path in runs.glob('*-publications/receipt.json'):
        if path.is_symlink() or path.stat().st_size > 64000:
            continue
        try:
            receipt = json.loads(path.read_text())
        except (ValueError, OSError):
            continue
        if receipt.get('mode') == 'publications' and receipt.get('status') in CONSUMING:
            used.update(receipt.get('source_identities', []))
    return used


def validate(result, items):
    ids = result['source_ids']
    if not ids or len(ids) != len(set(ids)) or not set(ids) <= items.keys():
        raise ValueError('Unknown or repeated source references')
    for key, limit in [('title', 300), ('excerpt', 2000), ('website_body', 50000), ('patreon_body', 50000)]:
        value = result[key]
        if not isinstance(value, str) or not value.strip() or len(value) > limit:
            raise ValueError('Invalid publication content')
        if 'git.subcult.tv' in value.casefold() or '<' in value or '![' in value:
            raise ValueError('Private links or unsupported embedded media in publication')
        for url in re.findall(r'https?://[^\s)\]>]+', value):
            if not public_url(url):
                raise ValueError('Publication contains a private or invalid URL')


def preparation_settings(env_file):
    """The website's preparation endpoint and key; the key cannot approve or dispatch."""
    settings = {}
    for line in env_file.read_text().splitlines():
        if not line.lstrip().startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            if key in ('POSTING_INGEST_URL', 'POSTING_PREPARATION_KEY'):
                values = shlex.split(value, comments=True)
                settings[key] = values[0] if values else ''
    if settings.get('POSTING_INGEST_URL', '') != 'https://subcult.tv/api/v1/posting-preparation' or len(settings.get('POSTING_PREPARATION_KEY', '')) < 32:
        raise ValueError('Preparation endpoint or credential is unavailable')
    return settings


def ingest(payload, env_file):
    settings = preparation_settings(env_file)
    url = settings['POSTING_INGEST_URL']
    request = urllib.request.Request(url, data=json.dumps(payload).encode(), method='POST', headers={
        'Authorization': 'Bearer '+settings['POSTING_PREPARATION_KEY'],
        'Content-Type': 'application/json', 'User-Agent': 'SUBCULT-daily-draft-preparation/1.0'})
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        return json.loads(response.read(4096))


def _execute(source_root, state, ingest_env=None, run_directory=None):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    with (state/'publications.lock').open('a') as lock:
        acquire(lock)
        now = datetime.now(timezone.utc)
        # Continue from the previous complete collection so an early manual run leaves no gap.
        context = changes_context(cfg, now, since=previous_window_end(state, 'publications', now))
        if run_directory is not None:
            atomic_write(run_directory/'collection.json', json.dumps(context, indent=2)+'\n')
        if not context['drafts']:
            return {'status': context['status'], 'publishing_enabled': False}
        digest = complete_changemaker_digest(context)
        evidence = digest['evidence']
        used = used_sources(state)
        items = {item['id']: item for item in evidence['items']
                 if item.get('kind') == 'pull request' and item.get('state') == 'merged' and identity(item) not in used}
        if not items:
            status = 'no_completed_updates' if not evidence['items'] else 'no_new_sources'
            return {'status': status, 'publishing_enabled': False}
        identities = sorted(identity(item) for item in items.values())
        day = now.date().isoformat()
        if any(p.is_file() for p in (state/'publications').glob('*/drafts.json')
               if p.parent != state/'publications'/digest['evidence_sha256'] and _edition_day(p) == day):
            # The website accepts one `daily-<date>-<platform>` edition per day. Leave the
            # new sources unconsumed; the continued window offers them to the next run.
            return {'status': 'already_prepared_today', 'draft_count': 0, 'publishing_enabled': False}
        # One edition per source digest. Re-running an old digest on a new day
        # cannot manufacture a new daily update or replace owner-edited drafts.
        directory = state/'publications'/digest['evidence_sha256']
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        payload_path = directory/'drafts.json'
        if payload_path.exists():
            payload = json.loads(payload_path.read_text())
        else:
            proof = {key: digest[key] for key in ('run_id', 'evidence_sha256', 'draft_sha256')}
            proof['items'] = list(items.values())
            atomic_write(directory/'source.json', json.dumps(proof, indent=2)+'\n')
            claims = (source_root/'content/social/Product Claims Register.md').read_text()
            result = None
            if cfg.get('craft_publications', False):  # staged edition is still being tuned
                try:
                    import craft
                    result = craft.publication(cfg, proof, digest['draft'], claims, directory/'craft')
                    validate(result, items)
                except Exception as error:  # fall back to the single-pass prompt
                    (directory/'craft-error.txt').write_text(type(error).__name__+': '+str(error)[:2000]+'\n')
                    result = None
            if result is None:
                prompt = (HERE/'changemaker-publications-prompt.md').read_text()+'\n'+json.dumps({
                    'evidence': proof, 'digest': digest['draft'], 'claims': claims, 'marketing_strategies': strategy.context(cfg),
                    'voice': (HERE.parents[1]/'content/VOICE.md').read_text()})
                command = [cfg['codex'], 'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
                           '-s', 'read-only', '-m', cfg['model'], '--json', '--output-schema',
                           str(HERE/'changemaker-publications.schema.json'), '-o', str(directory/'result.json'),
                           '-c', 'approval_policy="never"', '-c', 'web_search="disabled"',
                           '-c', 'features.shell_tool=false', '-c', 'model_reasoning_effort="medium"', '-']
                env = {key: value for key, value in os.environ.items() if key not in (
                    'OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL', 'POSTING_PREPARATION_KEY')}
                with (directory/'events.jsonl').open('w') as out, (directory/'stderr.log').open('w') as err:
                    completed = subprocess.run(command, input=prompt, text=True, stdout=out, stderr=err,
                                               cwd=directory, env=env, timeout=600)
                if completed.returncode:
                    raise ValueError('Publication drafting failed; inspect private evidence')
                result = json.loads((directory/'result.json').read_text())
            if not result.get('source_ids'):
                # The editor kept nothing: no user-facing change today. Record why; prepare no entry.
                atomic_write(directory/'skipped.json', json.dumps({'checked_at': now.isoformat(),
                    'reason': str(result.get('excerpt', ''))[:2000]}, indent=2)+'\n')
                return {'status': 'no_user_facing_change', 'draft_count': 0, 'publishing_enabled': False,
                        'source_identities': identities}
            validate(result, items)
            selected = {**{key: proof[key] for key in ('run_id', 'evidence_sha256', 'draft_sha256')},
                        'items': [items[key] for key in result['source_ids']]}
            payload = [{'id': 'daily-'+day+'-'+platform, 'platform': platform, 'title': result['title'],
                        'excerpt': result['excerpt'], 'body': result[platform+'_body'].removeprefix('Draft for human review.').lstrip(),
                        'due_at': (now+timedelta(hours=48)).isoformat(), 'source': selected}
                       for platform in ('website', 'patreon')]
            atomic_write(payload_path, json.dumps(payload, indent=2)+'\n')
        # Never include text or credential values in timer output.
        if ingest_env:
            receipt = directory/'ingested.json'
            if receipt.exists():
                return {'status': 'already_prepared', 'draft_count': 2, 'publishing_enabled': False,
                        'source_identities': identities}
            result = ingest(payload, ingest_env)
            atomic_write(receipt, json.dumps({'checked_at': now.isoformat(), **result})+'\n')
    return {'status': 'drafts_prepared', 'draft_count': 2, 'publishing_enabled': False, 'source_identities': identities}


def _edition_day(payload_path):
    """The UTC day an edition's `daily-<date>-<platform>` IDs name, or '' when unreadable."""
    try:
        entries = json.loads(payload_path.read_text())
        match = re.match(r'^daily-(\d{4}-\d{2}-\d{2})-', entries[0]['id'])
    except (ValueError, OSError, IndexError, KeyError, TypeError):
        return ''
    return match.group(1) if match else ''


def execute(source_root, state, ingest_env=None):
    """Record every outcome, including deliberate no-draft runs and failures."""
    os.umask(0o077)
    started = datetime.now(timezone.utc)
    run_id = started.strftime('%Y%m%dT%H%M%S.%fZ')+'-publications'
    directory = state/'runs'/run_id
    directory.mkdir(parents=True, mode=0o700)
    receipt = {'mode': 'publications', 'run_id': run_id, 'draft_count': 0, 'publishing_enabled': False}
    try:
        result = _execute(source_root, state, ingest_env, run_directory=directory)
    except Exception as error:
        receipt.update(status='failed', error=type(error).__name__, checked_at=datetime.now(timezone.utc).isoformat())
        atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
        job_status.write(state, JOB, 'failed', run_id=run_id, started=started, reason=type(error).__name__)
        raise
    receipt.update(result, checked_at=datetime.now(timezone.utc).isoformat())
    atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
    status = 'success' if result.get('status') == 'drafts_prepared' else 'skipped'
    job_status.write(state, JOB, status, run_id=run_id, started=started, reason=result.get('status', ''))
    # The caller sees the outcome; the source ledger stays in the receipt.
    return {key: value for key, value in result.items() if key != 'source_identities'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state, args.ingest_env)))
