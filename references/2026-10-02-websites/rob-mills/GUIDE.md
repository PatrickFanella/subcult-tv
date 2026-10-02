# Rob Mills — design-system reference

Source: [Rob Mills](https://www.robmills.com.au/) · inspected 2026-10-02 · Architecture / property.

Evidence level: **Desktop visual + styles**. Video controls, project navigation and mobile overlays remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A full-bleed wave scene and centered RMA identity establish an architecture practice through imagery.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

White navigation over media; centered sculptural identity and modest introduction; quieter neutral surfaces in later content.

## Component grammar

Overlay navigation, image scenes, compact section titles and project imagery.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Bau supporting text around 22px; later H2 around 28px with tracking.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Portfolio Experience  Land Architecture Interiors  | Bau, Helvetica, Arial, sans-serif | 16px / 400 | 22px / 1px |
| HEADER: Portfolio Experience  Land Architecture Interiors  | Bau, Helvetica, Arial, sans-serif | 16px / 400 | 22px / 1px |
| H2:  | Bau, Helvetica, Arial, sans-serif | 16px / 400 | 22px / 1px |
| BUTTON: Region | Bau, Helvetica, Arial, sans-serif | 16px / 400 | normal / 1px |
| MAIN: Rob Mills Architecture & Interiors. Residential de | Bau, Helvetica, Arial, sans-serif | 16px / 400 | 22px / 1px |
| H2: Rob Mills Architecture & Interiors. Residential de | Bau, Helvetica, Arial, sans-serif | 22px / 400 | 30px / 1px |
| H2: Live well | Bau, Helvetica, Arial, sans-serif | 28px / 400 | 38px / 1px |
| H3: Brisbane Residence | Bau, Helvetica, Arial, sans-serif | 16px / 400 | 22px / 1px |
| H2: RMA residences are defined by intelligent architec | Bau, Helvetica, Arial, sans-serif | 37px / 400 | 45px / normal |
| P: For over three decades, we have built an enviable  | Bau, Helvetica, Arial, sans-serif | 22px / 400 | 30px / 1px |
| H3: The essence of every great home is drawn from the  | Bau, Helvetica, Arial, sans-serif | 37px / 400 | 45px / normal |
| H3: Healthy materials and enduring value drive our des | Bau, Helvetica, Arial, sans-serif | 18px / 400 | 24px / 1px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 84 sampled uses.
- `rgb(74, 74, 74)` — 17 sampled uses.
- `rgb(187, 175, 169)` — 7 sampled uses.
- `rgb(242, 243, 239)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study image sequencing and caption hierarchy; keep photographic texture separate from the neutral UI palette.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Video controls, project navigation and mobile overlays remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
