"""Build the selected Patrick Patch pack from its authoritative Studio source."""
from pathlib import Path
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from PIL import Image

R = Path(__file__).resolve().parent
ROOT = R.parents[1]
SOURCE = R.parent / 'patrick'
DEST = R / 'brands/patrick__eff'
HISTORY = ROOT / 'branding/archive/patrick-signal-2026-10-02'


GUIDE_HEAD = """# Patrick__Eff — selected production pack

Selected by the owner October 2, 2026: **Patch / routed signal**.

The [Patch source](../../../patrick/README.md) is authoritative. It holds the generator, the full guide and the site observations. The earlier Signal pack is preserved in `branding/archive/patrick-signal-2026-10-02/` at the Studio root.

"""
GUIDE_TAIL = """## Production assets

The pack uses the standard Studio paths: `logos/`, `social/`, `video/` and `artwork/`.

| Asset | Size |
| --- | --- |
| Social banner | 1500×500 |
| Tall banner master | 1500×600 |
| Avatar PNG | 512×512 |
| Square templates | 1080×1080 |
| Story | 1080×1920 |
| Screenshot frame | 1600×1000 |
| Video frames | 1920×1080 |
| Standalone transparent marks | 512×512 |
| Lockups, with outlined exports | 1000×260 |
| Overview PNG | 1800×1940 |

## Identity line and logo treatments

The identity line is **Software. Sound. Culture.** Set all three phrases at the same size in each composition.

The open frame with the original waveform is approved in seven treatments: 01, 02, 03, 04, 06, 07 and 08. Lavender is the default, and 06 is its counterpart for light backgrounds. Option 05 is excluded. The [approved logo gallery](../../../patrick/waveform-variations/index.html) shows all seven. Their transparent marks and avatars are in `logos/waveform/`. The monochrome fallback exports keep the plain open frame for small or single-ink uses.

## Rebuild

From the library directory, run `BRAND_ONLY=patrick__eff python build_packs.py`, then `BRAND_ONLY=patrick__eff python render_video_previews.py`. Both steps refresh the manifest and the Patrick ZIP. Do not edit generated PNGs on their own. The full source asset inventory and the editing guidance are in the linked Patch guide.
"""


def write_guide():
    """Write the pack guide from the Patch source guide. Text only; renders nothing."""
    guide=(SOURCE/'GUIDE.md').read_text()
    common=guide[guide.index('## Direction'):guide.index('## Asset inventory')]
    common=common.replace('../library/references/patrick-variations/mono-outlined.svg','../../references/patrick-variations/mono-outlined.svg')
    common=common.replace('(../../content/VOICE.md)','(../../../../content/VOICE.md)')
    (DEST/'GUIDE.md').write_text(GUIDE_HEAD+common+GUIDE_TAIL)


def refresh_manifest():
    files=[]
    for path in sorted(DEST.rglob('*')):
        if not path.is_file() or path.name=='asset-manifest.json': continue
        row={'path':str(path.relative_to(DEST)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
        if path.suffix=='.png':
            with Image.open(path) as im: row.update(width=im.width,height=im.height,mode=im.mode)
        files.append(row)
    (DEST/'asset-manifest.json').write_text(json.dumps({'brand':'Patrick__Eff','direction':'Patch / routed signal','status':'user-selected local production pack','files':files},indent=2)+'\n')
    archive_path = R.parents[1] / 'runtime/packages/patrick__eff.zip'
    archive_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive_path,'w',zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(DEST.rglob('*')):
            if path.is_file(): archive.write(path,path.relative_to(DEST))
    with zipfile.ZipFile(archive_path) as archive: assert archive.testzip() is None


def build(d):
    if (DEST/'tokens.json').exists() and json.loads((DEST/'tokens.json').read_text()).get('direction')!='Patch / routed signal':
        if HISTORY.exists(): raise RuntimeError('Signal history already exists; inspect before replacing the current pack')
        HISTORY.parent.mkdir(parents=True,exist_ok=True)
        DEST.rename(HISTORY)
    (DEST/'fonts').mkdir(parents=True,exist_ok=True)
    font_source=HISTORY/'fonts' if HISTORY.exists() else R/'fonts'
    for name in ['Space-Grotesk-0.ttf','Space-Grotesk-1.ttf','JetBrains-Mono-0.ttf','JetBrains-Mono-1.ttf','spacegrotesk-OFL.txt','jetbrainsmono-OFL.txt']:
        shutil.copy2(font_source/name,DEST/'fonts'/name)
    for path in (SOURCE/'fonts').iterdir(): shutil.copy2(path,DEST/'fonts'/path.name)
    spec=importlib.util.spec_from_file_location('patrick_patch_source',SOURCE/'build_assets.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);module.main()
    wave_spec=importlib.util.spec_from_file_location('patrick_waveform_exports',SOURCE/'waveform_variations.py')
    wave=importlib.util.module_from_spec(wave_spec);wave_spec.loader.exec_module(wave);wave.main()
    for folder in ['logos','social','video','artwork']: (DEST/folder).mkdir(exist_ok=True)
    mapping={'social/banner-x-bluesky':'banner-social','social/square-post':'identity-square',
             'social/avatar':'avatar','social/landscape-template':'case-study-landscape',
             'social/story-template':'story','social/quote-template':'quote-square',
             'social/release-template':'release-square','social/process-template':'process-square',
             'social/screenshot-frame':'screenshot-frame','social/open-graph':'open-graph',
             'video/title-card':'video-title','video/thumbnail':'video-title','video/end-card':'video-end',
             'video/lower-third':'video-lower-third','artwork/routing-motif':'routing-motif',
             'artwork/spectrum-motif':'spectrum-motif'}
    for target,source in mapping.items():
        for extension in ['svg','png']: shutil.copy2(SOURCE/'assets'/f'{source}.{extension}',DEST/f'{target}.{extension}')
    with tempfile.TemporaryDirectory(prefix='patrick-pack-fonts-') as cache:
        config=Path(cache)/'fonts.conf'
        config.write_text(f'<fontconfig><dir>{DEST/"fonts"}</dir><cachedir>{cache}</cachedir><alias><family>Inter</family><prefer><family>Inter Variable</family></prefer></alias></fontconfig>')
        env={**os.environ,'FONTCONFIG_FILE':str(config)}
        def render(path,width=None):
            cmd=['rsvg-convert',str(path),'-o',str(path.with_suffix('.png'))]
            if width: cmd+=['-w',str(width)]
            subprocess.run(cmd,env=env,check=True)
        for name,dark in [('primary',False),('dark',False),('light',True),('mono-dark',False),('mono-light',True)]:
            base='mark-dark' if dark else 'mark-light'
            if name.startswith('mono-'):
                mono=module.canvas(512,512,module.mark(0,0,512,dark,waveform=False),'Patrick__Eff monochrome open frame',None)
                path=DEST/'logos'/f'mark-{name}.svg';path.write_text(mono+'\n');render(path)
                shutil.copy2(path,path.with_name(f'mark-{name}-outlined.svg'))
            else:
                for suffix in ['.svg','-outlined.svg']: shutil.copy2(SOURCE/'assets'/f'{base}.svg',DEST/'logos'/f'mark-{name}{suffix}')
                shutil.copy2(SOURCE/'assets'/f'{base}.png',DEST/'logos'/f'mark-{name}.png')
            color='base' if dark else 'paper'
            lock=module.canvas(1000,260,module.mark(30,30,200,dark,waveform=not name.startswith('mono-'))+module.text(264,157,'PATRICK__EFF',78,color),'Patrick__Eff lockup',None)
            path=DEST/'logos'/f'lockup-{name}.svg';path.write_text(lock+'\n');render(path)
            subprocess.run(['inkscape',str(path),'--export-text-to-path','--export-plain-svg','--export-filename='+str(path.with_name(f'lockup-{name}-outlined.svg'))],env=env,check=True,capture_output=True)
        tall=module.canvas(1500,600,f'<image x="0" y="50" width="1500" height="500" href="data:image/svg+xml;base64,{__import__("base64").b64encode((SOURCE/"assets/banner-wide.svg").read_bytes()).decode()}"/>','Patrick__Eff tall banner')
        path=DEST/'social/banner-tall-master.svg';path.write_text(tall+'\n');render(path)
        render(DEST/'social/avatar.svg',512)
    variations=DEST/'logos/waveform';variations.mkdir(exist_ok=True)
    for slug in wave.SELECTION['approved_variations']:
        for suffix in ['.svg','.png','-avatar.svg','-avatar.png']:
            shutil.copy2(SOURCE/'waveform-variations'/f'{slug}{suffix}',variations/f'{slug}{suffix}')
    shutil.copy2(SOURCE/'logo-selection.json',variations/'selection.json')
    shutil.copy2(SOURCE/'assets/brand-board.png',DEST/'pack-preview.png')
    # Use a self-contained editable contact sheet at the conventional SVG path.
    board=module.canvas(1800,1940,f'<image width="1800" height="1940" href="data:image/png;base64,{__import__("base64").b64encode((SOURCE/"assets/brand-board.png").read_bytes()).decode()}"/>','Patrick__Eff selected pack overview')
    (DEST/'pack-preview.svg').write_text(board+'\n')
    tokens=json.loads((SOURCE/'tokens.json').read_text())
    colors=tokens['colors'];tokens['colors']={**colors,'bg':colors['base'],'fg':colors['paper'],'accent':colors['purple'],'secondary':colors['green'],'safe_label':colors['green']}
    tokens.update(direction_selection='user',authoritative_source='branding/patrick/',mark_sources='../../references/patrick-variations/mono-outlined.svg')
    (DEST/'tokens.json').write_text(json.dumps(tokens,indent=2)+'\n')
    css=(SOURCE/'tokens.css').read_text()+'\n:root {\n'+''.join(f' --brand-{k.replace("_","-")}: {tokens["colors"][k]};\n' for k in ['bg','fg','accent','secondary','safe_label'])+' --font-display: "Space Grotesk"; --font-body: "Inter"; --font-label: "JetBrains Mono";\n}\n.brand-display,.brand-body,.brand-label {text-shadow:none}\n'
    (DEST/'tokens.css').write_text(css)
    write_guide()
    for name in ['components.html','logos/variations.html']:
        prefix='../../../../' if '/' in name else '../../../'
        (DEST/name).write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><title>Patrick__Eff — Patch</title><p>Selected direction: Patch / routed signal.</p><p><a href="{prefix}patrick/index.html">Open the selected design system and asset gallery</a></p><p><a href="{prefix}patrick/waveform-variations/index.html">Seven approved waveform logo treatments</a></p></html>\n')
    (DEST/'alt-text.md').write_text('# Patrick__Eff — alt text\n\nBanner: Software. Sound. Culture. Patrick__Eff PF mark with lavender, pink and green cable paths.\n\nSquare identity: Software. Sound. Culture, above colored cable paths.\n\nAvatar: Warm-white open-frame PF with a lavender waveform behind the initials, surrounded by colored cable paths on charcoal.\n\nTemplates: replace sample text before publication and describe the actual completed artwork. Decorative spectrum bars are not measured audio.\n')
    shutil.copy2(SOURCE/'source-observation.json',DEST/'source-observation.json')
    (DEST/'source-provenance.json').write_text(json.dumps({'selection':'owner, 2026-10-02','source_manifest':str((SOURCE/'asset-manifest.json').relative_to(ROOT)),'source_manifest_sha256':hashlib.sha256((SOURCE/'asset-manifest.json').read_bytes()).hexdigest(),'preserved_previous_pack':str(HISTORY.relative_to(ROOT))},indent=2)+'\n')
    (DEST/'video/captions.ass').write_text('[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Inter,48,&H00F2F8F8,&H00F2F8F8,&H002C2221,&HBE2C2221,0,0,0,0,100,100,0,0,3,2,0,2,120,120,90,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:04.00,Default,,0,0,0,,Replace with actual spoken words.\n')
    refresh_manifest()
    print('Patrick__Eff: selected Patch pack built; Signal preserved in history.')
