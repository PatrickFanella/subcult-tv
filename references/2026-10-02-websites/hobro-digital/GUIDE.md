# Hobro Digital — design-system reference

Source: [Hobro Digital](https://hobro.digital/) · inspected 2026-10-02 · Agency / creative.

Evidence level: **Partial visual / styled document**. Loading persisted. Main layout, typography scale and motion behavior are unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The site remained on a dark loading screen while styled portfolio content was present in the document.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Black-and-white shell; condensed metadata and italic accent content inferred from computed styles.

## Component grammar

Loading status, portfolio labels and editorial accent type.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

PPNeueMontreal, AkkuratMonoLLWeb, FreigBigProLigIta; Kamerik205 also appears.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: LOADING... GET CAPABILITIES DECK Projects Services | PPNeueMontreal, Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| HEADER: GET CAPABILITIES DECK Projects Services Agency Con | PPNeueMontreal, Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| BUTTON: GET CAPABILITIES DECK | AkkuratMonoLLWeb, Arial, sans-serif | 14px / 500 | 14px / normal |
| MAIN: FULL-CYCLE DIGITAL AGENCY EST. 2023 CANADA WE CREA | PPNeueMontreal, Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| P: Hobro is headquartered in Calgary, Canada. With a  | PPNeueMontreal, Helvetica, Arial, sans-serif | 18px / 400 | 21.6px / -0.27px |
| H2: WHAT WE DO | PPNeueMontreal, Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| H3: DISCOVER HOW WE CAN HELP -REQUEST OUR CAPABILITIES | AkkuratMonoLLWeb, Arial, sans-serif | 14px / 500 | 14px / normal |
| H3: FRESH Drop | PPNeueMontreal, Helvetica, Arial, sans-serif | 16px / 400 | 24px / normal |
| H3: Selected Cases | PPNeueMontreal, Helvetica, Arial, sans-serif | 53.3333px / 500 | 46.9333px / -0.533333px |
| H2: CORE VISION | FreigBigProLigIta, Arial, sans-serif | 160px / 300 | 160px / -1.6px |
| P: LET’S CHALLENGE CONVENTIONS AND EXPLORE WHAT’S NEX | AkkuratMonoLLWeb, Arial, sans-serif | 14px / 500 | 14px / normal |
| H2: DISCOVER HOW WE CAN HELP - REQUEST OUR CAPABILITIE | AkkuratMonoLLWeb, Arial, sans-serif | 14px / 500 | 14px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(0, 0, 0)` — 43 sampled uses.
- `rgb(255, 255, 255)` — 18 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Confirm the actual rendered hierarchy before treating split-text parent measurements as heading sizes.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Loading persisted. Main layout, typography scale and motion behavior are unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
