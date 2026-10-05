---
title: Bluesky Posting Plan
type: work
status: active
stage: preparation
updated: 2026-10-03
---

# Bluesky posting plan

Bluesky uses the same product bank, media library and account voices as X (see the [voice guide](../VOICE.md)). Patrick covers personal development decisions, culture and left politics. SUBCULT covers the seven products and independent culture. CLPR covers clip discovery and creator tools. The agreed account cadence is the initial ceiling on this platform too. An X draft and its Bluesky variant are related proposals; neither proves the other was published. Review mentions, links and native quotes for the platform each copy is going to.

## Identity and connection

| Account | Intended handle | Observed October 1 | Remaining work |
| --- | --- | --- | --- |
| Patrick | patrick.subcult.tv | Public profile and DID verified: did:plc:ejcntv5r7vlj4nf2tsxijdnh | Authenticate the direct delivery path |
| SUBCULT | subcult.tv | Existing DID did:plc:lxw2hm6sbsloliijglqvgj7d now has public handle subcult.tv, display name SUBCULT and product-focused bio | Profile/handle change completed and publicly verified; authenticate the unattended delivery path |
| CLPR | clpr.subcult.tv | User completed registration. Public profile, DID did:plc:7fggonbgx2l7n3yvvadaeigt and personal PDS https://pds.subcult.tv verified; PDS admin readback shows active | Profile branding completed; authenticate the unattended delivery path |

The main brand uses the root-domain handle, not subcult.subcult.tv. A domain can be a full Bluesky handle as long as DNS verification and the account's declared handle agree. The user approved repurposing the older onnwee.bsky.social account for SUBCULT. Handle, display name and bio were changed through the authenticated browser and read back independently through the public API. The old personal avatar was removed. The DID, 1,037 followers and 222 existing posts were kept. The account UI says the former provider handle remains reserved. A protected snapshot of the public profile is kept for recovery. No new post was submitted. [Official domain-handle guide](https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial)

Buffer workspace My Organization reports three channel slots, all occupied by the three connected X accounts. Keep those channels. A direct AT Protocol delivery path would avoid a paid Buffer subscription. It is planned; it is neither authenticated nor installed for dispatch. Account creation, email confirmation and authentication need the user's own account session. Credentials belong in protected local storage, never in vault notes or chat. [Buffer channel limits](https://support.buffer.com/en-us/articles/connecting-your-channels-to-buffer-HvWLgAJvL9)

## Implemented preparation

The weekly and timely runners write `bluesky-drafts.json` into each private run directory. A variant holds the intended handle, the expected DID when verified, connection state, text, proposed date, media IDs and the checks still open. Variants stay unapproved and cannot publish. Existing copy of at most 280 code points fits inside the 300-grapheme post limit with room to spare; UTF-8 byte limits are checked separately. All of this is local preparation. No authenticated Bluesky publication has been tested.

X mentions are flagged so a verified Bluesky handle can replace them. A link to a tweet stays an external link and is never turned into a native Bluesky quote. Before it creates a record, a future dispatcher must resolve native links and mentions, build correct UTF-8 facets, verify the account DID and PDS, and upload media. The preparation export does not do delivery retries, native quoting or analytics.

Image derivatives inherit source provenance and keep their original parent IDs. The current native image lexicon permits up to four images of up to 2 MB each, while Buffer's Bluesky guide still requires images under 1 MB, so the local export uses derivatives below 1 MB. Store alt text per image. Video needs its own provider and account validation: an MP4 that plays locally has not been accepted by Bluesky. [Current post lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json), [image lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json), [Buffer Bluesky guide](https://support.buffer.com/en-us/articles/using-bluesky-with-buffer-7f6OcRnzIO)

## Initial trial variants

Seven variants were prepared from the verified W40 planner result. After the refresh, one selects an archive illustration derivative and one the current HasanAra homepage screenshot; the other five stay text-only or carry capture requirements. All seven are unapproved, and every unattended delivery connection is pending. No posting slots or published counts were added. The Sunday W40 review should report Bluesky as not delivered unless real publication evidence turns up.

[[Social Media Library]] · [[Posting Best Practices]] · [[2026-W40 Social Trial]]

## CLPR account confirmation (October 1)

The user completed CLPR registration and reported saving the password in Bitwarden. Public handle resolution, the DID document and the profile agree on clpr.subcult.tv and https://pds.subcult.tv, and PDS administrator readback confirms the account is active. At registration the profile had zero posts and no display name or bio; branding was applied later the same day. The runner now pins the verified DID and PDS. No Bitwarden secret was retrieved, no password was reset and nothing was posted. Unattended authentication is pending: a saved account password is not an installed publishing connection.

## Profile branding (October 1)

Patrick, SUBCULT and CLPR have the names, bios and images recorded in [the reusable branding pack](../../studies/archive/legacy-profiles-2026-10-01/README.md). All three public profiles were verified independently after saving. Patrick keeps the existing portrait; SUBCULT and CLPR use their existing brand marks. Banners and bios are ready for the user to mirror to X. All three signed-in accounts were seen in the shared switcher before the edits. A later preview resize timed out and reopened the tab signed out, which says something about the browser session and nothing about the verified profile changes. Unattended publishing authentication is pending.
