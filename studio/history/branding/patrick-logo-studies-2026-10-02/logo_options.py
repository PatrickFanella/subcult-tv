"""Original PF development studies; these do not select a replacement logo."""
from pathlib import Path
import hashlib
import json
import subprocess
import xml.etree.ElementTree as ET
from PIL import Image,ImageDraw,ImageFont

HERE=Path(__file__).resolve().parent
OUT=HERE/'logo-options'
INK='#f8f8f2';BG='#282a36';PURPLE='#bd93f9';PINK='#ff79c6';GREEN='#50fa7b'


def svg(body,title,color=INK):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img"><title>{title}</title><g fill="{color}">{body}</g></svg>'


def main():
    OUT.mkdir(exist_ok=True)
    baseline=(HERE/'assets/mark-light.svg').read_text()
    # A shared top rail joins the two initial forms; counters stay open at small sizes.
    rail=(f'<path fill-rule="evenodd" d="M72 96H248C310 96 342 134 342 192S310 288 248 288H124V416H72ZM124 148V236H246C274 236 290 220 290 192S274 148 246 148Z"/>'
          '<path d="M332 96H444V148H384V236H438V288H384V416H332Z"/>')
    # Two letter routes share a junction and use terminal pads as part of the mark.
    patch=(f'<g fill="none" stroke="{INK}" stroke-width="38" stroke-linejoin="round" stroke-linecap="square">'
           '<path d="M108 414V104H230Q288 104 288 162V186Q288 244 230 244H108"/>'
           '<path d="M336 414V104H436M336 244H422"/></g>'
           f'<circle cx="108" cy="414" r="27" fill="{GREEN}"/><circle cx="436" cy="104" r="27" fill="{PURPLE}"/>'
           f'<circle cx="422" cy="244" r="27" fill="{PINK}"/>')
    # Compact block PF: a single panel split into letters by an open central channel.
    block=('<path fill-rule="evenodd" d="M64 96H248V280H120V416H64ZM120 152V224H192V152Z"/>'
           '<path d="M284 96H448V152H340V224H428V280H340V416H284Z"/>')
    options=[('a-current','A / Open frame','Keeps your current brackets, slash and PF silhouette.',baseline),
             ('b-rail','B / Shared rail','Joins the initials across one top rail; a tighter, solid monogram.',svg(rail,'PF shared-rail monogram')),
             ('c-patch','C / Patch terminals','Draws PF as two signal paths, with colored connector terminals.',svg(patch,'PF routing monogram with three connector terminals')),
             ('d-block','D / Block initials','Square construction with open counters; the strongest small-size option.',svg(block,'PF block monogram'))]
    entries=[]
    board=Image.new('RGB',(1600,1280),BG);draw=ImageDraw.Draw(board)
    fonts=HERE.parent/'2026-10-01-packs/brands/patrick__eff/fonts'
    heading=ImageFont.truetype(str(fonts/'Space-Grotesk-1.ttf'),28)
    label=ImageFont.truetype(str(fonts/'JetBrains-Mono-0.ttf'),16)
    draw.text((40,24),'PATRICK__EFF / LOGO DEVELOPMENT',font=heading,fill=INK)
    draw.text((40,68),'Four directions. A remains current until you choose a replacement.',font=label,fill=GREEN)
    for i,(name,title,description,source) in enumerate(options):
        path=OUT/f'{name}.svg';path.write_text(source+'\n');ET.parse(path)
        subprocess.run(['rsvg-convert',str(path),'-o',str(path.with_suffix('.png'))],check=True)
        # The mono treatment helps compare actual shape independently from accents.
        root=ET.fromstring(source)
        for node in root.iter():
            for key,value in list(node.attrib.items()):
                for accent in [PURPLE,PINK,GREEN]:value=value.replace(accent,INK)
                node.set(key,value)
        mono=OUT/f'{name}-mono.svg';mono.write_text(ET.tostring(root,encoding='unicode')+'\n')
        subprocess.run(['rsvg-convert',str(mono),'-o',str(mono.with_suffix('.png'))],check=True)
        x=40+(i%2)*800;y=132+(i//2)*568
        draw.rectangle((x,y,x+760,y+536),fill='#21222c')
        with Image.open(path.with_suffix('.png')) as image:
            image=image.convert('RGBA');image.thumbnail((380,380));board.paste(image,(x+190,y+26),image)
            small=image.resize((48,48));board.paste(small,(x+650,y+430),small)
        draw.text((x+28,y+432),title,font=heading,fill=INK)
        # Wrap explanations explicitly for the board.
        words=description.split();lines=['']
        for word in words:
            if len(lines[-1])+len(word)>61:lines.append('')
            lines[-1]+=(' ' if lines[-1] else '')+word
        for j,line in enumerate(lines):draw.text((x+28,y+478+j*22),line,font=label,fill='#a5a6b5')
        entries.append({'id':name,'title':title,'description':description,'status':'current' if i==0 else 'unselected study'})
    board.save(OUT/'comparison.png')
    gallery=''.join(f'<article><h2>{item["title"]}</h2><p>{item["description"]}</p><div class="marks"><img src="{item["id"]}.png" alt="{item["title"]} color treatment"><img src="{item["id"]}-mono.png" alt="{item["title"]} monochrome treatment"></div><p><img class="tiny" src="{item["id"]}.png" alt="48 pixel size preview"> 48px preview</p><p><a href="{item["id"]}.svg" download>SVG</a> · <a href="{item["id"]}.png" download>PNG</a></p></article>' for item in entries)
    (OUT/'index.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patrick__Eff logo development</title><style>body{margin:0;background:#282a36;color:#f8f8f2;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:32px}h1{font-size:clamp(32px,5vw,64px)}a{color:#bd93f9}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}article{padding:24px;background:#21222c;border:1px solid #44475a}.marks{display:flex;gap:16px}.marks img{width:calc(50% - 8px);height:auto}.tiny{width:48px;height:48px;vertical-align:middle}a:focus-visible{outline:3px solid #50fa7b;outline-offset:4px}@media(max-width:700px){.grid{grid-template-columns:1fr}main{padding:16px}}</style><main><p><a href="../index.html">← Selected design system</a></p><h1>PF, four ways.</h1><p>A carries the current mark. B, C and D are new studies. Each is shown in color, monochrome and at 48 pixels.</p><div class="grid">'+gallery+'</div><p><a href="comparison.png">Open comparison board</a></p></main></html>\n')
    manifest={'selected_logo':'a-current','options':entries,'files':[{'path':str(p.relative_to(OUT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(OUT.iterdir()) if p.is_file() and p.name!='manifest.json']}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Logo studies: preserved baseline plus three new options; no new logo selected.')


if __name__=='__main__':main()
