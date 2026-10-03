# SUBCULT Studio

Read the global RTK and homelab instructions. Preserve user-edited SVG masters and unrelated work. The repository root owns the admin interface and authentication; `studio/` owns production sources.

Use `docs/history/import-manifest.json` to trace imported bytes. Studio files in this directory become authoritative after the consumer cutover in `../docs/REPOSITORY-CONSOLIDATION.md`. Preserve existing vault compatibility symlinks until that cutover. Snapshots under `branding/archive/` are inactive references. Capture provenance when changing a source. Edit generators and authoritative masters together; regenerate their derivatives and validate SVG parsing, rendered exports and contrast where relevant.

Keep credentials and runtime state out of Git. Keep drafts, approval, scheduling, dispatch and delivery distinct. This repository does not authorize social publication. Installed preparation timers still use the original Studio checkout until the consolidation cutover is verified. The unit sources here target the new canonical `subcult-tv/studio/` path. Preserve runtime state, schedules and recovery evidence when changing them. Test migrations before switching consumers.

Git LFS owns binary media and fonts. ZIP archives and caches are generated artifacts. Avoid regenerating unrelated brands. Apply the unslop skill to prose and documentation.
