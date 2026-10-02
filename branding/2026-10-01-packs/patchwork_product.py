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

GUIDE_NOTE=' The product owns the site interface: [the website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists where the site differs from this pack (darker ink, no stitching). `tokens.json` lists the site roles under `product_interface`.'
