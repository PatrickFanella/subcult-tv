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
 content='PATRICK_<tspan dx=".08em">_</tspan>EFF' if s=='PATRICK__EFF' and font=='Cascadia Mono' else html.escape(s)
 ligature_style=' style="font-variant-ligatures:none"' if font=='Cascadia Mono' else ''
 return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{color}"{ligature_style}>{content}</text>'
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
def rekolekt_mark(d,x,y,size):
 # Restore the original captured logo, including its central waveform.
 import xml.etree.ElementTree as ET
 root=ET.fromstring((R/'references/rekolekt-mark.svg').read_text())
 for el in root.iter():
  if el.attrib.get('stroke'):el.set('stroke',d['accent'])
 return f'<image x="{x}" y="{y}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{base64.b64encode(ET.tostring(root,encoding="utf-8")).decode()}"/>'
def rekolekt_transcript(d,x,y,w,h):
 s='';row=h/4;gutter=w*.17
 for i,width in enumerate([.69,.76,.62,.49]):
  yy=y+i*row
  s+=txt(x,yy+row*.55,f'00:{12+i*8:02d}',row*.23,d['secondary'],d['label'])
  if i==1:s+=rect(x+gutter-10,yy+row*.12,w-gutter,row*.7,d['accent'])
  col=d['bg'] if i==1 else d['fg']
  s+=rect(x+gutter,yy+row*.34,w*width,row*.095,col)+rect(x+gutter,yy+row*.52,w*width*.72,row*.095,col)
 return f'<g data-art="transcript-rows">{s}</g>'
def patrick_wave(x,y,w,h,d,n=41):
 offset=max(1.25,min(5,w*.005))
 return wave(x+offset,y-offset*.5,w,h,d['accent'],n)+wave(x-offset,y+offset,w,h,d['secondary'],n)+wave(x,y,w,h,d['fg'],n)
def patrick_style(body):
 import xml.etree.ElementTree as ET
 root=ET.fromstring(svg(body,1920,1920,'styling'))
 ns='{http://www.w3.org/2000/svg}'
 for parent in list(root.iter()):
  if parent.get('data-style')=='patrick-offset':continue
  for e in list(parent):
   if e.tag!=ns+'text' or e.get('font-family')!='Cascadia Mono' or int(e.get('font-weight','400'))<600 or float(e.get('font-size','0').replace('px',''))<38:continue
   import copy
   size=float(e.get('font-size').replace('px',''));offset=max(.8,min(3,size*.018));g=ET.Element(ns+'g',{'data-style':'patrick-offset'})
   for color,dx,dy in [('#8a00c7',offset,-offset*.5),('#66ff00',-offset,offset)]:
    q=copy.deepcopy(e);q.set('fill',color);q.set('transform',f'translate({dx} {dy})');g.append(q)
   g.append(copy.deepcopy(e));index=list(parent).index(e);parent.remove(e);parent.insert(index,g)
 return ''.join(ET.tostring(e,encoding='unicode') for e in root if not e.tag.endswith('title'))
def patrick_mark(d,x,y,size):
 import xml.etree.ElementTree as ET
 ns='{http://www.w3.org/2000/svg}'
 source='mono' if d.get('mono') else 'primary'
 root=ET.parse(R/f'references/patrick-variations/{source}-outlined.svg').getroot()
 for e in root.iter():
  for k,v in list(e.attrib.items()):e.set(k,v.replace('#f3f0ed',d['fg']).replace('#8a00c7',d['accent']).replace('#66ff00',d['secondary']))
 artwork=ET.tostring(root,encoding='unicode')
 return f'<image x="{x}" y="{y}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{base64.b64encode(artwork.encode()).decode()}"/>'
D=[]
def add(id,brand,variant,name,bg,fg,accent,secondary,display,body,headline,tag,description,mode,url=None,source=None):
 D.append(dict(id=id,brand=brand,variant=variant,name=name,bg=bg,fg=fg,accent=accent,secondary=secondary,display=display,body=body,headline=headline,tag=tag,description=description,mode=mode,url=url,source=source))
def patch_shape(x,y,w,h,color,stroke=None,radius=22):
 r=min(radius,h/2,w/2);small=2
 path=f'M{x+small} {y}H{x+w-r}Q{x+w} {y} {x+w} {y+r}V{y+h-small}Q{x+w} {y+h} {x+w-small} {y+h}H{x+r}Q{x} {y+h} {x} {y+h-r}V{y+small}Q{x} {y} {x+small} {y}Z'
 return f'<path d="{path}" fill="{color}"'+(f' stroke="{stroke}" stroke-width="1.5" stroke-dasharray="4 5"' if stroke else '')+'/>'
def patch_paper(w,h):
 marks=''.join(f'<circle cx="{(i*17+3)%64}" cy="{(i*29+7)%64}" r="{.35+(i%3)*.12}" fill="black"/>' for i in range(30))
 return f'<defs><pattern id="patch-paper" width="64" height="64" patternUnits="userSpaceOnUse">{marks}</pattern></defs><rect width="{w}" height="{h}" fill="url(#patch-paper)" opacity=".025"/>'
def patch_stitches(x,y,w,h,color):
 # Sample the asymmetric outline, then place deterministic uneven stitches.
 inset=9;x+=inset;y+=inset;w-=2*inset;h-=2*inset;r=min(14,h/2,w/2);small=2
 points=[(x+small,y),(x+w-r,y)]
 def curve(a,b,c):
  for i in range(1,13):
   t=i/12;points.append(((1-t)**2*a[0]+2*(1-t)*t*b[0]+t*t*c[0],(1-t)**2*a[1]+2*(1-t)*t*b[1]+t*t*c[1]))
 curve((x+w-r,y),(x+w,y),(x+w,y+r));points.extend([(x+w,y+h-small),(x+w-small,y+h),(x+r,y+h)])
 curve((x+r,y+h),(x,y+h),(x,y+h-r));points.extend([(x,y+small),(x+small,y)])
 segments=[];total=0
 for a,b in zip(points,points[1:]):
  length=math.hypot(b[0]-a[0],b[1]-a[1]);segments.append((total,total+length,a,b));total+=length
 def point(distance):
  for lo,hi,a,b in segments:
   if distance<=hi:
    t=(distance-lo)/(hi-lo);return (a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
  return points[-1]
 pos=3;i=0;paths=[]
 while pos+8<total:
  length=[9,11,8,10,9.5][i%5];a=point(pos);b=point(min(pos+length,total));dx=b[0]-a[0];dy=b[1]-a[1];n=math.hypot(dx,dy) or 1;tilt=[.5,-.7,.3,.8,-.4][i%5]
  paths.append(f'M{a[0]-dy/n*tilt:.2f} {a[1]+dx/n*tilt:.2f}L{b[0]+dy/n*tilt:.2f} {b[1]-dx/n*tilt:.2f}')
  pos+=length+[8,9,7,10,8.5][i%5];i+=1
 return f'<path data-texture="stitches" d="{" ".join(paths)}" fill="none" stroke="{color}" stroke-width="2.4" stroke-linecap="round"/>'
def patch_fabric(x,y,w,h,color):
 # Low-opacity weave, clipped to the same asymmetric silhouette.
 shape=patch_shape(0,0,w,h,'white');mesh=''
 for yy in range(2,int(h),6):mesh+=line(0,yy,w,yy,'white',.55)
 for xx in range(2,int(w),6):mesh+=line(xx,0,xx,h,'white',.4)
 uid='fabric-'+hashlib.sha256(f'{x},{y},{w},{h},{color}'.encode()).hexdigest()[:12]
 return f'<g transform="translate({x} {y})" opacity=".035"><defs><clipPath id="{uid}">{shape}</clipPath></defs><g clip-path="url(#{uid})">{mesh}</g></g>'
def stitched_patch(x,y,w,h,color,thread='#f2efe7',shadow=False):
 s=patch_shape(x+5,y+6,w,h,'#b2bba1') if shadow else ''
 return s+patch_shape(x,y,w,h,color)+(patch_fabric(x,y,w,h,color) if color!='none' else '')+patch_stitches(x,y,w,h,thread)
def patchwork_mark(d,x,y,size,mono=False):
 if mono:
  bg='none';thread=d['fg'];glyph=d['fg']
 else:
  bg=d['secondary'];thread=d['bg'];glyph=d['bg']
 body=stitched_patch(0,0,160,160,bg,thread)
 body+='<g transform="scale(2.5)"><path d="M18 48V16h16.5c8.2 0 13.5 4.4 13.5 11.5S42.7 39 34.5 39H27v9h-9Zm9-17h7c3.3 0 5-1.2 5-3.5S37.3 24 34 24h-7v7Z" fill="'+glyph+'"/></g>'
 return f'<g transform="translate({x} {y}) scale({size/160})">{body}</g>'


# Corkboard: original artwork drawn for this pack (October 2, 2026).
CORK_INK='#1b130c'
def cork_texture(w,h):
 # Deterministic cork grain: small dark and light specks at low opacity.
 dots=''.join(f'<circle cx="{(i*37+11)%96}" cy="{(i*53+5)%96}" r="{.8+(i%4)*.45}" fill="{"#7a5228" if i%3 else "#f3d2a2"}"/>' for i in range(46))
 return f'<defs><pattern id="cork-grain" width="96" height="96" patternUnits="userSpaceOnUse">{dots}</pattern></defs><rect width="{w}" height="{h}" fill="url(#cork-grain)" opacity=".42"/>'
def pushpin(cx,cy,r,color,shine):
 return f'<circle cx="{cx+r*.18}" cy="{cy+r*.3}" r="{r}" fill="{CORK_INK}" opacity=".22"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/><circle cx="{cx-r*.34}" cy="{cy-r*.34}" r="{r*.3}" fill="{shine}"/>'
def qr_glyph(x,y,size,ink):
 # Decorative QR-like grid with three finder squares; it does not encode data.
 n=9;c=size/n;s=''
 for fx,fy in [(0,0),(6,0),(0,6)]:
  s+=rect(x+fx*c,y+fy*c,3*c,3*c,'none',0)+f'<rect x="{x+fx*c+c*.25}" y="{y+fy*c+c*.25}" width="{c*2.5}" height="{c*2.5}" fill="none" stroke="{ink}" stroke-width="{c*.5}"/>'+rect(x+fx*c+c,y+fy*c+c,c,c,ink)
 for i,j in [(4,0),(4,2),(3,4),(5,4),(7,4),(4,6),(6,6),(8,5),(5,8),(7,8),(8,7),(4,4),(6,3),(2,4)]:s+=rect(x+i*c,y+j*c,c,c,ink)
 return s
def pinned_card(d,x,y,w,h,rot,lines=(),qr=False):
 # A paper card pinned to the board: hard shadow, ink rule border, pushpin.
 paper=d['secondary'] if not d.get('mono') else 'none';ink=CORK_INK if not d.get('mono') else d['fg']
 cx=x+w/2;cy=y+h/2;s=f'<g transform="rotate({rot} {cx} {cy})">'
 if not d.get('mono'):s+=rect(x+7,y+9,w,h,CORK_INK,4)[:-2]+' opacity=".28"/>'
 s+=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{paper}" stroke="{ink}" stroke-width="3"/>'
 if qr:
  q=min(w,h)-46;s+=qr_glyph(x+(w-q)/2,y+30,q,ink)
 ty=y+h*.5
 for text,size,font,weight in lines:
  s+=txt(x+22,ty,text,size,ink,font,weight,maxw=w-44);ty+=size*1.6
 pin_c=d['accent'] if not d.get('mono') else d['fg']
 s+=pushpin(cx,y+4,max(9,w*.06),pin_c,d['secondary'] if not d.get('mono') else d['bg'])+'</g>'
 return s
def corkboard_mark(d,x,y,size):
 mono=d.get('mono');ink=CORK_INK if not mono else d['fg'];paper=d['secondary'] if not mono else 'none'
 s='<g transform="rotate(-7 80 88)">'
 if not mono:s+='<rect x="29" y="40" width="112" height="108" rx="10" fill="'+CORK_INK+'" opacity=".28"/>'
 s+=f'<rect x="22" y="32" width="112" height="108" rx="10" fill="{paper}" stroke="{ink}" stroke-width="7"/>'
 s+=rect(42,74,72,15,ink,7.5)+rect(42,100,48,15,ink,7.5)+'</g>'
 pin_c=d['accent'] if not mono else d['fg']
 s+=f'<circle cx="80" cy="32" r="19" fill="{pin_c}"/><circle cx="73.5" cy="25.5" r="6" fill="{d["secondary"] if not mono else d["bg"]}"/>'
 return f'<g transform="translate({x} {y}) scale({size/160})">{s}</g>'
def cork_stack(d,x,y,w,h):
 # Three pinned destinations: a handle, a tip jar and a QR card.
 L,B=d['label'],d['body'];cw=w*.46;ch=h*.42
 s=pinned_card(d,x+w*.02,y+h*.06,cw,ch,-4,[('@yourname',ch*.2,B,700),('SOCIAL',ch*.11,L,400)])
 s+=pinned_card(d,x+w*.5,y,cw,ch,5,[('$yourname',ch*.2,B,700),('TIPS',ch*.11,L,400)])
 s+=pinned_card(d,x+w*.26,y+h*.5,w*.36,h*.5,-2,[],qr=True)
 return s

def docking_mark(d,x,y,size):
 # Prichal docking node: sphere, perspective equator and four flanged collars.
 # The red flange is the occupied port. No centre dot or ring: with the cross of
 # ports that reads as a gun sight. Geometry matches the prichal repository.
 mono=d.get('mono');ink=d['fg'];flange=ink if mono else d['accent'];field='none' if mono else d['bg']
 def port(angle,colour):return f'<g transform="rotate({angle} 256 256)"><rect x="218" y="62" width="76" height="70" fill="{ink}"/><rect x="196" y="36" width="120" height="34" fill="{colour}"/></g>'
 s=port(0,ink)+port(180,ink)+port(270,ink)+port(90,flange)
 s+=f'<circle cx="256" cy="256" r="134" fill="{field}" stroke="{ink}" stroke-width="26"/>'
 s+=f'<path d="M 122 256 A 134 44 0 0 0 390 256" fill="none" stroke="{ink}" stroke-width="14"/>'
 s+=f'<path d="M 122 256 A 134 44 0 0 1 390 256" fill="none" stroke="{ink}" stroke-width="6" stroke-dasharray="14 12"/>'
 return f'<g transform="translate({x} {y}) scale({size/512})">{s}</g>'
def drawing_ticks(x,y,length,colour,step=24):
 # Engineering-drawing scale: short ticks with a longer one every fourth.
 return ''.join(rect(x,y+p,18 if i%4==0 else 9,2,colour) for i,p in enumerate(range(0,int(length)+1,step)))
def port_strip(d,x,y,size=16):return txt(x,y,'PORT 01 · 02 · 03 · 04 · 05 · 06',size,d['safe_label'],d['label'])
def docking_ports(d,x,y,w,h):
 # Six numbered ports; the red one is occupied.
 s='';gap=w*.03;cw=(w-gap*5)/6
 for i in range(6):
  xx=x+i*(cw+gap);taken=i==3
  s+=rect(xx,y,cw,h,d['accent'] if taken else 'none',0,None if taken else d['fg'])
  s+=txt(xx+cw*.12,y+h*.62,f'0{i+1}',h*.32,d['bg'] if taken else d['fg'],d['label'])
 return f'<g data-art="docking-ports">{s}</g>'

def mark(d,x,y,size):
 m=d['mode'];a=d['accent'];f=d['fg'];s=''
 if m=='patrick-wave' and (R/'references/patrick-variations/primary-outlined.svg').exists():return patrick_mark(d,x,y,size)
 if m=='subcult-poster' and (R/'references/subcult-mark-master.svg').exists():
  import xml.etree.ElementTree as ET
  root=ET.fromstring((R/'references/subcult-mark-master.svg').read_text())
  root.set('viewBox','22 22 212 212')
  for el in root.iter():
   accent_block=el.attrib.get('fill')=='#00ff88'
   for attr,value in list(el.attrib.items()):
    el.set(attr,value.replace('#100b19',f).replace('#00ff88',a))
   if accent_block and d.get('mono'):
    el.set('fill','none');el.set('style',f'fill:none;stroke:{f};stroke-width:1')
  artwork=ET.tostring(root,encoding='unicode')
  return f'<image x="{x}" y="{y}" width="{size}" height="{size}" href="data:image/svg+xml;base64,{base64.b64encode(artwork.encode()).decode()}"/>'
 if m=='clpr':
  s=txt(12,95,'c',132,f,'Barlow Condensed',700)+f'<circle cx="128" cy="65" r="14" fill="{a}"/>'
 elif m=='corkboard':return corkboard_mark(d,x,y,size)
 elif m=='docking':return docking_mark(d,x,y,size)
 elif m=='patchwork':return patchwork_mark(d,x,y,size)
 elif m=='hasanara':s=image('hasanara-logo.svg',0,30,160,100)
 elif m=='undertow':s=image('undertow-favicon.svg',0,0,160,160)
 elif m=='os':s=rect(6,6,148,148,'#0d1117')+f'<rect x="6" y="6" width="148" height="148" fill="none" stroke="{a}" stroke-width="8"/>'+txt(24,105,'OS',62,f if d.get('mono') else '#ffffff','Space Mono',700)+rect(108,64,22,46,d['secondary'])
 elif m=='patrick-wave':s=wave(14,80,140,110,a,13)+f'<circle cx="139" cy="22" r="8" fill="{d["secondary"]}"/>'
 elif m=='patrick-record':s=f'<circle cx="80" cy="80" r="70" stroke="{a}" stroke-width="2" fill="none"/><circle cx="80" cy="80" r="49" stroke="{a}" stroke-width="2" fill="none"/><circle cx="80" cy="80" r="7" fill="{a}"/>'+txt(31,96,'pf',52,f,'Space Grotesk',700)
 elif m=='patrick-paper':s=txt(13,108,'pf.',98,a,'Libre Baskerville',700)
 elif m=='rekolekt-index':s=image('rekolekt-mark.svg',0,0,160,160)
 elif m=='rekolekt-folio':s=f'<path d="M26 28H115V130H26Z M41 12H130V114 M26 50H115 M50 76H92 M50 94H92" stroke="{a}" stroke-width="8" fill="none"/>'
 elif m=='rekolekt-passage':s=f'<path d="M45 28H20V132H45 M115 28H140V132H115 M56 54H104 M56 80H104 M56 106H86" stroke="{a}" stroke-width="8" fill="none"/>'
 elif m=='subcult-signal':s=txt(29,121,'S',128,a,'Oswald',700)+line(16,9,144,9,a,3)+line(16,151,144,151,a,3)
 elif m=='subcult-catalogue':s=rect(16,16,93,93,'none',0,a)+rect(51,51,93,93,'none',0,a)
 else:
  # Keep the original filled S and underscore; fit the added outline C to the mark cell.
  c=txt(109,120,'C',112,'none','Oswald',700).replace('fill="none"',f'fill="none" stroke="{f}" stroke-width="3.2" stroke-linejoin="round"')
  s='<g transform="translate(3 2) scale(.9)">'+txt(7,120,'S_',112,f,'Oswald',700)+c+rect(148,65,18,18,a)+'</g>'
 return f'<g transform="translate({x} {y}) scale({size/160})">{s}</g>'
def banner(d):
 bg,fg,a,b=d['bg'],d['fg'],d['accent'],d['secondary'];m=d['mode'];s=rect(0,0,1200,400,bg)+(patch_paper(1200,400) if m=='patchwork' else '')+(cork_texture(1200,400) if m=='corkboard' else '')
 if m=='docking':
  s+=drawing_ticks(18,40,320,'#c9c4b6')+docking_mark(d,60,88,224)
  s+=txt(330,110,'ПРИЧАЛ · ACCOUNT HOSTING',17,d['safe_label'],d['label'])+txt(330,232,'PRICHAL',128,fg,d['display'],700,maxw=560)
  s+=rect(330,256,180,6,a)+txt(330,312,d['headline'][0].capitalize()+' '+d['headline'][1].capitalize(),30,fg,d['body'],maxw=800)
  s+=line(40,348,1160,348,'#c9c4b6',2)+port_strip(d,40,378)+txt(1160,378,d['url'],16,d['safe_label'],d['label']).replace('<text ','<text text-anchor="end" ')
 elif m=='corkboard':
  s+=txt(44,62,d['tag'],17,d['safe_label'],d['label'])+line(44,82,640,82,fg,3)
  for i,h in enumerate(d['headline']):s+=txt(44,178+i*86,h,78,fg,d['display'],700,maxw=600)
  s+=txt(44,355,d['url'],20,fg,d['label'])
  s+=pinned_card(d,705,58,215,128,-5,[('@yourname',27,d['body'],700),('SOCIAL',15,d['label'],400)])+pinned_card(d,950,92,200,124,6,[('$yourname',26,d['body'],700),('TIPS',15,d['label'],400)])+pinned_card(d,800,222,150,150,-3,[],qr=True)+pinned_card(d,985,250,170,104,4,[('WATCH',24,d['body'],700),('LATEST VIDEO',13,d['label'],400)])
 elif m=='clpr':
  s+=line(40,40,1160,40,a,3)+txt(44,76,'CLIP INDEX / 01',17,b,'IBM Plex Mono')+image('clpr-wordmark.svg',45,89,360,193)
  s+=txt(480,153,'THE CLIP.',79,fg,d['display'],700)+txt(480,238,'THE MOMENT.',79,fg,d['display'],700)+rect(480,272,550,2,a)+txt(480,312,'Clip discovery + curation',26,fg,d['body'])+txt(480,352,'clpr.tv',18,a,'IBM Plex Mono')
 elif m=='patchwork':
  s+=txt(42,76,'Patchwork',45,fg,'Fraunces',700)+txt(44,137,d['tag'],16,a,'JetBrains Mono')
  for i,h in enumerate(d['headline']):s+=txt(44,216+i*73,h,68,fg,d['display'],700)
  for x,y,c in [(850,55,a),(1003,80,b),(827,220,'#f2c14e'),(997,244,'#9ec5ad')]:
   s+=stitched_patch(x,y,146,126,c,bg)
  s+=txt(44,355,'patchwork.subcult.tv',19,a,'Public Sans')
 elif m=='hasanara':
  s+=txt(44,66,'HasanAra',43,fg,'Newsreader',700)+txt(44,111,'BROADCAST ARCHIVE',17,a,'JetBrains Mono')+line(44,133,1156,133,a,3)
  s+=txt(44,222,d['headline'][0],65,fg,'Newsreader',700)+txt(44,297,d['headline'][1],65,fg,'Newsreader',700)
  s+=image('hasanara-logo.svg',934,173,190,112)+txt(941,327,'PBS',17,b,'JetBrains Mono')+txt(44,359,'Search / passages / original context',18,'#b5afa3','Inter Tight')
 elif m=='os':
  s+=mark(d,995,58,155)+txt(44,67,'Subcult OS',35,fg,'Space Mono',700)+txt(44,99,'> os.subcult.tv',17,b,'Space Mono')
  for i,h in enumerate(d['headline']):s+=txt(44,178+i*68,h,56,fg,'Space Mono',700)
  for i,h in enumerate(['PLAN','COORDINATE','RUN DOOR','SETTLE','ARCHIVE']):
   x=44+i*224;s+=rect(x,302,208,58,a if i==2 else '#0d1117',0,None if i==2 else '#465264')+txt(x+16,338,h,17,fg if i==2 else b,'Space Mono',700)
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
 bg,fg,a,b=d['bg'],d['fg'],d['accent'],d['secondary'];m=d['mode'];s=rect(0,0,600,600,bg)+(patch_paper(600,600) if m=='patchwork' else '')+(cork_texture(600,600) if m=='corkboard' else '')
 s+=txt(36,49,d['tag'],14,d['safe_label'] if m=='os' else d.get('tag_color',a),'Space Mono' if m=='os' else 'JetBrains Mono',maxw=526)
 if m=='docking':
  s+=docking_mark(d,36,86,150)+txt(208,186,'PRICHAL',58,fg,d['display'],700,maxw=356)
  for i,h in enumerate(['DOCK YOUR','ACCOUNT.']):s+=txt(36,322+i*72,h,66,fg,d['display'],700,maxw=528)
  s+=rect(36,410,150,6,a)+docking_ports(d,36,446,528,62)
 elif m=='corkboard':
  s+=txt(36,140,'PIN IT UP.',66,fg,d['display'],700,maxw=528)+txt(36,190,'Share one link for everything.',26,fg,d['body'],maxw=528)
  s+=cork_stack(d,40,232,520,270)
 elif m=='clpr':
  s+=rect(35,86,529,210,'#17141f')+wave(67,184,462,125,a,35)+rect(48,271,117,24,a)+txt(59,289,'CLIP / 001',13,bg,'IBM Plex Mono',700)
  s+=txt(36,373,'Keep the moment.',53,fg,'Barlow Condensed',700)+txt(36,433,'Find the next one.',53,fg,'Barlow Condensed',700)
 elif m=='patchwork':
  for i,h in enumerate(['A small ask.','A local offer.']):s+=txt(36,149+i*65,h,50,fg,'Fraunces',700)
  for i,(label,col) in enumerate([('HELP A NEIGHBOUR',a),('PASS IT ON',d.get('action_tomato',b))]):
   y=294+i*86;s+=stitched_patch(35,y-4,514,67,col,bg,True)+txt(60,y+36,label,20,bg,'Public Sans',700)
  s+=txt(36,492,'Mutual aid, block by block.',22,fg,'Public Sans')
 elif m=='hasanara':
  s+=line(36,77,564,77,a,3)+txt(36,155,'The passage.',51,fg,'Newsreader',700)+txt(36,213,'The source.',51,fg,'Newsreader',700)+txt(36,271,'The context.',51,fg,'Newsreader',700)
  s+=rect(36,326,528,130,'#161616')+txt(58,365,'SOURCE / TIMESTAMP / CONTEXT',16,a,'JetBrains Mono')
  for i,w in enumerate([459,419,324]):s+=rect(58,389+i*19,w,5,'#b5afa3')
 elif m=='os':
  s+=txt(36,134,'The door opens.',38,fg,'Space Mono',700)+txt(36,190,'The plan holds.',38,fg,'Space Mono',700)
  for i,label in enumerate(['01   PLAN THE EVENT','02   RUN THE DOOR','03   SETTLE AND ARCHIVE']):
   y=270+i*70;s+=rect(36,y,528,56,a if i==1 else '#0d1117',0,None if i==1 else '#465264')+txt(58,y+35,label,18,fg if i==1 else b,'Space Mono',700)
 elif m=='undertow':
  s+=txt(36,130,'MAKE IT',53,fg,'Liberation Mono',700)+txt(36,194,'MOVE.',75,a,'Liberation Mono',700)
  s+=rect(42,245,522,222,'#6a5fb0')+rect(36,239,522,222,'#171429',0,b)+wave(61,350,480,184,a,43)
 elif m=='patrick-wave':
  s+=txt(36,140,'WORK IN',67,fg,d['display'],700,maxw=528)+txt(36,219,'PROGRESS.',67,fg,d['display'],700,maxw=528)+patrick_wave(44,366,510,194,d,43)+txt(36,486,'Code, culture and a little noise.',23,b,d['body'])
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