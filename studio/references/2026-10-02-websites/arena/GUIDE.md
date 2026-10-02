# Are.na — design-system reference

Source: [Are.na](https://www.are.na/) · inspected 2026-10-02 · Community / knowledge.

Evidence level: **Desktop visual + styles**. This documents the public landing page. Account creation and the application grid were not inspected.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

The current landing page uses a narrow column of quiet text on black, followed by product imagery.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Centered text column around 619 CSS pixels; compact account actions; large rounded product screenshot with a phone overlay.

## Component grammar

Paired signup actions, fine dividers and a screenshot presentation frame.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Custom areal stack; introductory text sampled at 19.2px with 27.84px line height.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Log in Are.na is Online software for saving and or | "Times New Roman" | 16px / 400 | 16px / normal |
| MAIN: Are.na is Online software for saving and organizin | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 16px / 400 | 16px / normal |
| H1: Are.na is | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 19.2px / 400 | 27.84px / normal |
| BUTTON:  | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 12.5px / 700 | 0px / normal |
| BUTTON: Sign up | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 14.4px / 700 | 0px / normal |
| H2: How it works | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 19.2px / 700 | 27.84px / normal |
| BUTTON: Capture  Save photos, notes, files, webpages and a | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 16px / 400 | 16px / normal |
| H3: Capture | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 19.2px / 400 | 23.04px / normal |
| P: Save photos, notes, files, webpages and anything e | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 12.5px / 400 | 16.875px / normal |
| P: On Are.na, there's nothing algorithmic steering yo | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 19.2px / 400 | 27.84px / normal |
| P: “The modernist abolition of central perspectival s | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 14.4px / 400 | 20.88px / normal |
| BUTTON: surface of excess | areal, "areal Fallback", Arial, Helvetica, sans-serif, Arial, Helvetica, sans-serif | 19.2px / 400 | 27.84px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(229, 229, 229)` — 60 sampled uses.
- `rgb(255, 255, 255)` — 52 sampled uses.
- `rgb(0, 0, 0)` — 31 sampled uses.
- `rgb(105, 105, 105)` — 12 sampled uses.
- `rgb(26, 26, 26)` — 4 sampled uses.
- `rgb(226, 223, 233)` — 3 sampled uses.
- `rgba(26, 26, 26, 0.6)` — 1 sampled uses.
- `rgb(178, 178, 178)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Use the landing page to study paced explanations and restrained actions. The authenticated block/channel interface requires its own guide.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

This documents the public landing page. Account creation and the application grid were not inspected.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
