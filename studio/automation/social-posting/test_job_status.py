from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest

import job_status


class JobStatusTests(unittest.TestCase):
    def test_each_job_keeps_its_own_entry_and_the_file_stays_private(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp)/'state'
            started = datetime(2026, 10, 14, 15, 0, tzinfo=timezone.utc)
            job_status.write(state, 'changemaker-instagram', 'success', run_id='r1', started=started, reason='2 draft(s)')
            job_status.write(state, 'changemaker-weekly', 'skipped', started=started, reason='already_prepared 2026-W42')
            job_status.write(state, 'changemaker-instagram', 'failed', run_id='r2', started=started, reason='x'*500)
            data = json.loads((state/'status.json').read_text())
            self.assertEqual(set(data['jobs']), {'changemaker-instagram', 'changemaker-weekly'})
            entry = data['jobs']['changemaker-instagram']
            self.assertEqual((entry['status'], entry['run_id'], entry['started']), ('failed', 'r2', started.isoformat()))
            self.assertEqual(len(entry['reason']), 300)
            self.assertTrue(entry['finished'])
            self.assertEqual((state/'status.json').stat().st_mode & 0o777, 0o600)
            self.assertEqual(job_status.read(state), data)
            with self.assertRaises(ValueError):
                job_status.write(state, 'x', 'running')
            (state/'status.json').write_text('not json')
            self.assertEqual(job_status.read(state), {})
            job_status.write(state, 'tweet-preparation', 'busy')
            self.assertEqual(list(job_status.read(state)['jobs']), ['tweet-preparation'])


if __name__ == '__main__':
    unittest.main()
