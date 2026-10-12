# Chat Thing — The merged log

Direction: **A / The merged log**, proposed by Studio on October 11, 2026. Status: local production pack v1. The owner has not reviewed the artwork, and nothing here is approved for a post, a profile change or a public announcement.

Chat Thing is a self-hosted Twitch chat client at `chat.subcult.tv`. It merges up to six channels into one scrollback and keeps the dense, configurable presentation of the original HasanAbi Chat Thing by mxmilkiib, which it rebuilds in Go and TypeScript under AGPL-3.0. The repository is `subculture-collective/chatty-cat`; treat `chatty-cat` as an identifier, not a name. HasanAra is a sibling product for the same community and keeps its own red-and-paper identity.

## What the identity does

The product's default screen already has a look: a cool near-black log, amber names, a green rate sparkline. This pack draws that screen rather than inventing a second one. The mark is a log tile. The artwork is a merged log made of bars, so no layout shows a real or invented message. The brand touches the chrome, the icons and the promotional material; it does not restyle the chat log, whose fourteen colours, twelve shades and four finishes are retained from the original and are the user's to choose.

## Color roles

| Role | Dark (primary) | Light edition | Use |
| --- | --- | --- | --- |
| Shell | `#151519` | `#faf8f3` | Canvas behind the header, panels and artwork; PWA theme colour |
| Log | `#1d2229` | `#efebe3` | The chat surface at the default gray palette, dark shade 7 |
| Text | `#e8e6e3` | `#27232c` | Headlines and body text |
| Amber | `#e8a33d` | `#a8750e` | Names in the mark, the wordmark, emphasis, keyboard focus |
| Spark | `#35d07f` | `#1f9d55` | The live block, the rate sparkline, connected state |
| Muted | `#aaa4b7` | `#665d70` | Timestamps, labels, status |
| Line | `#34343e` | `#d5cedc` | Rules and borders |

State colours come from the product's gray palette: good `#5fd98a`, danger `#e85d5d`, VIP `#f783ac`, link `#5a9fe8`. They colour name blocks in the artwork and keep their meanings in the interface.

Measured contrast on the dark shell: text **14.62:1**, amber **8.44:1**, spark **9.09:1**, muted **5.9:1**. On the light edition: ink **14.52:1**, amber **3.79:1**, spark **3.29:1**. Ordinary text needs 4.5:1 and large text 3:1, so on paper the amber and spark are for artwork, rules and text at 24px bold or larger; small light-edition labels use ink or muted. Each swatch has one role.

## Mark

The mark is an original log tile: a rounded dark square (corner radius 5/24 of the width) holding three message rows. Each row is an amber name block of a different width followed by a text bar; the third row ends in a green live block. Read at 16px it is three lines with a bright end; at 32px the rows separate.

- Use the full-colour tile at 24px and above. Below that, use the monochrome glyph on the host's own ground.
- Keep a quarter of the mark's height clear on all sides. The lockup is the tile beside "Chat Thing" in Atkinson Hyperlegible Mono Bold; use it at 180px wide or more, and the mark alone below that.
- Do not rotate, skew, outline, add a gradient or put words inside the rows.
- The previous PWA icon was Twitch's glitch glyph. Retire it; no Twitch artwork belongs in this identity.

## Typography and spacing

- Display and body: Atkinson Hyperlegible Next, regular and bold. Headlines are bold with normal tracking.
- Wordmark and labels: Atkinson Hyperlegible Mono, bold for the wordmark, regular for metadata in capitals at 16 to 20px on artwork.
- Both families are already in the product's font menu, so the brand faces never conflict with the user's reading font. The chat log keeps whichever of the 29 stacks the user chose.
- Spacing steps: 4, 8, 12, 16, 20, 24, 32, 48, 64 and 96 pixels. Controls use a 4px corner, panels 6px. Rules are 1px, or 2px where they separate sections of artwork.
- Give each promotional asset one headline, one supporting point and one destination.

## Voice

Chat Thing sounds like the person who has six chats open and still catches your message: practical, quick, a little dry. It talks in chat terms (rooms, the log, scrollback, backfill) and says plainly what it is: a self-hosted client in migration from the original app, not a Twitch feature. The full voice and sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-CHAT.

The headline in this pack, "All six channels in one scrollback.", is sample copy that shows the layout. It is not approved for publication.

## Files and editing

| Path | Contents |
| --- | --- |
| `brand.json`, `build.py` | Source configuration and the standalone generator. Edit these, then rebuild. |
| `logos/` | Primary, dark, light and monochrome marks and lockups; the lockups also have outlined SVGs. `mark-glyph.svg` is the tile-less glyph. |
| `product/` | The product's web assets: `favicon.svg`, `favicon.ico`, `icon-src.svg`, PWA icons at 192 and 512, a maskable 512, the Apple touch icon and the 1200×630 link preview. |
| `social/` | Banner, taller banner master, avatar, square post, landscape, story, quote and release templates and a screenshot frame. |
| `video/` | Title card, thumbnail, end card, transparent lower third and a caption style. |
| `design-system/` | A hash-bound copy of the product's `docs/design-system.md` with `tokens.css`; the product repository is the editing source. |
| `fonts/` | The two families and their OFL texts. |
| `tokens.json`, `tokens.css` | Brand roles, the light edition and a `product_interface` block describing the retained chat palette axes. |
| `source-register.json`, `asset-manifest.json`, `alt-text.md` | Ownership, hashes and starter descriptions. |

Rebuild only this pack from the Studio root:

```sh
python3 brands/chat-thing/build.py --product-root /path/to/chatty-cat
python3 brands/chat-thing/build.py --export /path/to/chatty-cat/web/public
```

The generator needs rsvg-convert, Inkscape and fontconfig with the bundled fonts, so it runs on Kvant rather than on the macOS workstations. `--export` copies only the selected product files and writes `brand-export.json` beside them; the product does not edit those copies. The shared `build_packs.py` delegates to this script for the `chat-thing` slug.

## Screenshots, copy and alt text

Replace the screenshot placeholder with a real capture of a verified workflow, cropped of credentials, private whisper panes and personal data. Message rows in the templates are bars; do not replace them with fabricated chat. Alt text describes the finished image, including the words visible in it; `alt-text.md` has starters.

Sources: product stylesheets and display data read on October 11, 2026 from the `chatty-cat` checkout; the colour axes and original presentation are retained AGPL material from the upstream app and keep their attribution in the product's `NOTICE.md`.
