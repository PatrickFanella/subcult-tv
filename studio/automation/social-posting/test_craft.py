from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import craft


class MakeMediaTests(unittest.TestCase):
    def draft(self, kind='illustration'):
        return {'text': 'Caption', 'product': 'clpr',
                'media': {'kind': kind, 'headline': 'Find a clip', 'kicker': 'CLPR', 'image_prompt': 'A clip stack', 'url': ''}}

    def test_an_inapplicable_fix_switches_to_type_instead_of_rerendering_the_same_image(self):
        renders, checks = [], []

        def render(kind, slug, headline, kicker, target, image=None):
            renders.append((kind, headline))
            Path(target).write_bytes(b'\xff\xd8\xff')
            return Path(target)

        def check(cfg, jpeg, draft, directory, name):
            checks.append(draft['media']['kind'])
            # The verdict names a fix that changes nothing for this draft.
            return {'pass': False, 'fix': 'shorten_headline', 'new_headline': '', 'alt_text': '', 'art_prompt_change': ''}
        with tempfile.TemporaryDirectory() as tmp, \
                patch.object(craft, 'generate_art', return_value=Path(tmp)/'art.png'), \
                patch.object(craft.render, 'render', side_effect=render), patch.object(craft, 'visual_check', side_effect=check):
            (Path(tmp)/'art.png').write_bytes(b'png')
            jpeg, record = craft.make_media({}, self.draft(), Path(tmp), 0)
        self.assertIsNone(jpeg)
        self.assertTrue(record['unresolved'])
        # Illustration once, then the type card once; never the same render twice in a row.
        self.assertEqual([kind for kind, _ in renders], ['illustration', 'type'])
        self.assertEqual(checks, ['illustration', 'type'])

    def test_a_real_fix_is_applied_and_a_passing_check_returns_the_image(self):
        headlines = []

        def render(kind, slug, headline, kicker, target, image=None):
            headlines.append(headline)
            Path(target).write_bytes(b'\xff\xd8\xff')
            return Path(target)
        verdicts = [{'pass': False, 'fix': 'shorten_headline', 'new_headline': 'Clips', 'alt_text': '', 'art_prompt_change': ''},
                    {'pass': True, 'fix': 'none', 'new_headline': '', 'alt_text': 'A type card reading Clips', 'art_prompt_change': ''}]
        with tempfile.TemporaryDirectory() as tmp, patch.object(craft.render, 'render', side_effect=render), \
                patch.object(craft, 'visual_check', side_effect=verdicts):
            jpeg, record = craft.make_media({}, self.draft('type'), Path(tmp), 0)
        self.assertIsNotNone(jpeg)
        self.assertEqual(headlines, ['Find a clip', 'Clips'])
        self.assertEqual((record['headline'], record['alt_text']), ('Clips', 'A type card reading Clips'))


if __name__ == '__main__':
    unittest.main()
