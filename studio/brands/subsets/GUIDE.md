# Subsets — Personal Utility

The owner selected Personal Utility and approved the refined identity, repository branding, and landing-page publication on October 4, 2026. This pack includes original vector marks, role tokens, licensed fonts, a brand board, social and video layout masters, and an Open Graph image. Template samples still require their own publication review.

Subsets discovers agent skills on disk, organizes named groups, and previews and applies selections. Its current native edition is a terminal application. The visual identity makes it feel like a compact personal utility: silver surfaces, charcoal structure, and mint selected states.

## Color roles

Silver `#d9dedc` is the canvas and window chrome. Charcoal `#17201e` carries text, outlines, and terminal surfaces. Mint `#94f7b7` identifies a selected set or active view. Soft white `#eef1ef` supports reading surfaces and terminal text. Muted text uses `#43534b`; borders use `#64716c`.

Use charcoal text on silver, soft white, or mint. Use soft white or mint text on charcoal. Mint on silver lacks sufficient text contrast; never use it for small text or an unoutlined control. Selection controls combine color with a visible label and state, rather than relying on color alone. The primary logo is exempt from text contrast rules; switch to monochrome when the mint geometry disappears against the surface.

## Mark and typography

The original mark uses six adjoining square tiles with two selected mint tiles. Keep one tile of clear space around the geometry; the mark SVG includes half a tile of built-in padding. Add the remaining space in placement. Use the monochrome mark at 16–24 pixels, the full-color mark at 32 pixels or larger, and the wordmark at 120 pixels or larger. Do not add a gradient, bevel, rotation, or rounded tile corners.

Space Grotesk sets the lowercase wordmark and headings. Public Sans carries explanations. JetBrains Mono sets commands and small labels. Bundled font files retain their OFL license texts. Outlined lockups avoid a runtime font dependency. Spacing uses 4, 8, 12, 16, 24, 32, 48, 64, and 96 pixels. Window corners use an 8-pixel radius; controls use 3 pixels. A single hard charcoal shadow gives the window its compact desktop character.

## Product presentation and copy

The lead is “All your skills. Only the set you need.” Explain discovery, explicit adoption, grouping, preview, application, and recovery in concrete terms. Do not imply automatic task detection, a desktop GUI, cloud synchronization, improved model performance, or compatibility established by discovery alone.

The landing prototype uses actual rendered frames from the current Ink component, with disposable sample skill files. Its view buttons select captures; they do not operate local folders. Keep the real keyboard labels, identify sample data, and preserve the product source revision with the capture. A screenshot or render does not prove a new live workflow or cross-platform support.

Installation copy follows the product's npm alpha documentation. Linux qualification is documented in the product; macOS remains unverified and Windows is unsupported. The approved landing-page domain is `subsets.subcult.tv`.

## Sources, rebuilding, and export

`brand.json` and `build.py` are the source configuration and generator. `logos/` contains editable and outlined variants. `tokens.json` and `tokens.css` record role values. `brand-board.svg` is editable; its PNG is rendered from that source. `social/og.svg` is an original 1200×630 composition. `source-register.json` records ownership and inspiration; `asset-manifest.json` binds pack files to SHA-256 hashes.

From the repository root, run:

```sh
python studio/brands/subsets/build.py \
  --export /home/onnwee/Work/Tools/subsets/site/assets/brand
```

This rebuilds only Subsets and exports an explicit selection of original assets and licensed fonts. It does not export reference captures, other brands, private Studio documents, or runtime bundles. `brand-export.json` records the selected paths and hashes in the product copy. Run the product's `scripts/capture-tui.mjs` separately after compiling its native app. The product owns the landing implementation and executable behavior; Studio owns these brand masters.

The Desktop FM reference informed the compact utility direction. No screenshot, logo, or third-party artwork from that reference is reused. The owner authorized landing deployment. Social publication remains a separate action.
