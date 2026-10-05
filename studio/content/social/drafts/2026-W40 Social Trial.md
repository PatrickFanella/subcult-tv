---
title: 2026-W40 Social Trial
type: work
status: active
stage: trial
created: 2026-10-01
updated: 2026-10-03
---

# October 1–4 social trial

The user asked for a trial covering the rest of the week. It is a preparation trial: all copy is unapproved and no post was submitted. [[Timely Posting Plan]] supplies the confirmed cadence and [[Timely Watchlist]] the researched sources. The regular pilot is still October 5–11.

## Verified initial outcome

The installed planner completed a partial-week run and a corrected refresh. The final run `20261001T155551.212645Z-plan` prepared seven future drafts: four Patrick, two SUBCULT and one CLPR. It made ten successful read-only provider calls, verified the configured Buffer organization and all three channels, and read the three task projects. Exact copy and remaining asset/live checks are in [[2026-W40 Content Posts]].

| Date | Account | Proposed Chicago time | Material |
| --- | --- | --- | --- |
| October 01 | patrick | 16:41 | HASANARA-01 |
| October 02 | patrick | 09:11 | HASANARA-02 |
| October 02 | clpr | 10:34 | CLPR-01 |
| October 02 | subcult | 11:22 | HASANARA-01 |
| October 03 | patrick | 09:11 | PATCHWORK-02 |
| October 04 | patrick | 09:11 | REKOLEKT-03 |
| October 04 | subcult | 11:22 | OS-01 |

One CLPR draft is right for the partial week, because Friday was its only remaining configured slot. Missed days are not backfilled to reach the ordinary target of 3–5 a week. These times are proposals; nothing was scheduled in Buffer.

The timely run `20261001T155316.224169Z-radar` read 31 collected sources, including three newly captured official RSS article links: one Drop Site and two CDM articles. It prepared no additional drafts and reported capacity and source-verification limits. The capture was a one-off: it installs no RSS monitoring and shows nothing about X popularity. The original articles still need checking.

## Defect found and corrected

The first weekly result proposed the October 1 SUBCULT 11:22 slot already reserved by an earlier timely draft. The radar identified the collision. The weekly planner now reads unexpired timely reservations, validates combined daily and weekly capacity, checks 90-minute spacing and rejects draft times already past. The corrected refresh moved the SUBCULT anchor to October 2. Earlier notes keep the original warning and do not show the final trial schedule. Twenty-five focused tests passed, three of them regression checks for this repair.

## Runs through Sunday

- Existing timely timer: 08:45, 13:45 and 18:15 Chicago daily. It collects current sources, checks prepared capacity and skips stale or unsupported opportunities.
- Dedicated trial review: Sunday October 4 at 16:00 Chicago. Installed `social-posting-trial-review-2026w40.timer` is enabled and persistent, with `review --week 2026-W40`. It writes [[2026-W40 Publishing Review]] after execution. The regular review still targets the configured pilot week.
- Regular weekly planning: Monday October 5 at 10:00 Chicago.

Kvant and provider connectivity are required. The dedicated review timer survives a reboot and catches a missed trigger when the user manager resumes. Its calendar holds a single date, so it adds no recurring second review.

Judge the trial by useful drafts, supported claims, correct account routing, capacity and spacing, stale-source skips and preserved human edits. Record publication only when a canonical published URL has been observed. This preparation run proved nothing about publication, quote-post delivery or performance analytics.

Private receipts and rollback copies are under `~/.local/state/social-posting/`. The runner is read-only against providers. Cancel the dedicated review with `systemctl --user disable --now social-posting-trial-review-2026w40.timer`.

## Posting guidance and media extension

October 1 refresh `20261001T161413.968156Z-plan` passed through the installed production runner with the new guide, catalog and media schema. It kept seven unapproved drafts: two propose original library illustrations, two request real workflow recordings and three stay text-only. The two pending capture briefs are saved in the private run's `media-requests.json`. Thirty-one focused tests passed. Both weekly and timely drafting load the guide and catalog. Generation is still interactive, and no media was uploaded. See [[Posting Best Practices]] and [[Social Media Library]].


## Product captures and Bluesky extension (October 1)

The refreshed installed planner `20261001T163045.762669Z-plan` succeeded with seven unapproved X drafts and seven unapproved Bluesky variants. It made ten verified provider reads, selected two library assets and kept one Subcult OS capture brief. Nine media files were cataloged at that point: the original concept art plus real screenshots, recording masters and a captioned eight-second edit. The user approved repurposing onnwee.bsky.social as SUBCULT; [[Bluesky Posting Plan]] tracks the account changes and authenticated delivery. No post was submitted. [[Social Media Production]] describes the capture and rights checks.
