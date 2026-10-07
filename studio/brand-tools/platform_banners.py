"""Render platform crops from approved editable SVG masters without changing them."""
from pathlib import Path
import copy, hashlib, json, os, subprocess, xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parent
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)

def render(brand):
    dest = ROOT.parent / 'brands' / brand
    source = dest / 'social/banner-x-bluesky.svg'
    master = ET.fromstring(source.read_text())
    sw, sh = map(float, master.attrib['viewBox'].split()[2:])
    scale = min(1200 / sw, 400 / sh)
    width, height = sw * scale, sh * scale
    canvas = ET.Element(f'{{{NS}}}svg', width='2560', height='1440', viewBox='0 0 2560 1440', role='img')
    ET.SubElement(canvas, f'{{{NS}}}title').text = f'{brand} YouTube banner — approved artwork within mobile safe area'
    color = '#8b5cf6' if brand == 'subcult' else '#282a36'
    ET.SubElement(canvas, f'{{{NS}}}rect', width='2560', height='1440', fill=color)
    group = ET.SubElement(canvas, f'{{{NS}}}g', transform=f'translate({(2560-width)/2:g} {(1440-height)/2:g}) scale({scale:g})')
    group.append(copy.deepcopy(master))
    svg = dest / 'social/banner-youtube.svg'
    ET.ElementTree(canvas).write(svg, encoding='utf-8', xml_declaration=True)
    env = dict(os.environ, FONTCONFIG_FILE=str(ROOT / 'fontconfig.xml'))
    subprocess.run(['inkscape', str(svg), '--export-type=png', '--export-filename='+str(svg.with_suffix('.png'))], env=env, check=True, capture_output=True)
    png = svg.with_suffix('.png')
    with Image.open(png) as image:
        assert image.size == (2560, 1440)
        image.crop((508, 509, 2052, 931)).save(dest/'social/banner-youtube-mobile-preview.png')
    assert png.stat().st_size < 6_000_000
    manifest_path = dest / 'asset-manifest.json'
    manifest = json.loads(manifest_path.read_text())
    paths = [svg, png, dest/'social/banner-youtube-mobile-preview.png']
    names = {str(p.relative_to(dest)) for p in paths}
    manifest['files'] = [r for r in manifest['files'] if r['path'] not in names]
    for path in paths:
        row = {'path':str(path.relative_to(dest)), 'bytes':path.stat().st_size, 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        if path.suffix == '.png':
            with Image.open(path) as image: row.update(width=image.width, height=image.height)
        manifest['files'].append(row)
    manifest['files'].sort(key=lambda row:row['path'])
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n')
    return {'brand':brand, 'source':str(source.relative_to(ROOT.parent)), 'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(), 'output':str(png.relative_to(ROOT.parent)), 'sha256':hashlib.sha256(png.read_bytes()).hexdigest(), 'dimensions':[2560,1440], 'content_box':[(2560-width)/2,(1440-height)/2,width,height], 'safe_area':[508,509,1544,422]}

if __name__ == '__main__':
    receipts = [render(brand) for brand in ['subcult', 'patrick__eff']]
    (ROOT/'platform-banner-provenance.json').write_text(json.dumps(receipts, indent=2)+'\n')
    print(json.dumps(receipts, indent=2))
