# No Football Colors — design-system reference

Source: [No Football Colors](https://nofootballcolors.com/) · inspected 2026-10-02 · Editorial / commerce.

Evidence level: **Desktop visual + styles**. Photographic colors are excluded from brand tokens. Bag, issue navigation and purchasing states remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

An issue-based football publication combines immersive photographs with very tall condensed white titles.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-screen stadium photo; framed menu/logo block; bag control; issue-number cells and editorial actions.

## Component grammar

Issue badge, square utility buttons, framed CTA and image-led stories.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Obviously Narrow display sampled at 120px; Polymath Text body.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Cookies management panel This site uses cookies an | polymath-text, sans-serif | 16px / 400 | 24px / normal |
| BUTTON: OK, ACCEPT ALL | obviously-narrow, sans-serif | 16px / 500 | 13.6px / -1% |
| BUTTON: Personalize | polymath-text, sans-serif | 16px / 400 | 19.2px / -1% |
| BUTTON: X Hide cookie banner | polymath-text, sans-serif | 18px / 400 | normal / normal |
| BUTTON: EN | polymath-text, sans-serif | 16px / 500 | 24px / normal |
| MAIN: ISSUE  N°17  STADIUMS OF WAR  Documenting Ukrainia | polymath-text, sans-serif | 16px / 400 | 24px / normal |
| P: ISSUE | obviously-narrow, sans-serif | 16px / 500 | 13.12px / -1% |
| H1: STADIUMS OF WAR | obviously-narrow, sans-serif | 120px / 500 | 102px / -1% |
| P: Documenting Ukrainian football through its stadium | polymath-text, sans-serif | 18px / 500 | 25.2px / -0.25px |
| H2: NOFC COLLECTION | obviously-narrow, sans-serif | 64px / 500 | 52.48px / -1% |
| P: A CULTURAL TAKE | obviously-narrow, sans-serif | 64px / 500 | 52.48px / -1% |
| H3: STADIUMS OF WAR | obviously-narrow, sans-serif | 40px / 500 | 32.8px / -1% |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `lab(2.75381 0 0)` — 40 sampled uses.
- `rgb(255, 255, 255)` — 13 sampled uses.
- `rgb(0, 0, 0)` — 10 sampled uses.
- `rgb(247, 247, 245)` — 3 sampled uses.
- `lab(100 0 0)` — 2 sampled uses.
- `rgb(51, 51, 51)` — 1 sampled uses.
- `lab(48.496 0 0)` — 1 sampled uses.
- `lab(98.26 0 0)` — 1 sampled uses.
- `lab(7.78201 -0.0000149012 0)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study issue metadata and editorial-to-commerce transitions as component relationships.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Photographic colors are excluded from brand tokens. Bag, issue navigation and purchasing states remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
