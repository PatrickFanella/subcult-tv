---
title: Product Claims Register
type: documentation
status: active
created: 2026-09-30
updated: 2026-10-02
tags:
- topic/publishing
---

# Product Claims Register

Checked September 30, 2026, America/Chicago (October 1 UTC); C-KORK added October 2, 2026. This register governs product copy in the content bank. Product pages establish positioning; current source establishes implemented scope; live browsing establishes only the surfaces actually observed. A source feature is not proof of a successful production journey.

| ID | Product and destination | Supportable description | Evidence and limits |
| --- | --- | --- | --- |
| C-CLPR | [clpr](https://clpr.tv/) | Discover Twitch clips by creator, topic, and tag; organize saved clips into playlists and share them. | Live feed shell, creator counts, topic filters, discovery and saved navigation observed. Current source supports playlists. Authenticated save/share was not repeated here. Public deployment is recorded September 25; the old blanket launch hold is superseded. |
| C-PATCHWORK | [Patchwork demo](https://patchwork.subcult.tv/) | A pre-alpha AT Protocol demonstration of local requests, offers, resources, and coordination. Requests use approximate areas; approved public resources may show addresses. | Live page explicitly says demonstration environment. Current source matrix separates exact approved resource locations from request geography. Do not invite real aid requests, promise help, say production-ready, or claim that every public view excludes exact addresses. |
| C-HASANARA | [HasanAra](https://hasanara.tv/) | Search HasanAbi broadcast transcripts and return to passages with timestamped source context. | Live archive, search entry points, recent transcripts and saved navigation observed. Shared source supports passage sharing and saving; authenticated operations were not repeated. Automatically generated transcripts require checking against recordings before quoting. Do not promise complete coverage, transcription accuracy, or continuous AI enrichment. |
| C-REKOLEKT | [Rekolekt](https://subcult.tv/products/rekolekt) | Shared software for timestamped, searchable recording archives with deployment-specific names and branding. HasanAra is one archive built on it. | Current transcript-create README establishes ingestion, search, passage sharing and public profile/asset configuration. This is a software/deployment offering, not a verified hosted upload-and-go service. Rekolekt is the working product name; transcript-create remains the repository name. |
| C-OS | [Subcult OS](https://subcult.tv/products/subcult-os) | Software in development for event planning, staffing, free ticket reservations, door check-in and end-of-night reports. | Current README describes implemented lifecycle and local alpha journeys. No live real-event operation or paid ticketing/provider qualification was verified here. Use a labeled development demonstration; do not promise a production event service, paid payouts, app-store availability, or qualified AT publishing. |
| C-UNDERTOW | [Undertow editor](https://undertow.subcult.tv/) | A layered music visualizer editor with landscape, portrait and square layouts, lyrics and local browser MP4 export. | Public editor, format tabs, layers, six templates and export control observed. Source supports export; a new media export was not run here. Codec support and performance vary by browser/device. Deployment report records sandbox cloud/billing proof; live paid billing is disabled. Do not advertise purchasable cloud plans or guaranteed fast 4K rendering. |
| C-KORK | [Kork](https://kork.subcult.tv/) | Free, self-serve link pages ("link in bio") by SUBCULT, launched October 2, 2026 and still early. A page can hold 92 catalog services with brand icons and handle checks (socials, video/music, creator/shop, payments, crypto, contact), links, headings, text, images, embeds (YouTube, Vimeo, Spotify, SoundCloud, Twitch, Apple Music), QR codes, copy buttons, a vCard contact card, location, dividers, an email sign-up (double opt-in), events/tour dates and a latest video/post block. 10 theme presets plus custom colors, fonts, button styles, stacked or numbered-ledger layouts and solid/gradient/image backgrounds. Import from Linktree and other link pages; automatic link previews; scheduled and expiring links. Anonymous daily analytics (views, clicks, click-through, referrer domains, countries) with no trackers and no visitor IPs, cookies or user agents stored; optional weekly email. Payment buttons link straight to the creator's own Cash App, PayPal and similar accounts, and Kork never takes a cut of tips or sales. Account export (ZIP) and deletion. | Facts checked October 2, 2026 against the Kork verified-facts brief, which records production or test verification for each feature. Live public landing captured October 2 (MEDIA-7737213742695f96, MEDIA-e9e40cfc33921aef); a local build at the recorded revision showed the editor and a published page with placeholder handles (MEDIA-265fdbf0a35a8bdf, MEDIA-43cbc92b89d28839). New accounts wait 24 hours before publishing. Not yet available: custom domains (code merged, rollout pending), paid plans and link screening for phishing (provider not configured). Kork Pro is planned with no final prices. zelda.subcult.tv redirects to kork.subcult.tv. Kork is not in the subcult.tv product catalog as observed October 2. |
| C-HOUSE | The Common House | A narrative investigation game in development, with a communal radio, a shared home and source-based investigation. | Current private Unity repository and design notes support development status. Tease themes or an explicitly selected original asset. Do not promise a public build, release date, final character names, or a complete game. A transmission must have a concrete source medium; avoid invented mechanics. |

## Source record

Current fetched source revisions inspected, rather than stale local checkout READMEs:

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
- Kork offers custom domains, paid or Pro plans, any price, or active phishing link screening; Kork has a user count, testimonials or a track record beyond its October 2, 2026 launch; Kork appears in the subcult.tv product catalog.
- The Common House is only a pre-Unity concept or has a public playable release.
- Patreon tier prices, benefits, subscriber counts or published supporter posts are current without checking the creator page.

## Refresh rule

Check the destination and relevant feature again when preparing final copy. Refresh volatile claims within seven days of scheduling; recheck release, pricing, privacy and availability claims immediately before approval. Record source, evidence date and the exact claim used. Quantitative archive/clip counts are omitted from evergreen copy.

## Website copy corrections prepared

In a separate local subcult-tv worktree: replace “Find your tool” with “Software for independent culture”; narrow Patchwork privacy wording; add Undertow's public editor destination; describe cloud rendering as testing with live billing disabled. These changes are prepared locally and are not deployed. Patchwork's own live home page also contains the broad privacy wording; that separate app correction remains open.
