---
title: Social Media Library
type: work
status: active
stage: library
created: 2026-10-01
updated: 2026-10-03
---

# Social media library

A local library for the seven products and occasional Common House material, governed by [[Posting Best Practices]] and [[Social Posting Automation Plan]]. The authoritative catalog is `media/catalog.json` in Studio, with originals in `media/files/` and a generated offline gallery at `media/index.html`. In the vault the same folder appears beside this note as `Media Library/`, through a compatibility link. No paid storage service or image API key was added.

## First original assets

| Asset | Intended use | Format | State |
| --- | --- | --- | --- |
| MEDIA-5e7870f5bc934f2b | HasanAra/Rekolekt: preserving archive context | 1536 × 1024 PNG, 3:2 | Generated concept illustration; needs editorial review |
| MEDIA-12c8b3fbf77f61af | CLPR: discovering and selecting a moment | 1254 × 1254 PNG, square | Generated concept illustration; needs editorial review |

![[Media Library/files/MEDIA-5e7870f5bc934f2b.png]]

![[Media Library/files/MEDIA-12c8b3fbf77f61af.png]]

Both images were inspected on October 1. They are stylized concept artwork: not product screens, streamer footage or news photography. Each has descriptive alt text and generation provenance in the catalog, and both fit the conservative X static-image size limit. Having them in the library approves no post and proves no product workflow.

## Catalog fields

Each record has a stable content-hash ID, title, original file, SHA-256, dimensions, byte size, duration where applicable, product tags, eligible accounts and platforms, kind, source, recorded rights, attribution, alt text, generation prompt, review state and uses. `uses` starts empty and records actual reuse. A published-use entry needs a real published URL and an observation date; it is not a place for publication analytics nobody observed.

- `needs_review`: imported or generated, and available to propose in a draft. Rights, crop, privacy, typography, accessibility and account fit still need editorial review.
- `ready`: an editor has completed the asset checks. Approval of exact copy, account and posting time is separate.
- `retired`: kept for recovery and history, excluded from new selections.
- `unknown` rights: cataloged for investigation, excluded from runner media choices. A recorded rights category is not a legal conclusion. Licensed assets keep their source, license and attribution requirements.

Never put real private aid requests, guests, email addresses, tokens or internal URLs into a capture. Use synthetic demonstration data. Proof of a product workflow needs a current real capture, and generation cannot stand in for one. Do not generate documentary-looking political events or endorsements.

## Local commands

From `studio/` (in the vault, the same scripts appear under `scripts/social-posting/`):

```bash
python automation/social-posting/media.py audit
python automation/social-posting/media.py search --product clpr
python automation/social-posting/media.py gallery
python automation/social-posting/media.py add /path/to/capture.png --title "CLPR creator browsing" --products clpr --accounts clpr,patrick,subcult --platforms x,instagram --rights user_owned --kind screenshot --source-ref "Current capture; synthetic account; source revision and capture date" --alt-text "Description of the visible workflow."
```

The CLI reads dimensions and duration with the installed `ffprobe` and copies originals without replacing existing assets. It deduplicates identical bytes, confines catalog paths, verifies hashes, and starts every new asset at `needs_review`. Use `--attribution` to record license terms and required credit for licensed material. Gallery generation is local and uploads nothing. After a deliberate metadata change, run `audit` and rebuild the gallery.

## Planner integration and generation

The weekly and timely jobs receive this catalog and the dated best-practices guide. Every new draft carries a media choice (`none`, `library`, `generate` or `capture`), exact asset IDs when relevant, a production brief and proposed alt text. Library references are validated against current files, hashes, account and platform eligibility, and conservative X still-image limits. An existing illustration stays labeled as an illustration.

A request for a new illustration or a real capture is saved as `media-requests.json` in the private run directory and shown in the draft note. That file is a queue of production requests; nothing renders unattended. Built-in image generation is available during interactive agent work and produced the two initial assets. No unattended paid API generation, media upload, Buffer attachment or publication is installed. Instagram and Patreon can reuse eligible material once their account and delivery paths are proved.

For the October 1–4 trial, attach concept art only when it helps explain the point, and keep each draft's live-workflow and asset checks. Older generated artwork and release media stay where they are until someone imports them with source and rights information. No existing artwork was deleted or treated as cleared.

## Account branding

[The October 1 branding pack](../../studies/archive/legacy-profiles-2026-10-01/README.md) contains the three applied Bluesky profile identities and reusable X assets. Profile avatars and banners stay out of the post-media catalog so the preparation runner does not pick them as ordinary attachments.

Related: [[Bluesky Posting Plan]] for account identities and local draft variants, [[Social Media Production]] for captures, recording masters and short edits.
