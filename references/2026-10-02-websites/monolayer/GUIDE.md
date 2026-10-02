# Monolayer — design-system reference

Source: [Monolayer](https://www.monolayer.dev/) · inspected 2026-10-02 · Developer / product.

Evidence level: **Desktop visual + styles**. Interactive graphic behavior, inner pages and mobile states remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Light gray surfaces, large lowercase sentences and black scanline graphics form a spare technical identity.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Large 70px introductory sentence; small navigation; black graphic field; thin dividers and bracketed links.

## Component grammar

Bracket links, technical label blocks and large explanatory paragraphs.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

PPFrama; later explanatory paragraph sampled around 52.59px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: absurdity system how it works different pricing [  | PPFrama, Arial, sans-serif | 11.6875px / 400 | 16.3625px / normal |
| MAIN: absurdity system how it works different pricing [  | PPFrama, Arial, sans-serif | 11.6875px / 400 | 16.3625px / normal |
| P: sign up | PPFrama, Arial, sans-serif | 14.6094px / 400 | 20.4531px / normal |
| H1: monolayer shifts software toward what it should be | PPFrama, Arial, sans-serif | 70.125px / 400 | 84.15px / -0.70125px |
| H2: writing code is only one part of getting software  | PPFrama, Arial, sans-serif | 52.5938px / 400 | 63.1125px / -0.525937px |
| H2: the system | PPFrama, Arial, sans-serif | 14.6094px / 400 | 20.4531px / normal |
| H3: monolayer takes your intent, acts on it, learns fr | PPFrama, Arial, sans-serif | 70.125px / 400 | 84.15px / -0.70125px |
| H3: ① a change is introduced, monolayer sees the inten | PPFrama, Arial, sans-serif | 52.5938px / 400 | 63.1125px / -0.525937px |
| P: 01 | PPFrama, Arial, sans-serif | 233.75px / 400 | 233.75px / normal |
| P: monolayer connects to your repository and cloud, t | PPFrama, Arial, sans-serif | 52.5938px / 400 | 63.1125px / -0.525937px |
| H2: what used to be managed by hand, is now automated  | PPFrama, Arial, sans-serif | 35.0625px / 400 | 45.5812px / -0.350625px |
| P: a different surface | PPFrama, Arial, sans-serif | 17.5312px / 400 | 24.5438px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 112 sampled uses.
- `rgb(229, 229, 229)` — 19 sampled uses.
- `rgb(15, 0, 176)` — 1 sampled uses.
- `rgb(199, 190, 170)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study scale contrast and punctuation as interface framing; keep generated graphics separate from UI tokens.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Interactive graphic behavior, inner pages and mobile states remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
