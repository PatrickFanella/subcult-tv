# CLPR — Brand and asset guide

Selected direction: **A / Play / Clip stack + single-clip square**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

Clip stack layouts with one matching clip card on the square post and the play-triangle logo.

## Notes for this pack

### Logo and layouts

The user-edited play-triangle logo governs every asset. Use the captured play wordmark and play icon, and keep the wordmark artwork as drawn.

The user selected Clip stack for the main layouts and the single clip card for the square post. These layouts replace the filmstrip and timeline motifs. The comparison variations remain available, and earlier banners are preserved in `references/`.

### Color and type

- Keep the muted-white wordmark, the purple play triangle, the dark field and the green details.
- Barlow Condensed sets titles, Barlow sets body copy and IBM Plex Mono sets labels.

### Graphics

Crop corners, overlapping clip cards and purple play fields are the three graphic alternatives. Keep their geometry separate from screenshots of the product.

### Name and site

- The site writes the name in lowercase, `clpr`, in its interface text. Studio documents and artwork labels use CLPR.
- clpr.tv applies this pack as of October 2, 2026. The Product site section below records how.
- The earlier name Clipper and the clpr.gg domain are retired. The product lives at clpr.tv. The tally-dot logo that the site used before this pack is retired with them.

## Voice

clpr sounds like a regular in chat who clips everything and remembers which stream it was: fast, amused and comfortable in lowercase. It talks about clips the way viewers do (the bit, the fail, the one from last Tuesday) and uses "clip" as a verb. Fragments are fine. A page gets one exclamation mark at most. Leave out "content", "discover", "moments that matter" and emote spam.

Supported claims are finding Twitch clips by creator, topic and tag, saving them to playlists and sharing them. Watch parties, a live feed, stream clip creation and mirroring are disabled at launch, so copy does not mention them.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md). Facts come from [the claims register](../../../../content/social/Product%20Claims%20Register.md), entry C-CLPR.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #0e0c13 | Main canvas |
| Text | #eeedf7 | Headlines and body text |
| Accent | #8c5cff | Signature artwork and emphasis |
| Secondary | #3ddc97 | Supporting artwork |
| Small label | #8c5cff | Metadata on the main canvas |

Measured contrast against the base: text **16.74:1**, small label **4.71:1**, accent **4.71:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: Barlow Condensed, bold, for headlines.
- Body: Barlow, regular and bold.
- Labels: IBM Plex Mono, regular.
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

## Product site

clpr.tv has used this pack since October 2, 2026 (clpr `main` at `eae90c84`, PRs 37 and 38). Studio stays the source for the marks. Change a mark here first, copy its path data to the site unchanged, then run `node scripts/render-brand-assets.mjs` in the site's `frontend/` to rebuild its icons, social card and extension icons. The site records the copied sources and their hashes in `docs/brand-provenance.json` and its interface rules in `docs/design-system.md` (Tally / Ultraviolet).

| Site asset | Built from | How it is applied |
| --- | --- | --- |
| Header wordmark | `references/clpr-play-wordmark.svg` | Path data and transforms unchanged; Inkscape editor attributes removed. The header shows it 32 pixels tall, about 70 pixels wide. That is below the 220-pixel lockup minimum and is a deliberate exception for a 56-pixel header. |
| Play mark | `references/clpr-play-icon.svg` | Outer triangle #291d47, inner triangle #8c5cff. Used alone on the offline page. |
| App icon, favicon and PWA icons | Play mark on #0e0c13 | The mark's box is 62.5% of the icon, as in `social/avatar`. The maskable icon uses 53% to stay inside the safe zone, and the 64-pixel favicon uses 81% so the mark survives at 16 pixels. |
| Link preview, 1200×630 | Clip stack layout | Wordmark, two-line headline, three clip cards (fill #211b30, back cards ruled #493c64, front card ruled #8c5cff), a #3ddc97 progress line, a #8c5cff rule and `clpr.tv` in IBM Plex Mono. It keeps the site's existing headline, The moments shaping live culture, not this pack's sample headline. |
| Browser extension icons | The app icon | Rendered by the same site script at 16, 32, 48 and 128 pixels. The earlier icon, a letter C on Twitch's purple #9146ff, is retired. |

The interface adds roles that this pack's tokens do not define. They belong to the site, not to promotional artwork:

| Role | Color | Use |
| --- | --- | --- |
| Panel | #17141f | Cards, menus and empty states on the base |
| Primary button | #a07cff | Filled controls, always with base-colored text. White on the accent measures about 4.1:1 and is not used. |
| Link and focus | #b79bff | Links, small accent text and the focus ring |
| Warning | #ffc24a | Warnings |
| Info | #9fd8ff | Information and downvotes |
| Error | #ff6b78 | Errors and destructive actions |

- Corners are near-square, 0 to 4 pixels. Avatars and status dots stay round.
- Headings are uppercase Barlow Condensed at weight 700. Rank numerals and page-level display type use weight 800.
- Crop corners are the only pack graphic inside the interface: the `.crop-corners` utility draws 2-pixel corners with 20-pixel arms on empty and placeholder panels. The clip stack stays in promotional images so it is not mistaken for real clip cards. Play controls on thumbnails are a square button, not the brand mark.
- Information pages such as About and Support follow the feed: a mono label, a display heading, ruled rows and real clips. They do not use icon tiles, glow backgrounds or checkmark lists.
- Upvote is the action on a clip or comment. Uppies is the reputation score a member earns from upvotes.
- Retired on the site: the tally-dot logo, the violet rule across the top of promotional cards, and the timecode burned into the link preview. The 3-pixel violet rule on active panels and the duration label on thumbnails remain interface conventions.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: User-edited CLPR logo; Clip stack direction selected by the user on October 1, 2026; applied to clpr.tv on October 2, 2026. Where an observation date was recorded, it is in the reference above. Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
