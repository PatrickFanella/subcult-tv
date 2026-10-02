# Studio integration

`/admin/studio` uses the existing site login. The Go API reads a private exported bundle from `STUDIO_ROOT`. It serves brand/media metadata and allowlisted asset IDs through authenticated routes. It never serves the Studio repository as a public directory.

The brand library reads the exported catalog, guides, fonts, tokens, logos, social templates, video assets and artwork. The current source export contains eleven brands and seventeen media assets, including the seven approved Patrick__Eff waveform treatments. Asset search, category filters, preview backgrounds and authenticated downloads are available. Media review status, rights and source descriptions remain visible. This interface does not edit masters or approve, schedule or publish social posts.

## Prepare the bundle

Run from the `subcult-studio` checkout:

```sh
rtk proxy python scripts/export_studio.py --output /absolute/private/studio-bundle --site-root /absolute/subcult-tv-checkout
```

The private bundle contains `catalog.json` and content-addressed assets. The site selection copies only SUBCULT marks and licensed fonts into `public/`, with hashes in `docs/subcult-brand-provenance.json`. Imported masters remain unchanged. Re-export after an intentional source change; review the public selection diff separately. Resolve Git LFS media before exporting.

Set `STUDIO_ROOT` for the API, or add `docker-compose.studio.yml` to the existing Compose invocation and supply `STUDIO_BUNDLE_ROOT`. The bundle must exist on the API host. The bind mount is read-only. The export is private and must never be placed under nginx's public document root.

## Design references

`/admin/studio/references` adds a searchable grid/list library to Studio. The source files belong to `subcult-studio/references/`. Its private exporter adds `references.json` and content-addressed screenshots, design documents, tokens and measurement files to the existing bundle.

Migration `004_studio_references` creates reference records, normalized tags, reference/tag links and an import receipt table. A generated PostgreSQL search vector covers names, summaries, guide text and tags, with a GIN index. Collection, update-time and tag lookup indexes support filters and sorting. Search uses bound parameters; multiple tags use AND matching. Results are paginated and omit full documents until a detail is opened.

With `STUDIO_ROOT` configured, API startup imports `references.json` transactionally. A bundle without that file remains compatible. Malformed reference exports fail startup rather than silently serving an outdated index. A repeatable import skips an unchanged export digest, upserts changed records and tags, and preserves prior records omitted from partial snapshots. A changed bundle must be reindexed:

```sh
# From api/, with DATABASE_URL and STUDIO_ROOT configured for the intended destination:
rtk proxy go run ./cmd/studio-index
```

The authenticated endpoints are `GET /api/v1/admin/studio/references`, `/references/facets` and `/references/{id}`. Search parameters are `q`, repeated `tag`, `collection`, `sort` (`relevance`, `name`, `newest`), `page` and `per_page` (capped at 48). All use private/no-store responses. Supporting files use the existing authenticated asset route; Markdown, JSON and CSS are returned as plain-text attachments. Markdown in the interface uses react-markdown with raw HTML disabled; source code examples are displayed as text.

Keep previous private bundles for rollback. Roll back the application before optionally applying `004_studio_references.down.sql`, which removes only the new reference tables. Changing the bundle alone does not delete database records. Retain previously exported assets when retaining indexed records; the exporter does not prune assets. Resolve LFS files before exporting. No reference assets are copied into public site assets.

Local regression checks include isolated PostgreSQL imports and search, anonymous rejection, component interactions, empty/error/retry states, and inert Markdown HTML. Run the database test with `TEST_STUDIO_DATABASE_URL` pointing to a disposable database. Production and rendered browser checks require separate evidence.

## Optional job receipt

`STUDIO_STATE_ROOT` points to a read-only directory containing the runner's `latest.json`. The optional `docker-compose.studio-status.yml` mounts it using `STUDIO_RECEIPT_ROOT`. A copied receipt is enough; the full runner state is unnecessary. The API returns only mode, status, week, run ID, draft count and timestamps. Provider traces, error details and source paths are omitted.

The UI labels missing records and receipts older than 24 hours. A receipt records a past run; it does not prove a timer is currently running or a post was approved or delivered. The preparation jobs now run from Studio through its documented source cutover. This site integration does not change their paths or schedules, and it does not activate jobs.

## Local review

For isolated development, point Vite's `DEV_API_TARGET` at the disposable API origin and set the API's `STUDIO_ROOT` to an exported bundle. Set `BIND_HOST=127.0.0.1` for the local API. Use a disposable database and test admin account. No production credentials are needed. The default Vite API target remains localhost:8080.

Verification covers the frontend build/lint/tests, Go tests, and a real local login backed by PostgreSQL. Router tests cover anonymous rejection, unknown assets, filesystem symlink escapes and receipt field filtering. Production deployment and a live runner connection require separate verification.

## Rollback

Revert the site implementation and selected public assets together. Remove the optional Studio Compose overlays/environment entries to disconnect the private library. Existing social services and the documented Studio cutover require no rollback because this site implementation does not change them. Preserve the previous bundle until the replacement has been verified.


## Posts operations dashboard

`/admin/posts` opens the automation dashboard. The **Site articles** tab preserves the existing blog editor and its publishing behavior. Social preparation remains read-only: draft copy, account cadence, configured timer definitions, receipt history, media requirements and open checks are displayed separately from approval, scheduling and delivery.

From Studio, run `python scripts/export_studio.py --output /absolute/private/studio-bundle --posting-state /absolute/private/social-posting-state`. This reads successful receipt-bearing `runs/*/result.json`, `latest.json` and `radar-latest.json` into a bounded `posting.json`. It omits prompts, events, provider traces, receipt filesystem paths and runtime credentials. The export never modifies runner state, jobs, timers or drafts. Refresh the exported bundle after new preparation runs; refreshing the browser reloads the bundle and does not run a job. Configured calendars describe intended starts and are not live systemd health checks.

The authenticated `GET /api/v1/admin/studio/posting` endpoint reads that snapshot through the same read-only Studio root. It validates the observation timestamp, marks snapshots older than 24 hours stale, and labels every draft unapproved. Missing or malformed snapshots return a retryable unavailable state. Delivery remains unverified because preparation results contain no provider delivery receipts. Copying a draft does not approve or submit it.

The brand asset route also serves catalog-listed font, license, CSS and token files as downloads. Their exact content-addressed paths remain constrained to the export root. Private assets are fetched with the existing admin token; the UI never places credentials in download URLs.

Local verification: Studio's `make check-studio`, the site's `npm test`, `npm run lint`, `npm run build`, and `cd api && go test ./...`. Use a disposable PostgreSQL database and local review account for browser checks. Deployment needs both the site implementation and a freshly exported private bundle; no production service or timer is switched by these source changes.
