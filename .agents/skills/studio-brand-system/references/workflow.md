# Workflow and deliverables

Paths below are relative to the active `subcult-tv` root. Reuse maintained files before adding new ones. The target pack is `studio/brands/<brand>/`, built by the generators in `studio/brand-tools/`; direction studies and reviews belong under `studio/studies/`. Product-owned interface docs stay in their owning repository, with a source link and hash-bound snapshot in Studio when its existing convention calls for one.

## Select a system

Establish the audience, product or collective, practical tasks, tone, required surfaces and existing identity constraints. Resolve missing facts from current docs and implementation before asking the user. For SUBCULT.TV, distinguish the public umbrella website, authenticated Studio interface and product promotional packs; one choice need not replace all three.

Inspect existing guides, tokens, marks and selection records. Decide whether the work extends a selected system, repairs a documented gap or explores a replacement. Do not treat an implementation drift as permission to replace the identity.

Build a focused shortlist from [Studio references](https://subcult.tv/admin/studio/references) and their local studies. Record each reference's catalog ID or path, original source URL, useful design move, capture/observation date where known, evidence limits and reuse rights. Cite the specific lesson: type hierarchy, information density, layout rhythm, imagery, interaction or motif. Avoid copying a third-party logo or signature composition.

When the user has no chosen direction, compare a small number of meaningfully different candidates, usually two or three. Use the same representative content across them: a website section or useful interface state and a promotional application. Show real hierarchy, body text, navigation/action treatment, a small mark and a narrow-screen version. A palette board alone cannot show whether the system works.

Compare audience fit, distinctiveness, legibility, accessibility, fit with existing marks, responsive behavior, licensed font/asset availability and effort to maintain. Explain which references informed each candidate and which choices are original. If proposing a component library, assess its states, semantics, theming, licensing and fit with the actual frontend; a visual style and a component library are different decisions.

Save a brief and selection record using the existing review convention. Record candidate IDs, rationale, status (`proposed` or owner-selected), the owner's decision when available, and the selected source bytes. A request for selection options is complete when the user can compare rendered applications and understand the recommendation and tradeoffs.

## Document the selected direction

Create or update the following as needed for the requested surfaces. Avoid empty files for unused deliverables.

| Deliverable | Required substance |
| --- | --- |
| `GUIDE.md` | Audience, identity and selection status; visual principles; mark variants, clear space and minimum sizes; palette roles and permitted combinations; typography hierarchy; spacing/layout; signature motifs; image/screenshot treatment; voice links and practical examples. |
| `WEBSITE.md` or owning product design docs | Page and information hierarchy, responsive rules, components and interaction states, focus/keyboard behavior, forms/errors, empty/loading states, motion and reduced motion, image usage and where product UI differs from promotional art. |
| `tokens.json` and `tokens.css` | Named semantic color roles, type families/weights/scale, spacing and applicable border/radius/shadow/motion rules. Define units and theme mappings; keep both formats and generators consistent. |
| Selection/source records | Direction status and rationale, reference IDs and URLs, original versus adapted work, font/media licenses, source dates and SHA-256 hashes for authoritative masters and imported bytes. Preserve the pack's existing schemas. |
| `alt-text.md` | Descriptions of actual exported artwork and visible text; label sample descriptions that still need final copy. |
| `asset-manifest.json` | Actual asset paths, sizes/dimensions where relevant, formats and hashes, generated through the existing pack tooling. |

Make the rules usable: show approved text/background combinations, headline/body/label roles, a compact and a wide composition, and component state examples. Distinguish an authored specification from currently implemented behavior. Link guides from the existing library index/catalog using its established process rather than creating a competing documentation tree.

## Produce the assets

Scope the pack to intended use. A complete launch pack may need all rows below; a website-only request may need just identity and web assets. Record omissions and the reason.

| Surface | Typical output |
| --- | --- |
| Identity | Editable mark and wordmark/lockup masters; primary, dark, light and monochrome variants; outlined SVGs for portable type and transparent PNGs at useful sizes. Preserve selected raster masters where applicable. |
| Web/product | Favicon, touch/app icons and maskable variants where used; Open Graph/share card; requested hero or product illustration. Use the actual application's format and size requirements. |
| Social | Avatar, banner, square/landscape/story compositions, quote/release layouts and screenshot frame. Existing Studio conventions include 512×512 avatars, 1500×500 banners and 1080×1920 stories; verify destination requirements and crop overlays when exporting for a platform. |
| Video | Title, thumbnail, end card, transparent lower third and caption treatment when requested; existing Studio packs commonly use 1920×1080. |
| Handoff | Contact sheet or gallery, fonts with licenses, tokens, guides, source records, manifest and reproducible build instructions. ZIPs are generated packaging artifacts. |

Read the affected generator before running it. Use a supported per-brand selector or standalone brand builder; do not regenerate the library to change one pack. The starter template refuses existing output directories: create new drafts separately, then integrate deliberately with the target pack's generator. Inspect generated marks; starter initials are not a finished logo.

Use original artwork, appropriately licensed media or verified product captures. Keep screenshots truthful, sanitize private data, and identify mockups and placeholder copy. When image generation is useful, use the available image tool and retain its prompt/source context; do not flatten editable identity sources without a reason. Write final copy from the voice guide and supported claims.

The social drafting jobs also consume each pack. `studio/automation/social-posting/render.py` sets the brand's fonts and motif, plus the lockup variant with the best measured contrast against the background. `craft/art-direction.json` holds each product's art direction for generated images. After changing a pack's lockups, fonts or palette, render a sample 1080×1350 post card for that brand and check it at phone size.

## Verify and hand off

Inspect rendered exports, not only source files. Check mark legibility at small sizes, type clipping, font substitution, line wrapping, transparency, crop safety, narrow layouts and a phone-sized promotional preview. Parse changed SVGs and token files. Measure relevant contrast pairs, including interactive states: ordinary text needs 4.5:1, large text 3:1 and meaningful UI boundaries/focus indications 3:1. Do not apply text contrast thresholds to purely decorative artwork.

Run the affected generator's validation and the relevant repository checks. For Studio changes use `rtk make check-studio check-studio-automation` from the repository root; run frontend/API checks when those components changed. `check-cutover` verifies installed Kvant consumers after activation and is not a portable asset check. Verify changed manifest hashes, retained master bytes and any selected public export against its source hashes.

Report files created, selection status, rendered previews, checks and remaining gaps. A documented system is complete when its guides, tokens and example applications agree. An asset pack is complete when the requested exports exist, render correctly, trace back to their sources and can be rebuilt. Publication or deployment requires its own authorized execution and evidence.
