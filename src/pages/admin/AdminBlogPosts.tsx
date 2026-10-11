import { useState, useEffect, useId, type FormEvent } from 'react';
import { listPosts, createPost, updatePost, deletePost, type APIPost } from '@/lib/api';
import { Field } from '@/components/admin/FormFields';
import LibraryMarkdown from '@/components/admin/LibraryMarkdown';
import { AdminHeader, AdminError } from '@/components/admin/crud';
import PostingNav from './PostingNav';

type PostForm = Omit<APIPost, 'id' | 'created_at' | 'updated_at'>;

const emptyForm: PostForm = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  tags: [],
  published: false,
  date: new Date().toISOString().slice(0, 10),
};

export default function AdminPosts() {
  const [posts, setPosts] = useState<APIPost[]>([]);
  const id = useId();
  const [editing, setEditing] = useState<APIPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    listPosts({ all: true, perPage: 100 })
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: APIPost) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      tags: p.tags || [],
      author: p.author,
      published: p.published,
      date: p.date,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updatePost(editing.id, form);
      } else {
        await createPost(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the post.');
    }
  };

  return (
    <div>
      <AdminHeader
        overline="Publishing"
        title="Articles"
        description="Essays, updates and announcements stored on the website. Unpublished articles stay private. Use the development-log tag only for entries meant for the public Development feed."
        action={
          <button type="button" className="admin-button admin-button-primary" onClick={openNew}>
            + New article
          </button>
        }
        nav={<PostingNav />}
      />
      <AdminError error={error} />

      {/* ── Form ────────────────────────────────────────────── */}
      {showForm && (
        <div className="admin-form-panel">
          <h2>{editing ? 'Edit article' : 'New article'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => setForm({ ...form, slug: v })}
                required
              />
              <Field
                label="Title"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                required
              />
            </div>
            <Field
              label="Excerpt"
              value={form.excerpt}
              onChange={(v) => setForm({ ...form, excerpt: v })}
              textarea
              rows={2}
            />
            <Field
              label="Content (MDX)"
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              textarea
              rows={12}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field
                label="Date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                type="date"
              />
              <Field
                label="Tags (comma-separated)"
                value={(form.tags || []).join(', ')}
                onChange={(v) =>
                  setForm({
                    ...form,
                    tags: v
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Field
                label="Author"
                value={form.author || ''}
                onChange={(v) => setForm({ ...form, author: v || undefined })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`${id}-published`}
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="accent-signal"
              />
              <label htmlFor={`${id}-published`} className="font-mono text-sm text-chalk">
                Published
              </label>
            </div>
            <details>
              <summary>Preview Markdown</summary>
              <LibraryMarkdown>{form.content}</LibraryMarkdown>
            </details>
            <div className="admin-form-actions">
              <button type="submit" disabled={saving} className="admin-button admin-button-primary">
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create article'}
              </button>
              <button type="button" className="admin-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="admin-data-table admin-table stack-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Tags</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-cell-title">{p.title}</div>
                  <div className="admin-cell-sub">{p.slug}</div>
                </td>
                <td data-label="Date" className="font-mono">
                  {p.date}
                </td>
                <td data-label="Status">
                  <span className={`admin-status ${p.published ? 'is-live' : 'is-muted'}`}>
                    {p.published ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td data-label="Tags">
                  <div className="admin-tags">
                    {(p.tags || []).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </td>
                <td data-label="Actions">
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-button admin-button-small"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button-small admin-button-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  No articles yet. Approved development-log entries land here, or write one with
                  “New article”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
