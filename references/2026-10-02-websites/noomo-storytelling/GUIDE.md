# Noomo Storytelling — design-system reference

Source: [Noomo Storytelling](https://storytelling.noomoagency.com/) · inspected 2026-10-02 · Interactive / creative.

Evidence level: **Partial visual / styled document**. A styled screenshot is missing. Scroll narrative, interaction and font-loading behavior need a revisit.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The first render missed intended styles; the later document restored a lilac, navy and pale-pink storytelling direction.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Large display title and framed interactive scene; intended layout only partly supported by the initial screenshot.

## Component grammar

Story frame, very large title and interactive scene.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

TTNeoris supporting type and TheSeasons display sampled at 273px after styles loaded.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: The power of digital storytelling  In a world that | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 10px / 400 | 15px / normal |
| H2: The power of digital | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 66px / 400 | 60px / -1.98px |
| H1: storytelling | TheSeasons, serif | 249.6px / 400 | 249.6px / -1.28px |
| P: In a world that’s  constantly shifting, | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 50px / 400 | 46px / -1px |
| P: Storytelling is much more than words. | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 26px / 400 | 30px / normal |
| P: It is how a spark  becomes a fire. | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 66px / 400 | 60px / -1.98px |
| P: is narrative. | TheSeasons, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", serif | 208px / 400 | 134px / -4.16px |
| P: Reimagine Phoenix | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 18px / 400 | 20px / -0.18px |
| FOOTER: Let us help you tell your story the way it was mea | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 10px / 400 | 15px / normal |
| HEADER: Agency Labs Contact Home Agency Labs Contact Insta | TTNeoris, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif | 10px / 400 | 15px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 22 sampled uses.
- `rgb(0, 0, 0)` — 8 sampled uses.
- `rgb(41, 52, 90)` — 8 sampled uses.
- `rgb(196, 197, 241)` — 1 sampled uses.
- `rgb(253, 235, 253)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Use the later styled evidence for typography; exclude the first render's default Times and blue links from tokens.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

A styled screenshot is missing. Scroll narrative, interaction and font-loading behavior need a revisit.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
