# SUBCULT.TV archive and portfolio evidence audit

Audited 2026-11-05 against clean, depth-one source snapshots in this directory. This is a source-and-hosted-CI review, not browser or deployment verification. The portfolio worktree was not modified.

## Decision summary

The five Arkhiv consumer products, Rekolekt, Prichal, and Backline have concrete implementation paths and a successful current-head Gitea run. Their public availability, playback, catalog population, sign-up state, and pilot operation still require separate runtime evidence.

Pirs is the exception. Its current code includes a separate, bounded Wasmtime host and a private event bridge, but its own qualification record says that a production plugin host and PDS hook support have not been run. Copy must describe it as *experimental, separate host research*, not a PDS that users can presently extend.

## Evidence levels and copy disposition

| Product | Current head / Gitea result | Source evidence | Copy disposition | Availability wording |
| --- | --- | --- | --- | --- |
| Arkhiv | `485495a64a87`; current-head runs successful | Mixed catalogue resolves reviewed print/audio/video representations; PDF reader, audio player, source links, download policy and scheduled collection controls are in `web/src/MixedArchive.tsx:37-75, 105-135`. | Keep the shared-engine relationship, but avoid implying a general public hub until the parent confirms its route and content. | `Archive engine and collection interface; public route pending runtime confirmation.` |
| Dedhed | `f5514499bec3`; successful | Calendar/search and date-detail paths call the API. Detail UI distinguishes playable, imported-not-playable and source-only items, and blocks relay for metadata-only records (`web/src/shows.tsx:56-100`). | The current “two reviewed recordings” number is not source-proven; keep the reviewed/access boundary, remove the count unless a runtime fixture confirms it. | `Listening pilot; playback availability is reviewed per recording.` |
| Lineage | `1c75cc8b8400`; successful | The consumer reads Arkhiv's source-catalog API, exposes artist/venue/date discovery, source snapshots, editorial history and an audio player. Unavailable imports retain metadata rather than promise playback (`web/src/App.tsx:914-1000, 1043-1088`; `web/src/StreamPlayer.tsx:7-41`). | Keep “artist, venue, date, credits and lineage”; keep the indexed-versus-playable distinction. | `Archive interface; recording availability varies by source and review.` |
| Riot Grrrl Zine Archive | `d6eb2f7d35ec`; successful | React catalogue fetches collections/documents/facets; reader searches `/api/assets/:id/search`, renders local PDFs and gates downloads by each variant (`web/src/App.tsx:112-385`, `web/src/Reader.tsx:10-22`, `web/src/Catalog.tsx:27-321`). | Supported, but “reviewed collection” does not prove all PDFs are public or populated. | `Public collection interface; each document variant is separately reviewed for access.` |
| Bill Nye TV | `e0140e9c7260`; successful | Branded consumer composes the shared viewer's on-demand player, library and scheduled replay controls. Its footer says the product uses preserved source MP4s (`web/src/App.tsx:1-45`; `web/src/ViewerTools.tsx:25-105`). | Keep independent/unaffiliated and source-context language. “Scheduled replay” is source-implemented; a working broadcast still needs browser/runtime proof. | `Independent archive viewer with on-demand and scheduled-replay interfaces; runtime playback unverified here.` |
| Democracy Now! TV | `9f15a5df95d2`; successful | Branded consumer composes the shared viewer; its footer explicitly says video is streamed from Internet Archive (`web/src/App.tsx:1-28`). Arkhiv's direct source resolver/playback path supports the boundary (`arkhiv/web/src/MixedArchive.tsx:49-75`). | Keep “independent,” “unaffiliated,” and “video streamed from Internet Archive.” | `Independent source-streaming archive viewer; runtime playback unverified here.` |
| Rekolekt | `3b7703eaa0db`; successful | FastAPI application has dedicated video, job, transcript, search and passage routers (`app/main.py`); concrete services sit under `app/transcripts/`, `app/search/` and `app/routes/passages.py`. It is an API/backend, not a shared public archive frontend. | Keep “headless backend,” “you deploy it,” “HasanAra owns its frontend.” Do not say Rekolekt itself provides browse pages. | `Self-hosted archive API/backend; no hosted sign-up claim.` |
| Prichal | `29d9128f0cc2`; successful | Separate management/auth, organization invitations and restricted node-agent provisioning exist. Managed reconciliation is explicitly agent-policy gated (`backend/internal/nodeagent/managed.go:89-202`); auth admission tests cover paused sign-up. | Keep “private preview / no sign-up.” Do not imply that a visitor can obtain a PDS today; “your server” should be framed as the managed-service goal/pilot, not self-service. | `Private managed-hosting preview; enrollment is controlled and public sign-up is closed.` |
| Pirs | `1dccd92acabd`; successful | A real separate Wasmtime runtime, WIT guests, manifest checking and private Unix-socket event delivery exist under `service/pirs/host/` and `service/pirs/events/`. The project's qualification ledger explicitly limits this: no production plugin host and no PDS hook gains support (`docs/spec/hook-points.md:86-146`). | Replace present-tense “personal data server you can extend” and avoid treating the host as an integrated PDS plugin system. | `Experimental PDS research with a separately tested sandbox host; not a hosting offer and not production-qualified.` |
| Backline | `f9cd6f1e6ff9`; successful | Discord command router enforces active installation and routes tickets, feeds, recovery, self-roles and moderation (`backend/src/bot/commands.ts:164-211`). The frontend registry has 23 listed modules in five groups (`frontend/src/lib/modules.ts:9-65`); dedicated backend/frontend tests cover the major surfaces. | Keep private-pilot/installation-closed language. “23 modules” is code-supported; real Discord permissions, bot installation and pilot operations are runtime claims. | `Private Discord pilot; public installation closed.` |

## Factual replacements worth applying

1. **Pirs showcase summary, landing introduction, and SEO**

   Replace claims that Pirs is a PDS “you can extend” or that it has an operating PDS plugin system with:

   > Pirs is experimental AT Protocol server research. It includes a draft hook-point specification, a separate bounded Wasmtime host, and an opt-in private event bridge. The host is not production-qualified and no PDS plugin hook is supported yet.

   This retains the implemented host/bridge work while matching the project’s own qualification boundary.

2. **Arkhiv relationship text used by Lineage and the other consumer sites**

   “Arkhiv supplies the catalogue and media tools…” is accurate at the source boundary. Prefer “shared archive engine and API” rather than a blanket statement that the engine powers a live public service. The consumers use immutable engine/API pins; Lineage’s `AGENTS.md` explicitly says it has no independent backend.

3. **Dedhed detail**

   Replace “with two reviewed concert recordings” with “with reviewed concert recordings” unless the parent’s browser/runtime check confirms the exact count. The source proves per-recording availability gating, not that the pilot currently contains exactly two approved recordings.

4. **Rekolekt/HasanAra relationship**

   Keep the direction: HasanAra is an independently branded frontend, Rekolekt is the shared API/backend. The current source supports transcript ingestion/search/passages but does not establish a generic Rekolekt-owned browser frontend or hosted upload/sign-up service.

5. **Prichal/Pirs relationship**

   Keep Prichal separate from Pirs. Prichal’s management service and PDS provisioning are implemented independently; Pirs must not be presented as its alternate live hosting stack.

## Current CI evidence

For every listed source snapshot, Gitea Actions returned a completed `success` run for its exact head SHA through `tea --login subcult-agent` on 2026-11-05. No local test command was run: these snapshots lack an audited dependency/runtime setup, and this review is deliberately read-only. A successful workflow demonstrates its configured checks, not browser rendering, media decoding, source availability, deployment, or production operation.

## Screenshot fixtures and source-owned visual assets

Useful present-tense, source-owned assets are in `web/public/og.png` or `web/public/brand/<product>/og.png` for Arkhiv, Dedhed, Lineage, Riot Grrrl, Bill Nye TV and Democracy Now! TV. Rekolekt has `landing/social-preview.png`; Prichal has `site/og.png`; Pirs has `assets/pds-dashboard.png` and `assets/account-migration.png`; Backline has `frontend/public/brand/backline/social-banner.png` and `og.png`. These are design/marketing fixtures, not runtime screenshots; use the parent’s fresh browser captures for public-page claims.

## Limits

This review intentionally did not call public pages, launch a browser, access deployment hosts, inspect private pilot data, run local tests, or alter any product repository. Runtime availability and exact current catalogue counts remain parent-owned browser checks.
