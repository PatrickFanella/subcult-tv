# SUBCULT — Brand and asset guide

Selected direction: **C / Culture / poster press**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

A poster system: condensed black type, purple fields and acid-green registration marks.

## Notes for this pack

### Direction and masters

This is the C direction, selected by the user. The user-edited banner, logo banner and square-post masters are kept in `references/subcult-edited-layouts/`. Rebuilds copy them without alteration.

### Mark

The master mark is `references/subcult-mark-master.svg`, drawn by the user: a filled S and underscore, an outlined C, a tilted green block, registration lines and a terminal square.

- Preserve its geometry, overlap and layer order.
- Build every variant from the master SVG. For dark and light applications, recolor only the ink and the accent.
- In monochrome, outline the accent block so the letters stay legible.

### Color

- Purple is the primary field.
- Dark ink sets headlines and any text on green.
- Acid green is for blocks, registration marks and large emphasis. Green on purple is decorative. It is below the small-text contrast target.

### Product catalogue

Keep the six products visible as one catalogue, each in its own identity. Do not recolor them to match SUBCULT.

## Voice

SUBCULT speaks as the collective, in the first person plural, like a zine masthead: declarative, a little confrontational about platforms and specific about the work. It lists real jobs, such as clips, archives, mutual aid and the door at a show. It names what it is against only when it can name what it built instead. Leave out startup cheer, mission statements, "community-driven" and any promise about the whole umbrella.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md). Facts come from [the claims register](../../../../content/social/Product%20Claims%20Register.md).

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #8b5cf6 | Main canvas |
| Text | #100b19 | Headlines and body text |
| Accent | #00ff88 | Signature artwork and emphasis |
| Secondary | #f0ece4 | Supporting artwork |
| Small label | #100b19 | Metadata on the main canvas |

Measured contrast against the base: text **4.58:1**, small label **4.58:1**, accent **3.16:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Oswald, bold, for headlines.
- Body: Space Grotesk, regular and bold.
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

Reference: Alternative proposed system anchored in site palette. Site and asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
