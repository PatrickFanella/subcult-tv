"""Patchwork's site interface roles, observed from the product repository.

Source: subculture-collective/patchwork, apps/web/src/styles/tokens.css and docs/design-system.md at main
c1adb37 (observed October 2, 2026). The promotional pack keeps its own softer ink and stitched shapes;
these values belong to the site. brands/patchwork/WEBSITE.md describes how the site uses them.
"""
INTERFACE={
 'paper':'#f2efe7','surface':'#fffdf7','quiet_fill':'#e8e2d4','panel':'#d9d1c0',
 'ink':'#172019','muted_text':'#4f5a51','action_pine':'#12664f','info_sage':'#9ec5ad','emphasis_mustard':'#f2c14e',
 'mark_terracotta':'#e85d3f','ask_for_help_fill':'#c2462b','danger':'#b93b2c','focus':'#0b62d6',
 'corners':{'card':'2px 18px 2px 18px','button':'3px 12px 3px 12px','input':'2px 12px 2px 12px'},
 'outline':'1.5px solid #172019','shadow_offsets_px':[2,4,7],'shadow':'ink at 16-22% opacity, no blur',
 'fonts':{'display':'Fraunces','body':'Public Sans','label':'JetBrains Mono','delivery':'bundled with the app; no third-party font host'},
 'distance_unit':'miles',
 'source':'patchwork apps/web/src/styles/tokens.css at main c1adb37',
}

GUIDE_NOTE="""## Notes for this pack

### Mark and shape

The mark is the carried-forward P glyph in a tomato stitched patch. The mark, the supporting patches, the buttons and their offset shadows share one asymmetric corner shape. Stitched shapes are supporting artwork. Draw stitches large and mildly uneven, over faint paper grain and a low-opacity fabric weave. `components.html` shows working stitched buttons, drawn with responsive SVG stitching and a dashed CSS fallback. `patch-components.css` keeps the face and shadow corners identical.

### Color

Warm paper and green are the base. Soft green ink (#365448) sets headings and body copy, and shadows are a muted sage (#b2bba1). Bright tomato (#e85d3f) stays on the logo and decorative patches, and yellow marks highlights. Behind paper-colored button labels, use the darker action tomato (#b33e28), which measures 5.03:1.

### Type

Fraunces sets headings and Public Sans sets body text.

### Limits

Product captures must keep public locations approximate and leave out private addresses.

### Site

The product owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists where the site differs from this pack (darker ink, no stitching). `tokens.json` lists the site roles under `product_interface`.

## Voice

Patchwork copy sounds like a neighbor who has done this before and is not in a hurry: full sentences, warm without being sweet, with small ordinary examples such as a ride to an appointment, a spare crib or a hot meal. Say plainly that Patchwork is a pre-alpha demonstration and that nobody should arrange real help through it yet. State the location rule exactly: requests show approximate areas, and approved public resources can show their addresses. Keep the spelling each surface already uses (the app writes "neighbours"; subcult.tv writes "neighbors"). Leave out hero language, urgency, crisis imagery, protocol terms such as PDS, DID and AT identity, and any promise that help will come.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-PATCHWORK."""
