# HasanAra — Brand and asset guide

Selected direction: **A / Broadcast archive**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

The live site's red-and-paper theme, with Newsreader headlines and the current PBS mark.

## Notes for this pack

### Mark and theme

Match the current hasanara.tv red/PBS theme and keep the actual PBS artwork. The older lime theme in the local checkout is not this pack's reference.

### Type

Newsreader sets editorial headings, Inter Tight sets body copy and JetBrains Mono sets metadata.

### Limits

A quote needs its original passage, attribution and timestamp.

### Site

The application owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, color and type roles, components and assets, and lists where the site differs from this pack (a paper edition, its own home headline, hosted variable fonts). `tokens.json` lists the site roles under `product_interface`.

## Voice

HasanAra copy is read by the continuity announcer of the Piker Broadcasting Service: public television with a straight face, mock-solemn, a bit cheesy on purpose and never mean. Newspaper furniture is welcome: editions, the record, corrections. Call the archive "the record" and treat timestamps as citations. The joke is the formality, so the facts under it stay exact. Say outright that transcripts are machine-made and need checking against the recording before anyone quotes them. Leave out stan voice, political editorializing, claims of complete coverage or accuracy, and jokes at the expense of people in the recordings.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-HASANARA.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #0f0f0f | Main canvas |
| Text | #eeeae1 | Headlines and body text |
| Accent | #ff3333 | Signature artwork and emphasis |
| Secondary | #ff6633 | Supporting artwork |
| Small label | #ff3333 | Metadata on the main canvas |

Measured contrast against the base: text **15.97:1**, small label **5.27:1**, accent **5.27:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Newsreader, bold, for headlines.
- Body: Inter Tight, regular and bold.
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

Reference: Live site tokens and logo. Site and asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
