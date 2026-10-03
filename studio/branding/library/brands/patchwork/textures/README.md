# Patchwork texture assets

The paper and fabric tiles are original, editable SVGs. Paper grain is black at 2.5% opacity and the weave is white at 3.5% opacity. Keep to those limits when texture sits beneath text, because the contrast audit checks text against them.

The website sample uses CSS background images for texture and `patch-stitches.js` for responsive SVG stitching. Stitches are 2.4 px wide, with varying lengths, gaps and small tilts. When JavaScript is disabled, a dashed CSS border takes the place of the stitching. The sewing assets in `../decorative/` are optional original vector accents. The sample treats them as decoration and hides them from assistive technology.

These are local brand assets. Applying them to the live website is separate work.
