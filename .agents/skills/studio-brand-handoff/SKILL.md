---
name: studio-brand-handoff
description: Prepare or integrate a selected Studio brand pack into a SUBCULT product repository with explicit asset selection, source hashes, token mappings, reproducible exports and product verification.
---

# Studio brand handoff

Make a selected Studio system usable by its product without introducing competing editing masters. Read the active `subcult-tv` root, Studio and destination product instructions. Inspect both Git states and preserve unrelated work. Studio owns branding masters unless the pack records a product-owned design source; the product owns its implementation.

## Choose the mode

- **Prepare:** inventory the selected pack and produce a reviewable integration plan with exact source/destination mappings.
- **Integrate:** carry an authorized handoff into the target repository and verify the resulting behavior.
- **Refresh:** update an existing integration using its recorded source hashes and exporter; preserve later product edits and report drift.

Use `studio-brand-system` to select/create a system and `studio-brand-audit` to review it. Preparation ends with mappings and previews. Integration authorizes scoped local edits; preserve the requested stopping point.

## Resolve the sources and consumer

Read the target pack's guide, tokens, selection records, source provenance, font licenses and manifest. Inspect product assets, theme variables, font loading, icons, metadata, design docs and actual consumer paths.

Confirm which direction and mark variants are selected. Keep pending choices proposed and continue independent inventory work; do not mark them approved. For product-owned interface systems, adapt promotional artwork to the recorded relationship rather than overwriting product tokens with Studio's palette.

## Prepare the mapping

List each required destination: mark/lockup, favicon and app icons where used, share card, fonts, illustration and token roles. Record source path and SHA-256, target path and usage, dimensions/format, license, variant choice and transformation. Distinguish an unchanged copy from a derived file and retain source/output hashes for transformations. Exclude reference screenshots, drafts, credentials and private catalogs from public output.

Map semantic roles to the product's actual variables and components. Document intentional differences, fallback fonts, responsive rules and interaction states that implementation must preserve. Select only required assets and font weights. Resolve real application/platform dimensions; do not copy a full brand folder into a public build context.

Inspect existing pack-specific exporters and provenance checks before choosing an implementation. For SUBCULT.TV, `studio/scripts/export_studio.py --site-root` writes an explicit public selection as well as a private bundle; `scripts/check-public-assets.py` checks source and destination hashes. Read those scripts before execution and use an isolated private output for the bundle. Follow other products' exporter contracts and manifest schemas.

## Integrate and verify

When authorized, run or narrowly extend the owning exporter, integrate the selected files and token mappings, and update relevant product design docs and provenance. Keep an explicit reviewed public selection; updating a hash does not itself authorize adding a new public asset. Refuse unexpected destination drift rather than overwriting product edits or resetting a baseline.

Verify copied and transformed hashes, font licenses and loading, icon sizing/crops, share metadata and representative wide/narrow rendered states. Run product checks appropriate to the changes and Studio checks when Studio sources changed. Check the public build context and resulting output for private Studio material. A local build proves local integration; a deployed site requires its own revision and browser evidence.

Finish with selected assets, source/destination mapping, implementation changes, build/update instructions and verification boundaries. Leave generated ZIPs and runtime bundles out of Git. A handoff is complete when the requested consumer can apply or rebuild the selected assets with one clear source owner and traceable exports.
