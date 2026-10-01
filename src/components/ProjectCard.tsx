import { Link } from 'react-router-dom';
import { getProductPath } from '@/lib/product-paths';
import type { Project } from '@/types';
import Tag from '@/components/ui/Tag';
import CoverArt from '@/components/effects/CoverArt';
import { DEFAULT_COVER_COLOR } from '@/lib/tokens';
import { statusColors, statusLabels } from '@/lib/project-utils';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const hasScreenshot = !!project.screenshot;

  const card = (
    <div className="group flex flex-col h-full bg-ash border border-fog hover:border-signal hover:shadow-glow transition-all duration-200 cursor-pointer">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden">
        {hasScreenshot ? (
          <img
            src={project.screenshot}
            alt={`${project.name} screenshot`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <CoverArt
            color={project.coverColor || DEFAULT_COVER_COLOR}
            pattern={project.coverPattern || 'circuit'}
            name={project.name}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg uppercase tracking-wider text-glow group-hover:text-signal transition-colors">
            {project.name}
          </h3>
          <span className={`font-mono text-xs ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
        </div>

        <p className="text-sm text-bone mb-3 line-clamp-2 flex-1">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.stack.slice(0, 4).map((tech) => (
            <Tag key={tech} variant="tech">
              {tech}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Link to={getProductPath(project.slug)} className="no-underline">
      {card}
    </Link>
  );
}
