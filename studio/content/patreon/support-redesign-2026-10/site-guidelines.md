# How SUBCULT sites present support

Original proposal: October 2, 2026. Support-link implementation baseline reviewed October 20, 2026 at the owner’s request. The public offer now matches the revised tier descriptions; checkout and Discord entitlement remain separate verification gates. See the dated coverage section below.

## Shared message

> Support SUBCULT, the studio behind this project. Paid members get private Discord channels and supporter posts, with occasional BTS material and exclusive releases. There is no fixed publishing schedule.

Use the full message on the umbrella Support page. Product pages should use a short, relevant reason to support and a link. Every ask must make clear that it supports SUBCULT; do not imply the money is restricted to a particular project.

Keep the $5 / $10 / $25 tiers prominent on the central page. Place Groceries and Rent afterward under “Feeling unusually generous?” with the same rewards and a clearly displayed monthly amount. Preserve the owner's joke; do not use these tiers in product banners or describe them as expected contributions. Never imply that a high contribution buys personal access, priority support or authority.

## Link destinations

| Label or context | Destination | Purpose |
| --- | --- | --- |
| Support this project / Support SUBCULT | `https://subcult.tv/support` | Explain who receives support, the shared studio and current offer |
| Join on Patreon / Support on Patreon | `https://support.subcult.tv` | Go to membership selection; verify that this custom domain reaches the correct creator page before rollout |
| Follow free on Patreon | `https://support.subcult.tv` | Find Patreon's free follow option; label it only after checking its visibility |
| Direct Patreon fallback | `https://www.patreon.com/subcult` | Use only if the branded destination fails and this creator destination has been verified |
| Send a tip / Support this creator | Creator's own configured destination | On user-owned pages, preserve the creator's payment destination |

On product sites, default to the central Support page. A contextual module may have a direct “Support on Patreon” action if its copy already names SUBCULT. Use the same tab by default. If opening a new tab, expose that behavior accessibly and use `rel="noopener noreferrer"`.

Avoid tier-specific checkout URLs in ordinary navigation; they become stale when tiers change. Keep prices on the central offer and Patreon, rather than hardcoding them across product footers. Verify the live offer matches before displaying even the central prices.

## Placement and behavior

- **Umbrella site:** Support in main navigation and footer; full explanation and tiers on `/support`. Keep the product catalog as the main action on product-discovery pages.
- **Product marketing pages:** one contextual support block after the product explanation or demonstration, plus a quiet footer link. Avoid repeating the ask several times on one page.
- **Working applications:** footer, About or Help placement. An optional completion-state link may follow a successful action only if it stays secondary and requires no dismissal. Do not interrupt searching, saving, exporting, check-in or publishing.
- **Small screens:** a footer/text action or support entry in the navigation menu. No sticky donation bar competing with the primary controls.
- **Failures and vulnerable situations:** no support ask in error messages, recovery flows, aid-request forms or unsuccessful exports. Never make contributing appear necessary to recover data or complete a task.
- **Creator-owned public pages:** preserve the creator's calls to action. SUBCULT support belongs on the platform's own marketing site and editor Help/About, not as a competing tip button on someone else's page.

## Visual rules

Patreon and the central Support page use the selected Culture / poster press system: purple `#8b5cf6`, dark ink `#100b19`, acid green `#00ff88`, paper `#f0ece4`; Oswald headlines, Space Grotesk body text and JetBrains Mono labels. Preserve the existing mark's geometry and layers.

Product sites keep their existing palette, typography and button shapes. A support module should look native to its host product. Use “by SUBCULT” or a small existing SUBCULT mark to identify the studio without replacing the product identity.

Use dark text on purple or green. Green on purple is suitable for decoration or large type, not small labels. Keep body text at least 4.5:1 contrast and large text at least 3:1. Test keyboard focus, readable link names and touch targets of at least 44 × 44 CSS pixels for prominent buttons. Avoid flashing, countdowns, fake scarcity, invented testimonials and unverified member counts.

## Site-specific copy and boundaries

The placements below are proposed, not a record of current implementation. Descriptions use Studio's claims register or the companion catalog source; recheck any launch/access claim before deployment. Each line is written in that product's voice from [the voice guide](../../VOICE.md), so the asks do not repeat one sentence with the product name swapped.

| Site | Placement | Suggested copy | Boundary |
| --- | --- | --- | --- |
| **subcult.tv** | Navigation, footer and dedicated Support page; one secondary ask on product landings | **The software, sound and creative work cost hosting, tools and hours.** You can help us cover them. Join on Patreon for private Discord channels, supporter posts and occasional BTS material or exclusive releases. No fixed schedule. | Replace the conflicting seven-tier list and old cadence promises together. All five paid tiers share access; keep Groceries/Rent secondary. |
| **patrickfanella.co / Patrick__eff** | Footer and after an owned release or longer process post | **I make software, sound and creative work through SUBCULT.** If you want to put money toward that, the studio has a Patreon. | Use first person on Patrick's site. Show the author's voice and personal work rather than product infrastructure copy. Groceries/Rent can appear on a dedicated personal support page, not every release. |
| **clpr.tv** | Marketing-page footer; About/Help in the app | **Somebody has to pay for the servers.** That's SUBCULT, the studio that builds clpr. You can chip in. | Do not imply affiliation with Twitch or that payments go to featured streamers. Support is separate from saving, playlists, creator verification and product plans. |
| **patchwork.subcult.tv** | Footer and About, outside request/offer flows | **Patchwork is built by SUBCULT.** If you would like to support the people building it, your contribution goes to the studio and its work on community tools. It does not go to anyone's request. | Distinguish studio support from mutual aid. Never call it a local aid fund, promise help or attach asks to an aid request. Keep the pre-alpha demonstration label visible. |
| **hasanara.tv** | Footer and archive About; optional small link after source context | **The archive tools are maintained by SUBCULT, a studio that would welcome support from viewers like you.** Contributions go to SUBCULT, not to HasanAbi. | Clearly state on the support explanation that this supports SUBCULT, not HasanAbi. Do not imply creator endorsement, transcript ownership or guaranteed archive coverage. Keep results and source timestamps unobstructed. |
| **Rekolekt** | Its subcult.tv product landing; default deployment About only where the operator agrees | **Rekolekt is maintained by SUBCULT.** Supporting the studio helps it keep working on the software behind searchable archives. | No public standalone destination is listed in the brand registry. Do not invent one. Third-party archive operators choose their own support links; do not silently replace them with SUBCULT. |
| **os.subcult.tv / Subcult OS landing** | Marketing page and About/Help; outside ticket and door operations | **Not on the run sheet: who pays for the software.** SUBCULT builds Subcult OS for independent events. You can support the studio. | Separate studio membership from ticket sales, event donations, paid plans and payout qualification. No support prompts in checkout, check-in or settlement. |
| **undertow.subcult.tv** | Landing footer and editor About; optional secondary text after a successful export | **Undertow comes out of SUBCULT.** Support the studio and you help sustain our work on music visuals and creative tools. | Never advertise Patreon as unlocking export quality, cloud rendering, fast 4K output or paid plans. No modal during rendering and no ask on export failure. |
| **kork.subcult.tv** | Platform landing/footer and editor Help/About | **Kork is free and takes no cut of your tips. This is the tip jar for the people who build it.** Support SUBCULT, the studio behind Kork and its other creator tools. | Creator pages keep their own tip/payment buttons. Do not insert competing Patreon asks there or imply creator tips fund SUBCULT. Patreon is separate from any future Kork plan. |
| **prichal.subcult.tv / Prichal landing** | Public product information/footer | **Prichal is developed by SUBCULT.** Supporting the studio helps us keep working on hosting for the open social web. It does not buy or reserve a server. | Catalog source says private preview. Patreon does not purchase a server, guarantee hosting, reserve a place or include service support. |
| **Left Field** | subcult.tv product landing; future methodology/About footer | **Left Field is research software from SUBCULT.** Support goes to the studio's development work. It does not buy a conclusion. | The catalog has not announced a public app destination. Avoid campaign-donation language, policy influence, purchased research conclusions or claims that scores predict results. |
| **headcount.subcult.tv** | Site-wide footer of the dashboard; nothing inside the leaderboard, search or charts | **Headcount is built by SUBCULT. Counting every minute takes a server, and the studio pays for it.** Support SUBCULT. The money goes to the studio, not to any channel, and it doesn’t change a score. | Implemented October 19, 2026 (headcount `df2fa4a`), linking to the central Support page. Never suggest that paying affects a score, removes a channel or buys a review. Do not imply Twitch affiliation or that money reaches a tracked streamer. No ask near a channel’s score or on error pages. |

### Other properties

**Assmold:** if retained in the owned-site rollout, use a footer or About link with “Support the studio behind this archive.” Identify SUBCULT as the recipient; do not imply Asmongold endorsement or payment to him. Refresh its actual identity, branding and deployed support component before applying this policy. It is outside the current eleven-brand Studio registry.

For another owned site, first establish the product name, operator, current status, existing support/payments, primary task and destination. Add a specific row before implementation. Do not distribute this policy automatically to private infrastructure, client sites or unannounced creative projects.

## Safe copy before reward activation

Until Discord access and the new Patreon offer are verified, use:

> Support SUBCULT, the studio behind this project.

Link to the central Support page only if that page accurately describes the current offer. A review draft is not enough to advertise access or prices.

## Rollout and ongoing consistency

1. Verify the actual Patreon offer and branded destination.
2. Update the umbrella Support page: tiers, intro, FAQ, benefit descriptions and bottom call to action.
3. Update shared site components and product landings from the same approved wording. Add contextual product copy from the table.
4. Update Studio's earlier campaign, relaunch/positioning copy and any automation templates that still advertise weekly notes, monthly ledgers, $10-only membership or seven tiers. Preserve dated historical records and runtime schedules; revise current promotional sources explicitly.
5. Check desktop and phone rendering, keyboard navigation, overflow, link destination, creator identity and checkout price. Verify that normal app tasks continue without payment prompts.
6. Record the source revision and deployment evidence per repository. Never call a local preview a live rollout.

Measure support-link clicks with existing first-party, consent-aware analytics where configured. Count site visits/clicks separately from Patreon joins; a click is not a conversion. Do not add third-party pixels, member identifiers or personal email addresses to link parameters. Source labels, if needed, should be coarse site names and must survive a tested redirect; do not assume arbitrary campaign parameters work on the custom domain.

## October 20 coverage and review baseline

The owner requested a cross-project audit and reviewable fixes on October 20, 2026. Use the placement, destination and recipient rules above as the implementation baseline. The public branded Patreon destination and its five paid tier descriptions were read back on that date: Supporter $5, Backer $10, Patron $25, Groceries $400 and Rent $1,500 per month, with shared access and no fixed schedule. This observation does not prove checkout, Discord entitlement or access removal. Retain those separate activation checks.

The public catalog had 23 products during the audit; current source also includes Headcount. Product landings use one contextual support block plus a quiet footer link. The shared promotional footer block is suppressed on individual product landings and the Support page. Each product names SUBCULT as recipient and explains its own payment or ownership boundary; prices and reward descriptions remain centralized.

### Additional owned properties

| Property | Placement and boundary |
| --- | --- |
| Headcount | Quiet footer or methodology/About. Support goes to SUBCULT, not channels, and cannot change a score. |
| Commons | Platform footer/About. Contributions support SUBCULT, not a listed project or builder; preserve their own funding links. |
| Chatty Cat | Help/About or quiet application footer. Separate studio support from Twitch subscriptions and channel tips. |
| Backline | Public pilot landing footer and dashboard About. Membership does not grant installation, pilot access or moderation services. |
| Subsets | Standalone landing footer. Support is optional and separate from local folder ownership. |
| Tadooer | Public product landing. Private owner installations need no promotional ask; an operator may choose an About link. |
| Arkhiv | Platform footer/About. Support software maintenance; do not sell access to collections or imply a reuse license. |
| Lineage | About/credits or platform footer only if compatible with each recording policy. Name SUBCULT; preserve taper/source credits. |
| Anarchist Archive and Riot Grrrl Archive | Quiet platform footer/About. Explain studio software support, with no purchase or licensing of documents. |
| Bill Nye TV and Democracy Now archive viewers | Preserve source and rights context. Do not add a competing funding ask beside third-party programming; use the Arkhiv product landing for studio support. |
| Dedhed | Deliberate exception: no support solicitation. Preserve its free, noncommercial audience-recording policy and source credits. |
| Overlaid | Public product landing; optional operator About. No asks in browser-source overlays, failures or live controls. |
| Signed & Sent / envelope editor | Quiet footer naming SUBCULT and linking to the central page. Keep export controls primary. |
| Clustr | Quiet footer or field guide, outside the visualization. Contributions support SUBCULT, not communities represented in the graph. |
| Desktop/editor plugins and developer tools | Public product landing; optional Help/About in the tool. No payment prompt in a task, microphone permission, recovery or failed command. |
| Patrick Fanella portfolio | Quiet footer in first person. Support goes to SUBCULT; keep role inquiries and case studies primary. |

Private infrastructure, login gates, client properties and unannounced creative projects are outside automatic rollout. SUBCORP and Edda need an operator/status review before adding a support ask; public reachability alone does not establish inclusion. Creator-owned Kork pages and Commons listings keep their creators own payment destinations.

### HTML metadata and discovery

For public pages, inspect initial HTML as well as the rendered DOM: descriptive titles and descriptions, canonical URLs, accurate social metadata, existing images that return the expected media type, and valid crawler endpoints. A JavaScript-updated title is not the initial HTML. A 200 response containing the app shell is not a robots file or sitemap. List only public canonical pages in a sitemap. Private account, operator, preview and recovery routes keep their indexing boundaries. Do not remove an intentional noindex rule to improve a checklist score. Schema data describes only visible, supported claims; no invented ratings, prices, authorship or launch status.
