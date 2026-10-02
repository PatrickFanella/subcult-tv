# Craft — design-system reference

Source: [Craft](https://craft.wild.as/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Desktop visual + styles**. Canvas colors are visual observations, not extracted CSS tokens. Carousel behavior and mobile adaptation remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

A fine grid makes the page feel like a working canvas, with a colorful cellular artwork interrupting the restrained black typography.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Split introductory row; large left headline and right proposition; grid-aligned three-project carousel.

## Component grammar

Fine grid rules, project tiles, small captions and a generative canvas.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Sneak display; opening heading sampled around 72.93px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: VIEW FULL SITE CRAFT, ENGINEERED.  A DESIGN & TECH | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| MAIN: CRAFT, ENGINEERED.  A DESIGN & TECHNOLOGY PARTNER  | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| H1: CRAFT, ENGINEERED. | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 72.93px / 400 | 67.0956px / -2.55255px |
| P: A DESIGN & TECHNOLOGY PARTNER FOR MODERN BRANDS | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 20px / 400 | 23.6px / -0.2px |
| P: Award-winning websites, apps, and digital content, | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 13px / 400 | 18.85px / normal |
| P: A short point of view from us on what actually cha | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 46px / 400 | 48.76px / -0.92px |
| P: Replit Agent 3 | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 30px / 500 | 45px / -0.6px |
| P: The launch landing page for Replit's autonomous AI | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 14.5px / 400 | 21.75px / normal |
| BUTTON:  | Arial | 13.3333px / 400 | normal / normal |
| H2: Born in Vienna, where craft is a discipline. | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 46px / 400 | 48.76px / -0.92px |
| P: WHERE WE COME FROM | SFMono-Regular, ui-monospace, Menlo, Consolas, monospace | 10px / 400 | 16.2px / 1.8px |
| P: In 1903, a few streets from our studio, the Wiener | Sneak, "Helvetica Neue", Helvetica, Arial, sans-serif | 16.1287px / 400 | 26.1286px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(10, 10, 10)` — 59 sampled uses.
- `rgb(42, 42, 42)` — 34 sampled uses.
- `rgb(255, 255, 255)` — 9 sampled uses.
- `rgb(139, 139, 139)` — 8 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the grid and project-card grammar. Canvas artwork needs a separate media specification because its colors are absent from DOM styles.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Canvas colors are visual observations, not extracted CSS tokens. Carousel behavior and mobile adaptation remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
