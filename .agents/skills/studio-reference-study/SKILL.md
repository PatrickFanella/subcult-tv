---
name: studio-reference-study
description: Create or update a source-linked design reference study in subcult-tv/studio from a website, screenshot, visual style or historical collection, and register it for the authenticated Studio reference library.
---

# Studio reference study

Turn design evidence into a study someone can reuse without mistaking interpretation for observation. Work from the active `subcult-tv` checkout. Read root and `studio/AGENTS.md`, inspect Git status, and preserve unrelated files. `studio/references/` owns the studies; skill instructions are authored in codex-skills.

## Choose the mode

- **Capture and study:** inspect supplied material or a website and write an evidence-backed study.
- **Refresh:** compare a dated study with fresh evidence, preserving the earlier capture and explaining material changes.
- **Catalog:** register an existing authored study and verify its private export.

Read `studio/references/README.md`, `USAGE.md`, the relevant collection and its source records. Search the [authenticated reference library](https://subcult.tv/admin/studio/references) and local catalogs for an existing study before creating another. Selecting a production identity belongs to `studio-brand-system`; checking a product against its brand belongs to `studio-brand-audit`.

## Study the evidence

Record the subject, URL or supplied source, observation date, viewport and states inspected. Use the current client's browser contract for navigation and captures. A screenshot supports visible composition; it does not establish hover behavior, mobile layout, font identity or animation. Distinguish measured values, visual estimates, source declarations and recommendations. Record inaccessible pages and unknown capture dates without inventing observations.

Describe the design moves that matter: hierarchy and information density, type roles, semantic colors, grid and spacing, imagery, motifs, components, navigation and observed interaction states. For an era or collection, cite examples and source taxonomy; label SUBCULT's synthesis as interpretation. Explain useful applications and tradeoffs rather than presenting another site's system as an official specification or a ready-made brand.

Keep third-party identity and media rights explicit. Link sources and retain permitted private evidence; library inclusion grants no publication rights. Use licensed or original illustration when a copied screenshot is unsuitable. Hash retained files and record their origin. Download only evidence needed for the study; avoid expanding a requested study into a crawler or bulk acquisition.

## Maintain and register

Write authored work under `studio/references/curated/<collection>/`, following [the study outline](references/study-outline.md). Preserve imported `catalog.json`, `import-manifest.json` and downloader outputs; the reference importer can refresh those independently.

Use a neighboring curated catalog as the current schema example. Catalog paths are relative to `studio/references/`. Supply a globally unique ID, name, source URL, supported collection, useful summary/tags, document path, images, attachments and provenance. An image-free study uses an empty image list. Reuse the application's current collection taxonomy or include the needed application changes within the authorized scope. Maintain the collection index and `sources.json` with actual authored-file hashes.

Inspect `studio/scripts/export_studio.py` and relevant checks before exporting. Curated catalogs are merged into the private bundle; duplicate IDs stop export. Verify inclusion, attachment paths and hashes using an isolated private output under `studio/runtime/` or outside the repository. Run `rtk make check-studio check-studio-automation` for Studio changes and relevant application checks if taxonomy changed.

Finish with the study and evidence links, catalog ID, source limits and verification. A local catalog/export is complete when the study is discoverable in the generated private bundle. Updating a running admin library requires a separate authorized export/index or deployment operation; do not claim live availability from source edits.
