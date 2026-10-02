# Charmer Studio — design-system reference

Source: [Charmer Studio](https://www.charmerstudio.com/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Partial visual / styled document**. The later observation still showed 66% loading; a broken image was visible initially. Main portfolio remains unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A near-black intro pairs warm white serif text with a progress counter, followed by project/grid controls in the document.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Centered editorial title, progress percentage and later grid/list options.

## Component grammar

Serif statement, mono project metadata, grid/list switch and loading scene.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

WilliamSubheadLC serif sampled at 40px; EvenMono labels.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: EXPLORE Charmer Studio — Design Studio Work, Studi | WilliamSubheadLC, Times, serif | 16px / 400 | 20px / normal |
| HEADER: Work, Studio, Contact EN RU | WilliamSubheadLC, Times, serif | 16px / 400 | 20px / normal |
| BUTTON: EN RU | EvenMono, "Courier New", Courier, monospace | 11.5008px / 400 | 16.0011px / 0.920064px |
| P: From Vision to Value. | WilliamSubheadLC, Times, serif | 16px / 400 | 20px / normal |
| MAIN: Swan Hellenic STRATEGY,  ART DIRECTION,  DIGITAL D | WilliamSubheadLC, Times, serif | 16px / 400 | 20px / normal |
| H2: Swan Hellenic | WilliamSubheadLC, Times, serif | 40px / 400 | 44px / -0.8px |
| P: (2026) | EvenMono, "Courier New", Courier, monospace | 11.5008px / 400 | 16.0011px / 0.920064px |
| H3: Yandex Corp | WilliamSubheadLC, Times, serif | 16px / 400 | 20px / normal |
| FOOTER: DEVELOPED BY LEV NIKOLAEV EMAIL ,  INSTAGRAM,  BEH | EvenMono, "Courier New", Courier, monospace | 11.5008px / 400 | 16.0011px / 0.920064px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(250, 249, 245)` — 63 sampled uses.
- `rgb(25, 25, 26)` — 6 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study serif-plus-mono contrast after confirming the portfolio's stable state.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

The later observation still showed 66% loading; a broken image was visible initially. Main portfolio remains unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
