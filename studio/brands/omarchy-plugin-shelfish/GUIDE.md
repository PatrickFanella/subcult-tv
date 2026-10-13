# Shelfish — Brand guide

Shelfish: Collapsible, named groups of Omarchy bar widgets.

Status: Accepted identity: generated October 12, 2026 by the site agent from `site-packs.json` and accepted by the owner on October 13, 2026 for the product pages. Sample layouts still need their own review before a post.

## Mark

A shelf: a horizontal rule with two small boxes sitting on it and a chevron in the third place, for a collapsed group. It is drawn in code; nothing is traced from a product repository or another pack. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. Below that, use nothing.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #171410 | Canvas | — |
| Text | #f2ebe0 | Copy and the mark | 15.50:1 |
| Accent | #ffb86b | Lit element and emphasis | 10.77:1 |
| Secondary | #7aa2f7 | Labels and supporting lines | 7.29:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Inter Tight, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: IBM Plex Mono, regular, upper case with slight tracking, for small labels such as `SHELFISH / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/site_packs.py --only omarchy-plugin-shelfish` from the repository root. Do not edit the PNG exports by hand.
