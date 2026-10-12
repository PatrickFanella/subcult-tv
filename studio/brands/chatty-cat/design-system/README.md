# Chat Thing design system

Status: proposed October 11, 2026, written from source. The owner has not reviewed the identity.
This document is the editing source for the product's interface rules and identity. The
SUBCULT Studio pack in `subcult-tv/studio/brands/chat-thing/` holds the mark masters,
promotional artwork and web-asset generator, and copies this file with hashes. Edit
interface rules here; edit artwork there.

The retained chat presentation is not a redesign surface. `docs/architecture.md` sets the
original app's dense, configurable chat as the parity reference, and its palette axes,
presets, fonts and resource content are AGPL material attributed in `NOTICE.md`. The
identity below applies to the shell, the icons and public material. It does not change how
a message row looks.

## Identity

**Name.** Chat Thing, two capitals, in prose and in the wordmark. The repository, Go
module and image names stay `chatty-cat`; treat that as an identifier. The manifest name
is "Subcult Chat Thing" with the short name "Chat Thing".

**What it is.** A self-hosted Twitch chat client that merges up to six channels into one
scrollback and keeps the user's display settings. It rebuilds mxmilkiib's HasanAbi Chat
Thing and Twitch Chat Relay in Go and TypeScript. It is in migration; the original app
stays up until the parity gates in `docs/parity.md` close.

**Mark.** The log tile: a rounded dark square (corner radius 5/24 of the width) holding
three message rows, each an amber name block followed by a pale text bar, the last row
ending in a green live block. Every shape is solid, so it reads at 16px as three lines with a
bright end. Keep a quarter of the mark's height clear on all sides. The full-colour tile is
for 24px and above; below that, the monochrome glyph on the host's ground. The lockup is
the tile beside "Chat Thing" in Atkinson Hyperlegible Mono Bold, 180px wide or more.

**Retired.** The PWA icon was Twitch's glitch glyph in amber. It is not part of this
identity and must not return in any colour.

**Web assets.** `web/public/favicon.svg`, `favicon.ico`, `icon-src.svg`, `icon-192.png`,
`icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` and `og.png` are generated
by the Studio pack; `web/public/brand-export.json` records their source and hashes.
Regenerate in Studio and copy. Do not edit the copies.

**Voice.** Quick, practical, a little dry; chat vocabulary used correctly (rooms, the log,
scrollback, backfill). Says it is a self-hosted client in migration, names the lineage and
never implies a Twitch product. Full voice in the Studio voice guide; facts from the
claims register entries C-CHAT-01 to 04.

## Brand roles

| Role | Dark (primary) | Light | Use |
| --- | --- | --- | --- |
| Shell | `#151519` | `#faf8f3` | Canvas behind chrome and artwork; manifest theme and background colour |
| Log | `#1d2229` | `#efebe3` | The chat surface at the default palette (gray, shade 7); light uses the panel tone |
| Text | `#e8e6e3` | `#27232c` | Headlines and body |
| Amber | `#e8a33d` | `#a8750e` | Wordmark, name blocks in the mark, emphasis |
| Spark | `#35d07f` | `#1f9d55` | Live block, rate sparkline, connected state in artwork |
| Muted | `#aaa4b7` | `#665d70` | Timestamps, labels, status |
| Line | `#34343e` | `#d5cedc` | Rules, borders |

Contrast on the dark shell: text 14.62:1, amber 8.44:1, spark 9.09:1, muted 5.9:1. On the
light shell: text 14.52:1, amber 3.79:1, spark 3.29:1. In the light edition amber and spark
are for artwork, rules and text at 24px bold or larger; small labels use text or muted.

The brand faces are Atkinson Hyperlegible Next (display and body) and Atkinson
Hyperlegible Mono (wordmark and labels). Both are already in the chat font menu
(`atkinson`, `atkinsonmono`), so a user who picks them gets one typeface from the tile to
the log. They are not forced on the log.

## Interface colour system

The log and most chrome read three axes from `web/src/palettes.css`, set as `data-colour`,
`data-shade` and `data-variant` on the root element by `display.ts`.

- **Colour** (14): violet, gray, red, wine, green, ember, solarized, nord, lavender, sepia,
  salmon, ice, cream, mirc. Each sets a hue, two chromas and an accent set.
- **Shade** (12): white, lightest, light, pale, mid, dim, dusk, dark, deep, black, murk,
  twilight. Each sets the background and text lightness; shades 0 to 3 are light.
- **Variant** (4): standard, phosphor (text and accents tint toward the hue), grain (a
  paper-noise texture), contrast (a wider text and line gap).

Derived tokens, computed in OKLCH so every colour spans every shade:

| Token | Meaning |
| --- | --- |
| `--bg`, `--text` | Canvas and ink from the shade axis, hued by the colour |
| `--panel` | 9% text mixed into the canvas; chrome surfaces |
| `--line` | 24% mix; borders and rules |
| `--text-dim` | 55% mix; timestamps, channel labels, secondary text |
| `--aux` | A hue-relative secondary accent for help tabs, config heads and selection |
| `--popline` | A hue-neutral frame for popups: white on dark shades, black on light |
| `--texture` | Set only by the grain variant |

Semantic tokens, set per colour: `--accent` (names, focus, active controls), `--good`
(connected, success), `--danger` (offline bar, errors, bans), `--vip` (VIP badges),
`--wiki` (resource links) and `--spark` (the header rate graph in dark schemes).

The shell stylesheet `web/src/style.css` aliases `--fg` to `--text` and `--muted` to
`--text-dim`, and supplies the fallback shell values before a palette applies (dark
`#151519` / `#1d1d24` / `#e8e6e3` / `#aaa4b7` / `#34343e` / `#b9a5f0`; light
`#faf8f3` / `#efebe3` / `#27232c` / `#665d70` / `#d5cedc` / `#654394`).

Rules:

1. New chrome uses the tokens. No hex in a component rule, except the two retained
   literals (`#status[data-state=connected]` green and the warning amber on the length
   counter) until they are tokenised.
2. The default display is gray at shade 7, system sans at 14px/1.3, line style 4, zebra 2,
   timestamps 2. The brand swatches above are that default, so the identity never
   contradicts the first screen.
3. The 19 presets in `display-data.ts` are retained verbatim. Adding a preset is a parity
   question, not a brand one.

## Typography

- Chat font: `ui-sans-serif` system stack at 14px by default; the user chooses from 29
  stacks (bundled: OpenDyslexic, Fixedsys, Gohu, Hack, Terminess, Roobert, Mononoki,
  Elstob, Cursed, Glean, Miniwi, Web437 VGA; Google Fonts: Atkinson Hyperlegible and
  Mono, Comic Neue, Fira Code, IBM Plex Mono, Inter, JetBrains Mono, Lexend, Shantell
  Sans, Source Code Pro, Source Sans 3, VT323; and system serif stacks).
- Axes: size 7 to 32px, line height 0.6 to 2.5, weight 300 to 700, letter spacing
  -0.08 to 0.12em. Header and help font sizes can follow the chat size or be set apart.
- Chrome inherits the chat font. Status, timestamps, chips and footer run 10 to 12px.
- Stats list headings are 13px in `--accent`; picker section headings are 12px. Nothing in the shell is set in a brand face.

## Spacing and shape

| Property | Value |
| --- | --- |
| Gutters | 20px; 12px at or below 600px |
| Header padding | 12px 20px; 4px vertical in strip and graph modes |
| Row padding | 5px vertical; 10px between inline parts |
| Control corner | 4px (inputs, buttons, textarea) |
| Panel corner | 6px (picker, dialogs) |
| Borders | 1px `--line`; the picker adds a 30px black shadow at 33% |
| Focus | 2px `--accent` outline, 2px offset, on `:focus-visible` only |
| Reply quote | 2px `--line` left rule, 90px indent (20px narrow) |

## Components

- **Header.** Name in `--accent`, stage label in `--muted` at 11px, channel form, status,
  theme toggle, login, account status, panel buttons, the rate sparkline and the freeze
  toggle. Three modes on `data-min`: full, strip (controls hidden, status and login kept)
  and graph (the sparkline stretches to fill at 32px tall).
- **Notice bars.** The offline bar sits on `--panel` with a `--danger` bottom rule. The
  update-ready control is a normal button. The stream bar and room-state bar are 12px
  `--muted` on a `--line` rule.
- **Log row.** Time and channel in 12px `--muted`; badges 18px; name bold in the user's
  colour or `--accent`; subscription, bits and first-message chips as 10px outlined
  pills; message text; a quoted reply as a `blockquote`. Modifiers: `.action` italic,
  `.removed` struck through at 50%, `.system-message` at 80%, `.target-message` with a
  1px accent outline on `--panel`. Zebra striping and separators follow the display axes.
- **Composer.** Picker button, send-target select, reply target line, an autogrowing
  textarea capped at 160px, the length counter (amber at the warning threshold), send
  button and a 12px status line. The completion list is a `--bg` box with `--line` border;
  the selected option is `--line` with `--accent` text.
- **Emote picker.** A fixed, resizable 560×440 panel on `--panel` with a 6px corner,
  header search, tab and setting rows at 12px, a grid of `--picker-cell` (64px) buttons
  and a recent row. The handle moves it; geometry is saved.
- **Floating panels** (video, whispers, help and resources). A title row with a keyboard
  movable handle, pin and close. Pinned panels dock into the rail, where they lose their
  fixed position and take full width.
- **Dialogs** (display settings, stats, archive search, user inspector). `--panel` with a
  `--line` border, 6px corner, 800px wide at most, backdrop black at 53%.
- **Cards** (identity preview, link preview). Fixed 360 and 380px panes with 12px padding
  that follow the dialog frame; `--popline` is the hue-neutral frame colour for popups.
- **Rate sparkline.** 100×26 in the header, `--accent` stroke; stretches in graph mode.
  Stats dialog graphs are 80px tall in `--accent`.

## States

| State | Treatment |
| --- | --- |
| Connecting | Status text "Connecting…" in `--muted` |
| Connected | Status in green (`#63ba8e`, to be tokenised as `--good`) |
| Reconnecting or failed | Status in `--muted` with the reason; gap markers in the log |
| Offline | The offline bar; sending disabled; saved history stays readable |
| Update ready | The reload button appears under the header |
| Disabled control | 60% opacity, default cursor |
| Hover | Button border turns `--accent` |
| Selected completion | `--line` background, `--accent` text |
| Pressed toggle | `aria-pressed="true"` draws the `--accent` border and text |
| Target message | 1px accent outline on `--panel` |
| Removed message | Strike-through at 50% opacity |

## Motion and accessibility

- `prefers-reduced-motion: reduce` removes every animation, transition and smooth scroll,
  including nick shimmer and rainbow names. The display options also expose nick shimmer,
  rainbow motion and the freeze-emotes toggle.
- The log is `role="log"` with `aria-live="off"`; a separate polite announcer carries
  mentions and status. Panels are dialogs with labels; handles are keyboard movable.
- Contrast is the user's responsibility within the palette axes; the contrast variant
  widens the gap for any colour. Defaults and brand roles meet 4.5:1 for text.
- Composer and picker remain usable at 600px and below, where the picker fills to 500px
  tall and the gutters narrow.

## Do and do not

- Do use the tokens for any new chrome, and the brand roles only for icons, marketing and
  documentation.
- Do keep the mark's three rows and live block exact; scale, do not redraw.
- Do not restyle the log row, the palettes or the presets for brand reasons.
- Do not put Twitch's glyph, wordmark or purple in the identity.
- Do not show fabricated chat messages in promotional artwork; rows are bars.
