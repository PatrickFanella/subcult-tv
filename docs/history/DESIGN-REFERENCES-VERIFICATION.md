# Design reference implementation verification

Verified locally on October 2, 2026. These checks apply to this feature implementation, not the live site.

## Source and export

The Studio snapshot contains 590 records: 38 website studies (including ESS), 24 style studies and 528 completed Refero exports. The downloader continued independently; this is a bounded snapshot, not a claim that its entire collection was downloaded.

All 2,124 copied source files match the recorded SHA-256 hashes. The copy contains 617 images and approximately 93.2 MB of source bytes. The private export contains 2,220 content-addressed files, including existing brand/media assets; every exported hash was checked against its actual bytes. Original sources remain in `~/Documents/Design References`.

## Database and API

A disposable PostgreSQL 17 database received migrations 001–004 and the initial real 245-record export and the refreshed 590-record export. Real local password login and authenticated full-document search succeeded. Searching for Helvetica returned 48 references in the initial index.

The database integration test verifies repeated imports, full-document terms, partial-name lookup, multiple-tag AND matching, collection filters, pagination, detail documents, facets, invalid sorting, bounded page numbers, absent records, and retention after a partial later import. A duplicated-ID import fails before modifying existing records. Router tests reject anonymous requests to all reference endpoints.

The 004 down migration removed the new tables while preserving the existing users table. Its up migration and integration test were then rerun with `-count=1` to bypass Go's external-state test cache. Both passed. `go test ./...` and `go vet ./...` passed.

## Frontend

The production build, TypeScript compilation and ESLint passed. All 67 frontend tests passed, including three new reference tests covering view switching, search, combined tags, pagination, document tables, evidence limits, disabled raw HTML, closing the viewer, and empty/error/retry states.

The collaborative browser could reach public pages but not this host's development server. A temporary standalone build of the real reference component and admin layout was rendered with captured responses from the initial 245-record local database snapshot and simulated fetch transport. At 1280 px and 390 px viewports, DOM measurements showed no horizontal overflow. The supplied Y2K screenshots loaded. Grid/list switching worked. The detail dialog displayed its document table, focused the close button, closed with Escape, and returned focus to the opener.

This browser check did not exercise a live browser-to-API connection. Screenshot capture failed in the collaborative browser, so no screenshot evidence or complete visual audit is claimed. The standalone review and its transport fixtures are temporary verification artifacts, not application code.

## Delivery boundary

No production database migration, deployment or publication was performed. The source and admin changes are prepared in companion feature branches in the two repositories; unrelated Studio branding and social draft edits were preserved. Before rollout, resolve Git LFS objects, export a fresh private bundle, confirm the database/bundle destination, apply the migration and index, then verify the authenticated page against that deployed API.
