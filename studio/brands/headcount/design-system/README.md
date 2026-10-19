# Headcount design system

Headcount is the product name of this dashboard. The repository, service, database and images stay `sus-quotient`. The score is still called the **sus quotient**: the product counts, and the quotient is the one number it gives each stream.

The identity was selected on October 19, 2026 from four directions (`studio/studies/sus-quotient-directions` in subcult-tv). The brand pack in `studio/brands/headcount` owns the mark, colours, fonts and promotional layouts. This document owns how the dashboard uses them.

## Where things live

| What | Source | Copy in this repository |
| --- | --- | --- |
| Colours, fonts, radii | `brand.json` in the Studio pack | `web/static/brand/tokens.css` |
| Favicon, app icons, link preview | the pack's `product/` | `web/static/brand/` |
| Fonts (WOFF2) and licenses | the pack's `fonts/` | `web/static/brand/fonts/` |
| Header mark | the pack's `logos/mark-glyph.svg` geometry | inline SVG in `web/static/index.html`, coloured by `style.css` |
| Chart roles, components | this document | `web/static/style.css` |

Files under `web/static/brand/` are generated. To change a colour or a font, edit the pack and export again from the Studio root on Kvant:

```sh
python3 brands/headcount/build.py --export /path/to/sus-quotient/web/static/brand
```

`brand-export.json` records the hash of every exported file.

## Themes

Dark is the default; the dashboard follows the system setting, and `data-theme="light"` or `"dark"` on `<html>` forces one. Every token has a value in both themes, so components name tokens, never hex values.

| Token | Role | Dark | Light |
| --- | --- | --- | --- |
| `--hc-bg` | page | `#121316` | `#f5f4f0` |
| `--hc-panel` | cards, tables, header | `#1b1d22` | `#ffffff` |
| `--hc-raised` | gridlines, meter track, hover | `#24272d` | `#ecebe6` |
| `--hc-line` | borders | `#2e3138` | `#dcdad3` |
| `--hc-fg` | text, the viewer series | `#ecebe6` | `#121316` |
| `--hc-muted` | secondary text, labels, baselines | `#9c9a92` | `#5f5d57` |
| `--hc-accent` | the brand amber: focus, active nav, primary button, note rule | `#f2b53a` | `#f2b53a` |
| `--hc-accent-ink` | amber when it is text (links in prose) | `#f2b53a` | `#8a5a00` |
| `--hc-wordmark` | the header wordmark | `#f2b53a` | `#121316` |
| `--hc-secondary` | chatters series | `#5fc4b8` | `#1f7a70` |
| `--hc-tertiary` | follows series | `#a3adff` | `#4a55c4` |
| `--hc-critical` | live dot, errors | `#ff7a6b` | `#c4262e` |
| `--hc-q1` … `--hc-q4` | quotient ramp | `#5d5a51 #8a6d26 #d39a2c #ffd77a` | `#bab3a1 #be8118 #875606 #4f3504` |

The pack's build refuses a palette that breaks these rules: text, muted text and accent ink at 4.5:1 on page and panel; chatter and follow series at 3:1 on panel; quotient steps 2 to 4 at 3:1 and step 1 at 2:1. Measured values are in the pack's `tokens.json`.

`style.css` maps the chart roles the code already uses onto these tokens (`--series-1` viewers, `--series-2` chatters, `--series-3` follows, `--meter-fill`, `--q1`…`--q4`, `--wash`). Keep using the role names in JavaScript; change the mapping, not the call sites.

## Colour rules

- **Amber means the brand and the score.** The quotient ramp runs from warm grey (low) into deeper amber (high), so a high score is the most saturated thing in its row. Do not use amber for anything a reader could mistake for a score: no amber series, no amber category colours.
- **Viewers are ink.** The viewer line is the text colour, chatters are teal, follows are blue. A fourth series needs a new token checked against the panel, not a reused one.
- **Red is only for live and errors.** It never encodes a score.
- Low-confidence quotients keep their colour and drop opacity (meters and quotient columns already do this).
- On amber fills, text is `#121316` in both themes (10.1:1).

## Type

| Role | Font | Used for |
| --- | --- | --- |
| Display | Barlow Condensed Bold | wordmark (capitals, +0.04em), `h1` 34px, `h2` 21px, tile and counter numbers |
| Body | Public Sans 400/700 | sentences, table cells, controls |
| Label | JetBrains Mono 400 | table headers, tile labels, nav, axis ticks, suggestion group headings; 11–12px capitals with +0.05em |

Headings are sentence case. Numbers use tabular figures (`.num`, tiles, counters). Fonts are self-hosted from `/brand/fonts/`; the CSP allows nothing else.

## Components

- **Header:** panel background, mark and wordmark at left, nav in label type with a 3px amber underline on the active page, search at right.
- **Tile:** panel, 6px radius, number in display type above a label. One number per tile.
- **Table:** panel with a line border; headers in label type; rows open their link on click.
- **Meter:** quotient bar in `--meter-fill` on `--meter-track`, value beside it.
- **Note:** panel with a 3px amber left rule, for caveats about the data.
- **Primary button:** amber fill, dark text, 4px radius. One per view (Replay).
- **Focus:** a 2px amber outline on every focusable element.

Spacing steps are 4, 8, 12, 16, 24, 32, 48, 64 and 96px. Panels use a 6px radius and controls 4px.

## Words

The product says what the data shows, not who is guilty. "A high quotient means the data has patterns that bots produce; it is not proof of botting" is the model sentence. Avoid "caught", "exposed", "fake" and "fraud" about a named channel. Do not imply the product is affiliated with Twitch. Copy follows the Headcount section of the Studio voice guide.
