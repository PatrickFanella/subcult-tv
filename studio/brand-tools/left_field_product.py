"""Left Field's site interface roles, observed from the product repository.

Source: subculture-collective/left-field, src/app/globals.css and src/components/presentational.tsx at main
5f41c5f (observed October 2, 2026), the revision serving left-field.subcult.tv. The pack carries the same
paper, ink, rust and wash; the site adds muted text, rule and status colours and uses system fonts. The
site carries the pack's icons, share card, banner and LF mark.
brands/left-field/WEBSITE.md describes how the site uses them.
"""
INTERFACE={
 'paper':'#f4f0e6','ink':'#16221f','signal_rust':'#a33c26','wash':'#e5eadc',
 'muted_text':'#5c6862','rule':'#aeb4a5','input_fill':'#faf8f1','notice_fill':'#e9e4d8','ledger_fill':'#f8f5ed','bar_track':'#c8c7bb',
 'status':{'published_certified':'#245e46','unavailable_superseded':'#754f13','reported_unfinalized':'#8a4126','modeled_estimated':'#6a4a86'},
 'route_tags':{'aipac_supported_blue':'paper text on ink','deep_blue':'ink text on wash','republican_held_flip':'#742d1e text on #ead8cf','democratic_incumbent':'ink text, ink outline'},
 'corners':'square; the brief score seal is the only circle',
 'rules':{'masthead_and_section_end':'3px solid ink','hero_end':'4px solid ink','row':'1px solid rule'},
 'focus':'3px solid signal rust, 3px offset',
 'depth':'none: no shadows, gradients or motion',
 'fonts':{'reading':'Georgia, "Times New Roman", serif','labels_and_controls':'Arial, sans-serif','delivery':'system fonts; the site loads no font files'},
 'page_width_px':{'default':1320,'priority_index':1440},'breakpoints_px':[1000,800,700],
 'index_page_size':50,'default_minimum_inputs':2,
 'pack_assets':{'icon':'product/favicon.svg','apple_icon':'product/apple-touch-icon.png','manifest_icons':['product/icon-192.png','product/icon-512.png'],'share_card':'product/og.png','about_banner':'product/hero-outlined.svg','masthead_mark':'logos/mark-primary.svg, redrawn inline','record':'docs/brand/site-assets.json in the product repository'},
 'public_url':'https://left-field.subcult.tv/',
 'former_url':'https://seats.dsaslate.com/, redirects',
 'page_view_counter':'self-hosted Umami injected by the edge proxy as /umami-init.js',
 'source':'left-field src/app/globals.css at main 5f41c5f',
}

GUIDE_NOTE="""## Notes for this pack

### Name

Write Left Field in prose, LEFT FIELD in the wordmark and left-field in repository and package identifiers. Preserve database names, receipt namespaces and historical source identifiers.

### Mark

The LF monogram is original and geometric: a left-anchored L and an open F on the same baseline, with a rust-red square filling their intersection. The square is not a ballot, result or certification symbol. The user approved the field-ledger direction and this mark, with the F reaching the L baseline and the red square at the intersection. Dark variants use paper ink; light and primary variants use dark ink. Use the monochrome mark when color reproduction is uncertain.

### Color

Keep the app palette: paper #f4f0e6, ink #16221f, rust #a33c26 and wash #e5eadc.

### Type

Liberation Serif is the bundled, portable stand-in for the app's Georgia stack. Public Sans replaces Arial in pack exports. JetBrains Mono sets source labels.

### Limits

Source rows in the artwork are abstract motifs without scores or counts. Show an actual ranking only with its version, scope, date, limitations and source. Never turn a provisional score into an election prediction or imply DSA endorsement.

### Site

The site is public at left-field.subcult.tv and names SUBCULT as its publisher. The product owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, copy rules and components, and lists the pack files the site carries and where the site differs from this pack (system fonts). `tokens.json` lists the site roles under `product_interface`.

## Voice

Left Field copy comes from the research desk with the footnotes still attached. It reads like a methods section by someone who can also write a headline: limits come before conclusions, and the tone is dry. A heading may be wry ("Where the field bends."); a number never is. Use "provisional", "versioned", "not in this score" and "unavailable", work at seat level with public records, and name what is missing. Leave out prediction, horse-race language, "data-driven", "insights" and anything that implies an endorsement or voter-level targeting.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md)."""
