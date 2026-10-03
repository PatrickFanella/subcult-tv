# Tadooer — Brand and asset guide

Selected direction: **A / The plan and the one thing now**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Catppuccin Mocha surfaces with Dracula accents: a planner day with a time column, task rows, one purple focus session, the pink now line and a teal calendar block.

Identity for Tadooer, a private, self-hosted task and calendar planner for one owner, with a web app, desktop and mobile shells around the same server. The repository and service identifier stay `productivity-suite`. This promotional direction, The plan and the one thing now, was proposed by Studio on October 2, 2026 from the product's own design system; the owner has not reviewed the artwork, and the headline and all supporting copy are sample text to be replaced. Surfaces and text are Catppuccin Mocha: crust (#11111b) is the outer frame and the mark's tile, base (#1e1e2e) is the canvas, surface-0 (#252538) carries task rows, and text (#e2e6f6, 13.2:1 on base) and subtext (#a6adc8, 7.4:1) carry copy and labels. Accents are Dracula with one meaning each: purple (#bd93f9, 6.8:1) is the primary action, selection, time blocks and the focus frame; pink (#ff79c6) is now (the current-time line, the live timer, the running focus label) and nothing else; cyan (#8be9fd) is the keyboard focus ring, links and information; teal (#94e2d5) is calendar authority. Never fill a large area with a full-strength accent; tinted fills are the accent at 13 to 14 percent over a surface. The mark is the suite icon: three list lines (the plan) and a check in a purple disc (the one thing being done now) on a rounded crust tile. It stays legible at 32 pixels because every shape is solid; monochrome variants drop the tile, draw the disc as a ring and set lines and check in ink. In this pack the tile carries a line-strong (#3a3a54) border, one step above crust, so its shape stays visible on dark canvases; the product icon itself has no border. The wordmark is Tadooer in Inter bold with -0.015em tracking, one capital; the app sets page titles at weight 650 on the variable font, and this pack's static Inter 700 is the nearest bundled weight. Atkinson Hyperlegible Mono carries anything that is a time, a count or a label, with tabular numerals. The planner day is the signature motif: a time column, task rows on surface-0 with one row framed purple as the focus session, the pink now line and a teal calendar block. Its row titles are placeholders, never real tasks. Tadooer has no public domain and no sign-up: artwork must not suggest a public service, show a URL or invite registration. The product's own documents never claim a feature that is not verified; copy here follows the same rule. The app is dark only; light and monochrome lockups exist for print and foreign backgrounds, not for the interface.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #1e1e2e | Main canvas |
| Text | #e2e6f6 | Headlines and body text |
| Accent | #bd93f9 | Signature artwork and emphasis |
| Secondary | #8be9fd | Supporting artwork |
| Small label | #a6adc8 | Metadata on the main canvas |

Measured text/base contrast: **13.19:1**. Small-label/base contrast: **7.37:1**. Accent/base contrast: **6.80:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Inter, bold for headlines.
- Body: Inter, regular and bold.
- Labels: Atkinson Hyperlegible Mono, regular.
- Layout spacing: 8, 16, 24, 32, 48, 64, 96 pixels.
- Use one clear headline, one supporting point and one destination per promotional asset.
- Keep at least one quarter of the mark height clear on all sides. Minimum mark width: 32 pixels on screen. Minimum horizontal lockup width: 220 pixels. Use the mark alone below that size.
- Avoid stretching, skewing, adding effects to or redrawing the carried-forward product marks. Use the outlined logo exports when fonts are unavailable.

## Files and editing

`logos/` contains full-color primary/dark/light lockups and marks plus single-color variants, each with editable SVG, outlined SVG and transparent PNG. `social/` contains an X/Bluesky banner, a taller banner master, avatars, square/landscape/story layouts, quote and release templates, and a screenshot frame. `video/` contains title, thumbnail, end-card and transparent lower-third layouts with a caption style file. `fonts/` contains the required fonts and redistribution licenses. `tokens.json` and `tokens.css` record reusable design roles. `asset-manifest.json` records file dimensions and hashes.

Editable SVG text needs the included fonts. Install them for editing, or use the outlined logo SVGs and rendered PNGs for placement. PNGs are exported from the editable SVG source. Re-render with the top-level `build_packs.py` and its fontconfig.xml; do not edit the PNG separately.

The story artwork keeps the main message between y=250 and y=1670 on a 1080×1920 canvas. Check the destination’s current overlay and crop behavior in its composer. Keep critical banner content away from the bottom-left avatar area. These are layout guides, not a guarantee of every platform crop.

## Product web assets and design system

`product/` holds exports for the web manifest and link previews: `favicon.svg` (outlined), `apple-touch-icon.png` (180), `icon-512.png` and `icon-maskable-512.png` (the mark inside the maskable safe zone on crust) and `og.png` (1200×630, no URL: the planner has no public domain). Copy them into `apps/web/public/`; regenerate here with `tadooer_product_assets.py` instead of editing the copies.

`design-system/` is a copy of `docs/design/` from the product repository: `README.md` (identity, direction, surfaces, accents, type, shape, component rules), `tokens.css` (every token as a CSS custom property) and `examples/01-specimen.html`. `source-provenance.json` records the source path, head commit and SHA-256 of each copied file, and names `apps/web/public/suite-icon.svg` as the mark source. The product repository stays the editing source for interface rules; promotional layouts are edited here.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: Tadooer design system docs/design/ in subculture-collective/productivity-suite (branch wave/tadooer-brand, head 17d7bee, committed), mark from apps/web/public/suite-icon.svg; copied 2026-10-02. Promotional direction proposed by Studio; the owner has not reviewed the artwork.. Source/asset observation dates are recorded in the reference above. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
