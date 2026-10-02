# Podium — design-system reference

Source: [Podium](https://podium.global/) · inspected 2026-10-02 · Agency / sports.

Evidence level: **Partial visual / styled document**. Initial loader showed 2%. Main portfolio imagery and project transitions lack visual verification.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A white percentage loader was captured; later content suggests an image-led sports creative portfolio.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Central circular loader; project naming and compact labels in the styled document.

## Component grammar

Project labels, portfolio imagery and canvas presentation.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Futura project headings sampled at 24px and Univers Condensed labels.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Podium — Home WORK ABOUT CONTACT  WE OFFER CREATIV | Futura, system-ui, sans-serif | 10px / 400 | 15px / normal |
| HEADER: Podium — Home WORK ABOUT CONTACT | Futura, system-ui, sans-serif | 10px / 400 | 15px / normal |
| BUTTON: WORK | Futura, system-ui, sans-serif | 14px / 700 | 14px / -0.42px |
| MAIN: WE OFFER CREATIVE DIRECTION & PRODUCTION FOR ATHLE | Futura, system-ui, sans-serif | 10px / 400 | 15px / normal |
| P: WE OFFER CREATIVE DIRECTION & PRODUCTION FOR ATHLE | Futura, system-ui, sans-serif | 24px / 700 | 21.6px / -0.24px |
| P: SCROLL DOWN | "Univers Condensed", "Arial Narrow", sans-serif | 12px / 400 | 13.2px / normal |
| H3: DEVIATE | Futura, system-ui, sans-serif | 24px / 700 | 24px / normal |
| P: PUMA | Futura, system-ui, sans-serif | 12px / 500 | 18px / normal |
| P: WE HELP SPORTS BRANDS TELL STORIES THROUGH FIELDWO | Futura, system-ui, sans-serif | 57.408px / 700 | 51.6672px / normal |
| H3: BEHIND THE SCENES | Futura, system-ui, sans-serif | 20px / 700 | 20px / -0.2px |
| H2: WE'VE WORKED WITH SPORTS BRANDS AND ATHLETES WORLD | Futura, system-ui, sans-serif | 57.408px / 700 | 51.6672px / normal |
| H3: SERVICES | "Univers Condensed", "Arial Narrow", sans-serif | 12px / 400 | 13.2px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 41 sampled uses.
- `rgb(0, 0, 0)` — 17 sampled uses.
- `rgb(196, 196, 196)` — 8 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Confirm the project-grid resting layout before extracting a reusable card system.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Initial loader showed 2%. Main portfolio imagery and project transitions lack visual verification.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
