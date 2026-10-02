# Prichal — Brand and asset guide

Selected direction: **A / Docking node / engineering drawing**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

A docking node on paper: one red occupied port, engineering-drawing rules and a port strip. Managed account servers for the open social web.

Identity for Prichal, managed AT Protocol PDS hosting (repository subculture-collective/prichal). The user chose the name Prichal on October 1, 2026: Russian for pier or berth, and the ISS docking node where Soyuz ships attach. The pronunciation is the Russian one (pree-CHAHL); copy never explains or corrects it. The mark is a docking node: a sphere with its equator in perspective and four flanged collars. The red flange on the right is the occupied port, the customer account. Never rotate it, recolor single collars, or add a centre dot or ring: with the cross of ports that reads as a gun sight. Mono variants turn the flange to ink. Paper (#f4f1e9) is the field, ink (#1c2230) carries text and the mark, signal red (#b23a26, 5.28:1 on paper) marks the occupied port, rules and large emphasis, and steel (#5d6675, 5.14:1) carries labels. In product interfaces red is reserved for the mark so it never reads as an error. Oswald Bold sets the uppercase wordmark and display headings, Public Sans carries body copy and JetBrains Mono carries labels and the port strip. The Cyrillic ПРИЧАЛ is a small secondary label, never a replacement for the Latin name. Engineering-drawing details (tick scale, hairlines, PORT 01–06 strip) stay light. Tagline: Your server. We keep it running. Call to action: Dock your account. We handle the rest. Do not market leaving, privacy, censorship resistance or unverified capabilities; Prichal is a private preview at prichal.subcult.tv and not open for sign-up. Messaging by audience and the plain-language table live in the product repository at brand/GUIDE.md.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f4f1e9 | Main canvas |
| Text | #1c2230 | Headlines and body text |
| Accent | #b23a26 | Signature artwork and emphasis |
| Secondary | #5d6675 | Supporting artwork |
| Small label | #5d6675 | Metadata on the main canvas |

Measured text/base contrast: **14.09:1**. Small-label/base contrast: **5.14:1**. Accent/base contrast: **5.28:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Oswald, bold for headlines.
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

Reference: Identity for Prichal, managed AT Protocol PDS hosting (subculture-collective/prichal); name, palette, mark and messaging selected with the user October 1–2, 2026. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
