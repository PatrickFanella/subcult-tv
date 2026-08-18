export type BuildCategory = { label: string; desc: string };

export type ActiveProject = { name: string; desc: string; stack: string[] };

export type RoadmapQuarter = { q: string; item: string };

export type FundAllocation = { label: string; pct: number };

export const WHAT_WE_BUILD: BuildCategory[] = [
  {
    label: 'Developer Tools',
    desc: 'CLI utilities, workflow automation, dev-first infrastructure',
  },
  { label: 'Self-Hosted Software', desc: 'Privacy-respecting alternatives you own and control' },
  { label: 'Media Pipelines', desc: 'Audio, video, and publishing toolchains for creators' },
  { label: 'Privacy Alternatives', desc: 'Replacements for surveillance-economy defaults' },
  { label: 'Educational Content', desc: 'Technical docs, zines, and hands-on guides' },
  { label: 'Community Platforms', desc: 'Spaces for builders, not engagement metrics' },
];

export const ACTIVE_PROJECTS: ActiveProject[] = [
  {
    name: 'subcult.tv',
    desc: 'Business hub, portfolio, and zine platform for the collective.',
    stack: ['React', 'TypeScript', 'Tailwind', 'Go API'],
  },
  {
    name: 'clpr',
    desc: 'Twitch clip curation platform for discovering and sharing clips.',
    stack: ['Go', 'TypeScript', 'React', 'Twitch API'],
  },
  {
    name: 'Cutroom',
    desc: 'AI video production pipeline with agent handoffs and attribution.',
    stack: ['TypeScript', 'Next.js', 'AI Agents', 'Remotion API'],
  },
  {
    name: 'Subcorp',
    desc: 'Self-hosted multi-agent system with semantic memory.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'OpenRouter'],
  },
];

export const ROADMAP: RoadmapQuarter[] = [
  { q: 'Q1 2026', item: 'Public launch + Zine series release' },
  { q: 'Q2 2026', item: 'First commercial tool beta + paid tiers' },
  { q: 'Q3 2026', item: 'Media production suite v1 launch' },
  { q: 'Q4 2026', item: 'Platform expansion + partnership pilots' },
];

export const FUND_ALLOCATION: FundAllocation[] = [
  { label: 'Engineering', pct: 60 },
  { label: 'Infrastructure', pct: 20 },
  { label: 'Community', pct: 10 },
  { label: 'Operations', pct: 10 },
];