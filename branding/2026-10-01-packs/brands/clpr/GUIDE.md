# CLPR — Brand and asset guide

Selected direction: **A / Play / Clip stack + single-clip square**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Clip stack layouts with one matching clip card on the square post and the play-triangle logo.

The user-edited play-triangle logo governs the assets. The user selected Clip stack for the main layouts and single clip card for the square post. The comparison variations remain available. These layouts replace the filmstrip and timeline motifs. Keep the muted-white wordmark, purple play triangle, dark field and green details. Earlier banners are preserved in references/. Use the captured play wordmark and play icon. Barlow Condensed sets titles; Barlow carries body copy; IBM Plex Mono carries labels. Crop corners, overlapping clip cards and purple play fields are the three graphic alternatives. Keep their geometry separate from screenshots of the product. clpr.tv applies this pack as of October 2, 2026; the Product site section below records how. The site writes the name in lowercase, `clpr`, in its interface text; Studio documents and artwork labels use CLPR. Keep the wordmark artwork as drawn. The earlier name Clipper and the clpr.gg domain are retired; the product lives at clpr.tv. The tally-dot logo that the site used before this pack is retired with them.

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

## Product site

clpr.tv has used this pack since October 2, 2026 (clpr `main` at `eae90c84`, PRs 37 and 38). Studio stays the source for the marks. Change a mark here first, copy its path data to the site unchanged, then run `node scripts/render-brand-assets.mjs` in the site's `frontend/` to rebuild its icons, social card and extension icons. The site records the copied sources and their hashes in `docs/brand-provenance.json` and its interface rules in `docs/design-system.md` (Tally / Ultraviolet).

| Site asset | Built from | How it is applied |
| --- | --- | --- |
| Header wordmark | `references/clpr-play-wordmark.svg` | Path data and transforms unchanged; Inkscape editor attributes removed. The header shows it 32 pixels tall, about 70 pixels wide. That is below the 220-pixel lockup minimum and is a deliberate exception for a 56-pixel header. |
| Play mark | `references/clpr-play-icon.svg` | Outer triangle #291d47, inner triangle #8c5cff. Used alone on the offline page. |
| App icon, favicon and PWA icons | Play mark on #0e0c13 | The mark's box is 62.5% of the icon, as in `social/avatar`. The maskable icon uses 53% to stay inside the safe zone, and the 64-pixel favicon uses 81% so the mark survives at 16 pixels. |
| Link preview, 1200×630 | Clip stack layout | Wordmark, two-line headline, three clip cards (fill #211b30, back cards ruled #493c64, front card ruled #8c5cff), a #3ddc97 progress line, a #8c5cff rule and `clpr.tv` in IBM Plex Mono. It keeps the site's existing headline, The moments shaping live culture, not this pack's sample headline. |
| Browser extension icons | The app icon | Rendered by the same site script at 16, 32, 48 and 128 pixels. The earlier icon, a letter C on Twitch's purple #9146ff, is retired. |

The interface adds roles that this pack's tokens do not define. They belong to the site, not to promotional artwork:

| Role | Color | Use |
| --- | --- | --- |
| Panel | #17141f | Cards, menus and empty states on the base |
| Primary button | #a07cff | Filled controls, always with base-colored text. White on the accent measures about 4.1:1 and is not used. |
| Link and focus | #b79bff | Links, small accent text and the focus ring |
| Warning | #ffc24a | Warnings |
| Info | #9fd8ff | Information and downvotes |
| Error | #ff6b78 | Errors and destructive actions |

- Corners are near-square, 0 to 4 pixels. Avatars and status dots stay round.
- Headings are uppercase Barlow Condensed at weight 700. Rank numerals and page-level display type use weight 800.
- Crop corners are the only pack graphic inside the interface: the `.crop-corners` utility draws 2-pixel corners with 20-pixel arms on empty and placeholder panels. The clip stack stays in promotional images so it is not mistaken for real clip cards. Play controls on thumbnails are a square button, not the brand mark.
- Information pages such as About and Support follow the feed: a mono label, a display heading, ruled rows and real clips. They do not use icon tiles, glow backgrounds or checkmark lists.
- Upvote is the action on a clip or comment. Uppies is the reputation score a member earns from upvotes.
- Retired on the site: the tally-dot logo, the violet rule across the top of promotional cards, and the timecode burned into the link preview. The 3-pixel violet rule on active panels and the duration label on thumbnails remain interface conventions.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: User-edited CLPR logo; Clip stack direction selected by the user on October 1, 2026; applied to clpr.tv on October 2, 2026. Source/asset observation dates are recorded in the reference above. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
