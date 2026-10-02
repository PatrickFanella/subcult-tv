# BAMCO — design-system reference

Source: [BAMCO](https://www.bamco.com/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Desktop visual + styles**. Contact flow, project details and motion behavior remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

Lime, cream and gold frame an arched produce photograph and delicate uppercase display type.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Left-aligned thin headline; central arch-masked photograph; floating dot; cream navigation pill.

## Component grammar

Arch media mask, pill navigation, gold contact action and thin display headings.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

PP Hatton Light display sampled around 67px; NoiGrotesk regular/light body.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Skip to main content What We Do Our Expertise Who  | sans-serif | 16px / 400 | normal / normal |
| MAIN: What We Do Our Expertise Who We Serve Culture & Ca | sans-serif | 16px / 400 | normal / normal |
| HEADER: What We Do Our Expertise Who We Serve Culture & Ca | sans-serif | 16px / 400 | normal / normal |
| BUTTON: What We Do | noi_groteskregular, sans-serif | 14.1119px / 400 | 15.5231px / normal |
| BUTTON: Open about us and additional navigation | sans-serif | 16px / 400 | 0px / normal |
| H1: YOU ARE WHAT YOU SERVE. | pp_hattonlight, serif | 56.4157px / 300 | 56.4157px / normal |
| H2: WHAT MATTERS TO YOU? | pp_hattonlight, serif | 33.8526px / 300 | 33.8526px / normal |
| BUTTON: Scroll | sans-serif | 15.5151px / 400 | 17.0666px / normal |
| BUTTON: Chef-Driven Dining | pp_hattonlight, serif | 16.9183px / 300 | 16.9183px / normal |
| H2: CHEF-DRIVEN DINING | pp_hattonlight, serif | 33.8526px / 400 | 33.8526px / normal |
| P: Creativity has a taste. Inspire loyalty with one-o | sans-serif | 15.5151px / 400 | 18.6181px / 0.224px |
| H2: OUR BREAD & BUTTER | pp_hattonlight, serif | 56.4157px / 400 | 56.4157px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 62 sampled uses.
- `rgb(255, 242, 231)` — 47 sampled uses.
- `rgb(255, 255, 255)` — 17 sampled uses.
- `rgb(0, 0, 238)` — 10 sampled uses.
- `rgb(190, 137, 84)` — 7 sampled uses.
- `rgb(239, 178, 220)` — 7 sampled uses.
- `rgb(232, 185, 109)` — 2 sampled uses.
- `rgb(170, 218, 123)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the image mask and quiet display weight as compositional rules, with pill controls kept consistent.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Contact flow, project details and motion behavior remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
