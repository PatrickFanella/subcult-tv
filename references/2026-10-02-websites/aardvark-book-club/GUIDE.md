# Aardvark Book Club — design-system reference

Source: [Aardvark Book Club](https://www.aardvarkbookclub.com/) · inspected 2026-10-02 · Commerce / books.

Evidence level: **Partial visual / styled document**. Repeated captures retained the loader. Main-page composition and purchasing states are unverified.

![Captured desktop state; see evidence limits](images/settled.png)

## Direction and identity

A purple branded loader was visible; styled page content behind it suggests a playful, oversized book-club identity.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Circular aardvark loader; underlying large, tightly led display title and softer supporting text.

## Component grammar

Book selection, membership and hand-drawn accent treatments are candidates from styled content, pending a clear page render.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Champ bold display; Degular body; Hello Organichand accent. H1 sampled at 116.875px / 93.5px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| HEADER: All Books Gifting Merch FAQ Log-in / Sign-up 🇬🇧 Sh | Degular, Arial, sans-serif | 11.6875px / 600 | 20px / normal |
| MAIN: Unbox stories worth talking about  Join the book c | Degular, Arial, sans-serif | 11.6875px / 600 | 20px / normal |
| H1: Unbox stories worth talking about | Champ, Arial, sans-serif | 116.875px / 700 | 93.5px / -1.16875px |
| P: Join the book club that’s anything but traditional | Degular, Arial, sans-serif | 17.5312px / 600 | 21.0375px / -0.350625px |
| P: Shipping to the USA & Canada | "Hello Organichand Webfont", Arial, sans-serif | 23.375px / 400 | 23.375px / -0.4675px |
| BUTTON:  | Degular, Arial, sans-serif | 11.6875px / 600 | 20px / normal |
| H2: Our Oct books | Champ, Arial, sans-serif | 75.9688px / 700 | 60.775px / -0.759687px |
| P: We drop new books on the 1st of every month. Call  | Degular, Arial, sans-serif | 23.375px / 600 | 28.05px / -0.4675px |
| H3: Venus, Vanishing | Champ, Arial, sans-serif | 29.2188px / 700 | 25.7125px / normal |
| P: Portrait of a Lady on Fire meets The Safekeep in t | Degular, Arial, sans-serif | 14.6094px / 600 | 17.5312px / -0.292187px |
| H2: Choose from | Degular, Arial, sans-serif | 23.375px / 600 | 28.05px / -0.4675px |
| H3: How much does membership cost, my wallet is asking | Degular, Arial, sans-serif | 23.375px / 600 | 28.05px / -0.4675px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 73 sampled uses.
- `rgb(255, 255, 255)` — 38 sampled uses.
- `rgb(0, 0, 238)` — 10 sampled uses.
- `rgb(59, 48, 143)` — 10 sampled uses.
- `rgb(250, 237, 143)` — 2 sampled uses.
- `rgb(255, 210, 74)` — 2 sampled uses.
- `rgb(255, 219, 253)` — 1 sampled uses.
- `rgb(253, 72, 242)` — 1 sampled uses.
- `rgb(51, 51, 51)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the three-font role split only after the loader clears; preserve the distinction between intro and shopping states.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Repeated captures retained the loader. Main-page composition and purchasing states are unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [scrolled observation](evidence/scrolled.json) · [saved image](images/scrolled.png)
- [settled observation](evidence/settled.json) · [saved image](images/settled.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
