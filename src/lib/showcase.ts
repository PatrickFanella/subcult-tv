import { getCuratedProjectBySlug } from '@/lib/project-catalog';
import type { Project } from '@/types';

export interface ShowcaseProduct {
  project: Project;
  category: string;
  headline: string;
  summary: string;
  highlights: string[];
  relatedSlug?: string;
  /** Label for links to the live site when "Open <name>" would overstate it. */
  liveLabel?: string;
}

const selections = [
  {
    slug: 'clpr',
    category: 'Clips & curation',
    headline: 'Keep the moments worth watching.',
    summary:
      'Browse Twitch clips by creator, topic, and tag, save the good ones to playlists, and share them with other viewers.',
    highlights: ['Browse clips', 'Build playlists', 'Share favorites'],
  },
  {
    slug: 'patchwork',
    category: 'Mutual aid',
    headline: 'Find help. Find a way to help.',
    summary:
      'Ask neighbors for help, offer what you can, and find local resources. Public views show approximate areas, never exact addresses. Patchwork is a pre-alpha prototype built on AT Protocol.',
    highlights: ['Find nearby needs', 'Ask for help', 'Approximate locations only'],
    liveLabel: 'Try the demo',
  },
  {
    slug: 'hasanara',
    category: 'Searchable archives',
    headline: 'Find the passage. Keep the context.',
    summary:
      'Search years of HasanAbi broadcasts by topic or exact phrase, jump to the moment in the VOD, and save or share passages with their source attached.',
    highlights: ['Search transcripts', 'Save passages', 'Link to the source'],
    relatedSlug: 'transcript-create',
  },
  {
    slug: 'transcript-create',
    category: 'Archives / Rekolekt by SUBCULT',
    headline: 'Make a recording into an archive.',
    summary:
      'Rekolekt turns long-form recordings into timestamped, searchable transcripts. Each archive runs the same software under its own name and branding.',
    highlights: ['Transcribe recordings', 'Search and cite', 'Your own branding'],
    relatedSlug: 'hasanara',
  },
  {
    slug: 'subcult-os',
    category: 'Live events',
    headline: 'From the first plan to the last guest.',
    summary:
      'Plan the event, staff it, take ticket reservations, and check guests in at the door, all from one workspace for the people putting on the night.',
    highlights: ['Plan and staff', 'Reserve tickets', 'Check in at the door'],
  },
  {
    slug: 'undertow',
    category: 'Music & moving image',
    headline: 'Turn a track into a music video.',
    summary:
      'Layer a Milkdrop visualizer, spectrum, artwork, timed lyrics, and particles. Lay it out once for landscape, portrait, and square, then export MP4s in your browser.',
    highlights: ['Start from a template', 'Sync the lyrics', 'Export in your browser'],
  },
  {
    slug: 'prichal',
    category: 'Account hosting',
    headline: 'Your server. We keep it running.',
    summary:
      'Prichal runs your account’s home server on the open network Bluesky runs on, so your name, posts and followers live somewhere that is yours. Private preview; not open for sign-up yet.',
    highlights: ['Your own server', 'Your name as your username', 'Kept running for you'],
    liveLabel: 'See the preview',
  },
  {
    slug: 'kork',
    category: 'Link pages',
    headline: 'Every link. One board.',
    summary:
      'Put your socials, tip jars, music and video players, QR codes, and contact card on one themed page. Payment buttons go straight to your own accounts, and Kork takes no cut.',
    highlights: ['92 services', 'Ten themes', 'No trackers'],
  },
  {
    slug: 'left-field',
    category: 'Election research / in development',
    headline: 'Read the field. Trace the evidence.',
    summary:
      'Explore sourced seat records, compare provisional research scores, and inspect the inputs behind each brief. Left Field is in active development; scores are research tools, not election predictions.',
    highlights: ['Inspect seat records', 'Compare provisional scores', 'Trace the sources'],
  },
] satisfies Array<Omit<ShowcaseProduct, 'project'> & { slug: string }>;

export function getShowcaseProducts(): ShowcaseProduct[] {
  return selections.map(({ slug, ...copy }) => {
    const project = getCuratedProjectBySlug(slug);
    if (!project) throw new Error(`Missing showcase product: ${slug}`);
    return { project, ...copy };
  });
}
