# Rekolekt — Brand and asset guide

Selected direction: **A / Index / original concept**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

The original bracketed waveform logo on an index-green palette. Transcript rows replace the waveform in the story illustration only.

## Notes for this pack

### Name and mark

The wordmark is lowercase `rekolekt`; write Rekolekt in prose and pair the name with "by SUBCULT" for endorsement. Keep the original bracketed waveform logo and do not change its geometry. Transcript rows and timestamps replace the decorative waveform in the story template only.

### Limits

A quoted passage keeps its source and context metadata.

### Source and site

The product source lives in `subculture-collective/rekolekt`. The contact route keeps `product=transcript-create` for compatibility. [The website design specification](WEBSITE.md) records the deployed landing page, its product copy and its interaction states.

## Voice

Rekolekt copy is written by the archivist who built the catalogue and knows where everything is. It reads like a finding aid: quiet, exact and slightly dry, in longer sentences that contain the mechanism. The readers maintain collections, so address them as peers and do not sell. Name the parts: recording, transcript, timestamp, passage, source link. Say that Rekolekt is software you deploy, that HasanAra is the running example, and that it is not a hosted upload service. Leave out "unlock your content", AI enthusiasm and any hint of a sign-up flow that does not exist.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-REKOLEKT.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #16201b | Main canvas |
| Text | #f2eee5 | Headlines and body text |
| Accent | #b8df72 | Signature artwork and emphasis |
| Secondary | #8d9e8a | Supporting artwork |
| Small label | #b8df72 | Metadata on the main canvas |

Measured contrast against the base: text **14.43:1**, small label **11.01:1**, accent **11.01:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Space Grotesk, bold, for headlines.
- Body: Public Sans, regular and bold.
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

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Existing proposed Rekolekt concept; story transcript illustration revision. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
