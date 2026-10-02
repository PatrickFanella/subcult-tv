from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]/'branding/2026-10-01-packs'
def package(source,dest):
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as archive:
  for p in sorted(source.rglob('*')):
   if p.is_file() and p!=dest and not any(x in p.parts for x in ['__pycache__','.font-cache']):archive.write(p,p.relative_to(source))
 with zipfile.ZipFile(dest) as archive:assert archive.testzip() is None
for brand in (root/'brands').iterdir():
 if brand.is_dir():package(brand,root/(brand.name+'.zip'))
package(root/'starter-template',root/'starter-template.zip')
package(root,root/'subcult-brand-asset-packs-v1.zip')
print('Brand and starter archives rebuilt.')
