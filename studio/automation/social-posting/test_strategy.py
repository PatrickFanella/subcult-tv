import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import strategy
import craft


class StrategyTests(unittest.TestCase):
    def test_final_copy_gets_one_repair_then_is_withheld_if_still_weak(self):
        final = {'drafts': [{'text': 'Six templates. Six starting points.'}], 'open_checks': []}
        failed = {'pass': False, 'issues': ['Feature opening repeats itself.']}
        with patch.object(craft, 'codex', side_effect=[final, failed, final, failed]) as calls:
            result = craft.checked_final({}, {}, Path('/unused'))
        self.assertEqual(result['drafts'], [])
        self.assertEqual(calls.call_count, 4)
        self.assertIn('withheld', result['open_checks'][0])
        with patch.object(craft, 'codex', side_effect=[final, {'pass': True, 'issues': []}]) as calls:
            self.assertIs(craft.checked_final({}, {}, Path('/unused')), final)
        self.assertEqual(calls.call_count, 2)

    def test_prepared_theme_rotates_and_pack_changes_are_identifiable(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            path = root/'strategy.json'
            project = {'pillars': [{'id': 'template'}, {'id': 'lyrics'}]}
            path.write_text(json.dumps({'version': 1, 'projects': {'undertow': project}}))
            cfg = {'strategy_file': str(path)}
            first = strategy.campaign(cfg, 'undertow', root)
            self.assertEqual(first['pillar_id'], 'template')
            run = root/'runs'/'one'; run.mkdir(parents=True)
            (run/'result.json').write_text(json.dumps({'drafts': [{'craft': {'campaign': first}}]}))
            self.assertEqual(strategy.campaign(cfg, 'undertow', root)['pillar_id'], 'lyrics')
            old = first['strategy_sha256']
            path.write_text(path.read_text()+'\n')
            self.assertNotEqual(strategy.context(cfg)['source_sha256'], old)

    def test_failed_visual_is_withheld_and_observed_alt_text_wins(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            jpeg = directory/'post-0.jpg'; jpeg.write_bytes(b'image')
            draft = {'product': 'undertow', 'text': 'Lyrics on screen',
                     'media': {'kind': 'type', 'headline': 'Lyrics', 'kicker': ''}}
            fail = {'pass': False, 'fix': 'switch_to_type', 'issues': ['wrong subject'], 'alt_text': ''}
            with patch.object(craft.render, 'render', return_value=jpeg), patch.object(craft, 'visual_check', return_value=fail):
                image, record = craft.make_media({}, draft, directory, 0)
            self.assertIsNone(image)
            self.assertTrue(record['unresolved'])
            success = {'pass': True, 'issues': [], 'alt_text': 'A card reading Lyrics.'}
            with patch.object(craft.render, 'render', return_value=jpeg), patch.object(craft, 'visual_check', return_value=success):
                image, record = craft.make_media({}, draft, directory, 0)
            self.assertEqual(image, jpeg)
            self.assertEqual(record['alt_text'], success['alt_text'])

    def test_explicit_missing_strategy_is_an_error(self):
        with self.assertRaises(FileNotFoundError):
            strategy.context({'strategy_file': '/nonexistent/strategy.json'})
