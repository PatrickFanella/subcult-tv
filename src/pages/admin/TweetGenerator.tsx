import { useEffect, useRef, useState } from 'react';
import { getTweetRequests, requestTweet, type TweetRequest } from '@/lib/api';

const pending = (job: TweetRequest) => job.status === 'pending' || job.status === 'running';

export default function TweetGenerator({
  accounts,
  onReady,
  onPrepared,
  reviewableDrafts,
}: {
  accounts: string[];
  onReady: (id: string) => void;
  onPrepared: () => void;
  reviewableDrafts: string[];
}) {
  const [account, setAccount] = useState('');
  const [note, setNote] = useState('');
  const [jobs, setJobs] = useState<TweetRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const seen = useRef(new Map<number, string>());
  const prepared = useRef(onPrepared);
  useEffect(() => {
    prepared.current = onPrepared;
  }, [onPrepared]);
  useEffect(() => {
    let active = true;
    getTweetRequests()
      .then((value) => {
        if (!active) return;
        for (const job of value) {
          const before = seen.current.get(job.id);
          seen.current.set(job.id, job.status);
          if (before && before !== 'done' && job.status === 'done') prepared.current();
        }
        setJobs(value);
        setError('');
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Tweet requests are unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const waiting = jobs.some(pending);
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => setRevision((v) => v + 1), 10000);
    return () => clearInterval(timer);
  }, [waiting]);
  const selected = accounts.includes(account) ? account : accounts[0] || '';
  const preparing = jobs.some((job) => job.account === selected && pending(job));
  async function generate() {
    setBusy(true);
    setError('');
    try {
      const job = await requestTweet(selected, note.trim());
      seen.current.set(job.id, job.status);
      setJobs((current) => [job, ...current.filter((j) => j.id !== job.id)]);
      setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The tweet request could not be queued.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="tweet-generator" aria-labelledby="tweet-generator-heading">
      <h2 id="tweet-generator-heading">Generate a tweet</h2>
      <p>
        Choose an account and optionally a topic. The draft uses its voice and the available source
        material, then appears here for review.
      </p>
      <form
        className="tweet-generator-form"
        aria-label="Generate a tweet"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <label>
          Tweet account
          <select
            value={selected}
            onChange={(e) => setAccount(e.target.value)}
            disabled={busy || !accounts.length}
          >
            {!accounts.length && <option value="">No preparation accounts available</option>}
            {accounts.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic or direction (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            rows={2}
            disabled={busy}
            placeholder="Leave blank to choose from the available sources"
          />
        </label>
        <button
          type="submit"
          className="admin-button admin-button-primary"
          disabled={busy || loading || preparing || !selected}
        >
          {busy ? 'Requesting…' : preparing ? 'Preparing a tweet…' : 'Generate tweet'}
        </button>
      </form>
      {error && (
        <p role="alert" className="admin-alert admin-alert-error">
          {error}
        </p>
      )}
      <button
        type="button"
        className="admin-button"
        onClick={() => {
          setLoading(true);
          setRevision((v) => v + 1);
        }}
        disabled={busy || loading}
      >
        Refresh requests
      </button>
      {jobs.length > 0 && (
        <ul className="tweet-request-list" aria-label="Recent tweet requests" aria-live="polite">
          {[...jobs.filter(pending), ...jobs.filter((job) => !pending(job)).slice(0, 6)].map(
            (job) => (
              <li key={job.id}>
                <strong>{job.account}</strong> ·{' '}
                {job.status === 'pending'
                  ? 'Waiting to start'
                  : job.status === 'running'
                    ? 'Writing your tweet'
                    : job.status === 'done'
                      ? reviewableDrafts.includes(job.result_draft_id)
                        ? 'Ready for review'
                        : 'Draft prepared'
                      : 'Preparation failed'}
                {job.status === 'done' && reviewableDrafts.includes(job.result_draft_id) && (
                  <button
                    type="button"
                    className="admin-button"
                    onClick={() => onReady(job.result_draft_id)}
                  >
                    Review tweet
                  </button>
                )}
                {job.status === 'failed' && <p>{job.error}</p>}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
