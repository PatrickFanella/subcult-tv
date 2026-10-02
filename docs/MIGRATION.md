# Source and runtime migration

Studio is the maintained source for branding, media, social plans, Patreon materials and social preparation automation. The initial import preserved canonical vault edits and differing review-worktree files. `import-manifest.json` records the initial bytes; `history/` and early design comparisons are dated references, not editing masters.

## Completed cutover, October 2, 2026

The Social Posts, Patreon and scripts/social-posting directories in the canonical Ars Malefica checkout and active T3 review worktree now link to Studio. The former Documents/subculture-collective/branding directory links to Studio branding. Inside content/social, Branding and Media Library link to the retained preview library and canonical media library. Existing local paths reach the same files rather than a second working copy.

The planner, radar, weekly review and W40 trial review use direct Studio paths. User units and the former installed runtime files link to their maintained sources. The tracked config resolves content and media from the repository; external product sources, state, credentials, schedules and publication restrictions are preserved. No social publication occurred during migration.

Verification: 37 disposable automation tests passed; the media audit validated nine assets; both existing managed draft sections matched their stored hashes. Effective unit paths and all four future timer starts were read back. The next natural run through the new paths still requires its own receipt.

`cutover-receipt.json` records each old path, authority and retired original. The recovery root is recorded in `cutover-recovery-path.txt`. Recovery files are inactive and outside working directories. Absolute compatibility links are host-specific; other hosts need their own Studio checkout and runtime configuration.

## Recovery

Stop the four social timers and confirm their services are idle before changing runtime paths. Preserve any edits made after cutover. Use the receipt to replace only the listed compatibility links with their retired originals, reconciling newer Studio edits first. Restore the saved unit files and installed-runtime files from the recovery root, preserving current SQLite state and credentials. Run systemctl --user daemon-reload, verify effective paths and configuration, then resume the saved schedules. Do not restore unrelated vault files or discard Studio history. This recovery procedure is documented; a destructive rollback was not performed.

## Remaining product work

The planned /admin/studio interface belongs in subcult-tv. This migration establishes its source repository; it does not implement the interface or a publication dispatcher.
