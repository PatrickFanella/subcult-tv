import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import subprocess

import packets
import campaign_review
import strategy


class PacketTests(unittest.TestCase):
    def fixture(self, root):
        (root/'packet.md').write_text('One real task.')
        record = {'path': 'packet.md', 'sha256': hashlib.sha256((root/'packet.md').read_bytes()).hexdigest()}
        entry = {'files': [record], 'owner': 'Studio', 'review_after': '2020-01-01'}
        (root/'packets.json').write_text(json.dumps({'version': 1, 'projects': {'one': entry}}))
        return entry

    def test_hash_binding_and_stale_are_explicit(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); self.fixture(root)
            result = packets.load(root)['one']
            self.assertEqual(result['status'], 'needs_review')
            self.assertIn('One real task.', result['documents'].values())
            (root/'packet.md').write_text('Changed without selection')
            with self.assertRaises(ValueError): packets.load(root)

    def test_failed_refresh_uses_exact_recorded_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); entry = self.fixture(root)
            entry.update(upstream={'checkout':'/unused','remote':'origin','ref':'main','documents':['context.md']},
                         captured_revision='abc123', fallback=entry['files'])
            (root/'packets.json').write_text(json.dumps({'version':1,'projects':{'one':entry}}))
            with patch.object(packets.subprocess, 'run', side_effect=subprocess.TimeoutExpired('git', 90)):
                result = packets.load(root)['one']
            self.assertEqual(result['revision'], 'abc123')
            self.assertTrue(any('unavailable' in flag for flag in result['flags']))

    def test_review_requires_real_asset_and_comparable_action_results(self):
        projects = {'one': {'pillars':[{'id':'one-1','story':'One task'}], 'first_use_check':'Capture one task'}}
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            report = campaign_review.report(state, projects)['projects']['one']['themes'][0]
            self.assertEqual(report['decision'], 'capture_demonstration')
            asset = state/'capture.png'; asset.write_bytes(b'fixture')
            base={'id':'capture','kind':'asset','project':'one','pillar_id':'one-1','source':'local fixture',
                  'observed_at':'2026-01-01T12:00:00Z','file':str(asset),'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),
                  'rights':'Owned fixture','journey':'One task','revision':'rev1','result':'Task completed', 'inspected':True,'passed':True}
            campaign_review.validate(base, projects)
            result={'id':'result1','kind':'result','project':'one','pillar_id':'one-1','source':'Observed product counter',
                    'observed_at':'2026-01-03T12:00:00Z','draft_id':'draft1','metric':'completed exports / attempted exports',
                    'window_start':'2026-01-01T12:00:00Z','window_end':'2026-01-02T12:00:00Z',
                    'numerator':2,'denominator':5,'action_metric':True}
            campaign_review.validate(result, projects)
            (state/'campaign-records.json').write_text(json.dumps([base,result,{**result,'id':'result2','draft_id':'draft2'}]))
            theme = campaign_review.report(state, projects)['projects']['one']['themes'][0]
            self.assertEqual(theme['decision'], 'review_results')
            failed = {**base, 'id':'failed', 'passed':False}
            (state/'campaign-records.json').write_text(json.dumps([failed]))
            self.assertEqual(campaign_review.report(state, projects)['projects']['one']['themes'][0]['decision'], 'fix_journey_before_distribution')
            repaired = {**base, 'id':'repaired', 'observed_at':'2026-01-02T12:00:00Z'}
            (state/'campaign-records.json').write_text(json.dumps([failed,repaired]))
            self.assertEqual(campaign_review.report(state, projects)['projects']['one']['themes'][0]['decision'], 'collect_comparable_results')
            asset.write_bytes(b'changed')
            self.assertEqual(campaign_review.report(state, projects)['projects']['one']['themes'][0]['decision'], 'capture_demonstration')
            with self.assertRaises(ValueError): campaign_review.validate({**result,'numerator':6}, projects)
            with self.assertRaises(ValueError): campaign_review.validate({**result,'denominator':float('nan')}, projects)

    def test_invalid_theme_is_flagged_not_silently_attributed(self):
        with patch.object(strategy, 'context', return_value={'projects': {'one': {'pillars': [{'id':'one-1','story':'One'}], 'packet': {'status':'current','revision':'rev'}}}}):
            record = strategy.metadata({}, 'one', 'invented', 'Unexpected angle')
            self.assertEqual(record['pillar_id'], '')
            self.assertTrue(record['flags'])
            self.assertEqual(strategy.metadata({}, 'unknown')['status'], 'unassigned')
