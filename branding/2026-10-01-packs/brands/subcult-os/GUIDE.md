# Subcult OS — Brand and asset guide

Selected direction: **B / The terminal ledger**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Subcults terminal system: Space Mono, square frames, purple actions and cyan focus on a black canvas, matching the live site.

Matches the live os.subcult.tv design system (the Subcults terminal foundation, selected by the user on September 30, 2026; source of truth: subcult-os contracts/design/tokens.json). Space Mono is the only typeface: bold for headings, buttons and labels, regular for body copy, uppercase with wide tracking for labels. Bold is the heaviest weight. Corners are square everywhere; panels separate with visible borders, not shadows. Purple is the action and artwork color: purple fills carry white text (5.7:1), but purple text on black is below the small-text target, so labels use cyan. Cyan also marks focus. Status colors (green, amber, red, cyan) mark states and always come with words. Event artwork stays immersive and black. The OS lettermark with a cyan cursor block is a pack mark; the site itself uses the plain wordmark.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #000000 | Main canvas |
| Text | #ffffff | Headlines and body text |
| Accent | #7c3aed | Signature artwork and emphasis |
| Secondary | #00ffff | Supporting artwork |
| Small label | #00ffff | Metadata on the main canvas |

Measured text/base contrast: **21.00:1**. Small-label/base contrast: **16.75:1**. Accent/base contrast: **3.69:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Space Mono, bold for headlines.
- Body: Space Mono, regular and bold.
- Labels: Space Mono, regular.
- Layout spacing: 8, 16, 24, 32, 48, 64, 96 pixels.
- Use one clear headline, one supporting point and one destination per promotional asset.
- Keep at least one quarter of the mark height clear on all sides. Minimum mark width: 32 pixels on screen. Minimum horizontal lockup width: 220 pixels. Use the mark alone below that size.
- Avoid stretching, skewing, adding effects to or redrawing the carried-forward product marks. Use the outlined logo exports when fonts are unavailable.

## Files and editing

`logos/` contains full-color primary/dark/light lockups and marks plus single-color variants, each with editable SVG, outlined SVG and transparent PNG. `social/` contains an X/Bluesky banner, a taller banner master, avatars, square/landscape/story layouts, quote and release templates, and a screenshot frame. `video/` contains title, thumbnail, end-card and transparent lower-third layouts with a caption style file. `fonts/` contains the required fonts and redistribution licenses. `tokens.json` and `tokens.css` record reusable design roles. `asset-manifest.json` records file dimensions and hashes.

Editable SVG text needs the included fonts. Install them for editing, or use the outlined logo SVGs and rendered PNGs for placement. PNGs are exported from the editable SVG source. Re-render with the top-level `build_packs.py` and its fontconfig.xml; do not edit the PNG separately.

The story artwork keeps the main message between y=250 and y=1670 on a 1080×1920 canvas. Check the destination’s current overlay and crop behavior in its composer. Keep critical banner content away from the bottom-left avatar area. These are layout guides, not a guarantee of every platform crop.

`product/` contains exports at their final sizes for the Subcult OS site and app. Copy them as they are; do not crop, resize or recolor them downstream.

| File | Use |
| --- | --- |
| `mark-tight.svg`, `mark-tight-outlined.svg` | The mark cropped to its frame, for favicons and for placement beside live text. Add the quarter-height clear space in layout. |
| `favicon-32.png`, `favicon-48.png` | Raster favicons for the site and for Expo web. |
| `app-icon.png` | 1024×1024 opaque store and iOS icon. |
| `apple-touch-icon.png` | 180×180 opaque home-screen icon for the site. |
| `android-adaptive-foreground.png` | 1024×1024 transparent adaptive-icon foreground. Pair it with the base color #000000 as the adaptive background. |
| `android-adaptive-monochrome.png` | 1024×1024 single-color layer for Android themed icons. |
| `splash-icon.png` | 1024×1024 transparent mark for a splash screen on the base color. |
| `og.png` | 1200×630 link preview: the X/Bluesky banner centered on the base color. Its headline needs owner approval before it ships on a site (subcult-os issue 201). |

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: Live https://os.subcult.tv and subcult-os contracts/design/tokens.json (dark theme), observed 2026-10-02. Source/asset observation dates are recorded in the reference above. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
