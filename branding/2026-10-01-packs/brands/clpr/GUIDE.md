# CLPR — Brand and asset guide

Selected direction: **A / Play / Clip stack + single-clip square**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Clip stack layouts with one matching clip card on the square post and the play-triangle logo.

The user-edited play-triangle logo governs the assets. The user selected Clip stack for the main layouts and single clip card for the square post. The comparison variations remain available. These layouts replace the filmstrip and timeline motifs. Keep the muted-white wordmark, purple play triangle, dark field and green details. Earlier banners are preserved in references/. Use the captured play wordmark and play icon. Barlow Condensed sets titles; Barlow carries body copy; IBM Plex Mono carries labels. Crop corners, overlapping clip cards and purple play fields are the three graphic alternatives. Keep their geometry separate from screenshots of the product.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #0e0c13 | Main canvas |
| Text | #eeedf7 | Headlines and body text |
| Accent | #8c5cff | Signature artwork and emphasis |
| Secondary | #3ddc97 | Supporting artwork |
| Small label | #8c5cff | Metadata on the main canvas |

Measured text/base contrast: **16.74:1**. Small-label/base contrast: **4.71:1**. Accent/base contrast: **4.71:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Barlow Condensed, bold for headlines.
- Body: Barlow, regular and bold.
- Labels: IBM Plex Mono, regular.
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

Reference: User-edited CLPR logo; working graphic direction awaiting selection. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
