from pathlib import Path
import argparse,html,json,re,shutil,hashlib,subprocess,os
import xml.etree.ElementTree as ET
p=argparse.ArgumentParser(description='Bootstrap a brand pack with editable layouts, tokens and source records.')
p.add_argument('config',type=Path);p.add_argument('output',type=Path);p.add_argument('--render',action='store_true',help='Render PNGs with rsvg-convert and local fonts.');a=p.parse_args()
b=json.loads(a.config.read_text());c=b['colors'];f=b['fonts']
for k in ['name','initials','tagline','website']:
 if not isinstance(b[k],str) or not b[k].strip():raise SystemExit('Missing '+k)
if len(b['name'])>24 or len(b['tagline'])>48 or len(b['initials'])>3:raise SystemExit('Use a name up to 24 characters, a tagline up to 48 and initials up to 3; refine long copy in the SVG editor.')
for k in ['background','text','accent','secondary']:
 if not re.fullmatch(r'#[0-9a-fA-F]{6}',c[k]):raise SystemExit('Invalid hex color: '+k)
def lum(hex):
 v=[int(hex[i:i+2],16)/255 for i in [1,3,5]];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in v];return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))
def ratio(x,y):
 z=sorted([lum(x),lum(y)]);return (z[1]+.05)/(z[0]+.05)
if ratio(c['text'],c['background'])<4.5:raise SystemExit('Text/background contrast must be at least 4.5:1.')
if a.output.exists():raise SystemExit('Output already exists; choose a new directory.')
a.output.mkdir(parents=True);src=Path(__file__).resolve().parent;shutil.copytree(src/'fonts',a.output/'fonts')
(a.output/'fontconfig.xml').write_text('<?xml version="1.0"?><fontconfig><dir>'+str((a.output/'fonts').resolve())+'</dir><cachedir>'+str((a.output/'.font-cache').resolve())+'</cachedir></fontconfig>')
def text(x,y,s,size,font,color=None,weight=400):
 size=min(size,(w-x-max(32,w*.07))/max(len(s)*.75,1))
 return f'<text x="{x}" y="{y}" fill="{color or c["text"]}" font-family="{html.escape(font,quote=True)}" font-size="{size}" font-weight="{weight}">{html.escape(s)}</text>'
def rect(x,y,w,h,col):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}"/>'
formats={'logos/lockup':(1200,300),'logos/mark':(512,512),'social/banner':(1500,500),'social/banner-tall':(1500,600),'social/square-post':(1080,1080),'social/landscape-post':(1600,900),'social/story':(1080,1920),'social/quote':(1080,1080),'social/release':(1080,1080),'social/screenshot-frame':(1600,1000),'video/title-card':(1920,1080),'video/thumbnail':(1920,1080),'video/end-card':(1920,1080),'video/lower-third':(1920,1080)}
for name,(w,h) in formats.items():
 if name.endswith('lower-third'):
  s=rect(96,820,1728,175,c['background'])+rect(96,820,10,175,c['accent'])+text(132,892,'TITLE / SPEAKER',46,f['display'],weight=700)+text(132,952,'A short line of context.',30,f['body'])
 elif name.startswith('logos/'):
  if name.endswith('mark'):s=text(64,337,b['initials'],192,f['display'],c['accent'],700)
  else:s=text(60,192,b['name'],104,f['display'],c['text'],700)
 else:
  mx=w*.07;size=min(w*.085,96);top=300 if name.endswith('story') else h*.30
  s=rect(0,0,w,h,c['background'])+rect(mx,top-100,w-mx*2,4,c['accent'])+text(mx,top,b['name'],size,f['display'],weight=700)+text(mx,top+size*.8,b['tagline'],size*.4,f['body'])
  if name.endswith('quote'):s+=text(mx,h*.65,'Exact quote / attribution / source',30,f['body'])
  elif name.endswith('release'):s+=text(mx,h*.65,'Verified change / useful consequence',30,f['body'])
  elif name.endswith('screenshot-frame'):
   s+=f'<rect x="{mx}" y="430" width="{w-2*mx}" height="330" fill="none" stroke="{c["accent"]}" stroke-width="2"/>'+text(mx+24,610,'Place a verified screenshot here.',30,f['body'])
  s+=text(mx,min(h*.86,1650),b['website'],size*.26,f['label'])
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+str(w)+' '+str(h)+'"><title>'+html.escape(b['name']+' '+name)+'</title>'+s+'</svg>'
 path=a.output/(name+'.svg');path.parent.mkdir(parents=True,exist_ok=True);path.write_text(svg);ET.parse(path)
 if a.render:subprocess.run(['rsvg-convert','-w',str(w),'-o',str(path.with_suffix('.png')),str(path)],check=True,env=dict(os.environ,FONTCONFIG_FILE=str((a.output/'fontconfig.xml').resolve())))
(a.output/'brand.json').write_text(json.dumps(b,indent=2));(a.output/'tokens.json').write_text(json.dumps({'colors':c,'fonts':f,'spacing':[8,16,24,32,48,64,96],'text_contrast':round(ratio(c['text'],c['background']),2)},indent=2))
(a.output/'tokens.css').write_text(':root {\n'+''.join('  --brand-'+k+': '+v+';\n' for k,v in c.items())+'}\n')
(a.output/'source-register.json').write_text(json.dumps({'status':'starter','mark':b['mark_status'],'assets':[],'required_fields':['path','source','creator','rights','verified_at','intended_use']},indent=2))
(a.output/'GUIDE.md').write_text('# '+b['name']+' starter\n\nReplace the temporary initials with an original mark. Set clear space and minimum sizes. Check all layouts for text fitting, crop behavior and contrast before export. Keep product claims and source records with their assets. Add alt text to finished images.\n\nComplete the [marketing starter](marketing/README.md) alongside the visual identity. Product name and destination are prefilled; research, claims, pricing and campaign decisions still need evidence.\n\nSuggested minimum mark width: 32 pixels; clear space: one quarter of the mark height. Story content stays between y=250 and y=1670. Video templates use a 96-pixel outer margin.\n')
shutil.copytree(src/'marketing',a.output/'marketing')
for q in (a.output/'marketing').glob('*.md'):
 body=q.read_text().replace('{{PRODUCT}}',b['name']).replace('{{NAME_AND_URL}}',b['name']+' — '+b['website']).replace('{{BRAND_TOKEN_REFERENCE}}','../tokens.json')
 q.write_text(body)
files=[]
for q in a.output.rglob('*'):
 if q.is_file() and '.font-cache' not in q.parts:files.append({'path':str(q.relative_to(a.output)),'sha256':hashlib.sha256(q.read_bytes()).hexdigest(),'bytes':q.stat().st_size})
(a.output/'asset-manifest.json').write_text(json.dumps({'status':'starter','brand':b['name'],'files':files},indent=2));print(a.output)
