# Inngest — design-system reference

Source: [Inngest](https://www.inngest.com/) · inspected 2026-10-02 · Developer / product.

Evidence level: **Desktop visual + styles**. A scrolled capture showed an animation-dependent blank area. Execution demos and responsive behavior are unverified.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

A charcoal surface, coral actions and code-oriented demonstrations make the product explanation feel operational.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Two-column headline and workflow demonstration; outlined display-word treatment; client logos and persistent navigation.

## Component grammar

Announcement strip, coral CTA, code panel and green completion / red retry badges.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Whyte display sampled at 72px, CircularXX body and WhyteMono technical labels.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Watch our CodeTV episode on YouTube! 📺 PLATFORM US | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto | 16px / 400 | 24px / normal |
| HEADER: Watch our CodeTV episode on YouTube! 📺 PLATFORM US | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto | 16px / 400 | 24px / normal |
| BUTTON: PLATFORM | WhyteMonoV1, WhyteMono, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace | 12px / 600 | 12px / 0.8px |
| MAIN: OPEN SOURCE DURABLE EXECUTION  MAKE EVERY BACKEND  | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto | 16px / 400 | 24px / normal |
| P: OPEN SOURCE DURABLE EXECUTION | WhyteMonoV1, WhyteMono, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace | 16px / 400 | 16px / 0.8px |
| H1: MAKE EVERY BACKEND UNBREAKABLE. | WhyteV1, Whyte, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 72px / 400 | 68.4px / -1.44px |
| P: Inngest is the fastest way to orchestrate all your | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 20px / 400 | 30px / -0.2px |
| BUTTON: npm install inngest | CircularXXMono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace | 12px / 600 | 18px / 0.8px |
| P: TRUSTED IN PRODUCTION BY | WhyteMonoV1, WhyteMono, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace | 12px / 400 | 15px / normal |
| H2: The DX in durable execution | WhyteV1, Whyte, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 64px / 400 | 70.4px / -2.24px |
| P: However it’s written, wherever it runs, Inngest ma | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 18px / 400 | 27px / -0.18px |
| P: OBSERVABILITY | CircularXX, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto | 16px / 400 | 24px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 101 sampled uses.
- `rgb(246, 246, 246)` — 42 sampled uses.
- `rgb(179, 179, 179)` — 20 sampled uses.
- `rgb(246, 92, 79)` — 7 sampled uses.
- `rgb(0, 0, 0)` — 3 sampled uses.
- `rgba(255, 255, 255, 0.04)` — 2 sampled uses.
- `rgba(255, 255, 255, 0.7)` — 2 sampled uses.
- `rgb(12, 10, 9)` — 1 sampled uses.
- `rgb(247, 98, 70)` — 1 sampled uses.
- `rgba(255, 255, 255, 0.6)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study code-state visualization and action hierarchy; distinguish semantic status colors from marketing accents.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

A scrolled capture showed an animation-dependent blank area. Execution demos and responsive behavior are unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
