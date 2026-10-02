# A Better Lou — design-system reference

Source: [A Better Lou](https://abetterlou.com/) · inspected 2026-10-02 · Service / wellness.

Evidence level: **Desktop visual + styles**. Service claims were not evaluated. Booking/contact flows and mobile behavior remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

An outdoor portrait and warm cream typography create a personal introduction, with amber actions standing out.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-page photograph; transparent navigation; large left-aligned copy; three fine-bordered information cells.

## Component grammar

Amber pill actions, circular arrow CTA and bordered information cells.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

PPNeueMontreal; H1 around 67px and H2 around 57.5px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Home About Programs Learn Contact Patient Portal C | "PP Neue Montreal", Arial, sans-serif | 12.8px / 400 | 12.8px / -0.128px |
| MAIN: Lose the weight Keep the muscle $149.99/month Get  | "PP Neue Montreal", Arial, sans-serif | 12.8px / 400 | 12.8px / -0.128px |
| H1: Lose the weight Keep the muscle | "PP Neue Montreal", Arial, sans-serif | 61.44px / 500 | 61.44px / -0.128px |
| H1: $149.99/month | "PP Neue Montreal", Arial, sans-serif | 52.48px / 500 | 52.48px / -0.128px |
| H2: Your weight drops quickly with GLP-1 | "PP Neue Montreal", Arial, sans-serif | 52.48px / 500 | 57.728px / -0.128px |
| H2: The ABL Difference | "PP Neue Montreal", Arial, sans-serif | 30.72px / 500 | 30.72px / -0.128px |
| H3: Tirzepatide GLP-1 | "PP Neue Montreal", Arial, sans-serif | 24.96px / 500 | 24.96px / -0.128px |
| H2: With A Better Lou, you know the price and you know | "PP Neue Montreal", Arial, sans-serif | 38.4px / 500 | 42.24px / -0.128px |
| FOOTER: SERVICES Your Weight is Over Relaunch Your Life Ho | "PP Neue Montreal", Arial, sans-serif | 12.8px / 400 | 12.8px / -0.128px |
| INPUT:  | "PP Neue Montreal", Arial, sans-serif | 11.52px / 500 | 16.4571px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 241, 224)` — 49 sampled uses.
- `rgb(20, 11, 0)` — 44 sampled uses.
- `rgb(255, 180, 66)` — 11 sampled uses.
- `rgb(10, 6, 0)` — 3 sampled uses.
- `rgba(255, 255, 255, 0)` — 3 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study trust-building through photography, restrained metadata and a clear contact hierarchy.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Service claims were not evaluated. Booking/contact flows and mobile behavior remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
