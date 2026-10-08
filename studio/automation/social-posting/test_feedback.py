import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import feedback


PAYLOAD = {
    'decisions': [
        {'decision': 'rejected', 'platform': 'x', 'account': 'patrick', 'draft_id': '20261008T185712.659892Z-plan:0',
         'original_text': 'For a musician rendering a video on a laptop, the laptop matters.', 'final_text': '',
         'reason_codes': ['boring'], 'note': 'Reads like docs', 'decided_at': '2026-10-08T19:00:00Z', 'decided_by': ''},
        {'decision': 'snoozed', 'platform': 'x', 'draft_id': 'a:1', 'decided_at': '2026-10-08T19:30:00Z'},
        {'decision': 'favorited', 'platform': 'instagram', 'account': 'subcult', 'draft_id': 'b:0',
         'original_text': 'Good caption', 'final_text': 'Good caption', 'reason_codes': [], 'note': '',
         'decided_at': '2026-10-08T20:00:00Z'},
    ],
    'rerolls': [{'draft_id': '20261007T042001.203422Z-changemaker:0', 'mode': 'text', 'note': 'Warmer, please',
                 'requested_at': '2026-10-07T12:00:00Z'}],
}


class FeedbackTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.state = Path(self.tmp.name)
        run = self.state/'runs'/'20261007T042001.203422Z-changemaker'
        run.mkdir(parents=True)
        (run/'result.json').write_text(json.dumps({'drafts': [{'text': 'The rerolled caption'}]}))

    def tearDown(self):
        self.tmp.cleanup()

    def test_records_are_normalized_newest_first_without_snoozes(self):
        records = feedback.records(PAYLOAD, self.state)
        self.assertEqual([r['decision'] for r in records], ['favorited', 'rejected', 'reroll_requested'])
        self.assertEqual(records[1]['reasons'], ['boring'])
        self.assertEqual(records[2]['original_text'], 'The rerolled caption')
        self.assertNotIn('decided_by', records[1])

    def test_pull_writes_the_file_that_drafting_reads(self):
        with mock.patch('changemaker_publications.preparation_settings', return_value={}), \
                mock.patch.object(feedback, 'fetch', return_value=PAYLOAD):
            self.assertEqual(feedback.pull(self.state, Path('unused.env')), 3)
        self.assertEqual((self.state/feedback.FILE).stat().st_mode & 0o777, 0o600)
        short = feedback.owner_feedback(self.state, ('x', 'bluesky'))
        self.assertEqual([r['note'] for r in short], ['Reads like docs'])
        self.assertEqual(len(feedback.owner_feedback(self.state)), 3)

    def test_missing_or_invalid_file_is_empty(self):
        self.assertEqual(feedback.owner_feedback(self.state), [])
        (self.state/feedback.FILE).write_text('not json')
        self.assertEqual(feedback.owner_feedback(self.state), [])

    def test_unknown_draft_ids_resolve_to_no_text(self):
        self.assertEqual(feedback.draft_text(self.state, '../../etc:0'), '')
        self.assertEqual(feedback.draft_text(self.state, '20261007T042001.203422Z-changemaker:5'), '')


if __name__ == '__main__':
    unittest.main()
