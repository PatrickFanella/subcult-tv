# Preparation runtime on Kvant

Check the live units and links before relying on this file. Studio is `~/Work/Subcult/subcult-tv/studio`.

- **Digest:** Switchyard workflow `changemaker-daily-digest` (trigger `daily-changemaker-native`, 09:00 UTC) collects product activity and writes the digest the social jobs read. Its "What people notice" section is written for post editors.
- **Instagram and website/Patreon:**
  - `changemaker-instagram.timer` runs at 09:20 UTC and `changemaker-publications.timer` at 09:25 UTC. Both run from installed bundles, not the checkout.
  - `~/.local/share/posting-dashboard/changemaker` is a symlink to a versioned release. Publications historically used `publications/studio`; the October 6 service override selects a versioned `releases/publications-x-guidance-<sha>/studio` snapshot. Inspect effective `ExecStart` before updating either consumer.
  - To deploy, copy a release, swap the symlink and keep a dated directory under `recovery/`. A merged change is not live until it is deployed.
  - `render.py` reads `studio/brand-tools/` (brands.json, fonts) and `studio/brands/<slug>/logos/`, so a release must include both. Releases cut before the October 5 layout carry `studio/branding/library/` instead.
  - `craft_publications` switches the staged website/Patreon edition on or off.
- **X and Bluesky:**
  - `social-posting-plan` runs Monday at 10:00 Chicago, `-radar` at 08:45, 13:45 and 18:15, and `-review` Sunday at 16:00.
  - Since the October 6 X guidance rollout, service overrides select a versioned bundle under `~/.local/share/posting-dashboard/releases/x-guidance-<sha>/`. Its configuration points to the canonical Studio content and preserved runtime state, with the editorial guide pinned to the bundle. Inspect effective `ExecStart` and configuration; the old checkout-linked unit remains the fallback, so changing source alone does not update these jobs.
  - They share `runner.lock`. A job started while another runs returns `already_running` and does nothing, so start them one at a time.
- **Feedback and tuning:** `social-feedback-pull.timer` (hourly) writes `owner-feedback.json` through the preparation key. `social-prompt-tuning.timer` (Saturday 10:00 Chicago) opens a Gitea pull request with proposed prompt edits when at least five new useful records exist. Both run from the canonical checkout like the plan job. Neither changes an installed bundle.
- **Showcase:** `showcase.py --product --source-root --state` writes a live-product draft on request. It has no timer.
- **State:** `~/.local/state/social-posting/` holds runs, drafts, receipts, locks and `owner-feedback.json`. Never replace it from source.
- **Review:** drafts reach the authenticated review dashboard unapproved, with their prepared images. Approval, scheduling and publication need the owner and provider readback.
