# SUBCULT Studio

Read the global RTK and homelab instructions. Preserve user-edited SVG masters and unrelated work. The repository root owns the admin interface and authentication; `studio/` owns production sources.

Brand packs are in `brands/<slug>/`; their generators, shared fonts and editable masters are in `brand-tools/`. Studies and reviews are in `studies/`, and `studies/archive/` holds inactive references. Use `docs/history/import-manifest.json` to trace imported bytes. Capture provenance when changing a source. Edit generators and authoritative masters together; regenerate their derivatives and validate SVG parsing, rendered exports and contrast where relevant.

Keep credentials and runtime state out of Git. Keep drafts, approval, scheduling, dispatch and delivery distinct. This repository does not authorize social publication. Installed preparation units run from this directory or from release bundles copied from it. Preserve runtime state, schedules and recovery evidence when changing them. Runner output goes to `content/social/drafts/`.

Git LFS owns binary media and fonts. ZIP archives and caches are generated artifacts. Avoid regenerating unrelated brands. Apply the unslop skill to prose and documentation.
