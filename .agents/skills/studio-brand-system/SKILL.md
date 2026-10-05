---
name: studio-brand-system
description: Select or refine a design system for SUBCULT.TV or a SUBCULT product, then create its maintained branding docs and asset pack in subcult-tv/studio. Use for visual-direction comparisons, brand guides, design tokens and reproducible brand assets.
---

# Studio brand system

Create a coherent visual system that someone can apply to a website and its supporting artwork. Work from the active `subcult-tv` checkout; `studio/` contains the brand sources and design references. Read root and Studio `AGENTS.md`, inspect Git status, and preserve unrelated work and user-edited masters.

## Choose the mode

- **Select:** research and compare directions, or refine the selected system. Produce a brief, source-linked shortlist and comparable previews with a recommendation.
- **Document:** turn a selected direction into maintained brand and interface rules, tokens and provenance.
- **Produce:** create or revise the requested assets from the selected rules and authoritative masters; regenerate and verify their derivatives.

For a complete branding request, carry the modes through the requested outcome. A request for options ends with reviewable options. Honor an existing selection or explicit authorization to choose; otherwise keep a recommendation marked proposed and wait for the owner's selection before treating it as the production identity. Continue reversible research and previews while that decision is pending.

Read [the workflow and deliverables](references/workflow.md) for the selected mode. Use `studio-reference-study` for reference intake, `studio-brand-audit` for implementation review, `studio-brand-handoff` for integration and `social-craft` for post writing. Routine UI fixes do not require a new brand system.

## Start from Studio

The authenticated [Studio reference library](https://subcult.tv/admin/studio/references) is the primary browsing resource: website studies, style studies, interface references and web history. Search by relevant layout, typography, era or product task; read the studies and evidence notes behind the screenshots. Use the current client's browser tools. If authentication is unavailable, use local sources and state the access limit; do not change accounts.

Read only the relevant local material:

- `studio/references/README.md`, `USAGE.md`, `catalog.json` and the shortlisted studies; curated history lives in `curated/web-history/` and archived interface exports in `refero-archive/`.
- `studio/brands/README.md`, `studio/brand-tools/README.md` and `selected-directions.json`, and the target pack under `studio/brands/<brand>/`: `GUIDE.md`, tokens, source/selection records, manifest and `WEBSITE.md` where present.
- `studio/content/VOICE.md` and `studio/content/social/Product Claims Register.md` for copy and factual claims.
- The relevant product repository's maintained design docs when Studio records that product as the editing owner.

Resolve current ownership and selection from these files. `studio/studies/archive/` contains inactive history. Reference studies reconstruct dated interfaces; distinguish observations, interpretations and proposed rules. Their presence in the library does not grant reuse rights.

## Working boundaries

Keep each product's identity distinct. For SUBCULT itself, inspect the current logo selection and preserved artwork before proposing changes. Do not redraw approved marks or replace owner selections as a side effect of asset generation.

Edit the owning generator and authoritative master together where appropriate; rebuild only the affected brand. Use `studio/brand-tools/starter-template/` only for a new pack, after reading its README. Placeholder initials and sample copy are drafts.

Keep sources, private packs and reference assets in Studio. Public exports require explicit file selection, source hashes and the repository's existing allowlist/export path. Brand selection, asset review, website deployment and social publication are separate outcomes; perform only the actions authorized by the request.

Finish with links to the selected/proposed direction, docs, previews and assets; state checks run, missing items and any unresolved decision. Do not describe rendered samples as implemented product behavior.
