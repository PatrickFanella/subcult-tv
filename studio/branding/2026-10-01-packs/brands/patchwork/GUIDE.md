# Patchwork — Brand and asset guide

Selected direction: **A / Neighbourhood fabric**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Warm paper, softer green ink, larger Fraunces headings and a stitched patch shape shared by the P mark, buttons and shadows.

Warm paper and green are the base; bright tomato marks decorative patches and yellow marks highlights. Use darker action tomato (#b33e28) behind paper-colored button labels: 5.03:1 contrast. Keep the logo and decorative patches at their original tomato (#e85d3f). Use Fraunces for headings and Public Sans for body text. Stitched shapes are supporting artwork. Use the carried-forward P glyph in a tomato stitched patch. The mark, supporting patches, buttons and their offset shadows share the same asymmetric corner shape. Use larger, mildly uneven stitches, faint paper grain and a low-opacity fabric weave. The browser sample uses responsive SVG stitching with a dashed CSS fallback. Use soft green ink (#365448) for headings/body copy and a muted sage (#b2bba1) shadow. `components.html` shows working stitched buttons; `patch-components.css` keeps face and shadow corners identical. Product captures must preserve approximate public locations and omit private addresses. The product owns the site interface: [the website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists where the site differs from this pack (darker ink, no stitching). `tokens.json` lists the site roles under `product_interface`.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f2efe7 | Main canvas |
| Text | #365448 | Headlines and body text |
| Accent | #12664f | Signature artwork and emphasis |
| Secondary | #e85d3f | Supporting artwork |
| Small label | #12664f | Metadata on the main canvas |

Measured text/base contrast: **7.26:1**. Small-label/base contrast: **6.01:1**. Accent/base contrast: **6.01:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Fraunces, bold for headlines.
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

Reference: Live site tokens. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
