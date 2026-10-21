import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from datetime import datetime, timezone
import changemaker_publications as producer

class PublicationPreparationTests(unittest.TestCase):
    def test_no_story_and_crashes_both_write_health_receipts(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            with patch.object(producer, '_execute', return_value={'status': 'no_user_facing_change', 'draft_count': 0, 'publishing_enabled': False}):
                producer.execute(state, state)
            receipt = json.loads(next((state/'runs').glob('*/receipt.json')).read_text())
            self.assertEqual(receipt['mode'], 'publications')
            self.assertEqual(receipt['status'], 'no_user_facing_change')
            self.assertTrue((state/'runs'/receipt['run_id']/'receipt.json').exists())
            with patch.object(producer, '_execute', side_effect=OSError('private detail')):
                with self.assertRaises(OSError):
                    producer.execute(state, state)
            receipts = [json.loads(p.read_text()) for p in (state/'runs').glob('*/receipt.json')]
            failed = next(r for r in receipts if r['status'] == 'failed')
            self.assertEqual(failed['error'], 'OSError')
            self.assertNotIn('private detail', json.dumps(failed))

    def test_skips_incomplete_newest_digest_without_accepting_partial_evidence(self):
        from sources import complete_changemaker_digest
        partial = {'evidence': {'status': 'partial', 'failed_source_count': 2, 'items': []}}
        complete = {'evidence': {'status': 'complete', 'failed_source_count': 0, 'omitted_item_count': 0, 'items': []}}
        self.assertIs(complete_changemaker_digest({'drafts': [partial, complete]}), complete)
        for evidence in [{'status':'partial'}, {'status':'complete','failed_source_count':1}, {'status':'complete','omitted_item_count':1},
                         {'status':'complete','omitted_item_count':1,'omitted_items':[{'ref':'r#1','reason':'fetch failed'}]},
                         {'status':'complete','omitted_item_count':2,'omitted_items':[{'ref':'r#1','reason':'exceeds max_items 30'}]}]:
            with self.subTest(evidence=evidence), self.assertRaises(ValueError):
                complete_changemaker_digest({'drafts':[{'evidence':evidence}]})

    def test_accepts_busy_digest_that_only_hit_the_item_cap(self):
        from sources import complete_changemaker_digest
        busy = {'evidence': {'status': 'complete', 'failed_source_count': 0, 'omitted_item_count': 2,
                             'omitted_items': [{'ref': 'r#1', 'reason': 'exceeds max_items 30'},
                                               {'ref': 'r#2', 'reason': 'exceeds max_items 30'}]}}
        self.assertIs(complete_changemaker_digest({'drafts': [busy]}), busy)

    def test_generates_two_unapproved_editions_and_deduplicates_digest(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state';here=root/'automation/social-posting'
            here.mkdir(parents=True);(root/'content/social').mkdir(parents=True)
            (here/'config.json').write_text(json.dumps({'codex':'unused','model':'configured','switchyard':{},'craft':False}))
            (root/'content/social/Product Claims Register.md').write_text('Merged does not mean deployed.')
            (root/'content/VOICE.md').write_text('Plain language.')
            (here/'changemaker-publications-prompt.md').write_text('Prepare drafts.')
            item={'id':'S1','kind':'pull request','state':'merged','title':'Improve reading'}
            context={'drafts':[{'run_id':'source-run','draft':'Digest','draft_sha256':'d'*64,'evidence_sha256':'e'*64,'evidence':{'status':'complete','items':[item]}}]}
            def generate(command,**kwargs):
                (Path(kwargs['cwd'])/'result.json').write_text(json.dumps({'title':'Update','excerpt':'A clearer page.','website_body':'Website edition.','patreon_body':'Supporter edition.','source_ids':['S1']}))
                self.assertIn('features.shell_tool=false',command)
                self.assertNotIn('POSTING_PREPARATION_KEY',kwargs['env'])
                return subprocess.CompletedProcess(command,0)
            before=datetime.now(timezone.utc)
            with patch.object(producer,'HERE',here),patch.object(producer,'changes_context',return_value=context),patch.object(producer.subprocess,'run',side_effect=generate) as run:
                result=producer.execute(root,state)
                payload=json.loads((state/'publications'/('e'*64)/'drafts.json').read_text())
                self.assertEqual(result['draft_count'],2);self.assertFalse(result['publishing_enabled'])
                self.assertEqual({d['platform'] for d in payload},{'website','patreon'})
                self.assertTrue(all('approved' not in d and 'status' not in d for d in payload))
                self.assertGreaterEqual((datetime.fromisoformat(payload[0]['due_at'])-before).total_seconds(),48*3600)
                producer.execute(root,state);self.assertEqual(run.call_count,1)
    def test_staged_edition_is_used_without_the_single_pass_call(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state';here=root/'automation/social-posting'
            here.mkdir(parents=True);(root/'content/social').mkdir(parents=True)
            (here/'config.json').write_text(json.dumps({'codex':'unused','model':'configured','switchyard':{}}))
            (root/'content/social/Product Claims Register.md').write_text('Merged does not mean deployed.')
            (root/'content/VOICE.md').write_text('Plain language.')
            item={'id':'S1','kind':'pull request','state':'merged','title':'Improve reading'}
            context={'drafts':[{'run_id':'source-run','draft':'Digest','draft_sha256':'d'*64,'evidence_sha256':'e'*64,'evidence':{'status':'complete','items':[item]}}]}
            (here/'config.json').write_text(json.dumps({'codex':'unused','model':'configured','switchyard':{},'craft_publications':True}))
            staged={'title':'The menu that crashed the page','excerpt':'Opening the menu could crash the page.','website_body':'Website.','patreon_body':'Patreon.','source_ids':['S1']}
            import craft
            with patch.object(producer,'HERE',here),patch.object(producer,'changes_context',return_value=context),\
                 patch.object(craft,'publication',return_value=staged),patch.object(producer.subprocess,'run') as run:
                producer.execute(root,state)
                payload=json.loads((state/'publications'/('e'*64)/'drafts.json').read_text())
                self.assertEqual(run.call_count,0)
                self.assertEqual(payload[0]['title'],'The menu that crashed the page')

    def test_rejects_unknown_sources_private_links_and_embedded_media(self):
        good={'title':'Update','excerpt':'Excerpt','website_body':'Body','patreon_body':'Body','source_ids':['S1']}
        producer.validate(good,{'S1':{}})
        for changes in [{'source_ids':['unknown']},{'source_ids':['S1','S1']},{'patreon_body':'https://git.subcult.tv/private'},{'website_body':'![asset](https://subcult.tv/a.jpg)'},{'website_body':'<iframe>'}]:
            with self.subTest(changes=changes),self.assertRaises(ValueError):producer.validate({**good,**changes},{'S1':{}})

if __name__=='__main__':unittest.main()


class QuietDay(unittest.TestCase):
    def test_an_edition_that_keeps_nothing_prepares_no_entry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)/'studio';state=Path(tmp)/'state';here=root/'automation/social-posting'
            here.mkdir(parents=True);(root/'content/social').mkdir(parents=True)
            (here/'config.json').write_text(json.dumps({'codex':'unused','model':'configured','craft':False}))
            (root/'content/social/Product Claims Register.md').write_text('Merged does not mean deployed.')
            (root/'content/VOICE.md').write_text('Plain language.')
            (here/'changemaker-publications-prompt.md').write_text('Prepare drafts.')
            item={'id':'S1','kind':'pull request','state':'merged','title':'ui: keep rows inside the panel'}
            context={'drafts':[{'run_id':'changes-1','draft':'Collection note','draft_sha256':'d'*64,'evidence_sha256':'f'*64,'evidence':{'status':'complete','items':[item]}}]}
            def generate(command,**kwargs):
                (Path(kwargs['cwd'])/'result.json').write_text(json.dumps({'title':'No user-facing change today','excerpt':'Only a layout repair merged.','website_body':'No user-facing change today.','patreon_body':'No user-facing change today.','source_ids':[]}))
                return subprocess.CompletedProcess(command,0)
            with patch.object(producer,'HERE',here),patch.object(producer,'changes_context',return_value=context),patch.object(producer.subprocess,'run',side_effect=generate):
                result=producer.execute(root,state)
            self.assertEqual(result,{'status':'no_user_facing_change','draft_count':0,'publishing_enabled':False})
            folder=state/'publications'/('f'*64)
            self.assertFalse((folder/'drafts.json').exists())
            self.assertEqual(json.loads((folder/'skipped.json').read_text())['reason'],'Only a layout repair merged.')
