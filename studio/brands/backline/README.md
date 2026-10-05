# Backline / Poster Crew

The owner selected Poster Crew for Backline. This folder owns the maintained brand assets and records the landing page prepared in the product repository.

- [Brand guide](GUIDE.md): identity, palette, type, components, copy and usage.
- [Landing-page preview](landing.html): standalone browser preview with local fonts and assets.
- [Website specification](WEBSITE.md): copied product interface rules and verification limits.
- [Tokens](tokens.json): selected color, type, spacing and component roles.
- [Asset manifest](asset-manifest.json): hashes of the generated product exports.
- [Landing provenance](landing-provenance.json): product revision, source hashes and preview adaptations.
- `landing-source/`: captured React component, CSS, package manifests and product specification. Refresh these snapshots from the product; do not edit them independently.

Brand masters and their generator live here in Studio. The executable landing page remains owned by [Backline](https://git.subcult.tv/subculture-collective/backline), whose implementation is reviewed in [PR #52](https://git.subcult.tv/subculture-collective/backline/pulls/52). This Studio preview does not provide sign-in, install a bot, or publish a public site. Its pilot links show the pilot section.

Run `python build_assets.py` to rebuild only Backline's graphics and fonts. Run `python build_landing.py --product-root /path/to/backline` with that checkout's locked frontend dependencies installed to refresh the captured landing source and standalone preview. The landing exporter requires committed source files and records their exact revision and hashes.

For a local review, serve this folder with `python -m http.server 48765 --bind 127.0.0.1` and open `/landing.html`. The preview has a working narrow-screen menu, native-details FAQ, section anchors and a keyboard skip link. It makes no API calls and loads its fonts and images from `product/`.
