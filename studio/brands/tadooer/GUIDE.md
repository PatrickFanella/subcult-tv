# Tadooer — Brand and asset guide

Selected direction: **A / The plan and the one thing now**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

One planner day on Catppuccin Mocha surfaces with Dracula accents. It has a time column, task rows, one purple focus session, the pink now line and a teal calendar block.

## Notes for this pack

Tadooer is a private, self-hosted task and calendar planner for one owner: a web app, plus desktop and mobile shells around the same server. The repository and service identifier stay `productivity-suite`.

### Status

Studio proposed this promotional direction, The plan and the one thing now, on October 2, 2026 from the product's own design system. The owner approved all pack assets, including the headline and supporting copy, on October 10, 2026. Approval covers the artwork, not publication; a changed asset needs a fresh review.

### Mark and wordmark

The mark is the suite icon: three list lines (the plan) and a check in a purple disc (the one thing being done now) on a rounded crust tile. Every shape is solid, so it stays legible at 32 pixels. Monochrome variants drop the tile, draw the disc as a ring and set the lines and check in ink. In this pack the tile has a line-strong (#3a3a54) border, one step above crust, so its shape stays visible on dark canvases; the product icon has no border. The wordmark is Tadooer in Inter bold with -0.015em tracking and one capital. The app sets page titles at weight 650 on the variable font; this pack's static Inter 700 is the nearest bundled weight.

### Color

Surfaces and text are Catppuccin Mocha. Crust (#11111b) is the outer frame and the mark's tile, base (#1e1e2e) is the canvas and surface-0 (#252538) carries task rows. Text (#e2e6f6, 13.2:1 on base) carries copy and subtext (#a6adc8, 7.4:1) carries labels. Accents are Dracula, with one meaning each:

- Purple (#bd93f9, 6.8:1): the primary action, selection, time blocks and the focus frame.
- Pink (#ff79c6): now. The current-time line, the live timer and the running focus label, and nothing else.
- Cyan (#8be9fd): the keyboard focus ring, links and information.
- Teal (#94e2d5): calendar authority.

Never fill a large area with a full-strength accent. Tinted fills are the accent at 13 to 14 percent over a surface.

### Type

Inter sets headlines and body copy. Atkinson Hyperlegible Mono, with tabular numerals, sets anything that is a time, a count or a label.

### Planner day

The signature motif is one day: a time column, task rows on surface-0 with one row framed purple as the focus session, the pink now line and a teal calendar block. Its row titles are placeholders, never real tasks.

### Limits

Tadooer has no public domain and no sign-up. Artwork must not suggest a public service, show a URL or invite registration. The product's own documents never claim a feature that is not verified, and copy here follows the same rule. The app is dark only; the light and monochrome lockups are for print and foreign backgrounds, not for the interface.

## Voice

The planner speaks for itself, quietly: one short sentence at a time, present tense. It is a private tool for one owner, so copy never recruits. Avoid "get more done", "supercharge", streaks, hustle, a URL and any sign-up invitation. The owner approved this pack's promotional copy on October 10, 2026; edited copy needs a fresh review.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md).

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #1e1e2e | Main canvas |
| Text | #e2e6f6 | Headlines and body text |
| Accent | #bd93f9 | Signature artwork and emphasis |
| Secondary | #8be9fd | Supporting artwork |
| Small label | #a6adc8 | Metadata on the main canvas |

Measured contrast against the base: text **13.19:1**, small label **7.37:1**, accent **6.80:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Inter, bold, for headlines.
- Body: Inter, regular and bold.
- Labels: Atkinson Hyperlegible Mono, regular.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.
- Give each promotional asset one headline, one supporting point and one destination.
- Leave a quarter of the mark's height clear on every side. On screen the mark is at least 32 pixels wide and the horizontal lockup at least 220 pixels wide. Below that width, use the mark alone.
- Do not stretch, skew, redraw or add effects to the product marks. Where the fonts are not installed, use the outlined logo exports.

## Files and editing

| Path | Contents |
| --- | --- |
| `logos/` | Primary, dark and light lockups and marks in full color, plus single-color variants. Each has an editable SVG, an outlined SVG and a transparent PNG. |
| `social/` | X/Bluesky banner, taller banner master, avatar, square, landscape and story layouts, quote and release templates, and a screenshot frame. |
| `video/` | Title, thumbnail, end-card and transparent lower-third layouts, with a caption style file. |
| `fonts/` | The fonts the pack needs and their redistribution licenses. |
| `tokens.json`, `tokens.css` | Reusable design roles. |
| `asset-manifest.json` | File dimensions and hashes. |

Editable SVG text needs the included fonts. Install them to edit, or place the outlined logo SVGs and the rendered PNGs instead. The PNGs are exported from the editable SVGs. Re-render them with the top-level `build_packs.py` and its `fontconfig.xml`; do not edit a PNG on its own.

The story artwork keeps its main message between y=250 and y=1670 on a 1080×1920 canvas. Keep critical banner content away from the bottom-left corner, where the avatar sits. These are layout guides, and platforms crop differently, so check the current overlay and crop in the destination's composer.

## Product web assets and design system

`product/` holds exports for the web manifest and link previews:

- `favicon.svg`, outlined.
- `apple-touch-icon.png`, 180 pixels.
- `icon-512.png` and `icon-maskable-512.png`. The maskable icon keeps the mark inside the safe zone on crust.
- `og.png`, 1200×630. It has no URL because the planner has no public domain.

Copy them into `apps/web/public/`. To change one, regenerate it here with `tadooer_product_assets.py`; do not edit the copies.

`design-system/` is a copy of `docs/design/` from the product repository: `README.md` (identity, direction, surfaces, accents, type, shape, component rules), `tokens.css` (every token as a CSS custom property) and `examples/01-specimen.html`. `source-provenance.json` records the source path, the head commit and the SHA-256 of each file as it was copied on 2026-10-02, and names `apps/web/public/suite-icon.svg` as the mark source. The product repository stays the editing source for interface rules. Promotional layouts are edited here.

On 2026-10-03 Studio tightened the prose in `design-system/README.md`. Since that date its wording differs from the product repository's; every token, value, measurement and rule is unchanged. `tokens.css`, `brand-assets.json` and `examples/01-specimen.html` are byte-identical to the source. `source-provenance.json` records the difference. `tadooer_product_assets.py` re-copies the product files only when `TADOOER_SOURCE` is set, and doing so replaces the Studio wording.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Tadooer design system docs/design/ in subculture-collective/productivity-suite (branch wave/tadooer-brand, head 17d7bee, committed), mark from apps/web/public/suite-icon.svg; copied 2026-10-02. Promotional direction proposed by Studio; the owner approved all pack assets on October 10, 2026.. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
