# Repository cleanup

The combined repository is organized around current sources and their consumers. The public site and authenticated admin keep their existing routes and visual system. The work is tracked with the consolidation PR; it does not deploy the website or switch installed preparation jobs.

## Changes

- Active brand directories use `studio/branding/library/` and `studio/branding/patrick/`; generators, exports, media recipes and local links follow those paths.
- Retired reviews, Signal material and original imported artwork are grouped under `studio/branding/archive/`. Historical migration/release evidence is under `docs/history/` and `studio/docs/history/`.
- Twenty-three obsolete preview/study artifacts and review files were removed after checking their consumers. All 802 Studio SVG sources/exports retain their exact pre-cleanup bytes. The receipt records hashes and the original revision.
- Six unused frontend modules and uncalled client wrappers were removed. Public Go API routes remain available. The local catalog helper is named `project-catalog.ts` and contains only its called lookup.
- Generated ZIPs go to ignored runtime storage; packaging excludes caches and nested archives. Fontconfig uses relative bundled-font paths instead of workstation-specific locations.
- Development uses an explicit Compose profile with a disposable database and synthetic settings. NUC port bindings moved from an automatically loaded override to `ops/compose/nuc.yml`.
- Build, check and test commands cover the combined repository. TypeScript checking follows its project references. Studio CI now verifies current asset integrity and the preserved original import.

## Retained material

The 590-record reference library, catalogued media, current brand exports, editable masters, fonts/licenses, public content and preparation state boundaries remain. Per-brand font copies and source-to-production copies have actual packaging/export consumers. They were not removed based on matching hashes alone.

The current approval record identifies Patrick’s Patch direction; its superseded Signal choices remain in `studio/docs/history/selected-directions-2026-10-01.json`. Original import and cutover receipts retain their original bytes and dates.

## Recovery and activation

[cleanup-receipt.json](cleanup-receipt.json) records the baseline revision, path moves, removal hashes and preserved SVG hashes. Recover individual originals from that revision or the retained Studio ancestry. Do not restore an old snapshot over current masters or active edits.

The primary checkouts and live timers were not changed. Their outstanding work and installed-consumer cutover are still covered by [repository consolidation](REPOSITORY-CONSOLIDATION.md). The October 6 publication hold is preserved in [the historical release record](history/RELEASE-2026-10-06.md).

Local, hosted CI, rendered UI, deployment and natural scheduled-run evidence are separate. Validation results belong in the PR with the exact checked revision.
