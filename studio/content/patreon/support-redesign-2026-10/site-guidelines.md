# How SUBCULT sites present support

Proposed policy, October 2, 2026. Activate after the Patreon offer is published and verified. Existing sites were not modified by this draft.

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

The placements below are proposed, not a record of current implementation. Descriptions use Studio's claims register or the companion catalog source; recheck any launch/access claim before deployment.

| Site | Placement | Suggested copy | Boundary |
| --- | --- | --- | --- |
| **subcult.tv** | Navigation, footer and dedicated Support page; one secondary ask on product landings | **Keep the studio going.** Support the software, sound and creative work behind SUBCULT. Join on Patreon for private Discord channels, supporter posts and occasional BTS material or exclusive releases. No fixed schedule. | Replace the conflicting seven-tier list and old cadence promises together. All five paid tiers share access; keep Groceries/Rent secondary. |
| **patrickfanella.co / Patrick__eff** | Footer and after an owned release or longer process post | **Support the work behind the releases.** I make software, sound and creative work through SUBCULT. You can support the studio on Patreon. | Use first person on Patrick's site. Show the author's voice and personal work rather than product infrastructure copy. Groceries/Rent can appear on a dedicated personal support page, not every release. |
| **clpr.tv** | Marketing-page footer; About/Help in the app | **Help keep clip discovery going.** Support SUBCULT, the studio building CLPR. | Do not imply affiliation with Twitch or that payments go to featured streamers. Support is separate from saving, playlists, creator verification and product plans. |
| **patchwork.subcult.tv** | Footer and About, outside request/offer flows | **Support the people building Patchwork.** Contributions support SUBCULT's work on community tools. | Distinguish studio support from mutual aid. Never call it a local aid fund, promise help or attach asks to an aid request. Keep the pre-alpha demonstration label visible. |
| **hasanara.tv** | Footer and archive About; optional small link after source context | **Help maintain the archive tools.** Support SUBCULT, the studio behind HasanAra. | Clearly state on the support explanation that this supports SUBCULT, not HasanAbi. Do not imply creator endorsement, transcript ownership or guaranteed archive coverage. Keep results and source timestamps unobstructed. |
| **Rekolekt** | Its subcult.tv product landing; default deployment About only where the operator agrees | **Support the software behind searchable archives.** Back SUBCULT's work on Rekolekt. | No public standalone destination is listed in the brand registry. Do not invent one. Third-party archive operators choose their own support links; do not silently replace them with SUBCULT. |
| **os.subcult.tv / Subcult OS landing** | Marketing page and About/Help; outside ticket and door operations | **Support the tools behind independent events.** Back SUBCULT's work on Subcult OS. | Separate studio membership from ticket sales, event donations, paid plans and payout qualification. No support prompts in checkout, check-in or settlement. |
| **undertow.subcult.tv** | Landing footer and editor About; optional secondary text after a successful export | **Support the studio behind Undertow.** Help sustain our work on music visuals and creative tools. | Never advertise Patreon as unlocking export quality, cloud rendering, fast 4K output or paid plans. No modal during rendering and no ask on export failure. |
| **kork.subcult.tv** | Platform landing/footer and editor Help/About | **Support the studio building Kork.** Back SUBCULT's work on creator tools. | Creator pages keep their own tip/payment buttons. Do not insert competing Patreon asks there or imply creator tips fund SUBCULT. Patreon is separate from any future Kork plan. |
| **prichal.subcult.tv / Prichal landing** | Public product information/footer | **Support the work behind Prichal.** Back SUBCULT as we develop hosting for the open social web. | Catalog source says private preview. Patreon does not purchase a server, guarantee hosting, reserve a place or include service support. |
| **Left Field** | subcult.tv product landing; future methodology/About footer | **Support the research tools behind Left Field.** Back SUBCULT's development work. | The catalog has not announced a public app destination. Avoid campaign-donation language, policy influence, purchased research conclusions or claims that scores predict results. |

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
