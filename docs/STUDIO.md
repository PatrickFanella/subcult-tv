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

`studio/scripts/sync_posting_dashboard.py` transfers only the bounded, redacted `posting.json` to the currently mounted NUC bundle and verifies its SHA-256. It also sends the prepared review JPEGs referenced by current, unapproved Instagram drafts into `posting-media/` beside `posting.json`: each must match its SHA-256 and stay under 900 KB, with 40 MB in total. Images no longer referenced are removed. The API serves them only to an authenticated admin, by hash, at `/api/v1/admin/studio/posting-media/{sha256}`. If the installed exporter predates image export, the script syncs the snapshot alone. Kvant's `posting-dashboard-sync.timer` refreshes it every five minutes while Kvant is running, with persistent catch-up. Its maintained unit sources are under `studio/automation/postiz-dashboard/`; the installed script is `/home/onnwee/.local/share/posting-dashboard/sync_posting_dashboard.py`. Runner SQLite, tokens, prompts and source files stay on Kvant. This adds a read-only snapshot consumer without changing preparation timers or their source checkout.

Configure `STUDIO_ROOT` for the API host. `docker-compose.studio.yml` mounts a bundle read-only using `STUDIO_BUNDLE_ROOT`. The bundle is outside nginx’s public document root. The optional status overlay uses `STUDIO_RECEIPT_ROOT` for bounded historical receipts; the full runner state is unnecessary.

Private destinations inside the repository are restricted to `studio/runtime/`. Vite denies direct source/runtime file requests, the frontend Docker context excludes Studio, and Tailwind scans application inputs explicitly. Authentication and the catalog hash allowlist remain the private asset boundary.

## Library and references

The exported production library currently has twelve brands and seventeen media records. Approved Patrick logo treatments come from `studio/branding/patrick/logo-selection.json`; unapproved treatments are excluded. Metadata includes media rights, source descriptions and review status.

The reference catalog has 1,404 records: 38 website studies, 24 curated style studies and all 1,342 Refero exports in the completed acquisition manifest under `studio/references/`. The exporter supplies `references.json` plus content-addressed screenshots and attachments. These assets are not part of the public brand selection.

Migration `004_studio_references` adds searchable reference records, tags, links and import receipts. The API indexes the bundle on startup when `STUDIO_ROOT` is set. To update a running database explicitly, use `go run ./cmd/studio-index` from `api/` with the intended database and bundle environment. Preserve prior bundles and indexed assets during rollout.

The API search supports `q`, repeated AND-matched `tag`, `collection`, `sort`, `page` and `per_page` capped at 48. Supporting Markdown, JSON and CSS are plain-text attachments; UI Markdown rendering disables raw HTML. Authenticated routes are listed in [API contracts](API.md).

The reference browser shows 24 records per page with previous/next controls and a page selector above the results. Thumbnails are fetched near the viewport and reused in a bounded, session-scoped memory cache. Studio asset GETs use a separate 500-request-per-minute IP budget and do not count toward the general 100-request API budget. Authentication and the asset allowlist still apply; login and public-form limits are unchanged.

## Posting and source authority

The operations view keeps the prepared queue separate from live PostyBirb scheduling and delivery. Prepared copy remains unapproved. Review for Instagram copies a draft into the composer; the owner selects an account, JPEG, caption and time, then approves that exact post. Scheduling requires an admin session and at least 24 hours of lead time, with a maximum of 90 days. Site article CRUD remains separate.

Configure these server-only variables to enable the connection:

```dotenv
POSTYBIRB_API_URL=https://subcult-patreon-postybirb:4008/api
POSTYBIRB_REMOTE_PASSWORD=<private remote password>
POSTYBIRB_CERT_SHA256=<pinned certificate fingerprint>
POSTYBIRB_INSTAGRAM_ACCOUNT_IDS=<Patrick account UUID>,<SUBCULT account UUID>,<CLPR account UUID>
```

Only the explicitly configured account UUIDs can be scheduled or observed. The initial composer supports one JPEG under 900 KB, 320–1440 pixels wide, with aspect ratio 4:5 through 1.91:1. Approval stores the image in the application database and uploads it privately to PostyBirb. The legacy approved-media endpoint is retained for recovery, but PostyBirb receives the JPEG directly. Private Studio exports remain authenticated. Database backups must include migration `005_social_schedules` and its approval records and media. Do not remove these records while queued posts still need their images.

Each submission has a durable request ID, provider identity and content hash. The private submission ID is saved before enabling a future SINGLE schedule; the adapter never starts immediate posting. Repeat submissions return the original receipt; concurrent submissions, changed content using the same ID, and uncertain provider responses cannot dispatch the same approval twice. A timeout requires reconciliation in PostyBirb before creating a new approval. Manage cancellation and edits in PostyBirb; the dashboard refreshes provider state every minute and shows a delivery link only when PostyBirb reports a published Instagram URL. A queued ID is scheduling evidence, not provider delivery.

Automatic approval is not enabled. A future automatic mode requires a separately reviewed policy for evidence, media, account mapping, limits and failures. The preparation runner's publishing flag remains false and its installed timers are unchanged.

Installed preparation jobs and compatibility links still use the original Studio checkout until [repository consolidation activation](REPOSITORY-CONSOLIDATION.md). This source refresh does not change schedules, locks, SQLite state or provider credentials. The preparation runner cannot dispatch posts; dashboard scheduling is a separate, human-approved path.

## Rollback

Keep the previous application revision and private bundle. Where bundle/database formats differ, roll back the application before removing new reference tables. Changing a bundle does not delete indexed database records. Preserve assets still referenced by retained records. Reverting this source integration does not require restoring preparation state, since it has not switched installed consumers.
