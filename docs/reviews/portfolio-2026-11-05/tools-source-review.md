# Current implementation audit — portfolio selection

Observed 2026-11-05. This is a source-first, read-only audit of ten portfolio entries. It checked the current `main` SHA, source and targeted tests/CI through the authenticated Gitea API. It did **not** fetch public pages, install desktop/Obsidian plugins, run product builds, or verify a live service; those are separate claims.

## Decision summary

The portfolio generally takes the right availability posture. Two corrections matter now:

1. **Tadooer:** replace “an Android shell that exists in source only” with a prerelease-artifact statement. `v0.15.0-rc.13` has Android APK, Linux/macOS desktop, and unsigned iOS IPA assets. This establishes published prerelease artifacts, not a hosted service or app-store release.
2. **Clustr Galaxy:** do not imply a forthcoming/qualified public beta. The current source is substantial, but current main fails both Linux-beta jobs because the required Unity native runner is disabled.

`findings.json` is the machine-readable per-project evidence and proposed copy.

## Current-head evidence

| Product | Current main | Substantive implementation and tests | Current availability/copy decision |
| --- | --- | --- | --- |
| Tadooer | `2223ff6190b5028093b911589fb341614cfc75c6` | Monorepo packages for web, server, desktop, mobile, MCP and quick-add. Root `package.json` exposes `test`, `verify`, desktop package, Android release, and macOS packaging flows. Mobile policy/bridge tests, desktop policy/update/artifact tests, smoke harness and design screenshots are present. All 7 current checks succeed. | **Use:** “Private, self-hosted planner for one owner. Current prereleases include Linux and macOS desktop builds plus Android and unsigned iOS artifacts.” Do not say hosted, signed, app-store available, or runtime verified. **Visual/harness:** `docs/design/screenshots/{today,planner,tasks,boards}-{desktop,phone}.png`; `deploy/smoke.sh`; desktop `package:linux`. |
| Subsets | `80e68ab00a2322cf3af13035d10faee66b59549e` | `node/src/{discovery,manager,packs,tui}.ts(x)` implements local discovery, managed changes, pack handling and terminal UI. Node test suite includes core, discovery-files, package-smoke, packs and TUI; Python legacy suite remains too. CI’s three current checks succeed. | Source is `0.2.0-alpha.6`; the latest Gitea prerelease is `v0.2.0-alpha.3`. **Use:** “Local CLI and terminal UI … source is ahead of the last public prerelease.” `node/src/packs.ts` independently confirms the optional `@subcult/patstack` pack and says it supplies 48 portable skills. **Visual:** run `node scripts/capture-tui.mjs`; stored fixture `site/assets/tui-capture.json`. |
| patstack | `a06844d9990bc01157ecc9a194c510a53c57611b` | Repository contains maintained skill library, catalog, profile-history and validation workflow. Current source validation succeeds. Its product relationship is corroborated by Subsets’ independent `node/src/packs.ts`, not README prose. | **Use:** “A maintained collection of agent skills and profiles. Subsets can obtain its optional `@subcult/patstack` pack.” Avoid “the collection included in the published alpha” without exact package/tarball proof. |
| Metronome + Tuner | `baa985252021e84e21b260fd77dac9d6460f9d22` | Metronome synthesis/scheduling/tap-tempo paths are in `src/metronome/`; pitch math, controller and YIN detection are in `src/tuner/`. Targeted tests cover scheduler, tap tempo, note math, YIN, lifecycle, settings and locale. `npm run check` is lint + Vitest + typecheck + clean build; current CI succeeds. | **Use:** “An Obsidian metronome and local chromatic tuner: 30–300 BPM, tap tempo, accents, selectable click sounds and adjustable A4. Microphone analysis stays on-device after permission.” Source supports the feature claim; installation/mobile runtime has not been audited. **Visual/harness:** `npm run check`; an actual screen needs an isolated Obsidian vault/plugin install, not a global install. |
| super-productivity-mcp | `cd736e7bf04dc0d0f18878e3cec7ba68afe05027` | Go MCP adapter and filesystem IPC are in `internal/mcpadapter/` and `internal/pluginipc/`. Plugin actions include project/tag/task read/create/mutate/organize/recurrence/schedule/system/issue-provider paths. Tests span adapter, IPC, catalog, config, quick-add and plugin bridge. CI runs `make test` and succeeds. | **Use:** “A local MCP server, Super Productivity plugin bridge and quick-add tool. The bridge uses local file IPC; source covers tasks, projects, tags, schedules, recurrence, system and issue-provider actions.” Do **not** imply that a user’s live bridge is connected—source alone cannot establish that. |
| ytclip | `f58f8231e399e240c9a553530e4dc40ceb3f2374` | Bash utility with `tests/test.sh`; current Gitea Verify succeeds. | **Use:** “A local Bash command for downloading a full YouTube video or cutting a timestamped clip, using `yt-dlp` and `ffmpeg` installed on the user’s machine.” It is a source install, not a hosted conversion service. |
| twitchdl | `ad91c1b6304fc12a16da7f51c1a3eabef8c311ab` | `internal/cli/cli.go` exposes only `clip`, `vod`, `live`, `doctor`, and shell completion. Backends explicitly use Streamlink and yt-dlp. Unit suites cover app/backend/CLI/domain/media/process; `tests/integration-local-hls.sh` covers local HLS. Current verify succeeds. | **Use:** “A local Go command for downloading Twitch clips or VODs and recording a live channel.” The source supports `--wait` and duration recording, **not** discovery, scheduling, or account-authenticated workflows. |
| tmux-popups | `fef6aa1f4510387f1966bcc49bf1e9719df91644` | Registry is `popups.tsv`; generation, execution, help, doctor and validation are in `scripts/`. Tests cover availability, bindings, clipboard, context, launcher, modes, quoting, registry, timer and user scripts. Current launcher verification succeeds. | Current copy is substantiated. **Use:** “A Bash-and-tmux popup toolkit. A TSV registry generates a quick menu and direct bindings; it includes local overrides, dependency-aware help and a doctor script.” **Visual/harness:** a disposable `tmux` server using the repository’s `tests/run.sh`/`scripts/generate-config.sh`; do not alter the user’s tmux configuration. |
| Clustr Galaxy | `4fcf811b96d7ac252bf62bce622506fb4789f8d7` | Real Unity source: runtime/core, exploration/presentation assets, editor builders including `GalaxyLinuxBetaBuilder.cs`, and native Linux plugin material. But `.gitea/workflows/unity.yml` fails at current head: `UNITY_RUNNER_ENABLED` is not true; the Unity job is deliberately blocked pending `unity-6000.4.10f1-linux`. | **Use:** “A controller-oriented Unity prototype for exploring community data as a galaxy.” Add “Linux builds and a public beta are not currently qualified.” No demo/build claim until the native Unity gate runs and succeeds. |
| The Common House | `939f91699b68ef0b400e7de1d8f5552789b8026e` | Unity project has authored aftermath interaction code, art/animation assets, and broader game content. Current CI runs Python regression tests, documentation validation, binary-size and provenance checks and succeeds. It is a portable source-quality gate, not a game build/playtest. | **Use:** “A first-person narrative-investigation game prototype set at a communal radio outpost. Public playtesting and release remain ahead.” That is supported without overstating a playable release. |

## Suggested page-wide availability language

- Prefer **“source install”**, **“local tool”**, **“prerelease artifact”**, or **“prototype”** where appropriate.
- State both the product boundary and the proof boundary: a green source CI confirms its configured checks, not a public URL, installed desktop plugin, service runtime, app-store listing, or user-account integration.
- For bridge-based products, distinguish protocol surface from current connection state. The Super Productivity bridge can be sound in source while a particular plugin bridge is stalled or uninstalled.

## Reproducible visual evidence candidates

These are safe starting points for a later isolated evidence pass; none was run in this audit.

- **Tadooer:** verified, versioned screenshots in `docs/design/screenshots/`; `pnpm test`, `pnpm --filter @suite/desktop package:linux`, and `deploy/smoke.sh` are source-defined gates. A real desktop screenshot still needs an isolated profile/window check.
- **Subsets:** `node scripts/capture-tui.mjs` creates its captured terminal output; `site/assets/tui-capture.json` is the retained render fixture.
- **Obsidian Metronome + Tuner:** `npm run check` validates the plugin code; use a disposable Obsidian vault to take a UI screenshot, never the globally installed plugin profile.
- **tmux-popups:** use a disposable tmux server and the repository test/config scripts (`tests/run.sh`, `scripts/generate-config.sh`), then capture the popup pane. Do not touch the user’s real tmux config.

## Commands used for current-source evidence

All Gitea reads were authenticated, read-only API calls via `tea api --login subcult-agent`:

```text
GET /api/v1/repos/{owner}/{repo}
GET /api/v1/repos/{owner}/{repo}/branches/main
GET /api/v1/repos/{owner}/{repo}/commits/{sha}/status
GET /api/v1/repos/{owner}/{repo}/git/trees/main?recursive=true
GET /api/v1/repos/{owner}/{repo}/contents/{path}?ref={sha}
GET /api/v1/repos/subculture-collective/tadooer/releases
GET /api/v1/repos/subculture-collective/subsets/releases
```

No credentials, account records, browser captures, external media downloads, or source changes are included here.

## Isolated visual-evidence follow-up

Performed after the initial audit, in disposable clones under `/tmp/subcult-current-review-20261105/evidence/`. These checks did not alter the website worktree, product worktrees, shared home/configuration, production data, or any public page.

### Fresh Subsets TUI render

- Clean source: `80e68ab00a2322cf3af13035d10faee66b59549e`, `@subcult/subsets` `0.2.0-alpha.6`.
- Invocation: Node `v24.22.1` from `/home/onnwee/.local/share/mise/installs/node/24.22.1/bin`, isolated npm cache and `npm ci --ignore-scripts`, then `npm run build && node scripts/capture-tui.mjs`.
- Result: [new capture JSON](/tmp/subcult-current-review-20261105/tools/subsets-tui-capture-80e68ab.json), generated by the actual Ink component at 80 columns from six disposable sample skills. It contains Skills, Groups, and `storytelling` search frames; the script deletes its temporary sample home/state after rendering.
- Integrity: `node/src/tui.tsx` SHA-256 is `52dbb1b7435916708517996952ee4b6c7a45c83106b6e23d668020b9e24dac9e`; capture SHA-256 is `5ebed2344d5bdef14a098783a3bbd7af9e101b52b49c1de7f57211d347b97954`.

### Tadooer isolated current-source run

- Clean source: `2223ff6190b5028093b911589fb341614cfc75c6`, built with the repository’s pinned Node 24 Docker image and pnpm `11.15.1`.
- Isolated Compose project: `tadooer-portfolio-4188`, listening only at `http://127.0.0.1:4188/`; Baikal is isolated on `127.0.0.1:4189`. It has fresh named volumes and is deliberately left at first-run owner setup (`{"setupRequired":true}`): no production data, account login, or sample owner was created.
- Direct checks passed: `/api/health` reports `ok`; `/api/ready` reports SQLite `ok`, migrations `current`, calendar bridge `idle`, and 54 migrations; `/api/build` reports version `0.15.0-rc.13` and revision `2223ff6190b5028093b911589fb341614cfc75c6`. Evidence is retained as `tadooer-4188-{health,ready,build,setup-status}.json` beside this report.
- The repository `deploy/smoke.sh` currently fails its final shell-title matcher only: it requires the obsolete literal `<title>Tadooer</title>`, while the current built page serves `<title>Tadooer — Private task and calendar planning</title>`. This is a focused current-source inconsistency in the smoke harness, not a failed HTTP/readiness run.
- Source-owned images gathered as source evidence, **not fresh UI captures**: `apps/web/public/og.png` (Git blob `30dc3fcfef66a824aecf101a60d0f9da05c907f9`, SHA-256 `8d20dc1df1c1069f800aeb716d1a6fbbb6bfd689da27b367119eccf7b4285c45`), `docs/design/screenshots/today-desktop.png` (blob `11f7aa0c9b98df547bb91f99e776d2bc83228046`), and `planner-desktop.png` (blob `9e5e5d48ce2eb20d86b88c67b39a0abcc2e5f287`).

### Obsidian source image

The Metronome + Tuner source includes `docs/metronome-view.png` at current `baa985252021e84e21b260fd77dac9d6460f9d22` (Git blob `efad1cf4175c86485d72eb4f23d3addee56b22bd`, 93,293 bytes). It is source-owned documentation imagery, not a fresh installed-plugin capture. An actual current UI capture still requires a disposable Obsidian vault and no global plugin installation.

### Temporary Tadooer portfolio-demo state

At the parent’s request, the isolated stack was then seeded through supported local setup/API routes with **synthetic-only** rendering data. It is not an authentication, connector, or production qualification.

- Parent capture URL: `http://127.0.0.1:4188/`. A disposable loopback proxy injects only an ephemeral demo session; it neither reveals nor writes credentials to the browser. Its root response was independently rechecked as HTTP 200 after the final network configuration.
- Exact visible seed inventory is retained in [tadooer-demo-seed.json](/tmp/subcult-current-review-20261105/tools/tadooer-demo-seed.json): three `Portfolio demo:` tasks, two linked next-day blocks (09:30/60 minutes and 11:00/45 minutes), and a Kanban board with the handoff task in `In progress`. Planner API evidence shows `fresh` with two linked events. No personal tasks, existing accounts, or production calendar connector are involved.
- Runtime identities at final check: Compose project `tadooer-portfolio-4188`; suite is loopback `127.0.0.1:4210`, Baikal is loopback `127.0.0.1:4189`, and the host-networked proxy container is `tadooer-portfolio-4188-proxy` (PID at final check: `2605727`). The proxy has a read-only mount of the owner-only demo session file; it is the only component intentionally bound at capture URL port 4188.
- Cleanup, after capture: `docker rm -f tadooer-portfolio-4188-proxy`; then, from `/tmp/subcult-current-review-20261105/evidence/tadooer`, run `SUITE_PORT=4210 BAIKAL_PORT=4189 docker compose --project-name tadooer-portfolio-4188 down --volumes`. This removes only the explicitly named temporary proxy, project containers/network, and temporary named volumes.
