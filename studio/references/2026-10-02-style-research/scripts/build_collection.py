"""Assemble the selected style research from source metadata and original notes."""
from pathlib import Path
from collections import defaultdict
import json, hashlib, html

ROOT = Path(__file__).resolve().parents[1]
sources = json.loads((ROOT / 'sources.json').read_text())
notes = json.loads((ROOT / 'editorial-notes.json').read_text())
styles = {
    'Y2K': ('y2k', 'Select for chrome/plastic materials, digital-era objects, desktop-window motifs, futuristic display type or neon instrument-like graphics. These can overlap sci-fi and retro; label the specific branch.', ['desktop-fm', 'gt-planar'], 'A chrome object alone does not establish a complete system. Record material treatment, background scene, control chrome and readable fallback states independently.'),
    'Neo-Brutalism': ('neo-brutalism', 'Select for explicit dark borders, saturated flat surfaces and hard offset shadows with little or no blur. Large type alone is not enough.', ['neobrutalism-components'], 'Use the component library as a concrete starting point: the captured search/action controls have 2px black borders and 4px × 4px zero-blur shadows. Verify focus, pressed, disabled and narrow-screen states before adapting them.'),
    'Memphis': ('memphis', 'Select for playful geometric shapes, asymmetric placement, clashing or candy colors and decorative patterns. Keep strict Bauhaus geometry and colorful portfolio work labeled as adjacent rather than identical.', ['superhi'], 'Create a shape vocabulary and placement rules. Reserve space around text and controls; separate decoration colors from semantic actions.'),
    'Swiss': ('swiss', 'Select for an explicit alignment grid, asymmetric but disciplined columns, clear type hierarchy, restrained ornament and editorial image placement. White space alone is not enough.', ['spacelab', 'fora'], 'Start from column proportions and shared edges, then define a small type hierarchy. FORA is a serif-identity hybrid; Programa is kept as a search-result discrepancy.'),
    'Hand drawn': ('hand-drawn', 'Select for irregular linework, illustrated annotations, hatch fills, expressive strokes or sketch-like output. Distinguish illustration, generated drawing and ordinary interface controls.', ['notion', 'excalidraw', 'roughjs'], 'A drawn aesthetic needs repeatable stroke/fill/placement rules. Use illustrations to explain or annotate; keep interaction labels legible and their focus states clear.'),
    'Retro': ('retro', 'Select for a specific historical medium or period: arcade/pixel interfaces, soda-shop lettering, record sleeves, print labels or analog photographic texture. Name the reference rather than applying an undifferentiated nostalgia filter.', ['frankys', 'olipop', 'little-amps'], 'Keep period-specific display type and texture away from long reading and essential task feedback. Campaign colors and photographed objects are not automatically permanent brand tokens.'),
    'Minimalist': ('minimalist', 'Select for a reduced interface vocabulary, deliberate negative space, restrained color and a clear content hierarchy. Minimalism can support dense content; it does not require empty pages.', ['mike-matas', 'everlane', 'teenage-engineering'], 'Write rules for spacing, imagery and hierarchy instead of only removing decoration. Distinguish sparse marketing pages from the fuller controls required by commerce or product use.')
}
for source in sources:
    sid = source['id']; name = source['name']; folder = ROOT / 'examples' / sid
    folder.mkdir(parents=True, exist_ok=True)
    fit, observation, study, limits = notes[sid]
    image = 'refero-reference.jpg' if (folder / 'refero-reference.jpg').exists() else None
    live = (folder / 'live-observation.json').exists()
    provenance = dict(source, fetchedDate='2026-10-02', referenceImageCaptureDate='unknown',
                      evidence='Refero-supplied screenshot visually reviewed; interpreted source summary reviewed' if image else 'Official site/documentation and live computed styles',
                      liveStyleObservation=live, newLiveScreenshot=False)
    (folder / 'SOURCES.json').write_text(json.dumps(provenance, indent=2) + '\n')
    links = f'[Live site]({source["live"]})'
    if source.get('refero'):
        links += f' · [Refero entry]({source["refero"]})'
    visual = f'\n![Refero-supplied reference; original capture date unknown]({image})\n' if image else ''
    guide = f'''# {name}

{links} · reviewed 2026-10-02 · **{fit}**.
{visual}
[Read the design-system study](DESIGN.md) · [Measured token observations](tokens.json) · [CSS observation view](tokens.css)

## What the reference shows

{observation}

## What to document next

{study}

## Evidence and differences

{limits}

''' + ('The saved image is supplied by Refero. It was retrieved and visually inspected for this research; its original capture date is unknown. It is not a new screenshot of the live site. Refero’s written system is interpreted and normalized, so its roles and recommendations remain secondary evidence.\n\n' if image else 'No new screenshot is available. The official source and computed styles support this entry; they do not establish a full visual audit.\n\n') + ('[Live computed-style observation](live-observation.json) records the actual page URL, viewport and sampled values.\n\n' if live else 'A live computed-style observation was not captured for this example.\n\n') + '''The study does not verify mobile behavior, accessibility, complete motion, inner-page components or task completion. A complete system guide should inspect those states before establishing global tokens. No font binaries, logos or production identity assets were copied.

See [SOURCES.json](SOURCES.json) for attribution. The classification is an editorial assessment, not a category certified by the site owner.
'''
    (folder / 'GUIDE.md').write_text(guide)

for name, (slug, criteria, preferred, next_step) in styles.items():
    folder = ROOT / 'styles' / slug; folder.mkdir(parents=True, exist_ok=True)
    matches = [s for s in sources if s['category'] == name]
    if name == 'Neo-Brutalism':
        related = ['slush']
    else:
        related = []
    rows = []
    for s in matches + [s for s in sources if s['id'] in related]:
        rows.append(f'| [{s["name"]}](../../examples/{s["id"]}/GUIDE.md) | {notes[s["id"]][0]} |')
    recommendation = ', '.join(f'[{next(s["name"] for s in sources if s["id"] == sid)}](../../examples/{sid}/GUIDE.md)' for sid in preferred)
    text = f'''# {name} — selection guide

Working criteria: {criteria}

Start with: {recommendation}.

| Example | Match / qualification |
|---|---|
''' + '\n'.join(rows) + f'''\n
## From reference to design system

{next_step}

Record the component vocabulary, typography roles, semantic color mapping, spacing, image/illustration rules and motion fallback. Treat single screenshots as composition evidence; do not infer a global scale or complete interaction system from them.

This is a selected research set, not an exhaustive history of the style. The examples include strong matches, hybrids and comparison candidates so differences remain visible. Follow each guide's evidence notes before adapting a reference.
'''
    (folder / 'GUIDE.md').write_text(text)

rows = '\n'.join(f'| [{name}](styles/{v[0]}/GUIDE.md) | ' + ', '.join(next(s['name'] for s in sources if s['id'] == sid) for sid in v[2]) + ' |' for name, v in styles.items())
(ROOT / 'README.md').write_text('''# Style research and Refero review — 2026-10-02

Seven style guides and 24 example/candidate directories, including four additional Refero picks. Twenty Refero-supplied screenshots were visually inspected; all 24 examples also have live computed-style observations and a DESIGN.md study with token files. The screenshots' original capture dates are unknown. T3 screenshot capture failed, so this collection does not claim new live visual captures.

- [Browse the selected examples](index.html).
- [Read the Refero review](REFERO-REVIEW.md), including mismatches between screenshots and written descriptions.
- [Read the programmatic export findings](EXPORT-FINDINGS.md).

| Style | Recommended starting points |
|---|---|
''' + rows + '''

Additional Refero picks: [Slush](examples/slush/GUIDE.md), [Steep](examples/steep/GUIDE.md), [Wise](examples/wise/GUIDE.md) and [Cursor](examples/cursor/GUIDE.md). These were selected for specific visual mechanisms, not a claim that each originated a new style.

Each example has original research notes, a DESIGN.md study, measured token observations and source attribution. The collection preserves selected reference images; it does not copy Refero's full DESIGN.md exports or claim that interpreted tokens are official systems. No bulk archive was downloaded. Existing studies in the neighboring website collection remain unchanged.
''')
cards = []
for s in sources:
    sid = s['id']; name = html.escape(s['name']); picture = ROOT / 'examples' / sid / 'refero-reference.jpg'
    visual = f'<img loading="lazy" src="examples/{sid}/refero-reference.jpg" alt="Refero reference image of {name}">' if picture.exists() else '<div class="empty">Live styles / official documentation<br>No new screenshot</div>'
    cards.append(f'<article data-category="{html.escape(s["category"])}"><a href="examples/{sid}/DESIGN.md">{visual}</a><div><small>{html.escape(s["category"])}</small><h2>{name}</h2><p>{html.escape(notes[sid][0])}</p><a href="examples/{sid}/DESIGN.md">Design study</a> · <a href="{html.escape(s["live"],quote=True)}">Live site ↗</a></div></article>')
options = ''.join(f'<option>{html.escape(name)}</option>' for name in [*styles, 'Innovative'])
(ROOT / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Design References · Style research</title><style>*{box-sizing:border-box}body{margin:0;background:#f2f0eb;color:#222;font:16px/1.5 system-ui}header{padding:40px 5vw;border-bottom:1px solid #ccc}header p{max-width:850px}h1{font-size:clamp(30px,4vw,50px);line-height:1.1}a{color:inherit}select{padding:10px;font:inherit}main{padding:30px 5vw;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}article{background:white;border:1px solid #ccc;border-radius:8px;overflow:hidden}article img,.empty{width:100%;aspect-ratio:1.6;object-fit:contain;background:#ddd}.empty{display:grid;place-content:center;text-align:center}article>div{padding:20px}h2{margin:5px 0}small{color:#666}article[hidden]{display:none}</style><header><h1>Seven styles, selected references</h1><p>24 examples and comparison candidates. Images are supplied by Refero and may represent earlier designs; open each guide for qualifications and source differences.</p><p><a href="README.md">Research index</a> · <a href="REFERO-REVIEW.md">Refero review</a> · <a href="EXPORT-FINDINGS.md">Programmatic export</a></p><label>Style <select id="category"><option value="">All</option>''' + options + '''</select></label><p id="count" aria-live="polite">24 references</p></header><main>''' + '\n'.join(cards) + '''</main><script>const select=document.querySelector('#category'),cards=[...document.querySelectorAll('article')];select.addEventListener('change',()=>{let n=0;for(const card of cards){card.hidden=!!select.value&&card.dataset.category!==select.value;if(!card.hidden)n++}document.querySelector('#count').textContent=n+' references'});</script></html>''')
print(json.dumps({'styles':len(styles),'examples':len(sources),'referenceImages':len(list(ROOT.glob('examples/*/refero-reference.jpg'))),'liveStyleObservations':len(list(ROOT.glob('examples/*/live-observation.json')))}))
