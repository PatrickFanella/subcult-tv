#!/usr/bin/env python3
"""Build the website-based Patrick__Eff alternative without touching selected packs."""

import hashlib
import importlib.util
import html
import json
import math
import os
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OLD = ROOT / "branding/library/brands/patrick__eff"
REF = ROOT / "branding/library/references/patrick-variations/mono-outlined.svg"
OUT = HERE / "assets"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
C = {"base": "#282a36", "panel": "#21222c", "line": "#44475a", "paper": "#f8f8f2",
     "body": "#d7d7eb", "muted": "#a5a6b5", "purple": "#bd93f9", "pink": "#ff79c6", "green": "#50fa7b"}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text(x, y, value, size, color="paper", font="Space Grotesk", weight=700):
    return (f'<text x="{x}" y="{y}" fill="{C[color]}" font-family="{font}" '
            f'font-size="{size}" font-weight="{weight}" letter-spacing="-0.02em">{html.escape(value)}</text>')


def label(x, y, value, size=20, color="muted"):
    return text(x, y, value, size, color, "JetBrains Mono", 400)


def line(x1, y1, x2, y2, color="line", width=2):
    return f'<path d="M{x1} {y1}H{x2}" stroke="{C[color]}" stroke-width="{width}"/>' if y1 == y2 else f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{C[color]}" stroke-width="{width}"/>'


def port(x, y, color, size=12):
    return (f'<circle cx="{x}" cy="{y}" r="{size}" fill="{C["panel"]}" stroke="{C[color]}" stroke-width="3"/>'
            f'<circle cx="{x}" cy="{y}" r="{size / 3}" fill="{C[color]}"/>')


def routes(x, y, w, h, stroke=6):
    """A fixed, original routing motif: right-angle cable runs and distinct ports."""
    body = []
    paths = [
        ("purple", [(0, .14), (.42, .14), (.42, .76), (1, .76)]),
        ("pink", [(0, .5), (.24, .5), (.24, .92), (.69, .92), (.69, .34), (1, .34)]),
        ("green", [(0, .84), (.12, .84), (.12, .3), (.83, .3), (.83, .08), (1, .08)]),
    ]
    for color, points in paths:
        points = [(round(x + a * w, 2), round(y + b * h, 2)) for a, b in points]
        d = "M" + " L".join(f"{a},{b}" for a, b in points)
        body.append(f'<path d="{d}" fill="none" stroke="{C["panel"]}" stroke-width="{stroke + 12}"/>')
        body.append(f'<path d="{d}" fill="none" stroke="{C[color]}" stroke-width="{stroke}" stroke-linejoin="round"/>')
        body.append(port(*points[0], color, stroke * 2))
        body.append(port(*points[-1], color, stroke * 2))
    return "".join(body)


def spectrum(x, y, w, h, color="purple"):
    bars = []
    for i in range(31):
        height = h * (.1 + .76 * abs(math.sin(i * .29) * math.cos(i * .08)))
        bars.append(f'<rect x="{x + i * w / 31:.2f}" y="{y + (h - height) / 2:.2f}" width="{w / 49:.2f}" height="{height:.2f}" fill="{C[color]}"/>')
    return "".join(bars)


def mark(x, y, size, dark=False, waveform=True):
    if waveform:
        spec = importlib.util.spec_from_file_location('patrick_waveform', HERE / 'waveform_variations.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        root = module.composite(C['base'] if dark else C['paper'], C['purple'])
    else:
        root = ET.parse(REF).getroot()
        for node in root.iter():
            for key, value in list(node.attrib.items()):
                node.set(key, value.replace('#f3f0ed', C['base'] if dark else C['paper']))
    root.set('x', str(x)); root.set('y', str(y))
    root.set('width', str(size)); root.set('height', str(size))
    return ET.tostring(root, encoding='unicode')


def canvas(w, h, body, title, bg="base"):
    rect = f'<rect width="{w}" height="{h}" fill="{C[bg]}"/>' if bg else ""
    return f'<svg xmlns="{NS}" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>{rect}{body}</svg>'


def frame(w, h, tag):
    return (label(64, 62, "PATRICK__EFF", color="green") + label(w - 300, 62, tag)
            + line(64, 88, w - 64, 88) + line(64, h - 76, w - 64, h - 76)
            + label(64, h - 34, "SOFTWARE / SOUND / CULTURE", 16)
            + label(w - 300, h - 34, "patrickfanella.co", 16, "paper"))


def contrast(a, b):
    def luminance(hexcolor):
        v = [int(hexcolor[i:i+2], 16)/255 for i in (1, 3, 5)]
        v = [n/12.92 if n <= .04045 else ((n+.055)/1.055)**2.4 for n in v]
        return sum(x*y for x,y in zip(v, (.2126,.7152,.0722)))
    la, lb = sorted([luminance(a), luminance(b)])
    return round((lb + .05)/(la + .05), 2)


def main():
    OUT.mkdir(exist_ok=True)
    designs = {}
    designs["mark-light"] = canvas(512, 512, mark(0, 0, 512), "Patrick__Eff — open frame with lavender waveform", None)
    designs["mark-dark"] = canvas(512, 512, mark(0, 0, 512, True), "Patrick__Eff — dark open frame with lavender waveform", None)
    # Put the mark on a panel so decorative runs cannot compete with its silhouette.
    avatar = routes(100, 105, 820, 810, 9) + f'<rect x="205" y="205" width="614" height="614" fill="{C["base"]}"/>' + mark(252, 252, 520)
    designs["avatar"] = canvas(1024, 1024, avatar, "Patrick__Eff PF mark framed by lavender, pink and green cable paths")
    body = (label(640, 85, "PATRICK__EFF / SOFTWARE + SOUND + CULTURE", 20, "green")
            + text(640, 195, "SOFTWARE.", 96) + text(640, 295, "SOUND.", 96, "pink")
            + text(640, 395, "CULTURE.", 96, "green")
            + label(640, 450, "patrickfanella.co", 24, "paper")
            + routes(50, 65, 490, 360, 6) + f'<rect x="180" y="110" width="300" height="290" fill="{C["base"]}"/>' + mark(195, 122, 272))
    designs["banner-social"] = canvas(1500, 500, body, "Patrick__Eff — Software. Sound. Culture. patrickfanella.co")
    body = (frame(2400, 800, "PATCH / 01") + routes(1480, 170, 820, 470, 8)
            + text(88, 270, "SOFTWARE.", 144) + text(88, 420, "SOUND.", 144, "pink")
            + text(88, 570, "CULTURE.", 144, "green")
            + label(94, 655, "BUILT BY PATRICK FANELLA", 24, "paper"))
    designs["banner-wide"] = canvas(2400, 800, body, "Software. Sound. Culture. Built by Patrick Fanella.")
    body = (frame(1080, 1080, "PATCH / 02") + text(64, 254, "SOFTWARE.", 96)
            + text(64, 356, "SOUND.", 96, "pink") + text(64, 458, "CULTURE.", 96, "green") + routes(82, 632, 914, 298, 7))
    designs["identity-square"] = canvas(1080, 1080, body, "Patrick__Eff — Software. Sound. Culture.")
    body = (frame(1080, 1080, "PROCESS / SAMPLE") + label(64, 165, "A NOTE FROM THE WORKBENCH", 20, "pink")
            + text(64, 318, "WORK IN", 112) + text(64, 435, "PROGRESS.", 112)
            + spectrum(66, 500, 940, 310) + label(64, 870, "IDEAS / VERSIONS / WHAT CHANGED", 24, "green")
            + label(64, 922, "Replace this text with a real process note.", 20))
    designs["process-square"] = canvas(1080, 1080, body, "Work in progress — editable process-post sample")
    body = (frame(1920, 1080, "CASE STUDY / SAMPLE") + text(70, 290, "SYSTEMS THAT", 118)
            + text(70, 420, "CONNECT.", 118, "green")
            + text(74, 516, "Software, interfaces and the work between them.", 32, "body", "Inter", 400)
            + routes(80, 650, 1720, 285, 9) + label(90, 610, "SIGNAL", 24, "purple")
            + label(835, 610, "FORM", 24, "pink") + label(1570, 610, "OUTPUT", 24, "green"))
    designs["case-study-landscape"] = canvas(1920, 1080, body, "Systems that connect — illustrative case-study template")
    body = (label(64, 278, "PATRICK__EFF", 32, "green") + line(64, 312, 1016, 312)
            + text(64, 506, "SOFTWARE.", 110) + text(64, 628, "SOUND.", 110, "pink")
            + text(64, 750, "CULTURE.", 110, "green")
            + routes(82, 1020, 900, 460, 9) + label(64, 1590, "patrickfanella.co", 32, "paper")
            + label(64, 1640, "CHICAGO / ONLINE", 22))
    designs["story"] = canvas(1080, 1920, body, "Patrick__Eff — Software. Sound. Culture. patrickfanella.co")
    body = (label(64, 70, "PATRICK__EFF", 24, "green") + text(64, 226, "SOFTWARE.", 86)
            + text(64, 318, "SOUND.", 86, "pink") + text(64, 410, "CULTURE.", 86, "green")
            + routes(770, 95, 340, 330, 5) + line(64, 494, 1136, 494)
            + label(64, 562, "patrickfanella.co", 24, "paper"))
    designs["open-graph"] = canvas(1200, 630, body, "Patrick__Eff — Software. Sound. Culture. patrickfanella.co")
    body = (label(96, 112, "PATRICK__EFF / TITLE CARD", 24, "green") + mark(1360, 135, 410)
            + text(96, 422, "FROM THE", 142) + text(96, 582, "WORKBENCH.", 142, "pink")
            + spectrum(96, 655, 1160, 240, "green") + label(96, 995, "patrickfanella.co", 26, "paper"))
    designs["video-title"] = canvas(1920, 1080, body, "From the workbench — Patrick__Eff video title template")
    body = (frame(1080,1080,"QUOTE / SAMPLE") + text(64,300,"A THOUGHT",96)
            + text(64,408,"WORTH KEEPING.",86,"pink") + routes(84,570,912,310,7)
            + label(64,950,"Replace with a sourced quote and attribution.",19))
    designs["quote-square"] = canvas(1080,1080,body,"Editable quote template — replace with a sourced quote")
    body = (frame(1080,1080,"RELEASE / SAMPLE") + text(64,288,"NEW WORK.",110,"pink")
            + spectrum(64,380,940,340,"green") + label(64,860,"TITLE / FORMAT / DESTINATION",26)
            + label(64,920,"Replace with an actual release.",22))
    designs["release-square"] = canvas(1080,1080,body,"Editable release template — replace with an actual release")
    body = (frame(1600,1000,"CAPTURE / SAMPLE") + f'<rect x="64" y="140" width="1472" height="656" fill="{C["panel"]}" stroke="{C["purple"]}" stroke-width="3"/>'
            + label(140,456,"PLACE A VERIFIED CAPTURE HERE",34,"paper")
            + label(140,516,"Remove private data before export.",24)
            + label(64,866,"WORKFLOW / SOURCE / DATE",24,"green"))
    designs["screenshot-frame"] = canvas(1600,1000,body,"Screenshot frame sample — replace placeholder with verified capture")
    body = (frame(1920,1080,"END CARD") + text(96,350,"FOLLOW THE WORK.",124)
            + text(96,470,"patrickfanella.co",72,"green") + routes(120,620,1640,300,8))
    designs["video-end"] = canvas(1920,1080,body,"Follow the work at patrickfanella.co")
    body = (f'<rect x="96" y="824" width="1320" height="160" fill="{C["panel"]}"/>'
            + f'<rect x="96" y="824" width="8" height="160" fill="{C["pink"]}"/>'
            + text(136,892,"PATRICK__EFF",44) + label(136,946,"SOFTWARE / SOUND / CULTURE",24,"green"))
    designs["video-lower-third"] = canvas(1920,1080,body,"Patrick__Eff lower third with transparent surrounding canvas",None)
    designs["routing-motif"] = canvas(1200, 800, routes(60, 60, 1080, 680, 7), "Decorative lavender, pink and green routing paths", None)
    designs["spectrum-motif"] = canvas(1200, 400, spectrum(20, 30, 1160, 340), "Decorative lavender spectrum bars, not audio data", None)

    with tempfile.TemporaryDirectory(prefix="patrick-site-fonts-") as cache:
        config = Path(cache) / "fonts.conf"
        config.write_text(f'<?xml version="1.0"?><fontconfig><dir>{html.escape(str(OLD / "fonts"))}</dir><dir>{html.escape(str(HERE / "fonts"))}</dir><cachedir>{html.escape(cache)}</cachedir><alias><family>Inter</family><prefer><family>Inter Variable</family></prefer></alias></fontconfig>')
        env = {**os.environ, "FONTCONFIG_FILE": str(config)}
        for name, source in designs.items():
            path = OUT / f"{name}.svg"
            path.write_text(source + "\n"); ET.parse(path)
            subprocess.run(["rsvg-convert", str(path), "-o", str(path.with_suffix(".png"))], env=env, check=True)

    sheet = Image.new("RGB", (1800, 1940), C["panel"])
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(str(OLD / "fonts/JetBrains-Mono-0.ttf"), 22)
    draw.text((44, 28), "PATRICK__EFF / PATCH / SELECTED DESIGN SYSTEM", font=font, fill=C["green"])
    with Image.open(OUT / "banner-wide.png") as img:
        sheet.paste(img.resize((1712, 571)), (44, 80))
    for i, name in enumerate(["identity-square", "process-square"]):
        with Image.open(OUT / f"{name}.png") as img:
            sheet.paste(img.resize((828, 828)), (44 + i * 884, 680))
    with Image.open(OUT / "open-graph.png") as img:
        sheet.paste(img.resize((744, 391)), (44, 1536))
    draw.text((850, 1548), "WEBSITE PALETTE", font=font, fill=C["paper"])
    for i, key in enumerate(["base", "purple", "pink", "green", "paper"]):
        x = 850 + i * 178
        draw.rectangle((x, 1600, x + 142, 1694), fill=C[key])
        draw.text((x, 1712), C[key], font=font, fill=C["body"])
    draw.text((850, 1790), "SPACE GROTESK / INTER", font=font, fill=C["paper"])
    draw.text((850, 1834), "JETBRAINS MONO / NO TYPE OFFSETS", font=font, fill=C["muted"])
    sheet.save(OUT / "brand-board.png")

    tokens = {"brand": "Patrick__Eff", "direction": "Patch / routed signal", "status": "user-selected production source",
              "logo": json.loads((HERE / "logo-selection.json").read_text()), "colors": C, "fonts": {"display": "Space Grotesk", "body": "Inter", "labels": "JetBrains Mono"},
              "spacing": [8,16,24,32,48,64,96], "contrast_on_base": {k: contrast(v, C["base"]) for k,v in C.items()},
              "source": "Live patrickfanella.co computed styles and same-origin CSS rules, observed 2026-10-02"}
    (HERE / "tokens.json").write_text(json.dumps(tokens, indent=2) + "\n")
    (HERE / "tokens.css").write_text(":root {\n" + "".join(f"  --pf-{k}: {v};\n" for k,v in C.items()) + "}\n")
    sources = [REF, HERE / "waveform_variations.py", HERE / "logo-selection.json",
               HERE.parent / "library/references/patrick-variations/primary-outlined.svg", HERE / "source-observation.json", *sorted((OLD / "fonts").glob("*.ttf")),
               *sorted((HERE / "fonts").glob("*")), Path(__file__).resolve()]
    manifest = {"prepared_at": "2026-10-02", "direction": "Patch / routed signal", "selection": "user, 2026-10-02",
                "source_revision": "784a1ac0706779a02ab51deb2ad93c936c621660",
                "mark_policy": "Approved open frame plus original waveform; lavender default, original masters untouched",
                "sources": [{"path": str(p.relative_to(ROOT)), "sha256": sha(p)} for p in sources], "assets": []}
    for path in sorted(OUT.glob("*.svg")) + sorted(OUT.glob("*.png")):
        row = {"path": str(path.relative_to(HERE)), "sha256": sha(path)}
        if path.suffix == ".png":
            with Image.open(path) as img: row["width"], row["height"] = img.size
        manifest["assets"].append(row)
    (HERE / "asset-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Rendered {len(designs)} SVG assets, {len(designs)} PNG exports and a brand board.")


if __name__ == "__main__":
    main()
