import type { Project } from '@/types';

export function getPublicProjectSource(project: Project): string | null {
  return project.sourceUrl === null ? null : (project.sourceUrl ?? project.repoUrl);
}

export const statusColors: Record<Project['status'], string> = {
  active: 'text-static',
  incubating: 'text-flicker',
  archived: 'text-dust',
};

export const statusLabels: Record<Project['status'], string> = {
  active: '● ACTIVE',
  incubating: '◐ INCUBATING',
  archived: '○ ARCHIVED',
};
