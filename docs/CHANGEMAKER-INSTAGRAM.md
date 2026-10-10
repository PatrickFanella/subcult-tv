# Changemaker Instagram drafts

Changemaker supplies collected repository evidence for Instagram captions in the authenticated Posts dashboard. It prepares drafts for `subcult.tv` and `patrick__eff`; the owner reviews the caption, account, JPEG and publish time before submitting through PostyBirb. Buffer's Twitter/X connections are preserved and are not used by this importer.

The importer reads the latest recent successful Changemaker review using the existing read credential. It verifies the draft and evidence hashes, requires complete source collection, and supplies merged pull requests plus Studio's claims register and voice guide to a tool-free caption generator. A merged pull request is evidence of source work, not deployment. Captions must describe maturity accurately. Private source URLs appear only in the authenticated evidence panel. Model-generated claims still need human review.

At most three distinct drafts are prepared per run. Source URL and update-time hashes prevent the same activity from being prepared again across different digest runs. Only a successful durable receipt consumes an identity. A shared lock preserves the existing weekly and timely preparation jobs. Proposed times start 48 hours after preparation; drafts expire after seven days. Actual scheduling still enforces at least 24 hours from approval. No media is generated or selected automatically: each draft carries a screenshot or artwork brief for the reviewer.

The maintained importer is `studio/automation/social-posting/changemaker_instagram.py`, with its prompt and schema alongside it. Unit sources are in `studio/automation/postiz-dashboard/`. On Kvant the installed copy lives under `~/.local/share/posting-dashboard/changemaker/`; the daily timer runs at 09:20 UTC, after Switchyard's 09:00 UTC trigger. It writes completed `result.json` and `receipt.json` files under the existing private preparation state. The five-minute dashboard sync uses the pinned exporter and reads canonical Studio configuration without switching the existing preparation consumers.

## Weekly post

`weekly.py` prepares one subcult Instagram post a week for the Friday 17:30 Chicago slot (`weekly_cta` in `config.json`). It is a recap of the week's merged work that ends with one call to action. The ask rotates by ISO week through Patreon (`patreon.com/subcult`), the newsletter (`subcult.tv/newsletter`) and the support page (`subcult.tv/support`). Caption links are not clickable on Instagram, so the caption writes the address out and points to the link in bio; keep all three addresses in the profile's bio links.

Each week gets a new caption and image from that week's Changemaker digests (up to seven days back), through the same staged writer with `mode: weekly`. Nothing is reposted: Instagram stops recommending identical reposts to non-followers. The caption must name the week's address, and it may say only what the rotation entry's `facts` say about the destination. A quiet week can produce a post about the ask alone. Daily drafts never take the weekly slot.

`changemaker-weekly.timer` runs on Wednesdays at 15:00 UTC, about 55 hours before the slot. A week that already has a weekly draft is skipped. The draft is unapproved and expires at its slot, so an unapproved week shows as missed and nothing posts without approval. Weekly runs consume no source identities, so the daily lane can still use the same changes.

## Editing queued posts

The review sheet can save an edit without approving it. A post already queued in PostyBirb can be edited from its review row or from the delivery history (`PUT /api/v1/admin/studio/review/{id}/schedule`). As with approval, the resulting publish time must be 24 hours to 90 days away; within 24 hours of publishing, an edit must also move the post at least 24 hours out, and nothing changes within 30 minutes of the current time.

A time-only change moves the existing submission and confirms the readback. A caption or image change creates the replacement and runs PostyBirb's validation while the original stays queued; a rejected replacement is discarded and the original is unchanged. Only then is the original checked (unposted, same account and caption), unscheduled and deleted, and the replacement queued. The receipt is claimed against the exact content that was read, so a concurrent edit or approval gets a conflict. The provider sequence continues if the browser disconnects. An outcome that cannot be confirmed leaves the receipt `uncertain` for reconciliation in PostyBirb.

## Re-rolls

The owner can ask for a new caption (keeping the selected prepared image), a new image (keeping the caption as edited) or both, with an optional direction. While a re-roll is open the draft cannot be saved or approved; requests, saves and approvals of a draft share one lock, and a queued draft cannot be re-rolled. The website only queues the request in `draft_rerolls`.

On Kvant, `changemaker-reroll.timer` runs `reroll.py` every two minutes. It claims one request at a time with the preparation key (`POST /api/v1/posting-preparation/rerolls/claim`), regenerates from the original run's evidence and claims register, and writes a new `-changemaker` run whose draft `supersedes` the old one. It starts `posting-dashboard-sync.service` before reporting the result, so the replacement normally reaches the website before the review page says it is ready; if that sync fails, the five-minute timer delivers it. A request whose claim is retried reuses the run it already wrote. Uploaded images never leave the website host, so a caption re-roll keeps a prepared image only. The preparation key can claim and finish re-rolls; it cannot approve or schedule. A claim held for two hours is retried, at most three times.

Each re-roll is a separate run, and the dashboard exports drafts from the newest 30 runs. A week with many re-rolls and timely runs can push older unapproved drafts out of the snapshot.

To install, deploy a changemaker release that contains `reroll.py`, `craft/reroll.md` and `craft/reroll.schema.json`, apply migration 012 with the website deploy, then link and enable the reroll unit pair. To stop re-rolls, disable `changemaker-reroll.timer`; queued requests stay pending and the rest of the review flow is unaffected.

Acceptance checks cover source binding, distinct accounts, private URL rejection, duplicate suppression, snapshot redaction and the visible Changemaker lane. Validate with `make check-studio check-studio-automation`, frontend tests, lint, type checking and build. Runtime qualification must additionally show an actual generated receipt, the redacted remote snapshot, and the authenticated draft review flow. Scheduling and Instagram delivery remain separate checks and require owner approval.

Recovery: disable `changemaker-instagram.timer` to stop future preparation; keep its run receipts so deduplication and evidence remain recoverable. Retain the prior dashboard sync script/unit and frontend image before replacing them. Restoring those copies hides the new lane without deleting drafts. Never remove the social preparation database or reset other timers.
