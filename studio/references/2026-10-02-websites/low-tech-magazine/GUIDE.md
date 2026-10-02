# Low-tech Magazine — design-system reference

Source: [Low-tech Magazine](https://solar.lowtechmagazine.com/) · inspected 2026-10-02 · Editorial / sustainability.

Evidence level: **Live render unavailable**. Current visual system is unverified. The historical source is from 2018; current availability and the reason for the failed load are unknown.

![Captured desktop state; see evidence limits](images/observation.png)

## Direction and identity

The current homepage could not be rendered. This entry preserves that failure and points to the publisher's documented approach.

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

The publisher's earlier low-tech website article describes a static, lightweight publication with dithered imagery and default browser fonts.

## Component grammar

Historical reference topics: category-tinted images, simple text navigation and energy-aware delivery.

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

No current font tokens extracted; the browser error page is excluded.

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

No current site typography samples are suitable for extraction.

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

No current site palette extracted.

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

Use this as a performance and content-delivery study after a successful live capture.

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

Current visual system is unverified. The historical source is from 2018; current availability and the reason for the failed load are unknown.

- [observation observation](evidence/observation.json) · [saved image](images/observation.png)

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
