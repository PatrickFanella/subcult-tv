# Scheduled social preparation

This runner prepares weekly X drafts from the canonical social plan, product claims register, candidate bank, current repository scope documents, Super Productivity tasks and Buffer queues. It also reads Switchyard's native Changemaker artifacts, prepares timely discovery/quote candidates, and reviews the weekly and timely notes against delivery evidence. It cannot create, schedule or publish posts, approve drafts, or change tasks.

The maintained source is `/home/onnwee/Work/Subcult/subcult-studio/automation/social-posting`. Jobs execute it directly. Former vault/runtime paths and user units are compatibility symlinks to Studio. The tracked config owns content paths; credentials, receipts and SQLite state remain outside Git. See `../../docs/MIGRATION.md` for the October 2 cutover and recovery.

## Schedule and output

- `social-posting-plan.timer`: Monday 10:00 America/Chicago. Writes `content/social/YYYY-Www Content Posts.md` in Studio.
- `social-posting-review.timer`: Sunday 16:00 America/Chicago. Writes a separate `YYYY-Www Publishing Review.md`. Before the October 5–11 pilot starts, review returns `pilot_not_started` without a model call.
- `social-posting-radar.timer`: every day at 08:45, 13:45 and 18:15 America/Chicago. Writes separate timestamped notes under `content/social/Timely Drafts`. No suitable new sources means no model call. Timely discovery can run before the weekly pilot begins.
- The preparation timers are persistent. Missed starts can run when Kvant returns; the runner chooses the current local week rather than accumulating old posting debt.

Kvant must be powered on with network access. User lingering permits jobs while logged out. The Super Productivity bridge must be available; unavailable providers cause failure rather than an invented update. Desktop notifications are requested on failure; the private receipt and systemd journal remain the dependable evidence when no desktop session is present.

An explicit `runner.py plan --week YYYY-Www` can prepare the remainder of a current week before the regular pilot. It omits past slots and counts unexpired timely reservations against daily/weekly capacity and 90-minute spacing. `--refresh` replaces only an unchanged machine-owned section.

The first pilot is `2026-W41`. The user confirmed starting capacities of up to two Patrick posts/day, one SUBCULT post/day and a target of three to five CLPR posts/week on October 1, 2026. CLPR has a hard ceiling of five; weak evidence can justify fewer drafts. Weekly preparation targets 7–12 useful base drafts and leaves room for timely opportunities. `config.json` supplies Chicago slots and caps; the original Thursday SUBCULT 09:22 slot remains valid for existing notes. These are proposed publication times, not Buffer queue changes. Instagram and Patreon publication are outside the installed runtime.

## Authentication and limits

Codex CLI uses the existing ChatGPT sign-in and saved Buffer OAuth connection on Kvant. Credentials stay in their existing protected stores. No API key or OAuth token is embedded in source or copied to another host. Existing ChatGPT usage limits still apply; a model or provider outage can prevent preparation.

Each invocation ignores general Codex configuration and supplies an explicit tool allowlist. Buffer permits `get_account`, `list_channels`, `get_channel`, `list_posts`; Super Productivity permits `get_projects`, `get_tasks`, `get_task`. Only these reads receive per-tool unattended approval. Shell tools are disabled. Weekly planning/review disable web search; timely preparation enables native search for at most two source/context checks. Global MCP settings remain untouched.

`sources.py` uses only GET requests and the existing Switchyard read credential, selected from the protected environment file. It never falls back to an admin token. Control requests use the loopback API port, reject redirects and cap response size. Changemaker import verifies the current draft bytes and source bytes against both artifact and review digests; digest approval does not grant social approval. Source items are deduplicated by original URL/update time, so a new collection window does not make unchanged activity novel.

Public discovery reads recent relevant top stories from the official Hacker News API. Metrics name the platform and observation time; they do not measure X popularity. `Timely Sources.json` accepts operator-captured public HTTPS discoveries and exact original X URLs. Watch topics include the seven products (Kork added October 2, 2026), independent culture, music/creative tools, archives, open-source software and left politics. Political commentary routes primarily to Patrick, with SUBCULT limited to relevant culture/community connections. Adding political keywords does not install a dedicated political source feed; specific accounts and publications have not been selected. Indexed search, HN and this inbox do not provide a full X trend feed. Timely drafts expire within 24 hours and reserve account capacity without proving publication. Trend-driven copy remains human-selected and manually posted.

An inbox entry has `url`, `title`, optional `excerpt`, `kind` (`current`, `discovery`, `quote`) and a timezone-aware `observed_at`. A quote uses the original unshortened `https://x.com/handle/status/ID`. Capture the original and actual observation time; never invent a popular tweet or its counts. The user can provide URLs in chat for capture without editing the JSON themselves. See the maintained Timely Posting Plan for review criteria.

Repository fetches refresh remote-tracking scope documents without changing working files or branches. Scope documents prove source claims, not deployed behavior. The dated claims register remains a required input. Drafts must flag any remaining asset or live check; generation grants no editorial approval.

## Inspect, run and stop

Use the normal shell wrapper:

```bash
rtk proxy systemctl --user list-timers social-posting-plan.timer social-posting-review.timer
rtk proxy python3 /home/onnwee/.local/share/social-posting/runner.py status
rtk proxy cat /home/onnwee/.local/state/social-posting/radar-latest.json
rtk proxy journalctl --user -u social-posting-plan.service -u social-posting-review.service -n 40 --no-pager
```

Manual runs without `--refresh` skip a week already completed. Starting a service explicitly refreshes its managed section and can consume another model run:

```bash
rtk proxy python3 /home/onnwee/.local/share/social-posting/runner.py plan
rtk proxy systemctl --user start social-posting-plan.service
rtk proxy systemctl --user start social-posting-review.service
rtk proxy systemctl --user start social-posting-radar.service
```

The runner serializes activity with a file lock. SQLite records runs and managed-section hashes in `~/.local/state/social-posting`. It preserves text outside its markers. If someone edits its generated section, refresh fails before calling the model and leaves the note intact. It checks again before writing to protect edits made during generation. Preserve the database when updating the runtime; losing section hashes requires deliberate human reconciliation.

Private run directories contain prompts, scope snapshots, JSONL tool events, stderr and structured results. Do not publish them: task notes and account details can be private. Provider responses are validated from actual tool events before a weekly note is written. Failed runs retain evidence and do not create a successful planning receipt.

To stop future starts and any active preparation:

```bash
rtk proxy systemctl --user disable --now social-posting-plan.timer social-posting-review.timer social-posting-radar.timer
rtk proxy systemctl --user stop social-posting-plan.service social-posting-review.service social-posting-radar.service
```

This preserves notes and receipts. Existing Buffer posts are unaffected. Installation backups and the initial deployment receipt are in `~/.local/state/social-posting/install-20261001T050000Z`. Restore only intended installed files from a verified backup, preserve later source edits, run `systemctl --user daemon-reload`, then re-enable timers when ready.

## Verification

```bash
rtk proxy python3 -m unittest discover -s scripts/social-posting -p 'test_*.py' -v
rtk proxy systemd-analyze --user verify scripts/social-posting/social-posting-*.service scripts/social-posting/social-posting-*.timer
```

Tests cover note preservation, account/cadence validation, actual provider evidence, provider errors, restricted tools, private atomic writes, artifact hash binding, redirect refusal, read-token isolation, stale inbox rejection and quote/source/expiration/capacity checks. A completed manual background run proves the installed path and authentication. The first natural timer runs, Sunday delivery review after pilot start, live quote publication and long-running reliability require separate evidence.

Changemaker's native collection configuration was activated as workflow version 3 for the six product repositories. The API was re-created while its run/model queues were idle, using the same deployed image. The protected environment backup, immutable prior definition, prepared/activated definitions and native first-run evidence are under `~/.local/state/social-posting/changemaker-activation-20261001`. Native publication stays disabled; the original daily trigger schedule remains unchanged. Workflow rollback is a version-bound `POST /api/workflow-definitions/changemaker-daily-digest/rollback` with `version:2` and the reviewed current `expected_version`. It creates a new version; never rewrite historical versions. Preserve later environment edits and remove only the source-allowlist addition when restoring collection policy, then reload the API after checking active work. Social runtime backups are under that directory's `social-runtime-before`.

## Posting guidance and media

Both preparation jobs read the dated `Posting Best Practices.md` and local media catalog. Draft schemas now require a structured media choice and proposed alt text. Library file hashes, account eligibility and conservative X image limits are checked before notes are written. Pending generation/capture briefs are saved in each run's `media-requests.json`; the runner does not render images, upload them or publish. The built-in interactive image tool supplies original concept art separately from real workflow captures.

`python scripts/social-posting/media.py audit`, `search --product clpr`, `add ...` and `gallery` manage the local library; metadata probes require installed `ffprobe`. See the canonical `Social Media Library.md` for provenance, import options and review states. Historical results without media fields remain readable; new model outputs use the updated schema.


## Product capture, short edits and Bluesky preparation

The media library now supports real screenshots and recording masters alongside generated illustrations. `edit_video.py` makes a silent captioned H.264 short while preserving the source and storing a hash-bound recipe. Use a new output path; it refuses replacement. See [[Social Media Production]] in the canonical vault for the produced assets and editorial checks. Captures with unresolved third-party content scope stay excluded from automatic selection.

`bluesky.py` writes unapproved platform variants to each plan/radar run's `bluesky-drafts.json`. It checks conservative text limits, flags X mentions and tweet links for platform review, and selects compatible sub-1-MB image derivatives through their original parent IDs. It performs no network writes or authentication. Destination identity states live in config and the canonical [[Bluesky Posting Plan]]. The user approved repurposing onnwee.bsky.social for the main SUBCULT account; the subcult.tv handle/name/bio change is publicly verified, while authenticated unattended delivery is pending. Patrick's public identity is verified; CLPR account creation was completed by the user; unattended delivery remains pending.

The installed scheduled jobs prepare those variants automatically after an ordinary successful run. This is preparation only: no native Bluesky quote embed, media upload, dispatcher, account mutation or publication is provided by the local export module.
