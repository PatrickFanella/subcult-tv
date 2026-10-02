---
title: Bluesky Posting Plan
type: work
status: active
stage: preparation
updated: 2026-10-01
---

# Bluesky posting plan

Bluesky joins the same product bank, media library and account voices as X. Patrick covers personal development decisions, culture and left politics; SUBCULT covers the six products and independent culture; CLPR covers clip discovery and creator tools. Use the agreed account cadence as the initial platform ceiling. Platform copies are related proposals, not proof that either copy was published. Review mentions, links and native quotes for the destination platform.

## Identity and connection

| Account | Intended handle | Observed October 1 | Remaining work |
| --- | --- | --- | --- |
| Patrick | patrick.subcult.tv | Public profile and DID verified: did:plc:ejcntv5r7vlj4nf2tsxijdnh | Authenticate the direct delivery path |
| SUBCULT | subcult.tv | Existing DID did:plc:lxw2hm6sbsloliijglqvgj7d now has public handle subcult.tv, display name SUBCULT and product-focused bio | Profile/handle change completed and publicly verified; authenticate the unattended delivery path |
| CLPR | clpr.subcult.tv | User completed registration. Public profile, DID did:plc:7fggonbgx2l7n3yvvadaeigt and personal PDS https://pds.subcult.tv verified; PDS admin readback shows active | Profile branding completed; authenticate the unattended delivery path |

Use the root-domain handle for the main brand, rather than subcult.subcult.tv. A domain can be a full Bluesky handle; DNS verification and the account's declared handle must agree. User approved repurposing this older account for SUBCULT. Handle, display name and bio were changed through the authenticated browser and independently read back through the public API. The old personal avatar was removed; DID, 1,037 followers and 222 existing posts were retained. The account UI says the former provider handle remains reserved. A protected public-profile snapshot is retained for recovery. No new post was submitted. [Official domain-handle guide](https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial)

Buffer workspace My Organization currently reports three channel slots, all occupied by the three connected X accounts. Keep those channels. A direct AT Protocol delivery path avoids adding a paid Buffer subscription; it is planned, not authenticated or installed for dispatch. Account creation, email confirmation and authentication require the user's account session. Credentials belong in protected local storage, never vault notes or chat. [Buffer channel limits](https://support.buffer.com/en-us/articles/connecting-your-channels-to-buffer-HvWLgAJvL9)

## Implemented preparation

Weekly and timely runners now write `bluesky-drafts.json` into each private run directory. Variants contain intended handle, expected DID when verified, connection state, text, proposed date, media IDs and explicit remaining checks. They stay unapproved and cannot publish. Existing <=280-code-point copy fits a conservative subset of the 300-grapheme post limit; UTF-8 byte limits are checked separately. This is local preparation, not an authenticated Bluesky publication test.

X mentions are flagged for verified Bluesky replacement. An X tweet link stays an external link and is never falsely turned into a native Bluesky quote. A future dispatcher must resolve native links/mentions, create correct UTF-8 facets, verify account DID/PDS and upload media before it creates a record. No delivery retries, native quoting or analytics are claimed by this preparation export.

Image derivatives inherit source provenance and retain their original parent IDs. The current native image lexicon permits up to four images, each up to 2 MB, while Buffer's Bluesky guide still requires images under 1 MB. The local export uses below-1-MB derivatives for compatibility. Store per-image alt text. Video delivery needs separate provider/account validation; a locally playable MP4 does not prove acceptance by Bluesky. [Current post lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json), [image lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json), [Buffer Bluesky guide](https://support.buffer.com/en-us/articles/using-bluesky-with-buffer-7f6OcRnzIO)

## Initial trial variants

Seven variants were prepared from the verified W40 planner result. The refreshed seven variants select an archive illustration derivative and the current HasanAra homepage screenshot; the other five retain text-only or capture requirements. All seven are unapproved; every unattended delivery connection is pending. No additional posting slots or published counts were invented. The same Sunday W40 review should report Bluesky as not delivered unless actual publication evidence becomes available.

[[Social Media Library]] · [[Posting Best Practices]] · [[2026-W40 Social Trial]]


## CLPR account confirmation — October 1

The user completed CLPR registration and reported saving the password in Bitwarden. Public handle resolution, DID document and profile agree on clpr.subcult.tv and https://pds.subcult.tv; PDS administrator readback confirms the account is active. At registration the profile had zero posts and no display name/bio; branding was applied later the same day. The runner now pins the verified DID and PDS. No Bitwarden secret was retrieved, password reset or account post performed. Unattended authentication remains pending; the saved account password is not an installed publishing connection.


## Profile branding — October 1

Patrick, SUBCULT and CLPR now have the names, bios and images recorded in [the reusable branding pack](Branding/2026-10-01/README.md). All three public profiles were independently verified after saving. Patrick retains the existing portrait; SUBCULT and CLPR use their existing brand marks. Banners and bios are ready for the user to mirror to X. All three signed-in accounts were observed in the shared switcher before edits. A later preview resize timed out and reopened the tab in a signed-out view; current browser-session availability is separate from the verified profile changes. Unattended publishing authentication remains pending.
