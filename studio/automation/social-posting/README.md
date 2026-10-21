# Scheduled social preparation

This runner prepares weekly X drafts from the social plan, the product claims register, the candidate bank, current repository scope documents, prepared draft reservations and Buffer queues. It also collects the day's merged pull requests from the six product repositories (`changes.py`), prepares timely discovery and quote candidates, and reviews the weekly and timely notes against delivery evidence. It cannot create, schedule or publish posts, approve drafts or change tasks.

The installed preparation services select versioned snapshots under `~/.local/share/posting-dashboard/releases/`. Since the October 6 guidance rollout, X plan/radar/review use `x-guidance-3919b0a`, Instagram resolves the `changemaker` symlink to that same snapshot, and website/Patreon uses `publications-x-guidance-3919b0a`. The X snapshot reads canonical Studio content and preserved runtime state, while pinning its editorial guide. Inspect effective `ExecStart`, links and configuration before deployment; changing a checkout branch or source alone does not update these jobs. Compatibility launchers under `~/.local/share/social-posting/` point to the same X snapshot. Credentials, receipts and SQLite state stay outside Git.

## Schedule and output

- `social-posting-plan.timer`: Monday 10:00 America/Chicago. Writes `content/social/drafts/YYYY-Www Content Posts.md` in Studio.
- `social-posting-review.timer`: Sunday 16:00 America/Chicago. Writes a separate `YYYY-Www Publishing Review.md`. Before the October 5–11 pilot starts, review returns `pilot_not_started` without a model call.
- `social-posting-radar.timer`: every day at 08:45, 13:45 and 18:15 America/Chicago. Writes separate timestamped notes under `content/social/drafts/Timely Drafts`. With no suitable new sources it makes no model call. Timely discovery can run before the weekly pilot begins.
- `changemaker-publications.timer`: daily, after the Instagram job. `changemaker_publications.py` prepares the website Development log entry and its Patreon edition from the same collection, keeping only changes that improve something a user does with the product. When the editor keeps nothing, it writes `skipped.json` beside the collection and prepares no entry (`no_user_facing_change`).
- `changemaker-instagram.timer`: daily. `changemaker_instagram.py` prepares marketing captions from the day's merged pull requests, collected by `changes.py` from the repositories in `config.json` under `changes`: the brief keeps a change only when a stranger would want the result or the story is interesting on its own, and skips small fixes. When it skips everything, `daily_showcase` in `config.json` selects a live product for a showcase draft (least recently spotlighted; none for `gap_days` after a weekly or showcase post). Set `enabled` to false to return to empty quiet days.
- `social-feedback-pull.timer`: hourly. `feedback.py` reads the owner's review feedback (rejections, revision requests, edited approvals, re-roll notes and "Good post" marks) through the preparation key's read-only `/posting-preparation/feedback` endpoint and writes `owner-feedback.json` in state. The weekly, timely and Instagram jobs pass recent records to their prompts.
- `social-prompt-tuning.timer`: Saturday 10:00 America/Chicago. When at least five new useful feedback records exist, `tune.py` clones the repository, has a model edit an allowlist of prompt and guidance files (`craft/tune.md`), and opens a Gitea pull request as `subcult-agent`. The model returns lasting lessons, and `tune.py` appends them, dated, to the social-craft skill's `lessons.md` in the same pull request, because the model's sandbox cannot write under `.agents/`. It waits while an earlier tuning pull request is open. It never merges or deploys; compare the changed prompts on saved fixtures and deploy them like any other prompt change. The receipt is `prompt-tuning-latest.json`, and each run's prompt, events and diff stay under `prompt-tuning/`.
- The preparation timers are persistent. A missed start can run when Kvant returns, and the runner then chooses the current local week; it does not work through a backlog of old weeks.

Kvant must be powered on with network access. User lingering lets jobs run while logged out. The runner uses Buffer reads, Studio notes and its SQLite reservations to inspect posting commitments. It does not connect to Super Productivity or require its desktop app. External task calendars are not inspected. When required Buffer evidence is unavailable the run fails, and the runner does not invent an update. Failures are recorded in the systemd journal and private receipts; the failure handler has no desktop notification dependency. User lingering is required for these user services to start at boot without a login.

An explicit `runner.py plan --week YYYY-Www` can prepare the rest of a current week before the regular pilot. It omits past slots and counts unexpired timely reservations against daily and weekly capacity and 90-minute spacing. `--refresh` replaces only a machine-owned section that nobody has edited.

The first pilot is `2026-W41`. On October 8, 2026 the user set the capacities to at most three Patrick posts a week, one SUBCULT post a day and a target of three to five CLPR posts a week, replacing the October 1 starting cadence of up to two Patrick posts a day. Patrick writes most of his own posts, so SUBCULT and CLPR carry the product marketing. CLPR has a hard ceiling of five, and weak evidence can justify fewer drafts. Weekly preparation targets 5–10 useful base drafts and leaves room for timely material. `config.json` supplies the Chicago slots and caps; the original Thursday SUBCULT 09:22 slot stays valid for existing notes. These are proposed publication times. They change nothing in a Buffer queue. Instagram and Patreon publication are outside the installed runtime.

## Voice and draft shape

`prompt.md` and `radar-prompt.md` each carry a "Voice" and "Shape" section that summarizes `../../content/VOICE.md`: who speaks on each account, one or two lines per product on what a good post looks like, and rules that keep a batch of drafts from sharing one template. The model runs without shell or file tools, so it cannot open VOICE.md. It sees the prompt summary and the "Writing and voice" section of `Posting Best Practices.md`, which the runner passes as `context.posting_guidance`. When VOICE.md changes, update both prompts and that section by hand. Nothing checks that they agree.

## Authentication and limits

Codex CLI uses the existing ChatGPT sign-in and the saved Buffer OAuth connection on Kvant. Credentials stay in their existing protected stores. No API key or OAuth token is embedded in source or copied to another host. ChatGPT usage limits still apply, and a model or provider outage can prevent preparation.

Each invocation ignores general Codex configuration and supplies an explicit tool allowlist. Buffer permits `get_account`, `list_channels`, `get_channel`, `list_posts`. Only these reads receive per-tool unattended approval. Shell tools are disabled. Weekly planning and review disable web search; timely preparation enables native search for at most two source or context checks. Global MCP settings are untouched.

`changes.py` collects merged pull requests with GET requests to the Gitea API, using the `subcult-agent` token from the installed Git credential helper (`git credential fill`); it refuses another account, follows no redirects and caps response size. Each collection is hash-bound (`evidence_sha256` over the canonical items) and recorded in the run's `sources.json`; a repository that fails to read marks the collection partial and blocks drafting rather than silently narrowing it. Source items are deduplicated by original URL and update time, so a new collection window does not make unchanged activity look new. Until October 11 the jobs read Switchyard's Changemaker digest instead; its trigger is disabled and nothing here depends on it. A merged pull request is never social approval or deployment proof.

Public discovery reads recent relevant top stories from the official Hacker News API. Metrics name the platform and observation time; they do not measure X popularity. `Timely Sources.json` accepts operator-captured public HTTPS discoveries and exact original X URLs. Watch topics include the seven products (Kork added October 2, 2026), independent culture, music and creative tools, archives, open-source software and left politics. Political commentary routes mostly to Patrick, with SUBCULT limited to relevant culture and community connections. Adding political keywords installed no dedicated political source feed, and no specific accounts or publications have been selected. Indexed search, HN and this inbox do not amount to a full X trend feed. Timely drafts expire within 24 hours and reserve account capacity without proving publication. Trend-driven copy is selected and posted by a person.

An inbox entry has `url`, `title`, optional `excerpt`, `kind` (`current`, `discovery`, `quote`) and a timezone-aware `observed_at`. A quote uses the original unshortened `https://x.com/handle/status/ID`. Capture the original and the actual observation time; never invent a popular tweet or its counts. The user can give URLs in chat for capture and does not need to edit the JSON. The Timely Posting Plan holds the review criteria.

Repository fetches refresh remote-tracking scope documents without changing working files or branches. Scope documents prove source claims, not deployed behavior. The dated claims register is a required input. A draft must flag any asset or live check it still needs, and generating a draft grants no editorial approval.

## Inspect, run and stop

Use the normal shell wrapper:

```bash
rtk proxy systemctl --user list-timers social-posting-plan.timer social-posting-review.timer
rtk proxy python3 /home/onnwee/.local/share/social-posting/runner.py status
rtk proxy cat /home/onnwee/.local/state/social-posting/radar-latest.json
rtk proxy journalctl --user -u social-posting-plan.service -u social-posting-review.service -n 40 --no-pager
```

A manual run without `--refresh` skips a week that is already complete. Starting a service explicitly refreshes its managed section and can consume another model run:

```bash
rtk proxy python3 /home/onnwee/.local/share/social-posting/runner.py plan
rtk proxy systemctl --user start social-posting-plan.service
rtk proxy systemctl --user start social-posting-review.service
rtk proxy systemctl --user start social-posting-radar.service
```

The runner serializes activity with a file lock. SQLite records runs and managed-section hashes in `~/.local/state/social-posting`. The runner preserves text outside its markers (`<!-- social-posting-runner:begin -->` and `:end`). If someone edits the generated section between them, a refresh fails before calling the model and leaves the note intact. It checks again before writing, to protect edits made during generation. Preserve the database when updating the runtime: if section hashes are lost, a person has to reconcile the notes deliberately.

Private run directories contain prompts, scope snapshots, JSONL tool events, stderr and structured results. Do not publish them, because source notes and account details can be private. Provider responses are validated from actual tool events before a weekly note is written. Failed runs keep their evidence and create no successful planning receipt.

To stop future starts and any active preparation:

```bash
rtk proxy systemctl --user disable --now social-posting-plan.timer social-posting-review.timer social-posting-radar.timer
rtk proxy systemctl --user stop social-posting-plan.service social-posting-review.service social-posting-radar.service
```

This preserves notes and receipts and does not affect existing Buffer posts. Installation backups and the initial deployment receipt are in `~/.local/state/social-posting/install-20261001T050000Z`. To restore, take only the intended installed files from a verified backup, preserve later source edits, run `systemctl --user daemon-reload`, then re-enable the timers when ready.

## Verification

From the repository root, `rtk make check-studio-automation` copies this directory to a temporary folder and runs the tests against disposable state. To run them directly from `studio/`:

```bash
rtk proxy python3 -m unittest discover -s automation/social-posting -p 'test_*.py' -v
rtk proxy systemd-analyze --user verify automation/social-posting/social-posting-*.service automation/social-posting/social-posting-*.timer
```

Tests cover note preservation, account and cadence validation, actual provider evidence, provider errors, restricted tools, private atomic writes, artifact hash binding, redirect refusal, read-token isolation, stale inbox rejection and the quote, source, expiration and capacity checks. No test covers the voice or shape of generated copy; that is reviewed by a person. A completed manual background run proves the installed path and authentication. The first natural timer runs, a Sunday delivery review after the pilot starts, live quote publication and long-running reliability each need separate evidence.

Changemaker's native collection configuration was activated as workflow version 3 for the six product repositories. The API was re-created while its run and model queues were idle, using the same deployed image. The protected environment backup, the immutable prior definition, the prepared and activated definitions and the native first-run evidence are under `~/.local/state/social-posting/changemaker-activation-20261001`. Native publication stays disabled, and the original daily trigger schedule is unchanged. Workflow rollback is a version-bound `POST /api/workflow-definitions/changemaker-daily-digest/rollback` with `version:2` and the reviewed current `expected_version`. It creates a new version; never rewrite historical versions. To restore collection policy, preserve later environment edits and remove only the source-allowlist addition, then reload the API after checking for active work. Social runtime backups are under that directory's `social-runtime-before`.

## Posting guidance and media

Both preparation jobs read the dated `Posting Best Practices.md` and the local media catalog. The draft schemas require a structured media choice and proposed alt text. Library file hashes, account eligibility and conservative X image limits are checked before notes are written. Pending generation and capture briefs are saved in each run's `media-requests.json`. The runner does not render images, upload them or publish. Original concept art comes from the built-in interactive image tool, separately from real workflow captures.

`python automation/social-posting/media.py audit`, `search --product clpr`, `add ...` and `gallery` manage the local library; metadata probes need an installed `ffprobe`. `Social Media Library.md` covers provenance, import options and review states. Historical results without media fields stay readable; new model outputs use the current schema.

## Product capture, short edits and Bluesky preparation

The media library holds real screenshots and recording masters alongside generated illustrations. `edit_video.py` makes a silent captioned H.264 short while preserving the source and storing a hash-bound recipe. Give it a new output path, because it refuses to replace a file. [[Social Media Production]] lists the produced assets and editorial checks. Captures with unresolved third-party content scope stay excluded from automatic selection.

`bluesky.py` writes unapproved platform variants to each plan or radar run's `bluesky-drafts.json`. It checks conservative text limits, flags X mentions and tweet links for platform review, and selects compatible image derivatives under 1 MB through their original parent IDs. It performs no network writes and no authentication. Destination identity states live in config and in [[Bluesky Posting Plan]]. The user approved repurposing onnwee.bsky.social for the main SUBCULT account. The subcult.tv handle, name and bio change is publicly verified, and authenticated unattended delivery is pending. Patrick's public identity is verified. The user completed CLPR account creation. Unattended delivery is pending for all three.

The installed scheduled jobs prepare those variants after an ordinary successful run. The local export module provides no native Bluesky quote embed, media upload, dispatcher, account mutation or publication.


## Project strategies and recovery (October 21, 2026)

[Project marketing strategies](../../content/marketing/README.md) cover the website portfolio and The Common House. Their JSON pack travels with the installed release; the selected CLPR packet sources have recorded hashes. Strategies guide readers, themes, demonstrations, actions and measurement. They do not supply product facts. Weekly planning, timely selection, caption stages and the publication prompt receive the strategy pack. The showcase lane records its strategy hash and rotates content themes within a product using prepared drafts, separately from publication history. Existing caps and the showcase gap still apply.

Gitea reads retry transient connection errors, HTTP 429 and selected server failures at most three times, with bounded waits. Authentication, missing repositories and invalid response shapes remain failures. Every daily Instagram collection is saved as `collection.json` before selection. A partial collection never supplies change claims; the job may instead prepare a showcase from independent claims and a current public page. It records both the collection status and showcase result. When neither path can produce a draft because evidence is unavailable, the service fails visibly instead of reporting an empty successful run. Ordinary empty selections remain valid outcomes.

Scheduled preparation waits for the shared lock instead of silently skipping a busy instant. Model retries preserve earlier attempt logs. The final caption is checked in a separate model call after rewriting, with one repair attempt; copy that still fails is withheld with an explicit reason. Visual review describes the actual rendered image for alt text and rejects captures that do not demonstrate the caption's subject. Failed images are withheld; the draft keeps an explicit asset task.

Runtime activation still requires a versioned bundle, effective-unit readback, retained previous selection and a guarded rollback receipt. Source edits alone do not update installed jobs. Never replace private state or provider receipts when deploying these files.
