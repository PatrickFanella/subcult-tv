# Initial extraction

This repository was created beside `/home/onnwee/Work/Subcult/subcult-tv` by copying the current branding library, canonical social media library, social/Patreon notes, preview pages and runner source. The original files were not moved or deleted. Uncommitted canonical vault edits were preserved in the import. Differing files from the active Ars Malefica review worktree are retained under `history/review-worktree/`.

The manifest records every imported file’s original SHA-256 hash. The only import-path rename is the runner config: `config.json` became `config.legacy.example.json`, to prevent default invocations from writing to the live vault. ZIPs remain in the local copy but are ignored by Git; caches and transient media locks were omitted.

## Pending cutover

1. Replace hard-coded vault paths in the runner and radar with explicit content/media roots. Confirm required external product/task sources remain available.
2. Validate draft generation in disposable state, media catalog identity and original-vs-derived asset references.
3. Add `/admin/studio` in `subcult-tv`, initially for brand/media browsing and job status.
4. Update installed runtime and unit paths together, with backups and a rollback test. Preserve the existing approval/publication boundaries.
5. Replace vault working copies with maintained index notes only after all consumers and links are verified.

No active job, live site, social account or preview server was switched by this import. Existing Obsidian links are source content and have not been rewritten into website routes.
