# Aramco — Shoot for the Future — design-system reference

Source: [Aramco — Shoot for the Future](https://sponsorships.aramco.com/cba/shoot-for-the-future/) · inspected 2026-10-02 · Corporate / campaign.

Evidence level: **Desktop visual + styles**. Campaign claims were not checked. Game interactions, language states and cookie controls were not used.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A pale field with a modular green court scene connects corporate identity with an interactive sports campaign.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Large campaign headline; small upper-right corporate identity; circular menu and language controls; 3D court scene.

## Component grammar

Circular controls, campaign statement and modular court tiles.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

Ghawar body and Beta Manifa Advertising display sampled at 102px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY: عربي BASKETBALL COURT REVAMP PROJECT SHOOT FOR THE | Ghawar, sans-serif | 16px / 400 | normal / normal |
| HEADER: عربي | Ghawar, sans-serif | 16px / 400 | normal / normal |
| MAIN: BASKETBALL COURT REVAMP PROJECT SHOOT FOR THE FUTU | Ghawar, sans-serif | 11px / 400 | normal / normal |
| H1: SHOOT FOR THE FUTURE | "Beta Manifa Advertising V1.20.4 Bd Wide", sans-serif | 102px / 600 | 80px / normal |
| P: The "Shoot for the Future" initiative aims to high | Ghawar, sans-serif | 20px / 400 | 32px / normal |
| P: INJECTING NEW ENERGY INTO COMMUNITY BASKETBALL IN  | "Beta Manifa Advertising V1.20.4 Bd Wide", sans-serif | 62px / 600 | 54px / normal |
| P: Part of Aramco’s long-standing presence in China a | Ghawar, sans-serif | 16px / 400 | 28px / normal |
| H2: A STRATEGIC PARTNERSHIP | "Beta Manifa Advertising V1.20.4 Bd Wide", sans-serif | 132px / 600 | 108px / normal |
| H2: RENOVATING COMMUNITY COURTS WITH INNOVATIVE MATERI | "Beta Manifa Advertising V1.20.4 Bd Wide", sans-serif | 52px / 600 | 46px / normal |
| P: This project aims to showcase the increasingly imp | Ghawar, sans-serif | 15px / 400 | 22px / normal |
| P: THE FIRST THREE COURTS WERE RENOVATED IN ICONIC CH | "Beta Manifa Advertising V1.20.4 SmBd Wide", sans-serif | 16px / 500 | 19px / normal |
| BUTTON: See Video | Ghawar, sans-serif | 13.3333px / 400 | normal / normal |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

- `rgb(255, 255, 255)` — 31 sampled uses.
- `rgb(0, 0, 0)` — 30 sampled uses.
- `rgb(68, 68, 68)` — 23 sampled uses.
- `rgb(0, 173, 74)` — 7 sampled uses.
- `rgb(73, 154, 239)` — 3 sampled uses.
- `rgb(19, 113, 195)` — 3 sampled uses.
- `rgb(240, 240, 240)` — 1 sampled uses.
- `rgb(64, 173, 52)` — 1 sampled uses.
- `rgb(20, 128, 219)` — 1 sampled uses.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study persistent campaign controls and modular scene composition independently.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Campaign claims were not checked. Game interactions, language states and cookie controls were not used.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
