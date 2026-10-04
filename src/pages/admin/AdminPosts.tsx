import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPostingDashboard, type PostingDashboard, type PostingDraft } from '@/lib/api';
import SocialDelivery from './SocialDelivery';
import AdminBlogPosts from './AdminBlogPosts';
import '@/styles/studio.css';

function postingDate(value: string, timezone: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Not recorded'
    : new Intl.DateTimeFormat('en-US', {
        timeZone: timezone || 'America/Chicago',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
}

export default function AdminPosts() {
  const [tab, setTab] = useState<'automation' | 'blog'>('automation');
  const [data, setData] = useState<PostingDashboard | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [revision, setRevision] = useState(0);
  const [account, setAccount] = useState('all');
  const [lane, setLane] = useState('all');
  const [query, setQuery] = useState('');
  const [includeExpired, setIncludeExpired] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<PostingDraft | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    getPostingDashboard()
      .then((value) => {
        if (active) {
          setData(value);
          setError('');
          setRefreshing(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setRefreshing(false);
        }
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const refresh = () => {
    setRefreshing(true);
    setRevision((value) => value + 1);
  };
  const drafts =
    data?.drafts
      .filter(
        (d) =>
          (includeExpired || !d.expires_at || new Date(d.expires_at).valueOf() > now) &&
          (account === 'all' || d.account === account) &&
          (lane === 'all' || d.mode === lane) &&
          `${d.text} ${d.next_check}`.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a.due_at.localeCompare(b.due_at)) ?? [];
  const expired = (expires: string) => Boolean(expires && new Date(expires).valueOf() <= now);
  const open = drafts.filter((d) => !expired(d.expires_at));
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Draft copied. It remains unapproved.');
    } catch {
      setCopyStatus('Copy failed. Select the draft text to copy it.');
    }
  };
  return (
    <section className="studio-page posting-page" aria-labelledby="posting-heading">
      <header className="production-heading">
        <div>
          <p className="studio-label">SUBCULT / POSTING OPERATIONS</p>
          <h1 id="posting-heading">Posts</h1>
          <p>Prepared drafts, their review status and open checks.</p>
        </div>
        <button onClick={refresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh dashboard'}
        </button>
      </header>
      <div className="production-rail">
        <div className="studio-switch">
          <button aria-pressed={tab === 'automation'} onClick={() => setTab('automation')}>
            Automation dashboard
          </button>
          <button aria-pressed={tab === 'blog'} onClick={() => setTab('blog')}>
            Site articles
          </button>
        </div>
        <Link to="/admin/studio">Brand & asset library →</Link>
      </div>
      {tab === 'blog' ? (
        <div className="site-articles">
          <AdminBlogPosts />
        </div>
      ) : (
        <>
          <div className="posting-boundary">
            <strong>Review before scheduling</strong>
            <span>
              Prepared drafts remain unapproved. Approve each Instagram post below to schedule
              delivery through Postiz.
            </span>
          </div>
          <SocialDelivery
            key={selectedDraft?.id || 'new-post'}
            draft={selectedDraft}
            revision={revision}
          />
          {error && (
            <div className="production-notice" role="alert">
              <p>{error}</p>
              <button onClick={refresh}>Retry connection</button>
              {data && <p>The last loaded snapshot remains visible.</p>}
            </div>
          )}
          {!data ? (
            !error && <p role="status">Loading posting dashboard…</p>
          ) : (
            <>
              <p className="studio-note">
                Snapshot: {postingDate(data.generated_at, data.timezone)} · {data.timezone}{' '}
                {data.stale ? '· STALE: more than 24 hours old' : ''}. Refresh reloads the exported
                snapshot.
              </p>
              {!data.connected && (
                <div className="production-notice">
                  <h2>Runner state is not connected</h2>
                  <p>
                    Connect an exported posting snapshot to show draft copy and run history. The
                    configured preparation schedule is shown below.
                  </p>
                </div>
              )}
              <div className="posting-pipeline" aria-label="Posting stages">
                <div>
                  <span>01 / Prepared</span>
                  <strong>{open.length}</strong>
                  <small>Unexpired drafts in this view</small>
                </div>
                <div>
                  <span>02 / Approval</span>
                  <strong>Review needed</strong>
                  <small>All prepared copy is unapproved</small>
                </div>
                <div>
                  <span>03 / Scheduled</span>
                  <strong>Postiz queue</strong>
                  <small>Live status appears above</small>
                </div>
                <div>
                  <span>04 / Delivered</span>
                  <strong>Unverified</strong>
                  <small>No delivery receipts connected</small>
                </div>
              </div>
              <section className="posting-section" aria-labelledby="jobs-heading">
                <div className="production-section-title">
                  <p className="studio-label">01 / PREPARATION</p>
                  <h2 id="jobs-heading">Runner & cadence</h2>
                </div>
                <div className="posting-lanes">
                  {data.schedules.map((schedule) => {
                    const run = data.runs.find((r) => r.mode === schedule.mode);
                    return (
                      <article key={schedule.mode}>
                        <p className="studio-label">
                          {schedule.mode === 'plan'
                            ? 'Weekly planning'
                            : schedule.mode === 'radar'
                              ? 'Timely discovery'
                              : schedule.mode === 'changemaker'
                                ? 'Changemaker / Instagram'
                                : 'Publishing review'}
                        </p>
                        <h3>{run?.status.replaceAll('_', ' ') || 'No receipt'}</h3>
                        <p>
                          {run
                            ? `${run.draft_count ?? 0} drafts · ${postingDate(run.checked_at || run.observed_at, data.timezone)}`
                            : 'No run observation available.'}
                        </p>
                        <details>
                          <summary>Configured timer</summary>
                          {schedule.calendar.map((calendar) => (
                            <p key={calendar}>
                              <code>{calendar}</code>
                            </p>
                          ))}
                          <p>Configuration describes intended starts, not live timer health.</p>
                        </details>
                      </article>
                    );
                  })}
                </div>
                <div className="posting-cadence">
                  {data.accounts.map((item) => (
                    <div key={item.account}>
                      <strong>{item.account}</strong>
                      <span>
                        {item.times.join(' / ')} · up to {item.weekly_cap}/week
                      </span>
                    </div>
                  ))}
                </div>
                <p className="studio-note">
                  Weekly pilot starts {data.first_week}. All cadence times use {data.timezone}.
                </p>
              </section>
              <section className="posting-section" aria-labelledby="drafts-heading">
                <div className="production-section-title">
                  <p className="studio-label">02 / EDITORIAL QUEUE</p>
                  <h2 id="drafts-heading">
                    Prepared drafts <span className="production-badge">{drafts.length}</span>
                  </h2>
                </div>
                <div className="studio-tools">
                  <label>
                    Account
                    <select value={account} onChange={(e) => setAccount(e.target.value)}>
                      <option value="all">All accounts</option>
                      {data.accounts.map((a) => (
                        <option key={a.account}>{a.account}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Preparation lane
                    <select value={lane} onChange={(e) => setLane(e.target.value)}>
                      <option value="all">All lanes</option>
                      <option value="plan">Weekly</option>
                      <option value="radar">Timely</option>
                      <option value="changemaker">Changemaker / Instagram</option>
                    </select>
                  </label>
                  <label>
                    Search copy
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Copy or next check"
                    />
                  </label>
                </div>
                <label className="studio-note">
                  <input
                    type="checkbox"
                    checked={includeExpired}
                    onChange={(e) => setIncludeExpired(e.target.checked)}
                  />{' '}
                  Include expired drafts
                </label>
                <p role="status" className="studio-note">
                  {copyStatus}
                </p>
                {drafts.length === 0 ? (
                  <div className="posting-empty">
                    {data.drafts.length
                      ? 'No drafts match these filters.'
                      : 'No prepared drafts in this snapshot.'}
                  </div>
                ) : (
                  <div className="posting-drafts">
                    {drafts.map((d) => (
                      <article key={d.id}>
                        <div className="posting-draft-meta">
                          <span className="production-badge">
                            {d.account} /{' '}
                            {d.mode === 'changemaker'
                              ? 'Changemaker · Instagram'
                              : d.mode === 'radar'
                                ? 'Timely'
                                : 'Weekly'}
                          </span>
                          <span>{expired(d.expires_at) ? 'Expired' : 'Unapproved'}</span>
                        </div>
                        <p className="posting-copy">{d.text}</p>
                        <p className="studio-note">
                          Proposed: {postingDate(d.due_at, data.timezone)}
                          {d.expires_at &&
                            ` · Expires: ${postingDate(d.expires_at, data.timezone)}`}
                        </p>
                        <div className="posting-next-check">
                          <strong>Next check</strong>
                          <p>{d.next_check || 'Review copy and evidence before posting.'}</p>
                        </div>
                        <details>
                          <summary>Evidence & media requirements</summary>
                          <p>{d.evidence || 'No evidence description recorded.'}</p>
                          <p>
                            Media: {d.media.mode || 'Not recorded'}
                            {d.media.asset_ids?.length ? ` · ${d.media.asset_ids.join(', ')}` : ''}
                          </p>
                          {d.media.brief && <p>{d.media.brief}</p>}
                          {d.media.alt_text && <p>Alt text: {d.media.alt_text}</p>}
                          <p className="studio-note">Run {d.run_id}</p>
                        </details>
                        <button onClick={() => copy(d.text)}>Copy draft</button>
                        <button
                          disabled={expired(d.expires_at)}
                          onClick={() => {
                            setSelectedDraft(d);
                            document
                              .getElementById('delivery-heading')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Review for Instagram
                        </button>
                        <Link to="/admin/studio">Find media →</Link>
                      </article>
                    ))}
                  </div>
                )}
              </section>
              <section className="posting-section" aria-labelledby="review-heading">
                <div className="production-section-title">
                  <p className="studio-label">03 / FOLLOW-UP</p>
                  <h2 id="review-heading">Open checks & run history</h2>
                </div>
                {data.checks.length ? (
                  <ul className="posting-checks">
                    {data.checks.map((check, i) => (
                      <li key={`${check.run_id}:${i}`}>{check.text}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No open checks recorded in this snapshot.</p>
                )}
                <div className="posting-history">
                  <table>
                    <caption>Recent preparation receipts</caption>
                    <thead>
                      <tr>
                        <th>Observed</th>
                        <th>Lane</th>
                        <th>Status</th>
                        <th>Drafts</th>
                        <th>Week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.runs.map((run, i) => (
                        <tr key={`${run.run_id}:${i}`}>
                          <td>{postingDate(run.checked_at || run.observed_at, data.timezone)}</td>
                          <td>{run.mode}</td>
                          <td>{run.status.replaceAll('_', ' ')}</td>
                          <td>{run.draft_count ?? '—'}</td>
                          <td>{run.week || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.runs.length === 0 && <p>No receipts recorded.</p>}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </section>
  );
}
