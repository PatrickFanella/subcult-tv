"""Exercise the delivered starter pack rather than regenerating production brands."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

STARTER = Path(__file__).resolve().parents[1] / 'brand-tools/starter-template'


class MarketingStarterTests(unittest.TestCase):
    def test_generated_packet_is_portable_and_hash_addressed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            config = json.loads((STARTER/'brand.json').read_text())
            config.update(name='Example Workshop', initials='EW', website='https://example.test')
            (root/'brand.json').write_text(json.dumps(config))
            output = root/'pack'
            result = subprocess.run([sys.executable, str(STARTER/'bootstrap.py'),
                str(root/'brand.json'), str(output)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            context = (output/'marketing/context.md').read_text()
            self.assertIn('# Example Workshop marketing context', context)
            self.assertIn('Example Workshop — https://example.test', context)
            self.assertIn('../tokens.json', context)
            self.assertIn('{{WHO_HAS_THE_PROBLEM_AND_WHEN}}', context)
            self.assertIn('[prompts.md](prompts.md)', (output/'marketing/README.md').read_text())
            self.assertIn('marketing/README.md', (output/'GUIDE.md').read_text())
            files = {r['path']:r for r in json.loads((output/'asset-manifest.json').read_text())['files']}
            for name in ['README.md', 'context.md', 'packet.md', 'prompts.md', 'provenance.json']:
                relative = 'marketing/'+name
                data = (output/relative).read_bytes()
                self.assertEqual(files[relative]['sha256'], hashlib.sha256(data).hexdigest())
                self.assertEqual(files[relative]['bytes'], len(data))
            # A second generation cannot overwrite the completed packet.
            sentinel = output/'marketing/context.md'
            sentinel.write_text('Reviewed user content')
            retry = subprocess.run([sys.executable, str(STARTER/'bootstrap.py'),
                str(root/'brand.json'), str(output)], capture_output=True, text=True)
            self.assertNotEqual(retry.returncode, 0)
            self.assertEqual(sentinel.read_text(), 'Reviewed user content')


if __name__ == '__main__':
    unittest.main()
