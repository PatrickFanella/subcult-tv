# Kork — Brand and asset guide

Selected direction: **A / Pinned / flyer wall**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

A cork field, paper cards and cobalt pushpins. Each link is a card pinned to the board.

## Notes for this pack

Kork is the identity for the self-serve links-page service, code name zelda. The identity applies to the service. The product lets users pick any theme for their own pages, so it does not apply to user pages.

### Name and selection

On October 2, 2026 the user selected direction A (pinned card) and the name Kork over Corkboard. The comparison is in `corkboard-directions/`. A services marketplace also trades as Kork (kork.app). This was noted to the user, who chose the name anyway.

### Mark

The mark is an original pinned paper card: two link rows on a tilted card under a cobalt pushpin. The rows and the pin are solid shapes, so it stays legible at 32 pixels.

### Color

| Color | Role |
| --- | --- |
| Cork #d4a56c | The field |
| Ink #1b130c | All text |
| Paper #fbf6ec | Card fill |
| Cobalt #2340e8 | Pins and large emphasis only. Cobalt on cork is 3.2:1, so never use it for small text. |

### Type

Archivo Black sets the wordmark and headlines. Atkinson Hyperlegible Next sets body copy. JetBrains Mono sets labels, the cue shared across SUBCULT packs.

### Pinned cards

- Cards carry placeholder destinations: @yourname, $yourname and a decorative QR glyph that encodes nothing.
- Do not show third-party platform logos in brand artwork.
- Cards tilt between -7 and +7 degrees and cast a hard ink shadow. Keep at least one card straight enough to read.

## Voice

Kork sounds like a hand-lettered flyer written by whoever keeps the corkboard by the venue door tidy: chummy, and a little corny on purpose. Lead with the plain offer: a free link page, payment buttons that go to the creator's own accounts, and no cut. Give the real numbers (92 services, ten themes) and state the 24-hour wait before a new account can publish. The product's list is long, so lists can run long.

A page gets one pin pun, and exclamation marks come one at a time. Leave out "link in bio tool", creator-economy talk, custom domains, paid plans, prices and user counts.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md). Facts come from [the claims register](../../../../content/social/Product%20Claims%20Register.md), entry C-KORK.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #d4a56c | Main canvas |
| Text | #1b130c | Headlines and body text |
| Accent | #2340e8 | Signature artwork and emphasis |
| Secondary | #fbf6ec | Supporting artwork |
| Small label | #1b130c | Metadata on the main canvas |

Measured contrast against the base: text **8.21:1**, small label **8.21:1**, accent **3.16:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Archivo Black, bold, for headlines.
- Body: Atkinson Hyperlegible Next, regular and bold.
- Labels: JetBrains Mono, regular.
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

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Identity for the self-serve links-page service (code name zelda); direction A selected by the user October 2, 2026. Site and asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
