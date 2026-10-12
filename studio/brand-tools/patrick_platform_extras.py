"""Native SVG layouts for Patrick's professional cover and Twitch surfaces."""
from pathlib import Path
import copy, hashlib, json, os, subprocess, xml.etree.ElementTree as ET
from xml.sax.saxutils import escape
from PIL import Image
ROOT=Path(__file__).resolve().parent
DEST=ROOT.parent/'brands/patrick__eff'
NS='http://www.w3.org/2000/svg'
ET.register_namespace('',NS)
env=dict(os.environ,FONTCONFIG_FILE=str(ROOT/'fontconfig.xml'))
outputs=[]
def export(name,svg):
 p=DEST/'social'/name;p.write_text(svg)
 subprocess.run(['inkscape',str(p),'--export-type=png','--export-filename='+str(p.with_suffix('.png'))],env=env,check=True,capture_output=True)
 outputs.extend([p,p.with_suffix('.png')])

export('banner-linkedin.svg','''<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396" role="img"><title>Patrick Fanella — full-stack and backend engineering</title><rect width="1584" height="396" fill="#282a36"/><path d="M0 96H260V300H336 M1240 72H1456V322H1584" fill="none" stroke="#bd93f9" stroke-width="5"/><circle cx="336" cy="300" r="10" fill="#21222c" stroke="#bd93f9" stroke-width="3"/><text x="400" y="136" fill="#f8f8f2" font-family="Space Grotesk" font-size="68" font-weight="700">Patrick Fanella</text><text x="400" y="205" fill="#50fa7b" font-family="Space Grotesk" font-size="35" font-weight="700">Full-stack &amp; backend engineering</text><text x="400" y="269" fill="#d7d7eb" font-family="JetBrains Mono" font-size="24">Go / TypeScript / React / PostgreSQL</text><text x="400" y="327" fill="#bd93f9" font-family="JetBrains Mono" font-size="24">patrickfanella.co</text></svg>''')

master=ET.fromstring((DEST/'social/banner-x-bluesky.svg').read_text())
canvas=ET.Element(f'{{{NS}}}svg',width='1920',height='1080',viewBox='0 0 1920 1080',role='img')
ET.SubElement(canvas,f'{{{NS}}}title').text='Patrick__eff offline — Software. Sound. Culture.'
ET.SubElement(canvas,f'{{{NS}}}rect',width='1920',height='1080',fill='#282a36')
text=ET.SubElement(canvas,f'{{{NS}}}text',x='120',y='190',fill='#a5a6b5',attrib={'font-family':'JetBrains Mono','font-size':'28'});text.text='OFFLINE'
group=ET.SubElement(canvas,f'{{{NS}}}g',transform='translate(120 260) scale(1.12)');group.append(copy.deepcopy(master))
export('twitch-offline.svg',ET.tostring(canvas,encoding='unicode'))
for i,title in enumerate(['CHANNEL RULES','DISCORD','SOCIALS','SUPPORT','SETUP']):
 export('twitch-panel-'+title.lower().replace(' ','-')+'.svg',f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96" role="img"><title>{escape(title)}</title><rect width="320" height="96" fill="#282a36"/><path d="M16 26H38V68H304" stroke="#bd93f9" stroke-width="3" fill="none"/><circle cx="16" cy="26" r="6" fill="#21222c" stroke="#bd93f9" stroke-width="2"/><text x="56" y="49" fill="#f8f8f2" font-family="Space Grotesk" font-size="26" font-weight="700">{escape(title)}</text><circle cx="304" cy="68" r="6" fill="#50fa7b"/></svg>''')
manifest_path=DEST/'asset-manifest.json';manifest=json.loads(manifest_path.read_text())
names={str(p.relative_to(DEST)) for p in outputs}
manifest['files']=[x for x in manifest['files'] if x['path'] not in names]
for p in outputs:
 row={'path':str(p.relative_to(DEST)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 if p.suffix=='.png':
  with Image.open(p) as image:row.update(width=image.width,height=image.height)
 manifest['files'].append(row)
manifest['files'].sort(key=lambda x:x['path']);manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported LinkedIn cover, Twitch offline art and five panel headers')
