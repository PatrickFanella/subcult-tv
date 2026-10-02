# Patrick__Eff — Patch

Selected by the owner October 2, 2026. Patch replaces the selected Signal production pack. The previous pack is archived at `branding/archive/patrick-signal-2026-10-02/`; original user-edited masters remain unchanged.

## Direction

Start with patrickfanella.co's actual visual system: blue charcoal, lavender borders, warm white, pink and green headline emphasis. Retain its Space Grotesk display, Inter body text and JetBrains Mono labels. Extend that system into original cable paths, connector ports and spectrum artwork for the software and sound identity.

The routing graphic connects inputs to outputs through visible bends and crossings. It can read as software connections or an audio patch panel. Spectrum bars carry sound/process material. These are decorative illustrations, not live audio, architecture diagrams or measured operational data.

Keep the type flat. The site's color-separated headline phrases give enough emphasis; this direction uses no chromatic type offsets. Use a single large message, one motif and a small source/destination line per composition.

## Colors

| Role | Color | Contrast on base |
| --- | --- | --- |
| Base | `#282a36` | — |
| Panel | `#21222c` | Decorative surface |
| Quiet divider | `#44475a` | 1.56:1; never the only control boundary |
| Paper/headline | `#f8f8f2` | 13.36:1 |
| Body | `#d7d7eb` | 10.04:1 |
| Muted text | `#a5a6b5` | 5.91:1 |
| Lavender | `#bd93f9` | 5.90:1 |
| Pink | `#ff79c6` | 5.97:1 |
| Green | `#50fa7b` | 10.38:1 |

These values were measured with WCAG relative luminance in the generator. Accent text on charcoal meets the ordinary-text contrast target. Use dark text on filled accent buttons. Use lavender for actionable outlines and green for keyboard focus; the quiet divider is decorative. Do not use color alone to distinguish channels, states or errors.

## Typography and layout

- **Space Grotesk:** bold display type, close spacing, sentence or uppercase depending on format. The identity line is **Software. Sound. Culture.** Set all three phrases at exactly the same size within each composition.
- **Inter:** readable descriptions and longer notes. It matches the live font family; the included file is from the licensed upstream project and is not claimed to be the exact deployed binary.
- **JetBrains Mono:** channel names, labels, versions and destinations. Keep these small relative to the headline.
- Use 8, 16, 24, 32, 48, 64 and 96 pixel spacing steps. Wide artwork uses at least a 64 pixel inset; social and video sizes need destination-specific crop review.
- Maintain at least one quarter of the mark's height clear around its geometry. Use the standalone mark without surrounding routes below 64 screen pixels.

The display and label fonts resolve from the existing licensed Patrick pack. The Inter font and its OFL license are included here. Its upstream commit and downloaded hashes are in `fonts/provenance.json`.

## Mark preservation

The selected logo combines the open frame from `../library/references/patrick-variations/mono-outlined.svg` with the thirteen-bar waveform from the older `primary-outlined.svg`. The frame, initials, slash, dot and waveform geometry remain intact. The waveform sits behind the initials. Original masters are unchanged.

Lavender (01) is the default for dark backgrounds; Light (06) uses charcoal foreground on warm white. The avatar places the logo within the separate routing illustration. Use the plain open-frame monochrome fallback when the waveform becomes indistinct at small sizes or for single-ink printing. Do not stretch the mark.

The selected production banner now uses Patch. The previous banner and its icons/links are preserved in the archived Signal pack and original references. This selection does not update a social profile.

## Asset inventory

Every named asset has an editable SVG and a rendered PNG:

| Asset | Size | Purpose |
| --- | --- | --- |
| `mark-light` / `mark-dark` | 512 × 512 | Transparent recolored derivatives of the existing mark |
| `avatar` | 1024 × 1024 | Framed identity, with circular preview in the gallery |
| `banner-social` | 1500 × 500 | Social header; actual avatar overlap/crop needs platform review |
| `banner-wide` | 2400 × 800 | Brand header or wide website artwork |
| `identity-square` | 1080 × 1080 | Software/sound identity poster |
| `process-square` | 1080 × 1080 | Work-in-progress post template |
| `case-study-landscape` | 1920 × 1080 | Illustrative case-study template |
| `story` | 1080 × 1920 | Vertical identity composition; primary text sits inside y=250–1670 |
| `open-graph` | 1200 × 630 | Link-preview artwork |
| `video-title` | 1920 × 1080 | Workbench title-card template |
| `quote-square` / `release-square` | 1080 × 1080 | Sourced quote and actual-release templates |
| `screenshot-frame` | 1600 × 1000 | Verified capture placeholder |
| `video-end` / `video-lower-third` | 1920 × 1080 | End card and transparent lower-third |
| `routing-motif` | 1200 × 800 | Transparent paths/ports artwork |
| `spectrum-motif` | 1200 × 400 | Transparent decorative bars |
| `brand-board.png` | 1800 × 1940 | Combined review sheet, not a posting template |

The routing and spectrum SVGs are original vector artwork generated here. Replace sample headings, source labels and template text with reviewed copy before publication. A template is not evidence of a release or a technical capability.

## Editing and regeneration

Edit `build_assets.py` for generated artwork and `index.html` for the review interface. From the Studio root, run:

```sh
rtk proxy python branding/patrick/build_assets.py
```

The generator renders only this alternative. It writes assets, tokens, measured contrast and a manifest of source/output hashes. Requires Python, Pillow, fontTools for initial Inter decoding, and `rsvg-convert`. Font discovery uses a temporary configuration; it does not change system fonts. PNG and font files follow the repository's existing LFS rules.

Do not edit generated PNGs separately. Keep source and derivative changes together. SVG text needs the named fonts; the two mark SVGs are already outlined. For a font-independent transfer of other masters, outline text in an explicit export and keep the original editable source.

## Web application

Keep case studies, contact and resume paths prominent on the professional portfolio. The broader Patrick__Eff artwork can serve personal releases, creative work and process notes. Do not turn the hiring page into a support landing page.

Use quiet rules for editorial sections and accent outlines for actions. A contextual SUBCULT support module can follow a creative release or live in the footer; use the [site support guidelines](../../content/patreon/support-redesign-2026-10/site-guidelines.md) for its wording and recipient boundary.

## Sources and verification

`source-observation.json` records the live site URL, stylesheet URL, observed fonts and colors, and the distinction between site-derived rules and new artwork. `asset-manifest.json` records this pack's hashes and starting Studio revision. Imported mark provenance remains in Studio's `docs/import-manifest.json`.

SVG parsing, rendered exports, mark-geometry preservation, local links and browser behavior should be checked before delivery. Actual platform crops and deployment remain separate checks. This pack selects Patch as the default Patrick__Eff Studio system. It does not change patrickfanella.co.

## Logo development

The owner approved **Open frame + original waveform** in treatments **01, 02, 03, 04, 06, 07 and 08** on October 2, 2026. [Approved waveform gallery](waveform-variations/index.html) includes transparent SVG/PNG marks, background-filled avatars, circular previews and a comparison board. Source and export hashes are recorded in the manifest.

| Treatment | Use |
|---|---|
| 01 / Lavender | Default logo on charcoal |
| 02 / Pink | Alternate accent treatment |
| 03 / Green | Alternate accent treatment |
| 04 / Green frame | Stronger color treatment |
| 06 / Light | Charcoal logo and lavender waveform on warm white |
| 07 / Quiet | Subdued waveform when the initials should lead |
| 08 / Original echo | Green waveform with lavender offset, recalling the older logo |

Lavender is an implementation default within the approved set. Option 05 / Pink frame is excluded from production exports; its generated previews were removed. The production pack includes all seven approved treatments in `logos/waveform/`; its main templates use Lavender.
