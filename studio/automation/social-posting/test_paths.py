import unittest
from pathlib import Path
import paths

class ContentPathsTests(unittest.TestCase):
    def test_studio_root_is_independent_of_working_directory(self):
        expected=Path(paths.__file__).resolve().parents[2]
        self.assertEqual(paths.root({'content_root':'.'}),expected)
        self.assertEqual(paths.social({'content_root':'.','social_folder':'content/social'}),expected/'content/social')

    def test_drafts_have_their_own_folder(self):
        expected=Path(paths.__file__).resolve().parents[2]
        cfg={'content_root':'.','social_folder':'content/social','drafts_folder':'content/social/drafts'}
        self.assertEqual(paths.drafts(cfg),expected/'content/social/drafts')
        self.assertEqual(paths.drafts({'content_root':'.','social_folder':'content/social'}),expected/'content/social')

    def test_existing_vault_configs_remain_compatible(self):
        self.assertEqual(paths.social({'vault':'/tmp/vault'}),Path('/tmp/vault/001 Projects/Works/Social Posts'))
