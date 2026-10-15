from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import tweets


class TweetTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)/'studio'
        self.state = Path(self.tmp.name)/'state'
        (self.root/'automation/social-posting').mkdir(parents=True)
        self.state.mkdir()
        self.cfg = {'cadence': {'clpr': {}, 'patrick': {}}, 'channels': {'clpr': 'c', 'patrick': 'p'}}
        (self.root/'automation/social-posting/config.json').write_text(json.dumps(self.cfg))
        self.now = datetime(2026, 10, 15, 12, tzinfo=timezone.utc)
        self.job = {'id': 7, 'account': 'clpr', 'note': 'Playlists', 'attempts': 1,
                    'requested_at': self.now.isoformat()}
        self.context = {'notes': {'claims': 'clpr supports playlists.'}, 'repositories': [], 'posting_guidance': 'Be plain.'}
        self.result = {'text': 'Keep your clips in playlists.', 'source_ids': ['note:claims'], 'next_check': 'Check the claim.'}
        self.patches = [patch.object(tweets, 'source_context', return_value=self.context),
                        patch.object(tweets.craft, 'guidance', return_value={}),
                        patch.object(tweets.craft, 'polish_short'),
                        patch.object(tweets.feedback, 'owner_feedback', return_value=[])]
        for p in self.patches:
            p.start()
            self.addCleanup(p.stop)
        self.addCleanup(self.tmp.cleanup)

    def test_account_bound_unapproved_draft_is_reused_after_interruption(self):
        with patch.object(tweets.craft, 'codex', return_value=self.result) as model:
            first = tweets.generate(self.cfg, self.root, self.state, self.job, self.now)
            second = tweets.generate(self.cfg, self.root, self.state, self.job, self.now+timedelta(hours=3))
        self.assertEqual(first, second)
        model.assert_called_once()
        self.assertIn('"account": "clpr"', model.call_args.args[1])
        self.assertIn('"owner_direction": "Playlists"', model.call_args.args[1])
        run = self.state/'runs'/first.split(':')[0]
        draft = json.loads((run/'result.json').read_text())['drafts'][0]
        self.assertEqual((draft['account'], draft['platform'], draft['approval']), ('clpr', 'x', 'unapproved'))
        self.assertEqual(draft['replies'], [])
        self.assertGreater(datetime.fromisoformat(draft['due_at']), self.now+timedelta(hours=24))
        receipt = json.loads((run/'receipt.json').read_text())
        self.assertFalse(receipt['publishing_enabled'])
        self.assertEqual(receipt['tweet_request'], 7)

    def test_unknown_accounts_and_unsupported_copy_do_not_get_receipts(self):
        with self.assertRaises(ValueError):
            tweets.generate(self.cfg, self.root, self.state, {**self.job, 'account': '../../x'}, self.now)
        for change in ({'text': ''}, {'text': 'x'*281}, {'text': 'https://git.subcult.tv/private'}, {'source_ids': ['missing']}, {'source_ids': []}):
            with self.subTest(change=change), patch.object(tweets.craft, 'codex', return_value={**self.result, **change}), self.assertRaises(ValueError):
                tweets.generate(self.cfg, self.root, self.state, self.job, self.now)
        self.assertEqual(list((self.state/'runs').glob('*/receipt.json')), [])

    def test_sync_precedes_completion_and_failed_sync_does_not_finish(self):
        calls = []
        def call(settings, path, payload=None):
            calls.append((path, payload))
            return [self.job] if path == '/tweets/claim' and len(calls) == 1 else []
        with patch.object(tweets, 'preparation_settings', return_value={}), patch.object(tweets, 'call', side_effect=call), \
             patch.object(tweets, 'generate', return_value='draft:0'):
            result = tweets.execute(self.root, self.state, Path('unused'), sync=lambda: calls.append(('sync', None)) or True)
        self.assertEqual([c[0] for c in calls], ['/tweets/claim', 'sync', '/tweets/7', '/tweets/claim'])
        self.assertEqual(calls[2][1], {'status': 'done', 'result_draft_id': 'draft:0', 'attempts': 1})
        self.assertFalse(result['publishing_enabled'])
        calls.clear()
        with patch.object(tweets, 'preparation_settings', return_value={}), patch.object(tweets, 'call', side_effect=call), \
             patch.object(tweets, 'generate', return_value='draft:0'), self.assertRaises(RuntimeError):
            tweets.execute(self.root, self.state, Path('unused'), sync=lambda: False)
        self.assertEqual([c[0] for c in calls], ['/tweets/claim'])

    def test_errors_are_reported_without_private_provider_details(self):
        calls = []
        def call(settings, path, payload=None):
            calls.append((path, payload))
            return [self.job] if len(calls) == 1 else []
        with patch.object(tweets, 'preparation_settings', return_value={}), patch.object(tweets, 'call', side_effect=call), \
             patch.object(tweets, 'generate', side_effect=ValueError('/private/token value')):
            result = tweets.execute(self.root, self.state, Path('unused'))
        self.assertEqual(result['failed'], 1)
        self.assertNotIn('/private/token', json.dumps(calls))
        self.assertIn('/private/token', (self.state/'tweet-errors.log').read_text())

    def test_unsupported_topic_has_an_actionable_public_error(self):
        with self.assertRaisesRegex(tweets.TweetPreparationError, 'Try another topic'):
            tweets.validate({'text': '', 'source_ids': [], 'next_check': 'No source.'}, {})
