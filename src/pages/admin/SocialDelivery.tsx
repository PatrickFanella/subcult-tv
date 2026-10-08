import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadProblem } from '@/lib/review-queue';
import {
  approveSocialSchedule,
  getSocialDelivery,
  type PostingDraft,
  type SocialDelivery as Delivery,
} from '@/lib/api';

export default function SocialDelivery({
  draft,
  revision,
  historyOnly = false,
}: {
  draft: PostingDraft | null;
  revision: number;
  historyOnly?: boolean;
}) {
  const [data, setData] = useState<Delivery | null>(null);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [account, setAccount] = useState('');
  const [caption, setCaption] = useState(draft?.text || '');
  const [due, setDue] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requestID, setRequestID] = useState(() => crypto.randomUUID());
  const [reload, setReload] = useState(0);
  const [uncertain, setUncertain] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [preview, setPreview] = useState('');
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  useEffect(() => {
    let active = true;
    const refresh = () =>
      getSocialDelivery()
        .then((result) => {
          if (active) {
            setData(result);
            setError('');
          }
        })
        .catch((err) => {
          if (active) {
            setData(null);
            setError(err.message);
          }
        });
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [reload, revision]);
  const changed = () => {
    setApproved(false);
    setRequestID(crypto.randomUUID());
    setReceipt('');
  };
  const timeProblem = leadProblem(new Date(due).valueOf(), now);
  const validTime = !timeProblem;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!media || !approved || !validTime || busy || uncertain) return;
    setBusy(true);
    setError('');
    setReceipt('');
    const form = new FormData();
    form.set('request_id', requestID);
    form.set('account_id', account);
    form.set('caption', caption);
    form.set('due_at', new Date(due).toISOString());
    form.set('approved', 'true');
    form.set('media', media);
    try {
      const result = await approveSocialSchedule(form);
      setReceipt(`Scheduled in PostyBirb · ${result.post_id}. Delivery is still pending.`);
      setApproved(false);
      setReload((n) => n + 1);
      // Keep this request ID for a safe repeat; editing starts a new approval.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scheduling could not be confirmed');
      // A transport failure or provider error may have accepted the post.
      if (!(
        err instanceof Error &&
        'status' in err &&
        [400, 403, 503].includes(Number(err.status))
      ))
        setUncertain(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="posting-section" aria-labelledby="delivery-heading">
      <div className="production-section-title">
        <p className="studio-label">POSTYBIRB / INSTAGRAM</p>
        <h2 id="delivery-heading">Scheduling & delivery</h2>
      </div>
      <p>
        Every post requires your approval. Choose any future publish time within 90 days. Displayed
        times use your browser’s timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}.
      </p>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={() => setReload((n) => n + 1)} disabled={busy}>
        Refresh delivery status
      </button>{' '}
      <a href="https://postybirb.subcult.tv" target="_blank" rel="noreferrer">
        Manage or cancel in PostyBirb ↗
      </a>
      {data && (
        <>
          <p className="studio-note">
            Checked {new Date(data.checked_at).toLocaleString()} · {data.accounts.length} Instagram
            accounts
          </p>
          {!historyOnly && (
            <form className="social-composer" onSubmit={submit} aria-label="Approve Instagram post">
              <label>
                Instagram account
                <select
                  value={account}
                  onChange={(e) => {
                    setAccount(e.target.value);
                    changed();
                  }}
                  disabled={busy || uncertain}
                  required
                >
                  <option value="">Choose an account</option>
                  {data.accounts.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.disabled}>
                      {a.profile || a.name}
                      {a.disabled ? ' · Disabled' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Instagram caption
                <textarea
                  value={caption}
                  maxLength={2200}
                  rows={5}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    changed();
                  }}
                  disabled={busy || uncertain}
                  required
                />
              </label>
              {draft && (
                <p className="studio-note">
                  Prepared for {draft.account}. Review its evidence and next check before approving:{' '}
                  {draft.next_check || 'Review caption and media.'}
                </p>
              )}
              <label>
                JPEG image
                <input
                  type="file"
                  accept="image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setMedia(file);
                    setPreview(file ? URL.createObjectURL(file) : '');
                    changed();
                  }}
                  disabled={busy || uncertain}
                  required
                />
              </label>
              <p className="studio-note">
                One JPEG under 900 KB, 320–1440 pixels wide, aspect ratio 4:5 to 1.91:1. Approval
                makes this image accessible to Instagram for delivery.
              </p>
              {preview && (
                <img
                  src={preview}
                  alt="Image selected for this Instagram post"
                  style={{ maxWidth: '100%', maxHeight: '24rem', objectFit: 'contain' }}
                />
              )}
              {media && (
                <p>
                  Selected: {media.name} · {Math.ceil(media.size / 1024)} KB
                </p>
              )}
              <label>
                Publish time
                <input
                  type="datetime-local"
                  value={due}
                  onChange={(e) => {
                    setDue(e.target.value);
                    changed();
                  }}
                  disabled={busy || uncertain}
                  required
                />
              </label>
              {due && !validTime && <p role="alert">{timeProblem}</p>}
              <label className="social-approval">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  disabled={busy || uncertain}
                />{' '}
                I approve this caption, image, account and publish time.
              </label>
              <button
                type="submit"
                disabled={
                  !approved ||
                  !validTime ||
                  !account ||
                  !caption.trim() ||
                  !media ||
                  media.size > 900 * 1024 ||
                  busy ||
                  uncertain
                }
              >
                {busy ? 'Scheduling…' : 'Approve & schedule'}
              </button>
              {uncertain && (
                <p role="alert">
                  Check PostyBirb to reconcile this submission before starting another approval.
                  Reload this page only after checking.
                </p>
              )}
              {receipt && <p role="status">{receipt}</p>}
            </form>
          )}
          <div className="posting-history">
            <table>
              <caption>PostyBirb history: previous 30 days and next 90 days</caption>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Publish time</th>
                  <th>Status</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {data.posts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.integration.name}</td>
                    <td>{new Date(p.publishDate).toLocaleString()}</td>
                    <td>
                      {p.state === 'PUBLISHED'
                        ? 'Published'
                        : p.state === 'QUEUE'
                          ? 'Scheduled'
                          : p.state === 'ERROR'
                            ? 'Failed'
                            : p.state}
                    </td>
                    <td>
                      {p.releaseURL && p.state === 'PUBLISHED' ? (
                        <a href={p.releaseURL} target="_blank" rel="noreferrer">
                          View Instagram post ↗
                        </a>
                      ) : p.state === 'QUEUE' ? (
                        <Link to={`/admin/posts?post=${encodeURIComponent(p.id)}`}>
                          Edit or reschedule
                        </Link>
                      ) : (
                        'No published link'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.posts.length === 0 && <p>No PostyBirb posts in this window.</p>}
          </div>
        </>
      )}
    </section>
  );
}
