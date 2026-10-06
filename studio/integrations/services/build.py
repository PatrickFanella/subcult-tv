#!/usr/bin/env python3
"""Build service styles from selected Studio masters and pinned theme.park CSS."""
from pathlib import Path
import json,hashlib,re,shutil
ROOT=Path(__file__).resolve().parent
ASSETS=ROOT/'assets'
# Copy exact selected masters; the integration never edits brand or font sources.
brand_manifest=json.loads((ROOT.parent/'gitea/provenance.json').read_text())
for entry in brand_manifest['assets']:
 if entry['source'].startswith('branding/'):
  source=ROOT.parent.parent/entry['source']
  assert hashlib.sha256(source.read_bytes()).hexdigest()==entry['sha256']
  shutil.copyfile(source,ASSETS/Path(entry['destination']).name)
compact=ROOT.parent.parent/'brands/subcult/logos/mark-compact-primary-outlined.svg'
shutil.copyfile(compact,ASSETS/'favicon.svg')
# Flatten only the pinned, local upstream imports in the recorded order.
for name in ['sonarr','radarr','lidarr','prowlarr','whisparr','bazarr','qbittorrent','authelia','uptime-kuma']:
 pending=[f'css/base/{name}/{name}-base.css'];seen=set();chunks=[]
 while pending:
  path=pending.pop(0)
  if path in seen:continue
  seen.add(path);text=(ROOT/'upstream'/path).read_text()
  pending.extend(x.lstrip('/') for x in re.findall(r'@import\s+url\([\"\']?([^\"\')]+)',text) if x.startswith('/css/'))
  chunks.append(re.sub(r'@import[^;]+;','',text))
 (ASSETS/(name+'-base.css')).write_text('\n'.join(reversed(chunks)))
COMMON='''/* SUBCULT Studio / Culture poster press. Source assets retain their licenses. */
@font-face{font-family:SubcultSpace;src:url('/_subcult/Space-Grotesk-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:SubcultSpace;src:url('/_subcult/Space-Grotesk-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
@font-face{font-family:SubcultDisplay;src:url('/_subcult/Oswald-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
@font-face{font-family:SubcultMono;src:url('/_subcult/JetBrains-Mono-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
:root{
 --sc-ink:#100b19;--sc-surface:#181122;--sc-raised:#241a32;--sc-paper:#f0ece4;
 --sc-purple:#8b5cf6;--sc-link:#c4afff;--sc-green:#00ff88;--sc-muted:#b5a9c3;--sc-border:#58466e;
 --main-bg-color:#100b19;--modal-bg-color:#241a32;--modal-header-color:#241a32;--modal-footer-color:#181122;
 --text:#f0ece4;--text-color:#f0ece4;--text-hover:#ffffff;--text-muted:#b5a9c3;
 --link-color:#c4afff;--link-color-hover:#00ff88;--accent-color:#8b5cf6;--accent-color-hover:#a87dff;
 --button-color:#00ff88;--button-color-hover:#66ffb8;--button-text:#100b19;--button-text-hover:#100b19;
 --menu-item-color:#f0ece4;--drop-down-menu-bg:#241a32;--badge-bg:#8b5cf6;--badge-color:#100b19;--label-text-color:#f0ece4;
 --bazarr-button-background:#00ff88;--arr-queue-color:#00ff88;
 --bs-body-font-family:SubcultSpace,system-ui,sans-serif;
 color-scheme:dark;
}
html,body{background-color:var(--sc-ink)!important;color:var(--sc-paper)!important;font-family:SubcultSpace,system-ui,sans-serif!important}
body{accent-color:var(--sc-green)}
h1,h2,h3{font-family:SubcultDisplay,SubcultSpace,sans-serif!important;letter-spacing:.025em}
input,textarea,select,button{font-family:SubcultSpace,system-ui,sans-serif}
code,pre,kbd{font-family:SubcultMono,monospace!important}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[role=button]:focus-visible{outline:2px solid #c4afff!important;outline-offset:3px!important}
::selection{background:#8b5cf6;color:#100b19}
'''
ARR='''
[class*="PageHeader-header-"]{background:#8b5cf6!important;color:#100b19!important;border-bottom:3px solid #00ff88}
[class*="PageHeader-logo-"]{background:url('/_subcult/mark-dark.svg?v=logo-bcd-20261003') center/contain no-repeat!important;object-position:-9999px}
[class*="PageSidebar-sidebar-"]{background:#181122!important;border-right:1px solid #58466e}
[class*="PageSidebarItem-isActive-"]{color:#00ff88!important;border-left-color:#00ff88!important}
[class*="PageToolbar-toolbar-"]{background:#181122!important;border-bottom:1px solid #58466e}
[class*="Button-default-"]{background:#241a32!important;color:#f0ece4!important}
[class*="Button-success-"]{background:#00ff88!important;color:#100b19!important}
[class*="PageContent-body-"], [class*="PageContent-content-"]{background:#100b19!important}
[class*="FormInput-input-"], [class*="FormInput-select-"]{background:#181122!important;color:#f0ece4!important;border-color:#58466e!important}
'''
MUI='''
.MuiTypography-root,.MuiTableCell-root,.MuiInputBase-root,.MuiButton-root{font-family:SubcultSpace,system-ui,sans-serif!important}
.MuiPaper-root{background-color:#181122!important;color:#f0ece4!important;border-color:#58466e!important}
.MuiAppBar-root{background-color:#8b5cf6!important;color:#100b19!important;border-bottom:3px solid #00ff88}
.MuiInputBase-root{color:#f0ece4!important;background-color:#241a32!important}
.MuiInputLabel-root,.MuiFormLabel-root{color:#b5a9c3!important}
.MuiOutlinedInput-notchedOutline{border-color:#58466e!important}
.MuiButton-containedPrimary{background:#00ff88!important;color:#100b19!important}
.MuiButton-textPrimary,.MuiLink-root{color:#c4afff!important}
.MuiTableCell-root{color:#f0ece4!important;border-color:#58466e!important}
.MuiListItem-root.Mui-selected,.MuiListItemButton-root.Mui-selected{background-color:#38254f!important}
'''
EXTRA={
'jellyfin': '''
.backgroundContainer,.skinHeader,.mainDrawer,.emby-input,.emby-textarea,.emby-select{background:#181122!important;color:#f0ece4!important}
.skinHeader{border-bottom:3px solid #00ff88;background:#8b5cf6!important;color:#100b19!important}
.skinHeader .headerButton{color:#100b19!important}
.pageTitleWithLogo{background-image:url('/_subcult/mark-dark.svg?v=logo-bcd-20261003')!important;background-size:contain!important}
.raised,.cardBox,.paperList,.dialog{background:#241a32!important;color:#f0ece4!important}
.button-submit,.button-accent,.emby-button.raised.button-submit{background:#00ff88!important;color:#100b19!important}
.itemProgressBarForeground,.countIndicator{background:#00ff88!important;color:#100b19!important}
.emby-tab-button-active{color:#00ff88!important}
''',
'immich': '''
:root {--immich-ui-primary-500:#00ff88!important;--immich-ui-light:#100b19!important;--immich-ui-dark:#f0ece4!important;--immich-ui-light-100:#181122!important;--immich-ui-light-200:#241a32!important;--immich-ui-dark-900:#181122!important;--font-sans:SubcultSpace,system-ui,sans-serif!important;--font-mono:SubcultMono,monospace!important}
button.bg-primary{background:#00ff88!important;color:#100b19!important;border-radius:2px!important}
.text-primary{color:#c4afff!important}
img[alt="Immich logo"]{content:url('/_subcult/mark-primary.svg?v=logo-bcd-20261003');object-fit:contain;background:#f0ece4;padding:8px;border-radius:2px}
:root,:root.dark,:root.light{--immich-bg:16 11 25!important;--immich-fg:240 236 228!important;--immich-primary:196 175 255!important;--immich-dark-bg:16 11 25!important;--immich-dark-fg:240 236 228!important;--immich-dark-primary:196 175 255!important;--immich-gray:36 26 50!important;--immich-dark-gray:36 26 50!important;--color-immich-bg:#100b19!important;--color-immich-fg:#f0ece4!important;--color-immich-primary:#c4afff!important;--color-immich-gray:#241a32!important}
.bg-light,.dark\\:bg-immich-dark-bg,.bg-immich-bg{background-color:#100b19!important}
.text-dark,.text-immich-fg,.dark\\:text-immich-dark-fg{color:#f0ece4!important}
header,nav[aria-label="Main navigation"]{background:#181122!important;border-color:#58466e!important}
input,select,textarea{background:#241a32!important;color:#f0ece4!important;border-color:#58466e!important}
''',
'navidrome':MUI+'''
img[alt=logo]{content:url('/_subcult/mark-primary.svg?v=logo-bcd-20261003');object-fit:contain;background:#f0ece4;padding:8px;border-radius:2px}
.RaLayout-content{background:#100b19!important}
.MuiAppBar-root .MuiTypography-root{font-family:SubcultDisplay,sans-serif!important}
''',
'authelia':MUI+'''
#UserSvg{background:#f0ece4 url('/_subcult/mark-primary.svg?v=logo-bcd-20261003') center/contain no-repeat!important;border-radius:2px;padding:6px;width:90px!important;height:70px!important}
#UserSvg path{opacity:0}
.MuiTypography-h5{font-family:SubcultDisplay,sans-serif!important;font-size:2rem!important;color:#c4afff!important}
#root{background:#100b19!important;min-height:100vh}
.MuiContainer-root{background-color:transparent!important}
''',
'grafana': '''
:root{--primary:#8b5cf6;--secondary:#00ff88}
.page-scrollbar,.page-container,.main-view,.dashboard-container,.dashboard-content{background:#100b19!important}
section[class*="panel"],.panel-container,.panel-content{background:#181122!important;border-color:#58466e!important}
input,textarea,select{background:#241a32!important;color:#f0ece4!important;border-color:#58466e!important}
button[data-testid="data-testid Login button"]{background:#00ff88!important;color:#100b19!important}
header[role=banner],nav[aria-label="Main navigation"]{background:#181122!important;border-color:#58466e!important}
''',
'qbittorrent': '''
#desktop,#desktopHeader,#desktopFooter,#desktopContent,#mainColumn,#filtersColumn,#transferList,.mocha{background:#181122!important;color:#f0ece4!important}
#desktopHeader{background:#8b5cf6!important;color:#100b19!important;border-bottom:3px solid #00ff88}
#desktopHeader a{color:#100b19!important}
.dynamicTable th,.dynamicTable tr{color:#f0ece4!important}
.dynamicTable tr.selected{background:#38254f!important;color:#f0ece4!important}
input,select,textarea{background:#241a32!important;color:#f0ece4!important;border-color:#58466e!important}
''',
'bazarr': '''
:root,[data-mantine-color-scheme]{--mantine-font-family:SubcultSpace,system-ui,sans-serif;--mantine-font-family-headings:SubcultDisplay,sans-serif;--mantine-color-body:#100b19;--mantine-color-text:#f0ece4;--mantine-color-dark-6:#181122;--mantine-color-dark-7:#100b19;--mantine-color-dark-8:#100b19;--mantine-primary-color-filled:#00ff88}
.mantine-AppShell-header{background:#8b5cf6!important;color:#100b19!important;border-bottom:3px solid #00ff88}
.mantine-AppShell-navbar,.mantine-Paper-root{background:#181122!important;border-color:#58466e!important}
.mantine-Button-root[data-variant=filled]{background:#00ff88!important;color:#100b19!important}
''',
'uptime-kuma': '''
:root{--bs-body-bg:#100b19;--bs-body-color:#f0ece4}
#app,.dark,.dark .container-fluid{background:#100b19!important;color:#f0ece4!important}
.shadow-box,.dark .shadow-box,.modal-content,.dark .modal-content{background:#181122!important;border-color:#58466e!important}
#app header{background:#8b5cf6!important;color:#100b19!important;border-bottom:3px solid #00ff88}
.btn-primary,.btn-success{background:#00ff88!important;color:#100b19!important;border-color:#00ff88!important}
.form-control,.form-select{background:#241a32!important;color:#f0ece4!important;border-color:#58466e!important}
'''
}
for name in ['jellyfin','immich','navidrome','authelia','grafana','qbittorrent','bazarr','uptime-kuma','sonarr','radarr','lidarr','prowlarr','whisparr']:
 base=ASSETS/(name+'-base.css')
 css=COMMON+(base.read_text() if base.exists() else '')+(ARR if name in ['sonarr','radarr','lidarr','prowlarr','whisparr'] else '')+EXTRA.get(name,'')
 (ASSETS/(name+'.css')).write_text(css)
manifest={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(ASSETS.iterdir()) if f.is_file()}
(ROOT/'asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built',len(manifest),'assets')
