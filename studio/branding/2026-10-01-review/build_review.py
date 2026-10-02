from pathlib import Path
import base64,html,json,math,os,subprocess,hashlib,zipfile
from PIL import ImageFont
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
fonts={}
def txt(x,y,s,size=28,color='#f0ece4',font='Space Grotesk',weight=400,maxw=None):
 key=(font,weight)
 if key not in fonts:
  path=subprocess.check_output(['fc-match','-f','%{file}',font+':weight='+('bold' if weight>=600 else 'regular')]).decode()
  fonts[key]=path
 if maxw:
  f=ImageFont.truetype(fonts[key],int(size));w=f.getlength(s)
  if w>maxw:size=math.floor(size*maxw/w)
 return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{color}">{html.escape(s)}</text>'
def rect(x,y,w,h,c,rx=0,stroke=None):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{c}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>'
def line(x,y,x2,y2,c,width=2):return f'<path d="M{x} {y} L{x2} {y2}" stroke="{c}" stroke-width="{width}" fill="none"/>'
def image(name,x,y,w,h):
 p=R/'references'/name;mime='image/svg+xml' if p.suffix=='.svg' else 'image/webp'
 return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"/>'
def svg(body,w,h,title):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>{body}</svg>'
def wave(x,y,w,h,c,n=41):
 s=''
 for i in range(n):
  height=h*(.12+.88*abs(math.sin(i*.58)*math.sin(i*.16+.7)))
  s+=line(x+i*w/n,y-height/2,x+i*w/n,y+height/2,c,max(2,w/n*.38))
 return s
D=[]
def add(id,brand,variant,name,bg,fg,accent,secondary,display,body,headline,tag,description,mode,url=None,source=None):
 D.append(dict(id=id,brand=brand,variant=variant,name=name,bg=bg,fg=fg,accent=accent,secondary=secondary,display=display,body=body,headline=headline,tag=tag,description=description,mode=mode,url=url,source=source))
add('clpr','CLPR','A','Tally / Ultraviolet','#0e0c13','#eeedf7','#8c5cff','#3ddc97','Barlow Condensed','Barlow',['The clip.','The moment.'],'CLIP DISCOVERY + CURATION','Condensed display type, ultraviolet markers and the existing outlined wordmark.','clpr','clpr.tv','Live site + current design system')
add('patchwork','Patchwork','A','Neighbourhood fabric','#f2efe7','#172019','#12664f','#e85d3f','Fraunces','Public Sans',['A little help,','from a friend.'],'MUTUAL AID, BLOCK BY BLOCK','Warm paper, stitched corners, Fraunces and Public Sans from the current site.','patchwork','patchwork.subcult.tv','Live site tokens')
add('hasanara','HasanAra','A','Broadcast archive','#0f0f0f','#eeeae1','#ff3333','#ff6633','Newsreader','Inter Tight',['Find the passage.','Keep the context.'],'PIKER BROADCASTING SERVICE','The live red-and-paper theme, Newsreader headlines and current PBS mark.','hasanara','hasanara.tv','Live site tokens and logo')
add('subcult-os','Subcult OS','A','The event ledger','#09090b','#fafafa','#fbbf24','#22d3ee','Georgia','JetBrains Mono',['From the plan','to the last ticket.'],'PLAN / COORDINATE / RUN DOOR / SETTLE / ARCHIVE','Serif-led event operations, amber and cyan from the current web source.','os',None,'Web source styles; no live destination verified')
add('undertow','Undertow','A','Glitch / Sound into motion','#0f0c1c','#f7f3ff','#ff9fe0','#9cecff','Liberation Mono','Public Sans',['SOUND','INTO MOTION.'],'MUSIC VISUALS / LYRICS / LOCAL EXPORT','Square controls, hard shadows, pink/cyan offsets and the existing spectrum favicon.','undertow','undertow.subcult.tv','Live editor theme and favicon')
add('patrick-a','Patrick__eff','A','Signal / current banner','#161616','#f3f0ed','#8a00c7','#66ff00','Oswald','Space Grotesk',['Software. Sound.','Independent culture.'],'PATRICK__EFF','Builds on your latest purple/lime banner and waveform. A sharper condensed wordmark.','patrick-wave','patrickfanella.co','Latest personal banner; proposed system')
add('patrick-b','Patrick__eff','B','Side A / studio notes','#161616','#f3f0ed','#f9735b','#aaa6b1','Space Grotesk','Space Grotesk',['Making things.','Making noise.'],'PATRICK FANELLA / PATRICK__EFF','Coral, record-label geometry and plain spoken studio notes. Engineering and music share the page.','patrick-record','patrickfanella.co','Earlier coral identity; proposed system')
add('patrick-c','Patrick__eff','C','Field notes / personal editorial','#eee9df','#211b27','#6335a1','#bbb19e','Libre Baskerville','Public Sans',['Notes from','the workbench.'],'PATRICK FANELLA','A warmer personal identity: your existing photo, serif headings and small purple annotations.','patrick-paper','patrickfanella.co','Existing personal photograph; proposed system')
add('rekolekt-a','Rekolekt','A','Index / original concept','#16201b','#f2eee5','#b8df72','#8d9e8a','Space Grotesk','Public Sans',['A recording.','An archive.'],'REKOLEKT BY SUBCULT','Retains the bracketed waveform and index-green palette from the working concept.','rekolekt-index',None,'Existing proposed Rekolekt concept')
add('rekolekt-b','Rekolekt','B','Folio / the reading archive','#f2eee5','#28261e','#59603a','#ab633c','Newsreader','Public Sans',['Worth finding.','Worth keeping.'],'REKOLEKT BY SUBCULT','An archive as a reading room: paper, olive index tabs and a new folio mark.','rekolekt-folio',None,'Alternative proposed system')
add('rekolekt-c','Rekolekt','C','Passage / source bracket','#101b29','#ecf1f4','#91c9ef','#a8b7c6','Space Grotesk','JetBrains Mono',['Keep the source','in the story.'],'REKOLEKT BY SUBCULT','A precise media archive: blue passage brackets, transcript lines and large restrained type.','rekolekt-passage',None,'Alternative proposed system')
add('subcult-a','SUBCULT','A','Signal / current site','#0a0a0a','#f0ece4','#8b5cf6','#00ff88','Oswald','Libre Baskerville',['Tools for the culture','we build together.'],'SUBCULT.TV','Formalizes the current site: black, purple, Oswald and editorial serif text.','subcult-signal','subcult.tv','Live site palette and typography; proposed system')
add('subcult-b','SUBCULT','B','Collective / open catalogue','#f0ece4','#17131d','#7042bd','#a69a83','Libre Baskerville','Public Sans',['Independent tools.','A shared culture.'],'SUBCULT / SOFTWARE & CULTURE','A paper-based studio catalogue with numbered products and an interlocking collective mark.','subcult-catalogue','subcult.tv','Alternative proposed system anchored in site palette')
add('subcult-c','SUBCULT','C','Culture / poster press','#8b5cf6','#100b19','#00ff88','#f0ece4','Oswald','Space Grotesk',['BUILD','TOGETHER.'],'SUBCULT.TV','A louder poster system: condensed black type, purple fields and acid-green registrations.','subcult-poster','subcult.tv','Alternative proposed system anchored in site palette')
def mark(d,x,y,size):
 m=d['mode'];a=d['accent'];f=d['fg'];s=''
 if m=='clpr':
  s=txt(12,95,'c',132,f,'Barlow Condensed',700)+f'<circle cx="128" cy="65" r="14" fill="{a}"/>'
 elif m=='patchwork':s=image('patchwork-icon.svg',0,0,160,160)
 elif m=='hasanara':s=image('hasanara-logo.svg',0,30,160,100)
 elif m=='undertow':s=image('undertow-favicon.svg',0,0,160,160)
 elif m=='os':s=rect(4,4,152,152,'#18181b',25)+txt(21,72,'S',54,f,'Georgia')+txt(62,122,'OS',48,a,'JetBrains Mono',700)
 elif m=='patrick-wave':s=wave(14,80,140,110,a,13)+f'<circle cx="139" cy="22" r="8" fill="{d["secondary"]}"/>'
 elif m=='patrick-record':s=f'<circle cx="80" cy="80" r="70" stroke="{a}" stroke-width="2" fill="none"/><circle cx="80" cy="80" r="49" stroke="{a}" stroke-width="2" fill="none"/><circle cx="80" cy="80" r="7" fill="{a}"/>'+txt(31,96,'pf',52,f,'Space Grotesk',700)
 elif m=='patrick-paper':s=txt(13,108,'pf.',98,a,'Libre Baskerville',700)
 elif m=='rekolekt-index':s=image('rekolekt-mark.svg',0,0,160,160)
 elif m=='rekolekt-folio':s=f'<path d="M26 28H115V130H26Z M41 12H130V114 M26 50H115 M50 76H92 M50 94H92" stroke="{a}" stroke-width="8" fill="none"/>'
 elif m=='rekolekt-passage':s=f'<path d="M45 28H20V132H45 M115 28H140V132H115 M56 54H104 M56 80H104 M56 106H86" stroke="{a}" stroke-width="8" fill="none"/>'
 elif m=='subcult-signal':s=txt(29,121,'S',128,a,'Oswald',700)+line(16,9,144,9,a,3)+line(16,151,144,151,a,3)
 elif m=='subcult-catalogue':s=rect(16,16,93,93,'none',0,a)+rect(51,51,93,93,'none',0,a)
 else:s=txt(11,120,'S_',112,f,'Oswald',700)+rect(115,10,30,30,a)
 return f'<g transform="translate({x} {y}) scale({size/160})">{s}</g>'
def banner(d):
 bg,fg,a,b=d['bg'],d['fg'],d['accent'],d['secondary'];m=d['mode'];s=rect(0,0,1200,400,bg)
 if m=='clpr':
  s+=line(40,40,1160,40,a,3)+txt(44,76,'CLIP INDEX / 01',17,b,'IBM Plex Mono')+image('clpr-wordmark.svg',45,89,360,193)
  s+=txt(480,153,'THE CLIP.',79,fg,d['display'],700)+txt(480,238,'THE MOMENT.',79,fg,d['display'],700)+rect(480,272,550,2,a)+txt(480,312,'Clip discovery + curation',26,fg,d['body'])+txt(480,352,'clpr.tv',18,a,'IBM Plex Mono')
 elif m=='patchwork':
  s+=txt(42,73,'Patchwork',39,fg,'Fraunces',700)+txt(44,137,d['tag'],16,a,'JetBrains Mono')
  for i,h in enumerate(d['headline']):s+=txt(44,216+i*73,h,63,fg,d['display'],700)
  for i,(x,y,c) in enumerate([(850,55,a),(1003,80,b),(827,220,'#f2c14e'),(997,244,'#9ec5ad')]):
   s+=f'<path d="M{x} {y} h124 q22 0 22 22 v104 h-124 q-22 0 -22 -22Z" fill="{c}"/>'
   s+=f'<path d="M{x+12} {y+12}h116v102h-116Z" stroke="{bg}" stroke-dasharray="5 7" fill="none" stroke-width="2"/>'
  s+=txt(44,355,'patchwork.subcult.tv',19,a,'Public Sans')
 elif m=='hasanara':
  s+=txt(44,66,'HasanAra',43,fg,'Newsreader',700)+txt(44,111,'BROADCAST ARCHIVE',17,a,'JetBrains Mono')+line(44,133,1156,133,a,3)
  s+=txt(44,222,d['headline'][0],65,fg,'Newsreader',700)+txt(44,297,d['headline'][1],65,fg,'Newsreader',700)
  s+=image('hasanara-logo.svg',934,173,190,112)+txt(941,327,'PBS',17,b,'JetBrains Mono')+txt(44,359,'Search / passages / original context',18,'#b5afa3','Inter Tight')
 elif m=='os':
  s+=mark(d,995,58,155)+txt(44,67,'Subcult OS',35,fg,'Georgia')
  for i,h in enumerate(d['headline']):s+=txt(44,160+i*75,h,67,fg,'Georgia')
  for i,h in enumerate(['PLAN','COORDINATE','RUN DOOR','SETTLE','ARCHIVE']):
   x=44+i*224;s+=rect(x,302,208,58,'#18181b',16)+txt(x+16,338,h,17,a if i==2 else b,'JetBrains Mono')
 elif m=='undertow':
  s+=txt(40,66,'UNDERTOW',31,a,'Liberation Mono',700)+txt(40,119,'AUDIO / LAYERS / MOTION',16,b,'JetBrains Mono')
  for i,h in enumerate(d['headline']):
   for dx,col in [(-2,b),(2,a),(0,fg)]:s+=txt(40+dx,205+i*80,h,67,col,'Liberation Mono',700)
  s+=wave(829,199,315,240,a,31)+wave(832,199,315,240,b,31)+line(40,322,1158,322,'#4b4378')+txt(40,363,'undertow.subcult.tv',19,b,'JetBrains Mono')
 elif m=='patrick-wave':
  s+=line(40,36,1160,36,a,4)+wave(55,208,235,232,a,19)+txt(345,103,'PATRICK__EFF',61,fg,'Oswald',700)
  for i,h in enumerate(d['headline']):s+=txt(345,183+i*68,h,50,fg,'Oswald',700)
  s+=f'<circle cx="350" cy="306" r="7" fill="{b}"/>'+txt(372,312,'SOFTWARE / MUSIC / LEFT POLITICS',17,b,'JetBrains Mono')+txt(345,365,'patrickfanella.co  /  @patrick__eff',19,'#aaa6b1','Space Grotesk')
 elif m=='patrick-record':
  for rad in [150,129,108,87]:s+=f'<circle cx="960" cy="201" r="{rad}" stroke="{a}" stroke-width="1.5" fill="none"/>'
  s+=f'<circle cx="960" cy="201" r="10" fill="{a}"/>'+txt(48,70,'PATRICK FANELLA',24,a,'JetBrains Mono')+txt(48,178,'Making things.',65,fg,'Space Grotesk',700)+txt(48,255,'Making noise.',65,fg,'Space Grotesk',700)+line(48,302,736,302,a)+txt(48,348,'STUDIO NOTES / @PATRICK__EFF',18,b,'JetBrains Mono')
 elif m=='patrick-paper':
  s+=image('patrick-avatar.jpg',848,40,312,312)+txt(48,66,'PATRICK FANELLA',21,a,'Public Sans',700)+txt(48,155,'Notes from',63,fg,'Libre Baskerville')+txt(48,229,'the workbench.',63,fg,'Libre Baskerville')+line(48,272,746,272,a)+txt(48,316,'Software, music and the world around them.',21,fg,'Public Sans')+txt(48,361,'patrickfanella.co  /  @patrick__eff',18,a,'JetBrains Mono')
 elif m.startswith('rekolekt'):
  s+=mark(d,922,115,217)+txt(44,66,'rekolekt',41,fg,d['display'],700)+txt(44,109,'BY SUBCULT',15,a,'JetBrains Mono')
  for i,h in enumerate(d['headline']):s+=txt(44,211+i*71,h,62,fg,d['display'],700,maxw=845)
  s+=line(44,319,825,319,a,2)+txt(44,360,'Searchable recordings. Source intact.',23,b,d['body'])
 elif m=='subcult-signal':
  s+=line(40,38,1160,38,a,3)+txt(40,100,'SUBCULT',57,fg,'Oswald',700)+txt(40,219,'Tools for the culture',74,fg,'Oswald',700)+txt(40,300,'we build together.',74,fg,'Oswald',700)+mark(d,991,124,140)+txt(40,362,'INDEPENDENT SOFTWARE / SUBCULT.TV',18,b,'JetBrains Mono')
 elif m=='subcult-catalogue':
  s+=txt(44,63,'SUBCULT',30,a,'Libre Baskerville',700)+txt(785,63,'SOFTWARE & CULTURE',17,fg,'JetBrains Mono')+line(44,83,1156,83,a)
  s+=txt(44,175,'Independent tools.',56,fg,'Libre Baskerville')+txt(44,246,'A shared culture.',56,fg,'Libre Baskerville')+mark(d,986,142,145)
  for i,t in enumerate(['CLPR','PATCHWORK','HASANARA','REKOLEKT','SUBCULT OS','UNDERTOW']):s+=txt(44+i*184,349,t,14,a,'JetBrains Mono')
 else:
  s+=rect(0,0,14,400,a)+txt(40,55,'SUBCULT.TV / INDEPENDENT SOFTWARE',18,fg,'JetBrains Mono')+txt(40,189,'BUILD',130,fg,'Oswald',700)+txt(40,333,'TOGETHER.',130,fg,'Oswald',700,maxw=925)+rect(1050,78,94,94,a)+line(1097,58,1097,192,fg)+line(1030,125,1164,125,fg)
 return s
def post(d):
 bg,fg,a,b=d['bg'],d['fg'],d['accent'],d['secondary'];m=d['mode'];s=rect(0,0,600,600,bg)
 s+=txt(36,49,d['tag'],14,a,'JetBrains Mono',maxw=526)
 if m=='clpr':
  s+=rect(35,86,529,210,'#17141f')+wave(67,184,462,125,a,35)+rect(48,271,117,24,a)+txt(59,289,'CLIP / 001',13,bg,'IBM Plex Mono',700)
  s+=txt(36,373,'Keep the moment.',53,fg,'Barlow Condensed',700)+txt(36,433,'Find the next one.',53,fg,'Barlow Condensed',700)
 elif m=='patchwork':
  for i,h in enumerate(['A small ask.','A local offer.']):s+=txt(36,149+i*65,h,46,fg,'Fraunces',700)
  for i,(label,col) in enumerate([('HELP A NEIGHBOUR',a),('PASS IT ON',b)]):
   y=294+i*86;s+=rect(39,y,514,67,'#172019')+rect(35,y-4,514,67,col,12)+txt(60,y+36,label,19,bg,'Public Sans',700)
  s+=txt(36,492,'Mutual aid, block by block.',22,fg,'Public Sans')
 elif m=='hasanara':
  s+=line(36,77,564,77,a,3)+txt(36,155,'The passage.',51,fg,'Newsreader',700)+txt(36,213,'The source.',51,fg,'Newsreader',700)+txt(36,271,'The context.',51,fg,'Newsreader',700)
  s+=rect(36,326,528,130,'#161616')+txt(58,365,'SOURCE / TIMESTAMP / CONTEXT',16,a,'JetBrains Mono')
  for i,w in enumerate([459,419,324]):s+=rect(58,389+i*19,w,5,'#b5afa3')
 elif m=='os':
  s+=txt(36,134,'The door opens.',41,fg,'Georgia')+txt(36,193,'The plan holds.',41,fg,'Georgia')
  for i,label in enumerate(['01   Plan the event','02   Run the door','03   Settle and archive']):
   y=270+i*70;s+=rect(36,y,528,56,'#18181b',17)+txt(58,y+35,label,19,a if i==1 else b,'JetBrains Mono')
 elif m=='undertow':
  s+=txt(36,130,'MAKE IT',53,fg,'Liberation Mono',700)+txt(36,194,'MOVE.',75,a,'Liberation Mono',700)
  s+=rect(42,245,522,222,'#6a5fb0')+rect(36,239,522,222,'#171429',0,b)+wave(61,350,480,184,a,43)
 elif m=='patrick-wave':
  s+=txt(36,140,'WORK IN',67,fg,'Oswald',700)+txt(36,219,'PROGRESS.',67,fg,'Oswald',700)+wave(44,366,510,194,a,43)+txt(36,486,'Code, culture and a little noise.',23,b,'Space Grotesk')
 elif m=='patrick-record':
  s+=txt(36,139,'SIDE A',72,fg,'Space Grotesk',700)+txt(36,189,'Notes from the studio.',22,a,'Space Grotesk')+mark(d,325,243,222)
  s+=txt(36,309,'01  BUILD',18,b,'JetBrains Mono')+txt(36,356,'02  LISTEN',18,b,'JetBrains Mono')+txt(36,403,'03  REPEAT',18,b,'JetBrains Mono')
 elif m=='patrick-paper':
  s+=txt(36,142,'A decision.',46,fg,'Libre Baskerville')+txt(36,207,'A consequence.',46,fg,'Libre Baskerville',maxw=530)+line(36,260,564,260,a)+txt(36,310,'What changed, and why.',24,fg,'Public Sans')
  for i,w in enumerate([481,457,322]):s+=rect(36,345+i*22,w,3,b)
  s+=mark(d,414,394,125)
 elif m=='rekolekt-index':
  s+=txt(36,139,'Make a recording',43,fg,'Space Grotesk',700,maxw=528)+txt(36,197,'into an archive.',43,fg,'Space Grotesk',700)
  s+=mark(d,36,287,160)+txt(231,329,'SEARCH',19,a,'JetBrains Mono')+txt(231,378,'QUOTE',19,a,'JetBrains Mono')+txt(231,427,'RETURN TO SOURCE',19,a,'JetBrains Mono',maxw=326)
 elif m=='rekolekt-folio':
  s+=txt(36,144,'A place for',51,fg,'Newsreader',700)+txt(36,203,'the record.',51,fg,'Newsreader',700)+mark(d,35,280,170)
  s+=txt(253,329,'01 / RECORDING',16,a,'JetBrains Mono')+txt(253,378,'02 / PASSAGE',16,a,'JetBrains Mono')+txt(253,427,'03 / SOURCE',16,a,'JetBrains Mono')
 elif m=='rekolekt-passage':
  s+=txt(36,135,'A passage,',48,fg,'Space Grotesk',700)+txt(36,194,'with its source.',48,fg,'Space Grotesk',700,maxw=528)
  s+=rect(36,273,528,175,'#1c2c3e')+line(59,298,59,424,a,5)
  for i,w in enumerate([423,450,374,409]):s+=rect(84,302+i*31,w,7,a if i==1 else b)
 elif m=='subcult-signal':
  s+=txt(36,144,'CULTURE NEEDS',65,fg,'Oswald',700,maxw=526)+txt(36,221,'ITS OWN TOOLS.',65,fg,'Oswald',700,maxw=526)+mark(d,37,302,140)
  s+=txt(239,356,'OPEN SOFTWARE',17,b,'JetBrains Mono')+txt(239,398,'INDEPENDENT CULTURE',17,b,'JetBrains Mono',maxw=325)
 elif m=='subcult-catalogue':
  s+=txt(36,132,'The catalogue.',43,fg,'Libre Baskerville')+line(36,167,564,167,a)
  for i,t in enumerate(['CLPR','Patchwork','HasanAra','Rekolekt','Subcult OS','Undertow']):s+=txt(36,218+i*44,f'0{i+1}',16,a,'JetBrains Mono')+txt(108,218+i*44,t,24,fg,'Public Sans')
 else:
  s+=txt(36,177,'CULTURE',97,fg,'Oswald',700)+txt(36,292,'NEEDS',97,fg,'Oswald',700)+rect(31,330,538,117,a)+txt(44,428,'TOOLS.',97,fg,'Oswald',700)
 s+=line(36,540,564,540,a)+txt(36,572,d.get('url') or d['brand'].lower()+' / by SUBCULT',16,fg,d['body'],maxw=528)
 return s
for d in D:
 dest=R/'concepts'/d['id'];dest.mkdir(parents=True,exist_ok=True)
 ba=banner(d);po=post(d);av=rect(0,0,512,512,d['bg'])+mark(d,96,96,320)
 for name,body,w,h,ew in [('banner',ba,1200,400,1500),('post',po,600,600,1080),('avatar',av,512,512,512)]:
  (dest/(name+'.svg')).write_text(svg(body,w,h,d['brand']+' / '+d['name']+' / '+name))
  subprocess.run(['rsvg-convert','-w',str(ew),'-o',str(dest/(name+'.png')),str(dest/(name+'.svg'))],check=True)
 board=rect(0,0,1200,1040,'#eae6de')+txt(32,39,d['brand']+' / '+d['variant']+' — '+d['name'],24,'#242226','Space Grotesk',700)+txt(32,70,d['source'],15,'#615a60','Public Sans')
 board+=f'<g transform="translate(0 98)">{ba}</g><g transform="translate(32 530) scale(.77)">{po}</g>'
 board+=txt(545,558,'IDENTITY / DRAFT '+d['variant'],17,'#615a60','JetBrains Mono')+rect(544,581,623,188,d['bg'])+mark(d,975,603,142)+txt(566,632,d['brand'],35,d['fg'],d['display'],700,maxw=393)+txt(566,680,d['display'],22,d['fg'],d['display'])+txt(566,723,d['body']+' / body',18,d['fg'],d['body'])
 for i,col in enumerate([d['bg'],d['fg'],d['accent'],d['secondary']]):
  x=545+i*156;board+=rect(x,800,143,70,col)+txt(x,897,col.upper(),17,'#242226','JetBrains Mono')
 board+=txt(545,953,'Banner / square post / avatar',19,'#242226','Public Sans')+txt(545,987,'Editable SVG + PNG exports. Direction review.',16,'#615a60','Public Sans')
 (dest/'board.svg').write_text(svg(board,1200,1040,d['brand']+' identity direction '+d['variant']))
 subprocess.run(['rsvg-convert','-o',str(dest/'board.png'),str(dest/'board.svg')],check=True)
 (dest/'tokens.json').write_text(json.dumps({k:d[k] for k in ['brand','variant','name','bg','fg','accent','secondary','display','body','source']},indent=2))
(R/'catalogue.json').write_text(json.dumps(D,indent=2))
# Contact sheets use native SVG image composition; original images stay intact.
def pngimg(p,x,y,w,h):return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/png;base64,{base64.b64encode(p.read_bytes()).decode()}"/>'
for name,ids,cols in [('overview',['subcult-a','patrick-a','clpr','patchwork','hasanara','rekolekt-a','subcult-os','undertow'],2),('patrick-comparison',['patrick-a','patrick-b','patrick-c'],3),('rekolekt-comparison',['rekolekt-a','rekolekt-b','rekolekt-c'],3),('subcult-comparison',['subcult-a','subcult-b','subcult-c'],3)]:
 tilew=600;tileh=520;w=cols*tilew;h=math.ceil(len(ids)/cols)*tileh
 s=''.join(pngimg(R/'concepts'/id/'board.png',(i%cols)*tilew,(i//cols)*tileh,tilew,tileh) for i,id in enumerate(ids))
 (R/(name+'.svg')).write_text(svg(s,w,h,name));subprocess.run(['rsvg-convert','-o',str(R/(name+'.png')),str(R/(name+'.svg'))],check=True)
print('Built',len(D),'directions; 56 editable SVGs and PNG derivatives, four comparison sheets.')
