from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock

import tune


def record(decision, at, note='', **extra):
    return {'decision': decision, 'platform': 'x', 'account': 'subcult', 'original_text': 'a', 'final_text': 'a',
            'reasons': [], 'note': note, 'decided_at': at, **extra}


class TuneTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.state = Path(self.tmp.name)/'state'
        self.state.mkdir()
        self.cfg = {'codex': 'codex', 'model': 'm', 'remote': 'unused', 'repo': 'o/r', 'login': 'subcult-agent'}
        self.now = datetime(2026, 10, 10, 15, tzinfo=timezone.utc)

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, records):
        (self.state/'owner-feedback.json').write_text(json.dumps(records))

    def test_only_marks_notes_reasons_and_real_edits_count(self):
        records = [record('favorited', '2026-10-09'), record('rejected', '2026-10-09'),
                   record('rejected', '2026-10-09', reasons=['boring']), record('revision_requested', '2026-10-08', 'warmer'),
                   record('approved_edited', '2026-10-08'), record('approved_edited', '2026-10-08', final_text='b'),
                   record('favorited', '2026-10-01')]
        fresh, earlier = tune.select(records, '2026-10-05')
        self.assertEqual(len(fresh), 4)
        self.assertEqual(len(earlier), 1)

    def test_waits_for_enough_feedback_without_calling_gitea(self):
        self.write([record('favorited', '2026-10-09T00:00:00Z')])
        with mock.patch.object(tune.feedback, 'pull', side_effect=OSError), mock.patch.object(tune, 'open_tuning_pr') as pr:
            receipt = tune.execute(self.cfg, self.state, Path('x.env'), self.now)
        self.assertEqual(receipt['status'], 'not_enough_feedback')
        self.assertEqual(receipt['pull_error'], 'OSError')
        pr.assert_not_called()

    def test_waits_while_a_tuning_pr_is_open(self):
        self.write([record('favorited', f'2026-10-09T0{n}:00:00Z') for n in range(5)])
        with mock.patch.object(tune.feedback, 'pull', return_value=5), \
                mock.patch.object(tune, 'open_tuning_pr', return_value='https://git/pr/1'):
            receipt = tune.execute(self.cfg, self.state, Path('x.env'), self.now)
        self.assertEqual(receipt['status'], 'waiting_for_open_pr')
        self.assertFalse((self.state/'prompt-tuning.json').exists())

    def fake_repo(self):
        """A local bare repository with the allowlisted files, standing in for Gitea."""
        origin = Path(self.tmp.name)/'origin.git'
        work = Path(self.tmp.name)/'seed'
        subprocess.run(['git', 'init', '-q', '--bare', '-b', 'main', str(origin)], check=True)
        subprocess.run(['git', 'init', '-q', '-b', 'main', str(work)], check=True)
        (work/tune.SOCIAL).mkdir(parents=True)
        (work/tune.SOCIAL/'prompt.md').write_text('old\n')
        (work/tune.SOCIAL/'runner.py').write_text('code\n')
        for command in (['add', '.'], [*tune.AGENT, 'commit', '-q', '-m', 'seed'], ['push', '-q', str(origin), 'main']):
            subprocess.run(['git', *command], cwd=work, check=True)
        return str(origin)

    def tuned(self, edits):
        self.cfg['remote'] = self.fake_repo()
        self.write([record('favorited', f'2026-10-09T0{n}:00:00Z', 'more like this') for n in range(5)])

        def model(cfg, prompt, clone, directory):
            self.assertIn('more like this', prompt)
            for name, text in edits.items():
                (clone/name).write_text(text)
            return {'summary': 'Lead with the reader.', 'changes': [{'file': n, 'why': 'marks'} for n in edits], 'ignored': []}
        real_run = tune.run

        def run(command, cwd=None, check=True):
            if command[0] == 'tea':
                return subprocess.CompletedProcess(command, 0, 'https://git/pr/2', '')
            return real_run(command, cwd, check)
        with mock.patch.object(tune.feedback, 'pull', return_value=5), mock.patch.object(tune, 'open_tuning_pr', return_value=''), \
                mock.patch.object(tune, 'codex', side_effect=model), mock.patch.object(tune, 'run', side_effect=run):
            return tune.execute(self.cfg, self.state, Path('x.env'), self.now)

    def test_opens_a_pull_request_for_allowlisted_edits(self):
        receipt = self.tuned({tune.SOCIAL+'prompt.md': 'new\n'})
        self.assertEqual(receipt['status'], 'pull_request_opened', receipt)
        log = subprocess.run(['git', '--git-dir', self.cfg['remote'], 'log', '--format=%an %s', receipt['branch']],
                             capture_output=True, text=True, check=True).stdout
        self.assertIn('SUBCULT Agent Tune social drafting prompts', log)
        self.assertEqual(json.loads((self.state/'prompt-tuning.json').read_text())['cursor'], '2026-10-09T04:00:00Z')

    def test_refuses_edits_outside_the_allowlist(self):
        receipt = self.tuned({tune.SOCIAL+'prompt.md': 'new\n', tune.SOCIAL+'runner.py': 'evil\n'})
        self.assertEqual(receipt['status'], 'rejected_changes')
        self.assertEqual(receipt['outside_allowlist'], [tune.SOCIAL+'runner.py'])
        self.assertFalse((self.state/'prompt-tuning.json').exists())

    def test_no_change_advances_the_cursor(self):
        receipt = self.tuned({})
        self.assertEqual(receipt['status'], 'no_change')
        self.assertTrue((self.state/'prompt-tuning.json').exists())


if __name__ == '__main__':
    unittest.main()
