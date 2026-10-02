from pathlib import Path
import os,sys,json,subprocess,base64
R=Path(__file__).resolve().parent
os.environ['FONTCONFIG_FILE']=str(R/'fontconfig.xml')
import design_helpers as H
D=R/'brands/patchwork';d=next(x for x in json.loads((R/'brands.json').read_text()) if x['slug']=='patchwork')
s=H.rect(0,0,1200,710,d['bg'])+H.patch_paper(1200,710)+H.patchwork_mark(d,48,48,140)+H.txt(222,112,'A little help, from a friend.',45,d['fg'],'Fraunces',700,maxw=915)+H.txt(222,161,'Paper grain, woven patches and hand stitches',24,d['fg'],'Public Sans')
for x,label,color in [(48,'HELP A NEIGHBOUR',d['accent']),(628,'PASS IT ON',d['action_tomato'])]:s+=H.stitched_patch(x,250,520,88,color,d['bg'],True)+H.txt(x+28,303,label,24,d['bg'],'Public Sans',700)
for i,name in enumerate(['buttons','needle-thread','spool']):s+=f'<image x="{48+i*180}" y="400" width="128" height="128" href="data:image/svg+xml;base64,{base64.b64encode((D/'decorative'/(name+'.svg')).read_bytes()).decode()}"/>'
s+=H.txt(48,610,'Optional sewing details / editable vector assets',23,d['fg'],'Public Sans')
p=D/'components-preview.svg';p.write_text(H.svg(s,1200,710,'Patchwork tactile component preview'));subprocess.run(['rsvg-convert','-o',str(p.with_suffix('.png')),str(p)],check=True)
