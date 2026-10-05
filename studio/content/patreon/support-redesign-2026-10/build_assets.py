#!/usr/bin/env python3
"""Render only this Patreon review pack from the existing SUBCULT sources."""

import copy
import hashlib
import html
import json
import os
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BRAND = ROOT / "brands/subcult"
ASSETS = HERE / "assets"
SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text(x, y, value, size, family="Oswald", fill="#100b19", weight="700"):
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}">{html.escape(value)}</text>')


def mark(x, y, size):
    node = copy.deepcopy(ET.parse(BRAND / "logos/mark-primary-outlined.svg").getroot())
    node.set("x", str(x))
    node.set("y", str(y))
    node.set("width", str(size))
    node.set("height", str(size))
    return ET.tostring(node, encoding="unicode")


def canvas(w, h, body, label):
    return (f'<svg xmlns="{SVG}" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'role="img"><title>{html.escape(label)}</title>'
            f'<rect width="{w}" height="{h}" fill="#8b5cf6"/>{body}</svg>')


def main():
    ASSETS.mkdir(exist_ok=True)
    designs = {}
    cover = (mark(220, 112, 400)
             + text(720, 165, "SUBCULT / SUPPORT THE STUDIO", 30, "JetBrains Mono")
             + text(720, 340, "KEEP THE WORK GOING.", 130)
             + text(720, 425, "Independent software, sound and culture.", 44, "Space Grotesk", weight="400")
             + '<rect x="720" y="485" width="760" height="12" fill="#00ff88"/>')
    designs["cover"] = canvas(2500, 625, cover, "SUBCULT — Keep the work going. Independent software, sound and culture.")
    designs["avatar"] = canvas(1024, 1024, mark(190, 190, 644), "SUBCULT S/C mark on purple")
    for number, name in enumerate(["Supporter", "Backer", "Patron", "Groceries", "Rent"], start=1):
        body = (text(60, 78, f"SUBCULT / {number:02}", 26, "JetBrains Mono")
                + text(60, 228, name.upper(), 100)
                + text(60, 314, "SUPPORT THE STUDIO", 30, "Space Grotesk")
                + '<rect x="60" y="354" width="530" height="8" fill="#00ff88"/>'
                + mark(670, 82, 240))
        designs[f"tier-{name.lower()}"] = canvas(920, 400, body, f"SUBCULT — {name}. Support the studio.")
    body = (mark(140, 126, 330)
            + text(560, 205, "SUBCULT / THE STUDIO", 30, "JetBrains Mono")
            + text(140, 635, "KEEP THE WORK", 155)
            + text(140, 810, "GOING.", 155)
            + text(140, 938, "Support the studio on Patreon.", 46, "Space Grotesk", weight="400")
            + '<rect x="1440" y="760" width="300" height="180" fill="#00ff88"/>'
            + text(140, 1008, "support.subcult.tv", 28, "JetBrains Mono"))
    designs["support-post"] = canvas(1920, 1080, body, "Keep the work going. Support the studio on Patreon at support.subcult.tv.")

    # Resolve fonts from this checkout without modifying the installed/global font config.
    with tempfile.TemporaryDirectory(prefix="subcult-patreon-fonts-") as directory:
        config = Path(directory) / "fonts.conf"
        config.write_text(f'<?xml version="1.0"?><fontconfig><dir>{html.escape(str(BRAND / "fonts"))}</dir>'
                          f'<cachedir>{html.escape(directory)}</cachedir></fontconfig>')
        env = {**os.environ, "FONTCONFIG_FILE": str(config)}
        for name, source in designs.items():
            path = ASSETS / f"{name}.svg"
            path.write_text(source + "\n")
            ET.parse(path)
            subprocess.run(["rsvg-convert", str(path), "-o", str(path.with_suffix(".png"))], env=env, check=True)
        subprocess.run(["rsvg-convert", str(ASSETS / "cover.svg"), "-w", "1600", "-h", "400",
                        "-o", str(ASSETS / "cover-legacy.png")], env=env, check=True)

    sheet = Image.new("RGB", (1440, 1360), "#f0ece4")
    draw = ImageDraw.Draw(sheet)
    draw.text((32, 18), "SUBCULT / PATREON ARTWORK REVIEW / 2026-10-02", fill="#100b19")
    with Image.open(ASSETS / "cover.png") as original:
        sheet.paste(original.resize((1376, 344)), (32, 52))
    for index, name in enumerate(["supporter", "backer", "patron", "groceries", "rent"]):
        with Image.open(ASSETS / f"tier-{name}.png") as original:
            sheet.paste(original.resize((644, 280)), (32 + (index % 2) * 716, 426 + (index // 2) * 300))
    sheet.save(ASSETS / "review-sheet.png")

    sources = [BRAND / "GUIDE.md", BRAND / "tokens.json", BRAND / "logos/mark-primary-outlined.svg",
               BRAND / "logos/master.svg", *sorted((BRAND / "fonts").glob("*.ttf")), Path(__file__).resolve()]
    outputs = sorted(ASSETS.glob("*.svg")) + sorted(ASSETS.glob("*.png"))
    manifest = {"prepared_at": "2026-10-02", "status": "review-draft", "source_revision": "784a1ac0706779a02ab51deb2ad93c936c621660",
                "mark_policy": "Existing outlined mark nested intact; placement and uniform scaling only",
                "sources": [{"path": str(path.relative_to(ROOT)), "sha256": digest(path)} for path in sources],
                "assets": []}
    for path in outputs:
        row = {"path": str(path.relative_to(HERE)), "sha256": digest(path)}
        if path.suffix == ".png":
            with Image.open(path) as picture:
                row["width"], row["height"] = picture.size
        manifest["assets"].append(row)
    (HERE / "asset-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Rendered {len(designs)} SVG masters, 9 upload PNGs and one review sheet.")


if __name__ == "__main__":
    main()
