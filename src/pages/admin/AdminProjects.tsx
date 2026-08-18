import { useState, useEffect, useId, type FormEvent } from 'react';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  type APIProject,
} from '@/lib/api';
import { Field, Select, StatusBadge } from '@/components/admin/FormFields';
import { AdminHeader, AdminError } from '@/components/admin/crud';

type ProjectForm = Omit<APIProject, 'id' | 'stars' | 'last_updated' | 'created_at' | 'updated_at'>;

const emptyForm: ProjectForm = {
  slug: '',
  name: '',
  description: '',
  type: 'software',
  status: 'active',
  stack: [],
  topics: [],
  cover_pattern: 'circuit',
  featured: false,
  sort_order: 0,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<APIProject[]>([]);
  const id = useId();
  const [editing, setEditing] = useState<APIProject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    listProjects()
      .then(setProjects)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: APIProject) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      name: p.name,
      description: p.description,
      long_description: p.long_description,
      why_it_exists: p.why_it_exists,
      type: p.type,
      status: p.status,
      stack: p.stack || [],
      topics: p.topics || [],
      repo_url: p.repo_url,
      homepage: p.homepage,
      cover_pattern: p.cover_pattern,
      cover_color: p.cover_color,
      featured: p.featured,
      sort_order: p.sort_order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateProject(editing.id, form);
      } else {
        await createProject(form);
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
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'delete failed');
    }
  };

  return (
    <div>
      <AdminHeader
        overline="PROJECT REGISTRY"
        title="Projects"
        action={
          <button
            onClick={openNew}
            className="px-4 py-2 bg-signal text-void font-mono text-sm font-bold tracking-wider
                       hover:bg-signal-dim transition-colors duration-200 cursor-pointer"
          >
            + NEW PROJECT
          </button>
        }
      />

      <AdminError error={error} />

      {/* ── Form Modal ──────────────────────────────────────── */}
      {showForm && (
        <div className="mb-6 bg-soot border border-fog p-6">
          <h2 className="text-lg mb-4">{editing ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Slug"
                value={form.slug}
                onChange={(v) => setForm({ ...form, slug: v })}
                required
              />
              <Field
                label="Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />
            </div>
            <Field
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              textarea
            />
            <Field
              label="Long Description"
              value={form.long_description || ''}
              onChange={(v) => setForm({ ...form, long_description: v || undefined })}
              textarea
            />
            <Field
              label="Why It Exists"
              value={form.why_it_exists || ''}
              onChange={(v) => setForm({ ...form, why_it_exists: v || undefined })}
              textarea
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                label="Type"
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={['software', 'media', 'tools', 'social']}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(v) => setForm({ ...form, status: v })}
                options={['active', 'incubating', 'archived']}
              />
              <Select
                label="Cover Pattern"
                value={form.cover_pattern}
                onChange={(v) => setForm({ ...form, cover_pattern: v })}
                options={['circuit', 'grid', 'waves', 'dots', 'sigil']}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Stack (comma-separated)"
                value={(form.stack || []).join(', ')}
                onChange={(v) =>
                  setForm({
                    ...form,
                    stack: v
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Field
                label="Topics (comma-separated)"
                value={(form.topics || []).join(', ')}
                onChange={(v) =>
                  setForm({
                    ...form,
                    topics: v
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Repo URL"
                value={form.repo_url || ''}
                onChange={(v) => setForm({ ...form, repo_url: v || undefined })}
              />
              <Field
                label="Homepage"
                value={form.homepage || ''}
                onChange={(v) => setForm({ ...form, homepage: v || undefined })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field
                label="Sort Order"
                value={String(form.sort_order)}
                onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })}
              />
              <Field
                label="Cover Color"
                value={form.cover_color || ''}
                onChange={(v) => setForm({ ...form, cover_color: v || undefined })}
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id={`${id}-featured`}
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="accent-signal"
                />
                <label htmlFor={`${id}-featured`} className="font-mono text-sm text-chalk">
                  Featured
                </label>
              </div>
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
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Featured</th>
              <th className="py-3 px-3">Order</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-b border-fog/50 hover:bg-ash transition-colors duration-200"
              >
                <td className="py-3 px-3">
                  <div className="text-chalk font-medium">{p.name}</div>
                  <div className="font-mono text-xs text-dust">{p.slug}</div>
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-3 px-3 font-mono text-xs text-bone">
                  {Array.isArray(p.type) ? p.type.join(', ') : p.type}
                </td>
                <td className="py-3 px-3 text-center">{p.featured ? '★' : '—'}</td>
                <td className="py-3 px-3 font-mono text-xs text-dust">{p.sort_order}</td>
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
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center font-mono text-sm text-bone">
                  No projects found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
