# Razed Mods — design-system reference

Source: [Razed Mods](https://razed-mods.webflow.io/) · inspected 2026-10-02 · Creative / games.

Evidence level: **Desktop visual + styles**. The changing scene was observed in stills. Downloads, motion timing and video controls remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Atmospheric game imagery sits behind a huge lowercase wordmark and very small technical labels.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-screen lighthouse scene; project/game index at the top; oversized bottom wordmark; narrative copy revealed further down.

## Component grammar

Project index, image scenes, compact technical labels and large mod/project titles.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Jetbrainsmono labels, Anton display and Switzer narrative copy.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: [RAZED MODS]  HOME ART DIRECTION MODS COMMUNITY AB | Jetbrainsmono, Arial, sans-serif | 11.6875px / 500 | 11.6875px / -0.4675px |
| H1: Visual mods built around lighting and atmosphere | Switzer, Arial, sans-serif | 32.1406px / 500 | 38.5687px / -1.92844px |
| P: RAZED MODS FOCUSES ON REALISTIC LIGHTING, COLOR GR | Jetbrainsmono, Arial, sans-serif | 14.6094px / 500 | 18.4078px / -0.292187px |
| H2: Cinematic visuals shaped by lighting and color Cus | Switzer, Arial, sans-serif | 58.4375px / 500 | 58.4375px / -3.50625px |
| P: Dynamic lighting adjustments | Switzer, Arial, sans-serif | 58.4375px / 500 | 58.4375px / -3.50625px |
| H2: GTAV ENHANCED | Anton, Arial, sans-serif | 73.0469px / 400 | 65.7422px / -0.4675px |
| H3: NATURALVISION ENHANCED | Anton, Arial, sans-serif | 73.0469px / 400 | 65.7422px / -0.4675px |
| P: FEATURING REWORKED WEATHER, LIGHTING, AMBIENT COLO | Jetbrainsmono, Arial, sans-serif | 11.6875px / 500 | 15.1937px / normal |
| BUTTON: EXPLORE MOD | Jetbrainsmono, Arial, sans-serif | 11.6875px / 500 | 11.6875px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 69 sampled uses.
- `rgb(6, 6, 6)` — 13 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

The useful split is cinematic media versus precise project metadata; define image transitions separately from text tokens.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

The changing scene was observed in stills. Downloads, motion timing and video controls remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
