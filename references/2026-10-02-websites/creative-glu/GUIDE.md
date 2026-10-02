# Creative Glu — design-system reference

Source: [Creative Glu](https://creativeglu.ai/home) · inspected 2026-10-02 · Technology / creative.

Evidence level: **Desktop visual + styles**. Cookie consent was left untouched. Product/signup interactions and mobile layouts remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

White oversized type sits over an iridescent chrome form on a grainy black field.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Centered 109px-scale headline; rounded translucent navigation and actions; small supporting copy.

## Component grammar

Glass-like pill controls, hero sculpture and small supporting labels.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Inter bold display and Inter supporting text.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Partner With Us ✕ HOME AI TRANSFORMATION COLLABORA | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| HEADER: Partner With Us | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| BUTTON: ✕ | Inter, "Inter Fallback" | 30px / 400 | 36px / normal |
| MAIN: The future is yours to create AI transformation fo | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| H1: The future is yours to create | Inter, sans-serif | 109.328px / 700 | normal / normal |
| BUTTON: Start the Conversation | Inter, sans-serif | 18px / 300 | 31.5px / normal |
| H2: AI transformation delivered end-to-end, with one t | Inter, sans-serif | 48px / 500 | 72px / normal |
| P: Most firms sell strategy. Some sell adoption. A fe | Inter, sans-serif | 20px / 300 | 35px / normal |
| P: Don't start from scratch. | Inter, "Inter Fallback" | 32px / 500 | 49.7778px / normal |
| BUTTON:  | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| P: There will be billions of these agents across ever | Inter, "Inter Fallback" | 36px / 500 | 48px / normal |
| H1: Frequently Asked Questions | Inter, sans-serif | 48px / 500 | 72px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 66 sampled uses.
- `lab(59.9846 5.79539 2.11821)` — 29 sampled uses.
- `oklab(0.999994 0.0000455678 0.0000200868 / 0.02)` — 10 sampled uses.
- `oklab(0.999994 0.0000455678 0.0000200868 / 0.5)` — 3 sampled uses.
- `oklab(0.999994 0.0000455678 0.0000200868 / 0.1)` — 2 sampled uses.
- `lab(3.00194 -1.54356 1.16237)` — 1 sampled uses.
- `oklab(0.999994 0.0000455677 0.0000200868 / 0.8)` — 1 sampled uses.
- `rgb(0, 0, 0)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study foreground legibility over complex media and consistency across translucent controls.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Cookie consent was left untouched. Product/signup interactions and mobile layouts remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
