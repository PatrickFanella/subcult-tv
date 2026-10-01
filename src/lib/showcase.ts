import { getCuratedProjectBySlug } from '@/lib/github';
import type { Project } from '@/types';

export interface ShowcaseProduct {
  project: Project;
  category: string;
  headline: string;
  summary: string;
  highlights: string[];
  relatedSlug?: string;
}

const selections = [
  {
    slug: 'clpr',
    category: 'Clips & curation',
    headline: 'Keep the moments worth watching.',
    summary:
      'Find Twitch clips, collect your favorites, and share them with other viewers. Give the good moments a life beyond the stream.',
    highlights: ['Discover clips', 'Build collections', 'Share favorites'],
  },
  {
    slug: 'patchwork',
    category: 'Mutual aid',
    headline: 'Find help. Find a way to help.',
    summary:
      'Search mutual aid requests and connect with community needs on AT Protocol. An open network for practical solidarity.',
    highlights: ['Search requests', 'Coordinate support', 'Built on AT Protocol'],
  },
  {
    slug: 'hasanara',
    category: 'Searchable archives',
    headline: 'Find the passage. Keep the context.',
    summary:
      'Search a video archive through its transcripts, return to the original moment, and save or share passages with their source attached.',
    highlights: ['Search transcripts', 'Save passages', 'Link to the source'],
    relatedSlug: 'transcript-create',
  },
  {
    slug: 'transcript-create',
    category: 'Archives / Rekolekt by SUBCULT',
    headline: 'Make a recording into an archive.',
    summary:
      'Rekolekt turns long-form recordings into timestamped, searchable text. Run the shared application with your own archive identity and branding.',
    highlights: ['Ingest recordings', 'Keep the context', 'Your own archive'],
    relatedSlug: 'hasanara',
  },
  {
    slug: 'subcult-os',
    category: 'Live events',
    headline: 'From the first plan to the last guest.',
    summary:
      'Bring event planning, guest lists, ticket scanning, and the run of show into one workspace for the people putting on the night.',
    highlights: ['Plan the event', 'Manage the door', 'Run the show'],
  },
  {
    slug: 'undertow',
    category: 'Music & moving image',
    headline: 'Give your sound something to be seen.',
    summary:
      'Build a music video from audio-reactive visuals, artwork, and timed lyrics. Compose in layers, adapt to different formats, and export an MP4 right in your browser.',
    highlights: ['Layer your visuals', 'Sync the lyrics', 'Export locally'],
  },
] satisfies Array<Omit<ShowcaseProduct, 'project'> & { slug: string }>;

export function getShowcaseProducts(): ShowcaseProduct[] {
  return selections.map(({ slug, ...copy }) => {
    const project = getCuratedProjectBySlug(slug);
    if (!project) throw new Error(`Missing showcase product: ${slug}`);
    return { project, ...copy };
  });
}
