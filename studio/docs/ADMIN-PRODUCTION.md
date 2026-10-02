# Admin production workspace

The selected SUBCULT Culture / poster press system now styles the companion site's authenticated admin workspace. Purple headers use dark ink, with acid-green actions, paper text and charcoal work surfaces. The site implementation lives in the isolated `studio-admin-posting-dashboard` branch of `subcult-tv`; this Studio worktree's companion checkout is `.companion/subcult-tv/`.

## Brand library

`/admin/studio` browses eleven selected brand systems and seventeen media records. Exported categories include logos, social templates, video assets, artwork, fonts and tokens. Search and category filters narrow the asset list. Preview backgrounds can switch between dark and light; previews load near the viewport. Downloads use authenticated asset requests. Patrick includes treatments 01, 02, 03, 04, 06, 07 and 08.

Superseded Patrick shape-study previews and option 05 exports were removed from the active source gallery. Original reference SVGs and the archived Signal production pack are retained. The old study generator is an inactive source reference under `history/branding/patrick-logo-studies-2026-10-02/`.

## Posting dashboard

`/admin/posts` now opens the preparation dashboard. Its Site articles tab retains the existing blog editor. The automation view shows the preparation lanes, configured calendars, account cadence, filtered draft copy, media requirements, open checks and run history. Expired timely copy is hidden by default and can be included explicitly. Copying a draft does not approve it.

The dashboard reads a bounded private snapshot, generated with:

```sh
rtk proxy python scripts/export_studio.py --posting-state /absolute/private/social-posting-state
```

The export does not run jobs or write runner state. Re-export after new preparation runs to update the snapshot. Browser refresh reloads the snapshot. The UI separates prepared drafts, approval, proposed times and unverified delivery. Configured timer calendars are not live systemd health observations.

## Verification and deployment boundary

Local checks on October 2, 2026: six Studio export/snapshot checks passed; the site passed 67 frontend tests, lint, production build and Go tests. After adding viewport-based asset loading, the three focused admin regression tests, lint and build passed again. A disposable PostgreSQL-backed login verified catalog, posting and font-download endpoints. The rendered library and posting page passed 390-pixel iframe layout checks without horizontal overflow; the existing site-article tab loaded successfully. The snapshot contained eighteen preparation receipts and twenty draft records when exported.

The local review frontend is `http://127.0.0.1:18772/`, with a loopback API on port 18773 and a task-owned disposable PostgreSQL container named `studio-posting-dashboard-db`. These stay running for review. The production site has not been deployed. Deployment requires the companion site changes and a fresh private Studio bundle; neither automated publication nor runner schedules were changed.
