import { useState, useEffect, useId, type FormEvent } from 'react';
import { listPosts, createPost, updatePost, deletePost, type APIPost } from '@/lib/api';
import { Field } from '@/components/admin/FormFields';
import { AdminHeader, AdminError } from '@/components/admin/crud';

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
      setError(err instanceof Error ? err.message : 'save failed');
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
      setError(err instanceof Error ? err.message : 'delete failed');
    }
  };

  return (
    <div>
      <AdminHeader
        overline="TRANSMISSION LOG"
        title="Posts"
        action={
          <button
            onClick={openNew}
            className="px-4 py-2 bg-signal text-void font-mono text-sm font-bold tracking-wider
                       hover:bg-signal-dim transition-colors duration-200 cursor-pointer"
          >
            + NEW POST
          </button>
        }
      />

      <AdminError error={error} />

      {/* ── Form ────────────────────────────────────────────── */}
      {showForm && (
        <div className="mb-6 bg-soot border border-fog p-6">
          <h2 className="text-lg mb-4">{editing ? 'Edit Post' : 'New Post'}</h2>
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
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-signal text-void font-mono text-sm font-bold hover:bg-signal-dim transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-ash border border-fog text-chalk font-mono text-sm hover:border-dust transition-colors duration-200 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fog text-left font-mono text-xs text-dust uppercase">
              <th className="py-3 px-3">Title</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Tags</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-fog/50 hover:bg-ash transition-colors duration-200">
                <td className="py-3 px-3">
                  <div className="text-chalk font-medium">{p.title}</div>
                  <div className="font-mono text-xs text-dust">{p.slug}</div>
                </td>
                <td className="py-3 px-3 font-mono text-xs text-bone">{p.date}</td>
                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-xs ${p.published ? 'text-static' : 'text-dust'}`}
                  >
                    {p.published ? 'LIVE' : 'DRAFT'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {(p.tags || []).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-ash text-dust font-mono text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="font-mono text-xs text-cyan hover:text-glow cursor-pointer"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="font-mono text-xs text-signal hover:text-glow cursor-pointer"
                    >
                      DEL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center font-mono text-sm text-bone">
                  No posts found. Write your first transmission.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
