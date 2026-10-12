# Patrick__Eff — selected Patch system

Selected by the owner October 2, 2026. Patch / routed signal replaces the former Signal production pack. Its identity line is **Software. Sound. Culture.**, with equal phrase sizes.

- [Selected design system and comparison gallery](index.html)
- [Open frame with waveform: seven approved treatments](waveform-variations/index.html)
- [Brand board](assets/brand-board.png)
- [Design and asset guide](GUIDE.md)
- [Tokens and measured contrast](tokens.json)
- [Portrait library: earlier picks and all three edit sets](portraits/index.html)
- [Live-site observations](source-observation.json)
- [Asset provenance](asset-manifest.json)
- [Selected production pack](../../brands/patrick__eff/GUIDE.md)

This folder is the authoritative source for Patch. The library's normal Patrick pack, gallery and ZIP are generated from it. The complete prior Signal pack is preserved at `studies/archive/patrick-signal-2026-10-02/` from the Studio root. The original mark and banner references are untouched.

## What is in the system

The website supplies the palette (charcoal, lavender, pink and green) and the type hierarchy (Space Grotesk, Inter and JetBrains Mono). Original vector routing and spectrum illustrations carry those rules into headers, posts, an avatar, story artwork and video templates.

The existing PF mark is recolored without changing its geometry. The owner selected the open frame and requested the older waveform behind it.

- Treatments 01, 02, 03, 04, 06, 07 and 08 are approved, and all seven are in the production pack.
- The production templates use Lavender (01). Light (06) is its counterpart for light backgrounds.
- Option 05 is excluded. Its generated previews were removed.

## Rebuild

From `brand-tools/`, run `BRAND_ONLY=patrick__eff python build_packs.py`, then `BRAND_ONLY=patrick__eff python render_video_previews.py`. These refresh the selected pack, manifest and Patrick ZIP without rebuilding other brands. Run `python brand-tools/patrick/waveform_variations.py` to regenerate the seven approved waveform treatments and their comparison board.

View through the existing loopback server at `http://127.0.0.1:18771/brand-tools/patrick/`, or run `make preview` from the Studio root and open this folder. Studio selection does not deploy patrickfanella.co or update a social profile.

## Verification boundary

The earlier review verified SVG parsing, asset/source hashes, geometry preservation, document links and comparison controls. Desktop rendering was visually inspected without horizontal overflow. An embedded viewport of 387 CSS pixels loaded the single-column layout without overflow; native preview resize timed out. Physical mobile devices and actual social-platform crops remain separate checks. Production-pack verification is recorded in `brands/patrick__eff/verification.json` after promotion.
