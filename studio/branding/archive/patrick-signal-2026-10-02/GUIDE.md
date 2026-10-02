# Patrick__eff — Brand and asset guide

Selected direction: **A / Signal / current banner**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

Cascadia Mono with separated underscores; bracketed PF and waveform marks; lime and purple offset accents on charcoal.

Match the user-authored banner: Cascadia Mono Bold for the name and display headings; Cascadia Mono Regular for supporting copy; keep a 0.08em gap between the two underscores in the wordmark; Space Grotesk for handles and destination links; JetBrains Mono for labels. Use the user-edited PF mark for avatars and primary lockups, the clean bracketed waveform as an alternate, and tall variants as decorative art without changing their proportions. Large headings use lime lower-left and purple upper-right offsets; standalone waveforms use warm white in front with the same lime/purple offsets. Body copy and small labels remain flat. Monochrome marks simplify to brackets, PF and the dot. Preserve the social icons and links in references/patrick-banner-master.svg. Use purple for the waveform, rules and decorative fields. Purple on charcoal is below the small-text contrast target; use lime or warm white for labels. Keep the waveform as the signature. The selected banner uses a smaller solid warm-white PF mark with a purple waveform and no colored offsets on the logo. Banner alternatives are solid purple without waveform, solid warm white without waveform, and the original three-color mark. Other assets retain their existing logo styling. The personal photograph remains an optional editorial asset, not the default avatar.

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | #161616 | Main canvas |
| Text | #f3f0ed | Headlines and body text |
| Accent | #8a00c7 | Signature artwork and emphasis |
| Secondary | #66ff00 | Supporting artwork |
| Small label | #66ff00 | Metadata on the main canvas |

Measured text/base contrast: **15.94:1**. Small-label/base contrast: **13.67:1**. Accent/base contrast: **2.50:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: Cascadia Mono, bold for headlines.
- Body: Cascadia Mono, regular and bold.
- Labels: JetBrains Mono, regular.
- Layout spacing: 8, 16, 24, 32, 48, 64, 96 pixels.
- Use one clear headline, one supporting point and one destination per promotional asset.
- Keep at least one quarter of the mark height clear on all sides. Minimum mark width: 32 pixels on screen. Minimum horizontal lockup width: 220 pixels. Use the mark alone below that size.
- Avoid stretching, skewing, adding effects to or redrawing the carried-forward product marks. Use the outlined logo exports when fonts are unavailable.

## Files and editing

`logos/` contains full-color primary/dark/light lockups and marks plus single-color variants, each with editable SVG, outlined SVG and transparent PNG. `social/` contains an X/Bluesky banner, a taller banner master, avatars, square/landscape/story layouts, quote and release templates, and a screenshot frame. `video/` contains title, thumbnail, end-card and transparent lower-third layouts with a caption style file. `fonts/` contains the required fonts and redistribution licenses. `tokens.json` and `tokens.css` record reusable design roles. `asset-manifest.json` records file dimensions and hashes.

Editable SVG text needs the included fonts. Install them for editing, or use the outlined logo SVGs and rendered PNGs for placement. PNGs are exported from the editable SVG source. Re-render with the top-level `build_packs.py` and its fontconfig.xml; do not edit the PNG separately.

The story artwork keeps the main message between y=250 and y=1670 on a 1080×1920 canvas. Check the destination’s current overlay and crop behavior in its composer. Keep critical banner content away from the bottom-left avatar area. These are layout guides, not a guarantee of every platform crop.

## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough interface to establish context; crop credentials, private dashboards, unpublished material and personal data. Keep original recordings separately from edited exports.

The video templates use a 1920×1080 canvas and a 96-pixel outer margin. Keep captions to two short lines. Use the supplied ASS style as a starting point, then check readability at phone size. Lower-thirds have a transparent background outside the panel. Avoid rapid flashing; use a short fade or hard cut for title/end cards. The eight-second preview is a template demonstration, not a product demonstration.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Quote/release template text is placeholder content and must be replaced. Describe the completed image in alt text, including the visible message; do not describe a screenshot placeholder as a working feature. `alt-text.md` supplies starter descriptions for the completed sample artwork.

Reference: User-edited references/patrick-variations/ masters. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
