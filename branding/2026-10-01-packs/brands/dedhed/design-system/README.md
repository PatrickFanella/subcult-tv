# Dedhed design system: The Tape Shelf

Status: proposal, 2026-10-02. Not yet applied to `web/`. The running app still uses `web/src/styles.css`.

Source material: the eleven photographs in `docs/inspo/`. They show taper collections of Grateful Dead shows on blank cassettes (TDK SA90, Maxell XLII and UR), typed and handwritten spine labels, coloured label stock from 1985, commercial pre-recorded spines, bare shells, and wooden racks.

## What the material says

Read as a system rather than as nostalgia, the photos settle a few things:

- **The unit of the collection is the spine.** A cassette on a shelf shows one long, thin strip: brand tab, label, end. Everything a taper needed to find a show fits on it: band, date, set number, venue, city. A library list should look like a rack of spines, not a grid of cards.
- **The label is typed or handwritten, never designed.** Dates read `4/17/71` or `April 27, 1985 Set II`. Sets are roman numerals. Venues are abbreviated the way the taper abbreviated them. The interface should use the same vocabulary and let the data look like data.
- **Colour comes from the label stock, not from decoration.** The 1985 collection uses sky, cobalt, yellow, red, green, pink and orange stock, apparently per venue run. Colour groups; it never replaces text.
- **Hardware is honest.** Shells are black or clear. Tabs are red (Maxell, TDK) or gold foil (XLII). Reels show through a window. Counters are three white digits on black. Buttons on a deck are square keys that go down when pressed.
- **Imperfection is information.** Yellowed labels, crossed-out dates, a tape marked only "Columbus, Ohio 10/31/71" with no set number. The product requirement to preserve uncertain set boundaries maps directly onto this: an unreviewed tape is shown as such, on a plainer label, with a warning sticker.

## Tokens

All tokens are CSS custom properties in [`tokens.css`](tokens.css). System fonts only, nothing fetched.

| Group | Tokens | Taken from |
|---|---|---|
| Shells | `--shell-black`, `--shell-smoke`, `--shell-clear`, `--shell-clear-edge` | TDK SA90 and Maxell UD shells; clear cases |
| Paper | `--paper`, `--paper-bright`, `--paper-aged`, `--paper-kraft` | cream Maxell label, fresh white label, yellowed UR label, index card |
| Rack | `--rack-pine`, `--rack-pine-dark`, `--rack-slot` | wooden rack photos |
| Ink | `--ink`, `--ink-soft`, `--ink-faint`, `--ink-blue`, `--ink-red` | Sharpie, ballpoint, typewriter ribbon |
| Label stock | `--stock-sky`, `--stock-cobalt`, `--stock-yellow`, `--stock-red`, `--stock-green`, `--stock-pink`, `--stock-orange`, `--stock-teal`, `--stock-grey` | the typed 1985 collection |
| Tabs | `--tab-red`, `--tab-gold`, `--tab-chrome` | Maxell and TDK red, XLII foil, UR chrome |
| Status | `--rec-red`, `--live-amber`, `--vu-green`, `--vu-red`, `--warn` | deck lamps and VU meters |

### Type: three voices

| Voice | Token | Use |
|---|---|---|
| Typed label | `--font-typed` (Times/Georgia) | Anything a taper would have typed on a label: band, date, set, venue, track titles |
| Typewriter | `--font-mono` (Courier) | Counters, lineage strings, eyebrows, durations, status |
| Interface | `--font-ui` (Arial) | Explanations, errors, empty states, help |
| Commercial spine | `--font-spine` (Arial Narrow) | Wordmark and brand tabs only |

The rule: typed and typewriter voices carry data. The interface voice explains. Do not set an error message in the typed voice or a track title in Arial.

### Geometry and motion

- A spine is 44px tall and as wide as the rack. Corners are 3px, the radius of a real shell.
- Hover slides a spine out of the rack by 6px. Selected slides it 14px and gains a stacked-plastic shadow. Nothing scales, fades or bounces.
- Reels spin at one revolution per 2.4s while playing and stop under `prefers-reduced-motion`.
- Keys move down 1px on press and show an inset shadow.
- Focus is a 3px red outline on every interactive element.

### Page backdrop and masthead

Every page sits on cream `--paper`, approved 2026-10-02. Dark surfaces are reserved for hardware: the rack, the cassette face, the shared-radio panel and the deck. Every page carries the same `.masthead`: wordmark, one eyebrow line, and the live sticker on the right. Nothing else goes in it.

## Components

Defined in `tokens.css` and shown on the specimen sheet.

- `.spine` with `.tab`, `.label`, `.band`, `.date`, `.set`, `.venue`, `.end`. Label stock modifiers `.stock-*` and tab modifiers `.gold`, `.red`, `.chrome`.
- `.rack` and `.slot`, including `.slot.empty` for the unfilled bottom of a shelf.
- `.key` with `.primary`, `.dark`, `.ghost`, `.round`.
- `.field` for the single typed input line.
- `.sticker` with `.red` (synthetic), `.warn` (unreviewed), `.live` (on air).
- `.side` for A/B markers, `.reel`, `.counter`, `.vu`.
- `.eyebrow` for letter-spaced typewriter captions.
- `.masthead` with `.wordmark`, shared by every page.

## Examples

Open any of these directly in a browser. They share `tokens.css` and use sample data; the show titles, dates and durations are illustrative, not catalog entries.

1. [`examples/01-specimen.html`](examples/01-specimen.html). Colour, type, spine variants, keys, stickers, hardware and the four non-happy states in the same voice.
2. [`examples/02-rack.html`](examples/02-rack.html). The concert library as a wooden rack of spines, with year filters, an index-card detail for the selected tape, and the shared-radio call to action.
3. [`examples/03-jcard.html`](examples/03-jcard.html). A single concert as a cassette face plus a fold-out J-card: Side A is Set I, Side B is Set II, with segue marks, the current track, source lineage and a reviewer's note where the split is not the taper's.
4. [`examples/04-deck.html`](examples/04-deck.html). The shared radio page and the fixed player bar as a tape deck: reel window, transport keys, counter, VU meters, and a Return-to-live key.

Checked on 2026-10-02 in headless Chromium at 1280px and 420px widths, after the backdrop and masthead were unified. Interactions are static in these files; hover, press and spin states are CSS only. No browser-level accessibility audit has been run.

## Applying it to the app

The current `web/src/styles.css` already leans this way: Georgia headings, monospace eyebrows, a `.tape` list item, a dark fixed `.player`. The gaps are the spine construction (tab, label stock, end), the rack, the deck keys, and the stickers for synthetic and unreviewed tapes. A migration would import `tokens.css`, replace `.tape` with `.spine` inside a `.rack`, and move the player onto `.deck`. That is a separate change and should go through `make verify` plus a browser pass.
