#!/usr/bin/env python3
"""Check packaged assets and the theme's selected text/background roles."""
import hashlib
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def luminance(color):
    rgb = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb]
    return sum(c * w for c, w in zip(linear, (.2126, .7152, .0722)))


def audit():
    provenance = json.loads((HERE / "provenance.json").read_text())
    assets = HERE / "custom/public/assets"
    for record in provenance["assets"]:
        source = ROOT / record["source"]
        packaged = HERE / "custom" / record["destination"]
        assert hashlib.sha256(source.read_bytes()).hexdigest() == record["sha256"], record["source"]
        assert packaged.read_bytes() == source.read_bytes(), record["destination"]
        if packaged.suffix == ".svg":
            ET.parse(packaged)
    css = (assets / "css/theme-subcult-studio.css").read_text()
    assert hashlib.sha256(css.encode()).hexdigest() == provenance["generated_css_sha256"]
    assert hashlib.sha256((assets/'css/subcult-logo-bcd-20261003.css').read_bytes()).hexdigest() == provenance['generated_logo_css_sha256']
    assert hashlib.sha256((HERE/'custom/templates/custom/header.tmpl').read_bytes()).hexdigest() == provenance['generated_header_sha256']
    assert css.count("gitea-theme-meta-info {") == 1, "Theme must have one metadata block"
    for path in re.findall(r'url\("([^\"]+)"\)', css):
        assert (assets / "css" / urlsplit(path).path).resolve().is_file(), path
    pairs = [
        ("Body text", "#e8e0d0", "#0a0a0a"),
        ("Muted metadata", "#a399ae", "#131116"),
        ("Purple header ink", "#100b19", "#8b5cf6"),
        ("Green action ink", "#100b19", "#00ff88"),
        ("Watch/star controls", "#f0ece4", "#100b19"),
        ("Inputs", "#f0ece4", "#0e0c11"),
        ("Added diff text", "#99ffd0", "#11251b"),
        ("Removed diff text", "#ffa8ba", "#2a171e"),
        ("Warning text", "#ffdc8a", "#3a2d16"),
        ("Error text", "#ff839d", "#2a171e"),
        ("Info text", "#a9caff", "#192336"),
        ("Merged badge ink", "#100b19", "#bba0ff"),
        ("Focus ring on surface", "#bba0ff", "#131116"),
    ]
    for name, color in [("green", "#00e67a"), ("red", "#ff6f8f"),
                        ("orange", "#ffad66"), ("yellow", "#f0ca73"),
                        ("blue", "#97bcff"), ("purple", "#ab8cf6"),
                        ("teal", "#79d8ce"), ("pink", "#f78bc3")]:
        pairs.append((f"Linked {name} badge hover", "#100b19", color))
    ratios = []
    for role, foreground, background in pairs:
        levels = sorted([luminance(foreground), luminance(background)])
        ratio = (levels[1] + .05) / (levels[0] + .05)
        minimum = 3 if role.startswith("Focus ring") else 4.5
        assert ratio >= minimum, f"{role}: {ratio:.2f}:1 < {minimum}:1"
        ratios.append({"role": role, "foreground": foreground, "background": background,
                       "ratio": round(ratio, 2), "minimum": minimum})
    with zipfile.ZipFile(HERE / "subcult-studio-gitea.zip") as archive:
        assert archive.testzip() is None
        expected = {str(p.relative_to(HERE)) for p in (HERE / "custom").rglob("*") if p.is_file()}
        expected |= {"README.md", "verification.md", "provenance.json"}
        assert set(archive.namelist()) == expected, "Archive selection differs from package"
    report = {"gitea_version": "1.27.3", "asset_checks": "passed",
              "svg_parse": "passed", "archive_selection": "passed", "contrast": ratios}
    (HERE / "contrast-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Passed: {len(provenance['assets'])} asset hashes, SVG parsing, archive selection, {len(ratios)} contrast pairs")
    print(f"Lowest text contrast: {min(r['ratio'] for r in ratios if r['minimum'] == 4.5)}:1")


if __name__ == "__main__":
    audit()
