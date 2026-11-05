/** Selected visuals; source/output hashes are in docs/portfolio-visual-provenance.json. */
export interface ProductVisualAsset {
  src: string;
  kind: 'screenshot' | 'terminal-render' | 'repository-image' | 'diagram';
  alt: string;
  caption: string;
}
export const CURRENT_PRODUCT_VISUALS: Record<string, ProductVisualAsset> = {
  undertow: {
    src: '/screenshots/undertow-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Undertow: Current editor with the Neon template, an original sample tone and a custom SUBCULT title.',
    caption: 'Live editor / local sample project / November 5, 2026',
  },
  kork: {
    src: '/screenshots/kork-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Kork: Public landing with the pinned-card identity and link-page features.',
    caption: 'Public Kork landing page / November 5, 2026',
  },
  clpr: {
    src: '/screenshots/clpr-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'clpr: Populated trending clip feed with creators, playback, topics and tags.',
    caption: 'Public clip feed / optional cookies rejected / November 5, 2026',
  },
  hasanara: {
    src: '/screenshots/hasanara-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'HasanAra: Transcript search results for labor, grouped by broadcast with passages and timestamps.',
    caption: 'Public transcript search for “labor” / November 5, 2026',
  },
  commons: {
    src: '/screenshots/commons-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Commons: Project discovery with curated references, categories and software-alternative links.',
    caption: 'Public project discovery / November 5, 2026',
  },
  'chatty-cat': {
    src: '/screenshots/chatty-cat-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Chatty Cat: Current anonymous workspace with the hasanabi chat log, emotes and sign-in controls.',
    caption: 'Public chat workspace / anonymous viewing / November 5, 2026',
  },
  headcount: {
    src: '/screenshots/headcount-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Headcount: Engagement map plotting recently scored streams by viewers and chatters, with a typical-range band.',
    caption: 'Public engagement map / provisional signals / November 5, 2026',
  },
  'left-field': {
    src: '/screenshots/left-field-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Left Field: Priority index with its model date, evidence filters, component scores and stated coverage.',
    caption: 'Public research index / provisional versioned scores / November 5, 2026',
  },
  arkhiv: {
    src: '/screenshots/arkhiv-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Arkhiv: Populated mixed-format catalogue with collection, media, creator and date filters.',
    caption: 'Public mixed-format catalogue / November 5, 2026',
  },
  dedhed: {
    src: '/screenshots/dedhed-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Dedhed: Two-tape public pilot with its tape rack, schedule and active muted replay player.',
    caption: 'Public listening pilot / scheduled replay selected / November 5, 2026',
  },
  lineage: {
    src: '/screenshots/lineage-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Lineage: Live-recording catalogue with artist discovery, metadata search and recording-credit context.',
    caption: 'Public catalogue preview / recording availability varies / November 5, 2026',
  },
  'arkhiv-riot-grrrl': {
    src: '/screenshots/arkhiv-riot-grrrl-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Riot Grrrl Zine Archive: Pink collage interface with a featured zine and collection navigation.',
    caption: 'Public zine collection / November 5, 2026',
  },
  'bill-nye-tv': {
    src: '/screenshots/bill-nye-tv-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Bill Nye TV: Independent episode viewer with a science-TV frame and scheduled archive replay controls.',
    caption: 'Independent archive viewer / November 5, 2026',
  },
  'democracy-now-tv': {
    src: '/screenshots/democracy-now-tv-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Democracy Now! broadcast archive: Independent broadcast archive with a source image and shared replay schedule.',
    caption: 'Independent broadcast archive / November 5, 2026',
  },
  patchwork: {
    src: '/screenshots/patchwork-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Patchwork: Pre-alpha landing with its demonstration notice and public-resource directory preview.',
    caption: 'Public pre-alpha demonstration / not for real requests / November 5, 2026',
  },
  backline: {
    src: '/screenshots/backline-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Backline: Private-pilot landing with illustrative welcome, moderation and support workflows.',
    caption: 'Public pilot landing / illustrative workflows, not a dashboard / November 5, 2026',
  },
  prichal: {
    src: '/screenshots/prichal-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Prichal: Managed-hosting preview landing with an explicit public sign-up closure notice.',
    caption: 'Public preview landing / sign-up closed / November 5, 2026',
  },
  'subcult-os': {
    src: '/screenshots/subcult-os-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Subcult OS: Public event-discovery interface showing the current empty listings state.',
    caption: 'Public event discovery / no published listings in this capture / November 5, 2026',
  },
  tadooer: {
    src: '/screenshots/tadooer-2026-11-05.webp',
    kind: 'screenshot',
    alt: 'Tadooer: Current Today view with synthetic tasks and calendar blocks in an isolated local instance.',
    caption:
      'Current Today view / isolated local instance with synthetic sample data / November 5, 2026',
  },
  subsets: {
    src: '/screenshots/subsets-2026-11-05.webp',
    kind: 'terminal-render',
    alt: 'Subsets: Actual terminal render from source 0.2.0-alpha.6, using six synthetic skills.',
    caption: 'Actual terminal render / sample skills / source 0.2.0-alpha.6',
  },
  'tmux-popups': {
    src: '/screenshots/tmux-popups-2026-11-05.webp',
    kind: 'terminal-render',
    alt: 'tmux-popups: Current generated CLI help excerpt, showing direct bindings and quick-menu keys.',
    caption: 'Actual CLI help excerpt / disposable small-profile environment / November 5, 2026',
  },
  'obsidian-plugin-metronome-tuner': {
    src: '/screenshots/obsidian-plugin-metronome-tuner-2026-11-05.webp',
    kind: 'repository-image',
    alt: 'Metronome documentation view, labeled Tempo & Tune, with a 240 BPM readout and tempo controls.',
    caption: 'Repository documentation image / current source / not a fresh Obsidian capture',
  },
  'transcript-create': {
    src: '/diagrams/rekolekt-flow-2026-11-05.svg',
    kind: 'diagram',
    alt: 'Diagram: recordings pass through Rekolekt’s transcription and search API to timestamped passages and the independent HasanAra frontend.',
    caption: 'Archive backend and HasanAra frontend / new implementation diagram',
  },
  pirs: {
    src: '/diagrams/pirs-flow-2026-11-05.svg',
    kind: 'diagram',
    alt: 'Diagram of PDS events passing through an opt-in private bridge to a separate Wasmtime host. Production plugin support is not qualified.',
    caption: 'Experimental host architecture / new implementation diagram',
  },
  'super-productivity-mcp': {
    src: '/diagrams/super-productivity-mcp-flow-2026-11-05.svg',
    kind: 'diagram',
    alt: 'Diagram of an assistant connecting through a local MCP server and companion plugin bridge to Super Productivity.',
    caption: 'Local MCP server and companion plugin / new integration diagram',
  },
};
