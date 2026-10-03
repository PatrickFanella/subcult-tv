#!/usr/bin/env python3
"""Build only the selected SUBCULT Gitea assets, with byte provenance."""
import hashlib
import json
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BRAND = ROOT / "branding/library/brands/subcult"
CUSTOM = HERE / "custom"
ASSETS = CUSTOM / "public/assets"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    css = ASSETS / "css/theme-subcult-studio.css"
    css.parent.mkdir(parents=True, exist_ok=True)
    selected = ASSETS / "subcult-studio"
    selected.mkdir(parents=True, exist_ok=True)
    sources = []

    def copy(source, destination):
        shutil.copyfile(source, destination)
        sources.append({"source": str(source.relative_to(ROOT)),
                        "destination": str(destination.relative_to(CUSTOM)),
                        "sha256": digest(source)})

    for family, weight, index in [("Space-Grotesk", "Regular", 0),
                                 ("Space-Grotesk", "Bold", 1),
                                 ("Oswald", "Bold", 1),
                                 ("JetBrains-Mono", "Regular", 0),
                                 ("JetBrains-Mono", "Bold", 1)]:
        copy(BRAND / f"fonts/{family}-{index}.ttf", selected / f"{family}-{weight}.ttf")
    for source in sorted((BRAND / "fonts").glob("*-OFL.txt")):
        copy(source, selected / source.name)
    for target, source in {"mark-dark.svg": "mark-compact-primary-outlined.svg",
                           "mark-primary.svg": "mark-primary-outlined.svg",
                           "favicon.svg": "mark-compact-primary-outlined.svg"}.items():
        copy(BRAND / "logos" / source, selected / target)

    baseline = re.sub(r"gitea-theme-meta-info\s*\{[^}]*\}", "",
                      (HERE / "upstream/theme-gitea-dark.css").read_text(), count=1)
    css.write_text("/* Gitea 1.27.3 dark baseline, MIT; see GITEA-LICENSE.txt. */\n"
                   + baseline
                   + "\n" + (HERE / "theme.css").read_text())
    # Gitea's theme URL is stable across custom CSS edits. A versioned, scoped
    # stylesheet makes logo replacements visible through browser/edge caches.
    logo_css = ASSETS / "css/subcult-logo-bcd-20261003.css"
    logo_css.write_text(':root[data-theme="subcult-studio"] #navbar-logo img { content: url("../subcult-studio/mark-dark.svg?v=logo-bcd-20261003"); }\n'
                        ':root[data-theme="subcult-studio"] .home > div:first-child .logo { content: url("../subcult-studio/mark-primary.svg?v=logo-bcd-20261003"); }\n')
    header = CUSTOM / "templates/custom/header.tmpl"
    header.parent.mkdir(parents=True, exist_ok=True)
    header.write_text('<link rel="stylesheet" href="/assets/css/subcult-logo-bcd-20261003.css">\n')
    copy(HERE / "upstream/GITEA-LICENSE.txt", selected / "GITEA-LICENSE.txt")
    provenance = {
        "brand_source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "brand_source": "https://git.subcult.tv/subculture-collective/subcult-tv",
        "theme_name": "subcult-studio", "gitea_version": "1.27.3",
        "upstream": "https://github.com/go-gitea/gitea/blob/v1.27.3/web_src/css/themes/theme-gitea-dark.css",
        "upstream_sha256": digest(HERE / "upstream/theme-gitea-dark.css"),
        "brand_tokens_sha256": digest(BRAND / "tokens.json"),
        "authored_css_sha256": digest(HERE / "theme.css"),
        "generated_css_sha256": digest(css),
        "generated_logo_css_sha256": digest(logo_css),
        "generated_header_sha256": digest(header), "assets": sources,
    }
    (HERE / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    archive = HERE / "subcult-studio-gitea.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(CUSTOM.rglob("*")):
            if path.is_file():
                z.write(path, str(path.relative_to(HERE)))
        for filename in ["README.md", "verification.md", "provenance.json"]:
            z.write(HERE / filename, filename)
    print(f"Built {css.relative_to(ROOT)} and {archive.name}")


if __name__ == "__main__":
    build()
