export type BuildCategory = { label: string; desc: string };

export type ActiveProject = { name: string; desc: string; stack: string[] };

export type RoadmapQuarter = { q: string; item: string };

export type FundAllocation = { label: string; pct: number };

export const WHAT_WE_BUILD: BuildCategory[] = [
  {
    label: 'Developer Tools',
    desc: 'CLI utilities, workflow automation, and developer infrastructure',
  },
  { label: 'Self-Hosted Software', desc: 'Software that operators can run on their own systems' },
  { label: 'Media Pipelines', desc: 'Audio, video, transcription, and publishing tools' },
  {
    label: 'Data and Research',
    desc: 'Tools for packaging, searching, and tracing source material',
  },
  { label: 'Documentation', desc: 'Technical documentation, zines, and practical guides' },
  { label: 'Community Software', desc: 'Tools for events, governance, mutual aid, and discovery' },
];

export const ACTIVE_PROJECTS: ActiveProject[] = [
  {
    name: 'subcult.tv',
    desc: 'Active. Public site, project catalog, and zine for the collective.',
    stack: ['React', 'TypeScript', 'Tailwind', 'Go API'],
  },
  {
    name: 'clpr',
    desc: 'Active. Twitch clip curation platform for discovering and sharing clips.',
    stack: ['Go', 'TypeScript', 'React', 'Twitch API'],
  },
  {
    name: 'Cutroom',
    desc: 'Incubating. Video production pipeline with agent handoffs and attribution.',
    stack: ['TypeScript', 'Next.js', 'AI Agents', 'Remotion API'],
  },
  {
    name: 'Subcorp',
    desc: 'Incubating. Self-hosted multi-agent system with semantic memory.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'OpenRouter'],
  },
];

export const ROADMAP: RoadmapQuarter[] = [
  { q: 'Current', item: 'Maintain active projects and the public project catalog' },
  { q: 'Next', item: 'Move incubating projects toward usable releases' },
  { q: 'Next', item: 'Evaluate commercial tiers and implementation consulting' },
  { q: 'Later', item: 'Fund project work through sponsorships and partnerships' },
];

export const FUND_ALLOCATION: FundAllocation[] = [
  { label: 'Engineering', pct: 60 },
  { label: 'Infrastructure', pct: 20 },
  { label: 'Community', pct: 10 },
  { label: 'Operations', pct: 10 },
];
