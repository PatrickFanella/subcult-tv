"""Build local reference documents from preserved browser observations.

This never edits Studio brand packs or retrieves external assets.
"""
from pathlib import Path
import json, shutil, hashlib, html, re
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
sites = json.loads((ROOT / 'sites.json').read_text())
notes = json.loads((ROOT / 'editorial-notes.json').read_text())
labels = {'visual': 'Desktop visual + styles', 'partial': 'Partial visual / styled document', 'source-only': 'Live render unavailable'}

def dump(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

def cell(value):
    return str(value or '—').replace('|', '\\|').replace('\n', ' ')[:180]

cards, rows = [], []
for site in sites:
    sid, name, url = site['id'], site['name'], site['url']
    folder = ROOT / sid
    note = notes[sid]
    observations = {p.stem: json.loads(p.read_text()) for p in sorted((folder / 'evidence').glob('*.json'))}
    best = observations.get('limited-style', observations.get('settled', observations['observation']))
    if not best.get('samples'):
        best = observations['observation']
    excluded = note['status'] == 'source-only'
    samples = [] if excluded else best.get('samples', [])
    body = next((s for s in samples if s.get('tag') == 'BODY'), {})
    transparent = {'rgba(0, 0, 0, 0)', 'transparent', None, ''}
    bg = body.get('background')
    bg = None if bg in transparent else bg
    fg = body.get('color') or None
    palette = [] if excluded else best.get('colors', [])
    fonts = [] if excluded else best.get('fonts', [])
    sizes = []
    for sample in samples:
        key = tuple(sample.get(k) for k in ('tag', 'font', 'size', 'weight'))
        if key not in [k for k, _ in sizes]:
            sizes.append((key, sample))
    sizes = sizes[:12]
    evidence = []
    for state, obs in observations.items():
        source = obs.get('screenshotPath')
        local = None
        if source and Path(source).is_file():
            (folder / 'images').mkdir(exist_ok=True)
            target = folder / 'images' / (state + '.png')
            shutil.copy2(source, target)
            local = str(target.relative_to(folder))
        evidence.append({'state': state, 'observation': 'evidence/' + state + '.json', 'image': local,
                         'capturedAt': obs.get('capturedAt'), 'url': obs.get('url'), 'viewport': obs.get('viewport'),
                         'imageMeaning': 'Browser error page; not site design' if excluded else
                         ('Initial state; may show intro or loader' if state == 'observation' else 'Later state; read guide for visibility limits')})
    token = {
        'brand': name, 'direction': note['direction'], 'status': 'reference-observation',
        'schema': 'studio-reference-v1', 'source': {'url': url, 'inspectionDate': '2026-10-02',
        'confidence': note['status'], 'observationFiles': [e['observation'] for e in evidence]},
        'colors': {'bg': bg, 'fg': fg, 'accent': None, 'secondary': None},
        'fonts': {'body': body.get('font'), 'display': None, 'label': None}, 'spacing': [],
        'observations': {'colorFrequencies': palette, 'fontFrequencies': fonts,
                         'elementStyles': [s for _, s in sizes],
                         'rootVariables': {} if excluded else best.get('rootVariables', {})},
        'interpretation': {
            'colors': 'bg and fg are computed BODY values, not proof of the visible hero surface. Transparent body backgrounds remain null. Accent/secondary roles require manual confirmation.',
            'fonts': 'Computed family stacks are requested styles, not proof that every font downloaded. Role descriptions are in GUIDE.md; unconfirmed role mappings remain null.',
            'spacing': 'No canonical spacing scale was established. Individual observed padding, gap and dimensions remain in elementStyles and raw evidence.',
            'visibility': note['limits'],
            'ownership': 'Third-party reference only. No font binaries, logo masters or production brand authorization included.'}}
    dump(folder / 'tokens.json', token)
    css = ['/* Reference observations, not an official or production design system.',
           '   See GUIDE.md and tokens.json for evidence and visibility limits. */', ':root {']
    for key, value in [('bg', bg), ('fg', fg)]:
        if value:
            css.append(f'  --reference-{key}: {value};')
    if body.get('font'):
        css.append('  --reference-font-body: ' + body['font'] + ';')
    css.append('}')
    (folder / 'tokens.css').write_text('\n'.join(css) + '\n')
    table = ['| Element / sample | Family | Size / weight | Line height / tracking |', '|---|---|---|---|']
    for _, s in sizes:
        table.append('| ' + ' | '.join([cell(s.get('tag') + ': ' + s.get('text', '')[:50]), cell(s.get('font')), cell(str(s.get('size')) + ' / ' + str(s.get('weight'))), cell(str(s.get('lineHeight', 'unrecorded')) + ' / ' + str(s.get('letterSpacing', 'unrecorded')))]) + ' |')
    colors = '\n'.join(f'- `{c}` — {count} sampled uses.' for c, count in palette[:10]) or 'No current site palette extracted.'
    evidence_links = '\n'.join(f'- [{e["state"]} observation]({e["observation"]})' + (f' · [saved image]({e["image"]})' if e['image'] else ' · no saved image for this pass') for e in evidence)
    preview = next((e['image'] for e in evidence if e['state'] == 'settled' and e['image']), None) or next((e['image'] for e in evidence if e['image']), None)
    image = f'\n![Captured desktop state; see evidence limits]({preview})\n' if preview else ''
    guide = f'''# {name} — design-system reference

Source: [{name}]({url}) · inspected 2026-10-02 · {note['category']}.

Evidence level: **{labels[note['status']]}**. {note['limits']}
{image}
## Direction and identity

{note['direction']}

This is a reconstruction from the public site, not a published design system supplied by its owner. It describes the captured page and separates measured styles from design interpretation.

## Layout and hierarchy

{note['layout']}

## Component grammar

{note['components']}

The raw observations include sampled borders, radii, padding, gaps and positioning. Those values belong to specific elements at the recorded viewport; they do not establish a site-wide spacing or radius scale.

## Typography

{note['typography']}

The table records computed element styles from the latest usable observation. Loader, split-text, hidden or overlay-covered elements may still be sampled. Family names identify the CSS request; font download and licensing were not independently verified.

{chr(10).join(table) if samples else 'No current site typography samples are suitable for extraction.'}

## Color and surfaces

The frequency list below combines sampled foreground and background values. It is evidence of CSS usage, not a semantic token map. Photo, video and canvas colors are excluded; third-party cookie controls may still occur in raw evidence. BODY colors in the token file describe that element and may differ from an overlaid hero surface.

{colors}

## Motion, responsive behavior and interaction

This review captured desktop opening states and, where available, a later or scrolled state. Raw evidence includes readable CSS media queries, reduced-motion declarations and canvas metadata when accessible. Their presence does not prove runtime behavior; cross-origin stylesheets and canvas artwork limit CSS inspection. Timing curves, keyboard focus, small-screen layouts and interaction completion need dedicated verification before adaptation.

## Expressing this in Studio

{note['adaptation']}

Keep the written direction in `GUIDE.md`, measured values and uncertainty in `tokens.json`, a minimal reference CSS view in `tokens.css`, and captured images beside their provenance. This follows Studio's separation of guide, tokens and previews. A production pack would additionally require approved identity assets, explicit role mappings, responsive specifications, licensed fonts and verified interactive states. Reference screenshots do not grant reuse rights for third-party marks or imagery.

## Evidence and open questions

{note['limits']}

{evidence_links}

See [SOURCES.md](SOURCES.md) for provenance and [manifest.json](manifest.json) for artifact hashes. Follow-up work should resolve the stated visibility limits, inspect at least one relevant inner page, and verify component states at narrow and wide viewports before claiming a complete system.
'''
    (folder / 'GUIDE.md').write_text(guide)
    source = f'''# {name} — sources and capture scope

- Requested source: [{name}]({url}).
- Inspection date: 2026-10-02.
- Method: T3 collaborative browser navigation, desktop screenshots, computed element styles and readable stylesheet declarations.
- Classification: {labels[note['status']]}.

{note['limits']}

{evidence_links}

Initial and later observations are preserved separately. The browser client changed during later passes and screenshot capture stopped working, while navigation and DOM inspection continued. Missing later screenshots are not replaced by a claim of visual verification. Loaders and browser error images remain labeled as such.

The reference contains screenshots and style observations, not downloaded font binaries, original logos or extracted media masters. Font and asset rights remain with their owners. No account was created, purchase submitted, form sent or consent setting changed for this inspection.
'''
    if excluded:
        source += '\nHistorical background: [How to Build a Low-tech Website (2018)](https://solar.lowtechmagazine.com/2018/09/how-to-build-a-low-tech-website/), inspected earlier in this session. It describes static delivery, dithered/category-tinted imagery and avoiding custom web fonts. A later re-fetch also timed out. This is historical context, not confirmation of the current interface.\n'
    (folder / 'SOURCES.md').write_text(source)
    files = [p for p in folder.rglob('*') if p.is_file() and p.name != 'manifest.json']
    dump(folder / 'manifest.json', {'site': sid, 'source': url, 'inspectionDate': '2026-10-02', 'evidence': evidence,
        'files': [{'path': str(p.relative_to(folder)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size} for p in sorted(files)]})
    rows.append(f'| [{name}]({sid}/GUIDE.md) | {note["category"]} | {labels[note["status"]]} |')
    thumb = f'<img loading="lazy" src="{sid}/{preview}" alt="Captured state of {html.escape(name)}">' if preview else '<div class="empty">No visual capture</div>'
    cards.append(f'<article data-search="{html.escape((name+" "+note["category"]+" "+note["direction"]).lower(), quote=True)}" data-status="{note["status"]}"><a href="{sid}/GUIDE.md">{thumb}</a><div class="text"><small>{html.escape(note["category"])} · {labels[note["status"]]}</small><h2>{html.escape(name)}</h2><p>{html.escape(note["direction"])}</p><p class="limits">{html.escape(note["limits"])}</p><nav><a href="{sid}/GUIDE.md">Guide</a><a href="{sid}/tokens.json">Tokens</a><a href="{sid}/SOURCES.md">Sources</a><a href="{html.escape(url, quote=True)}">Live site ↗</a></nav></div></article>')

counts = Counter(n['status'] for n in notes.values())
(ROOT / 'README.md').write_text('''# Website design references — 2026-10-02

37 site directories: the six earlier recommendations and all 31 supplied URLs. Each contains a written design reference, measured token observations, source notes, raw browser evidence, saved images and a SHA-256 manifest.

Open [the local gallery](index.html) to browse and filter the collection. Read [STUDIO-FORMAT.md](STUDIO-FORMAT.md) for how these references relate to Studio's actual brand-pack format.

These are observed references, not official systems or production-ready Studio packs. ''' + f'{counts["visual"]} have a usable desktop visual and style observation; {counts["partial"]} have partial visual coverage with styled document evidence; {counts["source-only"]} could not be rendered live.\n\n' + '''A loader capture does not prove the underlying page layout. Later T3 screenshot failures are recorded; DOM-only passes do not count as visual proof. No mobile, accessibility or complete motion audit is claimed. No commercial fonts, logo masters or extracted media assets are bundled.

The earlier [ESS reference](../ESS/design-system.md) lives alongside this collection in the Design References repository. The website collection was moved here from Studio at the user’s request; Studio retains its production brand packs.

| Site | Category | Evidence level |
|---|---|---|
''' + '\n'.join(rows) + '''

`sites.json` holds the requested URL registry. `editorial-notes.json` holds the site-specific interpretation. `scripts/build_library.py` assembles the documents from those notes and preserved evidence without contacting external sites or editing brand packs.
''')
(ROOT / 'index.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Studio · website design references</title><style>
*{box-sizing:border-box}body{margin:0;background:#f1efe9;color:#20201d;font:16px/1.5 system-ui,sans-serif}header{padding:40px clamp(20px,5vw,80px);border-bottom:1px solid #ccc8bf}h1{font-size:clamp(28px,4vw,52px);line-height:1.1;margin:0 0 20px}header p{max-width:850px}a{color:inherit}input,select{padding:12px;font:inherit;border:1px solid #aaa;background:white;border-radius:5px}input{width:min(100%,500px)}.controls{display:flex;gap:12px;flex-wrap:wrap}main{padding:30px clamp(20px,5vw,80px);display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}article{background:#fff;border:1px solid #ccc8bf;border-radius:8px;overflow:hidden}article img,.empty{width:100%;aspect-ratio:1.6;object-fit:contain;background:#151515;display:block}.empty{display:grid;place-items:center;color:white}.text{padding:20px}h2{margin:8px 0;font-size:24px}small,.limits{color:#69655c}.limits{font-size:13px}nav{display:flex;gap:16px;flex-wrap:wrap;font-size:14px}article[hidden]{display:none}footer{padding:30px clamp(20px,5vw,80px)}
</style><header><h1>Website design references</h1><p>37 studies of editorial sites, creative portfolios, product interfaces and immersive campaigns. Each guide separates visible design, computed styles and unresolved capture limits.</p><p><a href="README.md">Collection notes</a> · <a href="STUDIO-FORMAT.md">How this maps to Studio</a></p><div class="controls"><label>Search <input id="search" type="search" placeholder="Site, category or design idea"></label><label>Evidence <select id="status"><option value="">All evidence levels</option><option value="visual">Desktop visual + styles</option><option value="partial">Partial visual / styled document</option><option value="source-only">Live render unavailable</option></select></label></div><p id="count" aria-live="polite">37 references</p></header><main>''' + '\n'.join(cards) + '''</main><footer>Captured 2026-10-02. Screenshots may show entry or loading states; read each guide before using a reference. Third-party assets remain owned by their creators.</footer><script>
const search=document.querySelector('#search'),status=document.querySelector('#status'),cards=[...document.querySelectorAll('article')];function filter(){let n=0;for(const c of cards){c.hidden=!(c.dataset.search.includes(search.value.toLowerCase())&&(!status.value||c.dataset.status===status.value));if(!c.hidden)n++}document.querySelector('#count').textContent=n+' references'}search.addEventListener('input',filter);status.addEventListener('change',filter);
</script></html>''')
print(json.dumps({'directories': len(sites), 'evidenceLevels': dict(counts)}))
