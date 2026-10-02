# Duyu Care — design-system reference

Source: [Duyu Care](https://duyucare.dops.agency/) · inspected 2026-10-02 · Commerce / product.

Evidence level: **Partial visual / styled document**. The visible loader stayed at 0%. Main-page and commerce states are unverified.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

A white loading scene shows the duyu identity and a rotating dark jar, with mint and charcoal in the styled content.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Corner statements, central product scene and an italic percentage counter; underlying hero title sampled at 88px.

## Component grammar

Product render, small corner labels, percentage loader and contrasting editorial type.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Modern Gothic Next-generated family names and Plantin MT italic.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: 1   1 2 8 9 0 0 1 2 3 9 1 2 3 8 9 0 %  RESTORE YOU | "Times New Roman" | 16px / 400 | normal / normal |
| MAIN: 1   1 2 8 9 0 0 1 2 3 9 1 2 3 8 9 0 %  RESTORE YOU | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 16px / 400 | normal / normal |
| P: RESTORE YOUR THYROID HEALTH | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 19.2px / 600 | 28.8px / normal |
| HEADER: Science Our Story Community Pre-order Thyroid Hero | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 14px / 400 | normal / normal |
| H1: The New Standard of Thyroid Health | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 87.6562px / 500 | 87.6562px / normal |
| BUTTON: SCROLL | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 16px / 500 | 30.4px / normal |
| P: Thyroid Health is the north star to unlocking whol | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 18px / 500 | 27px / normal |
| BUTTON:  | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 13.3333px / 500 | normal / normal |
| H2: Your Endocrine   System, Optimised | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 56px / 500 | 61.6px / -2% |
| P: Your thyroid is your body's silent hero, tirelessl | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 28px / 400 | 33.6px / normal |
| H3: Immune Function | __plantinMT_17c03f, __plantinMT_Fallback_17c03f, serif | 42px / 400 | 50.4px / normal |
| P: Antioxidant Defence | __modernGothic_068821, __modernGothic_Fallback_068821, sans-serif | 16px / 400 | 30.4px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(12, 11, 11)` — 69 sampled uses.
- `rgb(255, 255, 255)` — 29 sampled uses.
- `rgb(47, 56, 52)` — 10 sampled uses.
- `rgb(0, 0, 0)` — 1 sampled uses.
- `rgb(184, 208, 200)` — 1 sampled uses.
- `rgb(170, 170, 170)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Separate loader tokens from the product storefront before adapting the mint/charcoal direction.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

The visible loader stayed at 0%. Main-page and commerce states are unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
