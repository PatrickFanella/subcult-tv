# SUBCULT Studio

Private source repository for SUBCULT branding, media and social production. The interface belongs at `/admin/studio` in the separate `subcult-tv` repository. `scripts/export_studio.py` prepares its private browsing bundle and an explicit public SUBCULT asset selection. Scheduled jobs retain their existing runtime paths.

## Contents

- `branding/2026-10-01-packs/`: current eight-brand library, editable masters, fonts and licenses, generators, selected alternatives, textures, preview pages and audit reports.
- `branding/2026-10-01-review/`: earlier design comparisons.
- `media/library/`: social media catalog, original captures, generated artwork, video masters, edits and recipes.
- `content/social/`: plans, content bank, claims, guidance, watchlists and draft records.
- `content/patreon/`: related Patreon plans and release materials.
- `automation/social-posting/`: imported planner, radar, media tools and unit templates.
- `preview/legacy-branding/`: earlier banners and social-link pages.
- `history/review-worktree/`: differing review-worktree files, preserved separately from the canonical vault import.
- `docs/import-manifest.json`: source paths and SHA-256 hashes.

SVG, code and metadata use ordinary Git. PNG, JPEG, WebP, video and fonts use Git LFS. ZIPs, caches, credentials and runtime state are excluded. Generated exports are retained in this initial migration for review; future export policy can be refined without losing the imported source.

## Preview and generators

Run `make preview` and open `http://127.0.0.1:18770/`. The entry page links to the brand gallery, media library and earlier comparisons.

Use `make package` to rebuild the brand/starter download archives after a fresh clone. Imported ZIPs are local generated copies, not Git history.

Brand generation: `cd branding/2026-10-01-packs && BRAND_ONLY=patchwork python build_packs.py`. Tools used by the imported generators include Python/Pillow, rsvg-convert, Inkscape, fontconfig and ffmpeg. They use relative paths inside the imported library.

## Runtime boundary

The live jobs still use the Ars Malefica checkout and installed files in `~/.local/share/social-posting`. The imported config is named `config.legacy.example.json`; there is no active default config here. Do not install the imported systemd templates before replacing their vault paths and testing the cutover. Existing approval and publication boundaries remain in force.

This repository is private. Public site assets must be explicitly selected; drafts, account configuration and the full media library must not be copied into a public build.

See `docs/MIGRATION.md` for what was copied and what remains.

## Admin and public-site exports

Run `python scripts/export_studio.py --output /absolute/private/studio-bundle --site-root /absolute/subcult-tv-checkout`. The private bundle holds all eight brand previews/guides/outlined logos and the nine catalogued media assets. It excludes social drafts, account config, runner source and runtime state. The separate public selection contains only SUBCULT marks and licensed fonts, with source hashes recorded in the site repository.

The site API consumes the bundle through `STUDIO_ROOT`; its authenticated `/admin/studio` interface is implemented in the companion `subcult-tv` work. An optional read-only `latest.json` receipt directory supplies past-run status. See the site's `docs/STUDIO.md` for configuration and rollback. A generated bundle is deployment input, not a live runtime cutover.
