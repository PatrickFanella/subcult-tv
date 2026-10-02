from pathlib import Path
import base64,copy,itertools,json,os,re,subprocess,xml.etree.ElementTree as E
import design_helpers as H
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
OUT=R/'brands/patrick__eff/social/banner-color-options';OUT.mkdir(exist_ok=True)
SOURCE=E.parse(R/'references/patrick-banner-options-base.svg').getroot()
COLORS={'green':'#66ff00','purple':'#8a00c7','white':'#f3f0ed'}
OPTIONS=[('solid-'+n,'Solid '+n,[n,n,n],True) for n in COLORS]
OPTIONS += [('mix-'+'-'.join(ns),' / '.join(ns),list(ns),False) for ns in itertools.permutations(COLORS)]
board='';records=[]
for i,(slug,title,names,solid) in enumerate(OPTIONS):
 root=copy.deepcopy(SOURCE);image=next(e for e in root.iter() if e.get('id')=='image1')
 x,y,w,h=[float(image.get(k)) for k in ['x','y','width','height']]
 scale=.62
 for k,v in [('x',x+(w-w*scale)/2),('y',y+(h-h*scale)/2),('width',w*scale),('height',h*scale)]:image.set(k,str(v))
 raw=(R/'references/patrick-variations/mono-outlined.svg').read_text() if solid else base64.b64decode(image.get('href').split(',',1)[1]).decode()
 mapping=dict(zip(['#f3f0ed','#8a00c7','#66ff00'],[COLORS[n] for n in names]))
 raw=re.sub(r'#[0-9a-fA-F]{6}',lambda m:mapping.get(m.group().lower(),m.group()),raw)
 image.set('href','data:image/svg+xml;base64,'+base64.b64encode(raw.encode()).decode())
 root.set('data-banner-color-option',slug);path=OUT/(slug+'.svg');path.write_text(E.tostring(root,encoding='unicode'))
 subprocess.run(['rsvg-convert','-w','1500','-o',str(path.with_suffix('.png')),str(path)],check=True)
 x=(i%3)*800;y=(i//3)*340
 board+=H.rect(x,y,800,340,'#eae6de')+H.txt(x+20,y+32,chr(65+i)+' / '+title,21,'#242226','Space Grotesk',700)+f'<image x="{x+20}" y="{y+60}" width="760" height="253.333" href="data:image/svg+xml;base64,{base64.b64encode(path.read_bytes()).decode()}"/>'
 records.append({'option':chr(65+i),'slug':slug,'face':names[0],'upper_right':names[1],'lower_left_and_dot':names[2],'scale':scale,'solid':solid})
(OUT/'comparison.svg').write_text(H.svg(board,2400,1020,'Patrick banner: three solids and six color permutations'))
subprocess.run(['rsvg-convert','-o',str(OUT/'comparison.png'),str(OUT/'comparison.svg')],check=True)
(OUT/'options.json').write_text(json.dumps(records,indent=2)+'\n')
items=''.join(f'<article><h2>{chr(65+i)} / {title}</h2><img src="{slug}.png" alt="Patrick banner with {title} logo"><p><a href="{slug}.svg">Editable SVG</a> · <a href="{slug}.png">PNG</a></p></article>' for i,(slug,title,*_) in enumerate(OPTIONS))
(OUT/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patrick banner color options</title><style>body{margin:0;background:#161616;color:#f3f0ed;font:17px/1.5 system-ui}header{padding:24px 32px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(500px,1fr));gap:28px;padding:32px}img{width:100%}a{color:#66ff00}h2{font-size:23px}@media(max-width:600px){.grid{grid-template-columns:1fr;padding:16px}}</style><header><a href="../../../../">Brand gallery</a><h1>Patrick banner: nine color options</h1><p>All logos use the smaller size from C at full opacity. Single-color versions use the existing simplified monochrome mark.</p><p>Three-color labels read: face / upper-right offset / lower-left offset and dot. White means the brand’s muted warm white.</p><p>These are comparison drafts; the main banner remains unchanged.</p></header><main class="grid">'+items+'</main></html>')
print('Three solid colors and six distinct permutations generated.')
