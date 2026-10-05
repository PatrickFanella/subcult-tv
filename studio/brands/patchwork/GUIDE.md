# Patchwork — Brand and asset guide

Selected direction: **A / Neighbourhood fabric**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

Warm paper, soft green ink, Fraunces headings and one stitched patch shape shared by the P mark, the buttons and their shadows.

## Notes for this pack

### Mark and shape

The mark is the carried-forward P glyph in a tomato stitched patch. The mark, the supporting patches, the buttons and their offset shadows share one asymmetric corner shape. Stitched shapes are supporting artwork. Draw stitches large and mildly uneven, over faint paper grain and a low-opacity fabric weave. `components.html` shows working stitched buttons, drawn with responsive SVG stitching and a dashed CSS fallback. `patch-components.css` keeps the face and shadow corners identical.

### Color

Warm paper and green are the base. Soft green ink (#365448) sets headings and body copy, and shadows are a muted sage (#b2bba1). Bright tomato (#e85d3f) stays on the logo and decorative patches, and yellow marks highlights. Behind paper-colored button labels, use the darker action tomato (#b33e28), which measures 5.03:1.

### Type

Fraunces sets headings and Public Sans sets body text.

### Limits

Product captures must keep public locations approximate and leave out private addresses.

### Site

The product owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists where the site differs from this pack (darker ink, no stitching). `tokens.json` lists the site roles under `product_interface`.

## Voice

Patchwork copy sounds like a neighbor who has done this before and is not in a hurry: full sentences, warm without being sweet, with small ordinary examples such as a ride to an appointment, a spare crib or a hot meal. Say plainly that Patchwork is a pre-alpha demonstration and that nobody should arrange real help through it yet. State the location rule exactly: requests show approximate areas, and approved public resources can show their addresses. Keep the spelling each surface already uses (the app writes "neighbours"; subcult.tv writes "neighbors"). Leave out hero language, urgency, crisis imagery, protocol terms such as PDS, DID and AT identity, and any promise that help will come.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-PATCHWORK.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f2efe7 | Main canvas |
| Text | #365448 | Headlines and body text |
| Accent | #12664f | Signature artwork and emphasis |
| Secondary | #e85d3f | Supporting artwork |
| Small label | #12664f | Metadata on the main canvas |

Measured contrast against the base: text **7.26:1**, small label **6.01:1**, accent **6.01:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Fraunces, bold, for headlines.
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

Reference: Live site tokens. Site and asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
