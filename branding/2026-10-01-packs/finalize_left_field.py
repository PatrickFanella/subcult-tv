"""Build Left Field web exports, validate the pack and refresh its manifest/ZIP."""
from pathlib import Path
import hashlib
import json
import os
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from PIL import Image

ROOT = Path(__file__).resolve().parent
PACK = ROOT / 'brands/left-field'
os.environ['FONTCONFIG_FILE'] = str(ROOT / 'fontconfig.xml')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    product = PACK / 'product'
    product.mkdir(exist_ok=True)
    # Write plain <svg> elements; a prefixed root (ns0:svg) is rejected by browsers' icon loaders and by Next.
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    mark = (PACK / 'logos/mark-primary.svg').read_text()
    favicon = ET.fromstring(mark)
    # Crop the generous export margin for the small browser icon.
    favicon.set('viewBox', '58 58 140 140')
    favicon.set('width', '64')
    favicon.set('height', '64')
    (product / 'favicon.svg').write_text(ET.tostring(favicon, encoding='unicode'))
    avatar = PACK / 'social/avatar.svg'
    for name, width in [('apple-touch-icon.png',180), ('icon-192.png',192), ('icon-512.png',512)]:
        subprocess.run(['rsvg-convert','-w',str(width),'-o',str(product/name),str(avatar)],check=True)
    banner=ET.parse(PACK/'social/banner-x-bluesky.svg')
    banner.getroot().set('width','1200')
    banner.getroot().set('height','630')
    banner.getroot().set('viewBox','0 0 1200 630')
    ns='{http://www.w3.org/2000/svg}'
    # Extend the paper field and center the banner artwork on a share-card canvas.
    group=ET.Element(ns+'g',{'transform':'translate(0 115)'})
    for child in list(banner.getroot()):
        banner.getroot().remove(child)
        group.append(child)
    banner.getroot().append(ET.Element(ns+'rect',{'width':'1200','height':'630','fill':'#f4f0e6'}))
    banner.getroot().append(group)
    banner.write(product/'og.svg',encoding='unicode')
    subprocess.run(['rsvg-convert','-o',str(product/'og.png'),str(product/'og.svg')],check=True)
    with Image.open(product/'og.png') as im:
        im.convert('RGB').save(product/'og.jpg',quality=90)
    hero=ET.parse(product/'og.svg')
    hero.getroot().set('width','1600')
    hero.getroot().set('height','1000')
    hero.getroot().set('viewBox','0 0 1200 750')
    hero.getroot().find(ns+'rect').set('height','750')
    hero.getroot().find(ns+'g').set('transform','translate(0 175)')
    hero.write(product/'hero.svg',encoding='unicode')
    subprocess.run(['rsvg-convert','-o',str(product/'hero.png'),str(product/'hero.svg')],check=True)
    subprocess.run(['inkscape',str(product/'hero.svg'),'--export-text-to-path',
                    '--export-plain-svg','--export-type=svg',
                    '--export-filename='+str(product/'hero-outlined.svg')],check=True,capture_output=True)
    (product/'README.md').write_text('# Left Field — Web assets\n\nApproved LF favicon, 180-pixel Apple touch icon, 192/512-pixel app icons and\na 1200×630 share card and a 1600×1000 hero illustration. These exports derive from the pack logo and banner\nmasters. Installing them in Left Field is a separate implementation step.\n')
    guide=PACK/'GUIDE.md'
    text=guide.read_text().replace('Selected direction:', 'Approved direction:')
    text += '\n## Rebuild this pack\n\nFrom `branding/2026-10-01-packs/`:\n\n```bash\nBRAND_ONLY=left-field python build_packs.py\nBRAND_ONLY=left-field python render_video_previews.py\npython finalize_left_field.py\n```\n\nThe final step creates web exports, validates the assets and refreshes the\nmanifest and `left-field.zip`. Rebuild only this brand to preserve unrelated\nmasters and exports. Source observations are in `source-provenance.json`.\n'
    # Avoid duplicating the rebuild section during repeat finalization.
    first=text.index('\n## Rebuild this pack')
    last=text.rindex('\n## Rebuild this pack')
    guide.write_text(text[:first]+text[last:])
    svgs=list(PACK.rglob('*.svg'))
    for path in svgs:
        ET.parse(path)
        if path.name.endswith('-outlined.svg'):
            assert not any(el.tag.endswith('text') for el in ET.parse(path).getroot().iter()), path
    pngs=list(PACK.rglob('*.png'))
    for path in pngs:
        with Image.open(path) as im:
            im.verify()
    with Image.open(PACK/'video/lower-third.png') as im:
        assert im.mode=='RGBA' and im.getpixel((0,0))[3]==0
    for name,size in [('social/banner-x-bluesky.png',(1500,500)),('social/avatar.png',(512,512)),('social/square-post.png',(1080,1080)),('social/story-template.png',(1080,1920)),('product/og.png',(1200,630))]:
        with Image.open(PACK/name) as im:
            assert im.size==size, (name,im.size)
    video=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(PACK/'video/template-preview.mp4')]))
    stream=video['streams'][0]
    assert stream['codec_name']=='h264' and (stream['width'],stream['height'])==(1920,1080)
    assert abs(float(video['format']['duration'])-8)<0.1
    def luminance(color):
        rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
        return sum((v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4)*w for v,w in zip(rgb,(.2126,.7152,.0722)))
    def contrast(a,b):
        lo,hi=sorted([luminance(a),luminance(b)])
        return (hi+.05)/(lo+.05)
    ratios={'ink_on_paper':contrast('#16221f','#f4f0e6'),'rust_on_paper':contrast('#a33c26','#f4f0e6'),'ink_on_wash':contrast('#16221f','#e5eadc')}
    assert min(ratios.values())>=4.5
    (PACK/'verification.json').write_text(json.dumps({'svg_parse':'passed','svg_count':len(svgs),'png_count':len(pngs),'outlined_logo_text':'none','lower_third_transparency':'passed','contrast':ratios,'video':{'codec':'h264','width':1920,'height':1080,'duration_seconds':float(video['format']['duration'])}},indent=2)+'\n')
    entries=[]
    for path in sorted(PACK.rglob('*')):
        if not path.is_file() or path.name=='asset-manifest.json':
            continue
        item={'path':str(path.relative_to(PACK)),'sha256':digest(path),'bytes':path.stat().st_size}
        if path.suffix=='.png':
            with Image.open(path) as im:
                item.update(width=im.width,height=im.height,mode=im.mode)
        entries.append(item)
    (PACK/'asset-manifest.json').write_text(json.dumps({'brand':'Left Field','direction':'The field ledger','status':'user-approved local production pack v1','files':entries},indent=2)+'\n')
    with zipfile.ZipFile(ROOT/'left-field.zip','w',zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(PACK.rglob('*')):
            if path.is_file():
                archive.write(path,path.relative_to(PACK))
    with zipfile.ZipFile(ROOT/'left-field.zip') as archive:
        assert archive.testzip() is None
    print(f'Left Field: {len(entries)} manifested assets; SVG, PNG, contrast, video and ZIP checks passed.')


if __name__ == '__main__':
    main()
