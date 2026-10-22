import fcntl
from pathlib import Path
import tempfile
import threading
import unittest

from preparation_lock import acquire


class PreparationLockTests(unittest.TestCase):
    def test_scheduled_job_waits_for_poll_and_retains_exclusive_lock(self):
        with tempfile.TemporaryDirectory() as root:
            path = Path(root)/'runner.lock'
            with path.open('a') as poll, path.open('a') as scheduled, path.open('a') as other:
                fcntl.flock(poll, fcntl.LOCK_EX | fcntl.LOCK_NB)
                release = threading.Timer(0.05, fcntl.flock, (poll, fcntl.LOCK_UN))
                release.start()
                try:
                    acquire(scheduled, timeout=2, poll_interval=0.01)
                    with self.assertRaises(BlockingIOError):
                        fcntl.flock(other, fcntl.LOCK_EX | fcntl.LOCK_NB)
                finally:
                    release.join()
            with path.open('a') as next_job:
                acquire(next_job, timeout=0)

    def test_timeout_fails_without_replacing_or_unlocking_owner(self):
        with tempfile.TemporaryDirectory() as root:
            path = Path(root)/'runner.lock'
            with path.open('a') as owner, path.open('a') as scheduled:
                fcntl.flock(owner, fcntl.LOCK_EX | fcntl.LOCK_NB)
                inode = path.stat().st_ino
                with self.assertRaisesRegex(TimeoutError, 'preparation did not run'):
                    acquire(scheduled, timeout=0.02, poll_interval=0.005)
                self.assertEqual(path.stat().st_ino, inode)
                with self.assertRaises(BlockingIOError):
                    fcntl.flock(scheduled, fcntl.LOCK_EX | fcntl.LOCK_NB)
