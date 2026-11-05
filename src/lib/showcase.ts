import { getCuratedProjectBySlug } from '@/lib/project-catalog';
import { getPublicProjectSource } from '@/lib/project-utils';
import type { Project } from '@/types';

export const PRODUCT_GROUPS = {
  apps: 'Apps and research',
  archives: 'Archive collections',
  software: 'Software you run',
  tools: 'Tools and skills',
  workshop: 'From the workshop',
} as const;
export type ProductGroup = keyof typeof PRODUCT_GROUPS;
export interface ProductRelationship {
  slug: string;
  label: string;
  description: string;
}
export interface ShowcaseProduct {
  project: Project;
  group: ProductGroup;
  category: string;
  availability: string;
  headline: string;
  summary: string;
  highlights: string[];
  relationships?: ProductRelationship[];
  liveLabel?: string;
  action?: { href: string; label: string };
  /** Existing pages stay reachable when they leave the selected catalogue. */
  listed?: boolean;
}
type Selection = Omit<ShowcaseProduct, 'project'> & { slug: string };
const selections: Selection[] = [
  {
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
    slug: 'undertow',
    availability: 'Public browser editor',
  },
  {
    group: 'apps',
    category: 'Free link pages',
    headline: 'One link in your bio, and everything else pinned to it.',
    summary:
      'Kork is a free link page for your socials, tip jars, music, video, QR codes and contact card, in a theme you pick. Tips go to your own accounts. We don’t take a cut because we never touch the money. New accounts can build immediately and publish after a 24-hour wait.',
    highlights: ['Free', '92 services', 'Ten themes', 'No cut of tips', '24-hour publish wait'],
    slug: 'kork',
    availability: 'Early public service',
  },
  {
    group: 'apps',
    category: 'Twitch clips',
    headline: 'The clip you can’t find is probably in here.',
    summary:
      'You saw it live, and now it’s buried under a week of chat. clpr sorts Twitch clips by creator, topic and tag. Sign in to save clips and collect them into playlists, then send them to whoever missed it.',
    highlights: ['by creator', 'by topic', 'by tag', 'playlists'],
    slug: 'clpr',
    availability: 'Public web app',
  },
  {
    group: 'apps',
    category: 'Broadcast archive',
    headline: 'Now on the record: what was said on stream, and when.',
    summary:
      'The Piker Broadcasting Service presents years of HasanAbi broadcasts, searchable by topic or exact phrase. Every result opens at its timestamp. The transcripts are machine-made, so check the tape before you quote it.',
    highlights: ['Phrase search', 'Timestamped results', 'Automatic transcripts'],
    slug: 'hasanara',
    availability: 'Public independent archive',
    relationships: [
      {
        slug: 'transcript-create',
        label: 'The archive backend',
        description:
          'HasanAra is an independently branded frontend for Rekolekt. Rekolekt supplies the search, transcript and passage API.',
      },
    ],
  },
  {
    group: 'apps',
    category: 'Twitch chat client',
    headline: 'The chats you follow, in one workspace.',
    summary:
      'A self-hosted Twitch chat workspace with merged or independent panes, retained display settings and support for larger channel collections. A merged pane starts with six channels; the configured workspace limit can reach 24. Read anonymously or sign in with Twitch to send. Built from Chat Thing’s lineage, with its attribution retained.',
    highlights: ['Merged or independent panes', 'Saved workspaces', 'Self-hosted', 'AGPL'],
    liveLabel: 'Open the chat',
    slug: 'chatty-cat',
    availability: 'Public web client',
  },
  {
    slug: 'commons',
    group: 'apps',
    category: 'Project discovery and collaboration',
    availability: 'Public discovery and community hub',
    headline: 'Build familiar tools in the open.',
    summary:
      'Browse open projects and curated references, compare alternatives to familiar software, and find work you can help build. Commons combines discovery, builder profiles and project discussions; contributions and saved projects use an account.',
    liveLabel: 'Explore Commons',
    highlights: [],
  },
  {
    group: 'apps',
    category: 'Twitch bot signals / early data',
    headline: 'Who is actually in the room?',
    summary:
      'Headcount follows Twitch channels that reach the global top 200 and examines viewers, chatters and follows for patterns that bots can produce. A high sus quotient is a reason to inspect the evidence, not proof that a streamer bought bots. Scores and coverage remain provisional.',
    highlights: ['Twitch top 200', 'Viewer and chat signals', 'Provisional scores', 'Read-only'],
    slug: 'headcount',
    availability: 'Public research / provisional signals',
  },
  {
    group: 'apps',
    category: 'Election research / in development',
    headline: 'A score here is a research note, not a forecast.',
    summary:
      'Left Field puts seat-level election, geography and campaign-finance records beside their sources and gaps. The public research site is in active development. Scores are provisional, versioned research notes, not forecasts or endorsements.',
    highlights: ['Provisional', 'Versioned', 'Seat-level public records'],
    slug: 'left-field',
    availability: 'Public research / in development',
  },
  {
    group: 'archives',
    category: 'Print, audio and video archive',
    headline: 'An archive across formats.',
    summary:
      'Arkhiv provides a public catalogue and the shared engine behind print, audio and video archives. Browse the hub or choose a collection below, with source context and available media beside each record.',
    highlights: ['Print', 'Audio', 'Video', 'Source context'],
    liveLabel: 'Browse the archive',
    slug: 'arkhiv',
    availability: 'Public archive hub',
    relationships: [
      {
        slug: 'dedhed',
        label: 'Archive collection',
        description: 'A limited public pilot for concert-tape listening and a shared schedule.',
      },
      {
        slug: 'lineage',
        label: 'Archive collection',
        description: 'Browse live recordings with their source credits and recording lineage.',
      },
      {
        slug: 'arkhiv-riot-grrrl',
        label: 'Archive collection',
        description: 'A reviewed zine collection with search and a public PDF reader.',
      },
      {
        slug: 'bill-nye-tv',
        label: 'Archive collection',
        description: 'An independent episode archive and scheduled science-TV replay viewer.',
      },
      {
        slug: 'democracy-now-tv',
        label: 'Archive collection',
        description: 'An independent broadcast archive and replay viewer using source streams.',
      },
    ],
  },
  {
    slug: 'dedhed',
    group: 'archives',
    category: 'Public listening pilot',
    availability: 'Public listening pilot',
    headline: 'Live tapes, shared air.',
    summary:
      'A free public listening pilot with two reviewed concert recordings, on-demand sets and a shared playback schedule. The broader metadata index is separate from what is approved to play.',
    liveLabel: 'Explore the listening pilot',
    highlights: [],
    relationships: [
      {
        slug: 'arkhiv',
        label: 'The shared archive engine',
        description:
          'Arkhiv supplies the catalogue and media tools behind this collection’s own interface and presentation.',
      },
    ],
  },
  {
    slug: 'lineage',
    group: 'archives',
    category: 'Live-recording catalogue preview',
    availability: 'Public catalogue preview',
    headline: 'Live recordings, with their lineage.',
    summary:
      'Explore live recordings by artist, venue and date, with recording credits and source lineage beside the music. Discovery, metadata and playable media have separate availability; an indexed recording is not a promise of playback.',
    liveLabel: 'Browse recordings',
    highlights: [],
    relationships: [
      {
        slug: 'arkhiv',
        label: 'The shared archive engine',
        description:
          'Arkhiv supplies the catalogue and media tools behind this collection’s own interface and presentation.',
      },
    ],
  },
  {
    slug: 'arkhiv-riot-grrrl',
    group: 'archives',
    category: 'Public print collection',
    availability: 'Public print collection',
    headline: 'Read the zines. Keep the source context.',
    summary:
      'Explore a reviewed collection of Riot Grrrl zines through a searchable catalogue and PDF reader. Source details stay beside each document.',
    liveLabel: 'Read the collection',
    highlights: [],
    relationships: [
      {
        slug: 'arkhiv',
        label: 'The shared archive engine',
        description:
          'Arkhiv supplies the catalogue and media tools behind this collection’s own interface and presentation.',
      },
    ],
  },
  {
    slug: 'bill-nye-tv',
    group: 'archives',
    category: 'Independent archive / replay',
    availability: 'Independent archive / replay',
    headline: 'Science TV, on replay.',
    summary:
      'Browse an independent Bill Nye episode library or watch its scheduled replay. This is an independently operated archive viewer, not an official Bill Nye service or a live broadcast.',
    liveLabel: 'Browse episodes',
    highlights: [],
    relationships: [
      {
        slug: 'arkhiv',
        label: 'The shared archive engine',
        description:
          'Arkhiv supplies the catalogue and media tools behind this collection’s own interface and presentation.',
      },
    ],
  },
  {
    slug: 'democracy-now-tv',
    group: 'archives',
    category: 'Independent archive / source streaming',
    availability: 'Independent archive / source streaming',
    headline: 'Return to the broadcast.',
    summary:
      'Browse broadcasts and scheduled replays through an independent archive viewer, with video streamed from Internet Archive. This is an independently operated collection, unaffiliated with Democracy Now!',
    liveLabel: 'Browse broadcasts',
    highlights: [],
    relationships: [
      {
        slug: 'arkhiv',
        label: 'The shared archive engine',
        description:
          'Arkhiv supplies the catalogue and media tools behind this collection’s own interface and presentation.',
      },
    ],
  },
  {
    group: 'software',
    category: 'Archive software',
    headline: 'A four-hour recording is a bad place to keep a sentence.',
    summary:
      'Rekolekt is the headless backend for timestamped, searchable recording archives. It transcribes recordings, indexes text and resolves passages back to the source timestamp. Each archive owns its frontend; HasanAra is one such frontend. You deploy the software yourself.',
    highlights: ['Recording', 'Transcript', 'Timestamp', 'Passage'],
    slug: 'transcript-create',
    availability: 'Self-hosted archive backend',
    relationships: [
      {
        slug: 'hasanara',
        label: 'A frontend built on Rekolekt',
        description:
          'HasanAra owns its broadcast-archive interface and branding. Rekolekt is the shared backend; it ships no web pages.',
      },
    ],
  },
  {
    group: 'software',
    category: 'Private planner / self-hosted',
    headline: 'The plan, and the one thing now.',
    summary:
      'Here is the day. Your tasks sit beside the calendar on one time grid. Choose one to work on; the rest wait in the list. Tadooer is a planner you run on your own server for one owner. Use the web app or its desktop and mobile prerelease clients. There is no hosted service and no sign-up.',
    highlights: ['One owner', 'Your server', 'Tasks beside the calendar', 'One focus at a time'],
    liveLabel: 'Read the source',
    slug: 'tadooer',
    availability: 'Self-hosted / single owner',
  },
  {
    group: 'tools',
    category: 'Local agent tools / npm alpha',
    headline: 'The skills this job needs, and none of the others.',
    summary:
      'Subsets discovers local agent skills, groups them for a task and previews changes before applying a set. Keep inactive skills in a private library and roll back a selection when needed. The current source includes a portable patstack collection; check the install guide for what the published alpha includes.',
    highlights: ['Discover local skills', 'Group and preview', 'Apply your set'],
    liveLabel: 'Get the alpha',
    slug: 'subsets',
    availability: 'Local CLI and TUI / alpha',
    relationships: [
      {
        slug: 'patstack',
        label: 'The skill collection',
        description:
          'Subsets manages selection and previews changes. patstack supplies maintained skills and groups for different kinds of work.',
      },
    ],
  },
  {
    slug: 'patstack',
    action: { href: '/products/subsets', label: 'Read about Subsets' },
    group: 'tools',
    category: 'Skill collection / used with Subsets',
    availability: 'Skill collection / used with Subsets',
    headline: 'The collection behind the working set.',
    summary:
      'A maintained collection of agent skills and groups for different kinds of work. Use it with Subsets to choose the skills for a task and preview the changes. A portable patstack pack is available in the current Subsets source; check the install guide for the published alpha.',
    liveLabel: 'Read about Subsets',
    highlights: [],
    relationships: [
      {
        slug: 'subsets',
        label: 'Selection and preview',
        description:
          'Use Subsets to discover local skills and choose a working set. Check its install guide for what the published alpha includes.',
      },
    ],
  },
  {
    group: 'tools',
    category: 'Obsidian plugin',
    headline: 'Count in. Tune up. Keep the notes open.',
    summary:
      'A metronome from 30 to 300 BPM with tap tempo, time signatures, accents and seven click sounds, and a chromatic tuner that shows the frequency, the cents and the nearest note, with A4 adjustable from 415 to 466 Hz. The microphone is used only after you opt in and the audio never leaves the device. Desktop and mobile.',
    highlights: ['30 to 300 BPM', 'Tap tempo', 'Chromatic tuner', 'Local audio only'],
    slug: 'obsidian-plugin-metronome-tuner',
    availability: 'Obsidian plugin',
  },
  {
    group: 'tools',
    category: 'MCP server and bridge',
    headline: 'Add the task where you keep your tasks.',
    summary:
      'An MCP server, a plugin bridge and a quick-add launcher for Super Productivity. An assistant can create and list tasks and projects, add time, and manage schedules and recurrence through a file-based inbox and outbox. Quick add runs through Walker or a GTK popup on Omarchy. Broad writes are dry-run first.',
    highlights: ['MCP server', 'Plugin bridge', 'Quick add', 'Dry-run first'],
    slug: 'super-productivity-mcp',
    availability: 'Local MCP server and plugin bridge',
  },
  {
    slug: 'ytclip',
    group: 'tools',
    category: 'Local CLI / source install',
    availability: 'Local CLI / source install',
    headline: 'A timestamped clip from the command line.',
    summary:
      'A small local Bash utility for downloading complete YouTube videos or precise timestamped clips. It uses yt-dlp and ffmpeg, with installation instructions in the source repository.',
    liveLabel: 'Read the source',
    highlights: [],
  },
  {
    slug: 'twitchdl',
    group: 'tools',
    category: 'Local CLI / in development',
    availability: 'Local CLI / in development',
    headline: 'Keep a recording from the terminal.',
    summary:
      'A local Go command-line tool for downloading Twitch clips and VODs and recording live streams. The foundation is functional; discovery, scheduling and authenticated workflows remain outside its current scope.',
    liveLabel: 'Read the source',
    highlights: [],
  },
  {
    group: 'tools',
    category: 'tmux plugin',
    headline: 'One row in a table, one popup in tmux.',
    summary:
      'A Prefix+Enter quick menu and direct bindings, generated from a TSV registry. Add a row, get a popup. Local overrides, dependency checks in the help screen, a doctor script for tmux and TPM problems, and a small or full profile. Bash only, no build step.',
    highlights: ['TSV registry', 'Quick menu', 'Doctor script', 'Bash only'],
    slug: 'tmux-popups',
    availability: 'tmux toolkit / source install',
  },
  {
    group: 'workshop',
    category: 'Mutual aid / pre-alpha demo',
    headline: 'A neighborhood board for asking and offering help.',
    summary:
      'Someone two streets over needs a ride on Thursday, and you have a car on Thursday. Patchwork is where the two of you would find each other. It is a pre-alpha demonstration, so please don’t arrange real help through it yet.',
    highlights: ['Demonstration only', 'Requests show an approximate area'],
    liveLabel: 'Try the demo',
    slug: 'patchwork',
    availability: 'Development preview / no real help requests',
  },
  {
    slug: 'clustr-galaxy',
    group: 'workshop',
    category: 'Unity client / in development',
    availability: 'Unity prototype / no public build',
    headline: 'Fly through a community universe.',
    summary:
      'Explore and survey Clustr’s community graph as a galaxy, with controller-first navigation. This Unity prototype is being developed for Linux. Linux builds and a public beta are not yet qualified.',
    liveLabel: 'Ask about the project',
    highlights: [],
  },
  {
    slug: 'the-common-house',
    group: 'workshop',
    category: 'Game prototype / no public release',
    availability: 'Game prototype / no public release',
    headline: 'The calls lead back to the house.',
    summary:
      'A first-person narrative-investigation game prototype about found family at a communal radio outpost after societal collapse. Public playtesting and a release are still ahead.',
    liveLabel: 'Ask about the project',
    highlights: [],
  },
  {
    group: 'workshop',
    category: 'Discord community bot / private pilot',
    headline: 'Keep your people together.',
    summary:
      'A Discord bot and dashboard for the person running the server: welcome and self-assigned roles, moderation with a case history, private tickets whose transcripts expire, feeds from Twitch, YouTube and RSS, and recovery snapshots. Twenty-three modules, each switched on per server. It is in a private pilot, and public installation is not open yet.',
    highlights: ['23 modules', 'Onboarding', 'Moderation', 'Tickets', 'Private pilot'],
    liveLabel: 'Read about the pilot',
    slug: 'backline',
    availability: 'Private pilot / installation closed',
  },
  {
    group: 'workshop',
    category: 'Account hosting / private preview',
    headline: 'Your server. We keep it running.',
    summary:
      'Every account on the open social web lives on a server somewhere. Prichal gives yours a server of its own, and we do the maintenance. You keep posting from Bluesky. Status: private preview, with no sign-up yet.',
    highlights: ['Private preview', 'No sign-up yet'],
    liveLabel: 'See the preview',
    slug: 'prichal',
    availability: 'Private preview / no sign-up',
    relationships: [
      {
        slug: 'pirs',
        label: 'Related server research',
        description:
          'Pirs explores server extension hooks. Prichal’s managed hosting remains on the upstream server until alternatives qualify.',
      },
    ],
  },
  {
    group: 'workshop',
    category: 'AT Protocol server / experiment',
    headline: 'Exploring extensions for a personal data server.',
    summary:
      'Pirs is experimental AT Protocol server research: a draft hook-point specification, a separate bounded Wasmtime host and an opt-in private event bridge. The host is not production-qualified and no PDS plugin hook is supported yet. Prichal uses the upstream server for managed hosting.',
    highlights: [
      'Draft hook-point spec',
      'Separate Wasmtime host',
      'Bounded components',
      'Experimental',
    ],
    slug: 'pirs',
    availability: 'Experimental server research',
    relationships: [
      {
        slug: 'prichal',
        label: 'The hosting project',
        description:
          'Prichal is a separate managed-hosting project in private preview. Pirs is experimental server research, not a public hosting offer.',
      },
    ],
  },
  {
    group: 'workshop',
    category: 'Live events / in development',
    headline: '19:00 doors, and the whole team on one sheet.',
    summary:
      'A run sheet for small shows: the plan, the crew, ticket reservations, check-in at the door and a report when the night ends. Subcult OS is still in development.',
    highlights: ['17:00 load-in', '19:00 doors', '22:45 close-out'],
    slug: 'subcult-os',
    availability: 'Alpha / in development',
  },
  {
    group: 'tools',
    category: 'Omarchy plugin',
    headline: 'Each monitor gets its own bar.',
    summary:
      'Full, Minimal or Hidden per monitor, with the primary locked to Full. Minimal bars show a glyph and the workspace list. The settings panel validates changes and checks the stock Omarchy bar files the plugin is pinned to. Ten languages.',
    highlights: ['Full / Minimal / Hidden', 'Settings panel', 'Ten languages'],
    slug: 'omarchy-monitor-bar',
    listed: false,
    availability: 'Omarchy plugin',
  },
  {
    group: 'tools',
    category: 'Omarchy plugin',
    headline: 'The task you are on, in the top bar.',
    summary:
      'Your current Super Productivity task with a live countdown and overtime, Stop, Complete and Extend controls, a Today list, quick add with +project, @schedule and #tag, and a sound when a task runs out or is due to start. It talks to the desktop app over its local API.',
    highlights: ['Countdown', 'Today list', 'Quick add', 'Alerts'],
    slug: 'omarchy-superproductivity',
    listed: false,
    availability: 'Omarchy plugin',
  },
  {
    group: 'tools',
    category: 'Omarchy desktop companion',
    headline: 'A cassette that knows what your agent is doing.',
    summary:
      'Spool is a violet cassette with acid-green limbs on the Omarchy desktop. Drag it, make it jump or wave, let it wander, and its eyes follow the pointer. A bridge reads agent activity from T3 Code and Codex and plays working, waiting, failure and review animations with a badge.',
    highlights: ['Drag, jump, wave', 'Follows the pointer', 'Agent activity'],
    slug: 'omarchy-plugin-spool',
    listed: false,
    availability: 'Omarchy desktop companion',
  },
  {
    group: 'tools',
    category: 'Omarchy plugin',
    headline: 'Twelve widgets, three shelves.',
    summary:
      'Shelfish puts existing Omarchy bar widgets into named, collapsible groups with an icon and a direction. A group opens when a member’s status changes, with a reveal policy per widget, and every widget goes back where it was before the plugin is removed. Ten languages, no runtime dependencies.',
    highlights: ['Named groups', 'Reveal on change', 'Restores on removal'],
    slug: 'omarchy-plugin-shelfish',
    listed: false,
    availability: 'Omarchy plugin',
  },
  {
    group: 'tools',
    category: 'Stream operator desk / in development',
    headline: 'Everything on air, on one screen.',
    summary:
      'Overlays for OBS (alerts, chat, ticker, goals, now playing, starting, BRB and ending), Twitch events fed into them, a chat bot with commands, timers and moderation, scene controls, rehearsal sessions and a health page that says what is wrong. It runs beside OBS on your own machine. In development; there is no public instance.',
    highlights: ['Ten overlays', 'Twitch EventSub', 'Chat bot', 'OBS scenes', 'Health page'],
    slug: 'overlaid',
    listed: false,
    availability: 'Stream operator desk / in development',
  },
];
export function getShowcaseProducts({ includeUnlisted = false } = {}): ShowcaseProduct[] {
  return selections
    .filter((item) => includeUnlisted || item.listed !== false)
    .map(({ slug, ...copy }) => {
      const project = getCuratedProjectBySlug(slug);
      if (!project) throw new Error(`Missing showcase product: ${slug}`);
      return { project, ...copy };
    });
}
export const HOMEPAGE_LEADS = ['undertow', 'kork', 'clpr', 'hasanara'] as const;
export function getFeaturedProducts(products: ShowcaseProduct[] = getShowcaseProducts()) {
  return HOMEPAGE_LEADS.flatMap((slug) => products.filter(({ project }) => project.slug === slug));
}
export function groupProducts(products: ShowcaseProduct[] = getShowcaseProducts()) {
  return (Object.keys(PRODUCT_GROUPS) as ProductGroup[])
    .map((group) => ({
      group,
      label: PRODUCT_GROUPS[group],
      products: products.filter((product) => product.listed !== false && product.group === group),
    }))
    .filter(({ products }) => products.length > 0);
}
export function getProductAction(product: ShowcaseProduct, label = `Open ${product.project.name}`) {
  if (product.action) return product.action;
  if (product.project.url) return { href: product.project.url, label: product.liveLabel ?? label };
  const source = getPublicProjectSource(product.project);
  if (source) return { href: source, label: 'Read the source' };
  return { href: `/contact?product=${product.project.slug}`, label: 'Ask about the project' };
}
