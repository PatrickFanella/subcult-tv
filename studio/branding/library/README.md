# SUBCULT brand and asset library — v1

This folder holds thirteen brand packs. Some are identities the user selected. The others follow the theme a product already had.

- The user selected Rekolekt A and SUBCULT C on October 1, 2026, and replaced Patrick with Patch / routed signal on October 2, 2026.
- CLPR uses the user-edited play-triangle logo, with the user-selected Clip stack layouts and a single-clip square post.

Open `index.html` for the offline gallery, or use the local preview at http://localhost:18769/. From the repository root, `make studio-package` creates per-brand ZIPs and the complete library under `studio/runtime/packages/`. The earlier direction review is kept in `../archive/reviews/2026-10-01/`.

The library is local asset production. This build changed no sites, social profiles, runner configuration or posts.

Each product has its own voice for copy. It is set out in [the voice guide](../../content/VOICE.md), and each pack guide summarizes it.

## Contents of each brand pack

- Primary, dark, light and monochrome lockups and marks: editable SVG, outlined SVG and transparent PNG.
- 1500×500 X/Bluesky banner, 1500×600 taller master and 512×512 avatar.
- Square, landscape, story, quote and release layouts, plus a screenshot frame.
- 1920×1080 video title, thumbnail, end-card and transparent lower-third layouts, an ASS caption style and a silent eight-second template preview.
- Design guide, color/type/spacing tokens in JSON and CSS, alt-text starters, fonts/licenses and a hash-bound asset manifest.

The guides cover color roles and contrast, typography, mark clear space and minimum sizes, screenshot treatment, video margins and source handling. Placeholder copy is visibly marked. The layouts do not demonstrate product features, and they are not approved for publication.

## Sources and limits

- The site references and selected marks are captured in the earlier review's source notes.
- The 228 original asset files were checked against the review inventory and preserved.
- Legacy CLPR and industrial SUBCULT material is not promoted to the selected systems.
- HasanAra follows the live red/PBS theme.
- Undertow's site uses a system monospace stack. These portable exports use bundled Liberation Mono in its place.
- Rekolekt retains its original logo, palette and typography. Only the story template's decorative waveform is replaced with transcript rows and timestamps.

## Rebuild and bootstrap

The pack builder needs Python 3 with Pillow, Inkscape, rsvg-convert and fontconfig. It uses only the bundled fonts, through `fontconfig.xml`.

| Script | Job |
| --- | --- |
| `build_packs.py` | Rebuilds SVG/PNG assets and guides. |
| `design_helpers.py` | Holds the captured vector artwork. |
| `render_video_previews.py` | Reproduces the eight-second previews with ffmpeg. The validation file records their measured codec, size and duration. |

Re-render selected library assets from the builder. Do not change PNG exports separately.

The starter kit creates a new brand from `brand.json` without copying any existing product's mark. See `starter-template/README.md`. It creates fourteen editable layouts, tokens, a source register and a manifest, and optional rendering produces PNGs. It rejects invalid colors, text contrast below 4.5:1 and existing output directories.

### Headline revision, October 3, 2026

The clpr, HasanAra, Rekolekt, Undertow, Kork and Left Field packs were re-rendered with new sample headlines from the voice guide. The square posts for clpr, HasanAra, Patchwork and Subcult OS, the Rekolekt banner line and the Dedhed share image also carry new secondary lines. SUBCULT, Patrick__Eff, Prichal and Tadooer were not rebuilt.

- `brands.json` holds each headline. Kork also has `headline_stack`, a three-line break used where the two-line headline does not fit beside the pinned cards: the banner, story, share image and launch graphics.
- The Undertow banner waveform is narrower so the longer headline keeps its type size.
- The clpr build writes its banner straight into the pack. `references/clpr-working-banner.svg` stays as the October 1 banner.
- `build_packs.py` keeps the committed order of manifest entries, so rebuilding an unchanged pack produces an identical manifest.
- The comparison packs in `clpr-directions/` and `corkboard-directions/` keep the headlines they were reviewed with. They are a record of the selection and were not rebuilt.
- `docs/cleanup-receipt.json` in the repository root lists the regenerated SVGs under `superseded`.

## Pack notes

### SUBCULT

The master mark is the user-authored `references/subcult-mark-master.svg`. The tilted green block, registration lines, filled S and underscore, outlined C and terminal square are preserved. The primary outlined SVG is copied without alteration. Color variants recolor the ink, and monochrome variants outline the accent block to keep the letters visible. Each SUBCULT pack includes `logos/master.svg` and a source hash in `tokens.json`.

The user-edited banner, logo banner and square post live in `references/subcult-edited-layouts/`. Rebuilds preserve their SVG bytes and regenerate their PNGs, the taller banner and the gallery contact sheet.

### Patrick__Eff

Patrick uses the owner-selected Patch / routed signal system, based on patrickfanella.co:

- charcoal #282a36, lavender #bd93f9, pink #ff79c6 and green #50fa7b
- Space Grotesk display, Inter body and JetBrains Mono labels
- the identity line **Software. Sound. Culture.**, with equal phrase sizes
- flat type, routing paths and spectrum artwork in place of the earlier offset-heading treatment
- seven approved waveform treatments, with lavender as the default and Light as the counterpart for light backgrounds

The authoritative source is [Patch](../patrick/README.md). The normal `brands/patrick__eff/` paths, gallery, manifest and ZIP expose the selected system. Rebuild only Patrick with `BRAND_ONLY=patrick__eff python build_packs.py`, then the same filter for `render_video_previews.py`.

The complete previous Signal pack is preserved at `branding/archive/patrick-signal-2026-10-02/` from the Studio root. Original banners and mark masters remain in `references/`. [Approved logo treatments](../patrick/waveform-variations/index.html) record the selected variations.

### CLPR

The selection is Clip stack for the main layouts and a single clip card for the square post. The earlier filmstrip and timeline artwork is preserved as history. The current layout alternatives use crop corners, clip cards and play fields.

clpr.tv has applied the pack since October 2, 2026. `brands/clpr/GUIDE.md` records how the site uses the logo, icons, link preview and crop corners. The comparison packs remain available under `clpr-directions/`, and the main `clpr.zip` contains the selected combination.

### Subcult OS

Subcult OS was rebuilt on October 2, 2026 to match the live https://os.subcult.tv terminal system: Space Mono (bundled from google/fonts), black canvas, purple actions, cyan labels and focus, square frames. Its OS lettermark with a cyan cursor block is a pack mark; the site itself uses the plain wordmark.

### Kork

Added October 2, 2026. Kork is the identity for the self-serve links-page service, code name zelda. The user compared four directions in `corkboard-directions/` and selected A, the pinned card, under the name Kork.

The pack uses an original pinned-card mark, a cork field, paper cards, cobalt pushpins, Archivo Black headlines, Atkinson Hyperlegible Next body copy and JetBrains Mono labels. Archivo Black was added to `fonts/` with its OFL license. Card destinations and the QR glyph are placeholders, and the glyph encodes nothing.

Rebuild it alone with `BRAND_ONLY=kork python3 build_packs.py`, then `BRAND_ONLY=kork python3 render_video_previews.py`.

Launch drafts (October 2, 2026): `kork_launch_assets.py` renders a square post, a landscape image and a story into `brands/kork/launch/` from the pack artwork and adds them to the Kork manifest. Their copy is limited to the C-KORK claims in `content/social/Product Claims Register.md`. The landscape image embeds `references/kork-demo-page-mobile.png`, a real capture of a locally run Kork page with placeholder handles. These graphics are unapproved drafts.

The SUBCULT catalogue layouts in `design_helpers.py` (mode `subcult-catalogue`) list Kork as the seventh product. No selected pack uses that mode, so no pack files changed.

### Prichal

Added October 2, 2026. Prichal is the identity for managed AT Protocol PDS hosting (`subculture-collective/prichal`). The user chose the name, palette, mark and messaging October 1–2. The product repository's `brand/GUIDE.md` keeps the audience messaging and the claims to avoid.

The `docking` mode draws the original docking-node mark (sphere, perspective equator, four flanged collars, red occupied port), paper and ink with signal red, Oswald headlines, Public Sans body copy and JetBrains Mono labels, plus tick scales and a port strip. All three fonts were already in `fonts/`.

Rebuild it alone with `BRAND_ONLY=prichal python3 build_packs.py` and `BRAND_ONLY=prichal python3 render_video_previews.py`. `prichal_product_assets.py` writes `brands/prichal/product/` (favicon, touch icon, hero, Open Graph image). Run the product script before the pack build so the manifest includes its files.

### Left Field

Added October 2, 2026. Left Field is a user-approved field-ledger identity based on the app's paper, dark-ink and rust palette. It includes an original LF mark, editorial source-row layouts and web assets. The user approved the direction and revised LF mark.

Rebuild with `BRAND_ONLY=left-field python build_packs.py`, then the same filter for `render_video_previews.py`, then `python finalize_left_field.py`. Its source observations and validation are inside `brands/left-field/`. The Left Field site carries the pack's icons, share card, banner and mark since October 2, 2026.

Website (updated October 2, 2026): [website design specification](brands/left-field/WEBSITE.md) records the site at left-field.subcult.tv (formerly seats.dsaslate.com) after the interface audit and the two October 2 releases, including which pack files the site carries: copy rules, colour and type roles, page structure, components, interaction states and where the site differs from the field-ledger pack. `left_field_product.py` holds the site's interface roles, which `tokens.json` lists under `product_interface`. The [brand guide](brands/left-field/GUIDE.md) keeps the approved direction for promotional artwork.

For the public site, export only the approved Left Field assets with `python scripts/export_left_field.py --site-root /path/to/subcult-tv` from the Studio root. The exporter verifies source hashes and writes destination provenance. The full pack remains in Studio.

### HasanAra

Website (updated October 2, 2026): [website design specification](brands/hasanara/WEBSITE.md) records hasanara.tv as deployed on October 2: copy, colour and type roles for both editions, assets, page structure and where the site differs from the Broadcast archive pack. `hasanara_product.py` holds the site roles that `build_packs.py` writes to `tokens.json` under `product_interface`. The guide, tokens and manifest were updated without regenerating artwork.

### Rekolekt

Website (updated October 2, 2026): [website design specification](brands/rekolekt/WEBSITE.md) records the implemented landing page, real transcript evidence, interaction states and responsive checks. The [brand guide](brands/rekolekt/GUIDE.md) retains the selected Index identity and links to this maintained specification.

### Patchwork

Website (updated October 2, 2026): [website design specification](brands/patchwork/WEBSITE.md) records the web app after the interface audit: page structure, copy rules, components, interaction states and where the site differs from the Neighbourhood fabric pack. `patchwork_product.py` holds the site's interface roles, which `tokens.json` lists under `product_interface`. The [brand guide](brands/patchwork/GUIDE.md) keeps the selected direction for promotional artwork.

### Dedhed

Added October 2, 2026. Dedhed is the identity for the private concert-tape library and shared radio station for Grateful Dead recordings (`subculture-collective/dedhed`). The system, The Tape Shelf, comes from the taper cassette collections in the product's `docs/inspo/`. The product repository's `docs/design/` is the editing source and is copied into `brands/dedhed/design-system/` with hashes in `source-provenance.json`.

The `tape-shelf` mode draws an original cassette-shell mark, a lowercase typed wordmark with a red record dot and a pine rack of typed spine labels. Fonts are Liberation Serif, Public Sans, Liberation Mono and Barlow Condensed, all already in `fonts/`.

Run `python3 dedhed_product_assets.py` first (it writes `brands/dedhed/product/` and refreshes the design-system copy from `DEDHED_SOURCE`), then `BRAND_ONLY=dedhed python3 build_packs.py` and `BRAND_ONLY=dedhed python3 render_video_previews.py`.

`brands/dedhed/landing.html` is a static product landing page on the design-system tokens with sample tapes. The pilot has no public domain; `og.png` omits a URL and nothing here authorizes public relay of recordings.

### Tadooer

Added October 2, 2026. Tadooer is the identity for the private, self-hosted task and calendar planner for one owner (`subculture-collective/productivity-suite`; the repository and service identifier stay `productivity-suite`).

The product repository's `docs/design/` (Catppuccin Mocha surfaces, Dracula accents with one meaning each, Inter and Atkinson Hyperlegible Mono) is the editing source for interface rules and is copied into `brands/tadooer/design-system/` with hashes in `source-provenance.json`. The mark is the suite icon from `apps/web/public/suite-icon.svg`, redrawn in `tadooer_assets.py` with monochrome ring variants.

The `tadooer` mode draws the planner day: a time column, task rows with one purple focus session, the pink now line and a teal calendar block, with placeholder row titles. Inter and Atkinson Hyperlegible Mono were added to `fonts/` from the Google Fonts CSS API with their OFL texts.

Run `TADOOER_SOURCE=<checkout> python3 tadooer_product_assets.py` first (it writes `brands/tadooer/product/`: favicon, touch icon, 512 and maskable manifest icons, Open Graph image without a URL), then `BRAND_ONLY=tadooer python3 build_packs.py` and `BRAND_ONLY=tadooer python3 render_video_previews.py`.

The promotional direction, The plan and the one thing now, is proposed by Studio and recorded as `direction_selection: proposed`. The owner has not reviewed the artwork, and the headline is sample copy. Tadooer has no public domain and no sign-up, so nothing here may suggest a public service.
