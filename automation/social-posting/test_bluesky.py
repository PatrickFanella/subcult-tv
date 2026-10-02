import tempfile
from pathlib import Path
from unittest.mock import patch
import unittest
import bluesky


class BlueskyTests(unittest.TestCase):
    def cfg(self):
        return {'bluesky':{'accounts':{'patrick':{'handle':'patrick.subcult.tv','state':'auth_pending'}}}}

    def draft(self, text='A concrete archive workflow.'):
        return {'account':'patrick','text':text,'due_at':'2026-10-02T09:11:00-05:00',
                'media':{'mode':'library','asset_ids':['original'],'brief':'Concept artwork.','alt_text':'A card.'}}

    @patch('bluesky.media.context')
    def test_derivative_selected_without_publishing_or_approving(self, context):
        context.return_value={'assets':[{'id':'original','bytes':3000000,'platforms':['x'],'accounts':['patrick'],'kind':'image'},
            {'id':'small','parent_id':'original','bytes':100000,'platforms':['bluesky'],'accounts':['patrick'],
             'kind':'image','file':'files/small.jpg','alt_text':'A card.'}]}
        d=bluesky.prepare({'drafts':[self.draft()]}, self.cfg())[0]
        self.assertEqual(d['eligible_assets'][0]['id'],'small')
        self.assertFalse(d['publishing_enabled'])
        self.assertEqual(d['state'],'unapproved')

    @patch('bluesky.media.context', return_value={'assets':[]})
    def test_x_mentions_and_quotes_require_platform_review(self, context):
        d=bluesky.prepare({'drafts':[self.draft('@someone https://x.com/someone/status/123')]},self.cfg())[0]
        self.assertTrue(any('mention' in c for c in d['checks']))
        self.assertTrue(any('not a native' in c for c in d['checks']))

    @patch('bluesky.media.context', return_value={'assets':[]})
    def test_text_limit_and_no_account_do_not_invent_destination(self, context):
        with self.assertRaises(ValueError):
            bluesky.prepare({'drafts':[self.draft('a'*301)]},self.cfg())
        self.assertEqual(bluesky.prepare({'drafts':[self.draft()]},{}),[])

    @patch('bluesky.media.context', return_value={'assets':[]})
    def test_empty_review_still_writes_empty_export(self, context):
        with tempfile.TemporaryDirectory() as folder:
            self.assertEqual(bluesky.save(folder, {'drafts':[]},self.cfg()),[])
            self.assertEqual((Path(folder)/'bluesky-drafts.json').read_text(),'[]\n')
