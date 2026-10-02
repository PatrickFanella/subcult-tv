from pathlib import Path
import base64,copy,html,json,os,shutil,subprocess,hashlib,zipfile,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parent
(R/'fontconfig.xml').write_text('<?xml version="1.0"?><fontconfig><dir>'+str(R/'fonts')+'</dir><cachedir>'+str(R/'.font-cache')+'</cachedir><alias><family>Georgia</family><prefer><family>Liberation Serif</family></prefer></alias></fontconfig>')
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
import design_helpers as H
import clpr_directions as C
BRANDS=json.loads((R/'brands.json').read_text())
T=H.txt;rect=H.rect;line=H.line

def luminance(col):
 v=[int(col[i:i+2],16)/255 for i in [1,3,5]]
 v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v]
 return sum(a*b for a,b in zip(v,[.2126,.7152,.0722]))
def contrast(a,b):
 l=sorted([luminance(a),luminance(b)]);return (l[1]+.05)/(l[0]+.05)
def embed_svg(text,x,y,w,h):return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{base64.b64encode(text.encode()).decode()}"/>'
def source_mark(d,x,y,size,variant='color'):
 if d['slug']=='clpr':return C.logo(d,x,y,size,size,True)
 if d['slug']=='rekolekt':return H.rekolekt_mark(d,x,y,size)
 if d['slug']=='patchwork':return H.patchwork_mark(d,x,y,size,variant=='mono')
 files={'clpr':'clpr-icon.svg','patchwork':'patchwork-icon.svg','hasanara':'hasanara-logo.svg','undertow':'undertow-favicon.svg','rekolekt':'rekolekt-mark.svg'}
 if d['slug'] not in files:
  body=H.mark(d,x,y,size)
  if variant=='mono' and d['slug']=='subcult-os':body=body.replace('fill="#0d1117"','fill="none"')
  return body
 text=(R/'references'/files[d['slug']]).read_text();root=ET.fromstring(text)
 if d['slug']=='rekolekt':
  for el in root.iter():
   if el.attrib.get('stroke'):el.set('stroke',d['accent'])
 if d['slug']=='hasanara':
  for el in root.iter():
   if el.tag.endswith('rect') and el.attrib.get('fill')=='#000':el.set('fill','none')
 if variant=='mono':
  for el in root.iter():
   if el.tag.endswith('rect') and (el.attrib.get('width') in ['64','30'] or el.attrib.get('fill') in ['#000','#0d0b17','#0E0C13']):el.set('fill','none')
   elif el.attrib.get('fill') and el.attrib['fill']!='none':el.set('fill',d['fg'])
   if el.attrib.get('stroke') and el.attrib['stroke']!='none':el.set('stroke',d['fg'])
   if el.tag.endswith('stop'):el.set('stop-color',d['fg'])
 return embed_svg(ET.tostring(root,encoding='unicode'),x,y,size,size)
def wordmark(d,x,y,maxw=730):
 if d['slug']=='clpr':return C.logo(d,x,y-130,min(374,maxw),172)
 name={'patrick__eff':'PATRICK__EFF','rekolekt':'rekolekt','subcult':'SUBCULT','subcult-os':'Subcult OS','hasanara':'HasanAra','undertow':'UNDERTOW','patchwork':'Patchwork','kork':'kork'}[d['slug']]
 return T(x,y,name,91,d['fg'],d['display'],700,maxw=maxw)
def write_svg(dest,name,body,w,h,exportw=None,outlined=False):
 if 'patrick__eff' in dest.parts and not name.startswith('mark-') and 'mono' not in name:body=H.patrick_style(body)
 p=dest/(name+'.svg');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(H.svg(body,w,h,name))
 subprocess.run(['rsvg-convert','-w',str(exportw or w),'-o',str(p.with_suffix('.png')),str(p)],check=True)
 if outlined:
  q=dest/(name+'-outlined.svg');result=subprocess.run(['inkscape',str(p),'--export-text-to-path','--export-plain-svg','--export-type=svg','--export-filename='+str(q)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr[-700:])
 return p

def label(d,x,y,s,size=18,maxw=None):return T(x,y,s,size,d['safe_label'],d['label'],400,maxw=maxw)
def base(d,w,h):return rect(0,0,w,h,d['bg'])+(H.patch_paper(w,h) if d['slug']=='patchwork' else '')+(H.cork_texture(w,h) if d['slug']=='kork' else '')
def footer(d,w,h):return line(48,h-86,w-48,h-86,d['safe_label'],2)+T(48,h-43,d.get('url') or 'rekolekt / by SUBCULT',20,d['fg'],d['body'])
def filmstrip(d,x,y,w,h):
 a=d['accent'];f=d['fg'];s=rect(x,y,w,h,'#17141f',0,'#27222f')
 for i in range(14):
  xx=x+12+i*(w-26)/14;s+=rect(xx,y+7,12,8,'#aca7bb')+rect(xx,y+h-15,12,8,'#aca7bb')
 fw=(w-42)/3
 for i in range(3):
  xx=x+14+i*(fw+7);s+=rect(xx,y+29,fw,h-58,'#27222f',0,a if i==1 else '#8f8a9c')
  # Original frame illustration: a moving geometric subject across successive frames.
  s+=rect(xx+fw*.17+i*fw*.13,y+h*.35,fw*.29,h*.27,a if i==1 else '#aca7bb')
 return s
def timeline(d,x,y,w,h):
 s=rect(x,y,w,h,'#17141f')
 for i in range(11):s+=line(x+i*w/10,y,x+i*w/10,y+10,'#8f8a9c',1)
 for i in range(5):s+=rect(x+6+i*w*.19,y+26,w*.17,h-48,'#27222f',0,'#8f8a9c')
 s+=rect(x+w*.24,y+20,w*.46,h-36,'none',0,d['accent'])+line(x+w*.47,y-7,x+w*.47,y+h+7,d['fg'],3)
 s+=f'<path d="M{x+w*.47-7} {y-8}h14l-7 11Z" fill="{d["fg"]}"/>'
 return s

def clpr_banner(d):return C.banner(d)
def clpr_post(d):return C.post(d)

def poster(d,w,h,kind):
 if d['slug']=='clpr':return C.poster(d,w,h,kind)
 s=base(d,w,h);m=48;s+=label(d,m,64,d['tag'],19,maxw=w-96)
 if kind=='story':
  s+=source_mark(d,m,265,160)+T(m,528,d['brand'],64,d['fg'],d['display'],700,maxw=w-96)
  for i,htext in enumerate(d['headline']):s+=T(m,735+i*125,htext,88,d['fg'],d['display'],700,maxw=w-96)
  if d['slug']=='clpr':s+=filmstrip(d,m,1050,w-96,250)+timeline(d,m,1335,w-96,93)
  elif d['slug']=='patrick__eff':s+=H.patrick_wave(m,1150,w-96,240,d,41)
  elif d['slug']=='rekolekt':s+=H.rekolekt_transcript(d,m,1095,w-96,285)
  elif d['slug']=='undertow':s+=H.wave(m,1150,w-96,240,d['accent'],41)
  elif d['slug']=='kork':s+=H.cork_stack(d,m,1040,w-96,400)
  else:s+=line(m,1120,w-48,1120,d['accent'],12)
  s+=T(m,1500,'YOUR NOTE OR INVITATION',31,d['fg'],d['body'],700,maxw=w-96)+T(m,1560,'Replace this line with approved copy.',25,d['fg'],d['body'],maxw=w-96)+T(m,1652,d.get('url') or 'Rekolekt by SUBCULT',25,d['fg'],d['body'])
 elif kind=='landscape':
  if d['slug']=='clpr':s+=filmstrip(d,w-524,177,476,293)+timeline(d,w-524,505,476,102)
  else:s+=source_mark(d,w-314,205,218)
  for i,htext in enumerate(d['headline']):s+=T(m,345+i*115,htext,87,d['fg'],d['display'],700,maxw=w-610 if d['slug']=='clpr' else w-400)
  s+=T(m,641,'YOUR APPROVED CAPTION',26,d['fg'],d['body'],700)+footer(d,w,h)
 elif kind=='quote':
  s+=T(m,228,'“',150,d['safe_label'],d['display'],700)
  for i,htext in enumerate(['Add the exact quote.','Keep its context.']):s+=T(m,347+i*97,htext,67,d['fg'],d['display'],700,maxw=w-96)
  s+=line(m,655,w-48,655,d['accent'],5)+T(m,725,'SOURCE / SPEAKER / DATE',24,d['fg'],d['label'])+T(m,781,'ORIGINAL URL / TIMESTAMP',22,d['fg'],d['label'])+footer(d,w,h)
 elif kind=='release':
  s+=source_mark(d,m,129,130)+T(m,369,'WHAT CHANGED',78,d['fg'],d['display'],700,maxw=w-96)
  for i,htext in enumerate(['01 / A verified change','02 / A useful consequence','03 / A direct destination']):s+=T(m,528+i*100,htext,32,d['fg'],d['body'],maxw=w-96)
  s+=footer(d,w,h)
 return s

def screenshot(d):
 if d['slug']=='clpr':return C.screenshot(d)
 w,h=1600,1000;s=base(d,w,h)+label(d,48,65,d['brand'].upper()+' / WORKFLOW CAPTURE',20)
 s+=rect(48,110,1504,738,'none',8 if d['slug']=='patchwork' else 0,d['safe_label'])+T(104,465,'PLACE A VERIFIED SCREENSHOT HERE',36,d['fg'],d['label'],maxw=1350)+T(104,519,'Crop private data. Keep interface text legible.',28,d['fg'],d['body'])+footer(d,w,h)
 return s

def video(d,kind):
 if d['slug']=='clpr':return C.video(d,kind)
 w,h=1920,1080
 if kind=='lower-third':
  s=rect(96,823,1728,174,d['bg'])+rect(96,823,12,174,d['accent'])+source_mark(d,128,847,113)+T(278,892,'TITLE / SPEAKER',46,d['fg'],d['display'],700,maxw=1400)+T(278,950,'One short line of context.',30,d['fg'],d['body'])
 elif kind=='end-card':
  s=base(d,w,h)+source_mark(d,160,313,260)+wordmark(d,499,489,1240)+T(499,615,d.get('url') or 'Rekolekt by SUBCULT',40,d['fg'],d['body'])+line(160,825,1760,825,d['accent'],4)
 else:
  s=base(d,w,h)+label(d,96,123,d['brand'].upper()+' / '+kind.upper(),28)
  for i,htext in enumerate(['ADD A CLEAR TITLE','One useful idea.']):s+=T(96,400+i*140,htext,102 if i==0 else 70,d['fg'],d['display'] if i==0 else d['body'],700 if i==0 else 400,maxw=1728)
  if d['slug']=='clpr':s+=filmstrip(d,96,681,1250,216)+timeline(d,1393,681,431,216)
  else:s+=source_mark(d,1630,761,160)
 return s

def font_files(d):
 names={d['display'],d['body'],d['label']}
 if d.get('support'):names.add(d['support'])
 if d['display']=='Georgia':names.remove('Georgia');names.add('Liberation Serif')
 selected=[]
 for meta in json.loads((R/'fonts/sources.json').read_text()):
  if meta['family'] in names:selected.extend(meta['files']);selected.append(meta['family'].lower().replace(' ','')+'-OFL.txt')
 if 'Liberation Mono' in names:selected+=['LiberationMono-Regular.ttf','LiberationMono-Bold.ttf','Liberation-LICENSE.txt']
 if 'Liberation Serif' in names:selected+=['LiberationSerif-Regular.ttf','LiberationSerif-Bold.ttf','Liberation-LICENSE.txt']
 return list(dict.fromkeys(selected))

def guide(d,dest):
 slug=d['slug'];c=contrast(d['fg'],d['bg']);ac=contrast(d['accent'],d['bg']);safe=contrast(d['safe_label'],d['bg'])
 extras={
 'patrick__eff':'Match the user-authored banner: Cascadia Mono Bold for the name and display headings; Cascadia Mono Regular for supporting copy; keep a 0.08em gap between the two underscores in the wordmark; Space Grotesk for handles and destination links; JetBrains Mono for labels. Use the user-edited PF mark for avatars and primary lockups, the clean bracketed waveform as an alternate, and tall variants as decorative art without changing their proportions. Large headings use lime lower-left and purple upper-right offsets; standalone waveforms use warm white in front with the same lime/purple offsets. Body copy and small labels remain flat. Monochrome marks simplify to brackets, PF and the dot. Preserve the social icons and links in references/patrick-banner-master.svg. Use purple for the waveform, rules and decorative fields. Purple on charcoal is below the small-text contrast target; use lime or warm white for labels. Keep the waveform as the signature. The selected banner uses a smaller solid warm-white PF mark with a purple waveform and no colored offsets on the logo. Banner alternatives are solid purple without waveform, solid warm white without waveform, and the original three-color mark. Other assets retain their existing logo styling. The personal photograph remains an optional editorial asset, not the default avatar.',
 'rekolekt':'Use the lowercase `rekolekt` wordmark and `Rekolekt` in prose. Pair it with “by SUBCULT” for endorsement. Preserve the original bracketed waveform logo without geometry changes. Only the story template’s decorative waveform is replaced by transcript rows and timestamps. Keep source/context metadata attached to quoted passages. This selected visual identity does not rename the transcript-create repository or deployment.',
 'subcult':'This is the user-selected C direction. User-edited banner, logo banner and square-post masters are kept in references/subcult-edited-layouts/ and copied without alteration during rebuilds. The user-authored master mark is references/subcult-mark-master.svg: filled S and underscore, outlined C, a tilted green block, registration lines and a terminal square. Preserve its geometry, overlap and layer order. Use the master SVG for every variant; recolor only ink and accent for dark and light applications. In monochrome, outline the accent block so the letters remain legible. Use purple as the primary field, dark ink for headlines and acid green for blocks, registration marks and large emphasis. Use dark ink for text on green. Green on purple is decorative; it is below the small-text contrast target. Keep the six products visible as a coherent catalogue without recoloring their own identities.',
 'clpr':'The user-edited play-triangle logo governs the assets. The user selected Clip stack for the main layouts and single clip card for the square post. The comparison variations remain available. These layouts replace the filmstrip and timeline motifs. Keep the muted-white wordmark, purple play triangle, dark field and green details. Earlier banners are preserved in references/. Use the captured play wordmark and play icon. Barlow Condensed sets titles; Barlow carries body copy; IBM Plex Mono carries labels. Crop corners, overlapping clip cards and purple play fields are the three graphic alternatives. Keep their geometry separate from screenshots of the product.',
 'patchwork':'Warm paper and green are the base; bright tomato marks decorative patches and yellow marks highlights. Use darker action tomato (#b33e28) behind paper-colored button labels: 5.03:1 contrast. Keep the logo and decorative patches at their original tomato (#e85d3f). Use Fraunces for headings and Public Sans for body text. Stitched shapes are supporting artwork. Use the carried-forward P glyph in a tomato stitched patch. The mark, supporting patches, buttons and their offset shadows share the same asymmetric corner shape. Use larger, mildly uneven stitches, faint paper grain and a low-opacity fabric weave. The browser sample uses responsive SVG stitching with a dashed CSS fallback. Use soft green ink (#365448) for headings/body copy and a muted sage (#b2bba1) shadow. `components.html` shows working stitched buttons; `patch-components.css` keeps face and shadow corners identical. Product captures must preserve approximate public locations and omit private addresses.',
 'hasanara':'Match the current hasanara.tv red/PBS theme. Use Newsreader for editorial headings, Inter Tight for body copy and JetBrains Mono for metadata. Keep the actual PBS artwork. The local older lime theme is not this pack’s reference. Quotes need their original passage, attribution and timestamp.',
 'subcult-os':'Matches the live os.subcult.tv design system (the Subcults terminal foundation, selected by the user on September 30, 2026; source of truth: subcult-os contracts/design/tokens.json). Space Mono is the only typeface: bold for headings, buttons and labels, regular for body copy, uppercase with wide tracking for labels. Bold is the heaviest weight. Corners are square everywhere; panels separate with visible borders, not shadows. Purple is the action and artwork color: purple fills carry white text (5.7:1), but purple text on black is below the small-text target, so labels use cyan. Cyan also marks focus. Status colors (green, amber, red, cyan) mark states and always come with words. Event artwork stays immersive and black. The OS lettermark with a cyan cursor block is a pack mark; the site itself uses the plain wordmark.',
 'kork':'Identity for the self-serve links-page service, code name zelda. On October 2, 2026 the user selected direction A (pinned card) and the name Kork over Corkboard; the comparison is in corkboard-directions/. A services marketplace also trades as Kork (kork.app); this was noted to the user, who chose the name anyway. The mark is an original pinned paper card: two link rows on a tilted card under a cobalt pushpin. It stays legible at 32 pixels because the rows and pin are solid shapes. Cork (#d4a56c) is the field, ink (#1b130c) carries all text, paper (#fbf6ec) fills cards, and cobalt (#2340e8) is reserved for pins and large emphasis: cobalt on cork is 3.2:1, so never use it for small text. Archivo Black sets the wordmark and headlines, Atkinson Hyperlegible Next carries body copy and JetBrains Mono carries labels, the shared SUBCULT cue. Pinned cards carry placeholder destinations (@yourname, $yourname, a decorative QR glyph that encodes nothing); do not show third-party platform logos in brand artwork. Cards tilt between -7 and +7 degrees with a hard ink shadow; keep at least one card straight enough to read. The product page itself lets users pick any theme, so this identity applies to the service, not to user pages.',
 'undertow':'Use the active editor theme: pink/cyan/lilac on dark violet, square geometry and hard offsets. Keep the existing spectrum favicon. Liberation Mono is the bundled portable alternative to the site’s system monospace stack. Chromatic offsets are for large titles, never body copy.'
 }[slug]
 doc=f'''# {d['brand']} — Brand and asset guide

Selected direction: **{d['variant']} / {d['name']}**. Status: local production pack v1. Direction selection is not permission to publish a post or change a profile.

{d['description']}

{extras}

## Color roles

| Role | Color | Use |
| --- | --- | --- |
| Base | {d['bg']} | Main canvas |
| Text | {d['fg']} | Headlines and body text |
| Accent | {d['accent']} | Signature artwork and emphasis |
| Secondary | {d['secondary']} | Supporting artwork |
| Small label | {d['safe_label']} | Metadata on the main canvas |

Measured text/base contrast: **{c:.2f}:1**. Small-label/base contrast: **{safe:.2f}:1**. Accent/base contrast: **{ac:.2f}:1**. Use at least 4.5:1 for ordinary text and 3:1 for large text. Swatches are roles, not interchangeable text colors.

## Typography and spacing

- Display: {d['display']}, bold for headlines.
- Body: {d['body']}, regular and bold.
- Labels: {d['label']}, regular.
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

Reference: {d['source']}. Site/asset observations were made October 1, 2026. Original files in the legacy library are preserved. The inventory’s hashes identify bytes; they do not establish permission to publish third-party material.
'''
 (dest/'GUIDE.md').write_text(doc)
 (dest/'alt-text.md').write_text(f'''# {d['brand']} — Alt text starters

- Banner: {d['brand']} branding in the {d['name']} direction. Visible headline: “{' '.join(d['headline'])}”.
- Square sample: Describe the visible headline, brand mark and supporting illustration in `social/square-post.png`.
- Avatar: {d['brand']} mark on the selected brand background.

Replace these starters when copy or imagery changes. Describe a screenshot’s actual task and visible result. For a quoted passage, include the visible words and attribution. Empty templates are editing aids and should not be published as finished assets.
''')

# Captured source marks are bundled under references/.
for d in BRANDS:
 if os.environ.get('BRAND_ONLY') and d['slug']!=os.environ['BRAND_ONLY']:continue
 dest=R/'brands'/d['slug'];dest.mkdir(parents=True,exist_ok=True);(dest/'fonts').mkdir(exist_ok=True)
 for name in font_files(d):shutil.copy2(R/'fonts'/name,dest/'fonts'/name)
 tokens={'brand':d['brand'],'direction':d['name'],'status':'local production pack v1','colors':{k:d[k] for k in ['bg','fg','accent','secondary','safe_label']},'fonts':{k:d[k] for k in ['display','body','label','support'] if k in d},'spacing':[8,16,24,32,48,64,96],'mark_clear_space':'25% of mark height','mark_min_width_px':32,'source':d['source'],'direction_selection':d.get('direction_selection') or ('user' if d['selected_by_user'] else 'established-theme example')}
 if d['slug']=='subcult':
  shutil.copy2(R/'references/subcult-mark-master.svg',dest/'logos/master.svg')
  tokens['mark_master']={'path':'logos/master.svg','sha256':hashlib.sha256((R/'references/subcult-mark-master.svg').read_bytes()).hexdigest(),'construction':'User-authored SVG; preserve geometry and layer order'}
 if d['slug']=='clpr':tokens.update(graphic_direction=d.get('graphic_direction'),square_direction=d.get('square_direction'))
 if d['slug']=='patrick__eff':shutil.copytree(R/'references/patrick-variations',dest/'logos/source-variations',dirs_exist_ok=True)
 if d['slug']=='patrick__eff':tokens['mark_styles']=d.get('mark_styles',{});tokens['mark_sources']='logos/source-variations/';tokens['banner_logo']={'primary':d.get('banner_logo'),'alternates':d.get('banner_alternates',[]),'scope':'banner only'}
 if d['slug']=='patchwork':tokens['texture']={'paper_black_opacity':.025,'fabric_white_opacity':.035,'stitch_width_px':2.4,'stitch_length_px':[9,11,8,10,9.5],'stitch_gap_px':[8,9,7,10,8.5],'stitch_tilt_px':[.5,-.7,.3,.8,-.4]};tokens['colors']['action_tomato']=d['action_tomato'];tokens['shape']={'corners':'2px 22px 2px 22px','stitch_inset_px':8,'shadow_offset_px':[5,6],'shadow_color':'#b2bba1'}
 (dest/'tokens.json').write_text(json.dumps(tokens,indent=2));(dest/'tokens.css').write_text(':root {\n'+''.join(f'  --brand-{k.replace("_","-")}: {d[k]};\n' for k in ['bg','fg','accent','secondary','safe_label'])+''.join(f'  --font-{k}: "{d[k]}";\n' for k in ['display','body','label','support'] if k in d)+'}\n')
 if d['slug']=='patchwork':
  with (dest/'tokens.css').open('a') as f:f.write('\n:root { --brand-action-tomato: '+d['action_tomato']+'; }\n')
 for name,bg,fg,mono in [('primary',d['bg'],d['fg'],False),('dark','#14111a','#f5f2eb',False),('light','#f5f2eb','#14111a',False),('mono-dark','#14111a','#ffffff',True),('mono-light','#ffffff','#14111a',True)]:
  v=copy.deepcopy(d);v.update(bg=bg,fg=fg,mono=mono)
  if mono:v.update(accent=fg,secondary=fg)
  elif name=='light' and d['slug']=='rekolekt':v['accent']='#435c1f'
  lock=source_mark(v,40,50,160,'mono' if mono else 'color')+wordmark(v,250,163,700)
  if d['slug']=='clpr':lock=C.logo(v,40,22,560,258)
  write_svg(dest/'logos','lockup-'+name,lock,640 if d['slug']=='clpr' else 1000,300 if d['slug']=='clpr' else 260,outlined=True);write_svg(dest/'logos','mark-'+name,source_mark(v,22 if d['slug']=='subcult' else 48,22 if d['slug']=='subcult' else 48,212 if d['slug']=='subcult' else 160,'mono' if mono else 'color'),256,256,outlined=True)
 if d['slug']=='patrick__eff':
  for alternate in ['signal','signal-tall','initials','initials-tall']:
   write_svg(dest/'logos','alternate-'+alternate,H.image('patrick-variations/'+alternate+'-outlined.svg',0,0,512,512),512,512)
  with (dest/'tokens.css').open('a') as f:f.write('\n.brand-display { text-shadow: 1.5px -.75px var(--brand-accent), -1.5px 1.5px var(--brand-secondary); }\n.brand-body, .brand-label { text-shadow: none; }\n')
 if d['slug']=='subcult':
  # Preserve the user's exact editable master at its original pack path.
  shutil.copy2(R/'references/subcult-mark-master.svg',dest/'logos/mark-primary-outlined.svg')
  subprocess.run(['rsvg-convert','-o',str(dest/'logos/mark-primary.png'),str(dest/'logos/mark-primary-outlined.svg')],check=True)
 banner=clpr_banner(d) if d['slug']=='clpr' else H.banner(d)
 if d['slug']=='patrick__eff':banner=ET.tostring(ET.parse(R/'references/patrick-banner-cascadia.svg').getroot(),encoding='unicode')
 if d['slug']=='subcult' and (R/'references/subcult-edited-layouts/banner-x-bluesky.svg').exists():banner=ET.tostring(ET.parse(R/'references/subcult-edited-layouts/banner-x-bluesky.svg').getroot(),encoding='unicode')
 write_svg(dest/'social','banner-x-bluesky',banner,1200,400,1500);write_svg(dest/'social','banner-tall-master',base(d,1500,600)+f'<g transform="translate(0 50) scale(1.25)">{banner}</g>',1500,600)
 if d['slug']=='clpr':
  (R/'references/clpr-working-banner.svg').write_text(H.svg(C.banner(d),1200,400,'CLPR working banner'))
  shutil.copy2(R/'references/clpr-working-banner.svg',dest/'social/banner-x-bluesky.svg')
 if d['slug']=='patrick__eff':shutil.copy2(R/'references/patrick-banner-cascadia.svg',dest/'social/banner-x-bluesky.svg')
 if d['slug']=='patrick__eff':subprocess.run(['rsvg-convert','-w','1500','-o',str(dest/'social/banner-x-bluesky.png'),str(dest/'social/banner-x-bluesky.svg')],check=True)
 if d['slug']=='patrick__eff' and (R/'references/patrick-banner-tall-user-master.svg').exists():
  shutil.copy2(R/'references/patrick-banner-tall-user-master.svg',dest/'social/banner-tall-master.svg')
  subprocess.run(['rsvg-convert','-w','1500','-o',str(dest/'social/banner-tall-master.png'),str(dest/'social/banner-tall-master.svg')],check=True)
 po=clpr_post(d) if d['slug']=='clpr' else H.post(d)
 if d['slug']=='subcult' and (R/'references/subcult-edited-layouts/square-post.svg').exists():po=ET.tostring(ET.parse(R/'references/subcult-edited-layouts/square-post.svg').getroot(),encoding='unicode')
 if d['slug']=='patrick__eff':po=po.replace('fill="#8a00c7">PATRICK__EFF','fill="#66ff00">PATRICK__EFF')
 if d['slug']=='subcult':po=po.replace('fill="#00ff88">SUBCULT.TV','fill="#100b19">SUBCULT.TV')
 write_svg(dest/'social','square-post',po,600,600,1080);write_svg(dest/'social','avatar',base(d,512,512)+source_mark(d,96,96,320),512,512)
 if d['slug']=='subcult':
  layout_sources=R/'references/subcult-edited-layouts'
  if layout_sources.exists():
   for name in ['banner-x-bluesky','banner-x-bluesky-logo','square-post']:
    src=layout_sources/(name+'.svg')
    if src.exists():
     shutil.copy2(src,dest/'social'/(name+'.svg'))
     subprocess.run(['rsvg-convert','-w',str(1080 if name=='square-post' else 1500),'-o',str(dest/'social'/(name+'.png')),str(src)],check=True)
 for kind,w,h in [('landscape',1600,900),('story',1080,1920),('quote',1080,1080),('release',1080,1080)]:write_svg(dest/'social',kind+'-template',poster(d,w,h,kind),w,h)
 write_svg(dest/'social','screenshot-frame',screenshot(d),1600,1000)
 for kind in ['title-card','thumbnail','end-card','lower-third']:write_svg(dest/'video',kind,video(d,kind),1920,1080)
 (dest/'video/captions.ass').write_text('[Script Info]\nTitle: '+d['brand']+' captions\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,'+d['body']+',48,&H00FFFFFF,&H00FFFFFF,&H001A1114,&HBE1A1114,0,0,0,0,100,100,0,0,3,2,0,2,120,120,90,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Replace with the actual spoken words.\n')
 guide(d,dest);sh=''
 for i,(folder,name) in enumerate([('social','banner-x-bluesky'),('social','square-post'),('social','story-template'),('social','screenshot-frame'),('video','title-card'),('video','lower-third')]):
  x=(i%2)*800;y=(i//2)*600;sh+=rect(x,y,800,600,'#eae6de')+T(x+24,y+36,name,19,'#242226','Space Grotesk',700)+embed_svg((dest/folder/(name+'.svg')).read_text(),x+24,y+60,752,506)
 write_svg(dest,'pack-preview',sh,1600,1800)
 entries=[]
 for p in dest.rglob('*'):
  if p.is_file() and p.name!='asset-manifest.json':
   entry={'path':str(p.relative_to(dest)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
   if p.suffix=='.png':
    from PIL import Image
    im=Image.open(p);entry.update(width=im.width,height=im.height,mode=im.mode)
   entries.append(entry)
 (dest/'asset-manifest.json').write_text(json.dumps({'brand':d['brand'],'direction':d['name'],'status':'local production pack v1','files':entries},indent=2));print(d['brand'],len(entries),'files',flush=True)
print('Selected brand packs built.')
