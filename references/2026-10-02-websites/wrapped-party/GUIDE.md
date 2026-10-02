# Wrapped Party — design-system reference

Source: [Wrapped Party](https://wrapped-party.activetheory.dev/) · inspected 2026-10-02 · Interactive / campaign.

Evidence level: **Partial visual / styled document**. No party was created and no Spotify account was connected. Finished interface and fallback-font causes remain unverified.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The captured Spotify-themed loading scene uses cream, lime and wide outlined display type.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Large percentage counter; later DOM exposes party-editing and menu controls without a clear finished-app screenshot.

## Component grammar

Progress counter, outlined lettering and party-editing controls.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

SpotifyMixWide display around 108px in the loader; later fallback samples require verification.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: Wrapped Party by Spotify. 100  Exit open menu  Tex | Times | 10px / 400 | normal / normal |
| H1: Wrapped Party by Spotify. | Times | 20px / 400 | normal / normal |
| H1: 100 | SpotifyMixWide, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, NotoSansThai, KoreanSWGI, "Noto Sans SC", "Noto Sans TC", UDShinGoPro, "Helvetica Neue", helveti | 108px / 800 | 108px / -8.64px |
| MAIN: Exit open menu  Text  Edit party name Cancel Save  | Times | 10px / 400 | 10px / normal |
| P:  | Times | 10px / 400 | 10px / normal |
| HEADER: Exit open menu  Text  Edit party name | Times | 10px / 400 | 10px / normal |
| BUTTON:  | Times | 10px / 400 | 10px / normal |
| LABEL: Edit party name Text | Times | 10px / 400 | 10px / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(245, 245, 245)` — 5 sampled uses.
- `rgb(0, 0, 238)` — 5 sampled uses.
- `rgb(255, 255, 255)` — 2 sampled uses.
- `rgb(239, 239, 234)` — 1 sampled uses.
- `rgb(149, 201, 13)` — 1 sampled uses.
- `rgb(39, 39, 39)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Model loader, editor and completed-party states independently.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

No party was created and no Spotify account was connected. Finished interface and fallback-font causes remain unverified.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
