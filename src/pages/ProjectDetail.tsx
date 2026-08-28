import { useParams, Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import CoverArt from '@/components/effects/CoverArt';
import TerminalPanel from '@/components/effects/TerminalPanel';
import { getCuratedProjectBySlug } from '@/lib/github';
import { DEFAULT_COVER_COLOR } from '@/lib/tokens';
import { statusColors, statusLabels } from '@/lib/project-utils';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();

  const project = getCuratedProjectBySlug(slug);

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SEOHead title="Project Not Found" path={`/projects/${slug}`} />
        <p className="font-mono text-signal mb-4">&gt; ERROR 404: project not found</p>
        <p className="text-bone mb-6">
          No project exists at this address. It may have been removed or archived.
        </p>
        <Button as="link" to="/projects" variant="secondary">
          ← Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={project.name}
        description={project.description}
        path={`/projects/${project.slug}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="font-mono text-xs text-dust mb-8" aria-label="Breadcrumb">
          <Link to="/projects" className="hover:text-bone transition-colors">
            projects
          </Link>
          <span className="mx-2">/</span>
          <span className="text-bone">{project.slug}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Cover */}
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={`${project.name} screenshot`}
                className="h-56 w-full object-cover object-top border border-fog mb-8"
              />
            ) : (
              <CoverArt
                color={project.coverColor || DEFAULT_COVER_COLOR}
                pattern={project.coverPattern || 'circuit'}
                name={project.name}
                className="h-56 w-full mb-8"
              />
            )}

            <h1 className="mb-4">{project.name}</h1>

            <p className="text-lg text-bone leading-relaxed mb-6">
              {project.longDescription || project.description}
            </p>

            {project.whyItExists && (
              <div className="mb-8">
                <h3 className="text-sm font-mono text-bone uppercase mb-3">// Why It Exists</h3>
                <blockquote className="border-l-3 border-signal pl-4 text-bone italic">
                  {project.whyItExists}
                </blockquote>
              </div>
            )}

            {/* Terminal info block */}
            <TerminalPanel title={`${project.slug}.info`} className="mb-8">
              <div>
                <span className="text-bone">name: </span>
                <span className="text-chalk">{project.name}</span>
                <br />
                <span className="text-bone">type: </span>
                <span className="text-cyan">
                  {Array.isArray(project.type) ? project.type.join(', ') : project.type}
                </span>
                <br />
                <span className="text-bone">status: </span>
                <span className={statusColors[project.status]}>{statusLabels[project.status]}</span>
                <br />
                <span className="text-bone">stack: </span>
                <span className="text-flicker">{project.stack.join(', ')}</span>
                <br />
                <span className="text-bone">updated: </span>
                <span className="text-chalk">
                  {new Date(project.lastUpdated).toLocaleDateString()}
                </span>
                {project.stars !== undefined && (
                  <>
                    <br />
                    <span className="text-bone">stars: </span>
                    <span className="text-flicker">{project.stars}</span>
                  </>
                )}
              </div>
            </TerminalPanel>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-ash border border-fog p-6">
              <h4 className="font-mono text-xs text-bone uppercase mb-4">// Actions</h4>
              <div className="space-y-3">
                {project.url && (
                  <Button
                    as="a"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    className="w-full"
                  >
                    Visit Project ↗
                  </Button>
                )}
                <Button
                  as="a"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant={project.url ? 'secondary' : 'primary'}
                  className="w-full"
                >
                  View Repository ↗
                </Button>
                <div className="pt-5 mt-5 border-t border-fog">
                  <Button
                    as="a"
                    href="https://www.patreon.com/subcult"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    className="w-full"
                  >
                    Support the Work ↗
                  </Button>
                </div>
              </div>
            </div>

            {/* Stack */}
            <div className="bg-ash border border-fog p-6">
              <h4 className="font-mono text-xs text-bone uppercase mb-4">// Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Tag key={tech} variant="tech">
                    {tech}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Topics */}
            {project.topics.length > 0 && (
              <div className="bg-ash border border-fog p-6">
                <h4 className="font-mono text-xs text-bone uppercase mb-4">// Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {project.topics.map((topic) => (
                    <Tag key={topic}>{topic}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-fog">
          <Link
            to="/projects"
            className="font-mono text-sm text-bone hover:text-signal transition-colors"
          >
            ← Back to all projects
          </Link>
        </div>
      </div>
    </>
  );
}
