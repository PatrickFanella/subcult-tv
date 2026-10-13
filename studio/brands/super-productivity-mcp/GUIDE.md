# super-productivity-mcp — Brand guide

super-productivity-mcp: An MCP server, plugin bridge and quick-add launcher for Super Productivity.

Status: Accepted identity: generated October 12, 2026 by the site agent from `site-packs.json` and accepted by the owner on October 13, 2026 for the product pages. Sample layouts still need their own review before a post.

## Mark

A bridge: two short vertical posts joined by an arc, with a dot at the arc's apex. It is drawn in code; nothing is traced from a product repository or another pack. `logos/mark.svg` is the colour version, `mark-mono-dark.svg` is one light colour for dark backgrounds and `mark-mono-light.svg` is one dark colour for light backgrounds.

- Clear space: one quarter of the mark's height on every side.
- Minimum size: 32 pixels wide on screen. Below that, use nothing.
- No gradients, rotation, outlines, shadows or recolouring beyond the three files above.

## Palette

| Role | Colour | Use | Contrast on background |
| --- | --- | --- | --- |
| Background | #0f1a17 | Canvas | — |
| Text | #e3efe9 | Copy and the mark | 15.07:1 |
| Accent | #34d399 | Lit element and emphasis | 9.25:1 |
| Secondary | #a78bfa | Labels and supporting lines | 6.54:1 |

Text on the background must be at least 4.5:1 and the accent at least 3:1; the generator fails the build otherwise.

## Typography

- Display: Space Mono, weight 700, for the name and headlines.
- Body: Public Sans, regular, for descriptions.
- Label: Space Mono, regular, upper case with slight tracking, for small labels such as `SUPER-PRODUCTIVITY-MCP / BY SUBCULT`.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.

## Files

`logos/` holds the mark variants and the lockup; `product/` the mark copy, the 1440×900 hero and the 1200×630 link preview; `social/` the 1500×500 banner, 1080×1080 square and 512×512 avatar. Layout copy is the one-line description and is marked SAMPLE where it is a sample. Text in every SVG is converted to paths, and `fonts/` carries the three fonts with their licences for new artwork.

Rebuild only this pack with `python3 studio/brand-tools/site_packs.py --only super-productivity-mcp` from the repository root. Do not edit the PNG exports by hand.
