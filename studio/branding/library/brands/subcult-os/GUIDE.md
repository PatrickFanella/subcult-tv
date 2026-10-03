# Subcult OS — Brand and asset guide

Selected direction: **B / The terminal ledger**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

Subcults terminal system: Space Mono, square frames, purple actions and cyan focus on a black canvas, matching the live site.

## Notes for this pack

The pack matches the live os.subcult.tv design system: the Subcults terminal foundation, selected by the user on September 30, 2026. The source of truth is `contracts/design/tokens.json` in the subcult-os repository.

### Type

Space Mono is the only typeface. Bold sets headings, buttons and labels, and it is the heaviest weight. Regular sets body copy. Labels are uppercase with wide tracking.

### Shape

Corners are square everywhere. Panels separate with visible borders, not shadows.

### Color

- Purple is the action and artwork color. Purple fills carry white text (5.7:1). Purple text on black is below the small-text target, so labels use cyan.
- Cyan also marks focus.
- Status colors (green, amber, red, cyan) mark states and always come with words.
- Event artwork stays immersive and black.

### Mark on the site

The site sets the OS lettermark with its cyan cursor block (`product/mark-tight-outlined.svg`) beside the wordmark in live Space Mono bold. It uses the mark as its favicon and app icon.

## Voice

Subcult OS sounds like the stage manager on comms forty minutes before doors: a run sheet, clipped, time-stamped and role-first, with the dry humor of someone who has run a door from a paper list. Copy can be set as cues, such as "19:00 doors". Name the roles and the moments: load-in, doors, the list, close-out. Say that the software is in development and built around free ticket reservations.

Leave out "event management platform" and nightlife glamour. Promise nothing about paid ticketing, payouts, app stores or a production service.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md). Facts come from [the claims register](../../../../content/social/Product%20Claims%20Register.md), entry C-OS.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #000000 | Main canvas |
| Text | #ffffff | Headlines and body text |
| Accent | #7c3aed | Signature artwork and emphasis |
| Secondary | #00ffff | Supporting artwork |
| Small label | #00ffff | Metadata on the main canvas |

Measured contrast against the base: text **21.00:1**, small label **16.75:1**, accent **3.69:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Space Mono, bold, for headlines.
- Body: Space Mono, regular and bold.
- Labels: Space Mono, regular.
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

## Product exports

`product/` holds exports at their final sizes for the Subcult OS site and app. Copy them as they are. Do not crop, resize or recolor them downstream.

| File | Use |
| --- | --- |
| `mark-tight.svg`, `mark-tight-outlined.svg` | The mark cropped to its frame, for favicons and for placement beside live text. Add the quarter-height clear space in layout. |
| `favicon-32.png`, `favicon-48.png` | Raster favicons for the site and for Expo web. |
| `app-icon.png` | 1024×1024 opaque store and iOS icon. |
| `apple-touch-icon.png` | 180×180 opaque home-screen icon for the site. |
| `android-adaptive-foreground.png` | 1024×1024 transparent adaptive-icon foreground. Pair it with the base color #000000 as the adaptive background. |
| `android-adaptive-monochrome.png` | 1024×1024 single-color layer for Android themed icons. |
| `splash-icon.png` | 1024×1024 transparent mark for a splash screen on the base color. |
| `og.png` | 1200×630 link preview: the X/Bluesky banner centered on the base color. Its headline needs owner approval before it ships on a site (subcult-os issue 201). |

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: Live https://os.subcult.tv and subcult-os contracts/design/tokens.json (dark theme), observed 2026-10-02. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
