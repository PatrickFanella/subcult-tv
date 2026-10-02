# Benjamin Creative — design-system reference

Source: [Benjamin Creative](https://benjamincreative.me/) · inspected 2026-10-02 · Portfolio / creative.

Evidence level: **Partial visual / styled document**. Opening frame is captured; main portfolio screenshot, canvas interactions and mobile states are unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

An orange opening screen with a centered Be® identity leads into styled black portfolio content.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Horizontal black identity band in the opening frame; later large white headings and multiple canvases.

## Component grammar

Intro identity, oversized portfolio titles and canvas-based graphics.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

PPNeueMontrealMedium; H1 sampled at 72px with roughly -5px tracking.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Benjamin  ®  Digital Product Designer  H o m e  A  | sans-serif | 12px / 400 | normal / normal |
| P: Benjamin | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 38px / 500 | 38px / -1.9px |
| P: ® | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 20px / 500 | 24px / -0.4px |
| P: Digital Product Designer | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 15px / 500 | 21px / -0.4px |
| P: H o m e | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 15px / 400 | normal / normal |
| P: // | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 9px / 500 | 10.8px / -0.18px |
| HEADER: (About me)  I’m Benjamin Hoang, a Digital Product  | sans-serif | 12px / 400 | normal / normal |
| H1: I’m Benjamin Hoang, | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 72px / 500 | 65.52px / -5px |
| H3: a Digital Product Designer | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 72px / 500 | 65.52px / -5px |
| H2: Benjamin Hoang | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 146px / 500 | 132.86px / -6px |
| P: C | "Neue Montreal", "Neue Montreal Placeholder", sans-serif | 83.07px / 500 | 83.07px / -0.8307px |
| H2: My Recently | "PP Neue Montreal Medium", "PP Neue Montreal Medium Placeholder", sans-serif | 92px / 500 | 83.72px / -5px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgba(255, 255, 255, 0.55)` — 54 sampled uses.
- `rgb(255, 255, 255)` — 37 sampled uses.
- `rgb(0, 0, 238)` — 14 sampled uses.
- `rgb(0, 0, 0)` — 11 sampled uses.
- `rgb(135, 135, 135)` — 10 sampled uses.
- `rgba(255, 255, 255, 0.75)` — 8 sampled uses.
- `rgba(255, 255, 255, 0.35)` — 6 sampled uses.
- `rgba(251, 70, 23, 0.95)` — 4 sampled uses.
- `rgb(17, 17, 17)` — 2 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Treat the orange intro and black portfolio as distinct surfaces in the guide.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Opening frame is captured; main portfolio screenshot, canvas interactions and mobile states are unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
