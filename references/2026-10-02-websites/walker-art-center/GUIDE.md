# Walker Art Center — design-system reference

Source: [Walker Art Center](https://www.walkerart.org/) · inspected 2026-10-02 · Culture / institution.

Evidence level: **Desktop visual + styles**. Some images appeared blurred while loading. Ticket flow, program details and mobile navigation remain untested.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

Large artwork photography and an understated white navigation bar organize the institution's many programs.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Centered WALKER identity between navigation groups; outlined ticket action; edge-aligned hero title and metadata; paired imagery below.

## Component grammar

Ticket pill, program captions, image-led features and upcoming-program marquee.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

ABC Walker; a regular hero heading sampled at 72px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Skip to main content Search What’s On Visit Art &  | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 16px / 400 | 24px / normal |
| HEADER: Search What’s On Visit Art & Artists Join & Give S | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 16px / 400 | 24px / normal |
| BUTTON: TOGGLE NAVIGATION MENU MAIN MENU | sans-serif | 12px / 500 | 19.2px / normal |
| MAIN: Pause Previous Slide HUG featuring Devendra Banhar | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 16px / 400 | 24px / normal |
| BUTTON: Pause | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 16px / 400 | 24px / normal |
| H2: HUG featuring Devendra Banhart, Gyan Riley, and No | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 72px / 400 | 72px / normal |
| P: Wed, Oct 14, 2026 | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 24px / 400 | 36px / normal |
| P: Welcome to the Walker Art Center. We’re Minneapoli | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 32px / 400 | 41.6px / normal |
| P: Exhibitions | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 20px / 400 | 30px / normal |
| H2: Free programs every Thursday night | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 48px / 400 | 50.4px / normal |
| H2: Events and Activities | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 32px / 400 | 41.6px / normal |
| P: Aug 6, 2026–Jan 3, 2027 | "ABC Walker", "ABC Walker Fallback", sans-serif, sans-serif, "ABC Walker Fallback", sans-serif | 18px / 400 | 27px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 210 sampled uses.
- `rgb(255, 255, 255)` — 44 sampled uses.
- `rgb(2, 2, 2)` — 10 sampled uses.
- `rgb(0, 0, 255)` — 2 sampled uses.
- `color(srgb 1 1 1 / 0.85)` — 2 sampled uses.
- `rgb(255, 204, 0)` — 2 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the relationship between institutional navigation and exhibition-specific photography.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Some images appeared blurred while loading. Ticket flow, program details and mobile navigation remain untested.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
