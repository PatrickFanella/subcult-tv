"""Export SUBCULT Twitch offline artwork and panel headers in its approved branding."""
from pathlib import Path
import copy, hashlib, json, os, subprocess, xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parent
DEST=ROOT.parent/'brands/subcult'
NS='http://www.w3.org/2000/svg'
ET.register_namespace('',NS)
master=ET.parse(DEST/'social/banner-x-bluesky.svg').getroot()
canvas=ET.Element(f'{{{NS}}}svg',width='1920',height='1080',viewBox='0 0 1920 1080',role='img')
ET.SubElement(canvas,f'{{{NS}}}title').text='SUBCULT offline — Build Together'
ET.SubElement(canvas,f'{{{NS}}}rect',width='1920',height='1080',fill='#8b5cf6')
ET.SubElement(canvas,f'{{{NS}}}text',x='120',y='190',fill='#100b19',attrib={'font-family':'JetBrains Mono','font-size':'28'}).text='OFFLINE'
ET.SubElement(canvas,f'{{{NS}}}g',transform='translate(120 260) scale(1.12)').append(copy.deepcopy(master))
p=DEST/'social/twitch-offline.svg';p.write_text(ET.tostring(canvas,encoding='unicode'))
subprocess.run(['inkscape',str(p),'--export-type=png','--export-filename='+str(p.with_suffix('.png'))],env=dict(os.environ,FONTCONFIG_FILE=str(ROOT/'fontconfig.xml')),check=True,capture_output=True)
outputs=[p,p.with_suffix('.png')]
for slug,title in [('about-subcult','ABOUT SUBCULT'),('find-us','FIND US'),('support','SUPPORT')]:
 q=DEST/('social/twitch-panel-'+slug+'.svg')
 q.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96" role="img"><title>{title}</title><rect width="320" height="96" fill="#8b5cf6"/><rect x="16" y="16" width="6" height="64" fill="#00ff88"/><text x="36" y="59" font-family="Oswald" font-size="30" font-weight="700" fill="#100b19">{title}</text><path d="M36 76H304" stroke="#100b19" stroke-width="2"/><rect x="288" y="16" width="16" height="16" fill="#00ff88"/></svg>')
 subprocess.run(['inkscape',str(q),'--export-type=png','--export-filename='+str(q.with_suffix('.png'))],env=dict(os.environ,FONTCONFIG_FILE=str(ROOT/'fontconfig.xml')),check=True,capture_output=True)
 outputs.extend([q,q.with_suffix('.png')])
mp=DEST/'asset-manifest.json';m=json.loads(mp.read_text());names={str(x.relative_to(DEST)) for x in outputs};m['files']=[x for x in m['files'] if x['path'] not in names]
for x in outputs:
 row={'path':str(x.relative_to(DEST)),'bytes':x.stat().st_size,'sha256':hashlib.sha256(x.read_bytes()).hexdigest()}
 if x.suffix=='.png':
  with Image.open(x) as im:row.update(width=im.width,height=im.height)
 m['files'].append(row)
m['files'].sort(key=lambda x:x['path']);mp.write_text(json.dumps(m,indent=2)+'\n')
files=[ROOT/'subcult_platform_extras.py',DEST/'social/banner-x-bluesky.svg',*outputs]
(ROOT/'subcult-platform-provenance.json').write_text(json.dumps({'method':'Approved SUBCULT native SVG wrapped on a 1920x1080 Twitch offline canvas, plus 320x96 panel headers using the approved colors and Oswald typeface; exported with Inkscape.','files':[{'path':str(x.relative_to(ROOT.parent)),'sha256':hashlib.sha256(x.read_bytes()).hexdigest()} for x in files]},indent=2)+'\n')
print('SUBCULT Twitch offline artwork, panel headers, manifest and provenance saved')
