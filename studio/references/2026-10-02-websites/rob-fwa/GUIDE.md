# Rob FWA — design-system reference

Source: [Rob FWA](https://www.robfwa.com/) · inspected 2026-10-02 · Interactive / art.

Evidence level: **Desktop visual + styles**. Audio playback, file upload and export were not exercised. Simplified style capture succeeded after the broader extraction failed.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

A red spectral artwork occupies the black field while tiny technical labels and gold actions frame the controls.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

Central generated artwork; tracked corner labels; compact playback controls and download actions.

## Component grammar

Player controls, spectrum labels, upload action and PNG/SVG download actions.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

System monospace stack; title 13px with 3.38px tracking and supporting labels around 10–11px.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

| Element / sample | Family | Size / weight | Line height / tracking |
|---|---|---|---|
| BODY:                               Rob FWA       Spectr | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 16px / 400 | unrecorded / normal |
| H1: Spectral Field | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 13px / 400 | unrecorded / 3.38px |
| P: Tap to play — 37 tracks, shuffled.Each draws its o | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 11px / 400 | unrecorded / 1.1px |
| P: Only use music you own or have the rights to.Name  | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 10px / 400 | unrecorded / 0.6px |
| A: SoundCloud | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 10px / 400 | unrecorded / 1.4px |
| BUTTON: ⌂ | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 12px / 400 | unrecorded / normal |
| BUTTON: Download PNG | ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace | 11px / 400 | unrecorded / 1.54px |

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

No current site palette extracted.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Study the separation between generated artwork and compact control chrome.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Audio playback, file upload and export were not exercised. Simplified style capture succeeded after the broader extraction failed.

- [limited-style observation](evidence/limited-style.json) · no saved image for this pass
- [observation observation](evidence/observation.json) · [saved image](images/observation.png)
- [settled observation](evidence/settled.json) · no saved image for this pass

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
