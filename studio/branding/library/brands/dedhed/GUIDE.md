# Dedhed — Brand and asset guide

Selected direction: **A / The tape shelf**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Cream label paper, black shells, red brand tabs and a pine rack: a taper's cassette shelf for concert recordings and one shared radio station.

Identity for Dedhed, the private concert-tape library and shared radio station for Grateful Dead recordings. The system is called The Tape Shelf and comes from the taper cassette collections in the product repository's docs/inspo/: typed and handwritten spine labels, cream and coloured label stock, black and clear shells, red Maxell and TDK tabs, and pine racks. The user approved the cream paper backdrop on October 2, 2026. Use Dedhed in prose and the lowercase `dedhed` wordmark with its red record dot in artwork. The mark is an original cassette shell: label, red stripe, window, two hubs, screw holes and capstan notch. It stays legible at 32 pixels because the shell and hubs are solid shapes; monochrome variants turn the stripe to ink. Paper (#efe9d8) is the field and ink (#1f1d1a) carries text and the mark. Tab red (#c8102e, 5.3:1 on paper) is reserved for the record dot, brand tabs, the deck's top rule and the primary key. Pine (#c58b4e) is the rack behind spines, never a text colour. Liberation Serif stands in for the Times/Georgia typed-label voice, Liberation Mono for the typewriter voice (counters, lineage, eyebrows), Public Sans for interface prose and Barlow Condensed for brand tabs. Data such as band, date, set and venue is set in the typed voice; explanations are set in the interface voice. Sets are roman numerals. Coloured label stock groups tapes and never replaces text. The spine is the list item: a tab, a label and an end. The sample tape labels in this pack name real Grateful Dead shows the way a taper writes them; they are illustration, not catalog entries. The band name describes the archive's contents and implies no endorsement. Dedhed is a private pilot on a loopback address with no public domain; source availability never authorizes public relay, and artwork must not claim otherwise. Credits, track order and uncertain set boundaries are preserved in the product and are shown as warning stickers, not hidden.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #efe9d8 | Main canvas |
| Text | #1f1d1a | Headlines and body text |
| Accent | #c8102e | Signature artwork and emphasis |
| Secondary | #c58b4e | Supporting artwork |
| Small label | #4c4842 | Metadata on the main canvas |

Measured text/base contrast: **13.87:1**. Small-label/base contrast: **7.49:1**. Accent/base contrast: **4.85:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Liberation Serif, bold for headlines.
- Body: Public Sans, regular and bold.
- Labels: Liberation Mono, regular.
- Layout spacing: 8, 16, 24, 32, 48, 64, 96 pixels.
- Use one clear headline, one supporting point and one destination per promotional asset.
- Keep at least one quarter of the mark height clear on all sides. Minimum mark width: 32 pixels on screen. Minimum horizontal lockup width: 220 pixels. Use the mark alone below that size.
- Avoid stretching, skewing, adding effects to or redrawing the carried-forward product marks. Use the outlined logo exports when fonts are unavailable.

## Files and editing

`logos/` contains full-color primary/dark/light lockups and marks plus single-color variants, each with editable SVG, outlined SVG and transparent PNG. `social/` contains an X/Bluesky banner, a taller banner master, avatars, square/landscape/story layouts, quote and release templates, and a screenshot frame. `video/` contains title, thumbnail, end-card and transparent lower-third layouts with a caption style file. `fonts/` contains the required fonts and redistribution licenses. `tokens.json` and `tokens.css` record reusable design roles. `asset-manifest.json` records file dimensions and hashes.

Editable SVG text needs the included fonts. Install them for editing, or use the outlined logo SVGs and rendered PNGs for placement. PNGs are exported from the editable SVG source. Re-render with the top-level `build_packs.py` and its fontconfig.xml; do not edit the PNG separately.

The story artwork keeps the main message between y=250 and y=1670 on a 1080×1920 canvas. Check the destination’s current overlay and crop behavior in its composer. Keep critical banner content away from the bottom-left avatar area. These are layout guides, not a guarantee of every platform crop.

## Product site and design system

`landing.html` is a static landing page for the product, built on the design-system tokens. It shows the masthead, the rack, the shared-radio panel and the pilot boundary. Its tape labels and station state are samples. `product/` holds web exports: `favicon.svg`, `apple-touch-icon.png`, `hero.svg` and `og.png` (1200×630, no URL). Text is outlined. Copy them into the product; regenerate here with `dedhed_product_assets.py` instead of editing the copies.

`design-system/` is a copy of the proposal from the product repository: `README.md` (the reading of the source photographs, token groups, three type voices, motion rules and component list), `tokens.css` (every token as a CSS custom property plus the spine, rack, key, field, sticker, reel, counter, VU meter and masthead primitives) and four example pages under `examples/`: the specimen sheet, the rack, the J-card and the deck. `source-provenance.json` records the source path and SHA-256 of each copied file. The product repository stays the editing source for the design system; this copy is for the Studio gallery and the admin bundle.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: Dedhed design proposal docs/design/ in subculture-collective/dedhed (branch t3code/859bfaaf, head e5843b1, proposal files uncommitted on 2026-10-02), derived from the eleven cassette photographs in docs/inspo/; cream backdrop and shared masthead approved by the user on October 2, 2026. Source/asset observation dates are recorded in the reference above. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
