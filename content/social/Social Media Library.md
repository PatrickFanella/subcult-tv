---
title: Social Media Library
type: work
status: active
stage: library
created: 2026-10-01
updated: 2026-10-01
---

# Social media library

A local library for the six products and occasional Common House material, governed by [[Posting Best Practices]] and [[Social Posting Automation Plan]]. The authoritative catalog is `Media Library/catalog.json` beside this note. Originals live in `Media Library/files/`; the generated `Media Library/index.html` is an offline visual gallery. No paid storage service or image API key was added.

## First original assets

| Asset | Intended use | Format | State |
| --- | --- | --- | --- |
| MEDIA-5e7870f5bc934f2b | HasanAra/Rekolekt: preserving archive context | 1536 × 1024 PNG, 3:2 | Generated concept illustration; needs editorial review |
| MEDIA-12c8b3fbf77f61af | CLPR: discovering and selecting a moment | 1254 × 1254 PNG, square | Generated concept illustration; needs editorial review |

![[Media Library/files/MEDIA-5e7870f5bc934f2b.png]]

![[Media Library/files/MEDIA-12c8b3fbf77f61af.png]]

Both images were inspected in this session. They are stylized concept artwork, not real product screens, streamer footage or news photography. Each has descriptive alt text and generation provenance in the catalog. Both fit the conservative X static-image size limit. Their availability does not approve a post or prove any product workflow.

## Catalog fields

Each record has a stable content-hash ID, title, original file, SHA-256, dimensions, byte size, duration where applicable, product tags, eligible accounts/platforms, kind, source, recorded rights, attribution, alt text, generation prompt, review state and uses. `uses` is a place for actual reuse history, not invented publication analytics; future published-use entries require a real published URL and observation date. It is initially empty.

- `needs_review`: imported/generated and available to propose in a draft; rights, crop, privacy, typography, accessibility and account fit still need editorial review.
- `ready`: an editor has completed asset checks. This remains separate from approval of exact copy, account and posting time.
- `retired`: retained for recovery/history, excluded from new selections.
- `unknown` rights: cataloged for investigation, excluded from runner media choices. A recorded rights category does not certify a legal conclusion. Licensed assets retain source/license and attribution requirements.

Never put real private aid requests, guests, email addresses, tokens or internal URLs into a capture. Use synthetic demonstration data. Product workflow proof needs current real captures; generation cannot replace it. Do not generate documentary-looking political events or endorsements.

## Local commands

From the canonical vault root:

```bash
python scripts/social-posting/media.py audit
python scripts/social-posting/media.py search --product clpr
python scripts/social-posting/media.py gallery
python scripts/social-posting/media.py add /path/to/capture.png --title "CLPR creator browsing" --products clpr --accounts clpr,patrick,subcult --platforms x,instagram --rights user_owned --kind screenshot --source-ref "Current capture; synthetic account; source revision and capture date" --alt-text "Description of the visible workflow."
```

The CLI uses installed `ffprobe` for dimensions/duration and copies originals without replacing existing assets. It deduplicates identical bytes, confines catalog paths, verifies hashes, and starts every new asset at `needs_review`. Use `--attribution` to record license terms and required credit for licensed material. Gallery generation is local; it does not upload files. Review and update catalog metadata deliberately, then run `audit` and rebuild the gallery.

## Planner integration and generation

Weekly and timely jobs receive this catalog plus the dated best-practices guide. Every new draft has a media choice: `none`, `library`, `generate` or `capture`, exact asset IDs when relevant, a production brief and proposed alt text. Library references are validated against current files, hash, account/platform eligibility and conservative X still-image limits. An existing illustration remains an illustration.

Requests for a new illustration or real capture are saved as `media-requests.json` in the private run directory and shown in the draft note. This is an automatic production-request queue, not unattended image rendering. Built-in image generation is available during interactive agent work and was used for the two initial assets. No unattended paid API generation, media upload, Buffer attachment or publication is installed. Instagram and Patreon can reuse eligible material after their account and delivery paths are proved.

For the remaining-week trial, attach concept art only when it helps explain the point; preserve each draft's live-workflow and asset checks. Keep old generated artwork and release media in their current locations until deliberately imported with source/rights information. No existing artwork was deleted or automatically treated as cleared.


## Bluesky and product media — October 1

[[Bluesky Posting Plan]] adds three intended account identities and local draft variants. Direct delivery remains pending account setup and authentication. [[Social Media Production]] covers real screenshots, original recording masters and captioned short edits. Keep the agreed cadence; choose a useful format and test outcomes from actual published posts.


## Account branding

[The October 1 branding pack](Branding/2026-10-01/README.md) contains the three applied Bluesky profile identities and reusable X assets. Profile avatars and banners stay outside the post-media catalog so the preparation runner does not select them as ordinary post attachments.
