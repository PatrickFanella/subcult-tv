---
title: Timely Posting Plan
type: work
status: active
stage: plan
created: 2026-10-01
updated: 2026-10-02
timezone: America/Chicago
---

# Timely posting plan

The goal is frequent, useful posts with room for current happenings, discoveries and good conversations. Keep the seven products as the studio focus. A timely discovery does not need a forced sales pitch. The Common House stays an occasional teaser.

[[Social Posting Automation Plan]] governs accounts, evidence and approval. The weekly bank supplies durable material. This lane supplies short-lived opportunities; it does not turn trends into an automatic posting trigger.

## Volume and available space

| Account | Starting capacity | Useful mix |
| --- | --- | --- |
| Patrick | Up to 2 posts/day, 14/week | Product decisions, discoveries, useful commentary and selected quote posts |
| SUBCULT | Up to 1 post/day, 7/week | Product artifacts, independent culture and relevant community discoveries |
| CLPR | Target 3–5 posts/week; ceiling 5 | Clip discovery/curation and relevant Twitch context |

The user confirmed this starting cadence on October 1, 2026. These capacities can be adjusted after observing results; they are not guaranteed outcomes or compulsory quotas. Weekly preparation targets 7–12 strong base drafts and leaves room for timely material. Prepare fewer when evidence is weak. A timely post uses the same account capacity as a base post; it is not added on top without limit. Leave at least 90 minutes between posts on an account. Choose one destination for a discovered conversation; do not blast the same commentary across all three accounts.

The installed timely checks are 08:45, 13:45 and 18:15 Chicago every day. A morning check can identify a story, an afternoon check can update context, and an evening check can catch discoveries worth sharing. The job prepares up to three candidates per batch and skips sources already prepared. It makes no publication decision.

## Inputs and their limits

- Native Switchyard Changemaker: daily Gitea collection for clpr, Patchwork, HasanAra, Rekolekt, Subcult OS and Undertow. The social runner reads current draft/source artifacts and verifies their digests. This is project activity, not an X trend feed or proof of deployment. A merged change can support a development update; a release claim still needs the actual release evidence.
- Public discovery: bounded reads from the official Hacker News API, filtering recent top stories for relevant topics. Points and comments are observed HN signals, not X popularity. The original article must be checked before making claims about it.
- `Timely Sources.json`: operator-captured URLs and context for cool discoveries, current happenings and original X posts. Captured text is an input to review, not independently verified source truth. This is an intake file, not a second approved bank.
- Native web search: at most two searches in a drafting pass, used to check captured material. Indexed public information is incomplete; it does not provide a comprehensive X timeline, trend feed or engagement ranking.

The confirmed watch topics cover the six products (Kork was added as a seventh on October 2 and still needs the owner's confirmation), independent culture, music/creative tools, archives, open-source software and left politics, alongside privacy and community. Route general political commentary primarily to Patrick. SUBCULT can cover a concrete independent-culture, studio or community connection; CLPR stays focused on its product and Twitch context. Verify factual political claims against original sources and current context. Do not invent the user's specific positions, personal experience or endorsements.

Political discovery keywords are installed, but no dedicated political feed or list of accounts/publications has been selected. Current discovery remains bounded HN reads, operator-captured URLs and source-checking web searches; it does not provide comprehensive political or X trend coverage.

The researched account and publication shortlist is maintained in [[Timely Watchlist]]. It includes identity checks and free feed options; listing a source does not enable collection.

## Candidate selection

Prefer something we can explain usefully: a discovery with a concrete application, a current product change with a clear boundary, or a conversation where we can add a distinct observation. Consider relevance, freshness, source quality, the added point, audience fit and existing prepared copy. Popularity can help prioritize a relevant source when its platform, count and observation time are actually known; it never establishes truth or likely reach.

For each draft, record account, kind, exact text, source IDs, original URL when quoting, proposed local window, expiration, evidence and the remaining check. Current/trend material normally expires in six hours; all timely drafts expire within 24 hours of preparation. Sources older than 48 hours are excluded from this lane. Expiration means skip or re-evaluate, never publish stale commentary to fill a slot.

Human review should be short: open the original, inspect the surrounding conversation, check the claim and account, edit the point in the user's voice, then choose whether and when to post. X trend-driven material requires a deliberate human posting choice. Existing exact-copy approval rules still apply to any later dispatcher.

## Quote posts

Capture the original unshortened `https://x.com/handle/status/ID` URL, title/context and the observation time. A quote draft must refer to that captured post and include its exact URL. Add a useful point or question; do not fabricate a quote, the author's intent or engagement counts. Reopen the post immediately before use: it may have been corrected, deleted or overtaken by events.

Buffer documents that adding commentary before an original post URL in its composer produces a quoted repost. The MCP publication path has not been proved. Until that proof exists, use the native X/Buffer composer for a deliberately selected quote and record its published URL. The runner only prepares the copy.

## Review and adaptation

Sunday review separates prepared drafts, editorial skips, scheduled posts, verified published URLs and failed delivery. It includes timely draft notes, without treating them as publication. Track useful conversations and concrete responses when observed; do not invent unavailable analytics. Change one volume or source choice at a time after repeated evidence. A quiet day can remain quiet.

References: [X automation rules](https://help.x.com/en/rules-and-policies/x-automation), [Buffer quote-post workflow](https://support.buffer.com/en-us/articles/scheduling-repostsretweets-4pc5B4JQui), [Buffer free queue limit](https://support.buffer.com/en-us/articles/what-happens-when-you-downgrade-to-the-free-plan-s6ayRdRtQ6), [official Hacker News API](https://github.com/HackerNews/API).

X's rules prohibit automated trend-topic posting and duplicative posts across accounts; they permit informational quote automation subject to the other rules. This lane keeps trend selection and posting human. Buffer's free limit is ten queued posts per channel at a time, so a future dispatcher should refill a short rolling queue rather than enqueue the whole higher-volume week.

The October 1–4 preparation trial and its verification are recorded in [[2026-W40 Social Trial]].
