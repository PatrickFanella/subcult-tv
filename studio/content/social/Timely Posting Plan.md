---
title: Timely Posting Plan
type: work
status: active
stage: plan
created: 2026-10-01
updated: 2026-10-03
timezone: America/Chicago
---

# Timely posting plan

This lane leaves room in the schedule for current happenings, discoveries and conversations worth joining. The seven products stay the studio's focus, but a timely discovery does not need a sales pitch attached. The Common House stays an occasional teaser.

[[Social Posting Automation Plan]] governs accounts, evidence and approval. The weekly bank supplies durable material and this lane supplies short-lived opportunities. A trend never triggers a post automatically.

## Volume and available space

| Account | Starting capacity | Useful mix |
| --- | --- | --- |
| Patrick | Up to 2 posts/day, 14/week | Product decisions, discoveries, useful commentary and selected quote posts |
| SUBCULT | Up to 1 post/day, 7/week | Product artifacts, independent culture and relevant community discoveries |
| CLPR | Target 3–5 posts/week; ceiling 5 | Clip discovery/curation and relevant Twitch context |

The user confirmed this starting cadence on October 1, 2026. The capacities can change after results are observed. They are not quotas and promise no outcome. Weekly preparation targets 7–12 strong base drafts and leaves room for timely material; prepare fewer when evidence is weak. A timely post uses the same account capacity as a base post. Leave at least 90 minutes between posts on an account. Choose one destination for a discovered conversation, and do not post the same commentary on all three accounts.

The installed timely checks run at 08:45, 13:45 and 18:15 Chicago every day. The morning check can identify a story, the afternoon check can update its context, and the evening check can catch a discovery worth sharing. The job prepares up to three candidates per batch and skips sources it has already prepared. It makes no publication decision.

## Inputs and their limits

- Native Switchyard Changemaker: daily Gitea collection for clpr, Patchwork, HasanAra, Rekolekt, Subcult OS and Undertow. The social runner reads current draft and source artifacts and verifies their digests. This is project activity. It is not an X trend feed and does not prove deployment. A merged change can support a development update; a release claim still needs the release evidence.
- Public discovery: bounded reads from the official Hacker News API, filtered to recent top stories on relevant topics. Points and comments are HN signals and say nothing about X popularity. Check the original article before making claims about it.
- `Timely Sources.json`: URLs and context captured by the operator for discoveries, current happenings and original X posts. Captured text is an input to review and has not been verified independently. The file is an intake inbox, not a second approved bank.
- Native web search: at most two searches per drafting pass, used to check captured material. Indexed public information is incomplete. It gives no comprehensive X timeline, trend feed or engagement ranking.

The confirmed watch topics are the six original products, independent culture, music and creative tools, archives, open-source software and left politics, along with privacy and community. Kork was added as a seventh product on October 2 and still needs the owner's confirmation. Route general political commentary mostly to Patrick. SUBCULT can cover a concrete independent-culture, studio or community connection; CLPR stays on its product and Twitch context. Verify factual political claims against original sources and current context. Do not invent the user's positions, personal experience or endorsements.

Political discovery keywords are installed, but no dedicated political feed or list of accounts and publications has been selected. Discovery is still bounded HN reads, operator-captured URLs and source-checking web searches, and gives no comprehensive coverage of politics or X trends.

[[Timely Watchlist]] holds the researched shortlist of accounts and publications, with identity checks and free feed options. Listing a source there does not enable collection.

## Candidate selection

Prefer something we can explain usefully: a discovery with a concrete application, a current product change with a clear limit, or a conversation where we have a distinct observation to add. Weigh relevance, freshness, source quality, the added point, audience fit and existing prepared copy. Popularity can help rank a relevant source when its platform, count and observation time are known. It never establishes truth or likely reach.

For each draft, record account, kind, exact text, source IDs, original URL when quoting, proposed local window, expiration, evidence and the remaining check. Current or trend material normally expires in six hours, and every timely draft expires within 24 hours of preparation. Sources older than 48 hours are excluded. An expired draft is skipped or re-evaluated; stale commentary never fills a slot.

Human review should be short: open the original, read the surrounding conversation, check the claim and the account, edit the point into the account's voice ([voice guide](../VOICE.md)), then decide whether and when to post. Trend-driven material on X requires a deliberate human posting choice. The exact-copy approval rules still apply to any later dispatcher.

## Quote posts

Capture the original unshortened `https://x.com/handle/status/ID` URL, its title or context, and the observation time. A quote draft must refer to that captured post and include its exact URL. Add a useful point or question. Do not fabricate a quote, the author's intent or engagement counts. Reopen the post immediately before use, since it may have been corrected, deleted or overtaken by events.

Buffer documents that commentary placed before an original post URL in its composer produces a quoted repost. The MCP publication path has not been proved. Until it is, use the native X or Buffer composer for a deliberately selected quote and record its published URL. The runner only prepares the copy.

## Review and adaptation

The Sunday review separates prepared drafts, editorial skips, scheduled posts, verified published URLs and failed delivery. It includes the timely draft notes without counting them as publication. Track useful conversations and concrete responses when they are observed, and do not invent analytics that are unavailable. Change one volume or source choice at a time, after repeated evidence. A quiet day can stay quiet.

X's rules prohibit automated trend-topic posting and duplicative posts across accounts. They permit informational quote automation subject to the other rules. This lane keeps trend selection and posting human. Buffer's free limit is ten queued posts per channel at a time, so a future dispatcher should refill a short rolling queue and not enqueue the whole week.

References: [X automation rules](https://help.x.com/en/rules-and-policies/x-automation), [Buffer quote-post workflow](https://support.buffer.com/en-us/articles/scheduling-repostsretweets-4pc5B4JQui), [Buffer free queue limit](https://support.buffer.com/en-us/articles/what-happens-when-you-downgrade-to-the-free-plan-s6ayRdRtQ6), [official Hacker News API](https://github.com/HackerNews/API).

[[2026-W40 Social Trial]] records the October 1–4 preparation trial and its verification.
