# I-Creativ — design-system reference

Source: [I-Creativ](https://i-creativ.net/en) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Partial visual / styled document**. Main-page visual composition is unverified. Computed styles alone do not prove visible text or animation completion.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The first image was largely blank; later styled content suggests a dark site with oversized condensed headings.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Dark surface and large animated-letter heading structure, with canvas content.

## Component grammar

Split-letter title treatment, service sections and canvas scene.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Peridot PE Variable supporting text and BebasNeue display sampled at 117px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Design & Web Development by D i g i t a l   a r t  | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 15.68px / 400 | 21.952px / normal |
| BUTTON:  | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 0px / 400 | 0px / normal |
| MAIN: Design & Web Development by D i g i t a l   a r t  | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 15.68px / 400 | 21.952px / normal |
| HEADER: Design & Web Development by D i g i t a l   a r t  | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 15.68px / 400 | 21.952px / normal |
| H1: Design & Web Development by D i g i t a l   a r t  | BebasNeue, Impact, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 117.12px / 700 | 161.626px / normal |
| H2: We are based in the creative district "Kapana" of  | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 48px / 700 | 66.24px / normal |
| P: Since 2006 we've been working with startups and es | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 15.68px / 400 | 25.088px / 0.4704px |
| P: © Urban Fossils — photo by I‑C | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 13px / 400 | 19.5px / 1.3px |
| P: A curated highlight from our recent work — a proje | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 17.28px / 400 | 26.2656px / 0.5184px |
| FOOTER: Web Design FAQ Visual & Copyright About cookies    | peridot-pe-variable, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Oxygen, Cantarell, sans-serif | 15px / 400 | 21.952px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `oklch(0.8846 0.0046 259.33)` — 32 sampled uses.
- `oklch(0.2014 0.0101 276.52)` — 1 sampled uses.
- `rgb(0, 0, 0)` — 1 sampled uses.
- `rgba(255, 255, 255, 0.65)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Define the readable resting state of animated headings before specifying motion.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Main-page visual composition is unverified. Computed styles alone do not prove visible text or animation completion.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
