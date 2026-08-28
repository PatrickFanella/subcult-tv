import { useMemo, useState } from 'react';
import SEOHead from '@/components/SEOHead';
import ProjectCard from '@/components/ProjectCard';
import {
  getCuratedProjects,
  getFeaturedProjects,
  getProductionProjects,
  getToolProjects,
} from '@/lib/github';

type FilterType = 'all' | 'software' | 'media' | 'tools' | 'social';
type FilterStatus = 'all' | 'active' | 'incubating' | 'archived';

export default function Projects() {
  const projects = getCuratedProjects();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all';

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (typeFilter !== 'all') {
          const types = Array.isArray(p.type) ? p.type : [p.type];
          if (!types.includes(typeFilter)) return false;
        }
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        return true;
      }),
    [projects, typeFilter, statusFilter],
  );

  const featuredProjects = getFeaturedProjects(projects);
  const productionProjects = getProductionProjects(projects);
  const toolProjects = getToolProjects(projects);
  const overviewProjectSlugs = new Set(
    [...productionProjects, ...featuredProjects, ...toolProjects].map((project) => project.slug),
  );
  const moreProjects = projects.filter((project) => !overviewProjectSlugs.has(project.slug));

  return (
    <>
      <SEOHead
        title="Projects"
        description="Software, media projects, and open-source tools from SUBCULT."
        path="/projects"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-dust mb-3">&gt; ls -la /projects/</p>
          <h1 className="mb-4">Projects</h1>
          <p className="text-bone max-w-2xl">
            Browse active work, projects in progress, and the tools that support them. Status labels
            show which projects are active, still incubating, or archived.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-fog">
          <fieldset className="min-w-0">
            <legend className="font-mono text-xs text-dust mb-2">TYPE:</legend>
            <div className="flex flex-wrap gap-2">
              {(['all', 'software', 'media', 'tools', 'social'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  aria-label={t === 'all' ? 'All project types' : `Project type: ${t}`}
                  aria-pressed={typeFilter === t}
                  className={`font-mono text-xs px-2 py-1 border transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'border-signal text-signal'
                      : 'border-fog text-dust hover:text-bone'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="font-mono text-xs text-dust mb-2">STATUS:</legend>
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'incubating', 'archived'] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  aria-label={s === 'all' ? 'All project statuses' : `Project status: ${s}`}
                  aria-pressed={statusFilter === s}
                  className={`font-mono text-xs px-2 py-1 border transition-colors cursor-pointer ${
                    statusFilter === s
                      ? 'border-static text-static'
                      : 'border-fog text-dust hover:text-bone'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {hasFilters ? (
          <>
            {/* Results count */}
            <p className="font-mono text-xs text-dust mb-6">
              {`> ${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="font-mono text-dust">
                  &gt; no projects match current filters
                  <br />
                  &gt; try adjusting parameters
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-16">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2>
                  <span className="text-dust font-mono text-sm mr-3">//</span>
                  Active projects
                </h2>
                <p className="font-mono text-xs text-dust">maintained now</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productionProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2>
                  <span className="text-dust font-mono text-sm mr-3">//</span>
                  Current Focus
                </h2>
                <p className="font-mono text-xs text-dust">current priorities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2>
                  <span className="text-dust font-mono text-sm mr-3">//</span>
                  Tools &amp; Experiments
                </h2>
                <p className="font-mono text-xs text-dust">utilities // internal systems</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toolProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>

              {toolProjects.length === 0 && (
                <p className="font-mono text-xs text-dust mt-6">&gt; no tools indexed yet</p>
              )}
            </section>

            {moreProjects.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2>
                    <span className="text-dust font-mono text-sm mr-3">//</span>
                    More projects
                  </h2>
                  <p className="font-mono text-xs text-dust">from the catalog</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moreProjects.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
