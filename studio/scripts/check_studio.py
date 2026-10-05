#!/usr/bin/env python3
"""Verify a disposable private Studio export against the approved Patrick sources."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from export_studio import ROOT, PACK, BRANDS, export


class StudioExportChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='studio-export-check-')
        cls.destination = Path(cls.temp.name)
        cls.catalog = export(cls.destination)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_approved_patrick_logos(self):
        brand = next(b for b in self.catalog['brands'] if b['slug'] == 'patrick__eff')
        selection = json.loads((BRANDS/'patrick__eff/logos/waveform/selection.json').read_text())
        files = self.catalog['files']
        exported = {files[key]['name']: key for key in brand['logos']}
        for slug in selection['approved_variations']:
            source = BRANDS/'patrick__eff/logos/waveform'/f'{slug}.svg'
            self.assertEqual(exported[f'{slug}.svg'], hashlib.sha256(source.read_bytes()).hexdigest())
        for slug in selection['unapproved_variations']:
            self.assertNotIn(f'{slug}.svg', exported)
        self.assertEqual(brand['tokens']['logo'], selection)
        self.assertIn('Software. Sound. Culture.', brand['guide'])

    def test_catalog_hashes_and_references(self):
        for key, row in self.catalog['files'].items():
            path = self.destination/row['path']
            self.assertEqual(path.parent, self.destination/'assets')
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), key)
            self.assertEqual(row['sha256'], key)
        for brand in self.catalog['brands']:
            for key in [brand['preview'], *brand['logos']]:
                self.assertIn(key, self.catalog['files'])
        for item in self.catalog['media']:
            self.assertIn(item['asset'], self.catalog['files'])
        references = json.loads((self.destination/'references.json').read_text())
        for entry in references['entries']:
            for key in [*entry['images'], *(item['asset'] for item in entry['attachments'])]:
                self.assertIn(key, self.catalog['files'])
            self.assertIn('guide', entry)
            self.assertNotIn('document', entry)

    def test_authored_history_survives_private_export(self):
        source = ROOT / 'references/curated/web-history'
        manifest = json.loads((source/'sources.json').read_text())
        references = json.loads((self.destination/'references.json').read_text())
        exported = {entry['id']: entry for entry in references['entries']}
        authored = json.loads((source/'catalog.json').read_text())['entries']
        self.assertEqual(len(authored), 8)
        self.assertEqual(len(exported), len(references['entries']))
        for entry in authored:
            document = ROOT/'references'/entry['document']
            self.assertEqual(hashlib.sha256(document.read_bytes()).hexdigest(),
                             manifest['authoredFiles'][entry['document']]['sha256'])
            self.assertEqual(exported[entry['id']]['guide'], document.read_text())
            self.assertEqual(exported[entry['id']]['collection'], 'Web history')
            self.assertEqual(exported[entry['id']]['images'], [])
            self.assertIn(exported[entry['id']]['attachments'][0]['asset'], self.catalog['files'])

    def test_asset_labels_preserve_identity_and_source_tags(self):
        for brand in self.catalog['brands']:
            for asset in brand['assets']:
                self.assertTrue(asset['title'])
                self.assertTrue(asset['tags'])
                self.assertEqual(asset['metadata_basis'], 'Source filename and folder')
                self.assertIn(asset['id'], self.catalog['files'])
        brand = next(b for b in self.catalog['brands'] if b['slug'] == 'subcult')
        outlined = next(a for a in brand['assets'] if a['name'] == 'logos/mark-light-outlined.svg')
        self.assertIn('Text converted to paths', outlined['tags'])
        self.assertIn('Light variant', outlined['tags'])
        self.assertEqual(outlined['title'], 'Brand mark light text converted to paths')
        originals = {a['id']: a for a in json.loads((ROOT/'media/catalog.json').read_text())['assets']}
        for media in self.catalog['media']:
            self.assertEqual(media['rights'], originals[media['id']]['rights'])
            self.assertEqual(media['status'], originals[media['id']]['status'])
            self.assertEqual(media['platforms'], originals[media['id']].get('platforms', []))

    def test_reference_taxonomy_covers_current_catalog_without_duplicate_tags(self):
        groups = json.loads((ROOT.parent/'api/internal/handlers/reference-taxonomy.json').read_text())
        tags = [tag['name'] for group in groups for tag in group['tags']]
        self.assertEqual(len(tags), len(set(tags)))
        entries = json.loads((self.destination/'references.json').read_text())['entries']
        self.assertTrue({tag for entry in entries for tag in entry['tags']}.issubset(set(tags)))

    def test_active_guides_and_text_sources_are_private_and_hash_addressed(self):
        brand = next(b for b in self.catalog['brands'] if b['slug'] == 'subcult')
        guide = next(a for a in brand['assets'] if a['name'] == 'GUIDE.md')
        self.assertEqual(guide['category'], 'documents')
        self.assertEqual(guide['status'], 'current')
        self.assertIn('captions.ass', {Path(a['name']).name for b in self.catalog['brands'] for a in b['assets']})
        self.assertTrue(self.catalog['documents'])
        for document in self.catalog['documents']:
            self.assertIn(document['asset'], self.catalog['files'])
            self.assertEqual(document['status'], 'source')
        self.assertIn('against-metrics.mdx', {d['name'] for d in self.catalog['documents']})

    def test_export_boundary(self):
        names = {row['name'] for row in self.catalog['files'].values()}
        self.assertNotIn('config.json', names)
        self.assertNotIn('logo-selection.json', names)
        self.assertNotIn('selection.json', names)
        self.assertEqual({p.name for p in self.destination.iterdir()}, {'catalog.json', 'posting.json', 'references.json', 'assets'})
        expected = {b['slug'] for b in json.loads((PACK/'brands.json').read_text())}
        self.assertEqual({b['slug'] for b in self.catalog['brands']}, expected)
        for destination in (ROOT/'content/disallowed-export', ROOT.parent/'public/studio', ROOT.parent/'src/studio', ROOT.parent):
            with self.subTest(destination=destination), self.assertRaises(ValueError):
                export(destination)


if __name__ == '__main__':
    unittest.main()
