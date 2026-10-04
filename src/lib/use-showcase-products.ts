import { useContext } from 'react';
import { ProjectCatalogContext } from '@/context/ProjectCatalogContext';
import { getShowcaseProducts } from './showcase';
import type { Project } from '@/types';

export function useShowcaseProducts() {
  const approved = useContext(ProjectCatalogContext);
  return getShowcaseProducts().map((product) => {
    const snapshot = approved.find((p) => p.slug === product.project.slug);
    if (!snapshot) return product;
    const project: Project = {
      ...product.project,
      name: snapshot.name,
      description: snapshot.description,
      longDescription: snapshot.long_description,
      whyItExists: snapshot.why_it_exists,
      stack: snapshot.stack,
      topics: snapshot.topics,
      status: snapshot.status as Project['status'],
      repoUrl: snapshot.repo_url ?? product.project.repoUrl,
      homepage: snapshot.homepage,
      url: snapshot.homepage || undefined,
      coverColor: snapshot.cover_color ?? product.project.coverColor,
      coverPattern: ['circuit', 'grid', 'waves', 'dots', 'sigil'].includes(snapshot.cover_pattern)
        ? (snapshot.cover_pattern as Project['coverPattern'])
        : product.project.coverPattern,
      featured: snapshot.featured,
      order: snapshot.sort_order,
    };
    return { ...product, project, summary: snapshot.description };
  });
}
