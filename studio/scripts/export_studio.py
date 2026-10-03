#!/usr/bin/env python3
"""Export a private browsing bundle and an explicit public SUBCULT asset selection."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = ROOT.parent
PACK = ROOT / "branding/library"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export(destination, site=None, posting_state=None):
    destination = destination.resolve()
    if destination.is_relative_to(REPOSITORY_ROOT) and not destination.is_relative_to(ROOT / "runtime"):
        raise ValueError("Private exports inside the repository must be under studio/runtime/")
    destination.mkdir(parents=True, exist_ok=True)
    files = {}

    def asset(source):
        key = digest(source)
        name = "assets/" + key + source.suffix.lower()
        target = destination / name
        target.parent.mkdir(exist_ok=True)
        shutil.copyfile(source, target)
        files[key] = {"path": name, "sha256": key, "name": source.name}
        return key

    brands = []
    for brand in json.loads((PACK / "brands.json").read_text()):
        folder = PACK / "brands" / brand["slug"]
        selection = {"approved_variations": []}
        logos = sorted((folder / "logos").glob("*-outlined.svg"))
        variants = folder / "logos/waveform"
        if (variants / "selection.json").exists():
            selection = json.loads((variants / "selection.json").read_text())
            for slug in selection["approved_variations"]:
                source = (variants / (slug + ".svg")).resolve()
                source.relative_to(variants.resolve())
                logos.append(source)
        library = []
        allowed = {'.svg', '.png', '.jpg', '.jpeg', '.webp', '.mp4', '.ttf', '.woff2', '.txt', '.css'}
        for source in sorted(folder.rglob('*')):
            relative = source.relative_to(folder)
            if source.is_file() and source.suffix.lower() in allowed and relative.parts[0] in ('logos','social','video','artwork','fonts'):
                if relative.parts[:2] == ('logos','waveform') and source.stem.split('-avatar')[0] not in selection['approved_variations']:
                    continue
                library.append({'id':asset(source), 'name':str(relative), 'category':relative.parts[0]})
        library.append({'id':asset(folder/'tokens.json'), 'name':'tokens.json', 'category':'tokens'})
        library.append({'id':asset(folder/'tokens.css'), 'name':'tokens.css', 'category':'tokens'})
        brands.append({"slug": brand["slug"], "name": brand["brand"],
                       "direction": brand["name"], "tokens": json.loads((folder / "tokens.json").read_text()),
                       "guide": (folder / "GUIDE.md").read_text(),
                       "preview": asset(folder / "pack-preview.png"),
                       "assets": library, "logos": [asset(f) for f in logos]})
    media = []
    for item in json.loads((ROOT / "media/library/catalog.json").read_text())["assets"]:
        record = {k: item.get(k) for k in ("id", "title", "products", "rights", "kind", "status", "alt_text", "width", "height", "duration_seconds", "source")}
        source = (ROOT / "media/library" / item["file"]).resolve()
        source.relative_to(ROOT / "media/library/files")
        if digest(source) != item["sha256"]:
            raise ValueError("Media hash mismatch: " + item["id"])
        record["asset"] = asset(source)
        media.append(record)
    catalog = {"version": 1, "brands": brands, "media": media, "files": files}
    reference_source = ROOT / "references/catalog.json"
    if reference_source.exists():
        references = json.loads(reference_source.read_text())
        for record in references["entries"]:
            folder = ROOT / "references"
            document = folder / record.pop("document")
            record["guide"] = document.read_text()
            record["images"] = [asset(folder / path) for path in record["images"]]
            record["preview"] = record["images"][0] if record["images"] else ""
            record["attachments"] = [{"name": Path(path).name, "asset": asset(folder / path)}
                                     for path in record["attachments"]]
        reference_output = destination / "references.json.tmp"
        reference_output.write_text(json.dumps(references, indent=2) + "\n")
    (destination / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n")
    from export_posting import snapshot
    (destination / "posting.json").write_text(json.dumps(snapshot(posting_state), indent=2) + "\n")
    if reference_source.exists():
        reference_output.replace(destination / "references.json")
    if site:
        site = site.resolve()
        selected = {
            "public/brand/subcult/mark.svg": PACK / "brands/subcult/logos/mark-light-outlined.svg",
            "public/brand/subcult/master.svg": PACK / "brands/subcult/logos/master.svg",
            "public/brand/subcult/compact.svg": PACK / "brands/subcult/logos/mark-compact-primary-outlined.svg",
            "public/brand/subcult/mark.png": PACK / "brands/subcult/logos/mark-light.png",
            "public/apple-touch-icon.png": PACK / "brands/subcult/logos/mark-compact-primary.png",
            "public/favicon.svg": PACK / "brands/subcult/logos/mark-compact-primary-outlined.svg",
        }
        for source in (PACK / "brands/subcult/fonts").iterdir():
            selected["public/brand/subcult/fonts/" + source.name] = source
        provenance = []
        for target, source in selected.items():
            output = site / target
            output.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, output)
            provenance.append({"source": str(source.relative_to(REPOSITORY_ROOT)), "target": target, "sha256": digest(source)})
        (site / "docs/subcult-brand-provenance.json").write_text(json.dumps({"repository": "subculture-collective/subcult-tv", "files": provenance}, indent=2) + "\n")
    return catalog


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "runtime/studio")
    parser.add_argument("--site-root", type=Path)
    parser.add_argument("--posting-state", type=Path, help="Read-only runner state for the private dashboard snapshot")
    args = parser.parse_args()
    catalog = export(args.output, args.site_root, args.posting_state)
    print(f"Exported {len(catalog['brands'])} brands, {len(catalog['media'])} media assets")
