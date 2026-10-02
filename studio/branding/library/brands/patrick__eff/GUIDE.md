# Patrick__Eff — selected production pack

Selected by the owner October 2, 2026: **Patch / routed signal**.

Authoritative generator, guide and observations: [Patch source](../../../patrick/README.md). The earlier Signal pack is preserved in `branding/archive/patrick-signal-2026-10-02/` at the Studio root.

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

The selected logo combines the open frame from `../../references/patrick-variations/mono-outlined.svg` with the thirteen-bar waveform from the older `primary-outlined.svg`. The frame, initials, slash, dot and waveform geometry remain intact. The waveform sits behind the initials. Original masters are unchanged.

Lavender (01) is the default for dark backgrounds; Light (06) uses charcoal foreground on warm white. The avatar places the logo within the separate routing illustration. Use the plain open-frame monochrome fallback when the waveform becomes indistinct at small sizes or for single-ink printing. Do not stretch the mark.

The selected production banner now uses Patch. The previous banner and its icons/links are preserved in the archived Signal pack and original references. This selection does not update a social profile.

## Production assets

The pack uses the standard Studio paths: `logos/`, `social/`, `video/` and `artwork/`. The social banner is 1500×500, tall master 1500×600, avatar PNG 512×512, square templates 1080×1080, story 1080×1920, screenshot frame 1600×1000 and video frames 1920×1080. Standalone transparent marks are 512×512; lockups are 1000×260, with outlined exports. The overview PNG is 1800×1940.

The identity line is **Software. Sound. Culture.**, with all three phrases at the same size in each composition. The open frame with the original waveform is approved in seven treatments: 01, 02, 03, 04, 06, 07 and 08. Lavender is the default; 06 is the light-background counterpart. [Approved logo gallery](../../../patrick/waveform-variations/index.html). Transparent marks and avatars live in `logos/waveform/`. Option 05 is excluded. Monochrome fallback exports retain the plain open frame for small or single-ink uses.

Rebuild from the library directory with `BRAND_ONLY=patrick__eff python build_packs.py`, then `BRAND_ONLY=patrick__eff python render_video_previews.py`. Both steps refresh the manifest and Patrick ZIP. Do not edit generated PNGs independently. The full source asset inventory and editing guidance are in the linked Patch guide.
