# Prichal — Brand and asset guide

Selected direction: **A / Docking node / engineering drawing**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

A docking node on paper: one red occupied port, engineering-drawing rules and a port strip. Managed account servers for the open social web.

## Notes for this pack

Prichal is managed AT Protocol PDS hosting (repository `subculture-collective/prichal`).

### Name

The user chose the name Prichal on October 1, 2026. It is Russian for pier or berth, and the name of the ISS docking node where Soyuz ships attach. The pronunciation is the Russian one (pree-CHAHL). Copy never explains or corrects it.

The Cyrillic ПРИЧАЛ is a small secondary label, never a replacement for the Latin name.

### Mark

The mark is a docking node: a sphere with its equator in perspective and four flanged collars. The red flange on the right is the occupied port, the customer account.

- Never rotate the mark or recolor single collars.
- Never add a centre dot or ring. With the cross of ports, that reads as a gun sight.
- Mono variants turn the red flange to ink.

### Color

| Color | Role |
| --- | --- |
| Paper #f4f1e9 | The field |
| Ink #1c2230 | Text and the mark |
| Signal red #b23a26 (5.28:1 on paper) | The occupied port, rules and large emphasis |
| Steel #5d6675 (5.14:1) | Labels |

In product interfaces red is reserved for the mark, so it never reads as an error.

### Type and drawing details

Oswald Bold sets the uppercase wordmark and display headings. Public Sans sets body copy. JetBrains Mono sets labels and the port strip.

The engineering-drawing details (tick scale, hairlines, PORT 01–06 strip) stay light.

### Copy

- Tagline: Your server. We keep it running.
- Call to action: Dock your account. We handle the rest.
- Prichal is a private preview at prichal.subcult.tv and is not open for sign-up.
- Do not market leaving, privacy, censorship resistance or unverified capabilities.

Messaging by audience and the plain-language table live in the product repository at `brand/GUIDE.md`.

## Voice

Prichal sounds like ground control speaking in plain words: a calm operations desk, procedural and reassuring, in short declaratives without jargon. It explains what a server is to someone who has never needed to know. The docking idea lives in two words, dock and port, and nowhere else, so there is no "liftoff" and no "mission". Give a protocol acronym a plain gloss or leave it out. Say that posts are public wherever the server runs.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md).

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #f4f1e9 | Main canvas |
| Text | #1c2230 | Headlines and body text |
| Accent | #b23a26 | Signature artwork and emphasis |
| Secondary | #5d6675 | Supporting artwork |
| Small label | #5d6675 | Metadata on the main canvas |

Measured contrast against the base: text **14.09:1**, small label **5.14:1**, accent **5.28:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Oswald, bold, for headlines.
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

Reference: Identity for Prichal, managed AT Protocol PDS hosting (subculture-collective/prichal); name, palette, mark and messaging selected with the user October 1–2, 2026. Site and asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
