import { useState, useEffect, useId, type FormEvent } from 'react';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  getPublishedProjects,
  approveProject,
  unpublishProject,
  type APIProject,
} from '@/lib/api';
import { Field, Select, StatusBadge } from '@/components/admin/FormFields';
import { getCuratedProjects } from '@/lib/project-catalog';
import { getShowcaseProducts } from '@/lib/showcase';
import { AdminHeader, AdminError } from '@/components/admin/crud';

type ProjectForm = Omit<APIProject, 'id' | 'stars' | 'last_updated' | 'created_at' | 'updated_at'>;

const emptyForm: ProjectForm = {
  slug: '',
  name: '',
  description: '',
  type: ['software'],
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
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState<APIProject[]>([]);
  const [reviewing, setReviewing] = useState<APIProject | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([listProjects(), getPublishedProjects()])
      .then(([items, live]) => {
        setProjects(items);
        setPublished(live);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
      setError(err instanceof Error ? err.message : 'Could not save the project.');
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
      setError(err instanceof Error ? err.message : 'Could not delete the project.');
    }
  };

  const missing = getCuratedProjects().filter(
    (p) => !projects.some((existing) => existing.slug === p.slug),
  );
  const importMissing = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    let count = 0;
    try {
      for (const p of missing) {
        await createProject({
          slug: p.slug,
          name: p.name,
          description: p.description,
          long_description: p.longDescription,
          why_it_exists: p.whyItExists,
          type: Array.isArray(p.type) ? p.type : [p.type],
          status: p.status,
          stack: p.stack,
          topics: p.topics,
          repo_url: p.repoUrl,
          homepage: p.homepage ?? p.url,
          cover_pattern: p.coverPattern ?? 'grid',
          cover_color: p.coverColor,
          featured: p.featured ?? false,
          sort_order: p.order ?? 999,
        });
        count++;
      }
      setNotice(
        `Imported ${count} projects. Existing projects were kept. Review each public update before publishing.`,
      );
    } catch (err) {
      setError(
        `${count} imported. ${err instanceof Error ? err.message : 'Import failed.'} Reload before retrying.`,
      );
    } finally {
      setSaving(false);
      load();
    }
  };
  const publishReviewed = async () => {
    if (!reviewing) return;
    setSaving(true);
    setError('');
    try {
      await approveProject(reviewing);
      setReviewing(null);
      setNotice('The reviewed project update is published. Later edits remain drafts.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminHeader
        overline="PRODUCT CATALOG"
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

      <p className="studio-note">
        Save project drafts here. Review and publish an update to change an existing public product.
        New product pages and their marketing copy need a separate public selection.
      </p>
      <div className="studio-switch mb-6">
        <button onClick={importMissing} disabled={loading || saving || !missing.length}>
          Import {missing.length} missing catalog projects
        </button>
        <button
          onClick={() => {
            setLoading(true);
            setError('');
            load();
          }}
          disabled={saving}
        >
          Refresh projects
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
      <AdminError error={error} />
      {reviewing && (
        <section className="project-review" aria-labelledby="project-review-title">
          <h2 id="project-review-title">Review public update: {reviewing.name}</h2>
          <p>
            The saved fields below replace the selected product's details. The page's feature
            claims, artwork and public roster stay under editorial review.
          </p>
          {!getShowcaseProducts().some((p) => p.project.slug === reviewing.slug) && (
            <p>
              This project has no selected public product page yet. Its snapshot will be ready for
              that selection.
            </p>
          )}
          <dl>
            {Object.entries(reviewing)
              .filter(
                ([key]) =>
                  !['id', 'created_at', 'updated_at', 'last_updated', 'stars'].includes(key),
              )
              .map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replaceAll('_', ' ')}</dt>
                  <dd>{Array.isArray(value) ? value.join(', ') : String(value ?? '—')}</dd>
                </div>
              ))}
          </dl>
          <div className="studio-switch">
            <button disabled={saving} onClick={publishReviewed}>
              {saving ? 'Publishing…' : 'Approve and publish this version'}
            </button>
            <button disabled={saving} onClick={() => setReviewing(null)}>
              Cancel review
            </button>
          </div>
        </section>
      )}
      {loading && <p role="status">Loading projects…</p>}

      {/* ── Form Modal ──────────────────────────────────────── */}
      {showForm && (
        <div className="mb-6 bg-soot border border-fog p-6">
          <h2 className="text-lg mb-4">{editing ? 'Edit project' : 'New project'}</h2>
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
              label="Long description"
              value={form.long_description || ''}
              onChange={(v) => setForm({ ...form, long_description: v || undefined })}
              textarea
            />
            <Field
              label="Why it exists"
              value={form.why_it_exists || ''}
              onChange={(v) => setForm({ ...form, why_it_exists: v || undefined })}
              textarea
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field
                label="Types (comma-separated)"
                value={form.type.join(', ')}
                onChange={(v) =>
                  setForm({
                    ...form,
                    type: v
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                required
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(v) => setForm({ ...form, status: v })}
                options={['active', 'incubating', 'archived']}
              />
              <Select
                label="Cover pattern"
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
                label="Sort order"
                value={String(form.sort_order)}
                onChange={(v) => setForm({ ...form, sort_order: parseInt(v) || 0 })}
              />
              <Field
                label="Cover color"
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
        <table className="admin-table w-full text-sm">
          <thead>
            <tr className="border-b border-fog text-left font-mono text-xs text-dust uppercase">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Featured</th>
              <th className="py-3 px-3">Order</th>
              <th className="py-3 px-3">Public update</th>
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
                  {published.some((live) => live.id === p.id)
                    ? published.find((live) => live.id === p.id)?.updated_at === p.updated_at
                      ? 'Published'
                      : 'Draft changes'
                    : 'Curated fallback'}
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => openEdit(p)}
                      className="font-mono text-xs text-cyan hover:text-glow cursor-pointer"
                    >
                      EDIT
                    </button>
                    <button onClick={() => setReviewing(p)} className="font-mono text-xs">
                      Review public update
                    </button>
                    {published.some((live) => live.id === p.id) && (
                      <button
                        disabled={saving}
                        onClick={async () => {
                          if (
                            !confirm(
                              'Remove this approved update and use the curated public version?',
                            )
                          )
                            return;
                          try {
                            await unpublishProject(p.id);
                            load();
                          } catch (err) {
                            setError(
                              err instanceof Error ? err.message : 'Could not remove update.',
                            );
                          }
                        }}
                      >
                        Use curated version
                      </button>
                    )}
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
            {!loading && !error && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center font-mono text-sm text-bone">
                  No projects yet. Use “+ NEW PROJECT” to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
