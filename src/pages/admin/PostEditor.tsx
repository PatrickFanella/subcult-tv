import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getPostingDashboard,
  getReviewDrafts,
  getSocialDelivery,
  saveReviewDraft,
  type PostingDraft,
  type ReviewDraft,
  type SocialAccount,
} from '@/lib/api';
import PostingShell from './PostingShell';
import PostPreview from './PostPreview';

function localDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export default function PostEditor() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const draftID = params.get('draft') || '';
  const [draft, setDraft] = useState<PostingDraft | null>(null);
  const [saved, setSaved] = useState<ReviewDraft | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [caption, setCaption] = useState('');
  const [account, setAccount] = useState('');
  const [due, setDue] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([getPostingDashboard(), getReviewDrafts(), getSocialDelivery()])
      .then(([data, edits, delivery]) => {
        if (!active) return;
        const d = data.drafts.find((d) => d.id === draftID);
        if (!d) throw new Error('Draft not found. Return to Review and refresh.');
        const edit = edits.find((e) => e.draft_id === draftID) || null;
        if (edit && edit.status !== 'draft')
          throw new Error('This draft has already been submitted. Manage it in PostyBirb.');
        setDraft(d);
        setSaved(edit);
        setCaption(edit?.caption || d.text);
        setAccounts(delivery.accounts);
        setAccount(edit?.account_id || '');
        setDue(localDate(edit?.due_at || d.due_at));
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [draftID]);
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image);
    },
    [image],
  );
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.set('version', String(saved?.version || 0));
      form.set('account_id', account);
      form.set('caption', caption);
      form.set('due_at', new Date(due).toISOString());
      if (media) form.set('media', media);
      await saveReviewDraft(draftID, form);
      navigate('/admin/posts');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save draft');
    } finally {
      setBusy(false);
    }
  }
  const target = accounts.find((a) => a.id === account);
  return (
    <PostingShell title="Edit Instagram draft">
      <Link to="/admin/posts">← Back to review</Link>
      <p>
        Save your changes, then approve the rendered card in Review. Saving keeps this post
        unapproved.
      </p>
      {error && <p role="alert">{error}</p>}
      {draft && (
        <div className="posting-editor-grid">
          <form className="social-composer" onSubmit={save} aria-label="Edit Instagram draft">
            <label>
              Instagram account
              <select
                required
                value={account}
                disabled={busy}
                onChange={(e) => setAccount(e.target.value)}
              >
                <option value="">Choose an account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.disabled}>
                    {a.profile || a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Instagram caption
              <textarea
                required
                rows={8}
                maxLength={2200}
                value={caption}
                disabled={busy}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
            <label>
              JPEG image
              <input
                type="file"
                accept="image/jpeg"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setMedia(file);
                  setImage(file ? URL.createObjectURL(file) : '');
                }}
              />
            </label>
            <p className="studio-note">
              One JPEG under 900 KB, 320–1440 pixels wide, aspect ratio 4:5 to 1.91:1. Your upload
              remains private until you approve it.
            </p>
            <label>
              Publish time
              <input
                required
                type="datetime-local"
                value={due}
                disabled={busy}
                onChange={(e) => setDue(e.target.value)}
              />
            </label>
            <p className="studio-note">
              At least 24 hours ahead · {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
            <button disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <details>
              <summary>Source evidence & image brief</summary>
              <p>{draft.evidence}</p>
              <p>{draft.media.brief}</p>
              <p>{draft.next_check}</p>
            </details>
          </form>
          <PostPreview
            account={target?.profile || target?.name || draft.account}
            caption={caption}
            image={image}
            draftID={draftID}
            version={saved?.version}
            hasMedia={saved?.has_media}
          />
        </div>
      )}
    </PostingShell>
  );
}
