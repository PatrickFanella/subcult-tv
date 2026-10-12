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
import { AdminHeader, AdminError, AdminNotice } from '@/components/admin/crud';

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
        overline="Publishing"
        title="Projects"
        description="Project details shown on the public product pages. Save a draft here, then review and publish it to update the live product. New product pages and their marketing copy still need a separate public selection."
        action={
          <>
            {missing.length > 0 && (
              <button
                type="button"
                className="admin-button"
                onClick={importMissing}
                disabled={loading || saving}
              >
                Import {missing.length} missing catalog{' '}
                {missing.length === 1 ? 'project' : 'projects'}
              </button>
            )}
            <button
              type="button"
              className="admin-button"
              onClick={() => {
                setLoading(true);
                setError('');
                load();
              }}
              disabled={saving || loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" className="admin-button admin-button-primary" onClick={openNew}>
              + New project
            </button>
          </>
        }
      />
      <AdminNotice>{notice}</AdminNotice>
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
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-button admin-button-primary"
              disabled={saving}
              onClick={publishReviewed}
            >
              {saving ? 'Publishing…' : 'Approve and publish this version'}
            </button>
            <button
              type="button"
              className="admin-button"
              disabled={saving}
              onClick={() => setReviewing(null)}
            >
              Cancel review
            </button>
          </div>
        </section>
      )}
      {loading && (
        <p role="status" className="admin-count">
          Loading projects…
        </p>
      )}

      {/* ── Form Modal ──────────────────────────────────────── */}
      {showForm && (
        <div className="admin-form-panel">
          <h2>{editing ? `Edit ${editing.name}` : 'New project'}</h2>
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
            <div className="admin-form-actions">
              <button type="submit" disabled={saving} className="admin-button admin-button-primary">
                {saving ? 'Saving…' : editing ? 'Save draft' : 'Create project'}
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
              <th>Name</th>
              <th>Status</th>
              <th>Type</th>
              <th>Featured</th>
              <th>Order</th>
              <th>Public page</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const live = published.find((item) => item.id === p.id);
              const publicState = !live
                ? { label: 'Curated fallback', tone: 'is-muted' }
                : live.updated_at === p.updated_at
                  ? { label: 'Published', tone: 'is-live' }
                  : { label: 'Draft changes', tone: 'is-warn' };
              return (
                <tr key={p.id}>
                  <td>
                    <div className="admin-cell-title">{p.name}</div>
                    <div className="admin-cell-sub">{p.slug}</div>
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={p.status} />
                  </td>
                  <td data-label="Type" className="font-mono">
                    {Array.isArray(p.type) ? p.type.join(', ') : p.type}
                  </td>
                  <td data-label="Featured">
                    {p.featured ? (
                      <span aria-label="Featured">★</span>
                    ) : (
                      <span className="admin-cell-sub" aria-label="Not featured">
                        —
                      </span>
                    )}
                  </td>
                  <td data-label="Order" className="font-mono">
                    {p.sort_order}
                  </td>
                  <td data-label="Public page">
                    <span className={`admin-status ${publicState.tone}`}>{publicState.label}</span>
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
                        className="admin-button admin-button-small"
                        onClick={() => setReviewing(p)}
                      >
                        Review update
                      </button>
                      {live && (
                        <button
                          type="button"
                          className="admin-button admin-button-small"
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
                        type="button"
                        className="admin-button admin-button-small admin-button-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && !error && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-table-empty">
                  No projects yet. Import the curated catalog or create one with “New project”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
