import json
from pathlib import Path
import tempfile
import unittest
from export_posting import snapshot


class PostingExportTests(unittest.TestCase):
    def test_publication_no_story_run_is_visible_without_private_error_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            run = state/'runs'/'publication-check'; run.mkdir(parents=True)
            (run/'receipt.json').write_text(json.dumps({'mode':'publications','status':'no_user_facing_change',
                'run_id':'publication-check','draft_count':0,'checked_at':'2026-10-21T12:00:00Z','error':'private detail'}))
            data = snapshot(state)
            self.assertEqual(data['runs'][0]['status'], 'no_user_facing_change')
            self.assertEqual(data['runs'][0]['mode'], 'publications')
            self.assertNotIn('private detail', json.dumps(data))
            self.assertEqual(data['drafts'], [])

    def test_requested_tweets_export_without_replacing_the_weekly_plan(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            for mode in ('plan', 'ondemand'):
                run = state/'runs'/mode
                run.mkdir(parents=True)
                (run/'receipt.json').write_text(json.dumps({'mode':mode,'status':'success','run_id':mode,'week':'2026-W41','draft_count':1}))
                (run/'result.json').write_text(json.dumps({'drafts':[{'account':'clpr','text':mode,'platform':'x'}]}))
            data = snapshot(state)
            self.assertEqual({d['text'] for d in data['drafts']}, {'plan','ondemand'})
            self.assertTrue(all(d['approval']=='unapproved' for d in data['drafts']))

    def test_no_state_is_explicit(self):
        data = snapshot()
        self.assertFalse(data['connected'])
        self.assertFalse(data['publishing_enabled'])
        self.assertEqual(data['drafts'], [])
        self.assertEqual(len(data['schedules']), 4)

    def test_completed_results_only_and_receipt_redaction(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            directory = state/'runs'/'test-plan'
            directory.mkdir(parents=True)
            receipt = {'mode':'plan','status':'success','run_id':'test-plan','week':'2026-W40','draft_count':1,'error':'private error','provider_evidence':{'token':'secret'},'note':'/private/path'}
            (directory/'receipt.json').write_text(json.dumps(receipt))
            (state/'latest.json').write_text(json.dumps(receipt))
            (directory/'result.json').write_text(json.dumps({'drafts':[{'account':'patrick','text':'Draft for review','due_at':'2026-10-02T12:00:00Z','media':{'mode':'capture','brief':'Capture UI'},'approval':'approved','token':'secret'}],'open_checks':['Check screenshot']}))
            bad = state/'runs'/'unfinished-plan';bad.mkdir();(bad/'result.json').write_text('{"drafts":[{"text":"unfinished"}]}')
            data = snapshot(state)
            text = json.dumps(data)
            for forbidden in ['secret','private error','/private/path','unfinished']:
                self.assertNotIn(forbidden, text)
            self.assertEqual(len(data['runs']),1)
            self.assertEqual(len(data['drafts']),1)
            self.assertEqual(data['drafts'][0]['approval'],'unapproved')
            self.assertEqual(data['drafts'][0]['media']['mode'],'capture')

    def test_receipt_cannot_reference_outside_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp)
            (state/'latest.json').write_text(json.dumps({'mode':'plan','status':'success','run_id':'../../outside','draft_count':1}))
            data=snapshot(state)
            self.assertEqual(data['drafts'],[])

    def test_changemaker_drafts_reach_snapshot_without_raw_evidence_or_approval(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);run=state/'runs'/'cm';run.mkdir(parents=True)
            (run/'receipt.json').write_text(json.dumps({'mode':'changemaker','status':'success','run_id':'cm','draft_count':1,'source_identities':['private-ledger']}))
            (run/'result.json').write_text(json.dumps({'drafts':[{'account':'subcult','text':'An Instagram draft','evidence':'Review the collected source','approval':'approved'}]}))
            (run/'sources.json').write_text('{"raw_secret":"must stay local"}')
            data=snapshot(state)
            self.assertEqual(data['drafts'][0]['mode'],'changemaker')
            self.assertEqual(data['drafts'][0]['approval'],'unapproved')
            self.assertNotIn('private-ledger',json.dumps(data))
            self.assertNotIn('must stay local',json.dumps(data))

    def test_platform_is_exported_or_derived(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp)
            for mode in ('plan','changemaker'):
                run=state/'runs'/mode;run.mkdir(parents=True)
                (run/'receipt.json').write_text(json.dumps({'mode':mode,'status':'success','run_id':mode,'week':'2026-W41','draft_count':2}))
                (run/'result.json').write_text(json.dumps({'drafts':[{'account':'clpr' if mode=='plan' else 'subcult','text':'Old draft'},{'account':'patrick','text':'New draft','platform':'bluesky'}]}))
            data=snapshot(state)
            platforms={d['id']:d['platform'] for d in data['drafts']}
            self.assertEqual(platforms['plan:0'],'x')
            self.assertEqual(platforms['changemaker:0'],'instagram')
            self.assertEqual(platforms['plan:1'],'bluesky')

    def test_replies_are_exported_and_bounded(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);run=state/'runs'/'plan';run.mkdir(parents=True)
            (run/'receipt.json').write_text(json.dumps({'mode':'plan','status':'success','run_id':'plan','week':'2026-W41','draft_count':2}))
            (run/'result.json').write_text(json.dumps({'drafts':[
                {'account':'subcult','text':'Opener','replies':['One','','Two','Three','Four',7]},
                {'account':'subcult','text':'Single'}]}))
            drafts={d['id']:d for d in snapshot(state)['drafts']}
            self.assertEqual(drafts['plan:0']['replies'],['One','Two','Three'])
            self.assertNotIn('replies',drafts['plan:1'])

    def test_contract_fields_are_bounded_and_sources_are_titles_only(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);run=state/'runs'/'cm';run.mkdir(parents=True)
            media=state/'media';media.mkdir()
            jpeg=b'\xff\xd8\xff'+b'0'*100
            (media/'a.jpg').write_bytes(jpeg)
            (media/'big.jpg').write_bytes(b'\xff\xd8\xff'+b'0'*(901*1024))
            outside=Path(tempfile.mkdtemp())/'outside.jpg';outside.write_bytes(jpeg)
            (media/'link.jpg').symlink_to(outside)
            sha=hashlib.sha256(jpeg).hexdigest()
            draft={'account':'subcult','text':'Caption','platform':'instagram',
                'evidence':'Changemaker run-1; evidence SHA-256 abc\nPR-1: Add the clip stack — https://git.subcult.tv/private/repo/pulls/1',
                'craft':{'angle':'For people who clip streams','reader':'Clippers','reason':'New mark','pattern':'reveal','predicted':'saves',
                         'scores':{'hook':4,'story':9,'voice':'5','honesty':5},'alternatives':['Alt one',3],'secret':'drop me'},
                'checklist':['Check the mark','',7],
                'media':{'mode':'capture','alt_text':'A purple mark','kind':'illustration','headline':'New mark',
                         'image':{'file':'media/a.jpg','sha256':sha,'width':1080,'height':1350,'bytes':103},
                         'candidates':[{'file':'media/big.jpg','sha256':'b'*64},{'file':'media/link.jpg','sha256':sha},{'file':'../x.jpg','sha256':'c'*64},{'file':'media/a.jpg','sha256':'NOTHEX'}]}}
            (run/'receipt.json').write_text(json.dumps({'mode':'changemaker','status':'success','run_id':'cm','draft_count':1}))
            (run/'result.json').write_text(json.dumps({'drafts':[draft]}))
            files={}
            data=snapshot(state, media_files=files)
            d=data['drafts'][0]
            text=json.dumps(data)
            self.assertNotIn('media/a.jpg',text)
            self.assertNotIn('drop me',text)
            self.assertEqual(d['sources'],['Add the clip stack'])
            self.assertEqual(d['craft']['scores'],{'hook':4,'honesty':5})
            self.assertEqual(d['craft']['alternatives'],['Alt one'])
            self.assertEqual(d['checklist'],['Check the mark'])
            self.assertEqual(d['media']['alt_text'],'A purple mark')
            self.assertEqual(d['media']['kind'],'illustration')
            self.assertEqual(d['media']['image'],{'sha256':sha,'bytes':103,'width':1080,'height':1350})
            self.assertNotIn('candidates',d['media'])
            self.assertEqual(files,{sha:media/'a.jpg'})

    def test_bluesky_variants_are_bound_to_completed_x_drafts_and_redacted(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);run=state/'runs'/'plan';run.mkdir(parents=True)
            (run/'receipt.json').write_text(json.dumps({'mode':'plan','status':'success','run_id':'plan','week':'2026-W41','draft_count':1}))
            draft={'account':'subcult','text':'Reviewed text','due_at':'2026-10-12T14:00:00Z','replies':['X-only link'],'supersedes':'old:0'}
            (run/'result.json').write_text(json.dumps({'drafts':[draft]}))
            (run/'bluesky-drafts.json').write_text(json.dumps([
                {**draft,'platform':'bluesky','state':'approved','publishing_enabled':True,
                 'checks':['Verify platform mentions'],'eligible_assets':[{'file':'/private/path','token':'secret'}]},
                {'platform':'bluesky','account':'patrick','text':'Unbound text','due_at':draft['due_at']}]))
            data=snapshot(state)
            self.assertEqual(len(data['drafts']),2)
            sky=next(d for d in data['drafts'] if d['platform']=='bluesky')
            self.assertEqual(sky['id'],'plan:bluesky:0')
            self.assertEqual(sky['supersedes'],'old:bluesky:0')
            self.assertEqual(sky['approval'],'unapproved')
            self.assertNotIn('replies',sky)
            self.assertIn('Verify platform mentions',sky['checklist'])
            for forbidden in ('/private/path','secret','Unbound text','eligible_assets'):
                self.assertNotIn(forbidden,json.dumps(data))

    def test_sources_drop_urls(self):
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);run=state/'runs'/'p';run.mkdir(parents=True)
            (run/'receipt.json').write_text(json.dumps({'mode':'radar','status':'success','run_id':'p','draft_count':1}))
            (run/'result.json').write_text(json.dumps({'drafts':[{'account':'patrick','text':'x','sources':[{'title':'Release notes https://git.subcult.tv/a','url':'https://git.subcult.tv/a'},'Plain title']}]}))
            d=snapshot(state)['drafts'][0]
            self.assertEqual(d['sources'],['Release notes','Plain title'])
            self.assertNotIn('git.subcult.tv',json.dumps(d))

if __name__=='__main__':unittest.main()
