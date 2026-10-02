# Yuta Abe — design-system reference

Source: [Yuta Abe](https://yutaabe.com/) · inspected 2026-10-02 · Portfolio / interactive.

Evidence level: **Partial visual / styled document**. The post-loader canvas lacks a screenshot. Shift interaction and portfolio content remain unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The initial black loading scene progressed in later text to LIGHTS OUT and PRESS SHIFT.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Canvas-based opening state; sparse text controls; numbered progress.

## Component grammar

Loading count and keyboard-prompt entry treatment.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Space Mono and Japanese Hiragino fallback stacks; split/hidden text prevents a reliable display-size claim.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: 100  LIGHTS OUT, PRESS SHIFT!  Yuta Abe — Creative | "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo | 15.36px / 400 | normal / normal |
| P: LIGHTS OUT, PRESS SHIFT! | "Space Mono", monospace | 12.5952px / 700 | normal / 1.76333px |
| P:  | "Space Mono", monospace | 15.36px / 400 | normal / normal |
| MAIN: Yuta Abe — Creative Developer / Interactive Design | "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo | 15.36px / 400 | normal / normal |
| H1: Yuta Abe — Creative Developer / Interactive Design | "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo | 15.36px / 400 | normal / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(240, 237, 232)` — 5 sampled uses.
- `rgb(8, 8, 8)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Document keyboard access and an understandable resting state before adopting the immersive opening.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

The post-loader canvas lacks a screenshot. Shift interaction and portfolio content remain unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
