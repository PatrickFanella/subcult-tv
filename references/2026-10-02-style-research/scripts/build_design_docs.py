"""Write design-system studies from original specifications and dated observations."""
from pathlib import Path
import json
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
sources = json.loads((ROOT / 'sources.json').read_text())
notes = json.loads((ROOT / 'editorial-notes.json').read_text())
specifications = json.loads((ROOT / 'design-specifications.json').read_text())

def cell(value):
    return str(value or 'unrecorded').replace('|', '\\|').replace('\n', ' ')

for source in sources:
    sid = source['id']; folder = ROOT / 'examples' / sid
    spec = specifications[sid]; note = notes[sid]
    path = folder / 'live-observation.json'
    live = json.loads(path.read_text()) if path.exists() else {}
    samples = live.get('samples', [])
    colors = Counter()
    fonts = Counter()
    for sample in samples:
        for key in ['color', 'background']:
            value = sample.get(key)
            if value and value != 'rgba(0, 0, 0, 0)':
                colors[value] += 1
        if sample.get('font'):
            fonts[sample['font']] += 1
    styles = []
    seen = set()
    for sample in samples:
        key = tuple(sample.get(k) for k in ['tag','font','size','weight','color','background','border','shadow'])
        if key not in seen:
            seen.add(key)
            styles.append(sample)
    measured = {
        'schema': 'design-reference-observations-v1', 'brand': source['name'],
        'direction': note[0], 'status': 'reference-observation',
        'source': {'liveUrl': source['live'], 'referoUrl': source.get('refero'),
                   'referenceImageUrl': source.get('referenceImage'), 'referenceImageCaptureDate': 'unknown',
                   'observedAt': live.get('capturedAt'), 'observedUrl': live.get('url'), 'viewport': live.get('viewport')},
        'colors': {'bg': None, 'fg': None, 'accent': None, 'secondary': None},
        'fonts': {'display': None, 'body': None, 'label': None}, 'spacing': [],
        'observations': {'colorFrequencies': colors.most_common(18), 'fontFrequencies': fonts.most_common(12),
                         'elementStyles': styles, 'canvasCount': live.get('canvas')},
        'proposedRoleDescriptions': {'color': spec['color'], 'typography': spec['type']},
        'limits': {'semanticRoles': 'Null roles are deliberate. Element measurements do not establish canonical site-wide roles or scales.',
                   'visibility': 'Nonzero element geometry does not prove visibility through loaders or overlays. Computed family requests do not prove successful font loading.',
                   'coverage': 'Selected desktop samples and a supplied reference image when available; no complete responsive, interaction or accessibility audit.',
                   'sourceDifferences': note[3], 'ownership': 'Third-party reference, not an approved production pack.'}}
    (folder / 'tokens.json').write_text(json.dumps(measured, indent=2, ensure_ascii=False) + '\n')
    css = ['/* Observed values, not canonical brand roles. See DESIGN.md and tokens.json. */', ':root {']
    for index, (color, _) in enumerate(colors.most_common(18), start=1):
        if not any(c in color for c in [';', '{', '}', '\n']):
            css.append(f'  --observed-color-{index:02}: {color};')
    for index, (font, _) in enumerate(fonts.most_common(12), start=1):
        if not any(c in font for c in [';', '{', '}', '\n']):
            css.append(f'  --observed-font-{index:02}: {font};')
    css.append('}')
    (folder / 'tokens.css').write_text('\n'.join(css) + '\n')
    components = '\n'.join('| ' + cell(name) + ' | ' + cell(description) + ' |' for name, description in spec['components'])
    measurements = ['| Sample | Requested family | Size / weight | Text / surface |', '|---|---|---|---|']
    for sample in styles[:10]:
        measurements.append('| ' + ' | '.join([cell(sample.get('tag')), cell(sample.get('font')), cell(str(sample.get('size', 'unrecorded'))+' / '+str(sample.get('weight','unrecorded'))), cell(str(sample.get('color','unrecorded'))+' / '+str(sample.get('background','unrecorded')))]) + ' |')
    if not styles:
        measurements = ['No usable computed-style samples were returned. The token files preserve unconfirmed roles rather than inventing measurements.']
    links = f'[Live source]({source["live"]})'
    if source.get('refero'):
        links += f' · [Refero reference]({source["refero"]})'
    image = '\n![Supplied reference; original capture date unknown](refero-reference.jpg)\n' if (folder/'refero-reference.jpg').exists() else ''
    evidence = f'Live observation: `{live.get("capturedAt", "unrecorded")}` at `{live.get("url", "unrecorded")}`; viewport `{live.get("viewport", "unrecorded")}`.'
    doc = f'''# {source['name']} — design-system study

{links} · study prepared 2026-10-02 · **{note[0]}**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.
{image}
## Direction

{note[1]}

## Layout and content hierarchy

{spec['layout']}

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
{components}

## Color and surface roles

{spec['color']}

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

{spec['type']}

{chr(10).join(measurements)}

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

{spec['media']}

## State and motion specification

{spec['states']}

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

{note[3]}

{evidence}

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
'''
    (folder / 'DESIGN.md').write_text(doc)

print(json.dumps({'designDocs': len(sources), 'tokenPairs': len(sources)}))
