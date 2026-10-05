from datetime import datetime, timedelta, timezone
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest

import sync_posting_dashboard as sync


def jpeg(seed, size=200):
    return b'\xff\xd8\xff' + bytes([seed]) * (size - 3)


def remote():
    namespace = {}
    exec(sync.STORE, namespace)
    return namespace['store']


class SyncTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 5, tzinfo=timezone.utc)
        self.later = (self.now + timedelta(days=3)).isoformat()
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name).resolve()

    def tearDown(self):
        self.tmp.cleanup()

    def image(self, name, data):
        path = self.dir/name
        path.write_bytes(data)
        return {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'width': 1080, 'height': 1350}, path

    def draft(self, **over):
        value = {'id': 'cm:0', 'platform': 'instagram', 'approval': 'unapproved', 'due_at': self.later,
                 'expires_at': self.later, 'media': {'mode': 'capture'}}
        value.update(over)
        return value

    def test_selects_only_current_instagram_images_and_verifies_hashes(self):
        good, good_path = self.image('good.jpg', jpeg(1))
        alt, alt_path = self.image('alt.jpg', jpeg(2))
        tampered, tampered_path = self.image('tampered.jpg', jpeg(3))
        tampered_path.write_bytes(jpeg(4))
        old, old_path = self.image('old.jpg', jpeg(5))
        x, x_path = self.image('x.jpg', jpeg(6))
        files = {r['sha256']: p for r, p in [(good, good_path), (alt, alt_path), (tampered, tampered_path), (old, old_path), (x, x_path)]}
        data = {'drafts': [
            self.draft(media={'image': good, 'candidates': [alt, tampered]}),
            self.draft(id='cm:1', expires_at='2026-10-01T00:00:00+00:00', media={'image': old}),
            self.draft(id='plan:0', platform='x', media={'image': x}),
        ]}
        chosen = sync.select_media(data, files, self.now)
        self.assertEqual(set(chosen), {good['sha256'], alt['sha256']})
        self.assertEqual(data['drafts'][0]['media']['candidates'], [alt])
        self.assertNotIn('image', data['drafts'][1]['media'])
        self.assertNotIn('image', data['drafts'][2]['media'])

    def test_size_and_total_caps(self):
        big, big_path = self.image('big.jpg', jpeg(1, sync.MAX_IMAGE + 1))
        data = {'drafts': [self.draft(media={'image': big})]}
        self.assertEqual(sync.select_media(data, {big['sha256']: big_path}, self.now), {})
        refs, files = [], {}
        for n in range(50):
            ref, path = self.image(f'{n}.jpg', jpeg(n, 890 * 1024))
            refs.append(ref)
            files[ref['sha256']] = path
        data = {'drafts': [self.draft(id=f'cm:{n}', media={'image': r}) for n, r in enumerate(refs)]}
        chosen = sync.select_media(data, files, self.now)
        self.assertLessEqual(sum(map(len, chosen.values())), sync.MAX_MEDIA_TOTAL)
        self.assertEqual(sum('image' in d['media'] for d in data['drafts']), len(chosen))

    def test_remote_store_writes_verified_media_then_snapshot_and_prunes(self):
        root = self.dir/'bundle'
        root.mkdir()
        (root/'posting.json').write_text('{}')
        (root/'posting-media').mkdir()
        stale = root/'posting-media'/('f' * 64 + '.jpg')
        stale.write_bytes(b'old')
        keep_other = root/'posting-media'/'README'
        keep_other.write_text('not managed')
        image = jpeg(9)
        sha = hashlib.sha256(image).hexdigest()
        snapshot = {'version': 1, 'publishing_enabled': False, 'drafts': [], 'runs': []}
        body, encoded = sync.payload(snapshot, {sha: image})
        receipt = remote()(root, io.BytesIO(body))
        self.assertEqual(receipt['media'], [sha])
        self.assertEqual(receipt['media_removed'], 1)
        self.assertEqual((root/'posting-media'/(sha + '.jpg')).read_bytes(), image)
        self.assertEqual((root/'posting.json').read_bytes(), encoded)
        self.assertFalse(stale.exists())
        self.assertTrue(keep_other.exists())

    def test_remote_store_rejects_bad_transfers(self):
        root = self.dir/'bundle'
        root.mkdir()
        (root/'posting.json').write_text('{}')
        image = jpeg(9)
        sha = hashlib.sha256(image).hexdigest()
        good = {'version': 1, 'publishing_enabled': False, 'drafts': [], 'runs': []}
        cases = []
        body, _ = sync.payload(good, {sha: image})
        cases.append(body.replace(image, jpeg(8)))  # hash mismatch
        cases.append(body + b'x')  # trailing data
        cases.append(body[:-5])  # truncated
        enabled, _ = sync.payload({**good, 'publishing_enabled': True}, {})
        cases.append(enabled)
        header = json.dumps({'snapshot': 10, 'media': [{'sha256': '../../etc/passwd', 'bytes': 3}]}).encode()
        cases.append(header + b'\n' + b'0' * 10)
        for case in cases:
            with self.assertRaises(Exception):
                remote()(root, io.BytesIO(case))
        self.assertEqual((root/'posting.json').read_text(), '{}')
        self.assertFalse((root/'posting-media').exists())
        outside = self.dir/'outside'
        outside.mkdir()
        (root/'posting-media').symlink_to(outside)
        with self.assertRaises(AssertionError):
            remote()(root, io.BytesIO(body))
        self.assertEqual(list(outside.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
