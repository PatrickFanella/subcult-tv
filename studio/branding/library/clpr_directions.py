from pathlib import Path
import base64,xml.etree.ElementTree as E
import design_helpers as H
R=Path(__file__).resolve().parent
DIRECTIONS={'focus':'Focus frame','stack':'Clip stack','play':'Play field'}
def logo(d,x,y,w,h,icon=False):
 root=E.parse(R/'references'/('clpr-play-icon.svg' if icon else 'clpr-play-wordmark.svg')).getroot()
 for e in root.iter():
  for k,v in list(e.attrib.items()):
   v=v.replace('#EEEDF7',d['fg']).replace('#eeedf7',d['fg']).replace('#8C5CFF',d['accent']).replace('#8c5cff',d['accent'])
   if d.get('mono'):v=v.replace('#291d47',d['fg']).replace(d['accent'],d['fg'])
   e.set(k,v)
 text=E.tostring(root,encoding='unicode')
 return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/svg+xml;base64,{base64.b64encode(text.encode()).decode()}"/>'
def corners(x,y,w,h,color,width=4):
 n=min(w,h)*.17
 return ''.join(f'<path d="M{xx+sx*n} {yy}H{xx}V{yy+sy*n}" fill="none" stroke="{color}" stroke-width="{width}"/>' for xx,yy,sx,sy in [(x,y,1,1),(x+w,y,-1,1),(x,y+h,1,-1),(x+w,y+h,-1,-1)])
def clip_card(d,x,y,w,h):
 return H.rect(x,y,w,h,'#211b30',10,d['accent'])+logo(d,x+w*.33,y+h*.22,w*.36,h*.54,True)+H.line(x+20,y+h-24,x+w-20,y+h-24,d['secondary'],3)
def art(d,x,y,w,h,direction):
 a=d['accent'];f=d['fg'];s=''
 if direction=='focus':
  s=H.rect(x+10,y+10,w-20,h-20,'#17141f')+corners(x,y,w,h,a,5)
  s+=H.line(x+w*.33,y+h*.5,x+w*.67,y+h*.5,'#6e657f',1)+H.line(x+w*.5,y+h*.35,x+w*.5,y+h*.65,'#6e657f',1)
  s+=logo(d,x+w*.32,y+h*.27,w*.36,h*.46,True)
  s+=H.rect(x+w-26,y+h-26,12,12,d['secondary'])
 elif direction=='clip':
  s=clip_card(d,x,y,w,h)
 elif direction=='stack':
  for i,rot in [(2,6),(1,-5),(0,0)]:
   xx=x+i*12;yy=y+i*12;ww=w-30;hh=h-32
   body=clip_card(d,xx,yy,ww,hh) if i==0 else H.rect(xx,yy,ww,hh,'#211b30',10,'#493c64')
   s+=f'<g transform="rotate({rot} {xx+ww/2} {yy+hh/2})">{body}</g>'
 else:
  s=f'<path d="M{x} {y}H{x+w*.68}L{x+w} {y+h*.5}L{x+w*.68} {y+h}H{x}Z" fill="{a}"/>'
  s+=logo(dict(d,accent=f),x+w*.23,y+h*.23,w*.4,h*.54,True)
  s+=H.line(x+18,y+h-20,x+w*.6,y+h-20,f,3)
 return s

def banner(d,direction=None):
 direction=direction or d.get('graphic_direction','focus')
 s=H.rect(0,0,1200,400,d['bg'])+H.txt(48,36,d['tag'],14,d['accent'],d['label'])
 s+=logo(d,48,68,300,138)+H.txt(404,155,d['headline'][0].upper(),72,d['fg'],d['display'],700)+H.txt(404,235,d['headline'][1].upper(),72,d['fg'],d['display'],700)
 s+=art(d,888,76,250,240,direction)+H.txt(48,354,"It's probably in here.",22,d['fg'],d['body'])+H.txt(1084,354,'clpr.tv',18,d['accent'],d['label'])
 if direction=='focus':s+=corners(22,52,1156,282,d['accent'],2)
 elif direction=='clip':
  s=clip_card(d,x,y,w,h)
 elif direction=='stack':s+=H.line(48,305,840,305,d['accent'],2)
 else:s+=H.rect(0,0,10,400,d['accent'])
 return s

def post(d,direction=None):
 direction=direction or d.get('square_direction',d.get('graphic_direction','focus'))
 s=H.rect(0,0,600,600,d['bg'])+logo(d,40,36,260,120)
 s+=H.txt(40,260,'THE ONE FROM',58,d['fg'],d['display'],700,maxw=520)+H.txt(40,329,'LAST TUESDAY.',58,d['fg'],d['display'],700,maxw=520)
 s+=art(d,40,373,520,145,direction)+H.txt(40,573,'clpr.tv',19,d['fg'],d['label'])
 return s

def poster(d,w,h,kind,direction=None):
 direction=direction or d.get('graphic_direction','focus')
 s=H.rect(0,0,w,h,d['bg'])+logo(d,48,44,300,138)
 if kind=='story':
  for i,t in enumerate(h.upper() for h in d['headline']):s+=H.txt(48,390+i*120,t,106,d['fg'],d['display'],700,maxw=w-96)
  s+=art(d,80,660,w-160,490,direction)+H.txt(48,1465,'YOUR NOTE OR INVITATION',34,d['fg'],d['display'],700,maxw=w-96)+H.txt(48,1530,'Replace with approved copy.',28,d['fg'],d['body'])
 elif kind=='landscape':
  for i,t in enumerate(h.upper() for h in d['headline']):s+=H.txt(48,365+i*116,t,112,d['fg'],d['display'],700,maxw=w-660)
  s+=art(d,w-540,190,470,390,direction)+H.txt(48,662,'YOUR APPROVED CAPTION',27,d['fg'],d['body'])
 elif kind=='quote':
  for i,t in enumerate(['“Add the exact quote.','Keep its context.”']):s+=H.txt(48,340+i*100,t,72,d['fg'],d['display'],700,maxw=w-96)
  s+=H.txt(48,632,'SOURCE / SPEAKER / DATE',24,d['accent'],d['label'])+art(d,w-340,718,260,190,direction)
 else:
  s+=H.txt(48,330,'WHAT CHANGED',88,d['fg'],d['display'],700,maxw=w-96)
  for i,t in enumerate(['01 / A verified change','02 / A useful consequence','03 / A direct destination']):s+=H.txt(48,463+i*80,t,32,d['fg'],d['body'],maxw=w-96)
  s+=art(d,w-350,715,270,185,direction)
 s+=H.line(48,h-86,w-48,h-86,d['accent'],2)+H.txt(48,h-43,'clpr.tv',21,d['fg'],d['label'])
 return s

def screenshot(d):
 s=H.rect(0,0,1600,1000,d['bg'])+H.txt(48,65,'CLPR / WORKFLOW CAPTURE',20,d['accent'],d['label'])
 s+=H.rect(48,110,1504,738,'#17141f')+corners(48,110,1504,738,d['accent'],4)+H.txt(105,458,'PLACE A VERIFIED SCREENSHOT HERE',34,d['fg'],d['label'])+H.txt(105,516,'Crop private data. Keep interface text legible.',27,d['fg'],d['body'])+H.txt(48,948,'clpr.tv',21,d['fg'],d['label'])
 return s

def video(d,kind,direction=None):
 direction=direction or d.get('graphic_direction','focus')
 if kind=='lower-third':
  return H.rect(96,823,1728,174,d['bg'])+H.rect(96,823,8,174,d['accent'])+logo(d,130,845,230,106)+H.txt(414,898,'TITLE / SPEAKER',49,d['fg'],d['display'],700)+H.txt(414,957,'One short line of context.',30,d['fg'],d['body'])
 s=H.rect(0,0,1920,1080,d['bg'])+logo(d,96,68,370,170)
 if kind=='end-card':s+=H.txt(96,486,' '.join(d['headline']).upper(),112,d['fg'],d['display'],700,maxw=1100)+H.txt(96,640,'clpr.tv',54,d['accent'],d['label'])
 else:s+=H.txt(96,437,'ADD A CLEAR TITLE',112,d['fg'],d['display'],700,maxw=1080)+H.txt(96,562,'One useful idea.',57,d['fg'],d['body'])
 s+=art(d,1300,266,500,500,direction)+H.line(96,930,1824,930,d['accent'],3)
 return s
