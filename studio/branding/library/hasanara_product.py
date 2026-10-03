"""HasanAra's site interface roles, observed from the deployed application.

Source: subculture-collective/rekolekt frontend/src/index.css and frontend/index.html at 19124a7, with the
client profile in subculture-collective/hasanara branding/brand.json at c9b09b2 (deployed October 2, 2026,
09:42 UTC). The profile overrides only the accent roles; canvas, text, rules and typefaces come from the
application's Broadsheet stylesheet. brands/hasanara/WEBSITE.md describes how the site uses them.
"""
INTERFACE={
 'night_edition':{'canvas':'#0f0f0f','surface':'#161616','surface_muted':'#1f1f1f','surface_raised':'#262626','border':'#2f2f2f','border_strong':'#5a5650',
  'ink':'#eeeae1','muted_text':'#b5afa3','subtle_text':'#968f84',
  'accent':'#ff3333','accent_hover':'#ff6b6b','accent_soft':'#3d1212','accent_contrast':'#140303','accent_2':'#ff6633','accent_3':'#cd3333','player_accent':'#ff3333','cta':'#ff6633'},
 'paper_edition':{'canvas':'#faf9f5','surface':'#ffffff','surface_muted':'#f1efe8','border':'#dad6cc','border_strong':'#3a3a3a',
  'ink':'#121212','muted_text':'#464646','subtle_text':'#5d5d5d',
  'accent':'#cd3333','accent_hover':'#a32424','accent_soft':'#fbe3dc','accent_contrast':'#ffffff','accent_2':'#ff6633','accent_3':'#cd3333','player_accent':'#ff3333','cta':'#cd3333'},
 'stripe':['#ff6633','#cd3333','#ff3333'],
 'corners_px':'0 to 3',
 'rules':{'panel_top':'3px solid ink','site_header_end':'3px double ink','row':'1px solid border'},
 'focus':'2px solid accent, 2px offset',
 'label':{'classes':['archive-eyebrow','meta-label','archive-rule-title'],'font_token':'--font-label','size_px':11,'weight':500,'tracking_em':0.12,'case':'uppercase'},
 'fonts':{'display_and_reading':'Newsreader, variable 400-800 with italics','body':'Inter Tight 400-700','label_and_metadata':'JetBrains Mono, variable 400-700','delivery':'Google Fonts; the content security policy allows fonts.googleapis.com and fonts.gstatic.com'},
 'breakpoints_rem':{'ticker_and_tall_header':40,'transcript_rail':64},
 'social_card':{'size_px':[1200,630],'file':'branding/assets/social-card.svg','text':'outlined in Newsreader Bold and Inter Tight; the frontend image has only DejaVu fonts','editable_source':'branding/social-card.source.svg'},
 'public_url':'https://hasanara.tv/',
 'source':'rekolekt frontend/src/index.css at 19124a7; hasanara branding/brand.json at c9b09b2',
}

GUIDE_NOTE="""## Notes for this pack

### Mark and theme

Match the current hasanara.tv red/PBS theme and keep the actual PBS artwork. The older lime theme in the local checkout is not this pack's reference.

### Type

Newsreader sets editorial headings, Inter Tight sets body copy and JetBrains Mono sets metadata.

### Limits

A quote needs its original passage, attribution and timestamp.

### Site

The application owns the site interface. [The website design specification](WEBSITE.md) records the deployed pages, color and type roles, components and assets, and lists where the site differs from this pack (a paper edition, its own home headline, hosted variable fonts). `tokens.json` lists the site roles under `product_interface`.

## Voice

HasanAra copy is read by the continuity announcer of the Piker Broadcasting Service: public television with a straight face, mock-solemn, a bit cheesy on purpose and never mean. Newspaper furniture is welcome: editions, the record, corrections. Call the archive "the record" and treat timestamps as citations. The joke is the formality, so the facts under it stay exact. Say outright that transcripts are machine-made and need checking against the recording before anyone quotes them. Leave out stan voice, political editorializing, claims of complete coverage or accuracy, and jokes at the expense of people in the recordings.

The full voice and its sample lines are in [the voice guide](../../../../content/VOICE.md). Facts come from [the claims register](../../../../content/social/Product%20Claims%20Register.md), entry C-HASANARA."""
