# Chatty Cat — Pixel cat

Direction: **B / Pixel cat: console phosphor**, selected by the owner on October 11, 2026 from [four candidates](../../studies/chatty-cat-directions/index.html). The owner asked for many palettes and easy customisation, so the identity is a palette system around one mark, and approved it for application the same day. Status: approved identity. Template layouts are samples; a post or a profile change still needs its own review.

Chatty Cat is a self-hosted Twitch chat client at `chat.subcult.tv`. It merges up to six channels into one scrollback and keeps the dense, configurable presentation of the original HasanAbi Chat Thing by mxmilkiib, which it rebuilds in Go and TypeScript under AGPL-3.0. The repository is `subculture-collective/chatty-cat`. HasanAra is a sibling product for the same community and keeps its own identity.

## The mark

An eight-bit cat face, twelve cells wide and ten tall, with two ear cells, two eye gaps and a two-cell cursor for a mouth. Every cell is solid, so it reads at 16px as a cat and at 32px as pixel art. It is drawn from the `pixels` grid in `brand.json`: `#` is a face cell, `o` a cursor cell, `.` empty. Change the grid and rebuild to change the cat; keep it inside twelve columns.

- Face and cursor take two colours from the palette. The monochrome variants use one.
- Keep a quarter of the mark's height clear on all sides. The lockup is the cat beside `chatty_cat` in Cascadia Mono Bold; use it at 160px wide or more, the cat alone below that.
- Do not smooth, rotate, outline or add a gradient. Rendering uses crisp edges; keep that when you inline the SVG.
- The Twitch glitch glyph the PWA used before is retired. No Twitch artwork belongs in this identity.

## Palettes

A palette is four colours: `bg` (canvas), `fg` (text), `face` (the cat and the wordmark) and `cursor` (the mouth, the live block, the sparkline). Panel, line and muted tones are derived by mixing `bg` toward `fg`.

| Palette | bg | fg | face | cursor | Source |
| --- | --- | --- | --- | --- | --- |
| phosphor (default) | `#0b0f0c` | `#cfeedd` | `#7dff9a` | `#e8a33d` | Direction B as reviewed |
| amber | `#000000` | `#ffa326` | `#ffb249` | `#5edb81` | App preset "phosphor": ember, phosphor finish, shade 9 |
| gray | `#1d2229` | `#e8eff9` | `#e8a33d` | `#5fd98a` | App default colour at shade 7 |
| violet, green, ember, red, wine, solarized, nord | dark stops | | | | App colours at their default dark shades |
| lavender, sepia, salmon, ice, cream, mirc | light stops | | | | App colours at their default light shades |

The fourteen app palettes were derived from `web/src/palettes.css` on October 11, 2026: each colour's hue and chroma at its default shade for the canvas and text, its `--accent` as the face and its `--good` as the cursor. `tokens.json` lists every value with measured contrast, and `palettes.png` shows all sixteen side by side.

Rules: `fg` on `bg` at 4.5:1 or better; `face` and `cursor` on `bg` at 3:1 or better. The build refuses a main palette whose text fails and warns about any palette whose cat or cursor falls under 3:1 (mirc's cursor and solarized's face sit close; check them in place). Each colour has one job; do not use `face` for body text.

## Customising

Three levels, cheapest first:

1. **Pick a palette.** `python3 build.py --palette violet` builds the main layouts and product export in that palette. Every palette always gets its own `palettes/<name>/` mark, lockup, avatar, favicon and `tokens.css`.
2. **Add or change a palette.** Add a row to `palettes` in `brand.json` and rebuild. For a one-off, `python3 build.py --custom "bg=#101010,fg=#f0f0f0,face=#ff66aa,cursor=#66ffcc"`.
3. **Change the cat.** Edit the `pixels` grid in `brand.json`.

At runtime, `tokens.css` defines `--cat-bg`, `--cat-fg`, `--cat-face`, `--cat-cursor`, `--cat-panel`, `--cat-line` and `--cat-muted` for the default, and a `:root[data-cat-palette="<name>"]` block per palette. `logos/mark-themed.svg` (also exported to the product as `mark-themed.svg`) reads `--cat-face` and `--cat-cursor` when inlined, so the header cat can follow whatever the user picked. `product/palettes.json` carries the same table for scripts.

## Typography and spacing

- Display, wordmark and labels: Cascadia Mono, bold for the wordmark and headlines, regular for metadata in capitals at 14 to 20px on artwork. Headlines are lowercase sentences with a full stop.
- Body: Public Sans, regular.
- Spacing steps: 4, 8, 12, 16, 20, 24, 32, 48, 64 and 96 pixels. Icons sit on a tile with a corner of 5/24 of its width; panels use 6px, controls 4px.
- Give each promotional asset one headline, one supporting point and one destination.

## Voice

Chatty Cat sounds like the person with six chats open who still catches your message: quick, practical, a little dry, chat vocabulary used correctly. Full voice in [the voice guide](../../content/VOICE.md); facts from [the claims register](../../content/social/Product%20Claims%20Register.md), entries C-CHAT-01 to 04. The headline "six channels. one scrollback." is sample copy.

## Files and editing

| Path | Contents |
| --- | --- |
| `brand.json`, `build.py` | The pixel grid, palettes, fonts and the generator. Edit these, then rebuild. |
| `palettes/<name>/` | Mark, lockup, avatar, favicon and tokens for each palette; `palettes.png` is the sheet. |
| `logos/` | Primary and monochrome marks and lockups in the build palette, the tile-less glyph and the themed SVG. |
| `product/` | The product's web assets: favicon, ICO, PWA icons, maskable icon, Apple touch icon, themed mark, palette table and the 1200×630 link preview. |
| `social/`, `video/` | Banner, taller master, avatar, square, landscape, story, quote, release, screenshot frame; title card, thumbnail, end card, lower third, captions. |
| `design-system/` | A hash-bound copy of the product's `docs/design-system.md`; the product repository is the editing source. |
| `fonts/`, `tokens.json`, `tokens.css`, `source-register.json`, `asset-manifest.json`, `alt-text.md` | Fonts with licenses, roles, ownership, hashes and alt-text starters. |

From the Studio root on Kvant:

```sh
python3 brands/chatty-cat/build.py --product-root /path/to/chatty-cat
python3 brands/chatty-cat/build.py --export /path/to/chatty-cat/web/public
```

The generator needs rsvg-convert, Inkscape and fontconfig with the bundled fonts. `--export` copies only the selected product files and writes `brand-export.json` beside them; the product does not edit those copies. The shared `build_packs.py` delegates to this script for the `chatty-cat` slug.

## Screenshots, copy and alt text

Replace the screenshot placeholder with a real capture of a verified workflow, cropped of credentials, private whisper panes and personal data. Rows in the templates are bars; do not replace them with fabricated chat. Alt text describes the finished image, including the words visible in it; `alt-text.md` has starters.
