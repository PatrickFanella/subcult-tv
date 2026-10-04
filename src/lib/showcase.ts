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
    category: 'Twitch clips',
    headline: 'The clip you can’t find is probably in here.',
    summary:
      'You saw it live, and now it’s buried under a week of chat. clpr sorts Twitch clips by creator, topic and tag. Save the good ones to playlists and send them to whoever missed it.',
    highlights: ['by creator', 'by topic', 'by tag', 'playlists'],
  },
  {
    slug: 'patchwork',
    category: 'Mutual aid / pre-alpha demo',
    headline: 'A neighborhood board for asking and offering help.',
    summary:
      'Someone two streets over needs a ride on Thursday, and you have a car on Thursday. Patchwork is where the two of you would find each other. It is a pre-alpha demonstration, so please don’t arrange real help through it yet.',
    highlights: ['Demonstration only', 'Requests show an approximate area'],
    liveLabel: 'Try the demo',
  },
  {
    slug: 'hasanara',
    category: 'Broadcast archive',
    headline: 'Now on the record: what was said on stream, and when.',
    summary:
      'The Piker Broadcasting Service presents years of HasanAbi broadcasts, searchable by topic or exact phrase. Every result opens at its timestamp. The transcripts are machine-made, so check the tape before you quote it.',
    highlights: ['Phrase search', 'Timestamped results', 'Automatic transcripts'],
    relatedSlug: 'transcript-create',
  },
  {
    slug: 'transcript-create',
    category: 'Archive software',
    headline: 'A four-hour recording is a bad place to keep a sentence.',
    summary:
      'Rekolekt transcribes each recording with timestamps, indexes the text, and links every passage back to the point where it was spoken. It is software you deploy for a collection, not a hosted upload service, and each archive runs under its own name.',
    highlights: ['Recording', 'Transcript', 'Timestamp', 'Passage'],
    relatedSlug: 'hasanara',
  },
  {
    slug: 'subcult-os',
    category: 'Live events / in development',
    headline: '19:00 doors, and the whole team on one sheet.',
    summary:
      'A run sheet for small shows: the plan, the crew, free ticket reservations, check-in at the door and a report when the night ends. Subcult OS is still in development.',
    highlights: ['17:00 load-in', '19:00 doors', '22:45 close-out'],
  },
  {
    slug: 'undertow',
    category: 'Music visualizer editor',
    headline: 'Give the track something to look at.',
    summary:
      'Stack Milkdrop, a spectrum, VU meters, artwork and timed lyrics in layers. Lay the video out in 16:9, 9:16 and 1:1, then export H.264 MP4 in your browser. It renders on your machine, so speed depends on the device.',
    highlights: [
      'Six templates',
      'LRC / SRT / VTT',
      '16:9 / 9:16 / 1:1',
      'H.264 MP4',
      'Local export',
    ],
  },
  {
    slug: 'prichal',
    category: 'Account hosting / private preview',
    headline: 'Your server. We keep it running.',
    summary:
      'Every account on the open social web lives on a server somewhere. Prichal gives yours a server of its own, and we do the maintenance. You keep posting from Bluesky. Status: private preview, with no sign-up yet.',
    highlights: ['Private preview', 'No sign-up yet'],
    liveLabel: 'See the preview',
  },
  {
    slug: 'kork',
    category: 'Free link pages',
    headline: 'One link in your bio, and everything else pinned to it.',
    summary:
      'Kork is a free link page for your socials, tip jars, music, video, QR codes and contact card, in a theme you pick. Tips go to your own accounts. We don’t take a cut because we never touch the money. It’s new, so expect rough edges.',
    highlights: ['Free', '92 services', 'Ten themes', 'No cut of tips', 'No trackers'],
  },
  {
    slug: 'left-field',
    category: 'Election research / in development',
    headline: 'A score here is a research note, not a forecast.',
    summary:
      'Left Field sets seat-level public records beside their sources and their gaps: elections, incumbents, campaign finance and geography. Scores are provisional and versioned. It is in active development, and no public app has been announced.',
    highlights: ['Provisional', 'Versioned', 'Seat-level public records'],
  },
  {
    slug: 'subsets',
    category: 'Local agent tools / npm alpha',
    headline: 'All your skills. Only the set you need.',
    summary:
      'Discover skills on your computer, group them for a task, and preview changes before applying a set. A local CLI and terminal interface, with explicit folder ownership and checked recovery.',
    highlights: ['Discover local skills', 'Group and preview', 'Apply your set'],
    liveLabel: 'Get the alpha',
  },
] satisfies Array<Omit<ShowcaseProduct, 'project'> & { slug: string }>;

export function getShowcaseProducts(): ShowcaseProduct[] {
  return selections.map(({ slug, ...copy }) => {
    const project = getCuratedProjectBySlug(slug);
    if (!project) throw new Error(`Missing showcase product: ${slug}`);
    return { project, ...copy };
  });
}
