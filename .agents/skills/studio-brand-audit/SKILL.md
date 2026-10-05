---
name: studio-brand-audit
description: Compare a SUBCULT product's implemented website or promotional assets with its selected Studio brand system, and report evidence-backed discrepancies in identity, tokens, copy, accessibility and exports.
---

# Studio brand audit

Check whether an implementation and its artwork agree with the selected system. Work from the active `subcult-tv` checkout and the explicitly targeted product repository or site. Read their project instructions and `studio/AGENTS.md`; inspect Git status before generating evidence or fixes.

## Choose the mode

- **Audit:** inspect and report discrepancies without changing the selected identity.
- **Verify fixes:** revisit specified findings against the changed sources and rendered result.
- **Audit and repair:** apply requested repairs to the owning sources, rebuild the affected exports and verify them.

A review request authorizes inspection and a report. A request to repair authorizes scoped fixes. Selecting a replacement system belongs to `studio-brand-system`; preparing product integration belongs to `studio-brand-handoff`. Use existing interface and accessibility review skills for those checks when available and relevant.

## Resolve the baseline

Read `studio/branding/library/README.md`, the target pack's `GUIDE.md`, tokens, selection records, source provenance and manifest. Resolve whether Studio or the product repository owns interface rules; read `WEBSITE.md` and product design docs where applicable. Use the current selection and preserved masters, not archived proposals. Compare the implemented revision with the documented observation date.

Read `studio/content/VOICE.md` and the claims register when copy is in scope. Do not apply the umbrella's colors or voice to every product. Promotional and interface systems may intentionally differ; report an intentional documented difference separately from a defect. If the baseline conflicts or lacks a decision, record a specification gap and continue independent checks.

## Inspect representative surfaces

Choose representative pages, component states and asset sizes for the requested scope. Use the current client's browser tools and record URL, viewport, inspected states and captures. Keep local, deployed and screenshot-only observations distinct; do not substitute source inspection for rendered proof.

Compare marks and variant selection, font loading and fallback, semantic colors and contrast, hierarchy, spacing, layout, responsive wrapping, image/crop treatment, navigation and relevant focus/error/empty/loading states. Inspect small icons and phone-sized promotional exports. Verify copy against product evidence. Check source and exported asset hashes, licenses and obsolete references where they affect current consumers.

Measure relevant contrast pairs and inspect keyboard/focus behavior when the interface is in scope. Avoid blanket defects based on decorative artwork or rules for a different surface. Inspect generator/master ownership before proposing an export fix; do not edit a derivative PNG to conceal a generator problem.

## Report or repair

Place a scoped report under `studio/branding/reviews/<dated-audit>/`, or the product's review location if that product owns the work. Each actionable finding needs: affected file/URL and state, observed behavior, expected rule with source, practical impact, evidence, proposed fix and owning repository. Rank by impact; separate verified defects, specification gaps and optional improvements. Include representative matching behavior so absence of findings is not mistaken for absence of inspection.

If repairing, preserve owner-edited masters, change only the affected sources, regenerate their exports and update manifests/provenance together. Run relevant product checks and `rtk make check-studio check-studio-automation` for Studio changes. Verify fixed states and exports again. Do not silently replace the selected direction or deploy a site as an audit step.

Finish with the report, prioritized findings, inspected scope, checks and limitations. An audit is complete when each finding is supported and routed to an owner. A fix is verified only for the source, render and runtime boundaries actually checked.
