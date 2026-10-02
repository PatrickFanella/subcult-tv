# SUBCULT Studio

Private source repository for SUBCULT branding, media and social production. Studio is the source of truth for these materials and the scheduled preparation jobs. The authenticated `/admin/studio` interface belongs to the separate `subcult-tv` repository. `scripts/export_studio.py` prepares its private browsing bundle and an explicit public SUBCULT asset selection.

## Contents

- `branding/2026-10-01-packs/`: current eleven-brand library, editable masters, fonts and licenses, generators, selected alternatives, textures, preview pages and audit reports.
- `branding/2026-10-01-review/`: earlier design comparisons.
- `media/library/`: social media catalog, original captures, generated artwork, video masters, edits and recipes.
- `content/social/`: plans, content bank, claims, guidance, watchlists and draft records.
- `content/patreon/`: related Patreon plans and release materials.
- `automation/social-posting/`: active planner, radar, media tools, configuration and user-unit sources.
- `preview/legacy-branding/`: earlier banners and social-link pages.
- `history/review-worktree/`: differing review-worktree files, preserved separately from the canonical vault import.
- `docs/import-manifest.json`: source paths and SHA-256 hashes.

SVG, code and metadata use ordinary Git. PNG, JPEG, WebP, video and fonts use Git LFS. ZIPs, caches, credentials and runtime state are excluded. Generated exports are retained in this initial migration for review; future export policy can be refined without losing the imported source.

## Preview and generators

Run `make preview` and open `http://127.0.0.1:18770/`. The entry page links to the brand gallery, media library and earlier comparisons.

Use `make package` to rebuild the brand/starter download archives after a fresh clone. Imported ZIPs are local generated copies, not Git history.

Brand generation: `cd branding/2026-10-01-packs && BRAND_ONLY=patchwork python build_packs.py`. Tools used by the imported generators include Python/Pillow, rsvg-convert, Inkscape, fontconfig and ffmpeg. They use relative paths inside the imported library.

## Runtime boundary

The live jobs run directly from `automation/social-posting/` with the tracked, credential-free `config.json`. User unit files and former installed runtime paths are symlinks to this repository. SQLite, locks, receipts and provider credentials remain in their existing protected locations outside Git. Publication remains disabled.

The Social Posts, Patreon and social-posting script directories in Ars Malefica are symlinks to Studio. The former Documents branding directory also links here. Editing through those paths edits the same physical source. These absolute compatibility links are specific to Kvant; another host must clone Studio and configure its own paths.

Run `make check-automation` for disposable runner tests and `make check-cutover` for local source/runtime link checks. `make check-import` verifies the original import hashes and is a historical check: intentional edits since the initial commit will differ.

This repository is private. Public site assets must be explicitly selected; drafts, account configuration and the full media library must not be copied into a public build.

See `docs/MIGRATION.md` for migration evidence and recovery instructions.


See `docs/MIGRATION.md` for migration evidence and recovery instructions.

## Admin and public-site exports

Run `python scripts/export_studio.py --output /absolute/private/studio-bundle --site-root /absolute/subcult-tv-checkout`. The private bundle contains the brands listed in `brands.json`, their previews/guides/outlined logos, and every media asset in `media/library/catalog.json` (17 as of October 2, 2026). It excludes social drafts, account config, runner source and runtime state. The separate public selection contains only SUBCULT marks and licensed fonts, with source hashes recorded in the site repository.

The site API consumes the bundle through `STUDIO_ROOT`. Its authenticated `/admin/studio` interface is implemented in the companion `subcult-tv` source. An optional read-only `latest.json` receipt directory supplies past-run status. See the site's `docs/STUDIO.md` for configuration and rollback. The export and admin integration preserve the documented preparation-job cutover; a generated bundle is deployment input and does not switch runtime paths.
