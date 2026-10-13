import { getCuratedProjectBySlug } from '@/lib/project-catalog';
import type { Project } from '@/types';

export const PRODUCT_GROUPS = {
  apps: 'Apps and services',
  plugins: 'Desktop and editor plugins',
  tools: 'Developer and agent tools',
} as const;

export type ProductGroup = keyof typeof PRODUCT_GROUPS;

export interface ShowcaseProduct {
  project: Project;
  /** Directory section on /products and in the home index. */
  group: ProductGroup;
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
    group: 'apps',
    category: 'Twitch clips',
    headline: 'The clip you can’t find is probably in here.',
    summary:
      'You saw it live, and now it’s buried under a week of chat. clpr sorts Twitch clips by creator, topic and tag. Save the good ones to playlists and send them to whoever missed it.',
    highlights: ['by creator', 'by topic', 'by tag', 'playlists'],
  },
  {
    slug: 'patchwork',
    group: 'apps',
    category: 'Mutual aid / pre-alpha demo',
    headline: 'A neighborhood board for asking and offering help.',
    summary:
      'Someone two streets over needs a ride on Thursday, and you have a car on Thursday. Patchwork is where the two of you would find each other. It is a pre-alpha demonstration, so please don’t arrange real help through it yet.',
    highlights: ['Demonstration only', 'Requests show an approximate area'],
    liveLabel: 'Try the demo',
  },
  {
    slug: 'hasanara',
    group: 'apps',
    category: 'Broadcast archive',
    headline: 'Now on the record: what was said on stream, and when.',
    summary:
      'The Piker Broadcasting Service presents years of HasanAbi broadcasts, searchable by topic or exact phrase. Every result opens at its timestamp. The transcripts are machine-made, so check the tape before you quote it.',
    highlights: ['Phrase search', 'Timestamped results', 'Automatic transcripts'],
    relatedSlug: 'transcript-create',
  },
  {
    slug: 'transcript-create',
    group: 'apps',
    category: 'Archive software',
    headline: 'A four-hour recording is a bad place to keep a sentence.',
    summary:
      'Rekolekt transcribes each recording with timestamps, indexes the text, and links every passage back to the point where it was spoken. It is software you deploy for a collection, not a hosted upload service, and each archive runs under its own name.',
    highlights: ['Recording', 'Transcript', 'Timestamp', 'Passage'],
    relatedSlug: 'hasanara',
  },
  {
    slug: 'subcult-os',
    group: 'apps',
    category: 'Live events / in development',
    headline: '19:00 doors, and the whole team on one sheet.',
    summary:
      'A run sheet for small shows: the plan, the crew, free ticket reservations, check-in at the door and a report when the night ends. Subcult OS is still in development.',
    highlights: ['17:00 load-in', '19:00 doors', '22:45 close-out'],
  },
  {
    slug: 'undertow',
    group: 'apps',
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
    group: 'apps',
    category: 'Account hosting / private preview',
    headline: 'Your server. We keep it running.',
    summary:
      'Every account on the open social web lives on a server somewhere. Prichal gives yours a server of its own, and we do the maintenance. You keep posting from Bluesky. Status: private preview, with no sign-up yet.',
    highlights: ['Private preview', 'No sign-up yet'],
    liveLabel: 'See the preview',
  },
  {
    slug: 'kork',
    group: 'apps',
    category: 'Free link pages',
    headline: 'One link in your bio, and everything else pinned to it.',
    summary:
      'Kork is a free link page for your socials, tip jars, music, video, QR codes and contact card, in a theme you pick. Tips go to your own accounts. We don’t take a cut because we never touch the money. It’s new, so expect rough edges.',
    highlights: ['Free', '92 services', 'Ten themes', 'No cut of tips', 'No trackers'],
  },
  {
    slug: 'left-field',
    group: 'apps',
    category: 'Election research / in development',
    headline: 'A score here is a research note, not a forecast.',
    summary:
      'Left Field sets seat-level public records beside their sources and their gaps: elections, incumbents, campaign finance and geography. Scores are provisional and versioned. It is in active development, and no public app has been announced.',
    highlights: ['Provisional', 'Versioned', 'Seat-level public records'],
  },
  {
    slug: 'subsets',
    group: 'tools',
    category: 'Local agent tools / npm alpha',
    headline: 'All your skills. Only the set you need.',
    summary:
      'Discover skills on your computer, group them for a task, and preview changes before applying a set. A local CLI and terminal interface, with explicit folder ownership and checked recovery.',
    highlights: ['Discover local skills', 'Group and preview', 'Apply your set'],
    liveLabel: 'Get the alpha',
  },
  {
    slug: 'tadooer',
    group: 'apps',
    category: 'Private planner / self-hosted',
    headline: 'The plan, and the one thing now.',
    summary:
      'Here is the day. Your tasks sit beside the calendar on one time grid. Choose one to work on; the rest wait in the list. Tadooer is a planner you run on your own server for one owner, with a web app and a Linux desktop client. There is no hosted service and no sign-up.',
    highlights: ['One owner', 'Your server', 'Tasks beside the calendar', 'One focus at a time'],
    liveLabel: 'Read the source',
  },
  {
    slug: 'chatty-cat',
    group: 'apps',
    category: 'Twitch chat client / in migration',
    headline: 'All six channels in one scrollback.',
    summary:
      'A self-hosted Twitch chat client. Open up to six channels and read them as one log, with your palette, your font and your line height remembered. It is the old Chat Thing, rebuilt in Go and TypeScript so we can host it. The rebuild is still in progress, and the original app stays up until it reaches parity.',
    highlights: ['Six channels', 'Your settings, kept', 'Self-hosted', 'AGPL'],
    liveLabel: 'Open the chat',
  },
  {
    slug: 'backline',
    group: 'apps',
    category: 'Discord community bot / private pilot',
    headline: 'Keep your people together.',
    summary:
      'A Discord bot and dashboard for the person running the server: welcome and self-assigned roles, moderation with a case history, private tickets whose transcripts expire, feeds from Twitch, YouTube and RSS, and recovery snapshots. Twenty-three modules, each switched on per server. It is in a private pilot, and public installation is not open yet.',
    highlights: ['23 modules', 'Onboarding', 'Moderation', 'Tickets', 'Private pilot'],
    liveLabel: 'Read about the pilot',
  },
  {
    slug: 'arkhiv',
    group: 'apps',
    category: 'Zine archive',
    headline: 'The original file, and what we know about it.',
    summary:
      'Arkhiv keeps selected zines as the bytes they arrived in and serves a catalogue you can read in the browser or download. The first public collection is the Anarchist Zine Archive: 699 documents, most with unknown rights, so the archive offers no reuse license and says so.',
    highlights: ['699 documents', 'Original bytes', 'Reader and downloads', 'Rights stated'],
    liveLabel: 'Browse the archive',
  },
  {
    slug: 'overlaid',
    group: 'apps',
    category: 'Stream operator desk / in development',
    headline: 'Everything on air, on one screen.',
    summary:
      'Overlays for OBS (alerts, chat, ticker, goals, now playing, starting, BRB and ending), Twitch events fed into them, a chat bot with commands, timers and moderation, scene controls, rehearsal sessions and a health page that says what is wrong. It runs beside OBS on your own machine. In development; there is no public instance.',
    highlights: ['Ten overlays', 'Twitch EventSub', 'Chat bot', 'OBS scenes', 'Health page'],
  },
  {
    slug: 'pirs',
    group: 'tools',
    category: 'AT Protocol server / experiment',
    headline: 'A personal data server you can extend.',
    summary:
      'Pirs is a fork of the Bluesky personal data server with hook points for plugins: a draft specification, a status endpoint and a smoke test that boots a throwaway server. The plugin host is planned to run in a separate process that never receives signing keys. It is not production software and no plugin runs yet.',
    highlights: ['Draft spec', 'Hook points', 'Smoke test', 'No plugin yet'],
  },
  {
    slug: 'tmux-popups',
    group: 'tools',
    category: 'tmux plugin',
    headline: 'One row in a table, one popup in tmux.',
    summary:
      'A Prefix+Enter quick menu and direct bindings, generated from a TSV registry. Add a row, get a popup. Local overrides, dependency checks in the help screen, a doctor script for tmux and TPM problems, and a small or full profile. Bash only, no build step.',
    highlights: ['TSV registry', 'Quick menu', 'Doctor script', 'Bash only'],
  },
  {
    slug: 'omarchy-monitor-bar',
    group: 'plugins',
    category: 'Omarchy plugin',
    headline: 'Each monitor gets its own bar.',
    summary:
      'Full, Minimal or Hidden per monitor, with the primary locked to Full. Minimal bars show a glyph and the workspace list. The settings panel validates changes and checks the stock Omarchy bar files the plugin is pinned to. Ten languages.',
    highlights: ['Full / Minimal / Hidden', 'Settings panel', 'Ten languages'],
  },
  {
    slug: 'omarchy-superproductivity',
    group: 'plugins',
    category: 'Omarchy plugin',
    headline: 'The task you are on, in the top bar.',
    summary:
      'Your current Super Productivity task with a live countdown and overtime, Stop, Complete and Extend controls, a Today list, quick add with +project, @schedule and #tag, and a sound when a task runs out or is due to start. It talks to the desktop app over its local API.',
    highlights: ['Countdown', 'Today list', 'Quick add', 'Alerts'],
  },
  {
    slug: 'omarchy-plugin-spool',
    group: 'plugins',
    category: 'Omarchy desktop companion',
    headline: 'A cassette that knows what your agent is doing.',
    summary:
      'Spool is a violet cassette with acid-green limbs on the Omarchy desktop. Drag it, make it jump or wave, let it wander, and its eyes follow the pointer. A bridge reads agent activity from T3 Code and Codex and plays working, waiting, failure and review animations with a badge.',
    highlights: ['Drag, jump, wave', 'Follows the pointer', 'Agent activity'],
  },
  {
    slug: 'omarchy-plugin-shelfish',
    group: 'plugins',
    category: 'Omarchy plugin',
    headline: 'Twelve widgets, three shelves.',
    summary:
      'Shelfish puts existing Omarchy bar widgets into named, collapsible groups with an icon and a direction. A group opens when a member’s status changes, with a reveal policy per widget, and every widget goes back where it was before the plugin is removed. Ten languages, no runtime dependencies.',
    highlights: ['Named groups', 'Reveal on change', 'Restores on removal'],
  },
  {
    slug: 'obsidian-plugin-metronome-tuner',
    group: 'plugins',
    category: 'Obsidian plugin',
    headline: 'Count in. Tune up. Keep the notes open.',
    summary:
      'A metronome from 30 to 300 BPM with tap tempo, time signatures, accents and seven click sounds, and a chromatic tuner that shows the frequency, the cents and the nearest note, with A4 adjustable from 415 to 466 Hz. The microphone is used only after you opt in and the audio never leaves the device. Desktop and mobile.',
    highlights: ['30 to 300 BPM', 'Tap tempo', 'Chromatic tuner', 'Local audio only'],
  },
  {
    slug: 'super-productivity-mcp',
    group: 'tools',
    category: 'MCP server and bridge',
    headline: 'Add the task where you keep your tasks.',
    summary:
      'An MCP server, a plugin bridge and a quick-add launcher for Super Productivity. An assistant can create and list tasks and projects, add time, and manage schedules and recurrence through a file-based inbox and outbox. Quick add runs through Walker or a GTK popup on Omarchy. Broad writes are dry-run first.',
    highlights: ['MCP server', 'Plugin bridge', 'Quick add', 'Dry-run first'],
  },
] satisfies Array<Omit<ShowcaseProduct, 'project'> & { slug: string }>;

export function getShowcaseProducts(): ShowcaseProduct[] {
  return selections.map(({ slug, ...copy }) => {
    const project = getCuratedProjectBySlug(slug);
    if (!project) throw new Error(`Missing showcase product: ${slug}`);
    return { project, ...copy };
  });
}

/** Products shown at length on the home page: the catalog's `featured` flag. */
export function getFeaturedProducts(products: ShowcaseProduct[] = getShowcaseProducts()) {
  return products.filter(({ project }) => project.featured);
}

/** Products in directory order, grouped for /products and the home index. */
export function groupProducts(products: ShowcaseProduct[] = getShowcaseProducts()) {
  return (Object.keys(PRODUCT_GROUPS) as ProductGroup[]).map((group) => ({
    group,
    label: PRODUCT_GROUPS[group],
    products: products.filter((product) => product.group === group),
  }));
}
