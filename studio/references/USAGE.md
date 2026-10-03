# Design reference library

This directory contains a copied snapshot of the library in `~/Documents/Design References`. The original remains available. `import-manifest.json` records the source path, import time, file sizes and SHA-256 hashes. `catalog.json` describes the searchable records, screenshots, tags and supporting files. Binary screenshots use this repository's Git LFS rules.

The refreshed snapshot contains 1,404 records: 62 curated site/style studies and all 1,342 successfully downloaded Refero exports listed in the completed acquisition manifest. It includes 4,566 source files and 1,431 images. The acquisition completed on October 2, 2026; this snapshot was refreshed on October 3. This covers the downloaded sitemap selection, not a claim that every item in Refero's full catalog is available. Cache and lock files are excluded.

## Refresh from later downloads

From the combined repository root:

```sh
rtk proxy python3 studio/scripts/import_references.py
rtk proxy python3 studio/scripts/export_studio.py --output /absolute/private/studio-bundle
```

The importer reads the downloader's atomically written manifest once and verifies each completed export and screenshot against that snapshot. It does not modify or stop the downloader. Reimporting copies later completed records; it does not prune earlier files. Curated collections are copied with their evidence, supporting files and collection indexes.

The export produces `references.json` alongside the existing private `catalog.json`. Documents, tokens and screenshots become content-addressed assets. Keep the entire export private. Reference assets are not added to the public brand selection.

The Go API in this repository applies migration `004_studio_references` and indexes this export on startup when `STUDIO_ROOT` is configured. To update a running API's database without restarting it, run from the site's `api/` directory with its database connection and private bundle path configured:

```sh
rtk proxy go run ./cmd/studio-index
```

`DATABASE_URL` and `STUDIO_ROOT` must refer to the intended database and exported bundle. Review that destination before running the command. Imports upsert records and tags in one transaction and retain existing records omitted by a partial snapshot. An unchanged export is skipped using its digest.

## Browse

The authenticated page is `/admin/studio/references`, linked from Studio and the admin navigation. It offers grid/list views, full-document search, collection filters, tags, sorting and pagination. Multiple selected tags must all match. Filter and view state are stored in the page URL. Opening a reference displays its study, screenshots, source/evidence notes and downloadable supporting files.

Curated tags follow the original study categories. Refero tags are keyword aids derived from its reference prose; they are not independently verified classifications. Refero screenshots retain an unknown original capture date. The studies describe their evidence limits and reconstructed recommendations. Imported material remains reference material; inclusion does not grant reuse rights.

This implementation has local database/API and frontend test evidence. Live deployment and rendered browser verification are separate checks.
