# Assets and generated artifacts

`studio/branding/library/` owns production packs, generators and editable source references. `studio/branding/patrick/` owns Patrick’s selected design system and approved waveform treatments; its production copies are exported into the library. Owner-authored SVG masters retain their geometry and layer order.

## What stays in Git

Keep editable masters, generators, current SVG/PNG/video exports consumed by galleries or the authenticated library, brand tokens and guides, font licenses, media catalogs and original media, reference documents/screenshots and provenance records. Binary media and fonts use Git LFS.

Repeated per-brand fonts and Patrick production copies are intentional: standalone packs and the authenticated exporter consume them. Deduplicating them with symlinks would change packaging and asset-containment behavior. `studio/references/refero-archive/` is an active source for the private reference catalog despite its name; it is not a cache.

## What is generated

Frontend output is `dist/`; the local API binary is `api/server`. Python bytecode, font caches, download caches, credentials and runtime state are ignored. Private exports live under `studio/runtime/studio/`. Download ZIPs live under `studio/runtime/packages/`, never inside the production library.

```sh
rtk proxy make studio-package
```

Packaging excludes nested ZIPs and caches. Rebuilding a brand also places its generated archive under runtime storage. Brand rendering uses a portable fontconfig file with paths relative to that file; it no longer depends on the original workstation’s absolute source directory.

## Editing and checking

Run generators with `BRAND_ONLY=<slug>` where supported. Update the affected authoritative source and its derived exports together. Do not rebuild other brands to tidy files. Refresh the affected pack’s `asset-manifest.json`, preserving image dimensions and other recorded metadata. The library-wide manifest records the library files, and Patrick’s source manifest records its separate source system.

`make check-library` checks current manifest hashes and SVG parsing. The one-time cleanup preservation proof uses `python3 studio/scripts/check_library.py --check-cleanup-originals`; it is separate from normal checks so future approved source changes can update their manifests. `make check-studio` checks export hashes, approved logo inclusion, public/private destination boundaries and snapshot redaction. `make check-library` and `make check-studio` describe current files; `make check-import`, described below, covers the original import.

## Historical sources and recovery

Retired design systems, reviews and original artwork are grouped under `studio/branding/archive/`; they are excluded from production exports. Earlier profile renders and obsolete study generators were removed after caller inspection. Original SVGs remain. The [cleanup receipt](cleanup-receipt.json) records the pre-cleanup revision, moves, removed-file hashes and retained SVG hashes.

Studio’s original import receipt is immutable under `studio/docs/history/`. `make check-import` verifies its tracked blob/LFS identities against the original import commit, not against renamed or intentionally edited current files. Git history also retains deleted artifacts if a specific original needs recovery. Do not restore an entire old tree over current sources.
