import importlib.util
import json
from datetime import datetime
from pathlib import Path
import tempfile
import unittest
from zoneinfo import ZoneInfo

spec = importlib.util.spec_from_file_location('social_runner', Path(__file__).with_name('runner.py'))
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
CFG = json.loads(Path(__file__).with_name('config.json').read_text())


class RunnerTests(unittest.TestCase):
    def test_preserves_human_notes_outside_managed_section(self):
        old = runner.managed_update('# My notes\nKeep this.', 'First draft', None)
        block = runner.BEGIN+'\nFirst draft\n'+runner.END
        updated = runner.managed_update(old+'\nMy new edit.\n', 'New draft', runner.digest(block))
        self.assertIn('Keep this.', updated)
        self.assertIn('My new edit.', updated)
        self.assertIn('New draft', updated)

    def test_human_edit_inside_managed_section_is_preserved(self):
        old = runner.managed_update('# Notes', 'Original', None)
        with self.assertRaisesRegex(ValueError, 'edited'):
            runner.managed_update(old.replace('Original', 'My correction'), 'Replacement', runner.digest(runner.BEGIN+'\nOriginal\n'+runner.END))

    def test_unknown_managed_section_cannot_be_adopted(self):
        with self.assertRaises(ValueError):
            runner.managed_update(runner.BEGIN+'\nMine\n'+runner.END, 'Replacement', None)

    def test_duplicate_markers_fail(self):
        with self.assertRaises(ValueError):
            runner.managed_update(runner.BEGIN+runner.BEGIN+runner.END, 'Replacement', None)

    def test_first_pilot_and_iso_year(self):
        self.assertEqual(runner.week_for(datetime(2026,9,30,tzinfo=ZoneInfo('America/Chicago')), '2026-W41'), '2026-W41')
        self.assertEqual(runner.week_for(datetime(2027,1,1,tzinfo=ZoneInfo('America/Chicago')), '2026-W41'), '2026-W53')
        with self.assertRaises(ValueError):
            runner.week_for(datetime.now(), '2026-W41', '2027-W53')

    def draft(self, **changes):
        draft = {'candidate_id':'CLPR-01','account':'clpr','text':'Browse Twitch clips by creator and topic. https://clpr.tv/',
                 'due_at':'2026-10-07T10:34:00-05:00','evidence':'Current source; live save not repeated.','next_check':'Capture browsing asset.'}
        draft.update(changes)
        return {'week':'2026-W41','drafts':[draft]}

    def test_correct_routing_and_chicago_time(self):
        runner.validate_result(self.draft(), CFG, '2026-W41', '| CLPR-01 | clpr |')
        for changes in [{'candidate_id':'PATCHWORK-01'},{'due_at':'2026-10-07T10:34:00+00:00'},
                        {'due_at':'2026-10-07T09:34:00-05:00'},{'text':'x'*281},{'approved':True}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                runner.validate_result(self.draft(**changes), CFG, '2026-W41', '| CLPR-01 | clpr |\n| PATCHWORK-01 | Patchwork |')

    def test_duplicate_account_slot_is_rejected(self):
        result = self.draft();result['drafts'] *= 2
        with self.assertRaises(ValueError):
            runner.validate_result(result,CFG,'2026-W41','| CLPR-01 | clpr |')

    def test_existing_timely_reservation_blocks_same_slot(self):
        slots = [{'account':'clpr','due_at':'2026-10-07T10:34:00-05:00'}]
        with self.assertRaisesRegex(ValueError, 'conflicts'):
            runner.validate_result(self.draft(), CFG, '2026-W41', '| CLPR-01 | clpr |', slots)

    def test_existing_timely_reservation_counts_against_daily_capacity(self):
        slots = [{'account':'clpr','due_at':'2026-10-07T08:00:00-05:00'}]
        with self.assertRaisesRegex(ValueError, 'daily cap'):
            runner.validate_result(self.draft(), CFG, '2026-W41', '| CLPR-01 | clpr |', slots)

    def test_partial_week_rejects_past_slots(self):
        with self.assertRaisesRegex(ValueError, 'already past'):
            runner.validate_result(self.draft(), CFG, '2026-W41', '| CLPR-01 | clpr |',
                                   now=datetime.fromisoformat('2026-10-07T11:00:00-05:00'))

    def event(self, server, tool, payload, arguments=None):
        return {'type':'item.completed','item':{'type':'mcp_tool_call','server':server,'tool':tool,'status':'completed',
            'arguments':arguments or {},'error':None,'result':{'content':[{'type':'text','text':json.dumps(payload)}]}}}

    def evidence(self):
        events = [self.event('buffer','get_account',{'organizations':[{'id':CFG['organization_id']}]}),
                  self.event('buffer','list_channels',[{'id':cid,'isDisconnected':False,'isLocked':False} for cid in CFG['channels'].values()]),
                  self.event('buffer','list_posts',[])]
        return events

    def test_buffer_evidence_succeeds_without_task_provider(self):
        receipt=runner.verify_evidence(self.evidence(),CFG)
        self.assertEqual(receipt['successful_read_calls'],3)
        with self.assertRaises(ValueError):runner.verify_evidence(self.evidence()[:-1],CFG)
        events=self.evidence();events[0]=self.event('buffer','get_account',{'organizations':[{'id':'other'}]})
        with self.assertRaises(ValueError):runner.verify_evidence(events,CFG)

    def test_task_provider_is_not_an_allowed_dependency(self):
        with self.assertRaisesRegex(ValueError, 'Unexpected provider tool'):
            runner.verify_evidence(self.evidence()+[self.event('super-productivity','get_tasks',{'tasks':[]})], CFG)

    def test_write_tool_is_rejected(self):
        with self.assertRaisesRegex(ValueError,'Unexpected'):
            runner.verify_evidence(self.evidence()+[self.event('buffer','create_post',{})],CFG)

    def test_provider_error_payload_is_not_evidence(self):
        events = self.evidence()
        events[2] = self.event('buffer', 'list_posts', {'error':'Unavailable','httpCode':503})
        with self.assertRaisesRegex(ValueError, 'post inspection'):
            runner.verify_evidence(events, CFG)

    def test_codex_only_exposes_read_tools(self):
        command=runner.codex_command(CFG,Path('/tmp/test-social'))
        self.assertIn('mcp_servers.buffer.enabled_tools='+json.dumps(runner.BUFFER_TOOLS),command)
        self.assertNotIn('create_post',' '.join(command))
        self.assertIn('features.shell_tool=false',command)
        self.assertNotIn('super-productivity', ' '.join(command))
        self.assertNotIn('sp-mcp', ' '.join(command))

    def test_atomic_write_permissions(self):
        with tempfile.TemporaryDirectory() as directory:
            p=Path(directory)/'note.md';runner.atomic_write(p,'Test')
            self.assertEqual(p.read_text(),'Test')
            self.assertEqual(p.stat().st_mode & 0o777,0o600)


if __name__ == '__main__':
    unittest.main()
