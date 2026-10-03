# Studio production sources

Studio is the private production area of the combined `subcult-tv` repository. It owns branding, media, design references, social/Patreon content and preparation automation. The website and authenticated admin are implemented at the repository root.

## Active sources

| Directory | Contents |
| --- | --- |
| [Brand library](branding/library/README.md) | Thirteen current brand packs, editable masters, generators, bundled fonts and licenses |
| [Patrick source](branding/patrick/README.md) | Selected Patch design system, generator and seven approved waveform treatments |
| `media/library/` | Original captures, generated artwork, edits, recipes and hash-bound catalog |
| [Design references](references/USAGE.md) | Curated observations and 590 searchable reference records |
| `content/social/` | Guidance, claims, plans, source watchlists and prepared drafts |
| `content/patreon/` | Patreon plans, release material and artwork |
| `automation/social-posting/` | Preparation jobs, configuration and unit sources |
| [Retired sources](branding/archive/README.md) | Earlier studies and preserved original artwork |

Production generators and user-edited SVG references remain authoritative. Per-brand fonts and exported Patrick copies are deliberate standalone pack inputs, not duplicate junk. Media and references retain their recorded rights and inspection limits.

## Work from the repository root

```sh
rtk proxy make check-library check-studio check-studio-automation
rtk proxy make studio-preview
rtk proxy make studio-package
```

The local source preview binds to `127.0.0.1:18770`. Download archives are generated under ignored `studio/runtime/packages/`. Private API bundles are generated under `studio/runtime/studio/`, outside the public build.

For a targeted brand rebuild, run from `studio/branding/library/` with `BRAND_ONLY=<slug>`. Follow that brand’s guide for additional product-asset or finalization steps. Update source and derived output together; preserve unrelated masters. See [the shared asset policy](../docs/ASSETS.md).

## Exports and admin

`make studio-export` prepares the private catalog, media, design references and redacted posting snapshot, and copies only the explicit public SUBCULT asset selection. Left Field uses a separate explicit exporter. A bundle never exposes social plans, runner source, account configuration or provider traces.

To export to an external private destination, from the repository root:

```sh
rtk proxy python3 studio/scripts/export_studio.py --output /absolute/private/studio-bundle
```

An optional `--posting-state /absolute/private/social-posting-state` reads receipt-bearing completed runs. It does not write runner state or run a job. Browser refresh observes the exported snapshot; fresh preparation data requires a new export. See [Studio API configuration](../docs/STUDIO.md).

## Installed consumers and history

Installed preparation jobs and compatibility links still use the original Studio checkout until the [consolidation activation](../docs/REPOSITORY-CONSOLIDATION.md) is completed. State, locks, receipts and provider credentials remain outside Git, with publication disabled.

`docs/history/` preserves original import/cutover receipts and dated review records. `make check-import` from the repository root verifies the immutable original import against retained Git blobs/LFS identities. It does not require current edited sources to match their old hashes.
