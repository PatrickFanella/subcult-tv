# Headcount — The door clicker

Direction: **A / Headcount: the door clicker**, selected by the owner on October 19, 2026 from [four candidates](../../studies/sus-quotient-directions/index.html). Status: selected identity, applied to the dashboard the same day. Template layouts are samples; a post or a profile change still needs its own review.

Headcount is a public, read-only dashboard at https://headcount.subcult.tv/ that tracks every Twitch channel once it reaches the global top 200 and scores each stream for patterns that view-bots, follow-bots and chat-bots produce. The score is the **sus quotient**, 0 to 100. The repository, Go module and service are `headcount` (`subculture-collective/headcount`); the database keeps its working name `susq`. Nothing here may suggest a Twitch product.

## The mark

The tally a door person keeps at a show: four strokes and the fifth drawn through them. The first two strokes are solid. The last two are hollow, people counted who never came in. The slash is amber.

- Solid ink strokes, hollow strokes and the slash keep their order and proportions. Do not fill the hollow strokes, add a fifth upright or recolour a single stroke.
- Keep a quarter of the mark's height clear on all sides.
- At 32px and below use `logos/mark-small.svg`: three wider strokes, the last hollow, with a thicker slash. The favicon uses it. The full mark starts at 33px.
- The lockup is the mark beside **HEADCOUNT** in Barlow Condensed Bold capitals at +0.04em. Use it at 140px wide or more.
- On dark the wordmark is amber; on light it is ink, because amber text fails on paper. The slash stays amber in both. One-colour versions use ink or white for everything.

## Colour

Two themes, dark by default. Every role has a value in each; `tokens.json` lists them with measured contrast and the build refuses a palette that breaks the rules below.

| Role | Dark | Light | Job |
| --- | --- | --- | --- |
| bg / panel | `#121316` / `#1b1d22` | `#f5f4f0` / `#ffffff` | page and cards |
| fg | `#ecebe6` | `#121316` | text; the viewer line in charts |
| muted | `#9c9a92` | `#5f5d57` | labels, secondary text |
| accent | `#f2b53a` | `#f2b53a` | the slash, the wordmark on dark, focus, the primary button |
| accent_ink | `#f2b53a` | `#8a5a00` | amber as text |
| secondary | `#5fc4b8` | `#1f7a70` | chatters |
| tertiary | `#a3adff` | `#4a55c4` | follows |
| critical | `#ff7a6b` | `#c4262e` | live and errors only |
| quotient ramp | `#5d5a51 #8a6d26 #d39a2c #ffd77a` | `#bab3a1 #be8118 #875606 #4f3504` | scores 0–24, 25–49, 50–74, 75+ |

Rules: text, muted and accent ink at 4.5:1 on page and panel; chart series at 3:1 on panel; ramp steps 2 to 4 at 3:1 and step 1 at 2:1. Text on an amber fill is `#121316`.

Amber is the brand and the score. Low scores are warm grey and higher ones deepen into amber, so a high score is the loudest thing on a page. Nothing else that a reader could take for a score is amber, and red never encodes a score.

## Typography and spacing

- Display: Barlow Condensed Bold, for the wordmark, headlines and big numbers. Headlines are sentences with a full stop in artwork; sentence case in the product.
- Body: Public Sans.
- Labels: JetBrains Mono capitals for metadata, axis ticks and table headers.
- Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64 and 96 pixels. Panels use a 6px radius, controls 4px; icon tiles a corner of 5/24 of their width.
- Give each promotional asset one headline, one supporting point and one destination.

## The chart motif

Layouts carry a sample chart: the viewer line jumps while the chatter line stays flat, with a strip of quotient bars below. It is drawn from fixed sample values and shows no real channel. Channel names in layouts are bars. Never put a real streamer's name or a real score in promotional artwork without a review of that specific claim.

## Voice

Headcount sounds like the person on the door with the clicker: plain, numerate, careful about what a count proves. Full voice in [the voice guide](../../content/VOICE.md); facts from [the claims register](../../content/social/Product%20Claims%20Register.md), entries C-HEAD-01 to 03. "Counting who is actually in the room." is sample copy.

## Files and editing

| Path | Contents |
| --- | --- |
| `brand.json`, `build.py` | Themes, ramp, fonts, mark geometry and the generator. Edit these, then rebuild. |
| `logos/` | Primary (dark tile), light, glyph, small glyph, one-colour marks and the themed SVG; primary, light and one-colour lockups with outlined copies. |
| `product/` | Favicon (SVG, ICO, 16px check), app and maskable icons, Apple touch icon, and the 1200×630 link preview in both themes. |
| `social/`, `video/` | Banner and taller master, avatar, square (dark and light), landscape, story, quote, release and screenshot frame; video title card, thumbnail, end card, transparent lower third and an eight-second preview. |
| `design-system/` | A hash-bound copy of the product's `docs/design-system.md`; the product repository is the editing source. |
| `fonts/`, `tokens.json`, `tokens.css`, `brand-board.png`, `asset-manifest.json`, `alt-text.md` | Fonts with licenses, roles and contrast, the board, hashes and alt-text starters. |

From the Studio root on Kvant:

```sh
python3 brands/headcount/build.py --product-root /path/to/headcount
python3 brands/headcount/build.py --skip-build --export /path/to/headcount/web/static/brand
```

The generator needs rsvg-convert, Inkscape, fontconfig with the bundled fonts, Pillow and fontTools. `--export` copies the product's web assets and WOFF2 fonts and writes `brand-export.json` beside them; the product does not edit those copies. The shared `build_packs.py` delegates to this script for the `headcount` slug.

## Screenshots, copy and alt text

Replace the screenshot placeholder with a real capture of a verified view. Crop or blur channel names unless the post is about that channel and the claim has been reviewed. Alt text describes the finished image, including the words visible in it; `alt-text.md` has starters.
