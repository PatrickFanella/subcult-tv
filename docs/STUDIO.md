# Studio integration

The authenticated `/admin/studio` workspace consumes private production sources from this repository’s `studio/` area. The Go API reads an exported bundle through `STUDIO_ROOT`; it does not serve the source directory as a public tree.

## Export and configure

From the repository root:

```sh
rtk proxy make check-library check-studio
rtk proxy make studio-export
```

The default private bundle is `studio/runtime/studio/`. It contains the brand/media catalog, content-addressed assets, design-reference records and a redacted posting snapshot. The separate public export contains the explicit SUBCULT mark/font selection and source hashes. Left Field uses `make studio-export-left-field`.

For another private destination or receipt snapshot:

```sh
rtk proxy python3 studio/scripts/export_studio.py --output /absolute/private/studio-bundle --posting-state /absolute/private/social-posting-state
```

Only receipt-bearing completed runs supply draft copy. Without a state directory, the posting snapshot is explicitly disconnected. Exporting does not run jobs, write state or publish. Re-export after preparation runs to refresh the observation.

Configure `STUDIO_ROOT` for the API host. `docker-compose.studio.yml` mounts a bundle read-only using `STUDIO_BUNDLE_ROOT`. The bundle is outside nginx’s public document root. The optional status overlay uses `STUDIO_RECEIPT_ROOT` for bounded historical receipts; the full runner state is unnecessary.

Private destinations inside the repository are restricted to `studio/runtime/`. Vite denies direct source/runtime file requests, the frontend Docker context excludes Studio, and Tailwind scans application inputs explicitly. Authentication and the catalog hash allowlist remain the private asset boundary.

## Library and references

The exported production library currently has twelve brands and seventeen media records. Approved Patrick logo treatments come from `studio/branding/patrick/logo-selection.json`; unapproved treatments are excluded. Metadata includes media rights, source descriptions and review status.

The reference catalog has 1,404 records: 38 website studies, 24 curated style studies and all 1,342 Refero exports in the completed acquisition manifest under `studio/references/`. The exporter supplies `references.json` plus content-addressed screenshots and attachments. These assets are not part of the public brand selection.

Migration `004_studio_references` adds searchable reference records, tags, links and import receipts. The API indexes the bundle on startup when `STUDIO_ROOT` is set. To update a running database explicitly, use `go run ./cmd/studio-index` from `api/` with the intended database and bundle environment. Preserve prior bundles and indexed assets during rollout.

The API search supports `q`, repeated AND-matched `tag`, `collection`, `sort`, `page` and `per_page` capped at 48. Supporting Markdown, JSON and CSS are plain-text attachments; UI Markdown rendering disables raw HTML. Authenticated routes are listed in [API contracts](API.md).

## Posting and source authority

The operations view observes a prepared queue, media requirements, open checks and past runs. It does not approve, schedule or publish social posts. A receipt is historical evidence, not live timer health or provider delivery. Site article CRUD remains a separate application feature.

Installed preparation jobs and compatibility links still use the original Studio checkout until [repository consolidation activation](REPOSITORY-CONSOLIDATION.md). This source refresh does not change schedules, locks, SQLite state or provider credentials. Publication remains disabled.

## Rollback

Keep the previous application revision and private bundle. Where bundle/database formats differ, roll back the application before removing new reference tables. Changing a bundle does not delete indexed database records. Preserve assets still referenced by retained records. Reverting this source integration does not require restoring preparation state, since it has not switched installed consumers.
