# Sondaven — design-system reference

Source: [Sondaven](https://sondaven.com/en) · inspected 2026-10-02 · Architecture / property.

Evidence level: **Desktop visual + styles**. Main page loaded on the later pass. Investment flow, language switching and mobile states remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Warm resort imagery, brown typography and an irregular striped identity frame an investment project.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Full-scene render; sparse upper navigation; small investment metadata; circular outlined investment action.

## Component grammar

Striped mark, image captions, circular action and quiet navigation.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

KTF Metro Roman display and KTF Metro Blueline labels; display sample around 54.54px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: MENU MENU AEROTOUR AEROTOUR UA UA CONSULTATION INV | "KTF Metro Blueline", Arial, sans-serif | 14.025px / 400 | 14.025px / normal |
| H1: INVESTMENT PROJECT | "KTF Metro Blueline", Arial, sans-serif | 11.6875px / 400 | 19.4013px / 0.935px |
| H2: UP TO 10% | "KTF Metro Roman", "Times New Roman", sans-serif | 54.5417px / 400 | 54.5417px / -3.49067px |
| H3: EXPECTED ANNUAL RETURN | "KTF Metro Blueline", Arial, sans-serif | 9.73958px / 400 | 15.5833px / 0.779167px |
| H2: RESORT DESIGN HOTEL IN YAREMCHE | "KTF Metro Roman", "Times New Roman", sans-serif | 38.9583px / 400 | 38.9583px / -2.49333px |
| H2: PROLOGUE | "KTF Metro Blueline", Arial, sans-serif | 9.73958px / 400 | 15.5833px / 0.779167px |
| H3: “AMONG THESE MOUNTAINS, WHERE THE WIND BECOMES A V | "KTF Metro Roman", "Times New Roman", sans-serif | 38.9583px / 400 | 38.9583px / -2.49333px |
| H2: SON DAVEN | "KTF Metro Roman", "Times New Roman", sans-serif | 140.25px / 400 | 116.408px / -8.976px |
| P: BY BLAGO | "KTF Metro Blueline", Arial, sans-serif | 19.4792px / 400 | 23.375px / 1.55833px |
| H3: ABOUT US | "KTF Metro Roman", "Times New Roman", sans-serif | 54.5417px / 400 | 54.5417px / -3.49067px |
| P: SON DAVEN IS A NEW PLACE OF POWER IN THE CARPATHIA | "KTF Metro Blueline", Arial, sans-serif | 9.73958px / 400 | 15.5833px / 0.779167px |
| H2: WATERFALL BREAKDOWN | "KTF Metro Roman", "Times New Roman", sans-serif | 9.73958px / 400 | 11.6875px / 0.779167px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(168, 148, 116)` — 109 sampled uses.
- `rgb(44, 40, 36)` — 76 sampled uses.
- `rgb(255, 255, 255)` — 13 sampled uses.
- `rgba(168, 148, 116, 0.5)` — 3 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study image-led hierarchy and caption placement rather than assuming every large mark is a text heading.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Main page loaded on the later pass. Investment flow, language switching and mobile states remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
