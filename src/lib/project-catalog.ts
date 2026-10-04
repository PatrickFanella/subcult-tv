import projectCatalog from '@content/projects.json';
import type { Project } from '@/types';

const curatedProjects: Project[] = (Object.values(projectCatalog) as Project[]).sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);

export function getCuratedProjects(): Project[] {
  return curatedProjects;
}

export function getCuratedProjectBySlug(slug: string | undefined): Project | null {
  return curatedProjects.find((project) => project.slug === slug) ?? null;
}
