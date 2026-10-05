# Patrick__Eff — selected production pack

Selected by the owner October 2, 2026: **Patch / routed signal**.

The [Patch source](../../brand-tools/patrick/README.md) is authoritative. It holds the generator, the full guide and the site observations. The earlier Signal pack is preserved in `studies/archive/patrick-signal-2026-10-02/` at the Studio root.

## Direction

Start with patrickfanella.co's actual visual system: blue charcoal, lavender borders, warm white, pink and green headline emphasis. Retain its Space Grotesk display, Inter body text and JetBrains Mono labels. Extend that system into original cable paths, connector ports and spectrum artwork for the software and sound identity.

The routing graphic connects inputs to outputs through visible bends and crossings. It can read as software connections or an audio patch panel. Spectrum bars carry sound/process material. These are decorative illustrations, not live audio, architecture diagrams or measured operational data.

Keep the type flat. The site already separates headline phrases by color, which is enough emphasis, so this direction uses no chromatic type offsets. Each composition gets one large message, one motif and a small source or destination line.

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

The selected production banner uses Patch. The previous banner, with its icons and links, is preserved in the archived Signal pack and the original references. This selection does not update a social profile.

## Voice

Patrick writes in the first person singular. Copy reads like a working note from someone who writes software and makes music and does not separate the two: plain, a bit self-deprecating and specific about tools. **Software. Sound. Culture.** stays as the identity line. Leave out founder voice, third-person biography and "passionate about".

The voice for every product is in [the voice guide](../../content/VOICE.md).

## Production assets

The pack uses the standard Studio paths: `logos/`, `social/`, `video/` and `artwork/`.

| Asset | Size |
| --- | --- |
| Social banner | 1500×500 |
| Tall banner master | 1500×600 |
| Avatar PNG | 512×512 |
| Square templates | 1080×1080 |
| Story | 1080×1920 |
| Screenshot frame | 1600×1000 |
| Video frames | 1920×1080 |
| Standalone transparent marks | 512×512 |
| Lockups, with outlined exports | 1000×260 |
| Overview PNG | 1800×1940 |

## Identity line and logo treatments

The identity line is **Software. Sound. Culture.** Set all three phrases at the same size in each composition.

The open frame with the original waveform is approved in seven treatments: 01, 02, 03, 04, 06, 07 and 08. Lavender is the default, and 06 is its counterpart for light backgrounds. Option 05 is excluded. The [approved logo gallery](../../brand-tools/patrick/waveform-variations/index.html) shows all seven. Their transparent marks and avatars are in `logos/waveform/`. The monochrome fallback exports keep the plain open frame for small or single-ink uses.

## Rebuild

From the library directory, run `BRAND_ONLY=patrick__eff python build_packs.py`, then `BRAND_ONLY=patrick__eff python render_video_previews.py`. Both steps refresh the manifest and the Patrick ZIP. Do not edit generated PNGs on their own. The full source asset inventory and the editing guidance are in the linked Patch guide.
