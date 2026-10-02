# Left Field — Brand and asset guide

Approved direction: **A / The field ledger**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Warm paper, dark green ink and rust-red annotations: an editorial system for seat research and its source records.

Use Left Field in prose, LEFT FIELD for the wordmark, and left-field for repository/package identifiers. Keep the app palette: paper #f4f0e6, ink #16221f, rust #a33c26 and wash #e5eadc. Liberation Serif is a bundled portable editorial alternative to the app Georgia stack; Public Sans replaces Arial in pack exports, while JetBrains Mono carries source labels. The original geometric LF monogram combines a left-anchored L and an open F on the same baseline. A rust-red square fills their intersection. The square is not a ballot, result or certification symbol. Source rows are abstract graphic motifs without scores or counts. Show actual rankings only with their version, scope, date, limitations and source. Never turn a provisional score into an election prediction or imply DSA endorsement. The user approved the field-ledger direction and LF mark with the F reaching the L baseline and the red square at their intersection. No public domain has been asserted. Dark variants use paper ink; light and primary variants use dark ink. Use the monochrome mark when color reproduction is uncertain. Preserve database names, receipt namespaces and historical source identifiers.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f4f0e6 | Main canvas |
| Text | #16221f | Headlines and body text |
| Accent | #a33c26 | Signature artwork and emphasis |
| Secondary | #e5eadc | Supporting artwork |
| Small label | #a33c26 | Metadata on the main canvas |

Measured text/base contrast: **14.39:1**. Small-label/base contrast: **5.71:1**. Accent/base contrast: **5.71:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Liberation Serif, bold for headlines.
- Body: Public Sans, regular and bold.
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

Reference: Left Field source checkout at abcf90fdd833adfb9fc6ba568d2e661742ff2538, src/app/globals.css and src/components/presentational.tsx; observed 2026-10-02. New original LF monogram. LF baseline/intersection revision approved by the user in this thread.. Source/asset observation dates are recorded in the reference above. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.

## Rebuild this pack

From `branding/2026-10-01-packs/`:

```bash
BRAND_ONLY=left-field python build_packs.py
BRAND_ONLY=left-field python render_video_previews.py
python finalize_left_field.py
```

The final step creates web exports, validates the assets and refreshes the
manifest and `left-field.zip`. Rebuild only this brand to preserve unrelated
masters and exports. Source observations are in `source-provenance.json`.
