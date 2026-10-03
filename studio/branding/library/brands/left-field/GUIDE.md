# Left Field — Brand and asset guide

Approved direction: **A / The field ledger**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

Warm paper, dark green ink and rust-red annotations, set like a ledger of seats and their source records.

## Notes for this pack

### Name

Write Left Field in prose, LEFT FIELD in the wordmark and left-field in repository and package identifiers. Preserve database names, receipt namespaces and historical source identifiers.

### Mark

The LF monogram is original and geometric: a left-anchored L and an open F on the same baseline, with a rust-red square filling their intersection. The square is not a ballot, result or certification symbol. The user approved the field-ledger direction and this mark, with the F reaching the L baseline and the red square at the intersection. Dark variants use paper ink; light and primary variants use dark ink. Use the monochrome mark when color reproduction is uncertain.

### Color

Keep the app palette: paper #f4f0e6, ink #16221f, rust #a33c26 and wash #e5eadc.

### Type

Liberation Serif is the bundled, portable stand-in for the app's Georgia stack. Public Sans replaces Arial in pack exports. JetBrains Mono sets source labels.

### Limits

Source rows in the artwork are abstract motifs without scores or counts. Show an actual ranking only with its version, scope, date, limitations and source. Never turn a provisional score into an election prediction or imply DSA endorsement.

### Site

The site is public at left-field.subcult.tv and names SUBCULT as its publisher. The product owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists the pack files the site carries and where the site differs from this pack (system fonts). `tokens.json` lists the site roles under `product_interface`.

## Voice

Left Field copy comes from the research desk with the footnotes still attached. It reads like a methods section by someone who can also write a headline: limits come before conclusions, and the tone is dry. A heading may be wry ("Where the field bends."); a number never is. Use "provisional", "versioned", "not in this score" and "unavailable", work at seat level with public records, and name what is missing. Leave out prediction, horse-race language, "data-driven", "insights" and anything that implies an endorsement or voter-level targeting.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md).

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f4f0e6 | Main canvas |
| Text | #16221f | Headlines and body text |
| Accent | #a33c26 | Signature artwork and emphasis |
| Secondary | #e5eadc | Supporting artwork |
| Small label | #a33c26 | Metadata on the main canvas |

Measured contrast against the base: text **14.39:1**, small label **5.71:1**, accent **5.71:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Liberation Serif, bold, for headlines.
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

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Left Field main 5f41c5fd5cc5441ded34f8efe3a1fab6ce2c9707, src/app/globals.css and src/components/presentational.tsx, serving left-field.subcult.tv; observed 2026-10-02. New original LF monogram. LF baseline/intersection revision approved by the user in this thread.. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.

## Rebuild this pack

From `branding/library/`:

```bash
BRAND_ONLY=left-field python build_packs.py
BRAND_ONLY=left-field python render_video_previews.py
python finalize_left_field.py
```

The final step creates web exports, validates the assets and refreshes the
manifest and `left-field.zip`. Rebuild only this brand to preserve unrelated
masters and exports. Source observations are in `source-provenance.json`.
