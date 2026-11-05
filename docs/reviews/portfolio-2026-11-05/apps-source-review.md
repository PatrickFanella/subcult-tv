# SUBCULT.TV selected-app copy evidence audit — 2026-11-05

Scope: a read-only review of the ten selected Gitea repositories at their current
`main` heads.  It traces visitor-facing claims in the dirty website working tree
(`content/projects.json`, `src/lib/showcase.ts`, `src/lib/product-landings.ts`,
and `src/lib/seo.ts`) to current implementation and focused tests/hosted Actions.
No product checkout, website source, deployment, or public page was modified.

**Evidence terms:** *implemented* means a concrete source path exists;
*test-verified* means the current-head hosted run is green (or a focused test is
present but the current hosted run is still in progress); *deployed* is never
inferred from either.  Browser checks and screenshots are owned by the parent
review; no screenshots were captured by this audit.

## Findings that should change copy

| Product | Current evidence | Proposed visitor-facing replacement | Availability wording |
| --- | --- | --- | --- |
| Undertow | Browser editor, six templates, local export source, and current-head CI are supported. Parent browser check also exercised a template, local upload, playback and pause without an account. | Keep the current local-browser-editor claim. Replace any unconditional performance implication with: “Exports run in your browser on your device; export time depends on the device and project.” | **Public browser editor**; deployment separately browser-checked by parent. |
| Kork | Current main passed CI; the public anonymous landing, checked by parent, presents 92 services, ten themes and a 24-hour publish wait. | “Create a free link page with 92 services and ten themes. Changes publish after the stated review window; tips go directly to your own accounts.” Remove “no trackers” unless separately traced to an analytics/privacy implementation review. | **Early public service** is accurate; do not promise immediate self-serve publication. |
| clpr | Public clip, tag/topic, playlist/favorite and sharing routes are implemented. Current head CI passed. | “Browse Twitch clips by creator, topic and tag. With an account, save clips and collect them into playlists.” This avoids implying anonymous saving. | **Public web app**; no production-route check in this audit. |
| HasanAra | Search, playback/transcript, timestamp/context and save/share surfaces have focused tests. Current head CI is **in progress**. | “Search the archived, transcribed broadcasts by phrase or topic, then open the recording at the matching moment. Check the recording before quoting a machine-made transcript.” Replace “every transcript in the archive” with “the archived and transcribed broadcasts.” | **Public independent archive**, pending current-head CI; live data coverage is not asserted. |
| Chatty Cat | `internal/chatlimits/limits.go:14-24` makes six the initial merged-pane limit, but allows a default twelve-channel workspace and a maximum of 24. Current head CI passed. | Replace “merges up to six channels” / “All six channels” with: “Start with a six-channel merged pane; configured workspaces can include up to 24 channels.” Keep Twitch sign-in necessary for sending only if confirmed by the auth browser path. | **Public web client**; implementation and CI evidence do not prove all relay/account paths are live. |
| Commons | Current main CI passed. Source has public catalog/community UI and server routes. Parent’s fresh browser check found the new Discover / Alternatives / Help build / Builders navigation and 15 curated references; old README rollout wording is not controlling evidence. | Replace “open for people to explore and help shape” with: “Explore curated rebuild references, compare alternatives, and join the discussion around projects and builders.” Avoid “share what you are building” until the account-bound create flow is browser-checked. | **Public discovery and community hub**; distinguish anonymous browsing from account-required contributions. |
| Headcount | Detectors, score combination and public pages have focused tests; current-head CI passed. | Keep: “A high sus quotient is a reason to inspect the evidence, not proof.” Make the count non-absolute: “combines multiple detector signals” instead of “twelve detectors,” unless that exact public response is checked. | **Public research / provisional signals**; do not describe coverage as complete. |
| Left Field | The catalogue repository **is** the current public Next.js application, not a separate imported-data repository. It contains priority-index, map, browse, sources and methodology routes plus API/data layers; current-head Gitea runs passed. | Retain: “The public research site is in active development.” Prefer “seat-level public-record research with sources, versioned provisional scores and stated gaps” over a stronger availability claim. | **Public research / in development**. Current source and CI are verified; public deployment was browser-checked by parent. |
| Patchwork | Current source contains production-data-mode safeguards (`apps/web/src/features/data-mode.ts:19-22`) and wide end-to-end coverage of requests/offers, location privacy, groups, moderation and safety. A current-head push run passed; a separately dispatched run failed and was not treated as a product regression. | Keep the safety boundary, but be specific: “A pre-alpha demonstration of a neighborhood board for requests and offers. Do not use it to arrange real help.” Do not advertise the broad implemented surfaces as live service capabilities. | **Public demonstration / pre-alpha**, not a real-help service. |
| Subcult OS | Event lifecycle models published/closed events and ticket allocations (`backend/internal/app/event_lifecycle.go:42-101`); door authority, ticket journey and public-event integration tests exist. Current-head CI passed. The current copy’s “free reservations only” conflicts with code that models pricing/price/currency (`:20-23`, `:89-90`), but code alone does not show paid sales are enabled. | Replace the categorical FAQ answer with: “The current public flow is free reservations. The code also contains ticket-pricing support, but paid ticket sales and payouts are not being offered through the public service.” Keep the in-development availability statement. | **In development / contact to try it**, not a general public SaaS. |

## Per-project source and verification trace

### Undertow — `003581277d5af8dd4269503925a0f6f58c0c7f2d`

- Implemented: editor at `src/App.tsx`; templates at `src/templates.ts:32-199`; local video export under `src/export/exportVideo.ts`; project-local persistence at `src/workingCopy.ts`.
- Focused tests: `tests/templates.test.ts`, `tests/export-memory.test.ts`, `tests/lyrics.test.ts`, `tests/workingCopy.test.ts`.
- Hosted CI: Gitea run 18469, push at this head, **success** (2026-11-04 13:04 CST).
- Deployment: not inferred. Parent browser evidence is recorded above; screenshot location selected by the website is `/screenshots/undertow-editor-1440.webp`.

### Kork — `7b0ce9bb2f65542cd09c166b1a400d6739bb13ec`

- Implemented: service catalog `internal/catalog/services.go:23-35`; page/block rendering `internal/blocks/render.go`; analytics, QR, import/export and account APIs under `internal/server/`.
- Focused tests: `internal/catalog/catalog_test.go`, `internal/server/analytics_test.go`, `internal/server/import_export_test.go`, `internal/server/qr_theme_test.go`, and `web/src/lib/blocks.test.ts`.
- Hosted CI: current-head push run **success** (2026-11-05 10:41 CST).
- Deployment: parent browser checked the anonymous landing; no authenticated editor/publication operation was attempted.
- **Analytics-copy follow-up:** `internal/db/migrations/0005_analytics.sql:1-19` and the live-schema assertion in `internal/server/analytics_test.go:174-189` support: “Analytics stores daily aggregate page, referrer-domain and country counts—not visitor IP addresses, cookies or user-agent strings.” Remove or narrow the broader “no trackers” claim. Kork does use a signed-in account session cookie (`internal/server/server.go:30,322-326`), so “no cookies” would be false for the service as a whole. See `source-snippets.md`.

### clpr — `3b482affc0d8638089273d8bdf35557c53895c07`

- Implemented: public clip routes and authenticated favorite/tag operations in `backend/cmd/api/routes_clips.go:10-53`; corresponding handlers under `backend/internal/handlers/`.
- Focused tests: `backend/internal/handlers/clip_handler_test.go`, `favorite_handler_test.go`, `feed_handler_test.go`, `creator_clips_handler_test.go` and `community_handler_test.go`.
- Hosted CI: current-head push **success** (2026-11-04 13:41 CST). Deployment not inferred.

### HasanAra — `40460af6f85a58334d03317fa0d60fa3fb804fc1`

- Implemented: search, passage and player surfaces in `frontend/src/components/video/` and archive/search components; direct focused tests include `frontend/src/tests/SearchPage.test.tsx`, `PassagePanel.test.tsx`, `VideoPage.test.tsx`, `PlaybackProgress.test.tsx`, `TranscriptQualityNotice.test.tsx`, and `e2e/tests/archive-smoke.spec.ts`.
- Hosted CI: current-head push run is **in progress** (observed 2026-11-05 12:02 CST); the immediately preceding PR run passed. Do not call this head test-verified yet.
- Deployment: not inferred. Selected screenshot path: `/screenshots/hasanara-home-1440.webp`.

### Chatty Cat — `cd4d052d50a80d9c9afa5c92583e50c242e95da8`

- Implemented: public/auth/chat flows under `internal/auth/`, IRC relay under `internal/ircrelay/`, and explicit bounded channel handling in `internal/chatlimits/limits.go:14-45`.
- Focused tests: `internal/auth/public_test.go`, `send_test.go`, `irc_relay_test.go`, `internal/ircrelay/relay_test.go`, and `internal/chatlimits/limits_test.go`.
- Hosted CI: current-head push **success** (two completed successful runs on 2026-11-05). Deployment not inferred.

### Commons — `c9e1a141886c39357d1944b7e00866b336e0b822`

- Implemented: server-side catalog, community, account and repository modules at `server/catalog.js`, `server/community.js`, `server/account-email.js`, and `server/repository.js`; public UI at `src/components/Catalog.jsx`, `ProjectCommunity.jsx`, `Projects.jsx`, `People.jsx`, and `StartGuide.jsx`.
- Repository test command: `package.json:13` (`node --test server/*.test.js scripts/*.test.mjs`); build and SEO check at lines 9 and 14.
- Hosted CI: current-head push **success** (2026-11-04 21:56 CST). Fresh parent browser evidence confirms anonymous discovery with 15 references; no account-bound mutation was performed.

### Headcount — `184488f9ee272b97a488077f91116bea9c1cde4b`

- Implemented: detector preparation and individual detector functions in `internal/detect/detectors.go:34-524`; score combination at `:524`; public API pages at `internal/api/pages.go` and visual data at `internal/api/viz.go`.
- Focused tests: `internal/detect/detectors_test.go`, `internal/score/score_test.go`, `internal/score/replay_integration_test.go`, `internal/api/pages_test.go`, and `internal/research/evaluation_test.go`.
- Hosted CI: current-head push **success** (2026-11-04 13:10 CST). Deployment not inferred.

### Left Field — `f66f8ff7db135a325bf040c1e90fe600cbc1d6a2`

- **Ownership correction:** the canonical application is `subculture-collective/left-field` itself (its package remains named `dsa-seats`); its configured website is `https://left-field.subcult.tv`. The local `dsa-suite/dsa-seats` checkout is an older, dirty checkout of that same `origin`, not another product repository. Keep the catalogue `repoUrl` unchanged—do not swap it to a supposed `dsa-web` or data-only repository.
- Implemented UI/data paths at this head: Next route surface under `src/app/` (`browse`, `map`, `maps`, `priorities`, `sources`, `methodology`, `seats`, and API routes); component/map surfaces under `src/components/` and `src/maps/`; repositories and releases under `src/repositories/`, `src/lib/priority-index-*`, and `src/db/`. `src/app/priorities/page.tsx:21-90` loads the current repository/model, filters evidence, and renders model version, published date, score limits and methodology link; `:101-157` implements search/state/chamber/cycle/route/evidence filters.
- Test/CI evidence: `package.json:6-19,123` declares Next build, lint/typecheck, Vitest, integration, Playwright, acceptance and source-lock checks. `.github/workflows/acceptance.yml:1-139` runs the disposable PostgreSQL migration and acceptance gate; Gitea Actions reports **two current-head push runs successful** (2026-11-04 13:58 and 14:30 CST). Those workflow files are GitHub-compatible syntax but are executed by current Gitea Actions, so the earlier “no Gitea CI” finding was incorrect.
- Data attribution: `data/metadata/` and `data/geometry/` are inputs/source receipts and projections; they support the research claims but are not a separate visitor-facing product. Deployment is not inferred from CI, though the parent independently browser-checked the public app.

### Patchwork — `7afca6cb8ff14707f1cf98ad88c4150797b2bd2e`

- Implemented: public web application routes/shell under `apps/web/src/app/`; maps under `apps/web/src/components/map/`; production fixture safeguard in `apps/web/src/features/data-mode.ts:19-22`.
- Focused tests: `apps/web/e2e/production-data-mode.spec.ts`, `request-handoff.spec.ts`, `safety-actions.spec.ts`, `exact-location.spec.ts`, `groups-production.spec.ts`, and `apps/web/src/features/handoff-safety.test.ts`.
- Hosted CI: current-head push **success** (2026-11-05 11:59 CST). A later manual `workflow_dispatch` failure on the same SHA is noted but not diagnosed here; it prevents an unqualified “all current runs green” statement. Deployment remains unverified.

### Subcult OS — `d64d66e0586add9ae6e375f21c28c6cdccb70cc9`

- Implemented: event state/publishing/ticket-allocation policy in `backend/internal/app/event_lifecycle.go:27-101`; event/door/access/export handlers in `backend/internal/app/event_access.go`, `door_authority.go`, and `event_report_exports.go`.
- Focused tests: `door_authority_integration_test.go`, `ticket_journey_test.go`, `ticket_capacity_integration_test.go`, `public_event_test.go`, `event_report_exports_integration_test.go`, and `event_lifecycle_test.go`.
- Hosted CI: current-head push **success** (2026-11-03 09:43 CST). Deployment not inferred; selected screenshot path is `/screenshots/subcult-os-events-1440.webp` if present in the current site asset selection.

## Copy-source locations to edit (not changed by this audit)

- Card and product-index language: `src/lib/showcase.ts:47-127`, plus Patchwork at `:391` and Subcult OS at `:476`.
- Expanded landing/FAQ language: `src/lib/product-landings.ts:121` (Left Field availability), `:190-247` (Patchwork safety), `:391-429` (Subcult OS ticketing/availability), and `:712-733` (Chatty Cat capacity/attribution).
- Project JSON catalog: `content/projects.json:3-475`; SEO snippets: `src/lib/seo.ts` `META_DESCRIPTIONS` entries.

## Evidence limits

This is a source-and-hosted-CI audit, not a deployment declaration.  The parent
review owns fresh public-browser screenshots and live route confirmation.  The
report deliberately does not use README claims as final proof, does not expose
account data or credentials, and does not equate a passing build with every
browser, relay, provider or payment path working in production.
