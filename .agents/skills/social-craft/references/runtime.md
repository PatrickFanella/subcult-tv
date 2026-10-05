# Preparation runtime on Kvant

Check the live units and links before relying on this file. Studio is `~/Work/Subcult/subcult-tv/studio`.

- **Digest:** Switchyard workflow `changemaker-daily-digest` (trigger `daily-changemaker-native`, 09:00 UTC) collects product activity and writes the digest the social jobs read. Its "What people notice" section is written for post editors.
- **Instagram and website/Patreon:**
  - `changemaker-instagram.timer` runs at 09:20 UTC and `changemaker-publications.timer` at 09:25 UTC. Both run from installed bundles, not the checkout.
  - `~/.local/share/posting-dashboard/changemaker` is a symlink to `releases/<sha>`, and `publications/studio` is an overlay.
  - To deploy, copy a release, swap the symlink and keep a dated directory under `recovery/`. A merged change is not live until it is deployed.
  - `craft_publications` switches the staged website/Patreon edition on or off.
- **X and Bluesky:**
  - `social-posting-plan` runs Monday at 10:00 Chicago, `-radar` at 08:45, 13:45 and 18:15, and `-review` Sunday at 16:00.
  - These units link into the canonical checkout and run whichever branch it has checked out.
  - They share `runner.lock`. A job started while another runs returns `already_running` and does nothing, so start them one at a time.
- **Showcase:** `showcase.py --product --source-root --state` writes a live-product draft on request. It has no timer.
- **State:** `~/.local/state/social-posting/` holds runs, drafts, receipts, locks and `owner-feedback.json`. Never replace it from source.
- **Review:** drafts reach the authenticated review dashboard unapproved, with their prepared images. Approval, scheduling and publication need the owner and provider readback.
