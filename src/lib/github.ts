import projectCatalog from '@content/projects.json';
import type { Project } from '@/types';

type ProjectType = 'software' | 'media' | 'tools' | 'social';

const CURRENT_FOCUS_SLUGS = [
  'productivity-suite',
  'dsa-seats',
  'echo-trails',
  'subcorp',
  'subcults',
] as const;

const PRODUCTION_SLUGS = ['clpr', 'hasanara', 'edda', 'augr', 'patchwork'] as const;

const PROJECT_GROUP_SLUGS: string[] = [...CURRENT_FOCUS_SLUGS, ...PRODUCTION_SLUGS];

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return (a.order ?? 999) - (b.order ?? 999);
  });
}

export const CURATED_PROJECTS: Project[] = sortProjects(Object.values(projectCatalog) as Project[]);

function getProjectTypes(project: Project): ProjectType[] {
  return Array.isArray(project.type) ? project.type : [project.type];
}

export function isToolProject(project: Project): boolean {
  return getProjectTypes(project).includes('tools');
}

export function getFeaturedProjects(projects: Project[] = CURATED_PROJECTS): Project[] {
  return CURRENT_FOCUS_SLUGS.map((slug) =>
    projects.find((project) => project.slug === slug),
  ).filter((project): project is Project => Boolean(project));
}

export function getProductionProjects(projects: Project[] = CURATED_PROJECTS): Project[] {
  return PRODUCTION_SLUGS.map((slug) => projects.find((project) => project.slug === slug)).filter(
    (project): project is Project => Boolean(project),
  );
}

export function getToolProjects(projects: Project[] = CURATED_PROJECTS): Project[] {
  const projectGroupSet = new Set(PROJECT_GROUP_SLUGS);
  return projects.filter(
    (project) => isToolProject(project) && !project.featured && !projectGroupSet.has(project.slug),
  );
}

export function getCuratedProjects(): Project[] {
  return CURATED_PROJECTS;
}

export function getCuratedProjectBySlug(slug: string | undefined): Project | null {
  if (!slug) return null;
  return CURATED_PROJECTS.find((project) => project.slug === slug) ?? null;
}
