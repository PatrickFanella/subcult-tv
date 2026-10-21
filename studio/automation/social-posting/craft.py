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
import time

import render
import strategy

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
    pack = strategy.context(cfg)
    return {
        'demonstration_evidence': [asset for project in pack.get('campaign_review', {}).get('projects', {}).values()
            for theme in project.get('themes', []) for asset in theme.get('assets', []) if asset.get('passed')],
        'voice': read(STUDIO/'content/VOICE.md'),
        'style': read(Path.home()/'.codex/skills/unslop/SKILL.md'),
        'research': read(RESEARCH/'DIGEST.md'),
        'patterns': read(RESEARCH/'post-patterns.md')[:60000],
        'examples': read(CRAFT/'examples.md'),
        'marketing_strategies': pack,
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
    for attempt in range(3):
        out.unlink(missing_ok=True)
        with (directory/f'{name}.events.jsonl').open('w') as events, (directory/f'{name}.stderr.log').open('w') as err:
            done = subprocess.run(command, input=prompt, text=True, stdout=events, stderr=err,
                                  cwd=directory, env=clean_env(), timeout=timeout)
        failed_turn = 'turn.failed' in (directory/f'{name}.events.jsonl').read_text()
        if not done.returncode and not failed_turn and out.is_file():
            break
        if not (done.returncode or failed_turn) or attempt == 2:
            raise ValueError(f'Stage {name} failed; inspect private run evidence')
        for suffix in ('events.jsonl', 'stderr.log'):
            shutil.copyfile(directory/f'{name}.{suffix}', directory/f'{name}.attempt-{attempt+1}.{suffix}')
        # Provider capacity and other transient failures: wait and retry the same stage.
        time.sleep((30, 120)[attempt])
    else:
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
            record.update(kind=media['kind'], headline=media['headline'], alt_text=check['alt_text'])
            return jpeg, record
        if check['fix'] == 'regenerate_art' and media['kind'] == 'illustration':
            media['image_prompt'] += '\n\nCorrection: '+check['art_prompt_change']
            art = None
        elif check['fix'] == 'shorten_headline' and check['new_headline'].strip():
            media['headline'] = check['new_headline'].strip()
        elif check['fix'] == 'switch_to_type':
            media['kind'] = 'type'
    record['unresolved'] = True
    # A failed visual must not appear as a ready image in the review dashboard.
    return None, record


ART = json.loads(read(CRAFT/'art-direction.json', '{}'))


def brand_for(product, source_repos=()):
    """Map a product name or the evidence repositories to a brand slug in the art direction."""
    slug = (product or '').strip().lower().replace(' ', '-')
    if slug in ART:
        return slug
    return next((REPO_BRAND[r] for r in source_repos if r in REPO_BRAND), 'subcult')


def picture(cfg, text, product, directory, n, recent_kinds=(), extra=None):
    """Plan, render and check an image for a caption written without one.

    Used when the staged path did not run, so every Instagram draft still
    reaches review with a prepared image. Returns (path or None, record, alt_text).
    """
    directory.mkdir(parents=True, exist_ok=True)
    plan = codex(cfg, stage_prompt('picture', {'caption': text, 'product': product, 'recent_kinds': list(recent_kinds),
                                               'art_direction': {product: ART.get(product, {})}, **(extra or {})}),
                 directory, f'picture-{n}', 'picture', effort='medium')
    jpeg, record = make_media(cfg, {'text': text, 'product': product, 'media': plan['media']}, directory, n)
    return jpeg, record, record.get('alt_text', '')


def reroll_caption(cfg, draft, evidence, claims, directory, note='', image=None, recent=()):
    """Rewrite one caption around the same story; returns {text, angle, changed}.

    When `image` is given the model sees the picture the caption will ship with.
    """
    craft = draft.get('craft') or {}
    payload = {**guidance(cfg), 'claims': claims, 'evidence': evidence, 'draft_rules': read(CRAFT/'draft.md'),
               'account': draft.get('account', ''), 'product': craft.get('product', ''),
               'previous': draft.get('text', ''), 'alternatives': craft.get('alternatives', []),
               'angle': craft.get('angle', ''), 'reader': craft.get('reader', ''),
               'headline': (draft.get('media') or {}).get('headline', '') if image else '',
               'recent_captions': list(recent), 'owner_note': note}
    return codex(cfg, stage_prompt('reroll', payload), directory, 'reroll', 'reroll', effort='high',
                 images=[image] if image else ())


def checked_final(cfg, payload, directory):
    """Check the final rewrite itself, allow one repair, then withhold weak copy."""
    feedback = []
    for attempt in range(2):
        final = codex(cfg, stage_prompt('final', {**payload, 'quality_feedback': feedback}),
                      directory, f'4-final-{attempt}', 'final', effort='high')
        if not final['drafts']:
            return final
        check = codex(cfg, stage_prompt('check-final', {**payload, 'final': final}),
                      directory, f'5-check-{attempt}', 'check-final', effort='high')
        if check['pass']:
            return final
        feedback = check['issues']
        payload = {**payload, 'previous_final': final}
    return {'drafts': [], 'open_checks': ['Final caption withheld after one revision: '+x for x in feedback]}


def instagram(cfg, evidence, digest, claims, directory, recent=(), mode='change', extra=None):
    """Run the four writing stages and the media stage; return schema-shaped drafts."""
    shared = {**guidance(cfg), 'claims': claims, 'evidence': evidence, 'digest': digest, 'recent_captions': list(recent), 'mode': mode, **(extra or {})}
    products = {shared.get('product', '')} | {REPO_BRAND.get(i.get('source', '').split('/')[-1], '') for i in evidence.get('items', [])}
    pack = shared['marketing_strategies']
    if pack and any(products):
        shared['marketing_strategies'] = {**pack, 'projects': {k: v for k, v in pack['projects'].items() if k in products}}
    first = {'showcase': 'showcase', 'weekly': 'weekly'}.get(mode, 'brief')
    brief = codex(cfg, stage_prompt(first, shared), directory, '1-brief', 'brief', effort='high')
    if not brief['items']:
        return {'drafts': [], 'open_checks': [f"Skipped {', '.join(s['source_ids'])}: {s['why']}" for s in brief['skipped']]}
    drafts = codex(cfg, stage_prompt('draft', {**shared, 'brief': brief}), directory, '2-draft', 'draft', effort='medium')
    review = codex(cfg, stage_prompt('review', {**shared, 'brief': brief, 'drafts': drafts}), directory, '3-review', 'review', effort='high')
    final = checked_final(cfg, {**shared, 'brief': brief, 'drafts': drafts, 'review': review,
                               'draft_rules': read(CRAFT/'draft.md'), 'art_direction': ART}, directory)
    by_item = {r['item']: r for r in review['reviews']}
    out = []
    valid, used = {i['id'] for i in evidence.get('items', [])}, set()
    if mode != 'showcase':
        kept = []
        for draft in final['drafts']:
            # Claims-register IDs (C-...) support wording but are not collected sources; never reuse a source.
            ids = [sid for sid in dict.fromkeys(draft['source_ids']) if sid in valid and sid not in used]
            # A weekly post may stand on the ask alone when the week had nothing to show.
            if ids or mode == 'weekly':
                draft['source_ids'] = ids
                used.update(ids)
                kept.append(draft)
        final['drafts'] = kept
    for n, draft in enumerate(final['drafts']):
        # Resolve by product/source identity as well as index: older stage
        # outputs used both zero- and one-based references.
        matches = [i for i in brief['items'] if i['product'] == draft['product']
                   and set(draft['source_ids']) <= set(i['source_ids'])]
        item = matches[0] if len(matches) == 1 else (
            brief['items'][draft['item']] if 0 <= draft['item'] < len(brief['items']) else {})
        repos = [next((i['source'].split('/')[-1] for i in evidence['items'] if i['id'] == sid), '') for sid in draft['source_ids']]
        draft['product'] = brand_for(draft['product'], repos)
        jpeg, record = make_media(cfg, draft, directory, n)
        draft['alt_text'] = record.get('alt_text', '')
        if record.get('unresolved'):
            draft['next_check'] = (draft['next_check'].rstrip()+' Image review failed; prepare and inspect a matching asset before approval.').strip()
        if record.get('kind') == 'screenshot':
            draft['next_check'] = (draft['next_check'].rstrip()+' The image is a capture of the live page, which can show third-party names, thumbnails or clips; check rights before posting.').strip()
        reviewed = by_item.get(draft['item'], {})
        scores = [d['scores'] for d in reviewed.get('drafts', []) if d['draft'] == reviewed.get('base_draft')]
        alternatives = [d['text'] for d in drafts['drafts'] if d['item'] == draft['item']]
        out.append({**draft, 'image': str(jpeg) if jpeg else '', 'media_record': record,
                    'craft': {'reader': item.get('reader', ''), 'reason': item.get('reason', ''),
                              'pattern': next((a['pattern'] for a in item.get('angles', [])[:1]), ''),
                              'scores': scores[0] if scores else {}, 'alternatives': alternatives,
                              'campaign': (shared.get('campaign') or {}).get('review_metadata') or
                                  strategy.metadata(cfg, draft['product'], theme=draft.get('angle', ''))}})
    return {'drafts': out, 'open_checks': final['open_checks'] +
            [f"Skipped {', '.join(s['source_ids'])}: {s['why']}" for s in brief['skipped']]}


URL = re.compile(r'https?://\S+')


def polish_short(cfg, drafts, directory, limit=280, owner=()):
    """Critique and rewrite short X/Bluesky drafts in place; keep any rewrite that fails a check.

    Returns the private polish record. Editor failures preserve the original text;
    an invalid selected packet stops preparation before the editor call.
    """
    for draft in drafts:
        strategy.attach(cfg, draft)
    try:
        payload = {**guidance(cfg), 'drafts': [{'index': n, 'account': d.get('account', ''), 'kind': d.get('kind', ''),
                                                'text': d.get('text', ''), 'evidence': d.get('evidence', '')}
                                               for n, d in enumerate(drafts)], 'owner_feedback': list(owner)}
        payload.pop('patterns', None)
        result = codex(cfg, stage_prompt('short', payload), directory, 'polish', 'short', effort='high', timeout=900)
    except Exception as error:  # the unpolished drafts remain the output
        return {'status': 'skipped', 'reason': type(error).__name__}
    record = {'status': 'ok', 'changes': []}
    for edit in result['drafts']:
        n = edit['index']
        if not 0 <= n < len(drafts):
            continue
        strategy.attach(cfg, drafts[n], edit.get('project', ''), edit.get('pillar_id', ''), reader_action=edit.get('reader_action'))
        if not edit['changed']:
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


def weekly(cfg, evidence, digest, claims, cta, account, directory, recent=(), extra=None):
    """The weekly recap that ends with one call to action."""
    return instagram(cfg, evidence, digest, claims, directory, recent, mode='weekly',
                     extra={'cta': cta, 'cta_account': account, **(extra or {})})


def showcase(cfg, product, claims, directory, recent=()):
    """One post introducing a live product, built from its register row and its live page."""
    url = ART[product]['screenshot_urls'][0]
    try:
        page = page_text(url)
    except (subprocess.SubprocessError, OSError):
        page = ''
    if not page:
        raise ValueError('Showcase public page unavailable; no current product evidence')
    campaign = strategy.campaign(cfg, product, Path(directory).parents[2])
    return instagram(cfg, {'items': []}, '', claims, directory, recent, mode='showcase',
                     extra={'product': product, 'product_page': page, 'product_url': url, 'campaign': campaign})
