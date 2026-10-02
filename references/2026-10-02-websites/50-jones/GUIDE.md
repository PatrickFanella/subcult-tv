# 50 Jones — design-system reference

Source: [50 Jones](https://50jones.com/) · inspected 2026-10-02 · Architecture / property.

Evidence level: **Desktop visual + styles**. Apartment search, leasing forms, media controls and mobile menu remain untested.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

Interior media and a thin centered identity lead into warm cream surfaces and copper section titles.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-screen interior scene; hamburger at left; outlined apartment action at right; editorial amenity sections below.

## Component grammar

Outlined leasing action, media control, amenity section labels and warm display headings.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Lato body, HendersonSansBasic uppercase labels around 14px and Optima H2 around 30px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Skip to content 50 Jones FIND AN APARTMENT MUTE/UN | Lato, sans-serif | 16px / 400 | 24px / normal |
| BUTTON:  | Lato, sans-serif | 16px / 400 | 0px / normal |
| MAIN: MUTE/UNMUTE VIDEO 50 Jones Luxury Apartments in Do | Lato, sans-serif | 16px / 400 | 24px / normal |
| BUTTON: MUTE/UNMUTE VIDEO | henderson-sans-basic, sans-serif | 32px / 600 | 36px / 3.2px |
| H2: 50 Jones Luxury Apartments in Downtown San Francis | Optima, sans-serif | 30px / 500 | 36px / normal |
| P: SF’s urban oasis lives at Jones + Market Amongst t | Lato, sans-serif | 18px / 400 | 27px / normal |
| H3: GALLERY | henderson-sans-basic, sans-serif | 14px / 500 | 18.004px / normal |
| P: This storied entertainment neighborhood is alive a | Lato, sans-serif | 16px / 400 | 24px / normal |
| FOOTER:  | Lato, sans-serif | 16px / 400 | 24px / normal |
| HEADER:  | Lato, sans-serif | 16px / 400 | 24px / normal |
| H2:  | henderson-sans-basic, sans-serif | 12px / 500 | 18px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(149, 101, 62)` — 14 sampled uses.
- `rgb(33, 37, 41)` — 13 sampled uses.
- `rgb(102, 102, 102)` — 8 sampled uses.
- `rgb(0, 0, 0)` — 5 sampled uses.
- `rgb(255, 255, 255)` — 2 sampled uses.
- `rgb(252, 249, 245)` — 1 sampled uses.
- `rgba(0, 0, 0, 0.5)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the hierarchy from atmospheric introduction to practical leasing actions.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Apartment search, leasing forms, media controls and mobile menu remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
