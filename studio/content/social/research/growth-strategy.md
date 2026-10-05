---
title: Growth strategy for a small software and music collective
type: research
status: active
created: 2026-10-05
review-after: 2027-01-05
---

# Growth strategy for a small software and music collective

Research checked 2026-10-05. How a collective with no budget (independent, mostly open-source tools; one maker who also makes music; a left-political point of view) builds a following that uses, supports and talks about the work. Tags follow [engagement-psychology.md](engagement-psychology.md#evidence-tags). Platform specifics are in [platform-playbooks.md](platform-playbooks.md).

## 1. What growth means here

**Aim for people who care, not a large count.** Kevin Kelly's 2008 essay argues a solo creator can live on about a thousand "true fans" with a direct relationship. *[practitioner consensus, essay]* ([The Technium](https://kk.org/thetechnium/1000-true-fans/)) The number is an illustration, not a finding. The useful part is the shape: direct contact, repeat support, a small audience that knows the work.

**Most open-source projects are stadiums, not communities.** Nadia Eghbal's study of open source describes most successful projects as a few maintainers with a large audience who rarely contribute, and warns that audience attention brings support load. *[research-backed, book-length study]* ([Working in Public, Stripe Press](https://press.stripe.com/working-in-public)) For SUBCULT: users and supporters are the realistic goal; contributors are a bonus. Growth that adds issue load without support is a cost.

**Platform reach is not the funnel.** In indie games, Zukowski reports that most wishlists come from streamers, Reddit, festivals and demos rather than social posts, and that X link click-through is low. *[practitioner consensus]* ([How To Market A Game](https://howtomarketagame.com/2021/02/08/how-to-use-twitter-to-market-your-game/), [10-step plan](https://howtomarketagame.com/2021/07/12/how-to-market-your-indie-game-a-10-step-plan/)) Expect social posts to keep existing followers informed and to reach a few amplifiers; expect real adoption to come from being found where people already look for the problem.

## 2. Go where the problem is discussed

**Target communities that benefit; help before asking.** GitHub's Open Source Guide: have one home URL, go to the forums and communities where your users already are, "don't spam as many people as possible", and help others before asking for anything. It also warns that being noticed can take a long time. *[practitioner consensus, GitHub-published]* ([Finding Users for Your Project](https://opensource.guide/finding-users/))

**Each community has its own rules for self-promotion.** Reddit's "9:1" or "10%" ratio is an informal rule of thumb from Reddiquette, not site policy; moderators judge whether an account looks like a participant or a promoter. *[practitioner consensus]* ([summary of Reddit's current guidance](https://www.mediafa.st/reddit-self-promotion-rules-guide)) Hacker News' Show HN accepts things people can try and forbids asking friends to upvote. *[platform-documented]* ([Show HN](https://news.ycombinator.com/showhn.html)) One Reddit post earned a two-person game about 11,000 wishlists in a day; such outcomes are rare and mod-dependent. *[practitioner consensus, single case]* ([How To Market A Game](https://howtomarketagame.com/2022/01/10/how-a-two-person-team-earned-11000-wishlists-with-one-reddit-post/))

Where each product belongs (inference from product scope; verify each community's rules before posting):

| Product | Where people already talk about the problem |
|---|---|
| clpr | Twitch viewer and clipper communities, streamer Discords, clip-sharing feeds |
| HasanAra | communities around that streamer's broadcasts; people who cite or fact-check streams |
| Rekolekt | self-hosting, home-lab, archivist and taping communities |
| Subcult OS | small venue organizers, DIY show bookers, door volunteers |
| Undertow | music producers, visualizer and VJ communities, people making videos for releases |
| Kork | musicians and small creators comparing link-in-bio tools and fees |
| Patchwork | mutual-aid organizers; frame it as a pre-alpha demo seeking feedback |

**A direct ask beats a broadcast.** Field experiments on Twitter found direct messages raised petition signing 3.6–4.4 points over the public post alone. *[research-backed]* ([Coppock, Guess & Ternovski 2016](https://alexandercoppock.com/coppock_guess_ternovski_2016.html)) When a product is ready for testers, ask specific people by hand. The drafting system prepares the ask; a person sends it.

## 3. Build in public, with limits

**Share process, small and often.** Austin Kleon's *Show Your Work!* argues for sharing process rather than only finished products and sharing "something small every day". *[practitioner consensus]* ([Austin Kleon](https://austinkleon.com/show-your-work/)) Seeing work being done raises its perceived value in experiments. *[research-backed]* ([Buell & Norton 2011](https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1376))

**Weekly technical devlogs can sustain an audience for years.** Factorio's Friday Facts have run weekly since 2013. *[practitioner consensus]* ([Friday Facts #1](https://factorio.com/blog/post/fff-1))

**Known downsides:** practitioners report copycats after sharing revenue, oversharing a roadmap, and posting only wins as bragging. *[practitioner consensus]* ([Indie Hackers discussion](https://www.indiehackers.com/post/lifestyle/is-this-the-end-of-build-in-public-heres-why-top-indie-hackers-are-suddenly-disappearing-IhSJQBnXNuNwSuNTuz4t)) For SUBCULT the larger risk is different: the review pipeline's internal vocabulary leaking into public posts (VOICE.md already bans it), and posts that describe infrastructure changes no reader can see.

What to share, in rough order of reader value:
1. Something a reader can use now (a feature, a how-to, a link that works).
2. A problem met and how it was solved, with a capture.
3. A decision and its reason, including what we gave up.
4. A failure or limit, stated plainly with what happens next.
5. Numbers we can verify from the claims register (never invented).

## 4. Cadence and consistency

**Consistency is associated with growth; extreme volume is not required.** Buffer's within-account analysis of 2.1M Instagram posts: weeks with no posts underperformed the account's own baseline; 3–5 posts a week was associated with roughly double the follower growth rate of 1–2. *[practitioner consensus, observational]* ([Buffer, August 2025](https://buffer.com/resources/how-often-to-post-on-instagram/)) Buffer's 2026 report found the top 10% of accounts post more consistently than the median. *[practitioner consensus, observational]* ([Buffer 2026](https://buffer.com/resources/state-of-social-media-engagement-2026/)) These are correlations among Buffer customers; accounts that post more may also differ in other ways.

**On X, bursts compete with themselves.** The ranking code applies a decaying multiplier to each additional post from the same author in a viewer's feed, and drops posts older than 48 hours. *[platform-documented]* ([x-algorithm README](https://github.com/xai-org/x-algorithm))

**No universal best time.** Vendor "best time" studies differ by platform and sample; our earlier research found no platform-independent best hour. *[practitioner consensus]* ([Posting Best Practices](../Posting%20Best%20Practices.md))

Rule: a sustainable rhythm the collective can keep for months, spread across the week, with quiet weeks allowed when there is nothing true to say. A filler post to maintain cadence is worse than a gap if it makes people mute us; X weights mute at −58.8 and "not interested" at −47.52 against 0.5 for a like (probability-weighted). *[platform-documented]* ([param.rs](https://github.com/xai-org/x-algorithm/blob/main/home-mixer/params/param.rs))

## 5. Replies and community management

**Replying is associated with more engagement on every platform Buffer measured** (Threads +42%, Instagram +21%, X +8%, Bluesky +5%), with the caveat that good posts attract more comments to reply to. *[practitioner consensus, observational]* ([Buffer 2026](https://buffer.com/resources/state-of-social-media-engagement-2026/), [Instagram study](https://buffer.com/resources/instagram-comments-engagement/))

**X now boosts replies between mutual follows.** *[platform-documented]* ([BIDIRECTIONAL_BOOST_CHANGE.md](https://github.com/xai-org/x-algorithm/blob/main/docs/BIDIRECTIONAL_BOOST_CHANGE.md)) **Bluesky ranks replies from a viewer's social neighborhood higher and down-ranks toxic or off-topic replies.** *[platform-documented]* ([Bluesky, October 2025](https://bsky.social/about/blog/10-31-2025-building-healthier-social-media-update))

**Automated replies are prohibited or treated as spam** on X and Bluesky. *[platform-documented]* ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation), [Bluesky developer guidelines](https://docs.bsky.app/docs/support/developer-guidelines))

Practice: Patrick and collective members reply by hand in set windows. Answer questions with the actual answer; thank bug reporters and say what happened to their report (the IKEA effect fades when a contribution goes nowhere, [Norton et al. 2012](https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2011.08.002)). Do not argue with bad-faith replies; use the platforms' reply controls.

## 6. Collaborations and cross-posting

- **Instagram Collab posts** put one post on several profiles with shared counts. *[practitioner consensus]* ([Buffer guide](https://buffer.com/resources/instagram-collab-post/)) Crediting a collaborator this way also counts as original rather than reposted content in Instagram's 2026 originality guidance. *[platform-documented as reported]* ([PetaPixel](https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/))
- **Bluesky starter packs** account for about a fifth of follows on the network and mostly strengthen existing communities. *[research-backed]* ([arXiv 2501.11605](https://arxiv.org/abs/2501.11605)) Making a pack of peers (other indie tool makers, venue-software people, Twitch tool builders, left musicians) is low-cost and generous.
- **Collaborations that make sense:** a musician using Undertow for a release video; a small venue trying Subcult OS at a door; a streamer community whose clips clpr surfaces; an archivist who tests Rekolekt. Each produces original material and a second audience. Ask by hand.
- **Cross-posting:** X forbids duplicate or substantially similar posts across accounts one operator controls. *[platform-documented]* ([X automation rules](https://help.x.com/en/rules-and-policies/x-automation)) Instagram demotes reposted, unchanged material in recommendations. *[platform-documented as reported]* ([TechCrunch 2024](https://techcrunch.com/2024/04/30/instagram-is-updating-its-ranking-systems-to-surface-more-content-from-smaller-original-creators)) Adapt each post to the platform and the account; the same news can be one devlog, one SUBCULT post and one Patrick post, each saying something different.

## 7. Measurement without vanity metrics

**Vanity metrics make you feel good and do not inform decisions.** Eric Ries's distinction: an actionable metric ties a specific change to an observed result. *[practitioner consensus]* ([Ries, 2009 guest post](https://tim.blog/2009/05/19/vanity-metrics-vs-actionable-metrics/))

**Stars and follower counts can be bought.** A CMU/NCSU/Socket study identified about six million suspected fake GitHub stars across 15,835 repositories (July 2019–December 2024). *[research-backed]* ([arXiv 2412.13459](https://arxiv.org/html/2412.13459v2)) The CHAOSS project treats stars, commit counts and release counts as incomplete signals of community health. *[practitioner consensus]* ([CHAOSS metrics](https://github.com/chaoss/metrics/blob/main/README.md))

**Platform-native ratios beat raw counts.** Instagram's own guidance is to watch average watch time, likes per reach and sends per reach. *[platform-documented as reported]* ([Social Media Today](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/))

What to track weekly, each with its definition and denominator (extends the review in [Posting Best Practices](../Posting%20Best%20Practices.md)):

| Signal | Why it matters | Source of the number |
|---|---|---|
| Sends/shares per reach | people forwarding to someone specific | Instagram insights; X share counts |
| Substantive replies (count, by hand) | conversation, questions, bug reports | read the replies |
| Link clicks to a product or devlog | interest beyond the feed | site analytics, UTM per post |
| Product actions after a post (sign-up, page created, install, archive search) | actual use | product logs, per day |
| New free and paid Patreon members, and cancellations | support | Patreon dashboard |
| Mutes, "not interested", unfollows where shown | cost of a post | platform insights |

Ignore: impressions alone, follower totals without a source of growth, GitHub stars, draft counts. One popular post is an anecdote; compare similar posts over several weeks before changing a format.

## 8. Myths

- "Post every day or the algorithm forgets you." No platform documents this; Buffer's data show gains from 1–2 posts a week over zero. *[folklore/unverified]*
- "Hashtags grow reach." Instagram says hashtags help search, not reach; X recommends at most two. *[platform-documented]*
- "Put links in replies on X." X says the penalty ended about mid-2025. *[platform-documented as reported]*
- "Going viral is how small projects grow." Most indie-game wishlists come from other channels; Zukowski argues viral posts are hard to plan. *[practitioner consensus]* ([Is going viral all luck?](https://howtomarketagame.com/2022/01/17/is-going-viral-all-luck/))
- "Reddit's 10% rule is policy." It is informal; each community sets its own rules. *[practitioner consensus]*
