# Hey Nesh — design-system reference

Source: [Hey Nesh](https://heynesh.com/) · inspected 2026-10-02 · Portfolio / creative.

Evidence level: **Desktop visual + styles**. The first opening image is available; later screenshots failed. Project interactions and mobile composition remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A cutout portrait over huge yellow lettering creates the identity, while compact navigation stays out of its way.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Taupe field; portrait overlapping the NESH lettering; white display text across the dark shirt; small navigation.

## Component grammar

Portrait composition, translucent badge and minimal navigation labels.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

TR3A display and PPNeueMontreal book supporting text.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Working closely with your team to deliver Webflow  | "Ppneuemontreal Book", Arial, sans-serif | 15.104px / 400 | 24.1664px / normal |
| HEADER: Working closely with your team to deliver Webflow  | "Ppneuemontreal Book", Arial, sans-serif | 15.104px / 400 | 24.1664px / normal |
| P: Working closely with your team to deliver Webflow  | "Ppneuemontreal Book", Arial, sans-serif | 12.8px / 400 | 20.48px / normal |
| P: 80+ Projects | "Tr 3 A", Arial, sans-serif | 13.312px / 500 | 14.6432px / normal |
| P: nenad@popadic.co | "Ppneuemontreal Book", Arial, sans-serif | 15.104px / 400 | 24.1664px / normal |
| P: COPY TO CLIPBOARD | Ppneuemontreal, Arial, sans-serif | 11.52px / 700 | 11.52px / normal |
| P: Book a Call | "Tr 3 A", Arial, sans-serif | 15.104px / 500 | 24.1664px / normal |
| MAIN: HOME ABOUT ME PROJECTS WHAT YOU GET SERVICES CLIEN | "Ppneuemontreal Book", Arial, sans-serif | 15.104px / 400 | 24.1664px / normal |
| H1: Webflow, Applied Differently. | "Tr 3 A", Arial, sans-serif | 67.84px / 700 | 69.8752px / normal |
| H2: About Me (&) My Journey | "Tr 3 A", Arial, sans-serif | 58.624px / 500 | 58.624px / normal |
| P: ' 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 | "Tr 3 A", Arial, sans-serif | 71.168px / 700 | 71.168px / normal |
| H3: Starting out with my brother | "Tr 3 A", Arial, sans-serif | 21.376px / 500 | 23.5136px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 133 sampled uses.
- `rgb(255, 255, 255)` — 45 sampled uses.
- `rgba(0, 0, 0, 0.7)` — 24 sampled uses.
- `rgb(235, 234, 218)` — 9 sampled uses.
- `rgb(255, 255, 35)` — 9 sampled uses.
- `rgb(34, 34, 34)` — 8 sampled uses.
- `rgba(0, 0, 0, 0.5)` — 7 sampled uses.
- `rgb(213, 207, 190)` — 1 sampled uses.
- `rgb(248, 247, 243)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study compositing and text-image overlap as an art-direction rule, with a legible small-screen alternative.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

The first opening image is available; later screenshots failed. Project interactions and mobile composition remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · no saved image for this pass
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
