from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import changemaker_instagram
import weekly

CFG = json.loads((Path(__file__).resolve().parent/'config.json').read_text())
# Wednesday 15:00 UTC, the timer's run time.
NOW = datetime(2026, 10, 14, 15, 0, tzinfo=timezone.utc)


def digest(run_id, *items):
    return {'run_id': run_id, 'draft': 'Digest '+run_id,
            'evidence': {'status': 'complete', 'items': list(items)}}


def item(n, url, kind='pull request', state='merged'):
    return {'id': f'S{n}', 'url': url, 'kind': kind, 'state': state, 'title': f'Change {n}',
            'updated_at': '2026-10-12T00:00:00Z'}


def studio_source(tmp, cfg=None):
    """A disposable canonical checkout with the configuration the jobs read."""
    source = Path(tmp)/'studio'
    (source/'content/social').mkdir(parents=True)
    (source/'content/social/Product Claims Register.md').write_text('Claims.')
    (source/'automation/social-posting').mkdir(parents=True)
    (source/'automation/social-posting/config.json').write_text(json.dumps(cfg or CFG))
    return source


class WeeklyTests(unittest.TestCase):
    def test_slot_is_the_next_configured_weekday_at_least_48_hours_ahead(self):
        slot = weekly.next_slot(CFG, NOW)
        self.assertEqual((slot.weekday(), slot.strftime('%H:%M')), (4, '17:30'))
        self.assertEqual(slot.date().isoformat(), '2026-10-16')
        # Friday morning is too close for this Friday, so the next one is used.
        late = weekly.next_slot(CFG, datetime(2026, 10, 16, 12, 0, tzinfo=timezone.utc))
        self.assertEqual(late.date().isoformat(), '2026-10-23')

    def test_call_to_action_rotates_every_week(self):
        first = weekly.next_slot(CFG, NOW)
        asks = {weekly.call_to_action(CFG, weekly.next_slot(CFG, NOW.replace(day=NOW.day+7*k)))['id'] for k in range(3)}
        self.assertEqual(asks, {'patreon', 'newsletter', 'support'})
        self.assertEqual(weekly.week_of(first), '2026-W42')

    def test_daily_drafts_never_take_the_weekly_slot(self):
        slots = changemaker_instagram.posting_slots(CFG, NOW, 12)
        self.assertFalse(any(changemaker_instagram.weekly_slot(CFG, s) for s in slots))
        self.assertTrue(changemaker_instagram.weekly_slot(CFG, weekly.next_slot(CFG, NOW)))

    def test_week_evidence_merges_digests_without_id_collisions(self):
        context = {'drafts': [
            digest('a', item(1, 'https://example.invalid/1'), item(2, 'https://example.invalid/ci', state='open')),
            digest('b', item(1, 'https://example.invalid/2'), item(2, 'https://example.invalid/1')),
            {'run_id': 'partial', 'draft': 'x', 'evidence': {'status': 'partial', 'items': [item(1, 'https://example.invalid/3')]}},
        ]}
        items, digests = weekly.week_evidence(context)
        self.assertEqual([i['id'] for i in items], ['W1', 'W2'])
        self.assertEqual([i['url'] for i in items], ['https://example.invalid/1', 'https://example.invalid/2'])
        self.assertEqual([d['run_id'] for d in digests], ['a', 'b'])

    def test_caption_must_name_the_address_and_stay_unapproved(self):
        cta = CFG['weekly_cta']['rotation'][1]
        good = {'account': 'subcult', 'source_ids': ['W1'], 'text': 'Shipped a thing. Monthly email: subcult.tv/newsletter, link in bio.'}
        weekly.validate(good, {'W1': {}}, cta, 'subcult')
        weekly.validate({**good, 'source_ids': []}, {}, cta, 'subcult')
        for change in ({'text': 'Shipped a thing. Link in bio.'}, {'account': 'patrick'}, {'source_ids': ['S9']},
                       {'approved': True}, {'text': 'See git.subcult.tv/x and subcult.tv/newsletter'}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                weekly.validate({**good, **change}, {'W1': {}}, cta, 'subcult')

    def test_one_unapproved_draft_per_week_on_the_weekly_slot(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            context = {'drafts': [digest('a', item(1, 'https://example.invalid/1'))]}
            slot = weekly.next_slot(CFG, NOW)
            cta = weekly.call_to_action(CFG, slot)

            def staged(cfg, evidence, digest_text, claims, cta_, account, directory, recent=(), extra=None):
                self.assertEqual(cta_, cta)
                self.assertEqual([i['id'] for i in evidence['items']], ['W1'])
                return {'drafts': [{'account': 'subcult', 'source_ids': ['W1'], 'product': 'subcult', 'angle': 'recap',
                                    'text': 'This week clips load faster. '+cta['ask']+': '+cta['address']+' (link in bio).',
                                    'alt_text': 'A type card', 'next_check': 'Confirm the change is live.',
                                    'media': {'kind': 'type', 'headline': 'Clips load faster'}, 'image': '',
                                    'media_record': {'kind': 'type', 'headline': 'Clips load faster', 'checks': []},
                                    'craft': {'reader': '', 'reason': '', 'pattern': '', 'scores': {}, 'alternatives': []}}],
                        'open_checks': []}

            source = studio_source(tmp)
            with patch.object(weekly, 'changes_context', return_value=context), \
                    patch('craft.weekly', side_effect=staged):
                receipt = weekly.execute(source, state, NOW)
                again = weekly.execute(source, state, NOW)
            self.assertEqual((receipt['status'], receipt['kind'], receipt['week'], receipt['cta']),
                             ('success', 'weekly', '2026-W42', cta['id']))
            self.assertFalse(receipt['publishing_enabled'])
            self.assertEqual(receipt['source_identities'], [])
            self.assertEqual(again['status'], 'already_prepared')
            result = json.loads((state/'runs'/receipt['run_id']/'result.json').read_text())
            draft = result['drafts'][0]
            self.assertEqual(datetime.fromisoformat(draft['due_at']), slot)
            self.assertEqual(draft['craft']['kind'], 'weekly')
            self.assertIn(cta['address'], draft['next_check'])
            self.assertNotIn('approved', draft)
            # The weekly slot now shows as held for any other lane.
            self.assertIn(slot.astimezone(timezone.utc), changemaker_instagram.taken_slots(state, NOW))
            self.assertEqual(result['open_checks'], [])

    def test_flags_a_daily_draft_already_holding_the_slot(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)
            slot = weekly.next_slot(CFG, NOW)
            held = state/'runs'/'20261013T000000.000000Z-changemaker'
            held.mkdir(parents=True)
            (held/'result.json').write_text(json.dumps({'drafts': [{'due_at': slot.isoformat()}]}))
            cta = weekly.call_to_action(CFG, slot)
            draft = {'account': 'subcult', 'source_ids': [], 'product': 'subcult', 'angle': 'ask',
                     'text': cta['ask']+': '+cta['address']+' (link in bio).', 'alt_text': '', 'next_check': '',
                     'media': {'kind': 'type', 'headline': 'x'}, 'image': '',
                     'media_record': {'kind': 'type', 'headline': 'x', 'checks': []},
                     'craft': {'reader': '', 'reason': '', 'pattern': '', 'scores': {}, 'alternatives': []}}
            source = studio_source(tmp)
            with patch.object(weekly, 'changes_context', return_value={'drafts': []}), \
                    patch('craft.weekly', return_value={'drafts': [draft], 'open_checks': []}):
                receipt = weekly.execute(source, state, NOW)
            result = json.loads((state/'runs'/receipt['run_id']/'result.json').read_text())
            self.assertEqual(len(result['open_checks']), 1)

    def test_reads_the_source_root_configuration_like_the_daily_job(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)/'state'
            # The canonical checkout moves the weekly slot to Saturday; the bundle copy still says Friday.
            source = studio_source(tmp, {**CFG, 'weekly_cta': {**CFG['weekly_cta'], 'weekday': 5}})
            seen = {}

            def staged(cfg, evidence, digest_text, claims, cta_, account, directory, recent=(), extra=None):
                seen['weekday'] = cfg['weekly_cta']['weekday']
                return {'drafts': [], 'open_checks': []}
            with patch.object(weekly, 'changes_context', return_value={'drafts': []}), patch('craft.weekly', side_effect=staged):
                receipt = weekly.execute(source, state, NOW)
            self.assertEqual(seen['weekday'], 5)
            self.assertEqual(receipt['status'], 'no_draft')
            status = json.loads((state/'status.json').read_text())['jobs']['changemaker-weekly']
            self.assertEqual((status['status'], status['run_id']), ('skipped', receipt['run_id']))

    def test_catch_up_run_keys_on_the_collection_week_not_the_slot(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)/'state'
            source = studio_source(tmp)
            saturday = datetime(2026, 10, 17, 15, 0, tzinfo=timezone.utc)  # after Friday's slot, still W42
            empty = {'drafts': [], 'open_checks': []}
            with patch.object(weekly, 'changes_context', return_value={'drafts': []}), patch('craft.weekly', return_value=empty):
                late = weekly.execute(source, state, saturday)
            # The late run drafts W42's evidence into the next free slot without claiming W43.
            self.assertEqual(late['week'], '2026-W42')
            self.assertEqual(weekly.next_slot(CFG, saturday).date().isoformat(), '2026-10-23')
            (state/'runs'/late['run_id']/'receipt.json').write_text(json.dumps({**late, 'status': 'success'}))
            self.assertEqual(weekly.prepared_weeks(state), {'2026-W42'})
            with patch.object(weekly, 'changes_context', return_value={'drafts': []}), patch('craft.weekly', return_value=empty) as craft_weekly:
                self.assertEqual(weekly.execute(source, state, saturday)['status'], 'already_prepared')
                natural = weekly.execute(source, state, NOW+timedelta(days=7))
            self.assertEqual((natural['status'], natural['week']), ('no_draft', '2026-W43'))
            self.assertEqual(craft_weekly.call_count, 1)

    def test_a_slot_more_than_seven_days_away_is_a_recorded_missed_week(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)/'state'
            source = studio_source(tmp)
            # Wednesday 23:00 UTC is past the 48-hour lead for Friday; the next slot is nine days out.
            with patch.object(weekly, 'changes_context') as collect, patch('craft.weekly') as craft_weekly:
                receipt = weekly.execute(source, state, datetime(2026, 10, 14, 23, 0, tzinfo=timezone.utc))
            collect.assert_not_called()
            craft_weekly.assert_not_called()
            self.assertEqual((receipt['status'], receipt['week'], receipt['draft_count']), ('missed_week', '2026-W42', 0))
            saved = json.loads((state/'runs'/receipt['run_id']/'receipt.json').read_text())
            self.assertEqual(saved['status'], 'missed_week')
            self.assertNotIn('2026-W42', weekly.prepared_weeks(state))

    def test_an_unexpected_failure_leaves_a_failed_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)/'state'
            source = studio_source(tmp)
            with patch.object(weekly, 'changes_context', side_effect=OSError('/private/path')):
                with self.assertRaises(OSError):
                    weekly.execute(source, state, NOW)
            receipt = json.loads(next((state/'runs').glob('*/receipt.json')).read_text())
            self.assertEqual((receipt['status'], receipt['kind'], receipt['error']), ('failed', 'weekly', 'OSError'))
            self.assertNotIn('/private/path', (state/'status.json').read_text())


if __name__ == '__main__':
    unittest.main()
