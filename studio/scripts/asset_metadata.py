"""Readable private-library metadata derived from source filenames and catalog fields.

These tags describe files and existing catalog values, not visual review or approval.
Original paths, asset hashes, rights and statuses remain authoritative.
"""
import re
from pathlib import Path

CATEGORY_LABELS = {
    "logos": "Logos & identity", "social": "Social templates", "video": "Video graphics",
    "artwork": "Artwork", "fonts": "Fonts & licenses", "tokens": "Design tokens",
    "documents": "Guides & source documents", "product": "Product artwork",
}
WORDS = {"svg": "SVG", "png": "PNG", "css": "CSS", "json": "JSON", "mp4": "MP4",
         "ttf": "TTF", "woff2": "WOFF2", "ofl": "font license", "x": "X", "bluesky": "Bluesky"}

def readable(value):
    words = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", value).replace("_", " ").replace("-", " ").split()
    text = " ".join(WORDS.get(word.lower(), word) for word in words)
    return text[:1].upper() + text[1:]

def brand_asset_metadata(relative, category=None):
    path = Path(relative)
    stem = path.stem
    words = set(stem.lower().split("-"))
    category = category or (path.parts[0] if len(path.parts) > 1 else ("tokens" if stem == "tokens" else "documents"))
    title = readable(stem)
    # Numeric suffixes distinguish source variants and must remain visible.
    title = title.replace("mono", "monochrome").replace("outlined", "text converted to paths")
    if title.startswith("Mark"): title = "Brand mark" + title[4:]
    elif title.startswith("Lockup"): title = "Logo lockup" + title[6:]
    elif title == "Tokens": title = "Design tokens"
    elif title == "Master" and category == "logos": title = "Logo source master"
    tags = [CATEGORY_LABELS.get(category, readable(category)), path.suffix.lstrip(".").upper()]
    for key, label in {
        "avatar": "Avatar", "banner": "Banner", "story": "Story", "square": "Square post",
        "landscape": "Landscape", "quote": "Quote", "release": "Release", "screenshot": "Screenshot frame",
        "thumbnail": "Thumbnail", "lockup": "Logo lockup", "mark": "Brand mark", "compact": "Compact",
        "dark": "Dark variant", "light": "Light variant", "primary": "Primary colors",
        "mono": "Monochrome", "outline": "Outline mark", "outlined": "Text converted to paths",
        "master": "Source master", "template": "Template", "fisheye": "Fisheye", "waveform": "Waveform",
    }.items():
        if key in words or key in path.parts: tags.append(label)
    if path.suffix.lower() in (".ttf", ".woff2"): tags.append("Font file")
    if path.suffix.lower() == ".txt" and ("ofl" in words or "license" in words): tags.append("Font license")
    return {"title": title, "tags": list(dict.fromkeys(tags)), "metadata_basis": "Source filename and folder"}

def media_metadata(item):
    # Author-provided tags take precedence; product, kind and platform are source-backed additions.
    labels = {"x": "X", "instagram": "Instagram", "patreon": "Patreon", "bluesky": "Bluesky",
              "clpr": "CLPR", "hasanara": "HasanAra", "rekolekt": "Rekolekt", "kork": "Kork",
              "image": "Image", "illustration": "Illustration", "screenshot": "Screenshot", "video": "Video"}
    source_tags = [*item.get("tags", []), item.get("kind", ""), *item.get("products", []), *item.get("platforms", [])]
    tags = list(dict.fromkeys(labels.get(tag.lower(), tag) for tag in source_tags))
    return {"tags": [tag for tag in tags if tag], "platforms": item.get("platforms", []),
            "metadata_basis": "Media catalog fields"}
