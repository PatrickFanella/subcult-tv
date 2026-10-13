# Overlaid — Brand guide

Overlaid: OBS overlays, a Twitch bot and an operator desk for live streams.

Status: Proposed identity, generated October 12, 2026 by the site agent from `site-packs.json`; the owner has not reviewed it. Sample layouts are not approved for publication.

## Mark

A tally lamp: a rounded overlay card offset over a second card, with a lit red circle in the top corner of the front card. It is drawn in code; nothing is traced from a product repository or another pack. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. Below that, use nothing.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #0d0d12 | Canvas | — |
| Text | #f3f0ff | Copy and the mark | 17.28:1 |
| Accent | #ff3b4e | Lit element and emphasis | 5.53:1 |
| Secondary | #ffd166 | Labels and supporting lines | 13.44:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Inter Tight, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: Space Mono, regular, upper case with slight tracking, for small labels such as `OVERLAID / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/site_packs.py --only overlaid` from the repository root. Do not edit the PNG exports by hand.
