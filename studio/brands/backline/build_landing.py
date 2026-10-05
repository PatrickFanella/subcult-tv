#!/usr/bin/env python3
"""Capture Backline's landing page as a standalone private Studio preview.

Run with --product-root pointing to a Backline checkout with locked frontend
dependencies installed. React source remains owned by the product repository.
"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


HERE = Path(__file__).resolve().parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--product-root', type=Path, required=True)
    args = parser.parse_args()
    product = args.product_root.resolve()
    frontend = product / 'frontend'
    if not (frontend / 'node_modules/esbuild').is_dir():
        raise SystemExit('Install the product frontend lockfile with npm ci first.')
    revision = subprocess.check_output(
        ['git', '-C', str(product), 'rev-parse', 'HEAD'], text=True
    ).strip()
    source_paths = [
        'frontend/src/pages/BacklineLanding.tsx',
        'frontend/src/pages/backline-landing.css',
        'frontend/package.json',
        'frontend/package-lock.json',
        'docs/design/BACKLINE.md',
    ]
    dirty = subprocess.check_output(
        ['git', '-C', str(product), 'status', '--porcelain', '--', *source_paths],
        text=True,
    ).strip()
    if dirty:
        raise SystemExit('Commit the product landing sources before capturing them.')
    sources = []
    for relative in source_paths:
        src = product / relative
        target = HERE / 'landing-source' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(src.read_bytes())
        sources.append({'repository_path': relative,
                        'snapshot_path': str(target.relative_to(HERE)),
                        'sha256': digest(src)})

    # Use the exact product component, React and router dependencies. Only CSS
    # is separated into a local file; no product API or credential is needed.
    with tempfile.TemporaryDirectory(prefix='backline-landing-') as directory:
        bundle = Path(directory) / 'render.cjs'
        driver = f"""
const esbuild = require({json.dumps(str(frontend / 'node_modules/esbuild'))});
esbuild.buildSync({{
  stdin: {{
    contents: "import {{ createElement }} from 'react'; import {{ renderToStaticMarkup }} from 'react-dom/server'; import {{ MemoryRouter }} from 'react-router-dom'; import BacklineLanding from './src/pages/BacklineLanding'; process.stdout.write(renderToStaticMarkup(createElement(MemoryRouter, null, createElement(BacklineLanding))));",
    resolveDir: {json.dumps(str(frontend))}, loader: 'tsx'
  }},
  outfile: {json.dumps(str(bundle))}, bundle: true, platform: 'node',
  format: 'cjs', jsx: 'automatic', loader: {{ '.css': 'empty' }}
}});
"""
        subprocess.run(['node', '-e', driver], check=True)
        markup = subprocess.check_output(['node', str(bundle)], text=True)

    markup = markup.replace('/brand/backline/', 'product/')
    markup = markup.replace('href="/"', 'href="landing.html"')
    # Studio has no auth server. The preview presents pilot information;
    # the captured product component retains the real /login links.
    markup = markup.replace('href="/login"', 'href="#pilot"')
    markup = markup.replace('Pilot sign in', 'Pilot information')
    css = (frontend / 'src/pages/backline-landing.css').read_text()
    (HERE / 'landing.css').write_text(css.replace('/brand/backline/', 'product/'))
    script = """const button = document.querySelector('.bl-menu-button');
const nav = document.getElementById('bl-navigation');
function setMenu(open) {
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
}
button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    setMenu(false); button.focus();
  }
});"""
    document = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#8b5cf6">
<title>Backline — Poster Crew landing preview</title>
<link rel="icon" href="product/favicon.svg">
<link rel="stylesheet" href="landing.css">
<style>html{{scroll-behavior:smooth}}body{{margin:0}}.studio-preview-note{{margin:0;padding:12px 5%;background:#100b19;color:#f0ece4;font:12px/1.5 monospace}}.studio-skip{{position:absolute;left:-9999px}}.studio-skip:focus{{left:16px;top:16px;z-index:10;padding:12px;background:#f0ece4;color:#100b19}}@media(prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}</style>
</head><body><a class="studio-skip" href="#main-content">Skip to main content</a>
<p class="studio-preview-note">Private Studio review copy. Pilot sign-in is available in the Backline app; preview links show pilot information.</p>
{markup}<script>{script}</script></body></html>
"""
    (HERE / 'landing.html').write_text(document)
    manifest = {
        'repository': 'https://git.subcult.tv/subculture-collective/backline',
        'revision': revision,
        'sources': sources,
        'adaptations': [
            'Asset URLs resolve to the local product/ directory.',
            'Home resolves to landing.html.',
            'Pilot sign-in links become labeled pilot-information anchors.',
            'Standalone navigation script replaces React menu state.',
            'Private review note and noindex metadata are added.',
        ],
        'files': [{'path': name, 'sha256': digest(HERE / name)}
                  for name in ['landing.html', 'landing.css']],
    }
    (HERE / 'landing-provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Captured landing page from Backline {revision}')


if __name__ == '__main__':
    main()
