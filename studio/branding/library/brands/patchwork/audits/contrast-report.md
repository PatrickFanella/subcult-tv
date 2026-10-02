# Patchwork contrast audit after button-color correction

The text-bearing tomato button now uses `#b33e28`. Paper text (`#f2efe7`) on this background measures **5.03:1**, passing WCAG AA for normal text. The logo and decorative patches retain bright tomato `#e85d3f`.

Examined 56 social/video SVG text elements. Every measured text pair now meets the 4.5:1 normal-text threshold; none relies on large-text status. The CSS tomato button uses the same darker token.

Ink on paper: 7.26:1, passing AAA normal text. Dark green on paper: 6.01:1, passing AA normal text. The ink focus outline exceeds the 3:1 non-text threshold against paper.

Decorative tomato is 3.01:1 against paper, sage shadows 1.74:1, yellow patches 1.46:1 and sage patches 1.65:1. These lower-contrast decorative colors should not carry small text or essential control information alone.

Scope: local asset pack and defined button CSS. This does not qualify the deployed site, caption ASS rendering, private screenshot content, or browser interactions. Smaller text can still become hard to read even when its color contrast passes.

Method: WCAG sRGB relative luminance. Pass/fail uses unrounded ratios. Normal text needs 4.5:1, large text and essential non-text graphics need 3:1. Logos and purely decorative artwork have exceptions. References: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Full palette matrix

Includes unused combinations; a failing unused pair does not establish an accessibility defect.

| Pair | Ratio | AA normal text | AA large text / non-text |
|---|---:|---|---|
| paper / ink | 7.26:1 | Pass | Pass |
| paper / green | 6.01:1 | Pass | Pass |
| paper / tomato | 3.01:1 | Fail | Pass |
| paper / action_tomato | 5.03:1 | Pass | Pass |
| paper / shadow | 1.74:1 | Fail | Fail |
| paper / yellow | 1.46:1 | Fail | Fail |
| paper / sage | 1.65:1 | Fail | Fail |
| ink / green | 1.21:1 | Fail | Fail |
| ink / tomato | 2.41:1 | Fail | Fail |
| ink / action_tomato | 1.44:1 | Fail | Fail |
| ink / shadow | 4.18:1 | Fail | Pass |
| ink / yellow | 4.97:1 | Pass | Pass |
| ink / sage | 4.38:1 | Fail | Pass |
| green / tomato | 2.00:1 | Fail | Fail |
| green / action_tomato | 1.20:1 | Fail | Fail |
| green / shadow | 3.46:1 | Fail | Pass |
| green / yellow | 4.12:1 | Fail | Pass |
| green / sage | 3.63:1 | Fail | Pass |
| tomato / action_tomato | 1.67:1 | Fail | Fail |
| tomato / shadow | 1.73:1 | Fail | Fail |
| tomato / yellow | 2.06:1 | Fail | Fail |
| tomato / sage | 1.82:1 | Fail | Fail |
| action_tomato / shadow | 2.89:1 | Fail | Fail |
| action_tomato / yellow | 3.44:1 | Fail | Pass |
| action_tomato / sage | 3.04:1 | Fail | Pass |
| shadow / yellow | 1.19:1 | Fail | Fail |
| shadow / sage | 1.05:1 | Fail | Fail |
| yellow / sage | 1.13:1 | Fail | Fail |

Per-element results are in `contrast-report.json`.

## Texture bounds

All 56 text color pairs also pass at conservative texture bounds: black paper grain at 2.5% opacity and white weave at 3.5% opacity. The lowest ratio is 4.71:1. These checks cover source-color bounds, not rendered browser or full accessibility qualification.
