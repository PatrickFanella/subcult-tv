import { useEffect, useState } from 'react';
import { getPostingDashboard, type PostingDashboard } from '@/lib/api';
import {
  chicagoTime,
  describeCalendar,
  jobName,
  jobStatusLabel,
  laneName,
  runLabel,
  runStatusLabel,
} from '@/lib/review-queue';
import PostingShell from './PostingShell';

function readable(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PostingAutomation() {
  const [data, setData] = useState<PostingDashboard | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getPostingDashboard()
      .then((d) => {
        if (active) {
          setData(d);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  // Notes grouped by the run that wrote them, newest run first.
  const notes = new Map<string, string[]>();
  for (const c of data?.checks ?? []) notes.set(c.run_id, [...(notes.get(c.run_id) ?? []), c.text]);
  const runs = [...notes].sort((a, b) => b[0].localeCompare(a[0]));
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <PostingShell
      title="Automation"
      description="These jobs write drafts on Kvant. They never post anything: every post still needs your approval on the Review page."
      action={
        <button
          type="button"
          className="admin-button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setRevision((v) => v + 1);
          }}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      }
    >
      {error && (
        <p role="alert" className="admin-alert admin-alert-error">
          {error}
        </p>
      )}
      {data && (
        <>
          <p className={`admin-count${data.stale ? ' admin-alert admin-alert-warning' : ''}`}>
            Last synced from Kvant {readable(data.generated_at)}
            {data.stale ? ' · More than a day old: the sync job may have stopped' : ''}. Times are
            in your time zone ({zone}).
          </p>
          <section className="posting-section">
            <h2>When each job runs</h2>
            <div className="posting-cadence">
              {data.schedules.map((s) => (
                <article key={s.mode}>
                  <h3>{laneName(s.mode)}</h3>
                  {s.calendar.map((c) => (
                    <p key={c} title={c}>
                      {describeCalendar(c)}
                    </p>
                  ))}
                </article>
              ))}
            </div>
            <p className="studio-note">
              The daily website and Patreon drafts run as a separate job and are not listed here
              yet.
            </p>
          </section>
          <section className="posting-section" id="job-health">
            <h2>Preparation jobs</h2>
            {data.job_status && data.job_status.length > 0 ? (
              <div className="posting-history">
                <table className="stack-table">
                  <caption className="sr-only">Last outcome of each preparation job</caption>
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Last status</th>
                      <th>Finished (Chicago)</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.job_status.map((j) => (
                      <tr key={j.job} data-job-status={j.status}>
                        <td data-label="Job">{jobName(j.job)}</td>
                        <td data-label="Last status">
                          <span
                            className={`admin-status ${j.status === 'failed' ? 'is-warn' : j.status === 'success' ? 'is-live' : 'is-muted'}`}
                          >
                            {jobStatusLabel(j.status)}
                          </span>
                        </td>
                        <td data-label="Finished (Chicago)">{chicagoTime(j.finished)}</td>
                        <td data-label="Reason">{j.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="studio-note">
                  Each job records its own outcome when it exits. A failed run names the error type;
                  the log on Kvant has the details. Success means drafts were prepared or nothing
                  needed drafting, never that anything was posted.
                </p>
              </div>
            ) : (
              <p className="studio-note">
                This snapshot has no job health yet. It appears after the jobs run with the current
                Studio export.
              </p>
            )}
          </section>
          <section className="posting-section" id="run-notes">
            <h2>Notes from the drafting runs</h2>
            <p className="studio-note">
              Each run lists things a person should verify before approving its drafts: claims to
              recheck, schedule conflicts, sources it could not confirm. They are reminders, not
              tasks the system tracks, and they do not block anything.
            </p>
            {runs.length ? (
              runs.map(([run, items], index) => (
                <details key={run} open={index === 0}>
                  <summary>
                    {runLabel(run)} · {items.length} {items.length === 1 ? 'note' : 'notes'}
                  </summary>
                  <ul className="posting-checks">
                    {items.map((text, i) => (
                      <li key={i}>{text}</li>
                    ))}
                  </ul>
                </details>
              ))
            ) : (
              <p className="studio-note">No notes in this snapshot.</p>
            )}
          </section>
          <section className="posting-section">
            <h2>Recent runs</h2>
            <div className="posting-history">
              <table className="stack-table">
                <caption className="sr-only">Recent runs</caption>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Job</th>
                    <th>Result</th>
                    <th>Drafts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.runs.map((r, i) => (
                    <tr key={`${r.run_id}:${i}`}>
                      <td data-label="When">{readable(r.checked_at || r.observed_at)}</td>
                      <td data-label="Job">{laneName(r.mode)}</td>
                      <td data-label="Result">{runStatusLabel(r.status)}</td>
                      <td data-label="Drafts">{r.draft_count ?? '—'}</td>
                    </tr>
                  ))}
                  {data.runs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="admin-table-empty">
                        No runs recorded in this snapshot.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="studio-note">
                A job that crashes before writing a result does not appear here. Check its log on
                Kvant if a lane goes quiet.
              </p>
            </div>
          </section>
        </>
      )}
    </PostingShell>
  );
}
