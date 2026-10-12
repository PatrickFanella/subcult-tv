/**
 * Landing copy for each product. Voices are set in studio/content/VOICE.md
 * and facts in studio/content/social/Product Claims Register.md. The number
 * of features, steps and questions follows the product, so the arrays differ
 * in length on purpose.
 */
export interface LandingContent {
  audience: string;
  introduction: string;
  /** Eyebrow above the features. Defaults to "WHAT YOU CAN DO". */
  featuresLabel?: string;
  features: { title: string; description: string }[];
  /** Eyebrow and heading for the steps. Default to "A PLACE TO START" and "How it works". */
  stepsLabel?: string;
  stepsHeading?: string;
  steps: { title: string; description: string }[];
  /** Eyebrow and heading for the questions. Default to "A FEW DETAILS" and "Common questions". */
  faqLabel?: string;
  faqHeading?: string;
  faqs: { question: string; answer: string }[];
  closing: string;
}

export const PRODUCT_LANDINGS: Record<string, LandingContent> = {
  subsets: {
    audience: 'For people building a collection of skills for their agents.',
    introduction: 'Keep the collection. Choose the working set.',
    features: [
      {
        title: 'Discover local skills',
        description:
          'Scan supported user and project folders and see each skill’s location and owner.',
      },
      {
        title: 'Group them for the work',
        description:
          'Organize named groups for writing, development, or your own tasks. Keep everyday essentials in core.',
      },
      {
        title: 'Preview and recover',
        description:
          'Inspect changes before applying a set. Inactive skills remain in a private library, with transaction history and checked rollback.',
      },
    ],
    steps: [
      {
        title: 'Review your folders',
        description:
          'Discovery is read-only. Explicitly adopt an unmanaged folder before changing its selection.',
      },
      {
        title: 'Make a group',
        description: 'Pick skills in the TUI or create a named group from the command line.',
      },
      {
        title: 'Preview, then apply',
        description: 'Review the plan, apply the selection, and start a fresh agent session.',
      },
    ],
    faqs: [
      {
        question: 'What do I need to run it?',
        answer:
          'The native npm alpha needs Node.js 22 or newer. Linux is tested; macOS remains unverified and Windows is unsupported.',
      },
      {
        question: 'Does it take over every skill folder?',
        answer:
          'No. Discovery is read-only and adoption is explicit. Package, plugin, and installer-owned folders retain their owners.',
      },
      {
        question: 'Is it a browser or desktop application?',
        answer:
          'Subsets runs in your terminal. Its landing page shows actual captured TUI output using sample skills.',
      },
    ],
    closing: 'A set for the work at hand.',
  },
  'left-field': {
    audience: 'For researchers and organizers who read the methodology first.',
    introduction: 'Where we have no record, the page says so. It does not show a zero.',
    featuresLabel: 'WHAT IS ON THE PAGE',
    features: [
      {
        title: 'Seat records',
        description:
          'Incumbent, election and finance records, each with its date and its source. Coverage varies by seat and by type of evidence.',
      },
      {
        title: 'Where the field bends',
        description:
          'A priority brief breaks its score into components. Every score is provisional and versioned, and an input we could not find is listed as unavailable.',
      },
      {
        title: 'The source ledger',
        description:
          'The ledger and the methodology notes record where a claim came from, how it was read, and what is still unresolved.',
      },
    ],
    stepsLabel: 'METHOD',
    stepsHeading: 'A reading order',
    steps: [
      { title: 'Start with a seat', description: 'A seat record, or the priority index.' },
      {
        title: 'Read the limits',
        description:
          'Dates, component scores and the stated coverage gaps come before any conclusion.',
      },
      {
        title: 'Then read what we could not find',
        description: 'Go back to the source records and the methodology notes.',
      },
    ],
    faqLabel: 'LIMITS',
    faqHeading: 'What this is not',
    faqs: [
      {
        question: 'Is there a public app?',
        answer:
          'Not yet. Left Field is in active development. This page links to its public source repository, and no public app has been announced.',
      },
      {
        question: 'Do the scores predict an election result?',
        answer:
          'No. They are provisional research scores from a versioned method. Coverage gaps and unresolved evidence limit what they can be used to say.',
      },
      {
        question: 'Does Left Field profile individual voters?',
        answer:
          'No. It works with seat-level public records. Individual voter profiling, inferred political beliefs and demographic persuasion targeting are not in this project.',
      },
    ],
    closing: 'Provisional, versioned, and missing some records. The page says which.',
  },
  clpr: {
    audience: 'For anyone who has typed “anyone got the clip?” into chat.',
    introduction:
      'Clips by creator, topic and tag. Playlists for the ones you keep sending people.',
    featuresLabel: 'WHAT’S IN HERE',
    features: [
      {
        title: 'The bit',
        description:
          'See what’s trending, or go straight to a creator, a topic or a tag. It beats scrolling up through chat for the link.',
      },
      {
        title: 'The one from last Tuesday',
        description: 'Save a clip when you find it. Next time it comes up, you have it.',
      },
      {
        title: 'Playlists',
        description: 'The fails go in one. The running jokes go in another.',
      },
      {
        title: 'The group chat',
        description: 'Share one clip or a whole playlist. Somebody in there hasn’t seen it yet.',
      },
    ],
    stepsLabel: 'TWO STEPS, TOPS',
    stepsHeading: 'How it goes',
    steps: [
      {
        title: 'Go looking',
        description: 'Start with what’s trending, or pick a creator, a topic or a tag.',
      },
      {
        title: 'Keep what you find',
        description: 'Save it, drop it in a playlist, send the link.',
      },
    ],
    faqHeading: 'Quick answers',
    faqs: [
      {
        question: 'Is it only Twitch?',
        answer: 'Yes. clpr is for Twitch clips and the people who collect them.',
      },
      {
        question: 'Can I read the code?',
        answer: 'Yes, it’s public. The repository link is at the bottom of this page.',
      },
    ],
    closing: 'Somebody clipped it. Go look.',
  },
  patchwork: {
    audience: 'For neighbors, and for the mutual aid groups who already do this by hand.',
    introduction:
      'This is a demonstration. Look around and see how it would work, but please don’t post a real request yet.',
    featuresLabel: 'WHAT THE DEMO SHOWS',
    features: [
      {
        title: 'Asking and offering',
        description:
          'You can ask for what you need, such as a ride to an appointment or a hot meal. You can also offer what you have, like a spare crib. Both show up on a map and in a feed.',
      },
      {
        title: 'Where things are',
        description:
          'A request shows an approximate area. Resources that have been approved as public can show their addresses.',
      },
      {
        title: 'The account you already have',
        description:
          'You sign in with a Bluesky account. Patchwork is built on AT Protocol, the same open protocol Bluesky uses.',
      },
    ],
    stepsLabel: 'ONCE IT IS READY',
    stepsHeading: 'How it would go',
    steps: [
      {
        title: 'You notice a request nearby.',
        description: 'Read what the person is asking for before you answer.',
      },
      {
        title: 'You answer it.',
        description: 'Or you post an offer of your own and let someone find it.',
      },
      {
        title: 'The two of you sort out the details.',
        description: 'That part happens privately, between you and the other person.',
      },
    ],
    faqHeading: 'Things worth knowing first',
    faqs: [
      {
        question: 'Can I use Patchwork for a real request today?',
        answer:
          'Not yet. Patchwork is a pre-alpha prototype and the public site is a demonstration. Use it to see how it works. Please don’t rely on it to arrange real help.',
      },
      {
        question: 'Does posting a request mean help will come?',
        answer:
          'No. Patchwork lets people find a request and coordinate around it. Whether anyone can help is up to your neighbors and the groups near you.',
      },
      {
        question: 'Will people see my address?',
        answer:
          'A request shows an approximate area. Approved public resources can show their addresses.',
      },
      {
        question: 'What is Patchwork built on?',
        answer: 'AT Protocol, the open protocol also used by Bluesky.',
      },
    ],
    closing: 'It isn’t ready for real requests. It is ready for you to look around.',
  },
  hasanara: {
    audience: 'For viewers, researchers and anyone settling an argument about what was said.',
    introduction:
      'Good evening. The record holds years of HasanAbi broadcasts, transcribed and searchable by phrase.',
    featuresLabel: 'IN THIS EDITION',
    features: [
      {
        title: 'The record',
        description:
          'Search the transcripts by topic or by exact phrase. The search runs across every transcript in the archive.',
      },
      {
        title: 'Citations',
        description:
          'Each line of transcript carries a timestamp. Follow it and the recording opens at that moment.',
      },
      {
        title: 'Clippings',
        description: 'Save a passage for later, or share it with a link back to its source.',
      },
      {
        title: 'Corrections',
        description:
          'The transcripts are automatic and sometimes wrong. Check the tape before you quote it.',
      },
    ],
    stepsLabel: 'VIEWER GUIDE',
    stepsHeading: 'How to consult the record',
    steps: [
      { title: 'State your query', description: 'A phrase, a name or a subject.' },
      {
        title: 'Read around it',
        description: 'The surrounding transcript is there for context.',
      },
      {
        title: 'Go to the tape',
        description: 'Open the timestamp and hear it for yourself before you repeat it.',
      },
    ],
    faqLabel: 'LETTERS TO THE DESK',
    faqHeading: 'Viewers ask',
    faqs: [
      {
        question: 'Is every broadcast in the record?',
        answer:
          'We make no such claim. The record holds the broadcasts that have been archived and transcribed.',
      },
      {
        question: 'May I quote a transcript as it stands?',
        answer:
          'Check it first. Transcripts are generated automatically and can contain errors. Use the timestamp to compare the text with the recording.',
      },
      {
        question: 'How are HasanAra and Rekolekt connected?',
        answer: 'HasanAra runs on Rekolekt, the shared software for searchable recording archives.',
      },
    ],
    closing: 'This has been the record. Check the tape before you quote it.',
  },
  'transcript-create': {
    audience:
      'For the people who maintain a collection of recordings and field the questions about what is in it.',
    introduction:
      'The parts are a recording, its timestamped transcript, a search index, and the passages readers save, each one linked back to its source.',
    featuresLabel: 'CONTENTS',
    features: [
      {
        title: 'Ingestion',
        description:
          'Rekolekt takes in video recordings and produces a transcript in which every line carries its timestamp.',
      },
      {
        title: 'Search and citation',
        description:
          'Readers search or browse the archive, then save or share a passage. The passage keeps a link to the point in the recording where it was spoken.',
      },
      {
        title: 'Name and branding',
        description:
          'Each deployment supplies its own public profile and assets, so every archive runs under its own name. Changing them does not require forking or rebuilding the application.',
      },
    ],
    stepsLabel: 'FOR A NEW ARCHIVE',
    stepsHeading: 'Order of operations',
    steps: [
      {
        title: 'Deploy it for a collection',
        description: 'Supply the name, public profile and assets the archive will carry.',
      },
      {
        title: 'Add the recordings',
        description: 'Rekolekt transcribes them and stores the text with its timestamps.',
      },
      {
        title: 'Readers take it from there',
        description:
          'They search, read around a result, and save or share the passage with its link to the recording.',
      },
    ],
    faqLabel: 'NOTES',
    faqHeading: 'Before you ask',
    faqs: [
      {
        question: 'Is there a hosted version I can sign up for?',
        answer:
          'No. Rekolekt is software you deploy for a collection. There is no upload page and no sign-up. If you maintain a collection and want to talk about running it, write to us.',
      },
      {
        question: 'Can an archive use its own branding?',
        answer:
          'Yes. Each deployment supplies its own public profile and assets. Changing the branding does not require forking or rebuilding the application.',
      },
      {
        question: 'Where can I see one running?',
        answer:
          'HasanAra is an archive of HasanAbi broadcasts built on Rekolekt. It is linked on this page.',
      },
      {
        question: 'Where is the shared application maintained?',
        answer: 'In the subculture-collective/rekolekt repository.',
      },
    ],
    closing: 'Each archive runs under its own name. HasanAra is one.',
  },
  'subcult-os': {
    audience: 'For promoters, hosts and whoever ends up holding the list.',
    introduction:
      'A show is a schedule and a list of names. Subcult OS keeps both where the whole team can read them. It is still in development.',
    featuresLabel: 'THE RUN SHEET',
    features: [
      {
        title: 'The plan',
        description:
          'Set up the event, its schedule and its run of show. Everyone on the team reads the same version.',
      },
      {
        title: 'Crew',
        description: 'Invite the team and give each person a role before doors.',
      },
      {
        title: 'The list',
        description: 'Guests reserve free tickets. Paid ticketing is not on offer.',
      },
      {
        title: '19:00 doors',
        description: 'Check guests in by name or ticket code, on a phone.',
      },
      {
        title: '22:45 close-out',
        description: 'When the night ends you get a report, not a pile of screenshots.',
      },
    ],
    stepsLabel: 'STATUS: IN DEVELOPMENT',
    stepsHeading: 'How to try it',
    steps: [
      {
        title: 'Read the setup notes',
        description: 'The repository has the current code and the setup documentation.',
      },
      {
        title: 'Tell us about your night',
        description: 'If you want to use it for your own events, write to SUBCULT.',
      },
    ],
    faqLabel: 'NOTES FROM THE BOOTH',
    faqHeading: 'Asked at load-in',
    faqs: [
      {
        question: 'Can I run a real show on it?',
        answer:
          'Not as a service. Subcult OS is in development. The repository has the current code and setup documentation, and you can write to us if you want to try it for your events.',
      },
      {
        question: 'Does it sell tickets?',
        answer: 'It takes free reservations. We make no promises about paid ticketing or payouts.',
      },
      {
        question: 'Who is it for?',
        answer:
          'People putting on small live events who keep the plan, the staff, the tickets and the door in separate places and would like to stop.',
      },
    ],
    closing: 'Doors, show, close-out report. Stack the chairs.',
  },
  undertow: {
    audience: 'For musicians, small labels and whoever got asked to make the visualizer.',
    introduction: 'Six templates if you’re in a hurry. Every layer is yours to move if you’re not.',
    featuresLabel: 'THE PARTS',
    features: [
      {
        title: 'Layers',
        description:
          'Milkdrop visuals, spectrum, VU meters, artwork, text, looping video and particles. Stack them yourself or start from one of the six templates.',
      },
      {
        title: 'Lyrics: LRC, SRT, VTT',
        description:
          'Import timed lyrics in any of the three formats. Word-by-word timing works for karaoke.',
      },
      {
        title: '16:9, 9:16, 1:1',
        description:
          'Each layer keeps its own position in each layout, so you arrange the portrait cut separately from the landscape one.',
      },
      {
        title: 'H.264 MP4, 720p to 4K',
        description:
          'Export several formats in one go, or render a 15-second preview first. Rendering happens in your browser, so speed depends on your device.',
      },
    ],
    stepsLabel: 'SIGNAL PATH',
    stepsHeading: 'Track to video',
    steps: [
      {
        title: 'Load the track',
        description: 'Add the song, your artwork and a template.',
      },
      {
        title: 'Move things around',
        description: 'Adjust the layers, sync the lyrics and check each layout.',
      },
      {
        title: 'Render',
        description: 'Run the 15-second preview, then export the MP4s.',
      },
    ],
    faqLabel: 'FINE PRINT',
    faqHeading: 'Before you render',
    faqs: [
      {
        question: 'Does a local export upload my audio?',
        answer:
          'No. Audio analysis, rendering and MP4 encoding happen in your browser. Your audio doesn’t leave your machine.',
      },
      {
        question: 'Will it work in my browser?',
        answer:
          'Codec support and speed vary by browser and device. Run the 15-second preview before a full export.',
      },
      {
        question: 'What about cloud rendering?',
        answer:
          'Server-side rendering is being tested and live billing is switched off, so there is nothing to buy. Local export in the browser is how you render today.',
      },
      {
        question: 'Do I need an account?',
        answer:
          'No. An account is optional. It saves projects and defaults such as your artist name, socials and fonts.',
      },
    ],
    closing: 'It renders on your machine. Your audio doesn’t leave it.',
  },
  prichal: {
    audience:
      'For people and organizations who post on Bluesky and want the account to live on a server of their own.',
    introduction:
      'A server is the computer that stores your account: your name, your posts, your followers. Somebody has to keep it switched on and up to date. That is the job we do.',
    featuresLabel: 'WHAT YOU GET',
    features: [
      {
        title: 'A server of your own',
        description:
          'Your account gets its own personal data server on the open network Bluesky runs on. You keep posting from Bluesky. Nothing about that changes.',
      },
      {
        title: 'Your name as your username',
        description:
          'Use a domain you own as your handle, such as @yourband.com, so people can tell the account is really you.',
      },
    ],
    stepsLabel: 'PROCEDURE',
    stepsHeading: 'Dock your account. We handle the rest.',
    steps: [
      { title: 'Dock your account', description: 'Create your account on a Prichal server.' },
      {
        title: 'Post as usual',
        description: 'Use Bluesky or any app on the open network with the same account.',
      },
      {
        title: 'We handle the rest',
        description: 'Prichal keeps the server online and up to date.',
      },
    ],
    faqLabel: 'STATUS: PRIVATE PREVIEW',
    faqHeading: 'Questions',
    faqs: [
      {
        question: 'Can I sign up today?',
        answer:
          'Not yet. Prichal is a private preview. We are still testing hosting, backups and recovery, so the door is closed for now.',
      },
      {
        question: 'Are my posts private?',
        answer:
          'No. Posts on the open network are public wherever your server runs. Prichal changes who runs the server. It does not change who can read your posts.',
      },
      {
        question: 'What happens to my account if I leave?',
        answer:
          'Accounts on the open network can move to another host. We will document how before Prichal opens.',
      },
      {
        question: 'Can an organization bring its members?',
        answer:
          'That is the plan. Member accounts on an organization’s server are in development and not available yet.',
      },
    ],
    closing: 'Status: private preview. The door is closed for now.',
  },
  kork: {
    audience: 'For bands, streamers, small shops and anybody whose bio only has room for one link.',
    introduction: 'It’s free, and the list of what fits on a page is long.',
    featuresLabel: 'WHAT GOES ON THE PAGE',
    features: [
      {
        title: '92 services',
        description:
          'Socials, video and music, creator and shop pages, payments, crypto and contact. Each one gets its brand icon and a check on your handle. Instagram, Bluesky, Bandcamp, Cash App, Ko-fi and Bitcoin are all in there.',
      },
      {
        title: 'Your tips, your accounts',
        description:
          'Payment buttons link straight to your own Cash App, PayPal, Venmo or Ko-fi. We don’t take a cut because we never touch the money.',
      },
      {
        title: 'Blocks',
        description:
          'Links, headings, text, images, QR codes, copy buttons, a contact card, your location, tour dates, an email sign-up with double opt-in, and your latest video or post. Embeds play from YouTube, Vimeo, Spotify, SoundCloud, Twitch and Apple Music.',
      },
      {
        title: 'Ten themes',
        description:
          'Start from a preset, then change the colors, fonts, button styles and background. Stack your links or number them like a ledger.',
      },
      {
        title: 'Links on a timer',
        description:
          'Schedule a link to show up later, or set one to expire. Kork fetches link titles and thumbnails for you.',
      },
      {
        title: 'Numbers without snooping',
        description:
          'Daily totals of views, clicks, click-through, referrer domains and countries. No trackers, and no visitor IP addresses, cookies or user agents stored. There’s a weekly email if you want one.',
      },
    ],
    stepsLabel: 'FREE AND SELF-SERVE',
    stepsHeading: 'Getting your page up',
    steps: [
      {
        title: 'Sign up and confirm your email',
        description: 'New accounts wait 24 hours before they can publish.',
      },
      {
        title: 'Build it, or bring it',
        description:
          'Add your services and blocks, or import the page you already have on Linktree or another link service.',
      },
      {
        title: 'Put the link in your bio',
        description: 'Your page lives at kork.subcult.tv/yourname.',
      },
    ],
    faqLabel: 'THE SMALL PRINT, IN BIG PRINT',
    faqHeading: 'Fair questions',
    faqs: [
      {
        question: 'What does Kork cost?',
        answer:
          'Nothing. Kork is free to use. A paid Kork Pro plan is planned, and its price has not been set.',
      },
      {
        question: 'Does Kork track my visitors?',
        answer:
          'No. Analytics are anonymous daily totals of views, clicks, referrer domains and countries. Kork stores no visitor IP addresses, cookies or user agents.',
      },
      {
        question: 'Can I move my page from Linktree?',
        answer: 'Yes. Import it from Linktree or another link page.',
      },
      {
        question: 'Can I use my own domain?',
        answer: 'Not yet. Custom domain support is written but has not been rolled out.',
      },
      {
        question: 'Can I take my data with me?',
        answer: 'Yes. Download your account as a ZIP file, or delete it, from your settings.',
      },
      {
        question: 'How new is it?',
        answer: 'Kork launched on October 2, 2026. Expect rough edges.',
      },
    ],
    closing: 'It’s free, it’s new, and it will have rough edges. Tell us where!',
  },
  tadooer: {
    audience: 'For one person who runs their own server and wants the day on one screen.',
    introduction:
      'Here is the day. The tasks and the calendar sit together, and one of them is the thing you are doing now.',
    features: [
      {
        title: 'Capture, then plan',
        description:
          'Capture a task, give it a project or a tag, and place it on a day or a time block in the Planner. Boards group tasks by filters you choose.',
      },
      {
        title: 'One focus at a time',
        description:
          'Start a focus session from a task. One device controls it; another can follow or take over. The time lands in the worklog.',
      },
      {
        title: 'Your calendars, kept honest',
        description:
          'A Baikal CalDAV server, bundled or one you already run, is the calendar authority. Google Calendar connects as well. Conflicting edits ask for a decision instead of overwriting.',
      },
      {
        title: 'Yours to run',
        description:
          'SQLite on your server, encrypted connector credentials, and documented backup and restore. Task edits queue while a browser is offline and sync when it is back.',
      },
    ],
    steps: [
      {
        title: 'Run the server',
        description:
          'Compose with the bundled Baikal, or point it at an existing Baikal. The setup guide is in the repository.',
      },
      {
        title: 'Create the one owner',
        description:
          'The first visit creates the owner account. There is no second account and no sign-up page.',
      },
      {
        title: 'Open it where you work',
        description:
          'The web app, the Linux desktop client and your phone open the same planner over your server.',
      },
    ],
    faqs: [
      {
        question: 'Is there a hosted version?',
        answer:
          'No. Tadooer is a private tool for one owner. You run it; nothing about it is a public service.',
      },
      {
        question: 'What about my existing Super Productivity data?',
        answer:
          'The import reads a Super Productivity backup and keeps projects, tags, tasks and tracked time. The project started as a port of that app and has grown past it.',
      },
      {
        question: 'Does it work offline?',
        answer:
          'Task edits queue in the browser and sync when the server is reachable. Calendar and focus controls need a connection.',
      },
      {
        question: 'Which platforms?',
        answer:
          'A web app, a Linux desktop client and an Android shell that exists in source without a built app yet. All of them talk to the same server.',
      },
    ],
    closing: 'The plan, and the one thing now.',
  },
};
