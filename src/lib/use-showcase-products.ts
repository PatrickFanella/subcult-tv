import { useContext } from 'react';
import { ProjectCatalogContext } from '@/context/ProjectCatalogContext';
import { getShowcaseProducts, type ShowcaseProduct } from './showcase';
import type { APIProject } from '@/lib/api';
import type { Project } from '@/types';

const STATUSES: Project['status'][] = ['active', 'incubating', 'archived'];

/**
 * The source catalog (content/projects.json and src/lib/showcase.ts) owns a
 * product's name, summary, featured flag and copy. The approved API snapshot
 * only updates what changes between releases: its status and live URL, and
 * only when the snapshot actually has a value.
 */
export function applyApprovedSnapshot(
  product: ShowcaseProduct,
  snapshot: APIProject | undefined,
): ShowcaseProduct {
  if (!snapshot) return product;
  const status = STATUSES.find((s) => s === snapshot.status) ?? product.project.status;
  const homepage = snapshot.homepage?.trim() || undefined;
  const project: Project = {
    ...product.project,
    status,
    homepage: homepage ?? product.project.homepage,
    url: homepage ?? product.project.url,
  };
  return { ...product, project };
}

export function useShowcaseProducts() {
  const approved = useContext(ProjectCatalogContext);
  return getShowcaseProducts().map((product) =>
    applyApprovedSnapshot(
      product,
      approved.find((p) => p.slug === product.project.slug),
    ),
  );
}
