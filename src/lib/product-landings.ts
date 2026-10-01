export interface LandingContent {
  audience: string;
  introduction: string;
  features: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  closing: string;
}

export const PRODUCT_LANDINGS: Record<string, LandingContent> = {
  clpr: {
    audience: 'For viewers, curators, and the communities around a stream.',
    introduction:
      'A great clip should be easy to find again. CLPR gives Twitch moments a place to be discovered, collected, and passed around.',
    features: [
      {
        title: 'Find the good moments',
        description:
          'Discover Twitch clips and browse beyond the one link someone dropped in chat.',
      },
      {
        title: 'Give your favorites a home',
        description: 'Organize saved clips into collections you can return to.',
      },
      {
        title: 'Share your taste',
        description: 'Share favorites with other viewers and help a moment find its next audience.',
      },
    ],
    steps: [
      { title: 'Discover', description: 'Browse clips and find something worth watching.' },
      { title: 'Collect', description: 'Save your favorites in an organized collection.' },
      { title: 'Share', description: 'Pass a clip or collection along to other viewers.' },
    ],
    faqs: [
      {
        question: 'What kind of clips is CLPR for?',
        answer: 'CLPR is built around Twitch clips and the viewers who curate them.',
      },
      {
        question: 'Can I look at the source code?',
        answer:
          'Yes. The repository is linked below, so you can inspect the application and follow its development.',
      },
    ],
    closing: 'Find your next favorite clip.',
  },
  patchwork: {
    audience: 'For neighbors, mutual aid groups, and people looking to help.',
    introduction:
      'Community needs are easy to lose in a feed. Patchwork makes mutual aid requests searchable and brings coordination onto an open network.',
    features: [
      {
        title: 'Find a request',
        description: 'Search mutual aid requests to find a need you can respond to.',
      },
      {
        title: 'Connect around a need',
        description:
          'Use a shared place for discovering requests and coordinating community support.',
      },
      {
        title: 'Build on an open network',
        description:
          'Patchwork uses AT Protocol, with search and moderation tools supporting the network.',
      },
    ],
    steps: [
      { title: 'Look for a need', description: 'Start with a search for community requests.' },
      {
        title: 'Read the context',
        description: 'Understand what someone is asking for before you respond.',
      },
      { title: 'Connect', description: 'Find a way to contribute or coordinate support.' },
    ],
    faqs: [
      {
        question: 'What is Patchwork built on?',
        answer: 'Patchwork is built on AT Protocol, the open protocol also used by Bluesky.',
      },
      {
        question: 'Does finding a request guarantee help?',
        answer:
          'Patchwork helps people discover and coordinate around requests. Whether help is available depends on the people and groups responding.',
      },
    ],
    closing: 'Start with a need. Find a connection.',
  },
  hasanara: {
    audience: 'For viewers, researchers, and anyone trying to find what was said.',
    introduction:
      'Long recordings contain moments you want to revisit. HasanAra lets you search the transcript, find a passage, and keep the original recording close at hand.',
    features: [
      {
        title: 'Search what was said',
        description: 'Find words and passages across the archive through searchable transcripts.',
      },
      {
        title: 'Return to the recording',
        description: 'Follow timestamps back to the moment in the source video.',
      },
      {
        title: 'Keep the passage',
        description:
          'Save or share a passage with the context needed to understand where it came from.',
      },
    ],
    steps: [
      {
        title: 'Search the archive',
        description: 'Look for a phrase, subject, or moment in the transcripts.',
      },
      {
        title: 'Check the context',
        description: 'Read the surrounding passage and return to the original timestamp.',
      },
      {
        title: 'Save or share',
        description: 'Keep the passage or send it along with its source attached.',
      },
    ],
    faqs: [
      {
        question: 'How are HasanAra and Rekolekt connected?',
        answer:
          'HasanAra is an archive experience powered by Rekolekt, the shared application for searchable recordings and passages.',
      },
      {
        question: 'Should I check the original recording?',
        answer:
          'Yes. Transcripts make recordings searchable, but transcription can contain errors. Use the timestamp and surrounding context to check a quotation.',
      },
    ],
    closing: 'Find the moment you were looking for.',
  },
  'transcript-create': {
    audience: 'For archivists, creators, and people maintaining recorded collections.',
    introduction:
      'Rekolekt turns long-form recordings into a collection people can explore. Searchable text, timestamps, and saved passages bring the archive within reach.',
    features: [
      {
        title: 'Turn recordings into text',
        description: 'Ingest recordings and create timestamped transcripts for your collection.',
      },
      {
        title: 'Make the archive useful',
        description:
          'Browse and search the archive, then save and share passages with source context.',
      },
      {
        title: 'Make it your archive',
        description:
          'Use your own archive identity and branding while running the shared application core.',
      },
    ],
    steps: [
      {
        title: 'Bring in recordings',
        description: 'Ingest the long-form material you want people to find.',
      },
      {
        title: 'Build the archive',
        description: 'Store timestamped transcripts and make the collection searchable.',
      },
      {
        title: 'Put passages to work',
        description: 'Help readers find, save, and share moments with their sources attached.',
      },
    ],
    faqs: [
      {
        question: 'Can the archive use its own branding?',
        answer:
          'Yes. Each deployment can supply its own public profile and assets while using the same application core.',
      },
      {
        question: 'Where can I see an archive using it?',
        answer:
          'HasanAra is built on the shared application. Follow the HasanAra link below to explore that archive.',
      },
      {
        question: 'Why does the repository say transcript-create?',
        answer:
          'Rekolekt is the working product name for Transcript Creator. The repository remains transcript-create.',
      },
    ],
    closing: 'Give your recordings a searchable home.',
  },
  'subcult-os': {
    audience: 'For independent promoters, hosts, and the people running the door.',
    introduction:
      'Putting on a night means keeping the plan, guest list, door, and schedule in sync. Subcult OS brings those jobs into a shared event workspace.',
    features: [
      {
        title: 'Plan the night',
        description:
          'Organize the event and its run of show so the team can work from the same plan.',
      },
      {
        title: 'Keep the guest list close',
        description: 'Manage invites and guest information alongside the event.',
      },
      {
        title: 'Run the door',
        description: 'Use mobile ticket scanning and door tools when guests arrive.',
      },
    ],
    steps: [
      { title: 'Make the plan', description: 'Set up the event and prepare the running order.' },
      {
        title: 'Coordinate the team',
        description: 'Bring guest lists, invites, and event information into the workspace.',
      },
      {
        title: 'Open the doors',
        description: 'Use the door and scanning tools to welcome people in.',
      },
    ],
    faqs: [
      {
        question: 'Who is Subcult OS designed for?',
        answer:
          'It is designed for people putting on small live events who need planning, guest lists, schedules, and door tools together.',
      },
      {
        question: 'Where can I learn about running it?',
        answer:
          'Start with the repository for the current code and setup documentation. Contact SUBCULT if you want to discuss using it for your events.',
      },
    ],
    closing: 'Keep the team together. Put on the night.',
  },
  undertow: {
    audience: 'For independent musicians, labels, and people making visuals for sound.',
    introduction:
      'Turn a track into something people can watch. Undertow combines audio-reactive visuals, artwork, lyrics, and video in a layered music visualizer editor.',
    features: [
      {
        title: 'Compose in layers',
        description:
          'Combine visualizers, images, text, video backgrounds, and particles in one composition.',
      },
      {
        title: 'Bring the lyrics in',
        description: 'Use timed lyrics to connect the words with the music.',
      },
      {
        title: 'Export for the release',
        description:
          'Create landscape, portrait, and square layouts, then export MP4 videos locally in your browser.',
      },
    ],
    steps: [
      {
        title: 'Start with your track',
        description: 'Bring in the audio and choose a starting layout.',
      },
      {
        title: 'Build the visual',
        description: 'Layer artwork, audio-reactive effects, and timed lyrics.',
      },
      {
        title: 'Export your video',
        description: 'Adapt the layout to your chosen format and render an MP4.',
      },
    ],
    faqs: [
      {
        question: 'Does a local export upload my media?',
        answer:
          'Local analysis, rendering, and MP4 encoding happen in your browser, keeping the media on your device.',
      },
      {
        question: 'How is cloud rendering different?',
        answer:
          'Cloud exports upload the files needed for the render and delete those inputs when the job ends. Optional accounts and cloud rendering are separate from the local export workflow.',
      },
      {
        question: 'Which formats can I design for?',
        answer: 'Undertow supports landscape 16:9, portrait 9:16, and square 1:1 layouts.',
      },
    ],
    closing: 'Make the track a visual release.',
  },
};
