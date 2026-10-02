# Sakazuki — design-system reference

Source: [Sakazuki](https://sakazuki.io/) · inspected 2026-10-02 · Creative / collective.

Evidence level: **Partial visual / styled document**. Opening image is available, but later composition and canvas interactions lack a fresh screenshot.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

Warm amber macro imagery and large manifesto words introduce the collective.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-scene opening media; oversized statement; cream/red/black styled interface content.

## Component grammar

Manifesto typography, collective navigation and immersive media.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Hagrid display sampled at 124px and HagridText body.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: PHILOSOPHY PHILOSOPHY COLLECTIVE COLLECTIVE BENEFI | hagrid-text, serif | 15.0588px / 400 | 21.0824px / normal |
| HEADER: PHILOSOPHY PHILOSOPHY COLLECTIVE COLLECTIVE BENEFI | hagrid-text, serif | 15.0588px / 400 | 21.0824px / normal |
| BUTTON:  | hagrid, serif | 13.1765px / 400 | 13.1765px / normal |
| MAIN: Unlocking Japan's Hidden Gems  Guided by Suntory g | hagrid-text, serif | 15.0588px / 400 | 21.0824px / normal |
| P: Unlocking Japan's Hidden Gems | hagrid, serif | 26.88px / 400 | 26.88px / normal |
| H1:  | hagrid, serif | 15.0588px / 400 | 15.0588px / normal |
| P: SAKAZUKI is a private membership connecting people | hagrid, serif | 18.8235px / 400 | 18.8235px / normal |
| H2: THE HEART  O F  SAKAZUKI | hagrid, serif | 112.941px / 400 | 112.941px / 1.12941px |
| P: THE HEART | hagrid, serif | 112.941px / 400 | 112.941px / 1.12941px |
| H2: Philosophy | hagrid, serif | 18.8235px / 400 | 23.5294px / normal |
| P: The people behind each work — across craft, art, a | hagrid-text, serif | 28.2353px / 400 | 35.2941px / normal |
| P: Philosophy | hagrid-text, serif | 18.8235px / 400 | 26.3529px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 1444 sampled uses.
- `rgb(255, 255, 255)` — 28 sampled uses.
- `rgb(225, 214, 206)` — 26 sampled uses.
- `rgb(195, 13, 35)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study tactile imagery and manifesto pacing; separate media colors from interface accents.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Opening image is available, but later composition and canvas interactions lack a fresh screenshot.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
