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
                               'evidence':{'status':'complete','items':[item]}}]}
            def generate(command, **kwargs):
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
                self.assertEqual(importer.execute(root,state)['status'],'no_new_sources')


if __name__ == '__main__':
    unittest.main()
