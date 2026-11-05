# Commons — Brand guide

Commons: Find open software projects, share progress and build with other people.

Status: Selected for implementation under the owner's November 4, 2026 instruction to complete the remaining branding. Product-owned selections retain their existing owner decisions. New marks are agent-selected under that delegation; sample social layouts remain unapproved for publication.

## Mark

The product-owned Commons lattice: shared plots with one claimed square. Its product-owned master and source record are retained in `source/`. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. The browser icon is a separately framed derivative for 16, 32 and 48 pixels.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #ece5d4 | Canvas | — |
| Text | #26201b | Copy and the mark | 12.82:1 |
| Accent | #33594e | Lit element and emphasis | 6.24:1 |
| Secondary | #87432d | Labels and supporting lines | 5.83:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Newsreader, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: IBM Plex Mono, regular, upper case with slight tracking, for small labels such as `COMMONS / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/remaining_site_packs.py --only commons` from the repository root. Do not edit the PNG exports by hand.

## Product relationship

The product repository owns its interface and behavior. This pack supplies identity artwork, icons and link previews; it does not replace product controls, source notices, rights records or color semantics. Use the product's existing type stack in the application. Artwork uses the licensed bundled fonts.
