# Anarchist Archive — Brand guide

Anarchist Archive: Preserved zines and pamphlets with source records, a catalog, reading and downloads.

Status: Selected for implementation under the owner's November 4, 2026 instruction to complete the remaining branding. Product-owned selections retain their existing owner decisions. New marks are agent-selected under that delegation; sample social layouts remain unapproved for publication.

## Mark

An open pamphlet with a folded corner and two heavy red staple strokes at its spine. It is an original geometric drawing in the maintained generator; no third-party logo or collection artwork is traced. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. The browser icon is a separately framed derivative for 16, 32 and 48 pixels.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #f2efe8 | Canvas | — |
| Text | #211e1a | Copy and the mark | 14.45:1 |
| Accent | #b8322f | Lit element and emphasis | 5.17:1 |
| Secondary | #4c5a55 | Labels and supporting lines | 6.30:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Newsreader, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: IBM Plex Mono, regular, upper case with slight tracking, for small labels such as `ANARCHIST ARCHIVE / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/remaining_site_packs.py --only anarchist-archive` from the repository root. Do not edit the PNG exports by hand.

## Product relationship

The product repository owns its interface and behavior. This pack supplies identity artwork, icons and link previews; it does not replace product controls, source notices, rights records or color semantics. Use the product's existing type stack in the application. Artwork uses the licensed bundled fonts.
