# SUBCULT — Brand and asset guide

Selected direction: **C / Culture / poster press**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

A louder poster system: condensed black type, purple fields and acid-green registrations.

This is the user-selected C direction. User-edited banner, logo banner and square-post masters are kept in references/subcult-edited-layouts/ and copied without alteration during rebuilds. The user-authored master mark is references/subcult-mark-master.svg: filled S and underscore, outlined C, a tilted green block, registration lines and a terminal square. Preserve its geometry, overlap and layer order. Use the master SVG for every variant; recolor only ink and accent for dark and light applications. In monochrome, outline the accent block so the letters remain legible. Use purple as the primary field, dark ink for headlines and acid green for blocks, registration marks and large emphasis. Use dark ink for text on green. Green on purple is decorative; it is below the small-text contrast target. Keep the six products visible as a coherent catalogue without recoloring their own identities.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #8b5cf6 | Main canvas |
| Text | #100b19 | Headlines and body text |
| Accent | #00ff88 | Signature artwork and emphasis |
| Secondary | #f0ece4 | Supporting artwork |
| Small label | #100b19 | Metadata on the main canvas |

Measured text/base contrast: **4.58:1**. Small-label/base contrast: **4.58:1**. Accent/base contrast: **3.16:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Oswald, bold for headlines.
- Body: Space Grotesk, regular and bold.
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

Reference: Alternative proposed system anchored in site palette. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
