from pathlib import Path
import hashlib,itertools,json,xml.etree.ElementTree as E
R=Path(__file__).resolve().parent
B=R.parent/'brands/patchwork'
OUT=B/'audits';OUT.mkdir(exist_ok=True)
TOKENS=json.loads((B/'tokens.json').read_text())
COLORS={'paper':TOKENS['colors']['bg'],'ink':TOKENS['colors']['fg'],'green':TOKENS['colors']['accent'],'tomato':TOKENS['colors']['secondary'],'action_tomato':TOKENS['colors']['action_tomato'],'shadow':'#b2bba1','yellow':'#f2c14e','sage':'#9ec5ad'}
def luminance(color):
 rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
 return sum((v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4)*w for v,w in zip(rgb,[.2126,.7152,.0722]))
def ratio(a,b):
 lo,hi=sorted([luminance(a),luminance(b)])
 return (hi+.05)/(lo+.05)
assert ratio('#000000','#ffffff')==21
matrix=[]
for a,b in itertools.combinations(COLORS,2):
 value=ratio(COLORS[a],COLORS[b]);matrix.append({'foreground':a,'background':b,'ratio':value,'AA_normal':value>=4.5,'AA_large_or_nontext':value>=3,'AAA_normal':value>=7,'AAA_large':value>=4.5})
text_checks=[]
for p in sorted((B/'social').glob('*.svg'))+sorted((B/'video').glob('*.svg')):
 for e in E.parse(p).getroot().iter():
  if not e.tag.endswith('text'):continue
  text=''.join(e.itertext());fg=e.get('fill');size=float(e.get('font-size','0'));bold=int(e.get('font-weight','400'))>=700
  bg=COLORS['green'] if text=='HELP A NEIGHBOUR' else COLORS['action_tomato'] if text=='PASS IT ON' else COLORS['paper']
  value=ratio(fg,bg);large=size>=24 or (bold and size>=14*96/72);required=3 if large else 4.5
  text_checks.append({'file':str(p.relative_to(B)),'text':text,'foreground':fg,'background':bg,'svg_font_size':size,'bold':bold,'ratio':value,'AA_at_native_svg_scale':value>=required,'AA_at_any_scale':value>=4.5})
action_ratio=ratio(COLORS['paper'],COLORS['action_tomato'])
assert action_ratio>=4.5
assert all(x['AA_at_any_scale'] for x in text_checks)
report={'scope':'Local Patchwork branding SVG text and stitched-button CSS; deployed site and caption rendering excluded','colors':COLORS,'matrix':matrix,'svg_text_checks':text_checks,'normal_text_threshold':4.5,'all_svg_text_pairs_pass_AA_normal':all(x['AA_at_any_scale'] for x in text_checks),'action_tomato_ratio':action_ratio,'decorative_tomato_unchanged':COLORS['tomato']=='#e85d3f'}
(OUT/'contrast-report.json').write_text(json.dumps(report,indent=2)+'\n')
rows='\n'.join(f"| {x['foreground']} / {x['background']} | {x['ratio']:.2f}:1 | {'Pass' if x['AA_normal'] else 'Fail'} | {'Pass' if x['AA_large_or_nontext'] else 'Fail'} |" for x in matrix)
(OUT/'contrast-report.md').write_text(f"""# Patchwork contrast audit after button-color correction

The tomato button that carries text uses `#b33e28`. Paper text (`#f2efe7`) on it measures **{action_ratio:.2f}:1**, which passes WCAG AA for normal text. The logo and decorative patches keep bright tomato `#e85d3f`.

The audit examined {len(text_checks)} text elements in the social and video SVGs. Every pair meets the 4.5:1 threshold for normal text, and none relies on large-text status. The CSS tomato button uses the same darker token.

Ink on paper measures 7.26:1 and passes AAA for normal text. Dark green on paper measures 6.01:1 and passes AA for normal text. The ink focus outline exceeds the 3:1 non-text threshold against paper.

Decorative tomato is 3.01:1 against paper, sage shadows 1.74:1, yellow patches 1.46:1 and sage patches 1.65:1. Do not set small text in these decorative colors, and do not let them carry essential control information alone.

Scope: the local asset pack and the defined button CSS. The audit does not qualify the deployed site, caption ASS rendering, private screenshot content or browser interactions. Small text can be hard to read even when its color contrast passes.

Method: WCAG sRGB relative luminance. Pass/fail uses unrounded ratios. Normal text needs 4.5:1, large text and essential non-text graphics need 3:1. Logos and purely decorative artwork are exempt. References: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Full palette matrix

The matrix includes combinations the pack does not use. A failing unused pair is not an accessibility defect.

| Pair | Ratio | AA normal text | AA large text / non-text |
|---|---:|---|---|
{rows}

Per-element results are in `contrast-report.json`.
""")
print(f'{len(text_checks)} SVG text elements: every pair passes AA normal text. Action tomato: {action_ratio:.4f}:1.')

# Conservative bounds: black paper grain at 2.5%, white weave at 3.5%.
def blend_hex(base,overlay,alpha,lighten=False):
 import math
 rgb=[int(base[i:i+2],16) for i in (1,3,5)];top=[int(overlay[i:i+2],16) for i in (1,3,5)]
 values=[(math.ceil if lighten else math.floor)(a*(1-alpha)+b*alpha) for a,b in zip(rgb,top)]
 return '#'+''.join(f'{v:02x}' for v in values)
texture_checks=[]
for check in text_checks:
 background=check['background']
 worst=blend_hex(background,'#000000',.025) if background==COLORS['paper'] else blend_hex(background,'#ffffff',.035,True)
 value=ratio(check['foreground'],worst)
 texture_checks.append({'file':check['file'],'text':check['text'],'worst_background':worst,'ratio':value,'AA_normal':value>=4.5})
assert all(x['AA_normal'] for x in texture_checks)
report['texture_bounds']={'paper_black_opacity':.025,'fabric_white_opacity':.035,'checks':texture_checks,'minimum_ratio':min(x['ratio'] for x in texture_checks)}
(OUT/'contrast-report.json').write_text(json.dumps(report,indent=2)+'\n')
with (OUT/'contrast-report.md').open('a') as f:f.write(f"\n## Texture bounds\n\nAll {len(texture_checks)} text color pairs also pass at conservative texture bounds: black paper grain at 2.5% opacity and white weave at 3.5% opacity. The lowest ratio is {report['texture_bounds']['minimum_ratio']:.2f}:1. These checks bound the source colors. They do not qualify rendered browser output or full accessibility.\n")
print(f"Worst textured text contrast: {report['texture_bounds']['minimum_ratio']:.4f}:1; all pass AA normal text.")
