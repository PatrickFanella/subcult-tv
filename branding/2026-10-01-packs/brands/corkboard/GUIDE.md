# Corkboard — Brand and asset guide

Selected direction: **A / Pinned / flyer wall**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

A cork field, paper cards and cobalt pushpins: every destination pinned to one board.

Proposed identity for the self-serve links-page service, code name zelda; the name Corkboard was chosen by the user on October 2, 2026, the visual direction awaits review. The mark is an original pinned paper card: two link rows on a tilted card under a cobalt pushpin. It stays legible at 32 pixels because the rows and pin are solid shapes. Cork (#d4a56c) is the field, ink (#1b130c) carries all text, paper (#fbf6ec) fills cards, and cobalt (#2340e8) is reserved for pins and large emphasis: cobalt on cork is 3.2:1, so never use it for small text. Archivo Black sets the wordmark and headlines, Atkinson Hyperlegible Next carries body copy and JetBrains Mono carries labels, the shared SUBCULT cue. Pinned cards carry placeholder destinations (@yourname, $yourname, a decorative QR glyph that encodes nothing); do not show third-party platform logos in brand artwork. Cards tilt between -7 and +7 degrees with a hard ink shadow; keep at least one card straight enough to read. The product page itself lets users pick any theme, so this identity applies to the service, not to user pages.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #d4a56c | Main canvas |
| Text | #1b130c | Headlines and body text |
| Accent | #2340e8 | Signature artwork and emphasis |
| Secondary | #fbf6ec | Supporting artwork |
| Small label | #1b130c | Metadata on the main canvas |

Measured text/base contrast: **8.21:1**. Small-label/base contrast: **8.21:1**. Accent/base contrast: **3.16:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Archivo Black, bold for headlines.
- Body: Atkinson Hyperlegible Next, regular and bold.
- Labels: JetBrains Mono, regular.
- Layout spacing: 8, 16, 24, 32, 48, 64, 96 pixels.
- Use one clear headline, one supporting point and one destination per promotional asset.
- Keep at least one quarter of the mark height clear on all sides. Minimum mark width: 32 pixels on screen. Minimum horizontal lockup width: 220 pixels. Use the mark alone below that size.
- Avoid stretching, skewing, adding effects to or redrawing the carried-forward product marks. Use the outlined logo exports when fonts are unavailable.

## Files and editing

`logos/` contains full-color primary/dark/light lockups and marks plus single-color variants, each with editable SVG, outlined SVG and transparent PNG. `social/` contains an X/Bluesky banner, a taller banner master, avatars, square/landscape/story layouts, quote and release templates, and a screenshot frame. `video/` contains title, thumbnail, end-card and transparent lower-third layouts with a caption style file. `fonts/` contains the required fonts and redistribution licenses. `tokens.json` and `tokens.css` record reusable design roles. `asset-manifest.json` records file dimensions and hashes.

Editable SVG text needs the included fonts. Install them for editing, or use the outlined logo SVGs and rendered PNGs for placement. PNGs are exported from the editable SVG source. Re-render with the top-level `build_packs.py` and its fontconfig.xml; do not edit the PNG separately.

The story artwork keeps the main message between y=250 and y=1670 on a 1080×1920 canvas. Check the destination’s current overlay and crop behavior in its composer. Keep critical banner content away from the bottom-left avatar area. These are layout guides, not a guarantee of every platform crop.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: New identity for the self-serve links-page service (code name zelda), proposed October 2, 2026. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
