from datetime import datetime, timezone
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

            source = Path(tmp)/'studio'
            (source/'content/social').mkdir(parents=True)
            (source/'content/social/Product Claims Register.md').write_text('Claims.')
            with patch.object(weekly, 'changemaker_context', return_value=context), \
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


if __name__ == '__main__':
    unittest.main()
