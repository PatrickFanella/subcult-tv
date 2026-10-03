# Working on SUBCULT

Create a branch in this private repository. Keep source and consumer changes in the same PR. Read `AGENTS.md` and, for production materials, `studio/AGENTS.md`. Preserve unrelated edits and active worktrees.

## Development

Follow [development setup](docs/DEVELOPMENT.md). `make setup` installs the lockfile dependencies; `make dev` uses an explicit local Compose profile. Production Compose and NUC bindings are separate.

Run the checks for the areas you change:

```sh
rtk proxy make check
rtk proxy make test
rtk proxy make build
```

Go database integration requires a disposable `TEST_DATABASE_URL`; hosted CI supplies one. Studio preparation tests create disposable state and do not run jobs against installed schedules. `make -C studio check-cutover` is a host-specific activation check, not a portable test.

## Source changes

Edit branding masters and their generators together. Render only affected brands, then refresh their manifests. Preserve owner-edited SVG geometry and layers. Keep required fonts and licenses in standalone packs. Media additions need rights, provenance, hashes and alt text. See [asset policy](docs/ASSETS.md).

Public assets need an explicit exporter selection. Never place Studio drafts, account configuration or private browsing bundles under `public/` or `dist/`. Runtime state and credentials stay outside Git.

Keep generated archives, caches and build output in their documented ignored directories. Retired source studies belong under `studio/branding/archive/`; remove obsolete generated previews and unused code after checking their consumers. Do not rewrite historical import receipts to make current source checks pass.

## Review

Describe what changed and how behavior differs. Include the commands that passed, any skipped integration checks and remaining runtime work. Use a merge commit for the initial repository consolidation so Studio’s imported history remains reachable. Later changes can follow the repository’s normal merge policy.

Write docs plainly. Public copy follows `studio/content/VOICE.md`. Claims about production, provider delivery or scheduled jobs need evidence from that destination; local tests establish local behavior.
