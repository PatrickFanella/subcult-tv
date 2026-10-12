from pathlib import Path
import base64,copy,html,json,os,sys,shutil,subprocess,hashlib,zipfile,xml.etree.ElementTree as ET
import patchwork_product as PW
import left_field_product as LFP
import hasanara_product as HA
import subcult_assets as SA
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
import design_helpers as H
import clpr_directions as C
import left_field_assets as LF
import dedhed_assets as DH
import tadooer_assets as TD
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
 if d['slug']=='left-field':return LF.mark(d,x,y,size)
 if d['slug']=='dedhed':return DH.mark(d,x,y,size)
 if d['slug']=='tadooer':return TD.mark(d,x,y,size)
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
 if d['slug']=='left-field':return T(x,y,'LEFT FIELD',84,d['fg'],d['body'],700,maxw=maxw)
 if d['slug']=='dedhed':return DH.wordmark(d,x,y,maxw)
 if d['slug']=='tadooer':return TD.wordmark(d,x,y,maxw)
 name={'patrick__eff':'PATRICK__EFF','rekolekt':'rekolekt','subcult':'SUBCULT','subcult-os':'Subcult OS','hasanara':'HasanAra','undertow':'UNDERTOW','patchwork':'Patchwork','kork':'kork','prichal':'PRICHAL'}[d['slug']]
 # The Subcult OS wordmark stays live Space Mono on the site; only its headlines use the display face.
 return T(x,y,name,91,d['fg'],'Space Mono' if d['slug']=='subcult-os' else d['display'],700,maxw=maxw)
def write_svg(dest,name,body,w,h,exportw=None,outlined=False):
 if 'patrick__eff' in dest.parts and not name.startswith('mark-') and 'mono' not in name:body=H.patrick_style(body)
 p=dest/(name+'.svg');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(H.svg(body,w,h,name))
 subprocess.run(['rsvg-convert','-w',str(exportw or w),'-o',str(p.with_suffix('.png')),str(p)],check=True)
 if outlined:
  q=dest/(name+'-outlined.svg');result=subprocess.run(['inkscape',str(p),'--export-text-to-path','--export-plain-svg','--export-type=svg','--export-filename='+str(q)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr[-700:])
 return p

def label(d,x,y,s,size=18,maxw=None):return T(x,y,s,size,d['safe_label'],d['label'],400,maxw=maxw)
def base(d,w,h):return rect(0,0,w,h,d['bg'])+(H.patch_paper(w,h) if d['slug']=='patchwork' else '')+(H.cork_texture(w,h) if d['slug']=='kork' else '')+(H.drawing_ticks(18,48,h-120,'#c9c4b6') if d['slug']=='prichal' else '')
def footer(d,w,h):return line(48,h-86,w-48,h-86,d['safe_label'],2)+T(48,h-43,d.get('url') or (d['brand']+' / by SUBCULT' if d['slug'] in ['left-field','dedhed','tadooer'] else 'rekolekt / by SUBCULT'),20,d['fg'],d['body'])
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
  s+=source_mark(d,m,265,160)+T(m,528,d['brand'],64,d['fg'],'Space Mono' if d['slug']=='subcult-os' else d['display'],700,maxw=w-96)
  for i,htext in enumerate(d.get('headline_stack',d['headline'])):s+=T(m,735+i*125,htext,88,d['fg'],d['display'],700,maxw=w-96)
  if d['slug']=='clpr':s+=filmstrip(d,m,1050,w-96,250)+timeline(d,m,1335,w-96,93)
  elif d['slug']=='patrick__eff':s+=H.patrick_wave(m,1150,w-96,240,d,41)
  elif d['slug']=='rekolekt':s+=H.rekolekt_transcript(d,m,1095,w-96,285)
  elif d['slug']=='undertow':s+=H.wave(m,1150,w-96,240,d['accent'],41)
  elif d['slug']=='kork':s+=H.cork_stack(d,m,1040,w-96,400)
  elif d['slug']=='left-field':s+=LF.ledger(d,m,1095,w-96,285)
  elif d['slug']=='prichal':s+=H.docking_ports(d,m,1150,w-96,150)
  elif d['slug']=='dedhed':s+=DH.shelf(d,m,1040,w-96,400)
  elif d['slug']=='tadooer':s+=TD.day(d,m,1040,w-96,400)
  elif d['slug']=='subcult-os':s+=H.os_index(d,m,1080,['PLAN','RUN DOOR','ARCHIVE'],34,70)+H.os_bars(m,1300,w-96,90,d['accent'],3)
  else:s+=line(m,1120,w-48,1120,d['accent'],12)
  s+=T(m,1500,'YOUR NOTE OR INVITATION',31,d['fg'],d['body'],700,maxw=w-96)+T(m,1560,'Replace this line with approved copy.',25,d['fg'],d['body'],maxw=w-96)+T(m,1652,d.get('url') or d['brand']+' by SUBCULT',25,d['fg'],d['body'])
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
 s+=rect(48,110,1504,738,'none',8 if d['slug']=='patchwork' else d.get('radius',0),d['safe_label'])+T(104,465,'PLACE A VERIFIED SCREENSHOT HERE',36,d['fg'],d['label'],maxw=1350)+T(104,519,'Crop private data. Keep interface text legible.',28,d['fg'],d['body'])+footer(d,w,h)
 return s

def video(d,kind):
 if d['slug']=='clpr':return C.video(d,kind)
 w,h=1920,1080
 if kind=='lower-third':
  s=rect(96,823,1728,174,d['bg'],d.get('radius',0))+(f'<path d="M{96+d["radius"]} 823H108V997H{96+d["radius"]}A{d["radius"]} {d["radius"]} 0 0 1 96 {997-d["radius"]}V{823+d["radius"]}A{d["radius"]} {d["radius"]} 0 0 1 {96+d["radius"]} 823Z" fill="{d["accent"]}"/>' if d.get('radius') else rect(96,823,12,174,d['accent']))+source_mark(d,128,847,113)+T(278,892,'TITLE / SPEAKER',46,d['fg'],d['display'],700,maxw=1400)+T(278,950,'One short line of context.',30,d['fg'],d['body'])
 elif kind=='end-card':
  s=base(d,w,h)+source_mark(d,160,313,260)+wordmark(d,499,489,1240)+T(499,615,d.get('url') or d['brand']+' by SUBCULT',40,d['fg'],d['body'])+line(160,825,1760,825,d['accent'],4)
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
 'rekolekt':'''## Notes for this pack

### Name and mark

The wordmark is lowercase `rekolekt`; write Rekolekt in prose and pair the name with "by SUBCULT" for endorsement. Keep the original bracketed waveform logo and do not change its geometry. Transcript rows and timestamps replace the decorative waveform in the story template only.

### Limits

A quoted passage keeps its source and context metadata.

### Source and site

The product source lives in `subculture-collective/rekolekt`. The contact route keeps `product=transcript-create` for compatibility. [The website design specification](WEBSITE.md) records the deployed landing page, its product copy and its interaction states.

## Voice

Rekolekt copy is written by the archivist who built the catalogue and knows where everything is. It reads like a finding aid: quiet, exact and slightly dry, in longer sentences that contain the mechanism. The readers maintain collections, so address them as peers and do not sell. Name the parts: recording, transcript, timestamp, passage, source link. Say that Rekolekt is software you deploy, that HasanAra is the running example, and that it is not a hosted upload service. Leave out "unlock your content", AI enthusiasm and any hint of a sign-up flow that does not exist.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-REKOLEKT.''',
 'subcult':'''## Notes for this pack

### Direction and masters

This is the C direction, selected by the user. The user-edited banner, logo banner and square-post masters are kept in `references/subcult-edited-layouts/`. Rebuilds copy them without alteration. They are historical compositions, not the selected standalone logo.

### Mark

The user approved three marks, B, C and D, all without registration lines:

- C is the primary mark, with filled letters and a tilted green block.
- B is the heavier outlined alternate.
- D removes the block and uses tighter framing for small placements.

Every approved mark uses one continuous underscore path. Build the selected derivatives with `subcult_assets.py`; `logo-selection.json` records the selection. The original user-authored SVG is preserved in `references/subcult-mark-master.svg` as construction provenance.

White artwork outlines or removes the green block. Use dark ink marks on purple or green fields, and white marks on dark fields.

### Circle logo

The user approved `logos/mark-fisheye-circle.png` in place of the purple-circle logo treatments: solid SC lettering and a green underscore on a purple circle, with a fisheye distortion on the SC_. It uses the approved fisheye geometry with the purple fill corrected to flat `#8b5cf6` on October 4, 2026. Preserve the selected raster bytes; do not redraw it. The public site uses the same file as `public/brand/subcult/fisheye-circle.png`. The source study and its generation prompt are in [the fisheye review](../../../reviews/subcult-logo-fisheye/README.md).

### Color

- Purple is the primary field.
- Dark ink sets headlines and any text on green.
- Acid green is for blocks, registration marks and large emphasis. Green on purple is decorative. It is below the small-text contrast target.

### Product catalogue

Keep the six products visible as one catalogue, each in its own identity. Do not recolor them to match SUBCULT.

## Voice

SUBCULT speaks as the collective, in the first person plural, like a zine masthead: declarative, a little confrontational about platforms and specific about the work. It lists real jobs, such as clips, archives, mutual aid and the door at a show. It names what it is against only when it can name what it built instead. Leave out startup cheer, mission statements, "community-driven" and any promise about the whole umbrella.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md).''',
 'clpr':'''## Notes for this pack

### Logo and layouts

The user-edited play-triangle logo governs every asset. Use the captured play wordmark and play icon, and keep the wordmark artwork as drawn.

The user selected Clip stack for the main layouts and the single clip card for the square post. These layouts replace the filmstrip and timeline motifs. The comparison variations remain available, and earlier banners are preserved in `references/`.

### Color and type

- Keep the muted-white wordmark, the purple play triangle, the dark field and the green details.
- Barlow Condensed sets titles, Barlow sets body copy and IBM Plex Mono sets labels.

### Graphics

Crop corners, overlapping clip cards and purple play fields are the three graphic alternatives. Keep their geometry separate from screenshots of the product.

### Name and site

- The site writes the name in lowercase, `clpr`, in its interface text. Studio documents and artwork labels use CLPR.
- clpr.tv applies this pack as of October 2, 2026. The Product site section below records how.
- The earlier name Clipper and the clpr.gg domain are retired. The product lives at clpr.tv. The tally-dot logo that the site used before this pack is retired with them.

## Voice

clpr sounds like a regular in chat who clips everything and remembers which stream it was: fast, amused and comfortable in lowercase. It talks about clips the way viewers do (the bit, the fail, the one from last Tuesday) and uses "clip" as a verb. Fragments are fine. A page gets one exclamation mark at most. Leave out "content", "discover", "moments that matter" and emote spam.

Supported claims are finding Twitch clips by creator, topic and tag, saving them to playlists and sharing them. Watch parties, a live feed, stream clip creation and mirroring are disabled at launch, so copy does not mention them.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-CLPR.''',
 'patchwork':PW.GUIDE_NOTE,
 'hasanara':HA.GUIDE_NOTE,
 'subcult-os':'''## Notes for this pack

The pack matches the live os.subcult.tv design system: the Subcults terminal foundation, selected by the user on September 30, 2026, with the ticket-stub display layer and 8-pixel corners the user selected on October 3, 2026. The source of truth is `contracts/design/tokens.json` and `docs/design-system.md` in the subcult-os repository.

### Type

Oswald Bold sets headlines, in capitals. Space Mono sets everything else: body copy, labels, buttons and the "Subcult OS" wordmark. Bold is the heaviest weight. Labels are uppercase with wide tracking.

### Shape

One 8-pixel radius on controls, cards, panels and frames, scaled with the artwork. Panels separate with visible borders, not shadows. The OS lettermark keeps its square frame; it is the selected product mark, so corners are not added to it.

### Ticket stub

The signature graphic is the purple admit-one stub from the subcult.tv product illustration: a "SUBCULT OS / ADMIT ONE" kicker in Space Mono, an Oswald headline and a white barcode. In artwork it tilts 3 degrees. Numbered labels in the form "01 / PLAN" sit beside it in cyan. The barcode is decoration and never encodes a ticket. On the site, a stub that frames an issued ticket or anything staff scan stays upright.

### Color

- Purple is the action and artwork color. Purple fills carry white text (5.7:1). Purple text on black is below the small-text target, so labels use cyan.
- Cyan also marks focus.
- Status colors (green, amber, red, cyan) mark states and always come with words.
- Event artwork stays immersive and black.
- The app's light theme uses muted off-white panels (#f8f6fa) on a lavender-grey canvas (#eeebf3) rather than pure white. Its labels are deep purple (#5b21b6). This pack's artwork stays on the black base.

### Mark on the site

The site sets the OS lettermark with its cyan cursor block (`product/mark-tight-outlined.svg`) beside the wordmark in live Space Mono bold. It uses the mark as its favicon and app icon.

## Voice

Subcult OS sounds like the stage manager on comms forty minutes before doors: a run sheet, clipped, time-stamped and role-first, with the dry humor of someone who has run a door from a paper list. Copy can be set as cues, such as "19:00 doors". Name the roles and the moments: load-in, doors, the list, close-out. Say that the software is in development and built around free ticket reservations.

Leave out "event management platform" and nightlife glamour. Promise nothing about paid ticketing, payouts, app stores or a production service.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-OS.''',
 'left-field':LFP.GUIDE_NOTE,
 'kork':'''## Notes for this pack

Kork is the identity for the self-serve links-page service, code name zelda. The identity applies to the service. The product lets users pick any theme for their own pages, so it does not apply to user pages.

### Name and selection

On October 2, 2026 the user selected direction A (pinned card) and the name Kork over Corkboard. The comparison is in `corkboard-directions/`. A services marketplace also trades as Kork (kork.app). This was noted to the user, who chose the name anyway.

### Mark

The mark is an original pinned paper card: two link rows on a tilted card under a cobalt pushpin. The rows and the pin are solid shapes, so it stays legible at 32 pixels.

### Color

| Color | Role |
| --- | --- |
| Cork #d4a56c | The field |
| Ink #1b130c | All text |
| Paper #fbf6ec | Card fill |
| Cobalt #2340e8 | Pins and large emphasis only. Cobalt on cork is 3.2:1, so never use it for small text. |

### Type

Archivo Black sets the wordmark and headlines. Atkinson Hyperlegible Next sets body copy. JetBrains Mono sets labels, the cue shared across SUBCULT packs.

### Pinned cards

- Cards carry placeholder destinations: @yourname, $yourname and a decorative QR glyph that encodes nothing.
- Do not show third-party platform logos in brand artwork.
- Cards tilt between -7 and +7 degrees and cast a hard ink shadow. Keep at least one card straight enough to read.

## Voice

Kork sounds like a hand-lettered flyer written by whoever keeps the corkboard by the venue door tidy: chummy, and a little corny on purpose. Lead with the plain offer: a free link page, payment buttons that go to the creator's own accounts, and no cut. Give the real numbers (92 services, ten themes) and state the 24-hour wait before a new account can publish. The product's list is long, so lists can run long.

A page gets one pin pun, and exclamation marks come one at a time. Leave out "link in bio tool", creator-economy talk, custom domains, paid plans, prices and user counts.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-KORK.''',
 'prichal':'''## Notes for this pack

Prichal is managed AT Protocol PDS hosting (repository `subculture-collective/prichal`).

### Name

The user chose the name Prichal on October 1, 2026. It is Russian for pier or berth, and the name of the ISS docking node where Soyuz ships attach. The pronunciation is the Russian one (pree-CHAHL). Copy never explains or corrects it.

The Cyrillic ПРИЧАЛ is a small secondary label, never a replacement for the Latin name.

### Mark

The mark is a docking node: a sphere with its equator in perspective and four flanged collars. The red flange on the right is the occupied port, the customer account.

- Never rotate the mark or recolor single collars.
- Never add a centre dot or ring. With the cross of ports, that reads as a gun sight.
- Mono variants turn the red flange to ink.

### Color

| Color | Role |
| --- | --- |
| Paper #f4f1e9 | The field |
| Ink #1c2230 | Text and the mark |
| Signal red #b23a26 (5.28:1 on paper) | The occupied port, rules and large emphasis |
| Steel #5d6675 (5.14:1) | Labels |

In product interfaces red is reserved for the mark, so it never reads as an error.

### Type and drawing details

Oswald Bold sets the uppercase wordmark and display headings. Public Sans sets body copy. JetBrains Mono sets labels and the port strip.

The engineering-drawing details (tick scale, hairlines, PORT 01–06 strip) stay light.

### Copy

- Tagline: Your server. We keep it running.
- Call to action: Dock your account. We handle the rest.
- Prichal is a private preview at prichal.subcult.tv and is not open for sign-up.
- Do not market leaving, privacy, censorship resistance or unverified capabilities.

Messaging by audience and the plain-language table live in the product repository at `brand/GUIDE.md`.

## Voice

Prichal sounds like ground control speaking in plain words: a calm operations desk, procedural and reassuring, in short declaratives without jargon. It explains what a server is to someone who has never needed to know. The docking idea lives in two words, dock and port, and nowhere else, so there is no "liftoff" and no "mission". Give a protocol acronym a plain gloss or leave it out. Say that posts are public wherever the server runs.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md).''',
 'undertow':'''## Notes for this pack

- Use the active editor theme: pink, cyan and lilac on dark violet, square geometry and hard offsets.
- Keep the existing spectrum favicon.
- Liberation Mono is the bundled portable alternative to the site's system monospace stack.
- Chromatic offsets are for large titles, never body copy.

## Voice

Undertow sounds like the friend who makes visuals for everyone's releases and has opinions about codecs: liner notes crossed with a plugin changelog. A headline can be sensory and loud. The body is specific and names the parts: Milkdrop, spectrum, VU meters, LRC, SRT and VTT lyrics, 16:9, 9:16 and 1:1 layouts, H.264 MP4. Say that rendering happens in the browser and that performance depends on the device.

Leave out "bring your music to life", "stunning visuals" and guaranteed speed. Live billing is off, so copy does not offer cloud plans for sale.

The full voice and its sample lines are in [the voice guide](../../content/VOICE.md). Facts come from [the claims register](../../content/social/Product%20Claims%20Register.md), entry C-UNDERTOW.''',
 'dedhed':DH.GUIDE_NOTE,
 'tadooer':TD.GUIDE_NOTE
 }[slug]
 product='## Product exports\n\n`product/` holds exports at their final sizes for the Subcult OS site and app. Copy them as they are. Do not crop, resize or recolor them downstream.\n\n| File | Use |\n| --- | --- |\n| `mark-tight.svg`, `mark-tight-outlined.svg` | The mark cropped to its frame, for favicons and for placement beside live text. Add the quarter-height clear space in layout. |\n| `favicon-32.png`, `favicon-48.png` | Raster favicons for the site and for Expo web. |\n| `app-icon.png` | 1024×1024 opaque store and iOS icon. |\n| `apple-touch-icon.png` | 180×180 opaque home-screen icon for the site. |\n| `android-adaptive-foreground.png` | 1024×1024 transparent adaptive-icon foreground. Pair it with the base color #000000 as the adaptive background. |\n| `android-adaptive-monochrome.png` | 1024×1024 single-color layer for Android themed icons. |\n| `splash-icon.png` | 1024×1024 transparent mark for a splash screen on the base color. |\n| `og.png` | 1200×630 link preview: the X/Bluesky banner centered on the base color. Its headline needs owner approval before it ships on a site (subcult-os issue 201). |\n\n' if slug=='subcult-os' else "## Product site\n\nclpr.tv has used this pack since October 2, 2026 (clpr `main` at `eae90c84`, PRs 37 and 38). Studio stays the source for the marks. Change a mark here first, copy its path data to the site unchanged, then run `node scripts/render-brand-assets.mjs` in the site's `frontend/` to rebuild its icons, social card and extension icons. The site records the copied sources and their hashes in `docs/brand-provenance.json` and its interface rules in `docs/design-system.md` (Tally / Ultraviolet).\n\n| Site asset | Built from | How it is applied |\n| --- | --- | --- |\n| Header wordmark | `references/clpr-play-wordmark.svg` | Path data and transforms unchanged; Inkscape editor attributes removed. The header shows it 32 pixels tall, about 70 pixels wide. That is below the 220-pixel lockup minimum and is a deliberate exception for a 56-pixel header. |\n| Play mark | `references/clpr-play-icon.svg` | Outer triangle #291d47, inner triangle #8c5cff. Used alone on the offline page. |\n| App icon, favicon and PWA icons | Play mark on #0e0c13 | The mark's box is 62.5% of the icon, as in `social/avatar`. The maskable icon uses 53% to stay inside the safe zone, and the 64-pixel favicon uses 81% so the mark survives at 16 pixels. |\n| Link preview, 1200×630 | Clip stack layout | Wordmark, two-line headline, three clip cards (fill #211b30, back cards ruled #493c64, front card ruled #8c5cff), a #3ddc97 progress line, a #8c5cff rule and `clpr.tv` in IBM Plex Mono. It keeps the site's existing headline, The moments shaping live culture, not this pack's sample headline. |\n| Browser extension icons | The app icon | Rendered by the same site script at 16, 32, 48 and 128 pixels. The earlier icon, a letter C on Twitch's purple #9146ff, is retired. |\n\nThe interface adds roles that this pack's tokens do not define. They belong to the site, not to promotional artwork:\n\n| Role | Color | Use |\n| --- | --- | --- |\n| Panel | #17141f | Cards, menus and empty states on the base |\n| Primary button | #a07cff | Filled controls, always with base-colored text. White on the accent measures about 4.1:1 and is not used. |\n| Link and focus | #b79bff | Links, small accent text and the focus ring |\n| Warning | #ffc24a | Warnings |\n| Info | #9fd8ff | Information and downvotes |\n| Error | #ff6b78 | Errors and destructive actions |\n\n- Corners are near-square, 0 to 4 pixels. Avatars and status dots stay round.\n- Headings are uppercase Barlow Condensed at weight 700. Rank numerals and page-level display type use weight 800.\n- Crop corners are the only pack graphic inside the interface: the `.crop-corners` utility draws 2-pixel corners with 20-pixel arms on empty and placeholder panels. The clip stack stays in promotional images so it is not mistaken for real clip cards. Play controls on thumbnails are a square button, not the brand mark.\n- Information pages such as About and Support follow the feed: a mono label, a display heading, ruled rows and real clips. They do not use icon tiles, glow backgrounds or checkmark lists.\n- Upvote is the action on a clip or comment. Uppies is the reputation score a member earns from upvotes.\n- Retired on the site: the tally-dot logo, the violet rule across the top of promotional cards, and the timecode burned into the link preview. The 3-pixel violet rule on active panels and the duration label on thumbnails remain interface conventions.\n\n" if slug=='clpr' else DH.PRODUCT_SECTION if slug=='dedhed' else TD.PRODUCT_SECTION if slug=='tadooer' else ''
 observed='Site and asset observations were made October 1, 2026.' if slug in ['subcult','undertow','kork','prichal','patchwork','hasanara'] else 'Where an observation date was recorded, it is in the reference above.'
 doc=f'''# {d['brand']} — Brand and asset guide

Selected direction: **{d['variant']} / {d['name']}**. Status: local production pack v1. Selecting a direction does not approve a post or a profile change.

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

Measured contrast against the base: text **{c:.2f}:1**, small label **{safe:.2f}:1**, accent **{ac:.2f}:1**. Ordinary text needs at least 4.5:1 and large text at least 3:1. Each swatch has one role. A color that works as a fill may not pass as text.

## Typography and spacing

- Display: {d['display']}, bold, for headlines.
- Body: {d['body']}, regular and bold.
- Labels: {d['label']}, regular.
- Spacing steps: 8, 16, 24, 32, 48, 64 and 96 pixels.
- Give each promotional asset one headline, one supporting point and one destination.
- Leave a quarter of the mark's height clear on every side. On screen the mark is at least 32 pixels wide and the horizontal lockup at least 220 pixels wide. Below that width, use the mark alone.
- Do not stretch, skew, redraw or add effects to the product marks. Where the fonts are not installed, use the outlined logo exports.

## Files and editing

| Path | Contents |
| --- | --- |
| `logos/` | Primary, dark and light lockups and marks in full color, plus single-color variants. Each has an editable SVG, an outlined SVG and a transparent PNG. |
| `social/` | X/Bluesky banner, taller banner master, avatar, square, landscape and story layouts, quote and release templates, and a screenshot frame. |
| `video/` | Title, thumbnail, end-card and transparent lower-third layouts, with a caption style file. |
| `fonts/` | The fonts the pack needs and their redistribution licenses. |
| `tokens.json`, `tokens.css` | Reusable design roles. |
| `asset-manifest.json` | File dimensions and hashes. |

Editable SVG text needs the included fonts. Install them to edit, or place the outlined logo SVGs and the rendered PNGs instead. The PNGs are exported from the editable SVGs. Re-render them with the top-level `build_packs.py` and its `fontconfig.xml`; do not edit a PNG on its own.

The story artwork keeps its main message between y=250 and y=1670 on a 1080×1920 canvas. Keep critical banner content away from the bottom-left corner, where the avatar sits. These are layout guides, and platforms crop differently, so check the current overlay and crop in the destination's composer.

{product}## Screenshots and video

Replace the screenshot placeholder with a real capture of a verified workflow. Show enough of the interface to give context. Crop out credentials, private dashboards, unpublished material and personal data. Keep original recordings separate from edited exports.

The video templates use a 1920×1080 canvas with a 96-pixel outer margin. Keep captions to two short lines. Start from the supplied ASS style, then check that captions read at phone size. The lower third is transparent outside its panel. Use a short fade or a hard cut for title and end cards, and avoid rapid flashing. The eight-second preview demonstrates the template, not the product.

## Copy, alt text and sources

Use verified product claims and exact approved copy. Each product has its own voice, set out in [the voice guide](../../content/VOICE.md). A headline in the sample artwork shows the layout. It is approved copy only where this guide says so. The text in the quote and release templates is a placeholder and must be replaced.

Alt text describes the finished image, including the words visible in it. Do not describe a screenshot placeholder as a working feature. `alt-text.md` has starter descriptions for the sample artwork.

Reference: {d['source']}. {observed} Original files in the legacy library are preserved. The inventory's hashes identify bytes. They do not establish permission to publish third-party material.
'''
 (dest/'GUIDE.md').write_text(doc)
 # Descriptions of the rendered sample artwork. Update a row when its banner, square post or avatar changes.
 alts={
  'subcult':('Purple banner. Small label: SUBCULT.TV / INDEPENDENT SOFTWARE. Large black headline: BUILD TOGETHER. A tilted green block crossed by two thin registration lines sits at the top right, and a green bar runs down the left edge.', 'Purple square. Black headline: CULTURE NEEDS TOOLS., with TOOLS. set on a tilted green block. Small text: SUBCULT.TV at the top and support.subcult.tv at the bottom.', 'The SUBCULT mark on purple: a filled black S and C over a tilted green block, with a black underscore below the C.'),
  'clpr':('Near-black banner. The clpr wordmark with a purple play triangle, then the headline SOMEBODY CLIPPED IT. in white capitals. At the right, a stack of three clip cards. The front card shows a play triangle and a green progress line. Small text: TWITCH CLIPS / CREATOR, TOPIC, TAG at the top, and It\'s probably in here. and clpr.tv along the bottom.', 'Near-black square with the clpr wordmark. Headline: THE ONE FROM LAST TUESDAY. Below it, one clip card with a play triangle and a green progress line. Small text: clpr.tv.', 'A purple play triangle inside a darker purple triangle, on a near-black background.'),
  'kork':('Cork-textured banner. Label: LINK PAGES / BY SUBCULT. Black headline on three lines: ALL OF IT, PINNED TO ONE LINK. At the right, four paper cards held by blue pushpins: @yourname (social), $yourname (tips), a decorative QR pattern and WATCH (latest video). Small text: kork.subcult.tv.', 'Cork-textured square. Headline: PIN IT UP. Line below: Share one link for everything. Three pinned paper cards: @yourname, $yourname and a decorative QR pattern. Small text: kork.subcult.tv.', 'The Kork mark on cork: a tilted paper card with two black rows, held by a blue pushpin.'),
  'prichal':('Paper-colored banner. At the left, the Prichal mark: a dark sphere with a dashed equator and four collars, the right one red. Label: ПРИЧАЛ · ACCOUNT HOSTING. Wordmark: PRICHAL, with a short red rule under it. Line: Your server. We keep it running. A strip along the bottom reads PORT 01 to 06, with prichal.subcult.tv at the right.', 'Paper-colored square. Label: ACCOUNT HOSTING / BY SUBCULT. The Prichal mark and wordmark, then the headline DOCK YOUR ACCOUNT. Below it, six numbered boxes, 01 to 06, with 04 filled red. Small text: prichal.subcult.tv.', 'The Prichal mark on paper: a dark sphere with a dashed equator and four collars, the right one red. A faint tick scale runs down the left edge.'),
  'undertow':('Dark violet banner. Pink wordmark: UNDERTOW. Cyan label: AUDIO / LAYERS / MOTION. White headline with pink and cyan offsets: GIVE THE TRACK SOMETHING TO LOOK AT. At the right, a narrow pink and cyan waveform. Small text: undertow.subcult.tv.', 'Dark violet square. Label: MUSIC VISUALS / LYRICS / LOCAL EXPORT. Headline: MAKE IT MOVE., with MOVE. in pink. Below it, a pink waveform in a cyan frame. Small text: undertow.subcult.tv.', 'A rounded square outline with five vertical bars inside, in a pink-to-cyan gradient, on dark violet.'),
  'subcult-os':('Black banner. At the top left, the OS lettermark beside Subcult OS, then > os.subcult.tv in cyan. Below, a cyan numbered list: 01 / PLAN, 02 / COORDINATE, 03 / RUN DOOR, 04 / SETTLE and 05 / ARCHIVE. At the right, a tilted purple ticket stub with rounded corners reads SUBCULT OS / ADMIT ONE, then FROM THE PLAN TO THE LAST TICKET. in white capitals, over a white barcode.', 'Black square. Cyan label: PLAN / COORDINATE / RUN DOOR / SETTLE / ARCHIVE. A tilted purple ticket stub with rounded corners reads SUBCULT OS / ADMIT ONE, then 19:00 DOORS. in large white capitals, Everyone on one sheet. below it, and a white barcode. Under the stub, a cyan numbered list: 01 / PLAN THE EVENT, 02 / RUN THE DOOR, 03 / SETTLE AND ARCHIVE. Small text: os.subcult.tv.', 'The letters OS in white with a cyan cursor block, inside a purple square frame on black.'),
  'patchwork':('Warm paper banner. The Patchwork wordmark and the headline A little help, from a friend. in dark green serif type. Small label: MUTUAL AID, BLOCK BY BLOCK. At the right, four stitched fabric patches in green, tomato, yellow and sage. Small text: patchwork.subcult.tv.', 'Warm paper square. Label: MUTUAL AID, BLOCK BY BLOCK. Green serif headline: Small favors, close to home. Two stitched buttons: HELP A NEIGHBOUR in green and PASS IT ON in tomato. Line below: Mutual aid, block by block. Small text: patchwork.subcult.tv.', 'A paper-colored letter P on a tomato fabric patch with a dashed line of stitching, on warm paper.'),
  'hasanara':('Near-black banner. Wordmark: HasanAra. Red label: BROADCAST ARCHIVE, over a red rule. Headline in off-white serif type: He said it on stream. The record shows when. Small text: Search / passages / original context. At the right, the PBS artwork: an orange head in profile with glasses forming the P, then B and S in red.', 'Near-black square. Red label: PIKER BROADCASTING SERVICE, over a red rule. Serif headline: Check the tape before you quote it. Below it, a panel labelled SOURCE / TIMESTAMP / CONTEXT with three grey lines standing in for text. Small text: hasanara.tv.', 'The PBS artwork on near-black: an orange head in profile with glasses forming the P, then B and S in red.'),
  'rekolekt':('Dark green banner. Lowercase wordmark: rekolekt. Lime label: BY SUBCULT. Headline in warm white: The sentence, and where it was said. Line below a lime rule: Software for timestamped, searchable recording archives. At the right, the mark: three lime bars of different heights between square brackets.', 'Dark green square. Label: REKOLEKT BY SUBCULT. Headline: Make a recording into an archive. Below it, the bracketed three-bar mark beside three lime labels: SEARCH, QUOTE and RETURN TO SOURCE. Small text: rekolekt / by SUBCULT.', 'The Rekolekt mark on dark green: three lime bars of different heights between square brackets.'),
  'left-field':('Paper-colored banner. LEFT FIELD at the top left and BY SUBCULT at the top right, over a dark rule. Serif headline: Where the field bends. Rust label: SEAT RESEARCH / SOURCE CONTEXT. At the right, the LF monogram in dark ink with a rust square where the letters meet.', 'Paper-colored square. Label: LEFT FIELD / BY SUBCULT. Serif headline: Where the field bends. Below it, a pale green panel with a rust left edge and three ruled rows, SEAT RECORD, SOURCE NOTES and METHOD / CONTEXT, beside the LF monogram. Small text: SEAT RESEARCH / SOURCE CONTEXT.', 'The LF monogram on paper: a dark L and F on one baseline, with a rust square where they meet.'),
  'dedhed':('Cream banner. Lowercase serif wordmark: dedhed, followed by a red dot. Label: LIVE TAPES / SHARED AIR. Headline: Find your way into a show. Small text: Dedhed / by SUBCULT · private pilot. At the right, a pine rack of five cassette spines, each typed with Grateful Dead, a show date and a set number: 4/17/71 I, 5/8/77 II, 2/13/70 I · II, 6/16/85 II and 10/31/71.', 'Cream square. Label: LIVE TAPES / SHARED AIR. A cassette at the top right. Headline: Find your way into a show. Below it, a pine rack of four cassette spines typed with Grateful Dead, a show date and a set number. Small text: ON-DEMAND SETS · ONE SHARED STATION.', 'A black cassette on cream: a cream label with a red stripe, a window showing two reels, and two screw holes.'),
  'tadooer':('Dark blue-grey banner. The Tadooer mark and wordmark. Label: PLAN · FOCUS · SYNC, over a purple rule. Sample headline: The plan, and the one thing now. Small text: Tadooer / by SUBCULT · private, self-hosted. At the right, a planner day from 09:00 to 12:00: three task rows with placeholder titles, the first framed purple, a pink line marking the current time and a teal calendar block.', 'Dark blue-grey square. Label: PLAN · FOCUS · SYNC. The Tadooer mark at the top right. Sample headline: The plan, and the one thing now. Below it, a planner day from 09:00 to 12:00 with three placeholder task rows, a pink current-time line and a teal calendar block. Small text: ONE OWNER · EVERY DEVICE · ONE THING NOW.', 'The Tadooer mark on dark blue-grey: a rounded near-black tile with three grey list lines and a purple disc holding a check.'),
 }
 banner_alt,square_alt,avatar_alt=alts.get(slug,(f"{d['brand']} branding in the {d['name']} direction. Visible headline: “{' '.join(d['headline'])}”.",'Describe the visible headline, brand mark and supporting illustration in `social/square-post.png`.',f"{d['brand']} mark on the selected brand background."))
 (dest/'alt-text.md').write_text(f'''# {d['brand']} — Alt text starters

- Banner: {banner_alt}
- Square sample: {square_alt}
- Avatar: {avatar_alt}

Replace these starters when copy or imagery changes. Describe a screenshot’s actual task and visible result. For a quoted passage, include the visible words and attribution. Empty templates are editing aids and should not be published as finished assets.
''')

# Captured source marks are bundled under references/.
for d in BRANDS:
 if os.environ.get('BRAND_ONLY') and d['slug']!=os.environ['BRAND_ONLY']:continue
 if d['slug']=='subsets':
  subprocess.run([sys.executable,str(R.parent/'brands/subsets/build.py')],check=True)
  continue
 if d['slug']=='chat-thing':
  subprocess.run([sys.executable,str(R.parent/'brands/chat-thing/build.py')],check=True)
  continue
 if d['slug']=='patrick__eff' and d.get('mode')=='patrick-patch':
  import patrick_patch
  patrick_patch.build(d)
  continue
 dest=R.parent/'brands'/d['slug'];dest.mkdir(parents=True,exist_ok=True);(dest/'fonts').mkdir(exist_ok=True)
 for name in font_files(d):shutil.copy2(R/'fonts'/name,dest/'fonts'/name)
 tokens={'brand':d['brand'],'direction':d['name'],'status':'local production pack v1','colors':{k:d[k] for k in ['bg','fg','accent','secondary','safe_label']},'fonts':{k:d[k] for k in ['display','body','label','support'] if k in d},**({'radius_px':d['radius']} if 'radius' in d else {}),'spacing':[8,16,24,32,48,64,96],'mark_clear_space':'25% of mark height','mark_min_width_px':32,'source':d['source'],'direction_selection':d.get('direction_selection') or ('user' if d['selected_by_user'] else 'established-theme example')}
 if d['slug']=='subcult':
  (dest/'logos').mkdir(exist_ok=True)
  (dest/'logos/master.svg').write_text(SA.selected_svg())
  tokens['mark_master']={'path':'logos/master.svg','sha256':hashlib.sha256((dest/'logos/master.svg').read_bytes()).hexdigest(),'construction':'Selected C: filled letters, no registration lines, continuous underscore; B outlined and D compact also approved'}
 if d['slug']=='clpr':tokens.update(graphic_direction=d.get('graphic_direction'),square_direction=d.get('square_direction'))
 if d['slug']=='patrick__eff':shutil.copytree(R/'references/patrick-variations',dest/'logos/source-variations',dirs_exist_ok=True)
 if d['slug']=='patrick__eff':tokens['mark_styles']=d.get('mark_styles',{});tokens['mark_sources']='logos/source-variations/';tokens['banner_logo']={'primary':d.get('banner_logo'),'alternates':d.get('banner_alternates',[]),'scope':'banner only'}
 if d['slug']=='left-field':tokens['product_interface']=LFP.INTERFACE
 if d['slug']=='hasanara':tokens['product_interface']=HA.INTERFACE
 if d['slug']=='patchwork':tokens['texture']={'paper_black_opacity':.025,'fabric_white_opacity':.035,'stitch_width_px':2.4,'stitch_length_px':[9,11,8,10,9.5],'stitch_gap_px':[8,9,7,10,8.5],'stitch_tilt_px':[.5,-.7,.3,.8,-.4]};tokens['colors']['action_tomato']=d['action_tomato'];tokens['shape']={'corners':'2px 22px 2px 22px','stitch_inset_px':8,'shadow_offset_px':[5,6],'shadow_color':'#b2bba1'};tokens['product_interface']=PW.INTERFACE
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
  SA.build_selected(dest/'logos')
 banner=LF.banner(d) if d['slug']=='left-field' else DH.banner(d) if d['slug']=='dedhed' else TD.banner(d) if d['slug']=='tadooer' else clpr_banner(d) if d['slug']=='clpr' else H.banner(d)
 if d['slug']=='patrick__eff':banner=ET.tostring(ET.parse(R/'references/patrick-banner-cascadia.svg').getroot(),encoding='unicode')
 if d['slug']=='subcult' and (R/'references/subcult-edited-layouts/banner-x-bluesky.svg').exists():banner=ET.tostring(ET.parse(R/'references/subcult-edited-layouts/banner-x-bluesky.svg').getroot(),encoding='unicode')
 write_svg(dest/'social','banner-x-bluesky',banner,1200,400,1500);write_svg(dest/'social','banner-tall-master',base(d,1500,600)+f'<g transform="translate(0 50) scale(1.25)">{banner}</g>',1500,600)
 if d['slug']=='clpr':
  # references/clpr-working-banner.svg is the retained October 1 banner; the pack banner is written directly so a rebuild leaves references/ untouched.
  (dest/'social/banner-x-bluesky.svg').write_text(H.svg(C.banner(d),1200,400,'CLPR working banner'))
 if d['slug']=='patrick__eff':shutil.copy2(R/'references/patrick-banner-cascadia.svg',dest/'social/banner-x-bluesky.svg')
 if d['slug']=='patrick__eff':subprocess.run(['rsvg-convert','-w','1500','-o',str(dest/'social/banner-x-bluesky.png'),str(dest/'social/banner-x-bluesky.svg')],check=True)
 if d['slug']=='patrick__eff' and (R/'references/patrick-banner-tall-user-master.svg').exists():
  shutil.copy2(R/'references/patrick-banner-tall-user-master.svg',dest/'social/banner-tall-master.svg')
  subprocess.run(['rsvg-convert','-w','1500','-o',str(dest/'social/banner-tall-master.png'),str(dest/'social/banner-tall-master.svg')],check=True)
 po=LF.post(d) if d['slug']=='left-field' else DH.post(d) if d['slug']=='dedhed' else TD.post(d) if d['slug']=='tadooer' else clpr_post(d) if d['slug']=='clpr' else H.post(d)
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
 if d['slug']=='subcult-os':
  # Product exports are final sizes: consumers copy these bytes and do not crop, resize or recolor the mark.
  prod=dest/'product';mono=copy.deepcopy(d);mono.update(fg='#ffffff',accent='#ffffff',secondary='#ffffff',mono=True)
  write_svg(prod,'mark-tight',source_mark(d,-2,-2,160),156,156,outlined=True)
  for size in [32,48]:subprocess.run(['rsvg-convert','-w',str(size),'-o',str(prod/f'favicon-{size}.png'),str(prod/'mark-tight-outlined.svg')],check=True)
  icon=base(d,1024,1024)+source_mark(d,192,192,640)
  write_svg(prod,'app-icon',icon,1024,1024);write_svg(prod,'apple-touch-icon',icon,1024,1024,180)
  # Android masks the layers to a circle 66/108 of the canvas wide; a 448 px mark keeps its corners inside it.
  write_svg(prod,'android-adaptive-foreground',source_mark(d,288,288,448),1024,1024)
  write_svg(prod,'android-adaptive-monochrome',source_mark(mono,288,288,448,'mono'),1024,1024)
  write_svg(prod,'splash-icon',source_mark(d,192,192,640),1024,1024)
  write_svg(prod,'og',base(d,1200,630)+f'<g transform="translate(0 115)">{banner}</g>',1200,630)
  for name in ['app-icon','apple-touch-icon','og']:
   from PIL import Image
   Image.open(prod/(name+'.png')).convert('RGB').save(prod/(name+'.png'),optimize=True)
 guide(d,dest);sh=''
 for i,(folder,name) in enumerate([('social','banner-x-bluesky'),('social','square-post'),('social','story-template'),('social','screenshot-frame'),('video','title-card'),('video','lower-third')]):
  x=(i%2)*800;y=(i//2)*600;sh+=rect(x,y,800,600,'#eae6de')+T(x+24,y+36,name,19,'#242226','Space Grotesk',700)+embed_svg((dest/folder/(name+'.svg')).read_text(),x+24,y+60,752,506)
 write_svg(dest,'pack-preview',sh,1600,1800)
 entries=[]
 # Directory order differs between checkouts. Keep the committed manifest order and append new files by path, so an unchanged pack rebuilds to an identical manifest.
 previous=[e['path'] for e in json.loads((dest/'asset-manifest.json').read_text())['files']] if (dest/'asset-manifest.json').exists() else []
 rank={path:i for i,path in enumerate(previous)}
 for p in sorted(dest.rglob('*'),key=lambda p:(rank.get(str(p.relative_to(dest)),len(rank)),str(p.relative_to(dest)))):
  if p.is_file() and p.name!='asset-manifest.json':
   entry={'path':str(p.relative_to(dest)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
   if p.suffix=='.png':
    from PIL import Image
    im=Image.open(p);entry.update(width=im.width,height=im.height,mode=im.mode)
   entries.append(entry)
 (dest/'asset-manifest.json').write_text(json.dumps({'brand':d['brand'],'direction':d['name'],'status':'local production pack v1','files':entries},indent=2));print(d['brand'],len(entries),'files',flush=True)
print('Selected brand packs built.')
if os.environ.get('BRAND_ONLY')=='subcult':
 manifest=R.parent/'asset-manifest.json'
 rows=json.loads(manifest.read_text());by_path={entry['path']:entry for entry in rows}
 paths=list((R.parent/'brands/subcult').rglob('*'))+[R/'build_packs.py',R/'design_helpers.py',R/'subcult_assets.py']
 for path in paths:
  if not path.is_file():continue
  relative=str(path.relative_to(R.parent));row=by_path.get(relative,{'path':relative})
  row.update(sha256=hashlib.sha256(path.read_bytes()).hexdigest(),bytes=path.stat().st_size)
  if path.suffix=='.png':
   from PIL import Image
   im=Image.open(path);row.update(width=im.width,height=im.height,mode=im.mode)
  by_path[relative]=row
 existing={entry['path'] for entry in rows}
 updated=[by_path[entry['path']] for entry in rows]+[by_path[key] for key in sorted(set(by_path)-existing)]
 manifest.write_text(json.dumps(updated,indent=2)+'\n')
