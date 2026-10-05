"""Package current production assets into ignored runtime archives."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'brand-tools'
BRANDS = ROOT / 'brands'
OUTPUT = ROOT / 'runtime/packages'


def package(source, destination, prefixes=None):
    """Zip one folder, or several folders under the given archive prefixes."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    sources = prefixes or {'': source}
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for prefix, folder in sources.items():
            for path in sorted(folder.rglob('*')):
                if not path.is_file() or path.suffix == '.zip':
                    continue
                if any(part in {'__pycache__', '.font-cache', '.cache', 'runtime'} for part in path.relative_to(folder).parts):
                    continue
                archive.write(path, Path(prefix) / path.relative_to(folder))
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError(f'Invalid archive: {destination}')


def main():
    for brand in sorted(BRANDS.iterdir()):
        if brand.is_dir():
            package(brand, OUTPUT / (brand.name + '.zip'))
    package(LIBRARY / 'starter-template', OUTPUT / 'starter-template.zip')
    package(None, OUTPUT / 'subcult-brand-asset-packs-v1.zip', {'brands': BRANDS, 'brand-tools': LIBRARY})
    print(f'Brand and starter archives rebuilt under {OUTPUT}.')


if __name__ == '__main__':
    main()
