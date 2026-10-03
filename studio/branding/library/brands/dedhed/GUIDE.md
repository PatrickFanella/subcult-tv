# Dedhed — Brand and asset guide

Selected direction: **A / The tape shelf**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

A taper's cassette shelf for concert recordings and one shared radio station: cream label paper, black shells, red brand tabs and a pine rack.

## Notes for this pack

Dedhed is a private concert-tape library and shared radio station for Grateful Dead recordings. Its identity is called The Tape Shelf. It comes from the taper cassette collections photographed in the product repository's docs/inspo/: typed and handwritten spine labels, cream and colored label stock, black and clear shells, red Maxell and TDK tabs, and pine racks. The user approved the cream paper backdrop on October 2, 2026.

### Name and mark

Write Dedhed in prose. In artwork, use the lowercase `dedhed` wordmark with its red record dot. The mark is an original cassette shell: label, red stripe, window, two hubs, screw holes and capstan notch. The shell and hubs are solid shapes, so the mark stays legible at 32 pixels. Monochrome variants turn the stripe to ink.

### Color

Paper (#efe9d8) is the field. Ink (#1f1d1a) carries text and the mark. Tab red (#c8102e, 5.3:1 on paper) is reserved for the record dot, brand tabs, the deck's top rule and the primary key. Pine (#c58b4e) is the rack behind spines and is never a text color. Colored label stock groups tapes and never replaces text.

### Type

Liberation Serif stands in for the Times/Georgia typed-label voice. Liberation Mono is the typewriter voice for counters, lineage and eyebrows. Public Sans sets interface prose and Barlow Condensed sets brand tabs. Band, date, set and venue are data and go in the typed voice; explanations go in the interface voice. Sets are roman numerals. The spine is the list item: a tab, a label and an end.

### Limits

The sample tape labels in this pack name real Grateful Dead shows the way a taper writes them. They are illustration, not catalog entries. The band name describes what the archive holds and implies no endorsement. Dedhed is a private pilot on a loopback address with no public domain. A recording being available from its source never authorizes public relay, and artwork must not claim otherwise. The product keeps credits, track order and uncertain set boundaries, and shows the uncertainty as a warning sticker instead of hiding it.

## Voice

Dedhed copy sounds like a taper labelling spines at the kitchen table: date first, venue second, source notes in the shorthand a head would recognize. It is affectionate, unfussy and a little corny on purpose. Do not quote lyrics, use tie-dye clichés or "long strange trip", or suggest official endorsement or a public station. Every piece of copy says this is a private pilot.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md).

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #efe9d8 | Main canvas |
| Text | #1f1d1a | Headlines and body text |
| Accent | #c8102e | Signature artwork and emphasis |
| Secondary | #c58b4e | Supporting artwork |
| Small label | #4c4842 | Metadata on the main canvas |

Measured contrast against the base: text **13.87:1**, small label **7.49:1**, accent **4.85:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Liberation Serif, bold, for headlines.
- Body: Public Sans, regular and bold.
- Labels: Liberation Mono, regular.
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

## Product site and design system

`landing.html` is a static landing page for the product, built on the design-system tokens. It shows the masthead, the rack, the shared-radio panel and the pilot boundary. Its tape labels and station state are samples.

`product/` holds web exports: `favicon.svg`, `apple-touch-icon.png`, `hero.svg` and `og.png` (1200×630, no URL). Text is outlined. Copy them into the product. To change one, regenerate it here with `dedhed_product_assets.py`; do not edit the copies.

`design-system/` is a copy of the design system in the product repository's docs/design/. The product applied it to its web app on 2026-10-02:

- `README.md`: what the source photographs show, the token groups, the type voices, motion rules and the component list.
- `tokens.css`: every token as a CSS custom property, plus the spine, rack, key, field, sticker, reel, counter, VU meter and masthead primitives.
- `examples/`: four pages, the specimen sheet, the rack, the J-card and the deck.
- `source-provenance.json`: the source path and the SHA-256 of each file as it was copied on 2026-10-02.

The product repository stays the editing source for the design system. This copy is for the Studio gallery and the admin bundle.

On 2026-10-03 Studio reworded the sample and explanatory copy in `landing.html`, `design-system/README.md` and the example pages `01-specimen.html`, `02-rack.html` and `04-deck.html` to follow the voice guide. Their wording differs from the files as first copied on 2026-10-02; tape and show data, tokens, class names and `tokens.css` are unchanged. The product repository took the same wording on its branch `copy/product-voice`, and the README's status line and its section on how the app uses the system now come from that branch (head `ab9d658`). All six design-system files match that revision byte for byte. `source-provenance.json` records both the first copy and this alignment. `dedhed_product_assets.py` re-copies the product files only when `DEDHED_SOURCE` is set; point it at a checkout that has the new wording.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Dedhed design proposal docs/design/ in subculture-collective/dedhed (branch t3code/859bfaaf, head e5843b1, proposal files uncommitted on 2026-10-02), derived from the eleven cassette photographs in docs/inspo/; cream backdrop and shared masthead approved by the user on October 2, 2026. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
