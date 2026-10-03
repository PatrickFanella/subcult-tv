"""Package current production assets into ignored runtime archives."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'branding/library'
OUTPUT = ROOT / 'runtime/packages'


def package(source, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source.rglob('*')):
            if not path.is_file() or path.suffix == '.zip':
                continue
            if any(part in {'__pycache__', '.font-cache', '.cache', 'runtime'} for part in path.relative_to(source).parts):
                continue
            archive.write(path, path.relative_to(source))
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError(f'Invalid archive: {destination}')


def main():
    for brand in sorted((LIBRARY / 'brands').iterdir()):
        if brand.is_dir():
            package(brand, OUTPUT / (brand.name + '.zip'))
    package(LIBRARY / 'starter-template', OUTPUT / 'starter-template.zip')
    package(LIBRARY, OUTPUT / 'subcult-brand-asset-packs-v1.zip')
    print(f'Brand and starter archives rebuilt under {OUTPUT}.')


if __name__ == '__main__':
    main()
