from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import subprocess

import changemaker_instagram as importer


class ChangemakerInstagramTests(unittest.TestCase):
    def setUp(self):
        self.items = {'S1': {'url': 'https://git.subcult.tv/a/b/pulls/1', 'updated_at': '2026-10-03T09:00:00Z'}}
        self.draft = {'account':'subcult','text':'Work in progress on a clearer reading experience.',
                      'source_ids':['S1'],'media_brief':'Capture the actual interface.',
                      'next_check':'Confirm what is deployed and choose an approved JPEG.'}

    def test_caption_requires_two_known_accounts_bound_unique_evidence_and_review(self):
        importer.validate({'drafts':[self.draft]}, self.items)
        for change in ({'account':'clpr'}, {'source_ids':['unknown']},
                       {'text':'Details at https://git.subcult.tv/private'},
                       {'approved':True}, {'media_brief':''}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                importer.validate({'drafts':[{**self.draft, **change}]}, self.items)
        with self.assertRaises(ValueError):
            importer.validate({'drafts':[self.draft, {**self.draft,'account':'patrick'}]}, self.items)

    def test_receipts_deduplicate_actual_sources_across_new_digest_runs(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp)
            run=state/'runs'/'r1';run.mkdir(parents=True)
            key=importer.identity(self.items['S1'])
            (run/'receipt.json').write_text(json.dumps({'mode':'changemaker','status':'success','source_identities':[key]}))
            self.assertIn(key, importer.used_sources(state))
            changed={**self.items['S1'],'updated_at':datetime.now(timezone.utc).isoformat()}
            self.assertNotIn(importer.identity(changed), importer.used_sources(state))
            (run/'receipt.json').write_text(json.dumps({'mode':'changemaker','status':'failed','source_identities':[key]}))
            self.assertNotIn(key, importer.used_sources(state))

    def test_generated_receipt_has_unapproved_review_media_and_48_hour_lead(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state'
            (root/'automation/social-posting').mkdir(parents=True)
            (root/'content/social').mkdir(parents=True)
            (root/'automation/social-posting/config.json').write_text(json.dumps({'codex':'unused','model':'configured','switchyard':{}}))
            (root/'content/social/Product Claims Register.md').write_text('Work in progress only.')
            (root/'content/VOICE.md').write_text('Plain product language.')
            (root/'automation/social-posting/changemaker-instagram-prompt.md').write_text('Prepare unapproved captions.')
            home=Path(tmp)/'home'
            (home/'.codex/skills/unslop').mkdir(parents=True)
            (home/'.codex/skills/unslop/SKILL.md').write_text('Preserve facts and uncertainty.')
            item={**self.items['S1'],'id':'S1','kind':'pull request','state':'merged','title':'Improve reading'}
            context={'drafts':[{'run_id':'native-run','draft_sha256':'d'*64,'evidence_sha256':'e'*64,
                               'draft':'## What people notice\nReaders see the passage.',
                               'evidence':{'status':'complete','items':[item]}}]}
            prompts=[]
            def generate(command, **kwargs):
                prompts.append(kwargs['input'])
                directory=Path(kwargs['cwd'])
                (directory/'result-model.json').write_text(json.dumps({'drafts':[self.draft],'open_checks':['Check deployment.']}))
                return subprocess.CompletedProcess(command,0)
            before=datetime.now(timezone.utc)
            with patch.object(importer.Path,'home',return_value=home), patch.object(importer,'HERE',root/'automation/social-posting'), patch.object(importer,'changemaker_context',return_value=context), patch.object(importer.subprocess,'run',side_effect=generate):
                receipt=importer.execute(root,state)
                result=json.loads((state/'runs'/receipt['run_id']/'result.json').read_text())
                self.assertGreaterEqual((datetime.fromisoformat(result['drafts'][0]['due_at'])-before).total_seconds(),48*3600)
                self.assertFalse(receipt['publishing_enabled'])
                self.assertNotIn('approval',result['drafts'][0])
                self.assertEqual(result['drafts'][0]['media']['asset_ids'],[])
                self.assertIn('native-run',result['drafts'][0]['evidence'])
                self.assertIn('What people notice',prompts[0])
                self.assertEqual(importer.execute(root,state)['status'],'no_new_sources')

    def test_single_pass_drafts_still_get_a_prepared_image(self):
        import craft
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state'
            (root/'automation/social-posting').mkdir(parents=True)
            (root/'content/social').mkdir(parents=True)
            (root/'automation/social-posting/config.json').write_text(json.dumps({'codex':'unused','model':'configured','switchyard':{}}))
            (root/'content/social/Product Claims Register.md').write_text('Work in progress only.')
            (root/'content/VOICE.md').write_text('Plain product language.')
            (root/'automation/social-posting/changemaker-instagram-prompt.md').write_text('Prepare unapproved captions.')
            home=Path(tmp)/'home'
            (home/'.codex/skills/unslop').mkdir(parents=True)
            (home/'.codex/skills/unslop/SKILL.md').write_text('Preserve facts.')
            item={**self.items['S1'],'id':'S1','kind':'pull request','state':'merged','title':'Improve reading','source':'subculture-collective/kork'}
            context={'drafts':[{'run_id':'native-run','draft_sha256':'d'*64,'evidence_sha256':'e'*64,'draft':'Digest.',
                               'evidence':{'status':'complete','items':[item]}}]}
            def generate(command, **kwargs):
                (Path(kwargs['cwd'])/'result-model.json').write_text(json.dumps({'drafts':[self.draft],'open_checks':[]}))
                return subprocess.CompletedProcess(command,0)
            calls=[]
            def picture(cfg, text, product, directory, n, recent_kinds=()):
                calls.append(product)
                directory.mkdir(parents=True, exist_ok=True)
                jpeg=directory/f'post-{n}.jpg'; jpeg.write_bytes(b'\xff\xd8\xff\xe0fake-jpeg')
                return jpeg, {'kind':'type','headline':'A clearer page'}, 'A type card reading A clearer page.'
            def staged(*args, **kwargs):
                raise ValueError('stage failed')
            with patch.object(importer.Path,'home',return_value=home), patch.object(importer,'HERE',root/'automation/social-posting'), \
                 patch.object(importer,'changemaker_context',return_value=context), patch.object(importer.subprocess,'run',side_effect=generate), \
                 patch.object(importer,'image_record',return_value={'file':'x.jpg','sha256':'f'*64,'width':1080,'height':1350,'bytes':16}), \
                 patch.object(craft,'instagram',side_effect=staged), patch.object(craft,'picture',side_effect=picture):
                receipt=importer.execute(root,state)
            media=json.loads((state/'runs'/receipt['run_id']/'result.json').read_text())['drafts'][0]['media']
            self.assertEqual(calls,['kork'])
            self.assertEqual(media['kind'],'type')
            self.assertEqual(media['headline'],'A clearer page')
            self.assertEqual(media['image']['sha256'],'f'*64)

    def test_slots_are_daytime_chicago_at_least_48_hours_ahead_and_distinct(self):
        from zoneinfo import ZoneInfo
        now = datetime(2026, 10, 5, 9, 20, tzinfo=timezone.utc)
        slots = importer.posting_slots({'timezone': 'America/Chicago'}, now, 3)
        self.assertEqual(len(set(slots)), 3)
        for slot in slots:
            self.assertGreaterEqual((slot - now).total_seconds(), 48*3600)
            self.assertIn(slot.astimezone(ZoneInfo('America/Chicago')).strftime('%H:%M'), ('11:30', '17:30'))

    def test_slots_skip_times_held_by_prepared_drafts(self):
        now = datetime(2026, 10, 5, 9, 20, tzinfo=timezone.utc)
        first = importer.posting_slots({'timezone': 'America/Chicago'}, now, 1)[0]
        second = importer.posting_slots({'timezone': 'America/Chicago'}, now, 1, {first.astimezone(timezone.utc)})[0]
        self.assertNotEqual(first, second)

    def test_owner_feedback_keeps_learning_decisions_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            (state/'owner-feedback.json').write_text(json.dumps([
                {'decision': 'approved_as_is', 'original_text': 'a'},
                {'decision': 'approved_edited', 'original_text': 'We merged a fix.', 'final_text': 'The menu works now.', 'reasons': []},
                {'decision': 'snoozed', 'original_text': 'b'},
                {'decision': 'rejected', 'original_text': 'Thoughts?', 'reason_codes': ['boring'], 'note': 'bait'},
                {'decision': 'favorited', 'original_text': 'Good one', 'note': 'this opening'}]))
            feedback = importer.owner_feedback(state)
            self.assertEqual([f['decision'] for f in feedback], ['approved_edited', 'rejected', 'favorited'])
            self.assertEqual(feedback[1]['reasons'], ['boring'])

    def test_checklist_splits_sentences(self):
        items = importer.checklist('Confirm whether the fix is live. Check the image; then approve.')
        self.assertEqual(items[0], 'Confirm whether the fix is live')
        self.assertEqual(len(items), 2)

    def test_recent_captions_reads_only_recent_changemaker_results(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            run = state/'runs'/'20261004T000000Z-changemaker'; run.mkdir(parents=True)
            (run/'result.json').write_text(json.dumps({'drafts': [{'text': 'An empty button crashed the menu.'}]}))
            other = state/'runs'/'20261004T000000Z-plan'; other.mkdir(parents=True)
            (other/'result.json').write_text(json.dumps({'drafts': [{'text': 'X draft'}]}))
            self.assertEqual(importer.recent_captions(state, datetime.now(timezone.utc)), ['An empty button crashed the menu.'])

    def test_showcase_product_rotates_live_products_and_respects_the_gap(self):
        cfg = {'daily_showcase': {'enabled': True, 'gap_days': 2, 'products': ['undertow', 'clpr', 'kork']}}
        now = datetime(2026, 10, 11, 9, 20, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            (state/'runs').mkdir()
            self.assertEqual(importer.showcase_product(cfg, state, now), 'undertow')
            self.assertIsNone(importer.showcase_product({'daily_showcase': {'enabled': False, 'products': ['clpr']}}, state, now))
            self.assertIsNone(importer.showcase_product({}, state, now))
            # Products already spotlighted by prepared drafts come last; the least recent of them is chosen.
            for n, product in enumerate(['kork', 'undertow', 'clpr']):
                run = state/'runs'/f'2026100{n+1}T000000Z-changemaker'; run.mkdir()
                (run/'result.json').write_text(json.dumps({'drafts': [{'text': 'x', 'craft': {'product': product}}]}))
            self.assertEqual(importer.showcase_product(cfg, state, now), 'kork')
            # A weekly or showcase post prepared within the gap suppresses the fallback.
            (state/'runs'/'20261001T000000Z-changemaker'/'receipt.json').write_text(json.dumps(
                {'kind': 'weekly', 'status': 'success', 'checked_at': (now.replace(hour=1)).isoformat()}))
            self.assertIsNone(importer.showcase_product(cfg, state, now))
            (state/'runs'/'20261001T000000Z-changemaker'/'receipt.json').write_text(json.dumps(
                {'kind': 'showcase', 'status': 'success', 'checked_at': '2026-10-05T09:00:00+00:00'}))
            self.assertEqual(importer.showcase_product(cfg, state, now), 'kork')

    def test_empty_marketing_brief_falls_back_to_a_showcase_post(self):
        import craft
        import showcase
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state'
            (root/'automation/social-posting').mkdir(parents=True)
            (root/'content/social').mkdir(parents=True)
            (root/'automation/social-posting/config.json').write_text(json.dumps(
                {'codex':'unused','model':'configured','switchyard':{},'craft':True,
                 'daily_showcase':{'enabled':True,'gap_days':2,'products':['clpr']}}))
            (root/'content/social/Product Claims Register.md').write_text('Work in progress only.')
            item={**self.items['S1'],'id':'S1','kind':'pull request','state':'merged','title':'Tidy a menu','source':'subculture-collective/undertow'}
            context={'drafts':[{'run_id':'native-run','draft_sha256':'d'*64,'evidence_sha256':'e'*64,'draft':'Digest.',
                               'evidence':{'status':'complete','items':[item]}}]}
            shown=[]
            def fake_showcase(product, source_root, st):
                shown.append(product)
                return {'run_id':'fallback-run','draft_count':1}
            with patch.object(importer,'HERE',root/'automation/social-posting'), patch.object(importer,'changemaker_context',return_value=context), \
                 patch.object(craft,'instagram',return_value={'drafts':[],'open_checks':['Skipped S1: a small layout fix nobody outside the project would notice']}), \
                 patch.object(showcase,'execute',side_effect=fake_showcase):
                receipt=importer.execute(root,state)
            self.assertEqual(shown,['clpr'])
            self.assertEqual(receipt['draft_count'],0)
            self.assertEqual(receipt['showcase'],{'product':'clpr','run_id':'fallback-run','draft_count':1})
            # The skipped change is consumed, so the next run does not retry it.
            self.assertEqual(receipt['source_identities'],[importer.identity(item)])
            result=json.loads((state/'runs'/receipt['run_id']/'result.json').read_text())
            self.assertIn('small layout fix',result['open_checks'][0])


if __name__ == '__main__':
    unittest.main()
