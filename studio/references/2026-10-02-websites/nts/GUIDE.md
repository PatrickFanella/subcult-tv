# NTS — design-system reference

Source: [NTS](https://www.nts.live/) · inspected 2026-10-02 · Editorial / radio.

Evidence level: **Desktop visual + styles**. Playback, search, supporter states and mobile layouts remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Black-and-white broadcast chrome gives photographs and music metadata the largest share of attention.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Persistent navigation and two live-channel strips; broad feature image beside a narrow mixtape rail; four-column show cards below.

## Component grammar

Square play controls, genre chips, dates and locations separated by thin rules.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Univers-Condensed for compact navigation and titles; Arial fallback.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: RADIO LATEST EXPLORE INFINITE MIXTAPES SHOP NTS SU | Univers-Condensed, Arial, sans-serif | 16px / 400 | 22.4px / normal |
| HEADER: RADIO LATEST EXPLORE INFINITE MIXTAPES SHOP NTS SU | Univers-Condensed, Arial, sans-serif | 16px / 400 | 22.4px / normal |
| BUTTON:  | Univers-Condensed, Arial, sans-serif | 16px / 400 | 22.4px / normal |
| INPUT:  | Univers-Condensed, Arial, sans-serif | 16px / 400 | normal / normal |
| BUTTON:  | Univers-Condensed, Arial, sans-serif | 14px / 400 | 18px / normal |
| H3:  | Univers-Condensed, Arial, sans-serif | 14px / 700 | 16px / normal |
| H1: INFINITE MIXTAPES | Univers-Condensed, Arial, sans-serif | 22px / 700 | 24px / normal |
| P: Music-only themed radio streams, made from NTS res | Arial, sans-serif | 13px / 400 | 18px / 0.1px |
| H3: NTS PICKS | Univers-Condensed, Arial, sans-serif | 24px / 700 | 28px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 163 sampled uses.
- `rgb(204, 204, 204)` — 20 sampled uses.
- `rgb(0, 0, 0)` — 16 sampled uses.
- `rgb(76, 76, 76)` — 3 sampled uses.
- `rgb(102, 102, 102)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Treat the player and archive as separate component families. The useful reference is metadata density and a stable player shell.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Playback, search, supporter states and mobile layouts remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
