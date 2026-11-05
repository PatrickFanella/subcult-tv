# Lineage brand and J-Card design system

Decision record: [ADR 0002](../adr/0002-lineage-brand-and-j-card-design-system.md).
Source of truth for tokens: `web/src/styles.css` (`@theme` block). Copy
constants: `web/src/brand.ts`. Favicon: `web/public/favicon.svg`.

## Name and voice

| Item | Value |
|---|---|
| Product name | Lineage |
| Wordmark | `LINEAGE` in monospace, 0.22em tracking, followed by `live recordings` |
| Tagline | Live recordings, with their lineage. |
| Source credit | Internet Archive's Live Music Archive, linked in masthead and footer |
| Built on | Arkhiv (engine) and `@subcult/archive-viewer` (kit) |

Write like a tape-trade list: short, factual, specific. Name the venue, the
date, the source chain. Never promise availability the source does not
guarantee; counts are observations. Eyebrow labels use sentence case in the
markup and are uppercased by CSS. Use "recording" for an item, "track" for a
file, "taper" for the person, "source" for the chain.

## Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-paper` | `#f4efe4` | `#15130f` | page background |
| `--color-paper-deep` | `#eae3d2` | `#1f1c17` | cards, hover rows, notes |
| `--color-paper-raised` | `#fbf8f1` | `#26221c` | inputs, secondary buttons |
| `--color-ink` | `#1c1915` | `#efe8d8` | text, strong rules, player bar |
| `--color-ink-soft` | `#5b544a` | `#b3a892` | secondary text, labels |
| `--color-ink-faint` | `#8d8371` | `#7f7563` | placeholders |
| `--color-rule` | `#cfc6b2` | `#3a3528` | hairlines |
| `--color-rule-strong` | `#8d8371` | `#6b6251` | input borders, dashed rules |
| `--color-marker` | `#c43a24` | `#e0573f` | primary action, counters, alerts |
| `--color-marker-deep` | `#a12d1a` | `#c43a24` | primary hover |
| `--color-on-marker` | `#fbf8f1` | `#15130f` | text on marker |
| `--color-stripe-red/mustard/teal` | `#c43a24` / `#e0a52d` / `#2f6b8f` | same | spine stripe only |
| `--color-focus` | `#2f6b8f` | `#6fb0d1` | focus ring |

The dark scheme follows `prefers-color-scheme`; there is no in-app toggle.
WCAG contrast computed from the hex values above (light / dark): ink on paper
15.3 / 15.2, ink-soft on paper 6.5 / 7.9, on-marker on marker 5.0 / 5.0, marker on
paper 4.6 / 5.0. `--color-ink-faint` on raised paper is 3.5 and is used for
placeholders only.

## Type

| Token | Stack | Use |
|---|---|---|
| `--font-sans` | Helvetica Neue, Helvetica, Arial, Liberation Sans | body, headings |
| `--font-mono` | IBM Plex Mono, SFMono-Regular, Cascadia Mono, Menlo, Consolas, Liberation Mono | wordmark, eyebrows, labels, dates, counters, status |

No web fonts are loaded. Headline: 700 weight, tight leading, negative
tracking, maximum 14 characters per line. Labels: 0.72rem, uppercase,
0.08–0.14em tracking.

## Components

- **Stripes:** 6px three-color bar at the top of the page, the left edge of
  the recording panel and the top of the player. Do not use it elsewhere.
- **Layout:** masthead, page and footer share one content column
  (`min(1200px, 100% - 2 × gutter)`), so their left and right edges align.
- **Masthead:** wordmark left, primary navigation (Browse recordings, Concert
  calendar, On this day) as links beside it, source credit right, hairline
  below. The current view is ink-filled. Below 900px the navigation moves to
  its own row and scrolls sideways.
- **Search card:** `paper-deep` surface, primary `Find shows` button, dashed
  rule above the filter disclosure. The disclosure opens when a filter it
  holds is applied. Outside the home view the card is compact.
- **Collection directory:** separate `paper-raised` disclosure below the
  search card, open on the unfiltered home view only. It previews 12
  suggestions, or 6 at the 480px single-column breakpoint.
- **Tape shelf:** heading with monospace count and share link, removable
  filter chips below, then a 2px ink rule, hairline rows, red monospace
  counter, monospace date on the right, arrow nudges on hover. On small
  screens the date moves under the place line.
- **Footer:** credits left, monospace import status right. Zero counts are
  omitted.
- **Recording panel:** right-side dialog with the stripe on its left edge and
  a sticky header holding the label and close button;
  definition list with uppercase monospace terms; track list with red
  monospace index and monospace length.
- **Player:** fixed ink bar with stripe on top, outlined paper buttons.
- **Buttons:** `primary` is marker-filled; default is paper with ink border and
  inverts on hover; `quiet` has no border.
- **Notices and alerts:** `paper-deep` block with a 4px marker left edge.

Focus rings are 3px `--color-focus` with 3px offset on every interactive
element. Transitions are disabled under `prefers-reduced-motion`.

## Assets

`web/public/favicon.svg` is the mark: three stripes and a short ink line on
paper. There is no raster logo yet; export one from the SVG if a platform
needs it.
