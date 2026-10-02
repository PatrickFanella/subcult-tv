# SUBCULT brand and asset library — v1

The user selected Rekolekt A and SUBCULT C on October 1, 2026, and replaced Patrick with Patch / routed signal on October 2, 2026. CLPR now uses the user-edited play-triangle logo, with user-selected Clip stack layouts and a single-clip square post. This folder contains those three selected systems and five packs based on the established product themes.

Open `index.html` for the offline gallery, or use the local preview at http://localhost:18769/. Each brand has a separate ZIP; `subcult-brand-asset-packs-v1.zip` includes the full library and starter kit. The earlier direction review remains in `../2026-10-01-review`.

## Contents of each brand pack

- Primary, dark, light and monochrome lockups and marks: editable SVG, outlined SVG and transparent PNG.
- 1500×500 X/Bluesky banner, 1500×600 taller master and 512×512 avatar.
- Square, landscape, story, quote and release layouts, plus a screenshot frame.
- 1920×1080 video title, thumbnail, end-card and transparent lower-third layouts, an ASS caption style and a silent eight-second template preview.
- Design guide, color/type/spacing tokens in JSON and CSS, alt-text starters, fonts/licenses and a hash-bound asset manifest.

The guides explain color roles and contrast, typography, mark clear space and minimum sizes, screenshot treatment, video margins and source handling. Placeholder copy is visibly marked. These layouts do not demonstrate product features or establish publication approval.

## Sources and limits

The site references and selected marks are captured in the earlier review’s source notes. HasanAra follows the live red/PBS theme. Undertow’s system monospace stack uses bundled Liberation Mono for these portable exports. Subcult OS was rebuilt on October 2, 2026 to match the live https://os.subcult.tv terminal system: Space Mono (bundled from google/fonts), black canvas, purple actions, cyan labels and focus, square frames. Its OS lettermark with a cyan cursor block is a pack mark; the site itself uses the plain wordmark.

The 228 original asset files were checked against the review inventory and preserved. Legacy CLPR and industrial SUBCULT material is not promoted to the selected systems. The earlier CLPR filmstrip and timeline artwork is preserved as history; current layout alternatives use crop corners, clip cards and play fields. Patrick uses routing paths and spectrum artwork in the selected Patch system. Rekolekt retains its original logo, palette and typography. Only the story template’s decorative waveform is replaced with transcript rows and timestamps.

## Rebuild and bootstrap

The pack builder needs Python 3 with Pillow, Inkscape, rsvg-convert and fontconfig. It uses only the bundled fonts through fontconfig.xml. `build_packs.py` rebuilds SVG/PNG assets and guides. `design_helpers.py` holds the captured vector artwork. `render_video_previews.py` reproduces the eight-second previews with ffmpeg. The validation file records their measured codec, size and duration. Re-render selected library assets from the builder instead of changing PNG exports separately.

The independent starter kit creates a new brand from `brand.json` without copying any existing product’s mark. See `starter-template/README.md`. It creates fourteen editable layouts, tokens, a source register and a manifest; optional rendering produces PNGs. It rejects invalid colors, text contrast below 4.5:1 and existing output directories.

The library is local asset production. No sites, social profiles, runner configuration or posts were changed by this build.

SUBCULT uses the user-authored `references/subcult-mark-master.svg` as its master mark. The tilted green block, registration lines, filled S and underscore, outlined C and terminal square are preserved. The primary outlined SVG is copied without alteration. Color variants recolor the ink; monochrome variants outline the accent block to keep the letters visible. Each SUBCULT pack includes `logos/master.svg` and a source hash in `tokens.json`.

SUBCULT layout masters: the user-edited banner, logo banner and square post live in `references/subcult-edited-layouts/`. Rebuilds preserve their SVG bytes and regenerate their PNGs, the taller banner and the gallery contact sheet.

Patrick now uses the owner-selected Patch / routed signal system, based on patrickfanella.co: charcoal #282a36, lavender #bd93f9, pink #ff79c6, green #50fa7b, Space Grotesk display, Inter body and JetBrains Mono labels. The identity line is **Software. Sound. Culture.**, with equal phrase sizes. Flat type, routing paths and spectrum artwork replace the earlier offset-heading treatment. The current PF mark remains selected while new logo studies are reviewed.

The authoritative source is [Patch](../2026-10-02-patrick-site-direction/README.md). The normal `brands/patrick__eff/` paths, gallery, manifest and ZIP expose the selected system. Rebuild only Patrick with `BRAND_ONLY=patrick__eff python build_packs.py`, then the same filter for `render_video_previews.py`. The complete previous Signal pack is preserved at `history/branding/patrick-signal-2026-10-02/` from the Studio root. Original banners and mark masters remain in `references/`. [Logo development options](../2026-10-02-patrick-site-direction/logo-options/index.html) are proposals, not a selected replacement.

CLPR selection: Clip stack for the main layouts; single clip card for the square post. clpr.tv has applied the pack since October 2, 2026; `brands/clpr/GUIDE.md` records how the site uses the logo, icons, link preview and crop corners. The comparison packs remain available under `clpr-directions/`; the main `clpr.zip` contains the selected combination.

Kork (added October 2, 2026): identity for the self-serve links-page service, code name zelda. The user compared four directions in `corkboard-directions/` and selected A, the pinned card, under the name Kork. The pack uses an original pinned-card mark, a cork field, paper cards, cobalt pushpins, Archivo Black headlines, Atkinson Hyperlegible Next body copy and JetBrains Mono labels. Archivo Black was added to `fonts/` with its OFL license. Rebuild it alone with `BRAND_ONLY=kork python3 build_packs.py`, then `BRAND_ONLY=kork python3 render_video_previews.py`. Card destinations and the QR glyph are placeholders; the glyph encodes nothing.

Kork launch drafts (October 2, 2026): `kork_launch_assets.py` renders a square post, a landscape image and a story into `brands/kork/launch/` from the pack artwork and adds them to the Kork manifest. Their copy is limited to the C-KORK claims in `content/social/Product Claims Register.md`. The landscape image embeds `references/kork-demo-page-mobile.png`, a real capture of a locally run Kork page with placeholder handles. These graphics are unapproved drafts. The SUBCULT catalogue layouts in `design_helpers.py` (mode `subcult-catalogue`) list Kork as the seventh product; no selected pack uses that mode, so no pack files changed.

Prichal (added October 2, 2026): identity for managed AT Protocol PDS hosting (`subculture-collective/prichal`). The user chose the name, palette, mark and messaging October 1–2; the product repository's `brand/GUIDE.md` keeps the audience messaging and claims to avoid. The `docking` mode draws the original docking-node mark (sphere, perspective equator, four flanged collars, red occupied port), paper and ink with signal red, Oswald headlines, Public Sans body copy and JetBrains Mono labels, plus tick scales and a port strip. All three fonts were already in `fonts/`. Rebuild it alone with `BRAND_ONLY=prichal python3 build_packs.py` and `BRAND_ONLY=prichal python3 render_video_previews.py`; `prichal_product_assets.py` writes `brands/prichal/product/` (favicon, touch icon, hero, Open Graph image). Run the product script before the pack build so the manifest includes its files.

Left Field (added October 2, 2026): user-approved field-ledger identity based on the
app’s paper, dark-ink and rust palette. Includes an original LF mark, editorial
source-row layouts and web assets. The user approved the direction and revised LF mark. Rebuild with `BRAND_ONLY=left-field python build_packs.py`,
then the same filter for `render_video_previews.py`, then
`python finalize_left_field.py`. Its source observations and validation are
inside `brands/left-field/`. The Left Field site carries the pack's icons, share card, banner and mark since October 2, 2026.

Left Field website (updated October 2, 2026): [website design specification](brands/left-field/WEBSITE.md) records the site at left-field.subcult.tv (formerly seats.dsaslate.com) after the interface audit and the two October 2 releases, including which pack files the site carries: copy rules, colour and type roles, page structure, components, interaction states and where the site differs from the field-ledger pack. `left_field_product.py` holds the site's interface roles, which `tokens.json` lists under `product_interface`. The [brand guide](brands/left-field/GUIDE.md) keeps the approved direction for promotional artwork.

For the public site, export only the approved Left Field assets with
`python scripts/export_left_field.py --site-root /path/to/subcult-tv` from the
Studio root. The exporter verifies source hashes and writes destination
provenance. The full pack remains in Studio.

HasanAra website (updated October 2, 2026): [website design specification](brands/hasanara/WEBSITE.md) records hasanara.tv as deployed on October 2: copy, colour and type roles for both editions, assets, page structure and where the site differs from the Broadcast archive pack. `hasanara_product.py` holds the site roles that `build_packs.py` writes to `tokens.json` under `product_interface`. The guide, tokens and manifest were updated without regenerating artwork.

Rekolekt website (updated October 2, 2026): [website design specification](brands/rekolekt/WEBSITE.md) records the implemented landing page, real transcript evidence, interaction states and responsive checks. The [brand guide](brands/rekolekt/GUIDE.md) retains the selected Index identity and links to this maintained specification.

Patchwork website (updated October 2, 2026): [website design specification](brands/patchwork/WEBSITE.md) records the web app after the interface audit: page structure, copy rules, components, interaction states and where the site differs from the Neighbourhood fabric pack. `patchwork_product.py` holds the site's interface roles, which `tokens.json` lists under `product_interface`. The [brand guide](brands/patchwork/GUIDE.md) keeps the selected direction for promotional artwork.
