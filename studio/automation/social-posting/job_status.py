"""One small `state/status.json` with the last outcome of every preparation job.

Each job writes its own entry on exit: success, failed, busy or skipped, with the
run ID, start and finish times and a short reason. Existing receipts are unchanged;
this file only lets the dashboard show last-run health per job. Reasons must be
owner-facing text or an exception type name, never raw error text or local paths.
"""
from datetime import datetime, timezone
import fcntl
import json
from pathlib import Path

FILE = 'status.json'
STATUSES = ('success', 'failed', 'busy', 'skipped')


def read(state):
    path = Path(state)/FILE
    if not path.is_file() or path.is_symlink() or path.stat().st_size > 256_000:
        return {}
    try:
        data = json.loads(path.read_text())
    except (ValueError, OSError):
        return {}
    return data if isinstance(data, dict) else {}


def write(state, job, status, run_id=None, started=None, reason=None, finished=None):
    """Record one job's last outcome; other jobs' entries are kept."""
    from runner import atomic_write
    if status not in STATUSES:
        raise ValueError('Unknown job status')
    state = Path(state)
    state.mkdir(parents=True, exist_ok=True)
    finished = finished or datetime.now(timezone.utc)
    entry = {'job': job, 'status': status, 'run_id': run_id,
             'started': started.isoformat() if isinstance(started, datetime) else started,
             'finished': finished.isoformat() if isinstance(finished, datetime) else finished,
             'reason': (reason or '')[:300]}
    # Jobs hold different preparation locks, so the file has its own small lock.
    with (state/'status.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        data = read(state)
        jobs = data.get('jobs') if isinstance(data.get('jobs'), dict) else {}
        jobs[job] = entry
        atomic_write(state/FILE, json.dumps({'version': 1, 'jobs': jobs}, indent=2)+'\n')
    return entry
