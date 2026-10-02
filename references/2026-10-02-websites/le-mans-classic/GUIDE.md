# Le Mans Classic — design-system reference

Source: [Le Mans Classic](https://lemansclassic.richardmille.com/en) · inspected 2026-10-02 · Interactive / campaign.

Evidence level: **Partial visual / styled document**. Main narrative screenshot, motion timing and chapter transitions remain unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A small grayscale image on black was captured during loading; later styled content uses huge condensed type and yellow accents.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Photographic narrative with a large BELOW THE LINE title in the styled document.

## Component grammar

Chapter-like scenes, display title and compact controls.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Arges display sampled at 311px; DieGroteskC controls around 16px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: BELOW THE LINE BELOW THE LINE A PHOTOGRAPHIC TALE  | DieGroteskC, sans-serif | 14.2222px / 400 | 21.3333px / normal |
| HEADER: (ABOUT) (FR) BELOW THE LINE (SOUND: OFF) (CHAPTERS | DieGroteskC, sans-serif | 14.2222px / 400 | 21.3333px / normal |
| BUTTON: (ABOUT) | DieGroteskC, sans-serif | 10.6667px / 400 | 10.6667px / normal |
| MAIN: (01) MORNING A11 MOTORWAY  Paris fades into the mi | DieGroteskC, sans-serif | 14.2222px / 400 | 21.3333px / normal |
| P: Paris fades into the mist in the rear-view mirror. | DieGroteskC, sans-serif | 24px / 400 | 24px / normal |
| P: "Insurance problem, sir. Your accreditation doesn' | DieGroteskC, sans-serif | 14.2222px / 400 | 21.3333px / normal |
| P: I'M IN THE SHIT | DieGroteskC, sans-serif | 26.6667px / 400 | 32px / normal |
| H2: FIRST  A red Ferrari, number 9, doing 125 mph past | Arges-Condensed, sans-serif | 284.444px / 400 | 284.444px / normal |
| P: Classic, predictable. But I see something else in  | DieGroteskC, sans-serif | 23.1111px / 400 | 23.1111px / normal |
| P: FIRST LESSON OF THE DAY | Arges-Condensed, sans-serif | 284.444px / 400 | 284.444px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(22, 22, 22)` — 16 sampled uses.
- `rgb(255, 229, 0)` — 4 sampled uses.
- `rgb(255, 255, 255)` — 2 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Keep cinematic chapter states separate from persistent controls.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Main narrative screenshot, motion timing and chapter transitions remain unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
