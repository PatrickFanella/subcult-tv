# Wembi — design-system reference

Source: [Wembi](https://www.wembi.ai/en) · inspected 2026-10-02 · Technology / product.

Evidence level: **Desktop visual + styles**. Cookie controls were not used. Product/demo flow and later sections lack a fresh screenshot.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A lime opening field and large simple statement introduce a digital-twin product, with numbered explanations in later content.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Centered opening statement; numbered What / How / Why / Where overview; large recap headings.

## Component grammar

Numbered navigation, large statement blocks and a cookie overlay.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

HaasUnicaSH-Regular; opening display around 73px and later headings around 95px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: What How Why Where Overview Recap Login Contact N° | HaasUnicaSH-Medium, Helvetica, sans-serif | 10.6667px / 400 | 10.6667px / normal |
| BUTTON: What | HaasUnicaSH-Medium, Helvetica, sans-serif | 10.6667px / 400 | 11.7333px / normal |
| MAIN: N°001 The Digital Twin of Everything Wembi instant | HaasUnicaSH-Medium, Helvetica, sans-serif | 10.6667px / 400 | 10.6667px / normal |
| H2: Digital Twin | HaasUnicaSH-Regular, Helvetica, sans-serif | 86.6667px / 400 | 86.6667px / normal |
| P: Acquisition and normalization of data from field d | HaasUnicaSH-Regular, Helvetica, sans-serif | 33.3333px / 400 | 36.6667px / normal |
| BUTTON: Industrial | HaasUnicaSH-Regular, Helvetica, sans-serif | 86.6667px / 400 | 104px / normal |
| H3: FAQ | HaasUnicaSH-Regular, Helvetica, sans-serif | 86.6667px / 400 | 95.3333px / normal |
| LABEL: N°01 | HaasUnicaSH-Regular, Helvetica, sans-serif | 33.3333px / 400 | 36.6667px / normal |
| FOOTER: Headquarter Via Cotonificio, 45  33010 - Feletto U | HaasUnicaSH-Medium, Helvetica, sans-serif | 10.6667px / 400 | 10.6667px / normal |
| P: Noi (www.wembi.ai/) e terze parti selezionate (1)  | -apple-system, sans-serif | 14px / 300 | 19.6px / normal |
| BUTTON: Scopri di più e personalizza | -apple-system, sans-serif | 14px / 700 | 19.6px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 63 sampled uses.
- `rgb(255, 255, 255)` — 9 sampled uses.
- `rgb(237, 232, 232)` — 5 sampled uses.
- `rgb(190, 255, 139)` — 5 sampled uses.
- `rgb(192, 223, 233)` — 2 sampled uses.
- `oklab(0.999994 0.0000455678 0.0000200868 / 0.4)` — 1 sampled uses.
- `rgb(56, 56, 56)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study numbered explanations as an information architecture device; distinguish intro lime from later pale surfaces.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Cookie controls were not used. Product/demo flow and later sections lack a fresh screenshot.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
