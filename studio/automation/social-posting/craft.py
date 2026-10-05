#!/usr/bin/env python3
"""Staged Instagram drafting: brief, drafts, review, final, then a checked image.

Each stage is a separate read-only model call with its own schema, so the
writer, the critic and the finisher do not share one context. Generated art and
screenshots are rendered with brand-pack type by render.py and inspected by a
visual review before they are attached. Nothing is approved or published.
"""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess

import render

HERE = Path(__file__).resolve().parent
CRAFT = HERE/'craft'
STUDIO = HERE.parents[1]
RESEARCH = STUDIO/'content/social/research'
GENERATED = Path.home()/'.codex/generated_images'
REPO_BRAND = {'clpr': 'clpr', 'patchwork': 'patchwork', 'hasanara': 'hasanara', 'transcript-create': 'rekolekt',
              'rekolekt': 'rekolekt', 'subcult-os': 'subcult-os', 'undertow': 'undertow', 'kork': 'kork'}


def read(path, default=''):
    path = Path(path)
    return path.read_text() if path.is_file() else default


def guidance(cfg):
    """Shared, read-only context every stage receives."""
    return {
        'voice': read(STUDIO/'content/VOICE.md'),
        'style': read(Path.home()/'.codex/skills/unslop/SKILL.md'),
        'research': read(RESEARCH/'DIGEST.md'),
        'patterns': read(RESEARCH/'post-patterns.md')[:60000],
        'examples': read(CRAFT/'examples.md'),
    }


def clean_env():
    return {k: v for k, v in os.environ.items() if k not in ('OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL', 'POSTING_PREPARATION_KEY')}


def codex(cfg, prompt, directory, name, schema=None, effort='medium', images=(), timeout=900):
    """Run one read-only, tool-less model call and return its JSON (or text)."""
    directory = Path(directory).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    out = directory/f'{name}.json'
    command = [cfg['codex'], 'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check',
               '-s', 'read-only', '-m', cfg['model'], '--json', '-o', str(out),
               '-c', 'approval_policy="never"', '-c', 'web_search="disabled"',
               '-c', 'features.shell_tool=false', '-c', f'model_reasoning_effort="{effort}"']
    if schema:
        command += ['--output-schema', str(CRAFT/f'{schema}.schema.json')]
    for image in images:
        command += ['-i', str(image)]
    command.append('-')
    (directory/f'{name}.prompt.md').write_text(prompt)
    with (directory/f'{name}.events.jsonl').open('w') as events, (directory/f'{name}.stderr.log').open('w') as err:
        done = subprocess.run(command, input=prompt, text=True, stdout=events, stderr=err,
                              cwd=directory, env=clean_env(), timeout=timeout)
    if done.returncode or not out.is_file():
        raise ValueError(f'Stage {name} failed; inspect private run evidence')
    text = out.read_text()
    return json.loads(text) if schema else text


def stage_prompt(name, payload):
    return read(CRAFT/f'{name}.md')+'\n\n'+json.dumps(payload, ensure_ascii=False)


def generate_art(cfg, prompt, directory, name):
    """Ask the model's built-in image tool for one image and copy it into the run."""
    before = set(GENERATED.glob('*/*.png')) if GENERATED.is_dir() else set()
    request = ('Use your image generation tool to create exactly one image, portrait orientation (2:3), for a 4:5 Instagram post. '
               'It must contain no text, letters, numbers, logos, watermarks, user-interface screens, real people or public figures. '
               'Keep the lower third calmer so type can sit over it.\n\nImage brief:\n'+prompt+
               '\n\nReply with only the absolute path of the generated image file.')
    reply = codex(cfg, request, directory, name, effort='low', timeout=600)
    match = re.search(r'(/\S+\.png)', reply)
    candidates = [Path(match.group(1))] if match else []
    candidates += sorted(set(GENERATED.glob('*/*.png')) - before, key=lambda p: p.stat().st_mtime, reverse=True)
    for path in candidates:
        path = path.resolve()
        if path.is_file() and path.is_relative_to(GENERATED.resolve()):
            target = directory/f'{name}.png'
            shutil.copyfile(path, target)
            return target
    raise ValueError('Image generation returned no file')


def visual_check(cfg, jpeg, draft, directory, name):
    prompt = read(CRAFT/'visual.md')+'\n\n'+json.dumps({'caption': draft['text'], 'headline': draft['media']['headline'],
                                                        'kind': draft['media']['kind'], 'product': draft['product']})
    return codex(cfg, prompt, directory, name, schema='visual', effort='medium', images=[jpeg], timeout=600)


def make_media(cfg, draft, directory, n):
    """Produce one checked JPEG for a final draft; returns (path, record)."""
    media = dict(draft['media'])
    slug = draft['product'] if draft['product'] in ART else 'subcult'
    record = {'kind': media['kind'], 'brand': slug, 'headline': media['headline'], 'checks': []}
    art = None
    for attempt in range(3):
        kind = media['kind']
        try:
            if kind == 'illustration':
                if art is None:
                    brief = media['image_prompt']+'\n\nArt direction: '+ART[slug]['art']
                    art = generate_art(cfg, brief, directory, f'art-{n}-{attempt}')
                image = art
            elif kind == 'screenshot':
                allowed = ART[slug]['screenshot_urls']
                url = media['url'] if media['url'] in allowed else allowed[0]
                image = render.capture(url, directory/f'capture-{n}.png')
                record['url'] = url
            else:
                image = None
            jpeg = render.render(kind, slug, media['headline'], media['kicker'], directory/f'post-{n}.jpg', image)
        except (ValueError, subprocess.SubprocessError, OSError) as error:
            record['checks'].append({'attempt': attempt, 'error': str(error)[:300]})
            media['kind'] = 'type'
            continue
        check = visual_check(cfg, jpeg, {**draft, 'media': media}, directory, f'visual-{n}-{attempt}')
        record['checks'].append({'attempt': attempt, **check})
        if check['pass']:
            record.update(kind=media['kind'], headline=media['headline'])
            return jpeg, record
        if check['fix'] == 'regenerate_art' and media['kind'] == 'illustration':
            media['image_prompt'] += '\n\nCorrection: '+check['art_prompt_change']
            art = None
        elif check['fix'] == 'shorten_headline' and check['new_headline'].strip():
            media['headline'] = check['new_headline'].strip()
        elif check['fix'] == 'switch_to_type':
            media['kind'] = 'type'
    record['unresolved'] = True
    return (directory/f'post-{n}.jpg' if (directory/f'post-{n}.jpg').is_file() else None), record


ART = json.loads(read(CRAFT/'art-direction.json', '{}'))


def instagram(cfg, evidence, digest, claims, directory, recent=(), mode='change', extra=None):
    """Run the four writing stages and the media stage; return schema-shaped drafts."""
    shared = {**guidance(cfg), 'claims': claims, 'evidence': evidence, 'digest': digest, 'recent_captions': list(recent), 'mode': mode, **(extra or {})}
    brief = codex(cfg, stage_prompt('showcase' if mode == 'showcase' else 'brief', shared), directory, '1-brief', 'brief', effort='high')
    if not brief['items']:
        return {'drafts': [], 'open_checks': [f"Skipped {', '.join(s['source_ids'])}: {s['why']}" for s in brief['skipped']]}
    drafts = codex(cfg, stage_prompt('draft', {**shared, 'brief': brief}), directory, '2-draft', 'draft', effort='medium')
    review = codex(cfg, stage_prompt('review', {**shared, 'brief': brief, 'drafts': drafts}), directory, '3-review', 'review', effort='high')
    final = codex(cfg, stage_prompt('final', {**shared, 'brief': brief, 'drafts': drafts, 'review': review,
                                              'draft_rules': read(CRAFT/'draft.md'),
                                              'art_direction': ART}), directory, '4-final', 'final', effort='high')
    by_item = {r['item']: r for r in review['reviews']}
    out = []
    for n, draft in enumerate(final['drafts']):
        item = brief['items'][draft['item']] if 0 <= draft['item'] < len(brief['items']) else {}
        slug = draft['product'].strip().lower().replace(' ', '-')
        if slug not in ART:
            repos = {sid: next((i['source'].split('/')[-1] for i in evidence['items'] if i['id'] == sid), '') for sid in draft['source_ids']}
            slug = next((REPO_BRAND[r] for r in repos.values() if r in REPO_BRAND), 'subcult')
        draft['product'] = slug
        jpeg, record = make_media(cfg, draft, directory, n)
        if record.get('kind') == 'screenshot':
            draft['next_check'] = (draft['next_check'].rstrip()+' The image is a capture of the live page, which can show third-party names, thumbnails or clips; check rights before posting.').strip()
        reviewed = by_item.get(draft['item'], {})
        scores = [d['scores'] for d in reviewed.get('drafts', []) if d['draft'] == reviewed.get('base_draft')]
        alternatives = [d['text'] for d in drafts['drafts'] if d['item'] == draft['item']]
        out.append({**draft, 'image': str(jpeg) if jpeg else '', 'media_record': record,
                    'craft': {'reader': item.get('reader', ''), 'reason': item.get('reason', ''),
                              'pattern': next((a['pattern'] for a in item.get('angles', [])[:1]), ''),
                              'scores': scores[0] if scores else {}, 'alternatives': alternatives}})
    return {'drafts': out, 'open_checks': final['open_checks'] +
            [f"Skipped {', '.join(s['source_ids'])}: {s['why']}" for s in brief['skipped']]}


URL = re.compile(r'https?://\S+')


def polish_short(cfg, drafts, directory, limit=280):
    """Critique and rewrite short X/Bluesky drafts in place; keep any rewrite that fails a check.

    Returns the private polish record. Never raises: the original drafts stay valid.
    """
    try:
        payload = {**guidance(cfg), 'drafts': [{'index': n, 'account': d.get('account', ''), 'kind': d.get('kind', ''),
                                                'text': d.get('text', ''), 'evidence': d.get('evidence', '')}
                                               for n, d in enumerate(drafts)]}
        payload.pop('patterns', None)
        result = codex(cfg, stage_prompt('short', payload), directory, 'polish', 'short', effort='high', timeout=900)
    except Exception as error:  # the unpolished drafts remain the output
        return {'status': 'skipped', 'reason': type(error).__name__}
    record = {'status': 'ok', 'changes': []}
    for edit in result['drafts']:
        n = edit['index']
        if not 0 <= n < len(drafts) or not edit['changed']:
            continue
        old, new = drafts[n].get('text', ''), edit['text'].strip()
        if not new or len(new) > limit or set(URL.findall(old)) - set(URL.findall(new)):
            record['changes'].append({'index': n, 'kept_original': True, 'scores': edit['scores'], 'note': edit['note']})
            continue
        drafts[n]['text'] = new
        record['changes'].append({'index': n, 'original': old, 'text': new, 'scores': edit['scores'], 'note': edit['note']})
    (directory/'polish-record.json').write_text(json.dumps(record, indent=2)+'\n')
    return record


def publication(cfg, evidence, digest, claims, directory):
    """Staged website and Patreon edition; returns the publications schema shape."""
    shared = {**guidance(cfg), 'claims': claims, 'evidence': evidence, 'digest': digest, 'examples': read(CRAFT/'pub-examples.md')}
    brief = codex(cfg, stage_prompt('pub-brief', shared), directory, 'p1-brief', 'pub-brief', effort='high')
    drafts = codex(cfg, stage_prompt('pub-draft', {**shared, 'brief': brief}), directory, 'p2-draft', 'pub-draft', effort='medium')
    review = codex(cfg, stage_prompt('pub-review', {**shared, 'brief': brief, 'drafts': drafts}), directory, 'p3-review', 'pub-review', effort='high')
    final = codex(cfg, stage_prompt('pub-final', {**shared, 'brief': brief, 'drafts': drafts, 'review': review,
                                                  'draft_rules': read(CRAFT/'pub-draft.md')}), directory, 'p4-final', 'pub-final', effort='high')
    if not final['excerpt'].strip() and review['excerpt'].strip():
        final['excerpt'] = review['excerpt']
    return final


def page_text(url, limit=6000):
    """Visible text of a public page, via headless Chromium's DOM dump."""
    if not url.startswith('https://'):
        raise ValueError('Public HTTPS pages only')
    html_text = subprocess.run(['chromium', '--headless=new', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom', url],
                               capture_output=True, text=True, timeout=120, check=True).stdout
    text = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', html_text, flags=re.S | re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', __import__('html').unescape(text)).strip()[:limit]


def showcase(cfg, product, claims, directory, recent=()):
    """One post introducing a live product, built from its register row and its live page."""
    url = ART[product]['screenshot_urls'][0]
    try:
        page = page_text(url)
    except (subprocess.SubprocessError, OSError):
        page = ''
    return instagram(cfg, {'items': []}, '', claims, directory, recent, mode='showcase',
                     extra={'product': product, 'product_page': page, 'product_url': url})
