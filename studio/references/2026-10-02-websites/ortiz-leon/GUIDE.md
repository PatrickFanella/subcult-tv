# Ortiz León — design-system reference

Source: [Ortiz León](https://www.ortizleon.com/) · inspected 2026-10-02 · Architecture / property.

Evidence level: **Desktop visual + styles**. Language switching and project details remain untested. The blue cookie-control color is excluded from brand-role tokens.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

An off-white shell and dark-gray text create a restrained frame for architecture photography and news.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Horizontal navigation and language labels; framed large project photo; news headings and project grid.

## Component grammar

Language controls, project imagery, news entries and simple navigation.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

GalanoGrotesqueAlt; news heading sampled at 36px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Valoramos tu privacidad  Usamos cookies para mejor | "Galano Grotesque Alt" | 18px / 400 | 27px / normal |
| BUTTON:  | "Galano Grotesque Alt" | 18px / 400 | 0px / normal |
| P: Valoramos tu privacidad | "Galano Grotesque Alt" | 18px / 700 | 24px / normal |
| P: Usamos cookies para mejorar su experiencia de nave | "Galano Grotesque Alt" | 14px / 400 | 24px / normal |
| BUTTON: Personalizar | "Galano Grotesque Alt" | 14px / 500 | 24px / normal |
| HEADER: Proyectos Estudio Publicaciones ESG I+D+i Contacto | "Galano Grotesque Alt" | 18px / 400 | 27px / normal |
| LABEL:  | "Galano Grotesque Alt" | 18px / 400 | 27px / normal |
| H2: La sostenibilidad también se construye desde la me | "Galano Grotesque Alt" | 36px / 400 | 45px / normal |
| P: Enrique León comparte la visión de Ortiz León Arqu | "Galano Grotesque Alt" | 18px / 400 | 23.4px / normal |
| H2: "Somos una firma multidisciplinar que apuesta por  | "Galano Grotesque Alt" | 32px / 400 | 38.4px / normal |
| FOOTER: Inicio Proyectos Estudio Reconocimiento Clientes C | "Galano Grotesque Alt" | 18px / 400 | 27px / normal |
| P: MADRID Pasaje de Enrique Ruano 4b 28001 Madrid, Es | "Galano Grotesque Alt" | 15.75px / 400 | 23.625px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(48, 47, 44)` — 42 sampled uses.
- `rgb(239, 240, 235)` — 26 sampled uses.
- `rgb(126, 129, 126)` — 17 sampled uses.
- `rgb(33, 37, 41)` — 12 sampled uses.
- `rgb(63, 81, 181)` — 4 sampled uses.
- `rgb(48, 47, 59)` — 2 sampled uses.
- `rgb(0, 0, 0)` — 1 sampled uses.
- `rgba(255, 255, 255, 0)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study project/news hierarchy and multilingual navigation. Cookie vendor colors are separate from the practice palette.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Language switching and project details remain untested. The blue cookie-control color is excluded from brand-role tokens.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
