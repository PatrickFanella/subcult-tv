# Brand direction review — October 1, 2026

This is the first visual review set for eight brands. Fourteen directions show a banner, square post, avatar treatment, color roles and typography. CLPR, Patchwork, HasanAra and Undertow follow the current public site themes. Subcult OS follows the web source styles; a current live destination was not verified. Patrick, Rekolekt and SUBCULT each have three proposed systems.

Open the local review page at http://localhost:18768/ while its preview server is running. The gallery filters by brand, compares directions and records choices in browser local storage. Export choices to JSON or name the preferred directions in chat. The gallery also opens offline from index.html; its catalogue is embedded and images are local.

## Directions

| Brand | A | B | C |
| --- | --- | --- | --- |
| Patrick__eff | Signal: current purple/lime waveform | Side A: coral studio notes | Field notes: paper, serif type, existing personal photograph |
| Rekolekt | Index: original green/bracket concept | Folio: paper reading archive | Passage: blue transcript brackets |
| SUBCULT | Signal: current dark site | Collective: paper product catalogue | Culture: purple/green poster press |
| CLPR | Tally / Ultraviolet | — | — |
| Patchwork | Neighbourhood fabric | — | — |
| HasanAra | Broadcast archive, current red/PBS identity | — | — |
| Subcult OS | Event ledger, current web source | — | — |
| Undertow | Glitch, current editor theme | — | — |

## Included now

Each direction includes editable SVG and PNG exports: 1500×500 banner, 1080×1080 square post, 512×512 avatar and 1200×1040 review board. `tokens.json` records palette and fonts. Comparison sheets include all eight base directions and the three exploratory groups. Typography files and their OFL licenses are bundled. `build_review.py` renders the sources with rsvg-convert and uses fontconfig.xml to load this pack's fonts without installing them globally.

The layouts are direction studies, not interface screenshots or approved campaign posts. The Subcult OS lettermark and exploratory marks are proposals. Patrick's existing photograph is preserved without retouching. The live HasanAra PBS logo, live Undertow favicon, current CLPR wordmark and Patchwork favicon are carried forward as references.

## Source references

- https://subcult.tv — black/purple/green, Oswald, Libre Baskerville and JetBrains Mono.
- https://clpr.tv — ultraviolet, Barlow Condensed, Barlow and IBM Plex Mono; current source wordmark from `~/Work/Subcult/clpr/frontend/public/clpr-logo.svg`.
- https://patchwork.subcult.tv — warm paper, green, tomato, Fraunces and Public Sans; stitched corners.
- https://hasanara.tv — live red and paper text, Newsreader, Inter Tight; `/branding/logo.svg`. The older local lime theme is not the reference for this review.
- https://undertow.subcult.tv — active pink/cyan/lilac editor theme, square controls, hard offsets and system monospace. Liberation Mono is the portable preview fallback.
- `~/Work/Subcult/subcult-os/web/src/styles.css` — serif-led interface, amber/cyan/fuchsia and dark rounded panels. Source reference, not live deployment proof.
- `~/Documents/ars-malefica/001 Projects/Works/Social Posts/Branding/2026-10-01/` — latest personal banner and existing photograph.
- `~/.t3/worktrees/subcult-tv/t3code-36a23def/docs/branding/rekolekt.md` and `public/brand/rekolekt-mark.svg` — proposed Rekolekt working identity.

## Asset handling

The inventory records path, size and SHA-256 for 228 pre-existing files under `~/Documents/subculture-collective`. Inventory is not a visual or rights clearance of every file. Original assets are untouched. The older CLPR Space Grotesk wordmark and SUBCULT industrial/grunge guide are reference material; they are not promoted to the current identity. Selected sources are copied to `references/` with their original bytes. Website tokens were observed October 1, 2026.

## Full packs after direction review

Each chosen brand will receive its system guide, editable and outlined logos, mark and wordmark variants, light/dark/monochrome treatments, clear-space/minimum-size rules, font licenses, palette roles, social banners/avatar/post/story layouts, screenshot framing, thumbnail/title/caption/end-card layouts and an asset manifest with provenance. Actual product captures and videos should use verified workflows and cleared source material.

The bootstrap prototype includes `brand.json`, a generator, five editable layouts and an example output. Its next step is the same production pack structure, with configurable type/color/spacing roles and original-mark slots.

Existing runner, media-library and branding work was merged separately to Ars Malefica `main` at `b78344cd3610c70b79138713cfa01891dc8d11ca`. This new direction review is stored in the asset library and has not changed sites, profiles or posting jobs.
