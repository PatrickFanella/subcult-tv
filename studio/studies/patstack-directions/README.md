# patstack direction study

Date: November 3, 2026. Status: owner selected.

patstack is the owner's agent skill stack (`subculture-collective/patstack`, private). Nine candidate design systems were built as tiles on one private Design canvas, each with the same content: lockup, headline, one real skill card, two actions, palette and type roles. Rows are lineage, columns are register.

| | 1 Systems | 2 Print | 3 Schematic |
| --- | --- | --- | --- |
| **A · SUBCULT** | Rack | Broadsheet | Registration |
| **B · Patrick__Eff** | Patchbay | Liner Notes | Spectrum |
| **C · Standalone** | Ledger | Card Catalog | Manifest |

The owner narrowed the field to A1 or A3. Both were reviewed with the `ui-cliche-audit` skill against the SUBCULT Visual Language, then expanded into a 1280 documentation page, a phone version, a terminal session and a 1080 poster. The owner chose the combination: **the A1 Rack system with A3 Registration's plates as the diagram vocabulary**. The production pack is [brands/patstack](../../brands/patstack/GUIDE.md).

## Files

- [index.html](index.html): the brief, the nine summaries, the audit table and sources.
- `comparison.svg` and `comparison.png`: the nine as palette and type tiles, rendered from `patstack_directions.py` with the Studio fonts. Fonts the Studio does not bundle (Courier Prime, Saira Stencil One, Archivo, IBM Plex Sans) are named, not drawn.
- `canvas/`: the source of every canvas artboard (one HTML file each) and `canvas.json`. They render inside the Design canvas runtime, not as standalone pages. The rendered previews are on the private canvas, https://claude.ai/artifact/L12uCteNUx37eWSZtmRFDn.
- `manifest.json`: candidates with colors, fonts and measured contrast, the selection record, the audit findings and SHA-256 hashes of every file here.

## Rebuild

```sh
rtk proxy python3 studio/studies/patstack-directions/patstack_directions.py
```

Selection is not publication. No post, profile or site was changed by this study.
