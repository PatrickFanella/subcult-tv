# SUBCULT logo legibility studies

Four review concepts derived from `../../library/references/subcult-mark-master.svg`. The user approved B, C and D without registration lines. Shared geometry lives in `../../library/subcult_assets.py`; this folder's generator owns the comparison exports. Production uses C as the primary mark, B as the outlined alternate and D for compact placements.

- **A — Integrated original:** retains the letter shapes, block and registration lines. Replaces the original underscore subpath and extension rectangle with one closed path.
- **B — Heavier outline:** increases the C outline from 4.97357 to 9 SVG units and removes the registration lines. Reverse artwork outlines the green block; monochrome removes it.
- **C — Solid letters:** fills the original C shape and removes the registration lines. Reverse artwork outlines the green block; monochrome removes it.
- **D — Compact:** uses filled letters, removes the block and registration lines, and tightens the viewBox from 256 to 192 units. The color version uses a green underscore. White versions use a white underscore.

All four use a continuous underscore from x=126.56219 to x=215.57934, at y=193.97992–213.34037. There is no extension rectangle. The bar aligns with the original rightmost extent; removing the overlay also removes its slight vertical step.

`comparison.svg` and `comparison.png` show a reconstructed current-master baseline, followed by A–D on purple and dark backgrounds. White reverse and white monochrome treatments are separate. Widths are 112, 64, 48, 32, 24 and 16 pixels; inspect at 100% to judge the small samples. The baseline uses the source geometry directly, rather than the nested viewport used by some existing exports.

The 16-pixel sample is a stress test, not an approved minimum. These are rendered artwork studies; browser/device placement and recognition by viewers have not been tested. C keeps more of the original identity; D is the strongest candidate for compact placements. A fixes the construction but retains the thin outline and crossing lines.

Rebuild with `rtk proxy python studio/branding/reviews/subcult-logo-legibility/build_variations.py` from the repository root. `manifest.json` records the input hash and concept SVG hashes. The production selection is recorded in `../../library/brands/subcult/logo-selection.json`.

## B and C with registration lines

`registration-comparison.png` and its SVG compare two additional options. `b-registration-*` retains the heavier outlined C; `c-registration-*` retains the solid C. Both restore the original registration line positions and tilt behind the lettering, with a 3-unit stroke rather than the original 1-unit stroke. The lines use dark ink with dark letters and green with white letters. Both white treatments use green lines; the `mono` filename identifies the earlier plain-white letter treatment, but these new variants have a green accent and are not monochrome.

The continuous underscore is retained. These registration-line options were reviewed and rejected; they remain here as review history.
