from pathlib import Path
import base64,copy,os,subprocess,xml.etree.ElementTree as E
import design_helpers as H
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
OUT=R/'brands/patrick__eff/social/banner-options';OUT.mkdir(exist_ok=True)
SOURCE=E.parse(R/'references/patrick-banner-options-base.svg').getroot()
OPTIONS=[('a-faded','A / Faded color',.35,1,False),('b-monochrome','B / Muted monochrome',.75,1,True),('c-smaller','C / Smaller color',1,.62,False),('d-small-mono','D / Smaller monochrome',.75,.62,True)]
board=''
for i,(slug,title,opacity,scale,mono) in enumerate(OPTIONS):
 root=copy.deepcopy(SOURCE);image=next(e for e in root.iter() if e.get('id')=='image1')
 image.set('opacity',str(opacity))
 if scale!=1:
  x,y,w,h=[float(image.get(k)) for k in ['x','y','width','height']]
  for k,v in [('x',x+(w-w*scale)/2),('y',y+(h-h*scale)/2),('width',w*scale),('height',h*scale)]:image.set(k,str(v))
 if mono:
  for key in ['href','{http://www.w3.org/1999/xlink}href']:
   if key in image.attrib:
    raw=base64.b64decode(image.get(key).split(',',1)[1]).decode()
    for color,tone in [('#f3f0ed','#aaa6b1'),('#8a00c7','#57545d'),('#66ff00','#77737e')]:raw=raw.replace(color,tone)
    image.set(key,'data:image/svg+xml;base64,'+base64.b64encode(raw.encode()).decode())
 root.set('data-banner-option',slug);path=OUT/(slug+'.svg');path.write_text(E.tostring(root,encoding='unicode'))
 subprocess.run(['rsvg-convert','-w','1500','-o',str(path.with_suffix('.png')),str(path)],check=True)
 x=(i%2)*900;y=(i//2)*390
 board+=H.rect(x,y,900,390,'#eae6de')+H.txt(x+24,y+38,title,23,'#242226','Space Grotesk',700)+f'<image x="{x+24}" y="{y+65}" width="852" height="284" href="data:image/svg+xml;base64,{base64.b64encode(path.read_bytes()).decode()}"/>'
(OUT/'comparison.svg').write_text(H.svg(board,1800,780,'Patrick banner logo prominence options'))
subprocess.run(['rsvg-convert','-o',str(OUT/'comparison.png'),str(OUT/'comparison.svg')],check=True)
items=''.join(f'<article><h2>{title}</h2><img src="{slug}.png" alt="Patrick banner: {title}"><p><a href="{slug}.svg">Editable SVG</a> · <a href="{slug}.png">PNG</a></p></article>' for slug,title,*_ in OPTIONS)
(OUT/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patrick banner logo options</title><style>body{margin:0;background:#161616;color:#f3f0ed;font:17px/1.5 system-ui}header{padding:24px 32px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(500px,1fr));gap:28px;padding:32px}img{width:100%}a{color:#66ff00}h2{font-size:23px}@media(max-width:600px){.grid{grid-template-columns:1fr;padding:16px}}</style><header><a href="../../../../">Brand gallery</a><h1>Patrick banner: quieter logo options</h1><p>Four banner-only drafts. The main banner and logo elsewhere retain their current design.</p><p>D reduces both size and color emphasis; C keeps the colored mark at a smaller size.</p></header><main class="grid">'+items+'</main></html>')
print('Four banner-only options generated.')
