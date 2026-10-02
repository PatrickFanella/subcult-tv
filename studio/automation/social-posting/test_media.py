import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import media


class MediaTests(unittest.TestCase):
    def asset(self):
        return {'id':'MEDIA-test','file':'files/a.png','sha256':hashlib.sha256(b'original').hexdigest(),
                'status':'needs_review','rights':'generated','kind':'illustration','accounts':['patrick'],
                'platforms':['x'],'bytes':1024,'width':1200,'height':800}

    def choice(self):
        return {'mode':'library','asset_ids':['MEDIA-test'],'brief':'Concept illustration; review before use.',
                'alt_text':'Coral thread connects archival cards.'}

    def test_pending_asset_can_be_proposed_without_approving_it(self):
        asset = self.asset()
        media.validate_choice(self.choice(), {'assets':[asset]}, 'patrick')
        self.assertEqual(asset['status'],'needs_review')

    def test_unknown_rights_retired_and_wrong_account_rejected(self):
        for change,account in [({'rights':'unknown'},'patrick'),({'status':'retired'},'patrick'),({},'clpr')]:
            asset = self.asset();asset.update(change)
            with self.subTest(change=change,account=account), self.assertRaises(ValueError):
                media.validate_choice(self.choice(),{'assets':[asset]},account)

    def test_oversized_illustration_and_missing_alt_text_rejected(self):
        asset = self.asset();asset['bytes']=5_000_001
        with self.assertRaises(ValueError):media.validate_choice(self.choice(),{'assets':[asset]},'patrick')
        choice = self.choice();choice['alt_text']=''
        with self.assertRaises(ValueError):media.validate_choice(choice,{'assets':[self.asset()]},'patrick')

    def test_generation_needs_brief_and_cannot_claim_existing_assets(self):
        choice = {'mode':'generate','asset_ids':[],'brief':'','alt_text':'An original illustration.'}
        with self.assertRaises(ValueError):media.validate_choice(choice,{'assets':[]},'patrick')
        choice['brief']='Original collage.';choice['asset_ids']=['MEDIA-test']
        with self.assertRaises(ValueError):media.validate_choice(choice,{'assets':[self.asset()]},'patrick')

    def test_changed_bytes_and_path_escape_fail_catalog_read(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'files').mkdir();(root/'files/a.png').write_bytes(b'original')
            asset=self.asset();(root/'catalog.json').write_text(json.dumps({'version':1,'assets':[asset]}))
            media.read_catalog(root)
            (root/'files/a.png').write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError,'changed'):media.read_catalog(root)
            asset['file']='../outside.png';(root/'catalog.json').write_text(json.dumps({'version':1,'assets':[asset]}))
            with self.assertRaisesRegex(ValueError,'unsafe'):media.read_catalog(root)

    def test_gallery_escapes_titles_and_alt_text(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'files').mkdir();(root/'files/a.png').write_bytes(b'original')
            asset=self.asset();asset.update(title='<script>alert(1)</script>',products=['archive'],alt_text='A "card".')
            (root/'catalog.json').write_text(json.dumps({'version':1,'assets':[asset]}))
            page=Path(media.gallery(root)).read_text()
            self.assertNotIn('<script>alert',page)
            self.assertIn('&lt;script&gt;',page)


if __name__ == '__main__':
    unittest.main()
