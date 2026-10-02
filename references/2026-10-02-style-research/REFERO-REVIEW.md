# Refero Styles — review and selected designs

Reviewed 2026-10-02: [Refero Styles](https://styles.refero.design/). This review covers the public gallery, selected search results and 20 individual style entries, including their supplied reference images. It is a selected review, not an audit of the entire catalog.

Refero's useful contribution is packaging a visual reference into a written design specification: a screenshot, palette, typography, layout values, component descriptions and export views for Markdown, CSS, Tailwind and tokens. It shortens the path from finding a reference to knowing what to inspect. The homepage advertises more than 2,000 systems; the public style sitemap listed 1,342 unique page URLs when checked. Those are separate observations, not a verified completeness claim.

The individual export includes an explicit qualification: “Source measurements are normalized; roles and recommendations are interpreted.” It also distinguishes reconstructed HTML examples from source components. Treat the written guide as a hypothesis about a captured design, then compare it with the image and current site before adopting its values. [Example qualification in the Slush entry](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b).

## Most useful selected mechanisms

| Reference | Why it is worth studying | Question to resolve |
|---|---|---|
| [Slush](examples/slush/GUIDE.md) | Sculptural type, a textured 3D ribbon and outlined stickers occupy separate layers while navigation stays conventional | Which layout and motion rules preserve readable resting states? |
| [Steep](examples/steep/GUIDE.md) | Detached charts and an input field explain the product around an editorial headline | Which fragments demonstrate real behavior, and which are decorative marketing artifacts? |
| [Desktop.fm](examples/desktop-fm/GUIDE.md) | A single nostalgic digital object supplies the atmosphere while the action lives in a compact desktop-like panel | Can the scene degrade to a still image without losing the main action? |
| [SuperHi](examples/superhi/GUIDE.md) | A simple vocabulary of large shapes creates personality around a clear reading area | How does shape placement adapt to narrow screens without covering text? |
| [Spacelab](examples/spacelab/GUIDE.md) | A persistent index rail makes the content grid and reading order immediately understandable | How does that index collapse on mobile and support active/focus states? |
| [FORA](examples/fora/GUIDE.md) | Each grid cell performs a different content job, with color defining sections | Can the same grammar handle long news entries and mixed image ratios? |
| [Cursor](examples/cursor/GUIDE.md) | A restrained introduction gives the working product image more attention | Which rules belong to the marketing shell, and which belong to the depicted application? |
| [Wise](examples/wise/GUIDE.md) | A small action palette remains distinctive beside a very heavy display face | Which roles persist across regions and light/dark sections? |

“Interesting” here means a specific mechanism that is useful to document. These selections do not establish that a site invented the mechanism or that the pattern improves conversion or usability.

## Mismatches worth retaining

Several source images show a different state or vocabulary from the accompanying prose. Programa's screenshot prominently uses a serif headline; its written summary emphasizes a Swiss sans-serif direction. Hyper Tria's image shows a white project presentation, while its description opens with a chrome-letter hero. Teenage engineering's image shows a dark product scene and a large consent panel, rather than the white catalog described in the guide. These may be different sections, versions or capture states; the cause is not established.

There are also narrower effect and typography discrepancies. Steep's image visibly has a colored glow and card shadows. Cursor's image has rounded actions that need separating from small-radius rules. The current Frankys page requests a different heading family from the older pixel-oriented reference. Those observations make the discrepancy log useful: a normalized export can merge multiple states into rules that do not fit every screenshot.

## How to use this with Studio

Use Refero for discovery and a first specification draft. Then establish the actual page/version, inspect computed styles, verify important component states and write an original guide with explicit evidence levels. Preserve source URLs and the date of retrieval. Keep screenshot capture dates unknown unless supplied. Promote values to production tokens only after confirming their roles; do not copy a normalized spacing scale into a pack merely because it looks complete.

The present collection has seven style guides, 24 example/candidate directories, 20 attributed reference images and 24 live style observations. T3 screenshot capture remained unavailable, so no new live screenshot or completed motion/mobile/accessibility audit is claimed. Full DESIGN.md exports are not included in this selected research collection.
