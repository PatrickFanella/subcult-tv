export interface LandingContent {
  audience: string;
  introduction: string;
  features: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  closing: string;
}

export const PRODUCT_LANDINGS: Record<string, LandingContent> = {
  'left-field': {
    audience: 'For researchers and organizers who want to inspect the evidence behind a seat.',
    introduction:
      'Seat research starts with scattered records. Left Field brings election, incumbent, campaign-finance, and geography evidence together with their sources and coverage limits.',
    features: [
      {
        title: 'Read the seat record',
        description:
          'Inspect incumbent, election, and finance records with dates and source context. Coverage varies by seat and evidence type.',
      },
      {
        title: 'Inspect the score',
        description:
          'Explore priority briefs and their score components. Scores are provisional and versioned; missing inputs stay visible rather than becoming invented facts.',
      },
      {
        title: 'Follow the source trail',
        description:
          'Use the source ledger and methodology notes to see where a claim came from, how it was interpreted, and what remains unresolved.',
      },
    ],
    steps: [
      { title: 'Choose a seat', description: 'Start with a seat record or the priority index.' },
      {
        title: 'Read its context',
        description: 'Inspect the brief, component scores, dates, and stated coverage limits.',
      },
      {
        title: 'Check the evidence',
        description: 'Return to the source records and methodology before drawing a conclusion.',
      },
    ],
    faqs: [
      {
        question: 'Can I use a public app today?',
        answer:
          'Left Field is in active development. This page links to its public source repository; a public app destination has not been announced here.',
      },
      {
        question: 'Do the scores predict an election result?',
        answer:
          'No. They are provisional research scores from a versioned method. Coverage gaps and unresolved evidence limit how they can be interpreted.',
      },
      {
        question: 'Does Left Field profile individual voters?',
        answer:
          'No. The project works with seat-level public records. Individual voter profiling, inferred political beliefs, and demographic persuasion targeting are outside its scope.',
      },
    ],
    closing: 'Keep the source beside the claim.',
  },
  clpr: {
    audience: 'For viewers, clip curators, and the communities around a stream.',
    introduction:
      'Twitch makes clips easy to create and hard to find again. CLPR collects them in one place where you can browse, save, and pass them along.',
    features: [
      {
        title: 'Find the good moments',
        description:
          'Browse trending clips by creator, topic, and tag instead of relying on a link someone dropped in chat.',
      },
      {
        title: 'Keep your favorites',
        description: 'Save clips and organize them into playlists you can come back to.',
      },
      {
        title: 'Pass them along',
        description: 'Share a clip or a playlist and help a moment find its next audience.',
      },
    ],
    steps: [
      { title: 'Browse', description: 'Start with what is trending or follow a creator or topic.' },
      { title: 'Save', description: 'Keep the clips you like in a playlist.' },
      { title: 'Share', description: 'Send a clip or playlist to other viewers.' },
    ],
    faqs: [
      {
        question: 'What kind of clips is CLPR for?',
        answer: 'Twitch clips, and the viewers who collect and share them.',
      },
      {
        question: 'Can I read the source code?',
        answer: 'Yes. The repository is linked below.',
      },
    ],
    closing: 'Find your next favorite clip.',
  },
  patchwork: {
    audience: 'For neighbors, mutual aid groups, and people looking to help.',
    introduction:
      'Requests for help get lost in group chats and feeds. Patchwork puts local needs, offers, and resources in one place without publishing anyone’s exact location.',
    features: [
      {
        title: 'See what’s needed nearby',
        description:
          'Browse requests and resources on a map and in a feed. Public views show approximate areas, never exact addresses.',
      },
      {
        title: 'Ask for help or offer it',
        description: 'Post a request, respond to one, or offer what you can.',
      },
      {
        title: 'Built on an open network',
        description:
          'Patchwork uses AT Protocol, the open protocol behind Bluesky, so you sign in with your Bluesky account.',
      },
    ],
    steps: [
      { title: 'Look for a need', description: 'Browse requests and resources near you.' },
      {
        title: 'Read the details',
        description: 'Understand what someone is asking for before you respond.',
      },
      {
        title: 'Work it out together',
        description: 'Use private coordination tools to arrange the details with the other person.',
      },
    ],
    faqs: [
      {
        question: 'Can I use Patchwork for real requests today?',
        answer:
          'Not yet. Patchwork is a pre-alpha prototype and the public site is a demonstration environment. Use it to see how it works, not to arrange real help.',
      },
      {
        question: 'What is Patchwork built on?',
        answer: 'AT Protocol, the open protocol also used by Bluesky.',
      },
      {
        question: 'Does posting a request guarantee help?',
        answer:
          'No. Patchwork helps people find and coordinate around requests. Whether help comes depends on the people and groups who respond.',
      },
    ],
    closing: 'Start with a need. Find a connection.',
  },
  hasanara: {
    audience: 'For viewers, researchers, and anyone trying to find what was said on stream.',
    introduction:
      'Years of broadcasts hold moments people want to find again. HasanAra searches HasanAbi’s VOD transcripts and takes you from a result to the exact point in the recording.',
    features: [
      {
        title: 'Search what was said',
        description: 'Search transcripts by topic or exact phrase across the whole archive.',
      },
      {
        title: 'Go back to the recording',
        description: 'Follow a timestamp from the transcript to that moment in the VOD.',
      },
      {
        title: 'Keep the passage',
        description: 'Save or share a passage with a link to its source.',
      },
    ],
    steps: [
      {
        title: 'Search the archive',
        description: 'Look for a phrase or a subject.',
      },
      {
        title: 'Check the context',
        description: 'Read the surrounding transcript and open the original timestamp.',
      },
      {
        title: 'Save or share',
        description: 'Keep the passage or send it with its source attached.',
      },
    ],
    faqs: [
      {
        question: 'How are HasanAra and Rekolekt connected?',
        answer: 'HasanAra runs on Rekolekt, the shared software for searchable recording archives.',
      },
      {
        question: 'Should I check the original recording before quoting it?',
        answer:
          'Yes. Transcripts are generated automatically and can contain errors. Use the timestamp to check the recording before you quote it.',
      },
    ],
    closing: 'Find the moment you were looking for.',
  },
  'transcript-create': {
    audience: 'For archivists, creators, and anyone maintaining a collection of recordings.',
    introduction:
      'Hours of recordings are hard to search. Rekolekt transcribes them with timestamps so people can search the collection, cite a passage, and jump back to the source.',
    features: [
      {
        title: 'Turn recordings into text',
        description: 'Ingest videos and produce timestamped transcripts.',
      },
      {
        title: 'Search and cite',
        description:
          'Search and browse the archive, then save and share passages with their source attached.',
      },
      {
        title: 'Keep your own identity',
        description:
          'Each archive supplies its own name, branding, and assets while running the same software.',
      },
    ],
    steps: [
      {
        title: 'Bring in recordings',
        description: 'Add the long-form material you want people to find.',
      },
      {
        title: 'Build the archive',
        description: 'Rekolekt stores timestamped transcripts and makes them searchable.',
      },
      {
        title: 'Put passages to work',
        description: 'Readers find, save, and share moments with the source attached.',
      },
    ],
    faqs: [
      {
        question: 'Can an archive use its own branding?',
        answer:
          'Yes. Each deployment supplies its own public profile and assets. Changing the branding does not require forking or rebuilding the application.',
      },
      {
        question: 'Where can I see it running?',
        answer: 'HasanAra runs on Rekolekt. Follow the HasanAra link below to explore it.',
      },
      {
        question: 'Where is the shared application maintained?',
        answer:
          'The shared application is maintained in the subculture-collective/rekolekt repository. Each archive can use its own name and branding.',
      },
    ],
    closing: 'Give your recordings a searchable home.',
  },
  'subcult-os': {
    audience: 'For independent promoters, hosts, and the people running the door.',
    introduction:
      'Putting on a night means keeping the plan, the staff, the tickets, and the door in sync. Subcult OS keeps them in one shared workspace.',
    features: [
      {
        title: 'Plan the night',
        description:
          'Set up the event, its schedule, and its run of show where the whole team can see them.',
      },
      {
        title: 'Staff it',
        description: 'Invite your team and assign roles before doors open.',
      },
      {
        title: 'Run the door',
        description:
          'Take ticket reservations, then check guests in by name or ticket code on a phone.',
      },
    ],
    steps: [
      { title: 'Make the plan', description: 'Create the event and set the running order.' },
      {
        title: 'Bring in the team',
        description: 'Invite staff and give each person a role.',
      },
      {
        title: 'Open the doors',
        description: 'Check guests in as they arrive, then close out with an end-of-night report.',
      },
    ],
    faqs: [
      {
        question: 'Who is Subcult OS for?',
        answer:
          'People putting on small live events who want planning, staffing, tickets, and the door in one place.',
      },
      {
        question: 'How do I start using it?',
        answer:
          'The repository has the current code and setup documentation. If you want to use it for your events, contact SUBCULT.',
      },
    ],
    closing: 'Keep the team together. Put on the night.',
  },
  undertow: {
    audience: 'For independent musicians, labels, and anyone making visuals for a release.',
    introduction:
      'A release needs video for every platform. Undertow is a layered visualizer editor: build the video once, adjust it for each format, and render it on your own computer.',
    features: [
      {
        title: 'Compose in layers',
        description:
          'Stack Milkdrop visuals, spectrum and VU meters, artwork, text, looping video, and particles, or start from one of six templates.',
      },
      {
        title: 'Bring the lyrics in',
        description: 'Import LRC, SRT, or VTT lyrics, including word-by-word timing for karaoke.',
      },
      {
        title: 'Export every format',
        description:
          'Each layer keeps its own position in 16:9, 9:16, and 1:1. Export H.264 MP4 from 720p to 4K, several formats at once.',
      },
    ],
    steps: [
      {
        title: 'Start with your track',
        description: 'Add the song, your artwork, and a template.',
      },
      {
        title: 'Build the visual',
        description: 'Adjust layers, sync the lyrics, and check each format.',
      },
      {
        title: 'Export your video',
        description: 'Render MP4s in the browser, or a 15-second preview first.',
      },
    ],
    faqs: [
      {
        question: 'Does a local export upload my media?',
        answer:
          'No. Audio analysis, rendering, and MP4 encoding happen in your browser, so the media stays on your device.',
      },
      {
        question: 'What about cloud rendering?',
        answer:
          'Paid plans can render on the server instead. Cloud exports upload the files the render needs and delete them when the job ends.',
      },
      {
        question: 'Do I need an account?',
        answer:
          'No. Accounts are optional. They save projects and defaults such as your artist name, socials, and fonts.',
      },
    ],
    closing: 'Make the track a visual release.',
  },
  prichal: {
    audience: 'For creators and organizations who want their own place on the open social web.',
    introduction:
      'Your account on the open network Bluesky runs on lives on a server. Prichal runs that server for you, so your name, posts and followers sit somewhere that is yours without you administering a machine.',
    features: [
      {
        title: 'Your own server',
        description:
          'Each account gets a personal data server (PDS) on the open network. Keep posting from Bluesky like always.',
      },
      {
        title: 'Your name as your username',
        description:
          'Use a domain you own as your handle, such as @yourband.com, so people know the account is really you.',
      },
      {
        title: 'Room for your community',
        description:
          'Organizations will be able to invite members onto their server. Member accounts are in development and not available yet.',
      },
    ],
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
    faqs: [
      {
        question: 'Can I sign up today?',
        answer:
          'Not yet. Prichal is a private preview while hosting, backups and recovery are tested.',
      },
      {
        question: 'Are my posts private?',
        answer:
          'No. Posts on the open network are public, wherever your server runs. Prichal changes who runs the server, not who can read your posts.',
      },
      {
        question: 'What happens to my account if I leave?',
        answer:
          'Accounts on the open network can move to another host. Prichal will document how before it opens.',
      },
    ],
    closing: 'Your server. We keep it running.',
  },
  kork: {
    audience: 'For creators, musicians, small shops, and anyone who shares one link in a bio.',
    introduction:
      'A bio has room for one link. Kork turns it into a page with your socials, tip jars, music and video, QR codes, and contact card, in a theme you choose.',
    features: [
      {
        title: 'Pin every service',
        description:
          'Choose from 92 services with brand icons and handle checks, from Instagram and Bluesky to Bandcamp, Cash App, Ko-fi, and Bitcoin.',
      },
      {
        title: 'Keep every tip',
        description:
          'Payment buttons link straight to your own Cash App, PayPal, Venmo, or Ko-fi. Kork never takes a cut of tips or sales.',
      },
      {
        title: 'Make it yours',
        description:
          'Start from ten theme presets, then set your own colors, fonts, buttons, and background. Stack the links or number them as a ledger.',
      },
    ],
    steps: [
      {
        title: 'Sign up',
        description:
          'Create an account and confirm your email. New accounts can publish after 24 hours.',
      },
      {
        title: 'Build the page',
        description:
          'Add services, links, embeds, QR codes, tour dates, or an email sign-up, or import an existing Linktree page.',
      },
      {
        title: 'Share one link',
        description: 'Publish at kork.subcult.tv/yourname and put it in every bio.',
      },
    ],
    faqs: [
      {
        question: 'What does Kork cost?',
        answer:
          'Kork is free to use. A paid Kork Pro plan is planned, and its price has not been set.',
      },
      {
        question: 'Does Kork track my visitors?',
        answer:
          'No. Analytics are anonymous daily totals of views, clicks, referrer domains, and countries. Kork stores no visitor IP addresses, cookies, or user agents.',
      },
      {
        question: 'Can I move my page from Linktree?',
        answer:
          'Yes. Import from Linktree or another link page. Kork also fetches link titles and thumbnails for you.',
      },
      {
        question: 'Can I use my own domain?',
        answer: 'Not yet. Custom domain support is written but has not been rolled out.',
      },
      {
        question: 'Can I take my data with me?',
        answer: 'Yes. Download your account as a ZIP file, or delete it, from your settings.',
      },
    ],
    closing: 'Pin every link to one page.',
  },
};
