---
title: Product Claims Register
type: documentation
status: active
created: 2026-09-30
updated: 2026-10-19
tags:
- topic/publishing
---

# Product claims register

Checked September 30, 2026, America/Chicago (October 1 UTC); C-KORK added October 2, 2026. This register governs the facts in product copy; the [voice guide](../VOICE.md) governs how they are said. Product pages establish positioning. Current source establishes implemented scope. Live browsing establishes only the surfaces actually observed. A feature in source does not prove that the journey works in production.

| ID | Product and destination | Supportable description | Evidence and limits |
| --- | --- | --- | --- |
| C-CLPR | [clpr](https://clpr.tv/) | Discover Twitch clips by creator, topic, and tag; organize saved clips into playlists and share them. | Live feed shell, creator counts, topic filters, discovery and saved navigation observed. Current source supports playlists. Authenticated save/share was not repeated here. Public deployment is recorded September 25; the old blanket launch hold is superseded. |
| C-PATCHWORK | [Patchwork demo](https://patchwork.subcult.tv/) | A pre-alpha AT Protocol demonstration of local requests, offers, resources, and coordination. Requests use approximate areas; approved public resources may show addresses. | Live page explicitly says demonstration environment. Current source matrix separates exact approved resource locations from request geography. Do not invite real aid requests, promise help, say production-ready, or claim that every public view excludes exact addresses. |
| C-HASANARA | [HasanAra](https://hasanara.tv/) | Search HasanAbi broadcast transcripts and return to passages with timestamped source context. | Live archive, search entry points, recent transcripts and saved navigation observed. Shared source supports passage sharing and saving; authenticated operations were not repeated. Automatically generated transcripts require checking against recordings before quoting. Do not promise complete coverage, transcription accuracy, or continuous AI enrichment. |
| C-REKOLEKT | [Rekolekt](https://subcult.tv/products/rekolekt) | Shared software for timestamped, searchable recording archives with deployment-specific names and branding. HasanAra is one archive built on it. | Current transcript-create README establishes ingestion, search, passage sharing and public profile/asset configuration. This is a software/deployment offering, not a verified hosted upload-and-go service. Rekolekt is the working product name; transcript-create remains the repository name. |
| C-OS | [Subcult OS](https://subcult.tv/products/subcult-os) | Software in development for event planning, staffing, free ticket reservations, door check-in and end-of-night reports. | Current README describes implemented lifecycle and local alpha journeys. No live real-event operation or paid ticketing/provider qualification was verified here. Use a labeled development demonstration; do not promise a production event service, paid payouts, app-store availability, or qualified AT publishing. |
| C-UNDERTOW | [Undertow editor](https://undertow.subcult.tv/) | A layered music visualizer editor with landscape, portrait and square layouts, lyrics and local browser MP4 export. | Public editor, format tabs, layers, six templates and export control observed. Source supports export; a new media export was not run here. Codec support and performance vary by browser/device. Deployment report records sandbox cloud/billing proof; live paid billing is disabled. Do not advertise purchasable cloud plans or guaranteed fast 4K rendering. |
| C-KORK | [Kork](https://kork.subcult.tv/) | Free, self-serve link pages ("link in bio") by SUBCULT, launched October 2, 2026 and still early. A page can hold 92 catalog services with brand icons and handle checks (socials, video/music, creator/shop, payments, crypto, contact), links, headings, text, images, embeds (YouTube, Vimeo, Spotify, SoundCloud, Twitch, Apple Music), QR codes, copy buttons, a vCard contact card, location, dividers, an email sign-up (double opt-in), events/tour dates and a latest video/post block. 10 theme presets plus custom colors, fonts, button styles, stacked or numbered-ledger layouts and solid/gradient/image backgrounds. Import from Linktree and other link pages; automatic link previews; scheduled and expiring links. Anonymous daily analytics (views, clicks, click-through, referrer domains, countries) with no trackers and no visitor IPs, cookies or user agents stored; optional weekly email. Payment buttons link straight to the creator's own Cash App, PayPal and similar accounts, and Kork never takes a cut of tips or sales. Account export (ZIP) and deletion. | Facts checked October 2, 2026 against the Kork verified-facts brief, which records production or test verification for each feature. Live public landing captured October 2 (MEDIA-7737213742695f96, MEDIA-e9e40cfc33921aef); a local build at the recorded revision showed the editor and a published page with placeholder handles (MEDIA-265fdbf0a35a8bdf, MEDIA-43cbc92b89d28839). New accounts wait 24 hours before publishing. Not yet available: custom domains (code merged, rollout pending), paid plans and link screening for phishing (provider not configured). Kork Pro is planned with no final prices. zelda.subcult.tv redirects to kork.subcult.tv. Kork is not in the subcult.tv product catalog as observed October 2; see the October 3 note below. |
| C-HOUSE | The Common House | A narrative investigation game in development, with a communal radio, a shared home and source-based investigation. | Current private Unity repository and design notes support development status. Tease themes or an explicitly selected original asset. Do not promise a public build, release date, final character names, or a complete game. A transmission must have a concrete source medium; avoid invented mechanics. |

Note, October 3, 2026: the current site source (`src/lib/showcase.ts` in subcult-tv, checked at `0a09bb1`) lists nine products: clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal, Kork and Left Field. This was not checked against the live deployment, so the dated statements here that the catalog has six products and no Kork entry stay as observations of October 2 and earlier. Recheck the live catalog before copy says where Kork is listed. Prichal and Left Field have no row in this register; this note supports no product claim about them. The same source still describes Patchwork with "Public views show approximate areas, never exact addresses", which this register retires below.

## Source record

The revisions below were fetched from their remotes for this check. Stale local checkout READMEs were not used.

| Product | Repository / revision | Scope source |
| --- | --- | --- |
| clpr | `subculture-collective/clpr` / `9256f6e222d48c8cbfa94d5ebc68b14ec29a9b71` | README and `docs/LAUNCH_FEATURE_INVENTORY.md` |
| Patchwork | `subculture-collective/patchwork` / `ab7513392176fa929ac9c1d07bfd3e56d71dd464` | `docs/architecture/current-state-matrix.md` at current main; its August 7 header is older than the current contents |
| HasanAra | `subculture-collective/hasanara` / `4a5fbf9abdad9dd7f36d3c8bb7e966026f48307b` | Branding repo plus shared transcript core; the local `gitea` remote identifies this repository |
| Rekolekt | `subculture-collective/transcript-create` / `b040a16b07378c6fc8cec41ac4b1b63d998d1f55` | README, client branding and passage-sharing contracts |
| Subcult OS | `subculture-collective/subcult-os` / `bd6a06a3aa3b2cc0736241a7db9d15d206cd1218` | README lifecycle, alpha notes and production gates |
| Undertow | `subculture-collective/undertow` / `18e995c0b82faf79aeb301eabf5c594b60664cce` | Fresh source clone README, export implementation, and September 29 deployment report with September 30 updates |
| Kork | `subculture-collective/kork` / `22477c15534b6f03b46ad6d782fc0fedbd5156ab` | README, verified-facts brief dated October 2, 2026, and the live landing; the Go module is still named zelda |
| The Common House | `patrickfanella/the-common-house` / `4266381d265725a5bd6877228892afad4c9d9311` | Current Unity README and design notes; private evidence stays private |
| Product catalog | `subculture-collective/subcult-tv` / `70a084cf6c44397f8ed84efddaefee6ba8319f9e` | Live `/products`, all six product landings and current source |

## Claims to retire

- CLPR is paused/on hold, its playlists are merely future work, or old P0 tasks automatically prohibit all product updates.
- CLPR supports launch watch parties, live feed, stream clip creation, CDN orchestration or mirroring. Its launch feature inventory explicitly disables these.
- Patchwork is a production mutual aid service or never shows any exact public resource address.
- HasanAra is simply a renamed code fork, every recording is covered, or automated transcripts are authoritative quotations.
- Rekolekt has an independently verified public SaaS onboarding path.
- Subcult OS has proved live paid ticketing, settlement, production mail, AT provider interoperability or a real event run in this review.
- Undertow is code-only, all browsers export audio, paid cloud billing is live, or renderer performance is guaranteed.
- Kork offers custom domains, paid or Pro plans, any price, or active phishing link screening; Kork has a user count, testimonials or a track record beyond its October 2, 2026 launch; Kork appears in the live subcult.tv product catalog (source lists it as of October 3; the deployment is unverified).
- The Common House is only a pre-Unity concept or has a public playable release.
- Patreon tier prices, benefits, subscriber counts or published supporter posts are current without checking the creator page.

## Refresh rule

Recheck the destination and the relevant feature when preparing final copy. Refresh volatile claims within seven days of scheduling; recheck release, pricing, privacy and availability claims immediately before approval. Record source, evidence date and the exact claim used. Quantitative archive/clip counts are omitted from evergreen copy.

## Website copy corrections prepared

In a separate local subcult-tv worktree: replace “Find your tool” with “Software for independent culture”; narrow Patchwork privacy wording; add Undertow's public editor destination; describe cloud rendering as testing with live billing disabled. They are prepared locally and not deployed. Patchwork's own live home page also contains the broad privacy wording; that separate app correction remains open.

## Subsets — October 4, 2026

Source: `subculture-collective/subsets`, native TypeScript/Ink edition; `docs/npm-preview-qualification.md`, `docs/discovery-ownership.md`, and the reviewed branded alpha source.

- C-SUBSETS-01: discovers skill metadata in supported local user and project folders. Disk discovery is not a live agent catalog.
- C-SUBSETS-02: explicitly adopts unmanaged folders, organizes named groups, previews changes, and applies selected groups. Core is always included.
- C-SUBSETS-03: retains inactive skills in a private library and records transactions for checked rollback. Later drift can stop application or recovery.
- C-SUBSETS-04: native CLI/TUI requires Node.js 22+. Linux is tested; macOS is unverified and Windows is unsupported. The existing codex-skills adapter separately requires Python helpers.
- C-SUBSETS-05: owner approved Personal Utility identity, marketing README, project listing, and public landing at `subsets.subcult.tv`. Public npm publication awaits account/scope control and authentication; do not claim npmjs.org availability until registry readback and exact-version installation pass.

No automatic task detection, desktop GUI, cloud sync, model-performance gain, or platform compatibility beyond the stated qualification is claimed.

## Chatty Cat (formerly Chat Thing) — October 11, 2026

Source: `subculture-collective/chatty-cat` at the October 11 checkout (README, `docs/architecture.md`, `docs/parity.md`, `NOTICE.md`). Live `chat.subcult.tv` was not browsed for this entry.

- C-CHAT-01: Chatty Cat, a self-hosted Twitch chat client in Go and TypeScript that rebuilds HasanAbi Chat Thing and Twitch Chat Relay by mxmilkiib under AGPL-3.0. The original app remains the reference during migration.
- C-CHAT-02: anonymous viewing merges up to six channels, reconnects to Twitch IRC and restores available public backfill. Display settings cover the original palettes, fonts, filters, columns, header modes and saved slots.
- C-CHAT-03: authenticated sending, replies, whispers and moderation use server-held tokens; credentials never enter browser storage. Real user consent, posting and moderation acceptance on Twitch remain release gates and are not claimed.
- C-CHAT-04: every feature-family parity gate in `docs/parity.md` is open. Public copy says "in migration" or "rebuild in progress"; it does not say complete, launched or cut over.

No claim that Chat Thing is a Twitch product, that moderation works on a given channel, or that the public callback and HTTPS routing have passed acceptance.

## Headcount (working name sus quotient) — October 19, 2026

Source: `subculture-collective/sus-quotient` at `c99d4bf` (README, `docs/design-system.md`) and the deployed private dashboard on Kvant, checked October 19, 2026. There is no public address.

- C-HEAD-01: Headcount is a private dashboard by SUBCULT that tracks Twitch channels once they reach the global top 200 and scores each stream for patterns that view-bots, follow-bots and chat-bots produce. The score is the sus quotient, 0 to 100.
- C-HEAD-02: a high quotient means the data has patterns bots produce; it does not prove a streamer bought bots. Collection began in October 2026, so early scores are provisional and change often.
- C-HEAD-03: views include a leaderboard, live channels, an engagement map of audience size against chat, per-stream charts of viewers, chatters and follows, and channel and category search.

No claim that a named channel uses bots, no published scores in promotional copy without a reviewed claim, no claim of Twitch affiliation or access to Twitch's own detection, and no public availability until a public route is approved.

## Products added to subcult.tv — October 12, 2026

Source: the local checkouts listed below (README, docs and manifests), read October 12, 2026. Live sites were captured for screenshots the same day; no authenticated journey was exercised. These entries support the product pages added in subcult-tv on October 12; Chatty Cat's entries are above.

### Backline

Source: `subculture-collective/backline` (README, `docs/design/BACKLINE.md`).

- C-BACKLINE-01: a Discord bot with a web dashboard; twenty-three modules in five groups: onboarding and roles, moderation with a case history, private tickets with expiring transcripts, leveling, giveaways, economy and audio, Twitch/YouTube/RSS feeds, workflows and recovery snapshots.
- C-BACKLINE-02: "a release candidate in a private pilot with the SUBCULT community. Public installation is not open yet." `backline.subcult.tv` serves the landing page, not an install.
- C-BACKLINE-03: self-hosted from Docker Compose with PostgreSQL and Redis; GPL-3.0-or-later. OAuth provider completion and production deployment remain separate verification.

No claim about pricing, API tiers, retention or engagement.

### Arkhiv

Source: `subculture-collective/arkhiv` ROADMAP, multimedia design and current public profile; live catalogue rechecked on 2026-10-14.

- C-ARKHIV-01: the shared platform covers print, audio and video, exposes a versioned HTTP API, and supports independently owned frontends. Source metadata, variants and editorial decisions remain distinct.
- C-ARKHIV-02: `arkhiv.subcult.tv` now serves the mixed catalogue. The October 14 anonymous browser showed print material, Bill Nye and Democracy Now! collections. Counts are time-sensitive and are omitted from marketing copy. The older 699-document zine description refers to the print deployment, not the current mixed home.
- C-ARKHIV-03: Democracy Now! remains source-streaming only. Local preservation is separately reviewed and bounded. Access does not grant a reuse license; GPL-3.0 covers platform code, not collection media.

### Overlaid

Source: `subculture-collective/overlaid` (README, `docs/overlaid-notes.md`).

- C-OVERLAID-01: ten OBS browser-source overlays (alerts, chat, goals, now playing, ticker, camera, starting, BRB, ending, debug) with `?demo=1` previews; Twitch EventSub into the overlays after OAuth; a chat bot with commands, timers, counters, quotes, interaction rules and moderation; OBS scene controls, quick actions, rehearsal sessions and a health page.
- C-OVERLAID-02: runs beside OBS from Docker Compose; local, LAN and public exposure modes; GPL. No public instance exists; live Twitch/OBS checks are listed as remaining gates.

No claim about platforms other than Twitch.

### Pirs

Source: `subculture-collective/pirs` (README, `docs/spec/hook-points.md`, roadmap).

- C-PIRS-01: a fork of the Bluesky PDS distribution with a draft hook-point spec (observe, serve, act, decide), a `/_pirs/status` bridge counting sequencer events, and a smoke test that boots a throwaway PDS.
- C-PIRS-02: "not production software and no plugin runs yet"; the plugin host "does not exist yet"; "No milestone has started beyond the scaffold". Prichal stays on the unmodified upstream image. MIT / Apache-2.0.

### tmux-popups

Source: `PatrickFanella/tmux-popups` (README).

- C-TMUX-01: a Prefix+Enter quick menu and direct bindings generated from `popups.tsv`; local override registry; dependency status in help and CLI; a doctor script; small and full profiles; Bash only with Python 3 for JSON-argument rows. MIT. Session switching is left to tmux-sessionx. Dependency checks "establish presence, not provider credentials".

### Omarchy Multi-Monitor Bar

Source: `PatrickFanella/omarchy-monitor-bar` (README, manifest v1.0.0).

- C-MONBAR-01: Full, Minimal or Hidden per monitor with the primary locked to Full; glyph and workspace list on Minimal bars; a settings panel with validation and Check/Sync against stock files; ten languages; no elevated privileges, network or telemetry. MIT.
- C-MONBAR-02: pinned to the stock bar files of one Omarchy release (README: 4.0.4-1; the changelog still says 4.0.1-1); other versions unsupported. Some `shell.json` keys are not editable from the panel.

### Super Productivity for Omarchy

Source: `PatrickFanella/omarchy-superproductivity` (README, manifest v1.1.1).

- C-SPOM-01: current task with countdown and overtime; Stop, Complete, Extend; a Today list with Start/Complete; quick add with `+project`, `@schedule`, `#tag`; expiry and scheduled-start alerts with sound; ten languages. Requires the desktop app's local REST API on loopback. MIT.
- C-SPOM-02: the app's API has no transactions or revision guards, so a residual race between the bar and the app remains; recovery is best effort.

### Spool

Source: `subculture-collective/omarchy-plugin-spool` (README, manifest v0.2.0).

- C-SPOOL-01: a violet cassette desktop companion with drag, jump, wave, optional wandering and pointer-following eyes; an IPC command set; a bridge that follows T3 Code and Codex desktop activity with working, waiting, failure and review animations and a badge.
- C-SPOOL-02: installs with `./install.sh`; the bridge is "a local compatibility adapter to an internal desktop interface, not an official Pets event API". No LICENSE file; the artwork "is user-specific. No redistribution license is assigned".

### Shelfish

Source: `PatrickFanella/omarchy-plugin-shelfish` (README, manifest v1.1.1).

- C-SHELF-01: named, ordered, collapsible groups of existing bar widgets with icon and direction; reveal on a member's watched status change with per-widget policies; `restoreAll` before removal; ten languages; no third-party runtime dependencies. MIT.
- C-SHELF-02: depends on the shell's internal `moduleSlots` API; cannot restore pre-group positions; polls status every 500 ms; plugins run unsandboxed. Marketplace submission is planned, not done.

### Metronome + Tuner

Source: `PatrickFanella/obsidian-plugin-metronome-tuner` (README, manifest v1.0.1).

- C-METRO-01: metronome 30 to 300 BPM with tap tempo, time signatures, accent and seven click sounds; chromatic tuner with frequency, confidence, cents and note; A4 from 415 to 466 Hz; keyboard-accessible; Obsidian 1.7.2+ on desktop and mobile. Microphone only after opt-in, analysed locally, never recorded, stored or transmitted. MIT.
- C-METRO-02: community-plugin availability is conditional on marketplace acceptance; until then, manual install from a release. Do not say "precise" without a measurement.

### super-productivity-mcp

Source: `PatrickFanella/super-productivity-mcp` (README).

- C-SPMCP-01: an MCP server (`sp-mcp`), a Super Productivity plugin bridge over file IPC (inbox, outbox, dead letter), a desktop quick-add launcher through Walker or a GTK popup, and a tool catalogue in one JSON file; broad writes are dry-run first. Requires Super Productivity desktop 14+; archive/restore needs the optional local REST API; recurrence tools need a build whose plugin sandbox allows them. MIT.

Riot grrrl archive, Dedhed, Patrick__Eff and the teasers are not on the product pages and gain no claim here.

## Landing audit corrections — October 13, 2026

Source: the October 13 landing audit (`studio/studies/reviews/featured-landings-2026-10-13/`), checked against local checkouts and the current Gitea README where noted. Live sites were not browsed.

### Undertow, additions to C-UNDERTOW

Source: `subculture-collective/undertow` README at `077af66` (October 11, 2026).

- C-UNDERTOW-02: layers are Milkdrop presets, spectrum, waveform, VU meters, particles, artwork and logos, text, socials and looping video backgrounds; enhanced LRC word timings give word-by-word karaoke; six templates (Classic, Vinyl, Karaoke, Neon, Poster, Video loop).
- C-UNDERTOW-03: local export renders the whole song or a 15-second preview as MP4 from 720p to 4K at 24, 30 or 60 frames per second; the exporter asks for H.264 and falls back to HEVC, VP9 or AV1. 4K is offered everywhere but not every device can encode it, so copy may name the range and must not promise it on a given machine.

### clpr, correction

The README at `4850edd` (October 3, 2026) describes browse and search by creator, topic, tag or Twitch category and a feed moved by upvotes and comments. It does not describe a trending view; landing copy now says "the feed".

### Rekolekt, source record

The product source is now `subculture-collective/rekolekt` (pack guide and landing FAQ agree); `transcript-create` remains the catalog slug and contact route. The source record above predates the move.

### Backline, correction

C-BACKLINE-01 supports an audio module, not a station list. The SomaFM sentence was removed from the landing.

### Tadooer — October 13, 2026

Source: `subculture-collective/tadooer` README at `ca6593f` (October 12, 2026) from Gitea; `DEVELOPMENT.md` and `docs/STATUS.md` at the same revision. The September 20 local checkout was not used for the current claims.

- C-TADOOER-01: a private, self-hosted task and calendar planner for one owner; no public service or sign-up. Web app, a Linux desktop client, and an Android shell that exists in source with no built APK or device qualification claimed.
- C-TADOOER-02: tasks placed beside the calendar; Baikal CalDAV (bundled or existing) as the calendar authority; Google Calendar read scopes qualified against a real grant on 2026-08-07, with explicit write consent per calendar; connected calendars show freshness and conflicting edits ask for a decision.
- C-TADOOER-03: one server-authoritative focus session; another client can follow or explicitly take over; core task edits queue while a browser is temporarily offline; calendar and focus commands need a connection; a closed app receives no background updates.
- C-TADOOER-04: SQLite on the owner's server, encrypted connector credentials, documented backup and restore. GitHub and Gitea issue connections support selective task import. A Super Productivity import is listed under remaining import adapters in `docs/STATUS.md` and is not claimed as available. The pack's promotional artwork and copy were owner-approved on October 10, 2026; the README still labels its own banner as pending review.

### Prichal — October 13, 2026

Source: `subculture-collective/prichal` README at `c0b1335` (October 12, 2026).

- C-PRICHAL-01: managed personal data servers on the open network Bluesky runs on; a private preview with public account hosting and sign-up not available. Approved lines: "Your server. We keep it running." and "Dock your account. We handle the rest."
- C-PRICHAL-02: backups, recovery, public federation, domains and account migration each have their own qualification gates. Copy may describe a domain handle and moving between hosts as planned, not available.

### Left Field — October 13, 2026

Source: `subculture-collective/left-field` README at `a8e6378` (local alias `dsa-seats`, October 12, 2026).

- C-LEFTFIELD-01: seat-level public election, geography and campaign-finance records beside their sources for U.S. House and Senate, governorships and state legislatures; each provisional score shows its inputs and version; missing information stays missing rather than becoming a zero.
- C-LEFTFIELD-02: the research site is in active development at `left-field.subcult.tv`; voter files, inferred ideology and demographic targeting are outside scope; no DSA endorsement is implied. No public app beyond the research site is announced.

### Kork, voice note

The landing no longer mentions custom domains or a paid plan, following the voice guide; C-KORK still records both as not available if a reader asks.
