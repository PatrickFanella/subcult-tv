from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import craft
import reroll

RUN = '20261005T092809.332979Z-changemaker'


class RerollTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        base = Path(self.tmp.name)
        self.root, self.state = base/'studio', base/'state'
        (self.root/'automation/social-posting').mkdir(parents=True)
        (self.root/'content/social').mkdir(parents=True)
        (self.root/'automation/social-posting/config.json').write_text(json.dumps({'codex': 'unused', 'model': 'configured'}))
        (self.root/'content/social/Product Claims Register.md').write_text('Work in progress only.')
        self.env = base/'preparation.env'
        self.env.write_text('POSTING_INGEST_URL=https://subcult.tv/api/v1/posting-preparation\nPOSTING_PREPARATION_KEY='+'k'*40+'\n')
        run = self.state/'runs'/RUN/'craft'
        run.mkdir(parents=True)
        self.images = {}
        for name in ('post-0.jpg', 'alt-0.jpg'):
            data = b'\xff\xd8\xff' + name.encode()
            (run/name).write_bytes(data)
            self.images[name] = {'file': f'runs/{RUN}/craft/{name}', 'sha256': hashlib.sha256(data).hexdigest(),
                                 'width': 1080, 'height': 1350, 'bytes': len(data)}
        self.now = datetime(2026, 10, 6, 12, 0, tzinfo=timezone.utc)
        self.draft = {'account': 'patrick', 'platform': 'instagram', 'text': 'Old caption.',
                      'due_at': (self.now+timedelta(days=3)).isoformat(), 'expires_at': (self.now+timedelta(days=1)).isoformat(),
                      'evidence': 'proof', 'next_check': 'Check it.', 'checklist': ['Check it'],
                      'media': {'mode': 'library', 'asset_ids': [], 'brief': 'type', 'alt_text': 'Old alt.', 'kind': 'type',
                                'headline': 'Old headline', 'image': self.images['post-0.jpg'], 'candidates': [self.images['alt-0.jpg']]},
                      'craft': {'angle': 'Old angle', 'product': 'rekolekt', 'alternatives': ['Alt one']}}
        (self.state/'runs'/RUN/'result.json').write_text(json.dumps({'drafts': [self.draft]}))
        (self.state/'runs'/RUN/'sources.json').write_text(json.dumps({'items': [{'id': 'S9', 'title': 'Headless core'}]}))

    def tearDown(self):
        self.tmp.cleanup()

    def job(self, mode, **extra):
        return {'id': 7, 'draft_id': RUN+':0', 'mode': mode, 'note': 'warmer', 'caption': '', 'image_sha256': '', **extra}

    def result(self, draft_id):
        run, index = draft_id.split(':')
        return json.loads((self.state/'runs'/run/'result.json').read_text())['drafts'][int(index)]

    def picture(self, calls):
        def make(cfg, text, product, directory, n, recent_kinds=(), extra=None):
            calls.append({'text': text, 'product': product, 'extra': extra})
            directory.mkdir(parents=True, exist_ok=True)
            jpeg = directory/'post-0.jpg'
            from PIL import Image
            Image.new('RGB', (1080, 1350), (20, 30, 40)).save(jpeg, 'JPEG')
            return jpeg, {'kind': 'illustration', 'headline': 'New headline', 'checks': [{'pass': True}]}, 'New alt.'
        return make

    def test_text_reroll_keeps_the_chosen_prepared_image_and_supersedes(self):
        seen = {}
        def caption(cfg, draft, evidence, claims, directory, note='', image=None, recent=()):
            seen.update(note=note, image=image, evidence=evidence)
            return {'text': 'A fresh caption.', 'angle': 'New angle', 'changed': 'New opening.'}
        keep = self.images['alt-0.jpg']['sha256']
        with patch.object(craft, 'reroll_caption', side_effect=caption), patch.object(craft, 'picture') as picture:
            draft_id = reroll.regenerate({}, self.root, self.state, self.job('text', image_sha256=keep), self.now)
        picture.assert_not_called()
        draft = self.result(draft_id)
        self.assertEqual(draft['text'], 'A fresh caption.')
        self.assertEqual(draft['supersedes'], RUN+':0')
        self.assertEqual(draft['media']['image']['sha256'], keep)
        self.assertNotIn('candidates', draft['media'])
        self.assertEqual(draft['craft']['alternatives'], ['Old caption.'])
        self.assertEqual(seen['note'], 'warmer')
        self.assertEqual(seen['image'], self.state/self.images['alt-0.jpg']['file'])
        self.assertEqual(seen['evidence']['items'][0]['id'], 'S9')
        self.assertEqual(draft['due_at'], self.draft['due_at'])
        self.assertGreater(datetime.fromisoformat(draft['expires_at']), self.now+timedelta(days=6))
        receipt = json.loads((self.state/'runs'/draft_id.split(':')[0]/'receipt.json').read_text())
        self.assertEqual((receipt['mode'], receipt['status'], receipt['source_identities']), ('changemaker', 'success', []))
        self.assertFalse(receipt['publishing_enabled'])

    def test_image_reroll_keeps_the_owner_caption(self):
        calls = []
        with patch.object(craft, 'picture', side_effect=self.picture(calls)), patch.object(craft, 'reroll_caption') as caption:
            draft_id = reroll.regenerate({}, self.root, self.state, self.job('image', caption='  Owner edit.  '), self.now)
        caption.assert_not_called()
        draft = self.result(draft_id)
        self.assertEqual(draft['text'], 'Owner edit.')
        self.assertEqual(calls[0]['text'], 'Owner edit.')
        self.assertEqual(calls[0]['product'], 'rekolekt')
        self.assertEqual(calls[0]['extra']['previous_image']['headline'], 'Old headline')
        self.assertEqual(draft['media']['kind'], 'illustration')
        self.assertEqual(draft['media']['alt_text'], 'New alt.')
        self.assertNotEqual(draft['media']['image']['sha256'], self.images['post-0.jpg']['sha256'])
        self.assertNotIn('candidates', draft['media'])

    def test_both_rerolls_text_then_draws_for_the_new_text(self):
        calls = []
        def caption(cfg, draft, evidence, claims, directory, note='', image=None, recent=()):
            self.assertIsNone(image)
            return {'text': 'Both new.', 'angle': 'a', 'changed': 'c'}
        with patch.object(craft, 'reroll_caption', side_effect=caption), patch.object(craft, 'picture', side_effect=self.picture(calls)):
            draft = self.result(reroll.regenerate({}, self.root, self.state, self.job('both'), self.now))
        self.assertEqual(calls[0]['text'], 'Both new.')
        self.assertEqual(draft['media']['headline'], 'New headline')

    def test_rejects_unknown_drafts_and_unsafe_captions(self):
        for job in (self.job('text', draft_id='../../etc:0'), self.job('text', draft_id=RUN+':4'),
                    self.job('text', draft_id='20261005T092809Z-radar:0'), self.job('everything')):
            with self.subTest(job=job), self.assertRaises(ValueError):
                reroll.regenerate({}, self.root, self.state, job, self.now)
        with patch.object(craft, 'reroll_caption', return_value={'text': 'See git.subcult.tv/x', 'angle': '', 'changed': ''}), \
             self.assertRaises(ValueError):
            reroll.regenerate({}, self.root, self.state, self.job('text'), self.now)

    def test_past_due_drafts_get_a_new_slot(self):
        (self.state/'runs'/RUN/'result.json').write_text(json.dumps({'drafts': [{**self.draft, 'due_at': self.now.isoformat()}]}))
        with patch.object(craft, 'reroll_caption', return_value={'text': 'New.', 'angle': '', 'changed': ''}):
            draft = self.result(reroll.regenerate({}, self.root, self.state, self.job('text'), self.now))
        self.assertGreaterEqual(datetime.fromisoformat(draft['due_at']), self.now+timedelta(hours=48))

    def test_execute_syncs_before_reporting_and_reports_failures(self):
        calls = []
        def api(settings, path, payload=None):
            calls.append((path, payload))
            if path == '/rerolls/claim':
                return [self.job('text'), {**self.job('text', draft_id='nope'), 'id': 8}]
            return {}
        synced = []
        with patch.object(reroll, 'call', side_effect=api), \
             patch.object(craft, 'reroll_caption', return_value={'text': 'New.', 'angle': '', 'changed': ''}):
            receipt = reroll.execute(self.root, self.state, self.env, sync=lambda: synced.append(len(calls)) or True)
        self.assertEqual((receipt['done'], receipt['failed'], receipt['synced']), (1, 1, True))
        self.assertEqual(synced, [1], 'sync must run before any result is reported')
        self.assertEqual(calls[1][0], '/rerolls/7')
        self.assertEqual(calls[1][1]['status'], 'done')
        self.assertEqual((calls[2][0], calls[2][1]['status']), ('/rerolls/8', 'failed'))

    def test_refuses_an_unexpected_endpoint(self):
        self.env.write_text('POSTING_INGEST_URL=https://example.test/x\nPOSTING_PREPARATION_KEY='+'k'*40+'\n')
        with self.assertRaises(ValueError):
            reroll.execute(self.root, self.state, self.env)


if __name__ == '__main__':
    unittest.main()
