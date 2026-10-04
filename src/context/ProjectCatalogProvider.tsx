import { useEffect, useState, type ReactNode } from 'react';
import { getPublishedProjects, type APIProject } from '@/lib/api';
import { ProjectCatalogContext } from './ProjectCatalogContext';
export default function ProjectCatalogProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<APIProject[]>([]);
  useEffect(() => {
    let active = true;
    getPublishedProjects()
      .then((value) => {
        if (active) setProjects(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <ProjectCatalogContext.Provider value={projects}>{children}</ProjectCatalogContext.Provider>
  );
}
