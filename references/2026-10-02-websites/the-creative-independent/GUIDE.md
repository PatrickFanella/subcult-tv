# The Creative Independent — design-system reference

Source: [The Creative Independent](https://thecreativeindependent.com/#home) · inspected 2026-10-02 · Editorial / culture.

Evidence level: **Desktop visual + styles**. Article pages and filter behavior remain untested; the #home route avoids an anniversary entry screen.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Courier typography and colored text cards make the site feel like an annotated publishing index.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Pixel snail identity; compact category controls and search; four-column square cards with dates anchored near the bottom.

## Component grammar

Outlined filters, article cards, date labels and a restrained monospace reading hierarchy.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Courier / Courier New throughout the captured page.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Explore People The Creative Independent New here?  | Courier, "Courier New", monospace | 16px / 400 | 18.4px / normal |
| HEADER: Explore People The Creative Independent New here?  | Courier, "Courier New", monospace | 16px / 400 | 18.4px / normal |
| BUTTON: Search | Courier, "Courier New", monospace | 16px / 400 | 18.4px / normal |
| MAIN: Filter Note: A TCI Book February 12, 2026 𖡡 Chef M | Courier, "Courier New", monospace | 16px / 400 | 18.4px / normal |
| H2:  | Courier, "Courier New", monospace | 16px / 400 | 18.4px / normal |
| P: Collected by Brandon Stosuy | Courier, "Courier New", monospace | 16px / 400 | 20.8px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(242, 240, 234)` — 540 sampled uses.
- `rgb(0, 0, 0)` — 435 sampled uses.
- `rgb(255, 255, 255)` — 260 sampled uses.
- `rgb(73, 73, 73)` — 219 sampled uses.
- `rgb(24, 11, 25)` — 188 sampled uses.
- `rgb(15, 43, 212)` — 152 sampled uses.
- `rgb(93, 141, 66)` — 150 sampled uses.
- `rgb(237, 218, 70)` — 145 sampled uses.
- `rgb(234, 64, 98)` — 142 sampled uses.
- `rgb(251, 219, 235)` — 135 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study how one font supports navigation, cards and editorial copy. Keep the color assignment rules separate from article content.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Article pages and filter behavior remain untested; the #home route avoids an anniversary entry screen.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
