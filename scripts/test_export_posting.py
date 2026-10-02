import json
from pathlib import Path
import tempfile
import unittest
from export_posting import snapshot


class PostingExportTests(unittest.TestCase):
    def test_no_state_is_explicit(self):
        data = snapshot()
        self.assertFalse(data['connected'])
        self.assertFalse(data['publishing_enabled'])
        self.assertEqual(data['drafts'], [])
        self.assertEqual(len(data['schedules']), 3)

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

if __name__=='__main__':unittest.main()
