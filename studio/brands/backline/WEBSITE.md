# Backline — landing-page specification

This is a source snapshot from [Backline](https://git.subcult.tv/subculture-collective/backline) at `e7f6961f3c5928bd80f2fb81d07985c93a0e3c39`. The product owns the React implementation and this applied interface specification. Refresh with `build_landing.py`; do not maintain a competing copy here.

[Open the standalone landing preview](landing.html). Studio adapts sign-in links into pilot-information anchors because this preview has no authentication server. The captured React source retains the real links.

# Backline landing page and selected identity

Poster Crew was selected by the owner on October 4, 2026. Maintained brand masters, fonts, generator and full usage guide belong to SUBCULT Studio at `studio/brands/backline/`. This product carries only the selected generated assets under `frontend/public/brand/backline/`; `brand/backline/source-provenance.json` records their source and hashes.

The product's landing page is `/`. Server setup is `/servers`, still behind RequireAuth. OAuth completion redirects to `/servers`; moderation and observed-activity links return there. `/login`, `/auth/callback` and `/status` retain their routes. The landing page does not create an invite, grant server access, change module defaults or deploy a service.

The page uses purple #8b5cf6, ink #100b19, paper #f0ece4 and green #00ff88. Oswald Bold heads the display; Space Grotesk handles reading and controls; JetBrains Mono labels examples. Fonts are self-hosted with licenses. SVG logo exports use outlined type.

The hero, numbered tool descriptions, setup sequence, private-pilot section and native-details FAQ describe the current implementation scope. The hero illustration contains fictional examples and is labeled as such. Modules remain opt-in per server. Ticket access copy preserves Discord administrator/owner access. There is no public installation, price, provider-delivery claim or sign-up collection.

On screens below 760px, navigation becomes a labeled expandable menu, the hero and example stack, tool descriptions and steps become single-column layouts, and the pilot stamp fits inside its container. Focus outlines remain visible; reduced-motion preferences remove action movement. Keep the existing consent component's behavior separate from this identity work.

The Open Graph image is included without a guessed canonical domain. Before a hosted release, set an absolute image URL and canonical URL for the chosen deployment origin, verify social preview fetching there, and review the public release separately from this local implementation.

Rebuild the selected assets from Studio with `python studio/brands/backline/build_assets.py --product-root /path/to/discord-spywatcher`. The exporter updates only Backline's generated files and source receipt. Do not edit the PNG derivatives separately.

## Local verification

The production TypeScript/Vite build passes. Changed frontend files pass ESLint; the full frontend lint run retains 32 errors in unchanged analytics/test files. The 12 existing server-setup and moderation tests pass. All 23 exported assets match Studio source bytes and manifest hashes; the 12 SVG masters parse.

The T3 browser rendered the desktop page, loaded the fonts and logo files, opened the native FAQ, followed the pilot sign-in link, and redirected an anonymous `/servers` request to `/login`. A 390px same-origin browser frame had no horizontal overflow; its menu expanded, followed the tool-section anchor, and closed. T3 viewport resize timed out, so this is a browser CSS layout check, not a phone/device test. OAuth provider completion, production deployment and hosted social preview fetching remain separate verification.
