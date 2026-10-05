#!/usr/bin/env python3
"""Prepare private Instagram drafts from verified Changemaker evidence; never dispatch."""
import argparse
from datetime import datetime, timedelta, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

from sources import changemaker_context, complete_changemaker_digest
from runner import atomic_write

HERE = Path(__file__).resolve().parent


def identity(item):
    return hashlib.sha256((item['url']+'@'+item['updated_at']).encode()).hexdigest()


def used_sources(state):
    used = set()
    for path in (state/'runs').glob('*/receipt.json'):
        if path.is_symlink() or path.stat().st_size > 64000:
            continue
        try:
            receipt = json.loads(path.read_text())
            if receipt.get('mode') == 'changemaker' and receipt.get('status') == 'success':
                used.update(receipt.get('source_identities', []))
        except (ValueError, OSError):
            continue
    return used


def validate(result, items):
    if len(result['drafts']) > 3:
        raise ValueError('Too many Changemaker drafts')
    seen = set()
    for draft in result['drafts']:
        ids = draft['source_ids']
        if draft['account'] not in ('patrick', 'subcult') or not ids or len(ids) != len(set(ids)):
            raise ValueError('Invalid Instagram account or sources')
        if not set(ids) <= items.keys() or seen.intersection(ids):
            raise ValueError('Unknown or reused Changemaker source')
        seen.update(ids)
        text = draft['text']
        if not text.strip() or len(text) > 2200 or 'git.subcult.tv' in text.casefold():
            raise ValueError('Invalid public Instagram caption')
        if any(k in draft for k in ('approval', 'approved', 'published')):
            raise ValueError('Draft cannot grant approval')
        if not draft['media_brief'].strip() or not draft['next_check'].strip():
            raise ValueError('Review and media requirements are missing')


def recent_captions(state, now, days=14):
    """Captions prepared in the last two weeks, so a new batch does not repeat their shapes."""
    texts = []
    for path in sorted((state/'runs').glob('*-changemaker/result.json'), reverse=True)[:20]:
        if path.is_symlink() or path.stat().st_size > 2_000_000:
            continue
        if (now.timestamp() - path.stat().st_mtime) > days*86400:
            continue
        try:
            texts += [d['text'] for d in json.loads(path.read_text()).get('drafts', []) if isinstance(d.get('text'), str)]
        except (ValueError, OSError):
            continue
    return texts[:30]


def single_pass(cfg, source_root, selected, digest, claims, directory):
    """The original one-call caption prompt, kept as the fallback path."""
    prompt = (HERE/'changemaker-instagram-prompt.md').read_text()+'\n'+json.dumps({
        'evidence': selected, 'digest': digest['draft'], 'claims': claims,
        'voice': (HERE.parents[1]/'content/VOICE.md').read_text(),
        'style': (Path.home()/'.codex/skills/unslop/SKILL.md').read_text()})
    command = [cfg['codex'], 'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
               '-s', 'read-only', '-m', cfg['model'], '--json',
               '--output-schema', str(HERE/'changemaker-instagram.schema.json'),
               '-o', str(directory/'result-model.json'),
               '-c', 'approval_policy="never"', '-c', 'web_search="disabled"',
               '-c', 'features.shell_tool=false', '-c', 'model_reasoning_effort="medium"', '-']
    env = dict(os.environ)
    for key in ('OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL'):
        env.pop(key, None)
    with (directory/'events.jsonl').open('w') as out, (directory/'stderr.log').open('w') as err:
        completed = subprocess.run(command, input=prompt, text=True, stdout=out, stderr=err,
                                   cwd=directory, env=env, timeout=600)
    if completed.returncode:
        raise ValueError('Caption generation failed; inspect private run evidence')
    return json.loads((directory/'result-model.json').read_text())


def posting_slots(cfg, now, count):
    """Daytime Chicago slots at least 48 hours ahead, one per draft, never stacked."""
    from zoneinfo import ZoneInfo
    zone = ZoneInfo(cfg.get('timezone', 'America/Chicago'))
    times = cfg.get('instagram_times', ['11:30', '17:30'])
    earliest = now+timedelta(hours=48)
    slots, day = [], earliest.astimezone(zone).date()
    while len(slots) < count:
        for value in times:
            hour, minute = map(int, value.split(':'))
            slot = datetime(day.year, day.month, day.day, hour, minute, tzinfo=zone)
            if slot >= earliest and len(slots) < count:
                slots.append(slot)
        day += timedelta(days=1)
    return slots


def checklist(next_check):
    """Split a free-text check into discrete items for the review screen."""
    parts = [p.strip(' ;.') for p in re.split(r'(?<=[.;])\s+(?=[A-Z])', next_check or '') if p.strip(' ;.')]
    return parts[:8]


def image_record(path, state):
    from PIL import Image
    with Image.open(path) as image:
        width, height = image.size
    return {'file': str(path.resolve().relative_to(state.resolve())), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'width': width, 'height': height, 'bytes': path.stat().st_size}


def execute(source_root, state):
    os.umask(0o077)
    state.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((source_root/'automation/social-posting/config.json').read_text())
    with (state/'runner.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        now = datetime.now(timezone.utc)
        context = changemaker_context(cfg['switchyard'], now)
        if not context['drafts']:
            return {'status': context['status'], 'mode': 'changemaker', 'publishing_enabled': False}
        digest = complete_changemaker_digest(context)
        evidence = digest['evidence']
        used = used_sources(state)
        items = {i['id']: i for i in evidence['items']
                 if i.get('kind') == 'pull request' and i.get('state') == 'merged' and identity(i) not in used}
        if not items:
            return {'status': 'no_new_sources', 'mode': 'changemaker', 'publishing_enabled': False}
        run_id = now.strftime('%Y%m%dT%H%M%S.%fZ')+'-changemaker'
        directory = state/'runs'/run_id
        directory.mkdir(parents=True, mode=0o700)
        selected = {'run_id': digest['run_id'], 'evidence_sha256': digest['evidence_sha256'],
                    'draft_sha256': digest['draft_sha256'], 'items': list(items.values())}
        atomic_write(directory/'sources.json', json.dumps(selected, indent=2)+'\n')
        claims = (source_root/'content/social/Product Claims Register.md').read_text()
        result, crafted = None, False
        if cfg.get('craft', True):
            try:
                import craft
                staged = craft.instagram(cfg, selected, digest['draft'], claims, directory/'craft', recent=recent_captions(state, now))
                result = {'drafts': [{**d, 'media_brief': d['media']['kind']+': '+(d['media']['headline'] or d['angle']),
                                      'next_check': d['next_check']} for d in staged['drafts']],
                          'open_checks': staged['open_checks']}
                validate(result, items)
                crafted = True
            except Exception as error:  # fall back to the single-pass prompt
                (directory/'craft-error.txt').write_text(type(error).__name__+': '+str(error)[:2000]+'\n')
                result = None
        if result is None:
            result = single_pass(cfg, source_root, selected, digest, claims, directory)
            validate(result, items)
        drafts = []
        identities = set()
        slots = posting_slots(cfg, now, len(result['drafts']))
        for n, draft in enumerate(result['drafts']):
            bound = [items[s] for s in draft['source_ids']]
            identities.update(identity(i) for i in bound)
            proof = 'Changemaker '+digest['run_id']+'; evidence SHA-256 '+digest['evidence_sha256']+'\n'
            proof += '\n'.join(i['id']+': '+i['title']+' — '+i['url'] for i in bound)
            media = {'mode': 'capture', 'asset_ids': [], 'brief': draft['media_brief'], 'alt_text': draft.get('alt_text', '')}
            record = {'account': draft['account'], 'platform': 'instagram', 'text': draft['text'],
                'due_at': slots[n].isoformat(), 'expires_at': (now+timedelta(days=7)).isoformat(), 'evidence': proof,
                'next_check': draft['next_check'], 'checklist': checklist(draft['next_check']), 'media': media}
            if crafted:
                plan = draft['media']
                media.update(mode='generate' if plan['kind'] == 'illustration' else 'capture' if plan['kind'] == 'screenshot' else 'library',
                             kind=draft['media_record'].get('kind', plan['kind']), headline=draft['media_record'].get('headline', plan['headline']))
                image = Path(draft['image']) if draft['image'] else None
                if image and image.is_file() and image.resolve().is_relative_to(state.resolve()):
                    media['image'] = image_record(image, state)
                record['craft'] = {**draft['craft'], 'angle': draft['angle'], 'product': draft['product'],
                                   'visual_checks': draft['media_record'].get('checks', [])[-1:]}
            drafts.append(record)
        atomic_write(directory/'result.json', json.dumps({'drafts': drafts, 'open_checks': result['open_checks']}, indent=2)+'\n')
        receipt = {'mode': 'changemaker', 'status': 'success', 'run_id': run_id,
                   'draft_count': len(drafts), 'checked_at': now.isoformat(),
                   'source_identities': sorted(identities if drafts else {identity(i) for i in items.values()}),
                   'publishing_enabled': False}
        atomic_write(directory/'receipt.json', json.dumps(receipt, indent=2)+'\n')
        return receipt


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--state', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(execute(args.source_root, args.state)))
