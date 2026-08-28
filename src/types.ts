export type EffectLevel = 'clean' | 'mild' | 'full';

export const COVER_PATTERNS = ['circuit', 'grid', 'waves', 'dots', 'sigil'] as const;
export type CoverPattern = (typeof COVER_PATTERNS)[number];

export interface Project {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  whyItExists?: string;
  status: 'active' | 'incubating' | 'archived';
  type: ('software' | 'media' | 'tools' | 'social')[] | 'software' | 'media' | 'tools' | 'social';
  stack: string[];
  topics: string[];
  url?: string;
  repoUrl: string;
  homepage?: string;
  lastUpdated: string;
  stars?: number;
  coverColor?: string;
  coverPattern?: CoverPattern;
  screenshot?: string;
  featured?: boolean;
  order?: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author?: string;
  mdx?: () => Promise<{ default: React.ComponentType }>;
  series?: {
    name: string;
    week: number;
    total: number;
  };
}
