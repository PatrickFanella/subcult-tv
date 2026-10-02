#!/usr/bin/env python3
"""Verify a disposable private Studio export against the approved Patrick sources."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from export_studio import ROOT, PACK, export


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
        selection = json.loads((PACK/'brands/patrick__eff/logos/waveform/selection.json').read_text())
        files = self.catalog['files']
        exported = {files[key]['name']: key for key in brand['logos']}
        for slug in selection['approved_variations']:
            source = PACK/'brands/patrick__eff/logos/waveform'/f'{slug}.svg'
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

    def test_export_boundary(self):
        names = {row['name'] for row in self.catalog['files'].values()}
        self.assertNotIn('config.json', names)
        self.assertNotIn('logo-selection.json', names)
        self.assertNotIn('selection.json', names)
        self.assertEqual({p.name for p in self.destination.iterdir()}, {'catalog.json', 'posting.json', 'assets'})
        expected = {b['slug'] for b in json.loads((PACK/'brands.json').read_text())}
        self.assertEqual({b['slug'] for b in self.catalog['brands']}, expected)
        with self.assertRaises(ValueError):
            export(ROOT/'content/disallowed-export')


if __name__ == '__main__':
    unittest.main()
