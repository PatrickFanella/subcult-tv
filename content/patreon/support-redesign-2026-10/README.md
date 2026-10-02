# SUBCULT support redesign

Prepared October 2, 2026. Status: review draft; no Patreon settings, Discord roles, website deployments, timers or publishing tasks were changed.

The owner requested $5 / $10 / $25 tiers, light and mostly shared rewards, private Discord channel access, occasional exclusive releases and behind-the-scenes posts, and no promised schedule. The owner also wants Groceries at $400/month and Rent at $1,500/month retained as humorous, optional larger contributions. This proposal replaces the fixed weekly/monthly offer in earlier plans once the owner approves the copy and the live offer is updated. Until then, those plans remain historical context and this folder supplies proposed copy only.

- [Patreon copy and rewards](patreon-copy.md): descriptions to paste, welcome post, benefit boundaries and migration steps.
- [Site support guidelines](site-guidelines.md): destinations, placements, copy and product-specific rules.
- [Visual review](index.html): artwork and proposed tier presentation. This is a Studio review page, not a replica of Patreon.
- [Asset guide](asset-guide.md): exports, design roles, provenance and regeneration.

## Evidence

- Read the selected SUBCULT guide, tokens, outlined mark and current brand registry in this checkout.
- Inspected the live `https://subcult.tv/support` page through the T3 browser on October 2. Its introduction promises weekly notes, a monthly ledger, early previews and $10 Backer; the same page lists Free, Supporter $5, Backer $10, Sponsor $15, Patron $25, Underwriter $50 and Rent $1,425. This mismatch needs a companion site change.
- The live navigation lists nine products. Guidelines cover those nine, the umbrella site and Patrick's personal site. Assmold is a conditional appendix, outside the current Studio brand catalog.
- The Patreon page at `https://www.patreon.com/subcult` stopped at Cloudflare security verification. Authenticated settings, current membership, benefits and billing were not inspected. The October 1 campaign's zero-patron observation is not proof of today's membership count.
- Prichal and Left Field descriptions were read from the companion subcult-tv source at `/home/onnwee/Work/Subcult/subcult-tv/src/lib/product-landings.ts`; their app journeys were not verified. Existing [Product Claims Register](../../social/Product%20Claims%20Register.md) supplies the other product boundaries.
- The owner confirms that Discord has private channels. Patreon-to-Discord role assignment and channel permissions still need verification.

## Activation order

1. Review the tier names, shared rewards and copy in this folder.
2. Inspect the live Patreon account, existing members and Discord access. Record the actual page and billing state privately.
3. Publish the approved Patreon offer and artwork. Verify public rendering and access with appropriate member accounts.
4. Update subcult.tv's Support page and shared prompts in its own repository. Replace the entire seven-tier list and all cadence promises together.
5. Apply the site-specific placements in each product's repository. Update the earlier campaign and automation copy sources in the same release so they cannot regenerate old prices or promises.

Activation does not require adding a content schedule. Preparation jobs may continue their existing internal cadence without advertising a recurring reward.

## Local verification

Eight SVG masters parsed and rendered into nine upload PNGs plus an internal review sheet. Source/output hashes and local document links passed. Rendered artwork was visually inspected. The T3 browser loaded the desktop review page, all seven displayed images and its fonts; its measured document width did not exceed the viewport. Phone-size resize calls timed out, so mobile rendering and actual Patreon crops remain unverified. PNG files match the repository's Git LFS rules. Existing brand masters were not edited.

The local review server is served from this worktree at `http://127.0.0.1:18771/content/patreon/support-redesign-2026-10/index.html`; it is not a deployment. Reopen it from the repository root with `rtk proxy python -m http.server 18771 --bind 127.0.0.1 --directory .` when no server is using that port.
