# HUUUUUE — design-system reference

Source: [HUUUUUE](https://www.huuuuue.agency/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Desktop visual + styles**. Current branding differs from the supplied name. Service details, motion timing and mobile layouts remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

The supplied HUUUUUE URL currently presents HUE&CRY, with bold black display type and pink italic emphasis.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

White opening field; extremely large headline; tiny tracked navigation; black pill action; client ticker below.

## Component grammar

Pill CTA, oversized mixed-font headline, client ticker and service blocks.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Archivo Black display, Instrument Serif italic emphasis, Inter body.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: HUE&CRY SERVICES ABOUT CONTACT  HUE&CRY — BRAND &  | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| HEADER: HUE&CRY SERVICES ABOUT CONTACT | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| MAIN: HUE&CRY — BRAND & GROWTH STUDIO  MAKE THE INTERNET | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| P: HUE&CRY — BRAND & GROWTH STUDIO | Inter, "Inter Fallback" | 11px / 600 | 16.5px / 2.42px |
| H1: MAKE THE INTERNET stare. | "Archivo Black", "Archivo Black Fallback" | 161.288px / 400 | 148.385px / -3.22575px |
| P: We're the marketing agency for brands that refuse  | Inter, "Inter Fallback" | 18px / 400 | 29.25px / normal |
| H2: SEVEN WAYS TO GET unignored | "Archivo Black", "Archivo Black Fallback" | 72px / 400 | 72px / -1.44px |
| LABEL: STEP 1 — SAY YOUR NAME | Inter, "Inter Fallback" | 16px / 400 | 24px / normal |
| INPUT:  | "Archivo Black", "Archivo Black Fallback" | 48px / 400 | 48px / -0.96px |
| BUTTON: LOUDER | Inter, "Inter Fallback" | 14px / 600 | 20px / 2.52px |
| P: “WE WERE THE BEST-KEPT SECRET IN THE CATEGORY. NOW | "Archivo Black", "Archivo Black Fallback" | 60px / 400 | 63px / -1.2px |
| FOOTER: MARISOL VEGA — CMO, VELVET STATIC | Inter, "Inter Fallback" | 11px / 600 | 16.5px / 2.42px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(250, 250, 250)` — 33 sampled uses.
- `rgb(10, 10, 10)` — 21 sampled uses.
- `lab(98.2721 -0.0000596046 0.0000119209 / 0.5)` — 10 sampled uses.
- `rgb(255, 255, 255)` — 5 sampled uses.
- `lab(98.2721 -0.0000596046 0.0000119209 / 0.6)` — 4 sampled uses.
- `rgb(138, 138, 138)` — 2 sampled uses.
- `lab(2.74175 0 0.00000596046 / 0.7)` — 2 sampled uses.
- `rgb(255, 45, 171)` — 2 sampled uses.
- `lab(98.2721 -0.0000596046 0.0000119209 / 0.8)` — 1 sampled uses.
- `lab(98.2721 -0.0000596046 0.0000119209 / 0.7)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Document emphasis as a deliberate typographic role rather than a second arbitrary heading font.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Current branding differs from the supplied name. Service details, motion timing and mobile layouts remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
