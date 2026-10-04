import { createContext } from 'react';
import type { APIProject } from '@/lib/api';
export const ProjectCatalogContext = createContext<APIProject[]>([]);
