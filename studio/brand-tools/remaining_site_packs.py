"""Build the remaining product packs without regenerating existing Studio identities.

Run from the repository root with --only SLUG or --all. Product-owned masters
are snapshotted with hashes; original marks are geometric SVG, never traced art.
"""
import argparse
import hashlib
import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image
import site_packs as pack

ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / 'remaining-site-packs.json').read_text())
pack.CONFIG['fonts'].update(CONFIG['fonts'])


def science_reel(p, ink, accent, secondary):
    return (pack.rect(48, 64, 416, 384, rx=32, stroke=ink, sw=24)
            + ''.join(pack.rect(x, y, 40, 28, fill=secondary) for x in (88, 384) for y in (112, 372))
            + pack.path('M216 128H296M232 128V236L160 352Q152 376 184 376H328Q360 376 352 352L280 236V128', stroke=ink, sw=24)
            + pack.path('M192 304H320', stroke=accent, sw=32) + pack.circle(264, 272, 14, fill=accent))


def broadcast_ledger(p, ink, accent, secondary):
    return (pack.path('M96 440H48V72H464V440H416', stroke=ink, sw=28)
            + pack.rect(112, 136, 288, 56, fill=accent)
            + pack.rect(112, 232, 224, 28, fill=ink) + pack.rect(112, 300, 288, 28, fill=ink)
            + pack.path('M112 404H400', stroke=secondary, sw=24)
            + pack.circle(256, 404, 30, fill=accent))


def archive_frame(p, ink, accent, secondary):
    return (pack.rect(56, 56, 400, 400, rx=24, stroke=ink, sw=28)
            + pack.path('M80 184H432M80 328H432', stroke=secondary, sw=24)
            + pack.rect(104, 104, 104, 24, fill=accent) + pack.rect(104, 380, 168, 24, fill=accent)
            + pack.path('M224 216L304 256L224 296Z', fill=ink))


def pamphlet(p, ink, accent, secondary):
    return (pack.path('M80 104L256 72L432 104V408L256 440L80 408Z M256 72V440', stroke=ink, sw=26)
            + pack.path('M112 160L208 144M112 216L208 200M304 152L400 168', stroke=secondary, sw=20)
            + pack.path('M224 264H288M224 344H288', stroke=accent, sw=32))


def cut_paste(p, ink, accent, secondary):
    return (pack.path('M64 96L360 64L416 344L112 384Z', fill=ink)
            + pack.path('M144 184L448 152L416 432L96 408Z', fill=accent)
            + pack.path('M80 320L400 224', stroke=secondary, sw=56)
            + pack.path('M176 128L184 176M240 120L248 168', stroke=accent, sw=20))


def constellation(p, ink, accent, secondary):
    return (pack.path('M104 120L256 256L408 120M256 256L136 400M256 256L400 392', stroke=ink, sw=20)
            + pack.path('M104 120L64 224M408 120L448 224M136 400L232 432', stroke=secondary, sw=16)
            + ''.join(pack.circle(x, y, rad, fill=color) for x, y, rad, color in
                      [(104, 120, 42, accent), (408, 120, 42, secondary), (256, 256, 60, ink),
                       (136, 400, 42, accent), (400, 392, 32, secondary), (64, 224, 20, accent),
                       (448, 224, 20, secondary), (232, 432, 20, accent)]))


def workbench(p, ink, accent, secondary):
    return (pack.rect(72, 224, 368, 56, fill=ink, rx=12)
            + pack.path('M112 280V424M400 280V424', stroke=ink, sw=28)
            + ''.join(pack.path(f'M{x} 192V104H{x+64}V192', stroke=accent, sw=24) for x in (96, 224, 352))
            + pack.path('M208 336H304', stroke=secondary, sw=24))


def signed_envelope(p, ink, accent, secondary):
    return (pack.rect(48, 104, 416, 280, rx=16, stroke=ink, sw=24)
            + pack.path('M64 128L256 264L448 128', stroke=ink, sw=24)
            + pack.rect(360, 144, 56, 64, fill=accent)
            + pack.path('M96 432Q144 360 184 416T264 416Q296 392 336 424H416', stroke=secondary, sw=24))


def relay_terminal(p, ink, accent, secondary):
    return (pack.rect(48, 88, 416, 336, stroke=ink, sw=24)
            + pack.path('M48 152H464', stroke=ink, sw=20)
            + pack.path('M104 216L152 256L104 296', stroke=accent, sw=28, cap='square')
            + pack.rect(176, 300, 72, 24, fill=accent)
            + ''.join(pack.rect(x, 232, 24, 48, fill=secondary) for x in (280, 328, 376)))


def story_folio(p, ink, accent, secondary):
    return (pack.path('M64 176Q144 144 256 200Q368 144 448 176V424Q344 392 256 448Q168 392 64 424Z M256 200V448', stroke=ink, sw=24)
            + pack.path('M128 344L192 280L256 312L320 248L384 296', stroke=accent, sw=24)
            + pack.circle(256, 96, 40, stroke=secondary, sw=24))


def dispatch_tower(p, ink, accent, secondary):
    return (pack.path('M112 440V144H80V64H144V112H224V64H288V112H368V64H432V144H400V440Z', fill=ink)
            + pack.rect(176, 200, 48, 48, fill=accent) + pack.rect(288, 280, 48, 48, fill=secondary)
            + pack.path('M192 440V360H320V440', stroke=accent, sw=24))


def headphones(p, ink, accent, secondary):
    return (pack.path('M96 328V224A160 160 0 0 1 416 224V328', stroke=ink, sw=36)
            + pack.rect(64, 256, 72, 144, fill=ink, rx=24) + pack.rect(376, 256, 72, 144, fill=ink, rx=24)
            + ''.join(pack.path(f'M{x} 224V392', stroke=secondary, sw=16) + pack.rect(x-20, y, 40, 40, fill=accent, rx=4)
                      for x, y in [(192, 264), (256, 320), (320, 240)]))


def product_master(p, ink, accent, secondary):
    name = 'favicon.svg' if p == 'lineage' else 'mark.svg'
    source = ROOT / 'remaining-product-sources' / p / name
    text = source.read_text().replace('currentColor', ink)
    if ink == accent == secondary:
        # Derive portable one-ink artwork while retaining the original master.
        root = ET.fromstring(text)
        size = float(root.get('viewBox', '0 0 64 64').split()[2])
        for element in list(root):
            if element.tag.endswith('rect') and float(element.get('width', '0')) >= size - 4:
                if element.get('stroke'):
                    element.set('fill', 'none')
                else:
                    root.remove(element)
        for element in root.iter():
            for attr in ('fill', 'stroke'):
                if element.get(attr) not in (None, 'none', 'transparent'):
                    element.set(attr, ink)
        text = ET.tostring(root, encoding='unicode')
    return pack.embed(text, 0, 0, 512, 512)


for fn in (science_reel, broadcast_ledger, archive_frame, pamphlet, cut_paste,
           constellation, workbench, signed_envelope, relay_terminal, story_folio,
           dispatch_tower, headphones, product_master):
    pack.MARKS[fn.__name__] = fn


def build(brand):
    slug = brand['slug']
    dest = pack.BRANDS_DIR / slug
    if dest.exists():
        manifest = json.loads((dest / 'asset-manifest.json').read_text())
        assert manifest['generator'] == 'brand-tools/remaining_site_packs.py'
        for row in manifest['files']:
            path = dest / row['path']
            assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], f'Pack drift: {path}'
    pack.STATUS = ('Selected for implementation under the owner\'s November 4, 2026 instruction to complete the remaining branding. '
                   'Product-owned selections retain their existing owner decisions. New marks are agent-selected under that delegation; '
                   'sample social layouts remain unapproved for publication.')
    pack.build(brand)
    shutil.copyfile(dest / 'logos/lockup.svg', dest / 'logos/lockup-primary.svg')
    product = dest / 'product'
    icon = pack.svg(pack.rect(0, 0, 512, 512, fill=brand['colors']['bg']) + pack.placed_mark(brand, 32, 32, 448), 512, 512, brand['name'] + ' browser icon')
    (product / 'favicon.svg').write_text(icon)
    pack.write_png(product, 'apple-touch-icon', icon, 180)
    pack.write_png(product, 'icon-512', icon, 512)
    pack.write_png(product, 'icon-192', icon, 192)
    with Image.open(product / 'icon-512.png') as image:
        image.save(product / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    # Give README readers a self-contained opaque lockup on either host theme.
    lockup_svg, width = pack.lockup(brand)
    node = ET.fromstring(lockup_svg)
    body = ''.join(ET.tostring(child, encoding='unicode') for child in node if not child.tag.endswith('title'))
    pack.write(product, 'readme-lockup', pack.svg(pack.rect(0, 0, width, 256, fill=brand['colors']['bg']) + body, width, 256, brand['name'] + ' lockup'), width)
    tokens = json.loads((dest / 'tokens.json').read_text())
    tokens.update(status=brand['selection_status'], direction_selection=pack.STATUS,
                  generator='brand-tools/remaining_site_packs.py', source='brand-tools/remaining-site-packs.json')
    (dest / 'tokens.json').write_text(json.dumps(tokens, indent=2) + '\n')
    guide = (dest / 'GUIDE.md').read_text().replace('It is drawn in code; nothing is traced from a product repository or another pack.',
            'Its product-owned master and source record are retained in `source/`.' if brand['mark'] == 'product_master' else
            'It is an original geometric drawing in the maintained generator; no third-party logo or collection artwork is traced.')
    guide = guide.replace('site_packs.py --only', 'remaining_site_packs.py --only').replace('Below that, use nothing.', 'The browser icon is a separately framed derivative for 16, 32 and 48 pixels.')
    guide += '\n## Product relationship\n\nThe product repository owns its interface and behavior. This pack supplies identity artwork, icons and link previews; it does not replace product controls, source notices, rights records or color semantics. Use the product\'s existing type stack in the application. Artwork uses the licensed bundled fonts.\n'
    (dest / 'GUIDE.md').write_text(guide)
    (dest / 'WEBSITE.md').write_text(f'''# {brand['name']} web handoff

Use `product/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og.png` and the mark.
The share image is 1200×630; the touch icon is 180×180. Serve the raster image with
its image content type. Set the canonical and Open Graph URL to the actual public
origin; the reusable template must keep those values configurable.

The existing interface remains owned by its product. Put the mark beside its
existing name, retain keyboard navigation, current focus treatment and narrow
wrapping, and keep an accessible SUBCULT studio credit. Do not put branding in a
user's exported image, document, overlay or acquired recording. Do not replace
original media attribution or claim affiliation with a source creator.

Read the existing product design specification before changing interface tokens.
The social samples are draft artwork, not evidence of deployed features.
''')
    source = ROOT / 'remaining-product-sources' / slug
    if source.exists():
        shutil.copytree(source, dest / 'source')
    (dest / 'selection.json').write_text(json.dumps(brand, indent=2) + '\n')
    rows = []
    for path in sorted(dest.rglob('*')):
        if path.is_file() and path.name != 'asset-manifest.json':
            row = pack.png_entry(path)
            row['path'] = str(path.relative_to(dest))
            rows.append(row)
    (dest / 'asset-manifest.json').write_text(json.dumps(dict(status=brand['selection_status'], brand=brand['name'], generator='brand-tools/remaining_site_packs.py', files=rows), indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--only')
    group.add_argument('--all', action='store_true')
    args = parser.parse_args()
    selected = [brand for brand in CONFIG['brands'] if args.all or brand['slug'] == args.only]
    assert selected, 'Unknown product'
    for brand in selected:
        build(brand)
    # Register only these new packs and their owning sources in the library manifest.
    pack.CONFIG['brands'] = CONFIG['brands']
    pack.update_library_manifest()
    manifest = pack.STUDIO / 'asset-manifest.json'
    rows = json.loads(manifest.read_text())
    names = {row['path'] for row in rows}
    for path in [ROOT / 'remaining_site_packs.py', ROOT / 'remaining-site-packs.json', ROOT / 'fonts/Sora-600.ttf', ROOT / 'fonts/sora-OFL.txt', *list((ROOT / 'remaining-product-sources').rglob('*'))]:
        if not path.is_file():
            continue
        row = pack.png_entry(path)
        row['path'] = str(path.relative_to(pack.STUDIO))
        if row['path'] in names:
            rows = [row if old['path'] == row['path'] else old for old in rows]
        else:
            rows.append(row)
    manifest.write_text(json.dumps(rows, indent=2) + '\n')


if __name__ == '__main__':
    main()
