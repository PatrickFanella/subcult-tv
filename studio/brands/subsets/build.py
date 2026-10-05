"""Build the approved Subsets identity and export explicitly selected assets."""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LIBRARY = ROOT.parents[1]
FONT_SOURCE = LIBRARY / 'fonts'
FONT_FILES = ['Space-Grotesk-0.ttf', 'Space-Grotesk-1.ttf', 'Public-Sans-0.ttf',
              'JetBrains-Mono-0.ttf', 'spacegrotesk-OFL.txt', 'publicsans-OFL.txt', 'jetbrainsmono-OFL.txt']
INK, MINT, SILVER = '#17201e', '#94f7b7', '#d9dedc'

def save(name, content):
    file = ROOT / name
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(content)

def svg(width, height, content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">{content}</svg>'

def mark(ink=INK, accent=MINT):
    # Six adjoining cells; two selected cells create the interior step.
    cells = [(24, 0, ink), (0, 24, ink), (24, 24, accent),
             (48, 24, ink), (0, 48, accent), (24, 48, ink)]
    return ''.join(f'<rect x="{x}" y="{y}" width="24" height="24" fill="{color}"/>' for x, y, color in cells)

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def asset_entry(p, relative):
    entry = {'path': relative, 'sha256': digest(p), 'bytes': p.stat().st_size}
    if p.suffix == '.svg':
        import xml.etree.ElementTree as ET
        element = ET.parse(p).getroot()
        entry['dimensions'] = {'width': float(element.attrib['width']), 'height': float(element.attrib['height'])}
    elif p.suffix == '.png':
        import struct
        width, height = struct.unpack('>II', p.read_bytes()[16:24])
        entry['dimensions'] = {'width': width, 'height': height}
    return entry

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--export', type=Path)
    args = parser.parse_args()
    config = json.loads((ROOT / 'brand.json').read_text())
    colors = config['colors'] | {'border': '#64716c', 'muted': '#43534b', 'terminal': '#17201e', 'terminalText': '#eef1ef'}
    tokens = {'name': 'Subsets', 'brand': 'Subsets', 'direction': 'Personal Utility', 'status': 'approved identity', 'colors': colors,
              'fonts': config['fonts'], 'spacing': [4, 8, 12, 16, 24, 32, 48, 64, 96],
              'radii': {'panel': 8, 'control': 3}, 'shadow': '8px 8px 0 #17201e'}
    save('tokens.json', json.dumps(tokens, indent=2) + '\n')
    save('tokens.css', ':root {\n' + ''.join(f'  --{k}: {v};\n' for k,v in colors.items()) + '}\n')
    for name in FONT_FILES:
        (ROOT / 'fonts').mkdir(exist_ok=True)
        shutil.copyfile(FONT_SOURCE / name, ROOT / 'fonts' / name)
    font_catalog = json.loads((FONT_SOURCE / 'sources.json').read_text())
    save('fonts/sources.json', json.dumps([r for r in font_catalog if r['family'] in config['fonts'].values()], indent=2) + '\n')
    fontconfig = f'<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>{ROOT / "fonts"}</dir><cachedir>{ROOT / ".font-cache"}</cachedir></fontconfig>'
    save('fontconfig.xml', fontconfig)
    import os
    env = os.environ | {'FONTCONFIG_FILE': str(ROOT / 'fontconfig.xml')}
    for variant, ink, accent in [('primary', INK, MINT), ('light', INK, MINT), ('dark', SILVER, MINT), ('mono', INK, INK), ('mono-light', SILVER, SILVER)]:
        save(f'logos/mark-{variant}.svg', svg(96, 96, f'<g transform="translate(12 12)">{mark(ink, accent)}</g>'))
        content = f'<g transform="translate(8 12)">{mark(ink, accent)}</g><text x="104" y="72" font-family="Space Grotesk" font-weight="700" font-size="67" letter-spacing="-3" fill="{ink}">subsets</text>'
        save(f'logos/lockup-{variant}.svg', svg(370, 96, content))
        for kind in ['mark', 'lockup']:
            source = ROOT / f'logos/{kind}-{variant}.svg'
            outlined = ROOT / f'logos/{kind}-{variant}-outlined.svg'
            subprocess.run(['inkscape', str(source), '--export-text-to-path', '--export-plain-svg', f'--export-filename={outlined}'], env=env, check=True, capture_output=True)
            subprocess.run(['inkscape', str(outlined), f'--export-filename={ROOT / f"logos/{kind}-{variant}.png"}'], env=env, check=True, capture_output=True)
    social = f'<rect width="1200" height="630" fill="{SILVER}"/><rect x="760" y="100" width="360" height="430" fill="{MINT}"/><g transform="translate(84 78) scale(1.1)">{mark()}</g><text x="192" y="140" font-family="Space Grotesk" font-weight="700" font-size="72" fill="{INK}">subsets</text><text x="84" y="310" font-family="Space Grotesk" font-weight="700" font-size="68" fill="{INK}">All your skills.</text><text x="84" y="398" font-family="Space Grotesk" font-weight="700" font-size="68" fill="{INK}">Only the set you need.</text><text x="84" y="548" font-family="JetBrains Mono" font-size="22" fill="{INK}">LOCAL AGENT SKILLS / BY SUBCULT</text>'
    save('social/og.svg', svg(1200, 630, social))
    subprocess.run(['inkscape', str(ROOT / 'social/og.svg'), f'--export-filename={ROOT / "social/og.png"}'], env=env, check=True, capture_output=True)
    board = f'<rect width="1440" height="960" fill="{SILVER}"/><text x="64" y="58" font-family="JetBrains Mono" font-size="16" fill="{INK}">SUBSETS / PERSONAL UTILITY / APPROVED IDENTITY</text><path d="M64 88H1376" stroke="{INK}"/>'
    board += f'<g transform="translate(64 150) scale(1.8)">{mark()}</g><text x="236" y="258" font-family="Space Grotesk" font-weight="700" font-size="142" letter-spacing="-7" fill="{INK}">subsets</text><text x="240" y="307" font-family="JetBrains Mono" font-size="18" fill="{INK}">by SUBCULT</text>'
    for i, (name, color) in enumerate([('SILVER', SILVER), ('CHARCOAL', INK), ('MINT', MINT), ('SOFT WHITE', '#eef1ef')]):
        x = 64 + i * 336
        board += f'<rect x="{x}" y="378" width="312" height="104" fill="{color}" stroke="#64716c"/><text x="{x}" y="514" font-family="JetBrains Mono" font-size="16" fill="{INK}">{name} / {color.upper()}</text>'
    board += f'<text x="64" y="644" font-family="Space Grotesk" font-weight="700" font-size="65" letter-spacing="-2" fill="{INK}">All your skills.</text><text x="64" y="725" font-family="Space Grotesk" font-weight="700" font-size="65" letter-spacing="-2" fill="{INK}">Only the set you need.</text><text x="64" y="790" font-family="Public Sans" font-size="21" fill="{INK}">A local skill manager for your agents.</text><text x="64" y="843" font-family="JetBrains Mono" font-size="16" fill="{INK}">SPACE GROTESK / PUBLIC SANS / JETBRAINS MONO</text>'
    board += f'<rect x="860" y="580" width="516" height="274" rx="6" fill="{INK}"/><g transform="translate(900 614)">{mark(SILVER, MINT)}</g><text x="900" y="732" font-family="JetBrains Mono" font-size="16" fill="{MINT}">$ subsets apply</text><text x="900" y="766" font-family="JetBrains Mono" font-size="16" fill="#eef1ef">  --creative-writing</text><text x="900" y="818" font-family="JetBrains Mono" font-size="12" fill="{SILVER}">THE SELECTED SET / BY SUBCULT</text>'
    board += f'<path d="M64 903H1376" stroke="#64716c"/><text x="64" y="936" font-family="JetBrains Mono" font-size="12" fill="{INK}">ORIGINAL VECTOR MARK / LICENSED FONTS / SUBCULT STUDIO</text>'
    save('brand-board.svg', svg(1440, 960, board))
    subprocess.run(['inkscape', str(ROOT / 'brand-board.svg'), f'--export-filename={ROOT / "brand-board.png"}'], env=env, check=True, capture_output=True)
    save('pack-preview.svg', svg(1440, 960, board))
    shutil.copyfile(ROOT / 'brand-board.png', ROOT / 'pack-preview.png')
    # Reusable layouts contain an explicitly marked sample, never release claims.
    layouts = [('social/banner-x-bluesky',1500,500), ('social/banner-tall-master',1500,600),
               ('social/square-post',1080,1080), ('social/landscape-template',1200,630),
               ('social/story-template',1080,1920), ('social/quote-template',1080,1080),
               ('social/release-template',1080,1080), ('social/screenshot-frame',1920,1080),
               ('video/title-card',1920,1080), ('video/thumbnail',1920,1080), ('video/end-card',1920,1080)]
    for name, width, height in layouts:
        title_size = min(76, width / 18)
        sample = '' if 'banner' in name else '<text x="64" y="'+str(height-90)+'" font-family="JetBrains Mono" font-size="18" fill="'+INK+'">SAMPLE LAYOUT / REPLACE BEFORE PUBLICATION</text>'
        content = f'<rect width="{width}" height="{height}" fill="{SILVER}"/><rect x="{width*.68}" y="{height*.16}" width="{width*.26}" height="{height*.66}" fill="{MINT}"/><g transform="translate(64 56)">{mark()}</g><text x="165" y="114" font-family="Space Grotesk" font-weight="700" font-size="58" fill="{INK}">subsets</text><text x="64" y="{height*.48}" font-family="Space Grotesk" font-weight="700" font-size="{title_size}" fill="{INK}">All your skills.</text><text x="64" y="{height*.48+title_size*1.3}" font-family="Space Grotesk" font-weight="700" font-size="{title_size}" fill="{INK}">Only the set you need.</text><text x="64" y="{height-42}" font-family="JetBrains Mono" font-size="18" fill="{INK}">SUBSETS.SUBCULT.TV / BY SUBCULT</text>'+sample
        save(name+'.svg', svg(width, height, content))
        subprocess.run(['inkscape', str(ROOT/(name+'.svg')), f'--export-filename={ROOT/(name+".png")}'], env=env, check=True, capture_output=True)
    avatar = f'<rect width="512" height="512" fill="{SILVER}"/><g transform="translate(112 112) scale(4)">{mark()}</g>'
    save('social/avatar.svg', svg(512,512,avatar))
    subprocess.run(['inkscape', str(ROOT/'social/avatar.svg'), f'--export-filename={ROOT/"social/avatar.png"}'], env=env, check=True, capture_output=True)
    lower = f'<rect x="96" y="860" width="700" height="124" rx="6" fill="{INK}"/><g transform="translate(116 884)">{mark(SILVER,MINT)}</g><text x="212" y="935" font-family="Space Grotesk" font-weight="700" font-size="42" fill="{SILVER}">subsets / by SUBCULT</text>'
    save('video/lower-third.svg', svg(1920,1080,lower))
    subprocess.run(['inkscape', str(ROOT/'video/lower-third.svg'), f'--export-filename={ROOT/"video/lower-third.png"}'], env=env, check=True, capture_output=True)
    save('video/captions.ass', '[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Public Sans,44,&H00EFF1EE,&H00EFF1EE,&H001E2017,&H001E2017,0,0,0,0,100,100,0,0,1,2,0,2,96,96,96,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    # The site receives only original artwork, role tokens and licensed fonts.
    selected = ['tokens.css', 'tokens.json', 'brand-board.png', 'logos/mark-primary.svg', 'logos/mark-dark.svg',
                'logos/mark-mono.svg', 'logos/lockup-primary-outlined.svg', 'social/og.png',
                'social/banner-x-bluesky.png', 'social/avatar.png']
    selected += ['fonts/' + name for name in FONT_FILES] + ['fonts/sources.json']
    register = {'owner': 'SUBCULT Studio', 'direction': 'Personal Utility selected in conversation, October 4, 2026',
                'mark': 'Original selected-tile geometry authored in build.py',
                'inspiration': 'Desktop FM study; visual ideas only, no reference image copied',
                'fonts': 'Studio licensed font collection; OFL texts included',
                'claims': 'Subsets README, docs/npm.md, docs/discovery-ownership.md, docs/npm-preview-qualification.md',
                'publication': 'Owner approved identity, repository branding, and landing publication on October 4, 2026. Template samples are not approved social posts.'}
    save('source-register.json', json.dumps(register, indent=2) + '\n')
    manifest = {'brand': 'subsets', 'status': 'approved identity', 'assets': []}
    for p in sorted(ROOT.rglob('*')):
        if p.is_file() and '.font-cache' not in p.parts and p.name not in ['asset-manifest.json', 'fontconfig.xml']:
            manifest['assets'].append(asset_entry(p, str(p.relative_to(ROOT))))
    save('asset-manifest.json', json.dumps(manifest, indent=2) + '\n')
    if args.export:
        target = args.export.resolve()
        entries = []
        for relative in selected:
            p = ROOT / relative
            dest = target / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, dest)
            entries.append(asset_entry(p, relative))
        (target / 'brand-export.json').write_text(json.dumps({'brand': 'subsets', 'status': 'approved identity', 'assets': entries}, indent=2) + '\n')
    shutil.rmtree(ROOT / '.font-cache', ignore_errors=True)
    print(f'Built Subsets only: {len(manifest["assets"])} assets; {len(selected)} selected for the prototype.')

if __name__ == '__main__':
    main()
