# Gigantic Media — design-system reference

Source: [Gigantic Media](https://giganticmedia.net/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Partial visual / styled document**. Later screenshots failed after the browser client changed. The inner experience is not visually verified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A coral entry screen and enormous black GIGANTIC MEDIA title introduce an experience-driven agency site.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Large entry typography, circular crosshair and an Enter the experience action; later styled content exists without a new screenshot.

## Component grammar

Entry gate, target-like graphic and compact agency metadata.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Suisseintl; later H1 sampled around 51.7px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Enter the experience Enter the experience Strategi | Suisseintl, Verdana, sans-serif | 15.667px / 400 | 20.3671px / normal |
| MAIN: Strategic Clarity. Creative Intelligence. Gigantic | Suisseintl, Verdana, sans-serif | 15.667px / 400 | 20.3671px / normal |
| H1: Strategic Clarity. Creative Intelligence. Gigantic | Suisseintl, Verdana, sans-serif | 50.9178px / 500 | 56.0096px / normal |
| P: Your On-Demand Marketing Engine. | Suisseintl, Verdana, sans-serif | 15.667px / 400 | 18.8004px / normal |
| H2: Plug Into the Engine Behind Your Growth. | Suisseintl, Verdana, sans-serif | 70.5016px / 400 | 77.5517px / -2.11505px |
| H2: We build long-term relationships with great organi | Suisseintl, Verdana, sans-serif | 47.001px / 500 | 51.7011px / -1.41003px |
| H2: Proven Results | Suisseintl, Verdana, sans-serif | 70.5016px / 500 | 77.5517px / -2.11505px |
| H2: Build what's next. | Suisseintl, Verdana, sans-serif | 78.3351px / 500 | 78.3351px / -3.1334px |
| LABEL: Name | Suisseintl, Verdana, sans-serif | 13.7086px / 400 | 16.4504px / normal |
| INPUT:  | Suisseintl, Verdana, sans-serif | 14px / 400 | 18.2px / normal |
| LABEL: You agree to our privacy policy. | Suisseintl, Verdana, sans-serif | 13.7086px / 500 | 17.8212px / normal |
| INPUT:  | Suisseintl, Verdana, sans-serif | 13.7086px / 500 | 17.8212px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(240, 231, 233)` — 24 sampled uses.
- `rgb(0, 0, 0)` — 20 sampled uses.
- `rgb(111, 103, 105)` — 8 sampled uses.
- `rgb(42, 42, 42)` — 4 sampled uses.
- `rgb(26, 26, 26)` — 3 sampled uses.
- `rgba(255, 255, 255, 0.1)` — 2 sampled uses.
- `rgb(30, 30, 30)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Keep the entry experience and ordinary portfolio navigation as separate state models.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Later screenshots failed after the browser client changed. The inner experience is not visually verified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · no saved image for this pass
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
