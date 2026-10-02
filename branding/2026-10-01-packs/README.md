# SUBCULT brand and asset library — v1

The user selected Patrick A, Rekolekt A and SUBCULT C on October 1, 2026. CLPR now uses the user-edited play-triangle logo, with user-selected Clip stack layouts and a single-clip square post. This folder contains those three selected systems and five packs based on the established product themes.

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

The 228 original asset files were checked against the review inventory and preserved. Legacy CLPR and industrial SUBCULT material is not promoted to the selected systems. The earlier CLPR filmstrip and timeline artwork is preserved as history; current layout alternatives use crop corners, clip cards and play fields. Patrick retains the waveform. Rekolekt retains its original logo, palette and typography. Only the story template’s decorative waveform is replaced with transcript rows and timestamps.

## Rebuild and bootstrap

The pack builder needs Python 3 with Pillow, Inkscape, rsvg-convert and fontconfig. It uses only the bundled fonts through fontconfig.xml. `build_packs.py` rebuilds SVG/PNG assets and guides. `design_helpers.py` holds the captured vector artwork. `render_video_previews.py` reproduces the eight-second previews with ffmpeg. The validation file records their measured codec, size and duration. Re-render selected library assets from the builder instead of changing PNG exports separately.

The independent starter kit creates a new brand from `brand.json` without copying any existing product’s mark. See `starter-template/README.md`. It creates fourteen editable layouts, tokens, a source register and a manifest; optional rendering produces PNGs. It rejects invalid colors, text contrast below 4.5:1 and existing output directories.

The library is local asset production. No sites, social profiles, runner configuration or posts were changed by this build.

SUBCULT uses the user-authored `references/subcult-mark-master.svg` as its master mark. The tilted green block, registration lines, filled S and underscore, outlined C and terminal square are preserved. The primary outlined SVG is copied without alteration. Color variants recolor the ink; monochrome variants outline the accent block to keep the letters visible. Each SUBCULT pack includes `logos/master.svg` and a source hash in `tokens.json`.

SUBCULT layout masters: the user-edited banner, logo banner and square post live in `references/subcult-edited-layouts/`. Rebuilds preserve their SVG bytes and regenerate their PNGs, the taller banner and the gallery contact sheet.

Patrick uses Cascadia Mono for display and body type, with a 0.08em gap between the wordmark underscores. The original user banner stays in `references/patrick-banner-master.svg`; its font revision is `references/patrick-banner-cascadia.svg`. The user-edited PF and bracketed waveform variations now govern the Patrick pack. Original concepts remain in `patrick-logo-study/` as historical drafts.

Patrick variation update: originals are preserved in `references/patrick-variations/` and bundled in `brands/patrick__eff/logos/source-variations/`. Primary marks use PF; clean waveform and tall variants remain available. Large headings and standalone waveforms use a warm-white face with lime/purple offsets. Small text stays flat. `brands/patrick__eff/components.html` shows the CSS treatment; `logos/variations.html` lists editable and production marks.

CLPR selection: Clip stack for the main layouts; single clip card for the square post. The comparison packs remain available under `clpr-directions/`; the main `clpr.zip` contains the selected combination.

Corkboard (added October 2, 2026): proposed identity for the self-serve links-page service, code name zelda. The user chose the name; the visual direction is awaiting review. The pack uses an original pinned-card mark, a cork field, paper cards, cobalt pushpins, Archivo Black headlines, Atkinson Hyperlegible Next body copy and JetBrains Mono labels. Archivo Black was added to `fonts/` with its OFL license. Rebuild it alone with `BRAND_ONLY=corkboard python3 build_packs.py`, then `BRAND_ONLY=corkboard python3 render_video_previews.py`. Card destinations and the QR glyph are placeholders; the glyph encodes nothing.
