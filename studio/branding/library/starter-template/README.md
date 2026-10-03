# Brand starter template

Edit `brand.json`, then create a new directory:

```sh
python3 bootstrap.py brand.json /path/to/new-brand-pack --render
```

Python 3 creates the editable SVG layouts, tokens, source register and asset manifest. `--render` also needs rsvg-convert and produces PNGs with the included fonts. The generator refuses to overwrite an existing directory, rejects invalid colors and requires ordinary text/background contrast of at least 4.5:1.

The kit supplies:

- logo and mark placeholders
- banners
- square, landscape, story, quote and release layouts
- a screenshot frame
- video title, thumbnail, end-card and transparent lower-third layouts
- Space Grotesk, Public Sans and JetBrains Mono, with their OFL licenses

The initials are temporary artwork, not a finished identity.

## After generating

1. Decide who the brand is for and what it does for them, in one concrete sentence.
2. Set the palette and the typography roles.
3. Draw an original mark. Check it at 32 pixels and define its clear space.
4. Rework the layouts for the new brand. Do not copy another product's signature motif, and keep the existing product identities separate.
5. Record the source and publication rights for photos, screenshots, quotations and footage.
6. Before publication, replace placeholder copy, verify claims and write alt text.

The guides under `../brands/` show completed systems. Each product's voice is in [the voice guide](../../../content/VOICE.md).
