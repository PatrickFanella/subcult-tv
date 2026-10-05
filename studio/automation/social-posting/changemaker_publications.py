#!/usr/bin/env python3
"""Prepare daily website and Patreon review drafts; this key cannot publish."""
import argparse
from datetime import datetime, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import urllib.request

from runner import atomic_write
from sources import NoRedirect, changemaker_context, complete_changemaker_digest, public_url

HERE = Path(__file__).resolve().parent


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


def ingest(payload, env_file):
    settings = {}
    for line in env_file.read_text().splitlines():
        if not line.lstrip().startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            if key in ('POSTING_INGEST_URL', 'POSTING_PREPARATION_KEY'):
                values = shlex.split(value, comments=True)
                settings[key] = values[0] if values else ''
    url = settings.get('POSTING_INGEST_URL', '')
    if url != 'https://subcult.tv/api/v1/posting-preparation' or len(settings.get('POSTING_PREPARATION_KEY', '')) < 32:
        raise ValueError('Preparation endpoint or credential is unavailable')
    request = urllib.request.Request(url, data=json.dumps(payload).encode(), method='POST', headers={
        'Authorization': 'Bearer '+settings['POSTING_PREPARATION_KEY'],
        'Content-Type': 'application/json', 'User-Agent': 'SUBCULT-daily-draft-preparation/1.0'})
    with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
        return json.loads(response.read(4096))


def execute(source_root, state, ingest_env=None):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    with (state/'publications.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        now = datetime.now(timezone.utc)
        context = changemaker_context(cfg['switchyard'], now)
        if not context['drafts']:
            return {'status': context['status'], 'publishing_enabled': False}
        digest = complete_changemaker_digest(context)
        evidence = digest['evidence']
        items = {item['id']: item for item in evidence['items'] if item.get('kind') == 'pull request' and item.get('state') == 'merged'}
        if not items:
            return {'status': 'no_completed_updates', 'publishing_enabled': False}
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
            if cfg.get('craft', True):
                try:
                    import craft
                    result = craft.publication(cfg, proof, digest['draft'], claims, directory/'craft')
                    validate(result, items)
                except Exception as error:  # fall back to the single-pass prompt
                    (directory/'craft-error.txt').write_text(type(error).__name__+': '+str(error)[:2000]+'\n')
                    result = None
            if result is None:
                prompt = (HERE/'changemaker-publications-prompt.md').read_text()+'\n'+json.dumps({
                    'evidence': proof, 'digest': digest['draft'], 'claims': claims,
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
            validate(result, items)
            selected = {**{key: proof[key] for key in ('run_id', 'evidence_sha256', 'draft_sha256')},
                        'items': [items[key] for key in result['source_ids']]}
            day = now.date().isoformat()
            payload = [{'id': 'daily-'+day+'-'+platform, 'platform': platform, 'title': result['title'],
                        'excerpt': result['excerpt'], 'body': result[platform+'_body'].removeprefix('Draft for human review.').lstrip(),
                        'due_at': (now+timedelta(hours=48)).isoformat(), 'source': selected}
                       for platform in ('website', 'patreon')]
            atomic_write(payload_path, json.dumps(payload, indent=2)+'\n')
        # Never include text or credential values in timer output.
        if ingest_env:
            receipt = directory/'ingested.json'
            if receipt.exists():
                return {'status': 'already_prepared', 'draft_count': 2, 'publishing_enabled': False}
            result = ingest(payload, ingest_env)
            atomic_write(receipt, json.dumps({'checked_at': now.isoformat(), **result})+'\n')
        return {'status': 'drafts_prepared', 'draft_count': 2, 'publishing_enabled': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state, args.ingest_env)))
