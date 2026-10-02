# Studio integration

`/admin/studio` uses the existing site login. The Go API reads a private exported bundle from `STUDIO_ROOT`. It serves brand/media metadata and allowlisted asset IDs through authenticated routes. It never serves the Studio repository as a public directory.

The initial interface includes eight brand packs, their guides and outlined logos, plus the nine catalogued media assets. Media review status, rights and source descriptions remain visible. This interface does not edit masters or approve, schedule or publish social posts.

## Prepare the bundle

Run from the `subcult-studio` checkout:

```sh
rtk proxy python scripts/export_studio.py --output /absolute/private/studio-bundle --site-root /absolute/subcult-tv-checkout
```

The private bundle contains `catalog.json` and content-addressed assets. The site selection copies only SUBCULT marks and licensed fonts into `public/`, with hashes in `docs/subcult-brand-provenance.json`. Imported masters remain unchanged. Re-export after an intentional source change; review the public selection diff separately. Resolve Git LFS media before exporting.

Set `STUDIO_ROOT` for the API, or add `docker-compose.studio.yml` to the existing Compose invocation and supply `STUDIO_BUNDLE_ROOT`. The bundle must exist on the API host. The bind mount is read-only. The export is private and must never be placed under nginx's public document root.

## Optional job receipt

`STUDIO_STATE_ROOT` points to a read-only directory containing the runner's `latest.json`. The optional `docker-compose.studio-status.yml` mounts it using `STUDIO_RECEIPT_ROOT`. A copied receipt is enough; the full runner state is unnecessary. The API returns only mode, status, week, run ID, draft count and timestamps. Provider traces, error details and source paths are omitted.

The UI labels missing records and receipts older than 24 hours. A receipt records a past run; it does not prove a timer is currently running or a post was approved or delivered. Existing jobs still run from their original paths. This integration does not migrate or activate them.

## Local review

For isolated development, point Vite's `DEV_API_TARGET` at the disposable API origin and set the API's `STUDIO_ROOT` to an exported bundle. Set `BIND_HOST=127.0.0.1` for the local API. Use a disposable database and test admin account. No production credentials are needed. The default Vite API target remains localhost:8080.

Verification covers the frontend build/lint/tests, Go tests, and a real local login backed by PostgreSQL. Router tests cover anonymous rejection, unknown assets, filesystem symlink escapes and receipt field filtering. Production deployment and a live runner connection require separate verification.

## Rollback

Revert the site implementation and selected public assets together. Remove the optional Studio Compose overlays/environment entries to disconnect the private library. Existing social services and source paths require no rollback because this implementation does not change them. Preserve the previous bundle until the replacement has been verified.
