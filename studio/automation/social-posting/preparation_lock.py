"""Bounded lock waiting for scheduled preparation jobs."""
import fcntl
import time


def acquire(lock, timeout=600, poll_interval=0.25):
    """Wait through brief request-worker polls; fail visibly on a stuck runner."""
    deadline = time.monotonic() + timeout
    while True:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return
        except BlockingIOError:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError('Social preparation lock remained busy for '
                                   f'{timeout} seconds; preparation did not run') from None
            time.sleep(min(poll_interval, remaining))
