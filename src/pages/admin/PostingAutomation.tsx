import { useEffect, useState } from 'react';
import { getPostingDashboard, type PostingDashboard } from '@/lib/api';
import PostingShell from './PostingShell';

export default function PostingAutomation() {
  const [data, setData] = useState<PostingDashboard | null>(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
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
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return (
    <PostingShell title="Preparation automation">
      <p>
        Preparation creates drafts. Approval, scheduling and publication are tracked separately.
      </p>
      <button onClick={() => setRevision((v) => v + 1)}>Refresh automation</button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p className="studio-note">
            Snapshot: {new Date(data.generated_at).toLocaleString()} · {data.timezone}
            {data.stale ? ' · Stale' : ''}
          </p>
          <section className="posting-section">
            <h2>Runner schedule</h2>
            <div className="posting-cadence">
              {data.schedules.map((s) => (
                <article key={s.mode}>
                  <h3>{s.mode}</h3>
                  {s.calendar.map((c) => (
                    <p key={c}>{c}</p>
                  ))}
                </article>
              ))}
            </div>
          </section>
          <section className="posting-section">
            <h2>Open checks</h2>
            {data.checks.length ? (
              <ul className="posting-checks">
                {data.checks.map((c, i) => (
                  <li key={`${c.run_id}:${i}`}>{c.text}</li>
                ))}
              </ul>
            ) : (
              <p>No open checks in this snapshot.</p>
            )}
          </section>
          <div className="posting-history">
            <table>
              <caption>Recent preparation receipts</caption>
              <thead>
                <tr>
                  <th>Observed</th>
                  <th>Lane</th>
                  <th>Status</th>
                  <th>Drafts</th>
                </tr>
              </thead>
              <tbody>
                {data.runs.map((r, i) => (
                  <tr key={`${r.run_id}:${i}`}>
                    <td>{new Date(r.checked_at || r.observed_at).toLocaleString()}</td>
                    <td>{r.mode}</td>
                    <td>{r.status.replaceAll('_', ' ')}</td>
                    <td>{r.draft_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PostingShell>
  );
}
