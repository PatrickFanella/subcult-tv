# New Models — design-system reference

Source: [New Models](https://www.newmodels.io/) · inspected 2026-10-02 · Editorial / culture.

Evidence level: **Desktop visual + styles**. Theme switching and membership were not exercised. Some computed text colors need a cascade check against their actual backgrounds.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

A black opening field, red statement and central photograph lead into a dense editorial grid.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Generous opening negative space; three-column article layout below; thin rules; theme selector.

## Component grammar

Ellipsis menu, thumbnail-and-metadata entries, highlighted membership links and CLEAR / DARK / ARCHIVE selector.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Helvetica; compact metadata rather than a large type palette.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: THE ONLINE MARKETPLACE OF IDEAS  CLEAR DARK ARCHIV | Helvetica, sans-serif | 14px / 400 | 21px / normal |
| P: THE ONLINE MARKETPLACE OF IDEAS | Helvetica, sans-serif | 31.5px / 700 | 35px / normal |
| P: Newest from NM | Helvetica, sans-serif | 14px / 400 | 19.25px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 230 sampled uses.
- `lab(65.6464 1.53497 -5.42429)` — 16 sampled uses.
- `rgb(255, 0, 0)` — 3 sampled uses.
- `rgb(255, 255, 0)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Separate theme behavior, membership actions and editorial indexing before adapting the system.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Theme switching and membership were not exercised. Some computed text colors need a cascade check against their actual backgrounds.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
