"""Keep portfolio coverage and selected source provenance checked with Studio."""
import hashlib
import json
from pathlib import Path
import re
import unittest

STUDIO = Path(__file__).resolve().parents[1]


class MarketingStrategies(unittest.TestCase):
    def test_every_catalogue_project_has_a_strategy_with_a_bounded_action(self):
        pack = json.loads((STUDIO/'content/marketing/strategies.json').read_text())
        products = pack['projects']
        catalogue = set(re.findall(r"slug: '([^']+)'", (STUDIO.parent/'src/lib/showcase.ts').read_text()))
        self.assertLessEqual(catalogue, {p['catalog_slug'] for p in products.values()})
        for slug, project in products.items():
            with self.subTest(product=slug):
                self.assertTrue(project['cta']['url'].startswith('https://'))
                self.assertNotIn('git.subcult.tv', project['cta']['url'])
                for key in ('audience_hypothesis', 'positioning', 'first_use_check', 'limits', 'measurement', 'claim_ids'):
                    self.assertTrue(project[key])
                self.assertEqual(len({p['id'] for p in project['pillars']}), len(project['pillars']))

    def test_every_strategy_has_a_selected_packet_and_complete_source_inventory(self):
        root = STUDIO/'content/marketing'
        projects = json.loads((root/'strategies.json').read_text())['projects']
        selected = json.loads((root/'packets.json').read_text())['projects']
        inventory = json.loads((root/'source-inventory-2026-10-21.json').read_text())['projects']
        self.assertEqual(set(projects), set(selected))
        self.assertEqual(set(projects), set(inventory))
        self.assertTrue(all(r['status'] == 'inspected' for r in inventory.values()))
        for entry in selected.values():
            for record in entry['files'] + entry.get('fallback', []):
                self.assertEqual(hashlib.sha256((root/record['path']).read_bytes()).hexdigest(), record['sha256'])
        self.assertIn('upstream', selected['clpr'])
        self.assertIn('upstream', selected['subsets'])

    def test_selected_packet_sources_keep_their_exact_bytes(self):
        root = STUDIO/'content/marketing/sources'
        for source in json.loads((root/'manifest.json').read_text()):
            self.assertEqual(hashlib.sha256((root/source['file']).read_bytes()).hexdigest(), source['sha256'])
