# Repository consolidation

`subcult-tv` is the selected combined private repository. The website, authenticated admin and API retain their root paths. Studio sources live under `studio/`. Source changes and their consuming UI/API can now be reviewed in one PR.

## Imported source and privacy

The October 2 source import uses both repositories’ remote `main` revisions, recorded in `repository-consolidation.json`. A merge commit retains both original histories and imports Studio under a prefix without rewriting its commits. At that commit, `HEAD:studio` exactly equals the original Studio tree. Later integration changes update commands, export provenance, build boundaries and preparation-unit paths. `studio/docs/import-manifest.json` and the original cutover receipt remain historical evidence.

Gitea and the existing GitHub organization copy were made private and read back through their authenticated APIs. Anonymous repository API requests were denied (Gitea 403, GitHub 404). The GitHub push mirror reported an existing OAuth workflow-scope rejection; private visibility does not prove successful mirror synchronization. Recheck visibility and every configured mirror before pushing private materials to another destination.

## Development and verification

From the repository root:

```sh
rtk proxy make check-studio check-studio-automation
rtk proxy make studio-export
rtk proxy make studio-export-left-field
```

`studio-export` creates `studio/runtime/studio/`, which is ignored by Git, and copies only the explicit public SUBCULT selection. The Left Field command is a separate explicit selection. Export provenance now names this repository and paths under `studio/`. Private export destinations inside the repository are restricted to `studio/runtime/`; public directories and application source directories are rejected. External private bundle destinations remain supported.

The frontend Docker build copies only its application inputs, and `.dockerignore` excludes `studio/` and private runtime bundles. Vite blocks direct development-server requests to those paths. Tailwind scans only the application source, public content and entry HTML, so importing private preview pages cannot alter the website CSS. The API continues using an authenticated, allowlisted private bundle. Studio CI verifies exports, asset hashes, posting snapshot redaction and disposable preparation-job tests. Existing site CI fetches only public LFS assets; Studio CI fetches Studio assets.

## Activation gate

The source import does not activate installed consumers. Both primary checkouts contained uncommitted work when inspected. They were preserved; the imported revisions are committed remote `main`, not snapshots of those edits. Some work may already have landed through other branches. Compare each dirty file against the combined branch before carrying it forward, so older local bytes do not overwrite newer merged work.

Before making the combined checkout the live source:

1. Complete the consolidation PR checks. Preserve both original repositories and active worktrees. Coordinate outstanding changes and PRs so they land in the combined source or have an explicit preserved handoff.
2. Bring the canonical site checkout to the combined revision without resetting its dirty work. Verify LFS objects and all Studio checks there. Use `/home/onnwee/Work/Subcult/subcult-tv/studio` as the canonical Studio destination; task worktrees are not runtime authorities.
3. Inventory current preparation timers, installed unit links, compatibility symlinks, ongoing runs, runtime state and recovery copies. Preserve a dated receipt and source-byte comparison. Wait for active runs to finish before changing consumers. SQLite, locks, receipts and credentials stay in their existing locations.
4. Retarget the seven original compatibility paths recorded in `studio/docs/cutover-receipt.json` and the installed preparation-unit links to the corresponding paths under the combined Studio directory. Preserve the old targets in the activation receipt. Unit sources already retain the existing calendars and point to the new canonical root; the discovery inbox also targets that root. Reload the user systemd configuration after changing installed links. Preserve enabled state and schedules.
5. Run `rtk proxy make -C studio check-cutover` from the canonical combined checkout. Compare effective timer calendars and state paths with the pre-cutover receipt. Verify a natural scheduled preparation run and its resulting source paths and receipts. Publication stays disabled.
6. Export a fresh private bundle for the actual API host, retain the previous bundle, and verify authenticated catalog/assets plus anonymous rejection. Website deployment and database migration are separate from repository activation.
7. Update canonical Operations documentation and development-profile consumers. Archive the old Studio repository only after its outstanding work and live consumers have been accounted for. Keep its checkout and recovery history until retirement is independently verified.

The seven-path receipt lists original destinations for provenance. `check-cutover` now resolves those source suffixes against the current Studio directory, so it checks the new destination after activation. It intentionally fails while installed consumers still point to the old checkout.

## Recovery

Before activation, recovery means closing or reverting the consolidation PR; installed consumers are unaffected. After activation, restore only the unit links and compatibility targets recorded in the dated activation receipt, reload systemd and verify the original source path. Preserve drafts and receipts created after activation. Revert a deployed application before restoring its prior private bundle where their formats differ. Never replace runtime state with the source snapshot or reset either dirty primary checkout.

## Local verification on October 2

The isolated combined worktree passed 70 frontend tests, lint, production build, catalog validation, six Studio export/snapshot checks, 37 preparation-job tests, Go tests without a configured integration database, Git LFS integrity and whitespace checks. A disposable export contained twelve brands, seventeen media assets and 590 references; both public exporter provenance files resolved to matching source and target hashes under the combined repository. HTTP requests for existing private Studio files and an existing temporary runtime file returned 403 through both ordinary Vite paths and `/@fs`.

The frontend Docker build stage completed with a roughly 4 MB application context. Inspection of that image confirmed that `/app/studio`, `/app/runtime` and `/app/dist/studio` were absent. Task-owned Vite processes were stopped after checking the boundary. These observations do not prove hosted CI, live authentication, production deployment or installed-consumer cutover.
