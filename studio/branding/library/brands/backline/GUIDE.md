# Backline — Poster Crew

The owner selected Poster Crew on October 4, 2026. This pack develops that direction into an original BL monogram, outlined wordmarks, a bot avatar, browser icons, social layouts and a landing-page share image. The new artwork is prepared for review; it has not been uploaded to Discord or published as a social post.

Studio owns these maintained masters and their generator. The Discord product owns implementation, capability claims and the applied interface specification. Exported product bytes are recorded in the product's `brand/backline/source-provenance.json`.

## Identity

The BL monogram is an original geometric construction: a notched B, a separated L and a shared baseline bar. The full lockup places that monogram beside an outlined Oswald Bold wordmark. The wordmark has its own short baseline. Do not join the BL mark to SUBCULT's SC mark or redraw SUBCULT's approved artwork.

Use the ink lockup on paper or purple. Use the paper lockup on dark ink. The green baseline is decorative. In the 64px browser icon it becomes ink to keep the silhouette coherent. Leave at least one quarter of the mark width clear around it. Use the mark alone below a 180px lockup width. Minimum mark size: 32px. The favicon is a purpose-made 64px variant.

## Palette and type

| Role | Value | Use |
| --- | --- | --- |
| Brand field | #8b5cf6 | Navigation, hero and promotional fields |
| Ink | #100b19 | All text on purple, green or paper |
| Paper | #f0ece4 | Reading surfaces and reversed text on ink |
| Accent | #00ff88 | Primary actions and large emphasis |
| Muted violet | #5944ab | Supporting emphasis on paper |
| Danger | #a61d36 | Explicitly labeled destructive states on paper |

Ink on purple has about 4.58:1 contrast. Green on purple is about 3.16:1 and is decorative. Do not use it for ordinary small text. Keep status text explicit; a brand color does not imply delivery, connection or success.

Oswald Bold 700 supplies display headings. Space Grotesk supplies body and controls. JetBrains Mono Regular 400 supplies IDs and metadata. Avoid uppercase paragraphs. Body text is 16px by default; product metadata should generally remain at least 12px. The landing page's small specimen labels are secondary illustration annotations.

Fonts and OFL licenses are included. The font source receipt records Google Fonts upstream URLs and hashes, plus the Studio source of JetBrains Mono. Wordmark masters contain paths, so placement requires no fonts. Body font exports are WOFF2 and served locally.

## Components and motion

Use the 8, 16, 24, 32, 48, 64 and 96px spacing scale. Major containers use 2px ink borders and square corners. Actions can carry a 4px hard offset shadow; do not shadow every row. Minimum action height is 44px. Use a visible focus outline with sufficient offset. A pressed action moves toward its shadow; reduced motion switches state without movement.

Purple anchors the landing page's navigation and display area. Paper holds explanations, configuration and transcripts. For narrow layouts, stack the hero and workflow example, expose a labeled menu button, wrap capability labels and retain readable body copy. Product forms must retain inputs on error and describe the missing permission or corrective action.

## Assets and rebuild

`masters/` holds editable SVG artwork with outlined type. `product/` holds matching SVGs, PNG exports and local WOFF2 fonts. `asset-manifest.json` records generated files and SHA-256 hashes. `tokens.json` records the selected roles.

Run `python build_assets.py` from this folder with fonttools and rsvg-convert installed. Run `python build_assets.py --product-root /path/to/discord-spywatcher` to export only this pack's generated product assets and a provenance receipt. Rebuild only Backline. Do not run the unrelated brand generators.

The social square is 1080×1080, banner 1500×500, and share image 1200×630. The bot avatar is 512×512 and touch icon 180×180. Check each destination's crop before use. The share and square artwork say Private pilot; do not turn those files into public-installation claims. No public domain is invented.

## Copy and reference sources

Backline speaks calmly and directly about the work: “Choose a welcome channel”, “Three tickets need an owner”, and “Check channel permissions”. The selected display line is “Keep your people together.” It is a positioning line, not a guarantee about retention or engagement.

The applied landing page explains onboarding, moderation and private support. Its workflow illustration uses fictional members and records and labels them as sample content. It does not claim a working support-queue dashboard. Radio, billing, pricing and broader installation are outside the page's release claims.

Sources: SUBCULT's selected Culture / poster press guide and tokens, plus the Studio Neo-Brutalism study. These inform color, type, explicit borders and selective hard shadows. Reference screenshots and third-party identity assets are not included in this pack.
