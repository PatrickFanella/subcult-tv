#!/usr/bin/env python3
"""Turn the owner's review feedback into a proposed prompt change, as a pull request.

The job pulls feedback, and when enough new feedback has arrived it clones the
repository, lets a model edit an allowlist of prompt and guidance files, and
opens a Gitea pull request as the agent account. It never merges, deploys or
touches the installed release bundles; a person reviews the change first. While
an earlier tuning pull request is still open, it waits and keeps the feedback.
"""
import argparse
from datetime import datetime, timezone
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

import feedback

HERE = Path(__file__).resolve().parent
BRANCH_PREFIX = 'agent/prompt-tuning-'
SOCIAL = 'studio/automation/social-posting/'
ALLOWED = sorted([SOCIAL+name for name in (
    'prompt.md', 'radar-prompt.md', 'changemaker-instagram-prompt.md', 'changemaker-publications-prompt.md',
    'craft/brief.md', 'craft/draft.md', 'craft/review.md', 'craft/final.md', 'craft/short.md', 'craft/reroll.md',
    'craft/showcase.md', 'craft/examples.md', 'craft/pub-brief.md', 'craft/pub-draft.md', 'craft/pub-review.md',
    'craft/pub-final.md', 'craft/pub-examples.md')] + [
    'studio/content/VOICE.md', 'studio/content/social/Posting Best Practices.md'])
# The model's sandbox cannot write under .agents/, so the wrapper records its lessons here.
LESSONS = '.agents/skills/social-craft/references/lessons.md'
LESSONS_HEADING = '## Lessons from prompt tuning'
AGENT = ['-c', 'user.name=SUBCULT Agent', '-c', 'user.email=info@subcult.tv', '-c', 'commit.gpgsign=false']


def useful(record):
    """Feedback worth tuning on: marks, notes, reasons or an actual edit."""
    if record['decision'] == 'favorited':
        return True
    if record['decision'] == 'approved_edited':
        return record.get('original_text', '').strip() != record.get('final_text', '').strip()
    return bool(record.get('note', '').strip() or record.get('reasons'))


def select(records, cursor):
    """New useful feedback after the cursor, and an older sample for context."""
    fresh = [r for r in records if r.get('decided_at', '') > cursor and useful(r)]
    earlier = [r for r in records if r.get('decided_at', '') <= cursor and useful(r)][:20]
    return fresh, earlier


def record_lessons(clone, lessons, day):
    """Append the model's lessons as dated bullets; return how many were written."""
    clean = [' '.join(str(item).split()) for item in lessons if isinstance(item, str)]
    clean = [item for item in clean if 0 < len(item) <= 400][:5]
    if not clean:
        return 0
    path = clone/LESSONS
    text = path.read_text().rstrip('\n')
    if LESSONS_HEADING not in text:
        text += '\n\n'+LESSONS_HEADING+'\n\nWritten by `tune.py` from the owner\'s review feedback. Each bullet is dated with the newest feedback it used.\n'
    path.write_text(text+''.join(f'\n- **{day}.** {item}' for item in clean)+'\n')
    return len(clean)


def run(command, cwd=None, check=True):
    # Prompts are plain text; skip downloading the repository's LFS media.
    return subprocess.run(command, cwd=cwd, check=check, text=True, capture_output=True, timeout=600,
                          env={**os.environ, 'GIT_LFS_SKIP_SMUDGE': '1'})


def open_tuning_pr(cfg):
    result = run(['tea', 'api', '--login', cfg['login'], f"/repos/{cfg['repo']}/pulls?state=open&limit=50"])
    return next((p['html_url'] for p in json.loads(result.stdout or '[]')
                 if p.get('head', {}).get('ref', '').startswith(BRANCH_PREFIX)), '')


def changed_files(clone):
    status = run(['git', 'status', '--porcelain', '-z', '--untracked-files=all'], cwd=clone).stdout
    return sorted(entry[3:] for entry in status.split('\0') if entry)


def codex(cfg, prompt, clone, directory):
    out = directory/'tune.json'
    command = [cfg['codex'], 'exec', '--ignore-user-config', '--ephemeral', '-s', 'workspace-write', '-C', str(clone),
               '-m', cfg['model'], '--json', '-o', str(out), '--output-schema', str(HERE/'craft/tune.schema.json'),
               '-c', 'approval_policy="never"', '-c', 'web_search="disabled"', '-c', 'model_reasoning_effort="high"', '-']
    environment = {k: v for k, v in os.environ.items() if k not in ('OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL')}
    with (directory/'events.jsonl').open('w') as events, (directory/'stderr.log').open('w') as errors:
        done = subprocess.run(command, input=prompt, text=True, stdout=events, stderr=errors, cwd=clone,
                              env=environment, timeout=3600)
    if done.returncode or not out.is_file():
        raise ValueError('The tuning model call failed; inspect the private run directory')
    return json.loads(out.read_text())


def body(result, fresh):
    counts = {}
    for record in fresh:
        counts[record['decision']] = counts.get(record['decision'], 0)+1
    lines = [result['summary'], '', 'Feedback used: '+', '.join(f'{n} {k}' for k, n in sorted(counts.items()))+'.', '', 'Changes:']
    lines += [f"- `{c['file']}`: {c['why']}" for c in result['changes']]
    if result.get('lessons'):
        lines += ['', 'Lessons recorded in `lessons.md`:'] + [f'- {item}' for item in result['lessons']]
    if result['ignored']:
        lines += ['', 'Not acted on:'] + [f'- {item}' for item in result['ignored']]
    lines += ['', 'Prepared by the prompt-tuning job. Compare the changed prompts on saved fixtures before deploying them; '
              'merging does not update the installed release bundles.']
    return '\n'.join(lines)


def execute(cfg, state, ingest_env, now=None, minimum=5):
    now = now or datetime.now(timezone.utc)
    receipt = {'checked_at': now.isoformat()}
    try:
        receipt['pulled'] = feedback.pull(state, ingest_env, now)
    except Exception as error:  # tune on the last pulled file rather than not at all
        receipt['pull_error'] = type(error).__name__
    cursor_file = state/'prompt-tuning.json'
    cursor = json.loads(cursor_file.read_text()).get('cursor', '') if cursor_file.is_file() else ''
    try:
        records = json.loads((state/feedback.FILE).read_text())
    except (OSError, ValueError):
        records = []
    fresh, earlier = select(records, cursor)
    receipt['fresh'] = len(fresh)
    if len(fresh) < minimum:
        return {**receipt, 'status': 'not_enough_feedback'}
    existing = open_tuning_pr(cfg)
    if existing:
        return {**receipt, 'status': 'waiting_for_open_pr', 'pull_request': existing}
    directory = state/'prompt-tuning'/now.strftime('%Y%m%dT%H%M%SZ')
    directory.mkdir(parents=True, mode=0o700)
    branch = BRANCH_PREFIX+now.strftime('%Y%m%d-%H%M')
    clone = Path(tempfile.mkdtemp(prefix='prompt-tuning-'))
    try:
        run(['git', 'clone', '--quiet', '--depth', '1', '--branch', 'main', cfg['remote'], str(clone)])
        run(['git', 'switch', '--quiet', '-c', branch], cwd=clone)
        prompt = (HERE/'craft/tune.md').read_text()+'\n\n'+json.dumps(
            {'feedback': fresh, 'earlier': earlier, 'allowed_files': ALLOWED}, ensure_ascii=False, indent=1)
        (directory/'tune.prompt.md').write_text(prompt)
        result = codex(cfg, prompt, clone, directory)
        outside = [f for f in changed_files(clone) if f not in ALLOWED]
        if outside:
            return {**receipt, 'files': changed_files(clone), 'status': 'rejected_changes', 'outside_allowlist': outside}
        newest = max(r['decided_at'] for r in fresh)
        receipt['lessons'] = record_lessons(clone, result.get('lessons', []), newest[:10])
        files = changed_files(clone)
        receipt['files'] = files
        if not files:
            cursor_file.write_text(json.dumps({'cursor': newest})+'\n')
            return {**receipt, 'status': 'no_change', 'summary': result['summary']}
        diff = run(['git', 'diff'], cwd=clone).stdout
        (directory/'tune.diff').write_text(diff)
        run(['git', 'add', '--', *files], cwd=clone)
        title = 'Tune social drafting prompts from review feedback'
        run(['git', *AGENT, 'commit', '--quiet', '-m', title+'\n\n'+result['summary']], cwd=clone)
        run(['git', 'push', '--quiet', 'origin', branch], cwd=clone)
        created = run(['tea', 'pr', 'create', '--login', cfg['login'], '--repo', cfg['repo'], '--base', 'main',
                       '--head', branch, '--title', title, '--description', body(result, fresh)], cwd=clone)
        cursor_file.write_text(json.dumps({'cursor': newest})+'\n')
        return {**receipt, 'status': 'pull_request_opened', 'branch': branch, 'output': created.stdout.strip()[-500:]}
    finally:
        shutil.rmtree(clone, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--config', type=Path, default=HERE/'config.json')
    parser.add_argument('--state', type=Path, required=True)
    parser.add_argument('--ingest-env', type=Path, required=True)
    parser.add_argument('--minimum', type=int, default=5, help='new useful feedback records needed before tuning')
    args = parser.parse_args()
    config = json.loads(args.config.read_text())
    cfg = {'codex': config['codex'], 'model': config['model'], **config['tuning']}
    with open(args.state/'tune.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        receipt = execute(cfg, args.state, args.ingest_env, minimum=args.minimum)
    (args.state/'prompt-tuning-latest.json').write_text(json.dumps(receipt, indent=2)+'\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
