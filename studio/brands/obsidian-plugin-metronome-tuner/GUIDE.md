# Metronome + Tuner — Brand guide

Metronome + Tuner: A metronome and chromatic tuner inside Obsidian.

Status: Proposed identity, generated October 12, 2026 by the site agent from `site-packs.json`; the owner has not reviewed it. Sample layouts are not approved for publication.

## Mark

A metronome: a tall trapezoid outline with a diagonal pendulum and a bob circle, and a short tick scale on its right side for the tuner. It is drawn in code; nothing is traced from a product repository or another pack. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. Below that, use nothing.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #f6f3ee | Canvas | — |
| Text | #1d1a24 | Copy and the mark | 15.48:1 |
| Accent | #e04e7a | Lit element and emphasis | 3.42:1 |
| Secondary | #2f6f73 | Labels and supporting lines | 5.21:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Fraunces, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: IBM Plex Mono, regular, upper case with slight tracking, for small labels such as `METRONOME + TUNER / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/site_packs.py --only obsidian-plugin-metronome-tuner` from the repository root. Do not edit the PNG exports by hand.
