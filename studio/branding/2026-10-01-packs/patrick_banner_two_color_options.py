from pathlib import Path
import base64,copy,os,re,subprocess,xml.etree.ElementTree as E
import design_helpers as H
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
OUT=R/'brands/patrick__eff/social/banner-two-color-options';OUT.mkdir(exist_ok=True)
SOURCE=E.parse(R/'references/patrick-banner-options-base.svg').getroot()
OPTIONS=[('white-purple','A / White mark, purple waveform','#f3f0ed','#8a00c7'),('purple-white','B / Purple mark, white waveform','#8a00c7','#f3f0ed')]
board=''
for i,(slug,title,face,wave) in enumerate(OPTIONS):
 root=copy.deepcopy(SOURCE);image=next(e for e in root.iter() if e.get('id')=='image1')
 mark=E.fromstring(base64.b64decode(image.get('href').split(',',1)[1]))
 for parent in list(mark.iter()):
  for e in list(parent):
   if e.get('id') in ['g35','g39','g42','g43','path22']:parent.remove(e)
 for e in mark.iter():
  for k,v in list(e.attrib.items()):e.set(k,re.sub(r'#[0-9a-fA-F]{6}',lambda m:face if m.group().lower() in ['#f3f0ed','#8a00c7','#66ff00'] else m.group(),v))
 waveform=next(e for e in mark.iter() if e.get('id')=='g22')
 for e in waveform.iter():
  for k,v in list(e.attrib.items()):e.set(k,v.replace(face,wave))
 image.set('href','data:image/svg+xml;base64,'+base64.b64encode(E.tostring(mark,encoding='utf-8')).decode())
 x,y,w,h=[float(image.get(k)) for k in ['x','y','width','height']];scale=.62
 for k,v in [('x',x+(w-w*scale)/2),('y',y+(h-h*scale)/2),('width',w*scale),('height',h*scale)]:image.set(k,str(v))
 root.set('data-banner-option',slug);p=OUT/(slug+'.svg');p.write_text(E.tostring(root,encoding='unicode'))
 subprocess.run(['rsvg-convert','-w','1500','-o',str(p.with_suffix('.png')),str(p)],check=True)
 board+=H.rect(0,i*610,1600,610,'#eae6de')+H.txt(30,i*610+42,title,27,'#242226','Space Grotesk',700)+f'<image x="30" y="{i*610+80}" width="1540" height="513.333" href="data:image/svg+xml;base64,{base64.b64encode(p.read_bytes()).decode()}"/>'
(OUT/'comparison.svg').write_text(H.svg(board,1600,1220,'Solid Patrick mark with contrasting waveform'))
subprocess.run(['rsvg-convert','-o',str(OUT/'comparison.png'),str(OUT/'comparison.svg')],check=True)
items=''.join(f'<article><h2>{title}</h2><img src="{slug}.png" alt="{title}"><p><a href="{slug}.svg">Editable SVG</a> · <a href="{slug}.png">PNG</a></p></article>' for slug,title,*_ in OPTIONS)
(OUT/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patrick two-color banner logos</title><style>body{margin:0;padding:32px;background:#161616;color:#f3f0ed;font:17px/1.5 system-ui}img{width:100%}a{color:#66ff00}article{margin:40px 0}</style><a href="../../../../">Brand gallery</a><h1>Solid mark + contrasting waveform</h1><p>PF, brackets, slash and dot use one solid color; the waveform uses the other. Both drafts keep the smaller size, without colored offsets. The main banner remains unchanged.</p>'+items+'</html>')
print('Two solid mark / contrasting waveform drafts generated.')
