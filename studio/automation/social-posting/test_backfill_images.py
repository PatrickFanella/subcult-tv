from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest

import backfill_images


class BackfillImagesTests(unittest.TestCase):
    def test_selects_only_future_unexpired_instagram_drafts_without_images(self):
        now = datetime(2026, 10, 6, tzinfo=timezone.utc)
        ahead, past = (now+timedelta(days=2)).isoformat(), (now-timedelta(days=1)).isoformat()
        drafts = [
            {'text': 'a', 'due_at': ahead, 'expires_at': ahead, 'media': {}},
            {'text': 'b', 'due_at': ahead, 'expires_at': ahead, 'media': {'image': {'sha256': 'f'*64}}},
            {'text': 'c', 'due_at': past, 'expires_at': ahead, 'media': {}},
            {'text': 'd', 'due_at': ahead, 'expires_at': past, 'media': {}},
            {'text': 'e', 'platform': 'x', 'due_at': ahead, 'expires_at': ahead, 'media': {}},
        ]
        with tempfile.TemporaryDirectory() as tmp:
            run = Path(tmp)/'runs'/'r-changemaker'; run.mkdir(parents=True)
            (run/'result.json').write_text(json.dumps({'drafts': drafts}))
            found = [d['text'] for _, _, d in backfill_images.candidates(Path(tmp), now)]
        self.assertEqual(found, ['a'])

    def test_product_comes_from_the_evidence_repository(self):
        draft = {'evidence': 'Changemaker run\nS1: Fix tips — https://git.subcult.tv/subculture-collective/kork/pulls/12'}
        self.assertEqual(backfill_images.product_of(draft), 'kork')
        self.assertEqual(backfill_images.product_of({'evidence': ''}), 'subcult')


if __name__ == '__main__':
    unittest.main()
