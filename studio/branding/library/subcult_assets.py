"""Selected SUBCULT logo geometry; original master remains a preserved input."""
from pathlib import Path
import copy
import hashlib
import json
import subprocess
import shutil
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "references/subcult-mark-master.svg"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def node(tag, **attrs):
    return ET.Element(f'{{{NS}}}{tag}', {k.replace('_', '-'): str(v) for k, v in attrs.items()})


def make_mark(option, theme):
    registration = option in ('b-registration', 'c-registration')
    treatment = {'b-registration': 'b-heavy-outline', 'c-registration': 'c-solid'}.get(option, option)
    source = ET.parse(SOURCE).getroot()
    ink = '#100b19' if theme == 'color' else '#ffffff'
    svg = node('svg', width=256, height=256, viewBox='0 0 256 256', role='img')
    title = ET.SubElement(svg, f'{{{NS}}}title')
    title.text = f'SUBCULT {option} / {theme}'
    artwork = node('g')
    svg.append(artwork)
    for original in source:
        if original.tag.split('}')[-1] in ('path', 'rect', 'g'):
            artwork.append(copy.deepcopy(original))
    for e in artwork.iter():
        for attr in ('fill', 'stroke', 'style'):
            if e.get(attr):
                e.set(attr, e.get(attr).replace('#100b19', ink))
    elements = {e.get('id'): e for e in artwork.iter()}
    if theme == 'mono':
        block = elements['rect2']
        block.set('fill', 'none')
        block.set('style', 'fill:none;stroke:#ffffff;stroke-width:6')
    if option == 'original':
        return svg
    # The original S path contains a second subpath for the underscore.
    # Replace that and rect5 with one continuous, full-width closed path.
    s = elements['text1']
    s.set('d', s.get('d').split(' m 43.615372')[0])
    artwork.remove(elements['rect5'])
    artwork.append(node('path', id='underscore', fill=ink,
                        d='M 126.56219,193.97992 H 215.57934 V 213.34037 H 126.56219 Z'))
    if treatment in ('b-heavy-outline', 'c-solid', 'd-compact'):
        group = elements['g2']
        for e in list(group):
            if e.tag.endswith('path'):
                group.remove(e)
        c = elements['text2']
        c.set('style', f'fill:none;stroke:{ink};stroke-width:9;stroke-linejoin:round'
              if treatment == 'b-heavy-outline' else f'fill:{ink};stroke:none')
    # Reverse artwork avoids white lettering directly over the bright green field.
    if theme != 'color' and option != 'a-integrated':
        block = elements['rect2']
        block.set('fill', 'none')
        block.set('style', 'fill:none;stroke:#00ff88;stroke-width:6'
                  if theme == 'reverse' else 'fill:none;stroke:#ffffff;stroke-width:6')
        if theme == 'mono':
            artwork.remove(elements['g2'])
    if option == 'd-compact':
        if elements['g2'] in list(artwork):
            artwork.remove(elements['g2'])
        svg.set('viewBox', '32 30 192 192')
        if theme == 'color':
            artwork.find(f"{{{NS}}}path[@id='underscore']").set('fill', '#00ff88')
    if registration:
        # Keep the master line positions and tilt, behind the letterforms.
        lines = node('g', id='registration-lines', transform=elements['g2'].get('transform'))
        line_ink = '#00ff88' if theme != 'color' else ink
        for line_id in ('path1', 'path2'):
            line = copy.deepcopy(elements[line_id])
            line.set('style', f'fill:none;stroke:{line_ink};stroke-width:3;stroke-linecap:butt')
            lines.append(line)
        artwork.insert(1 if elements['g2'] in list(artwork) else 0, lines)
    return svg


def selected_svg(style='c-solid', ink='#100b19', accent='#00ff88', mono=False):
    white = ink.lower() in ('#ffffff', '#f0ece4', '#f5f2eb')
    theme = 'mono' if mono else 'reverse' if white else 'color'
    root = make_mark(style, theme)
    source_ink = '#ffffff' if theme != 'color' else '#100b19'
    for el in root.iter():
        for attr, value in list(el.attrib.items()):
            el.set(attr, value.replace(source_ink, ink).replace('#00ff88', accent))
    return ET.tostring(root, encoding='unicode')


def build_selected(destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    files = []
    for style, prefix in [('c-solid', 'mark'), ('b-heavy-outline', 'mark-outline'), ('d-compact', 'mark-compact')]:
        for variant, ink, mono in [('primary', '#100b19', False), ('dark', '#ffffff', False),
                                   ('light', '#100b19', False), ('mono-dark', '#ffffff', True),
                                   ('mono-light', '#100b19', True)]:
            artwork = selected_svg(style, ink, mono=mono)
            for suffix in ('', '-outlined'):
                path = destination / f'{prefix}-{variant}{suffix}.svg'
                path.write_text(artwork)
                files.append({'path': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
            path = destination / f'{prefix}-{variant}.png'
            subprocess.run(['rsvg-convert', '-o', str(path), str(path.with_suffix('.svg'))], check=True)
    (destination / 'master.svg').write_text(selected_svg())
    fisheye = ROOT.parent / 'reviews/subcult-logo-fisheye/fisheye-circle-study.png'
    shutil.copyfile(fisheye, destination / 'mark-fisheye-circle.png')
    selection = {'approved_by': 'user', 'registration_lines': False,
                 'primary': 'c-solid', 'outlined': 'b-heavy-outline', 'compact': 'd-compact',
                 'construction': 'Single continuous underscore; no extension rectangle.',
                 'original_source': 'references/subcult-mark-master.svg',
                 'original_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'files': files}
    selection['circle'] = {'approved_by': 'user', 'path': 'mark-fisheye-circle.png',
                           'source': str(fisheye.relative_to(ROOT.parent)),
                           'sha256': hashlib.sha256(fisheye.read_bytes()).hexdigest(),
                           'scope': 'Replaces purple circle logo treatments; preserve the approved raster artwork.'}
    (destination.parent / 'logo-selection.json').write_text(json.dumps(selection, indent=2)+'\n')
