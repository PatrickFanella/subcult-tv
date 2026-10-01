import projectCatalog from '@content/projects.json';
import type { Project } from '@/types';

export const CURATED_PROJECTS: Project[] = (Object.values(projectCatalog) as Project[]).sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);

export function getCuratedProjects(): Project[] {
  return CURATED_PROJECTS;
}

export function getCuratedProjectBySlug(slug: string | undefined): Project | null {
  return CURATED_PROJECTS.find((project) => project.slug === slug) ?? null;
}
