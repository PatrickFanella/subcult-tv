# patstack — Brand and asset guide

Selected direction: **A1 Rack + A3 Registration**. Owner-selected direction. Pack v1 built November 4, 2026. Template layouts are samples, not approved posts.

Owner chose the combination on November 3, 2026 from the nine candidates in studies/patstack-directions: the A1 Rack system with A3 Registration's plates as the diagram vocabulary. The nine candidates, the originality audit and the deeper A1 and A3 boards are recorded in [the direction study](../../studies/patstack-directions/README.md).

patstack is the owner's agent skill stack: personal skills, shared skills, an optional library, profiles and global agent instructions in one private repository (subculture-collective/patstack on Gitea), installed on every host by a guarded installer that plans against recorded hashes, applies with a journal and verified backups, and refuses to overwrite drift. It has no web application. Its surfaces are the repository (README, Gitea avatar and link preview), documentation pages if they are ever published, the terminal, and occasional posters or posts about the tool.

SUBCULT lineage. Palette and type roles come from the selected SUBCULT C poster-press pack and the SUBCULT Visual Language; state colors come from the Omarchy subcult theme. It is a SUBCULT tool, so the lineage tag reads `A SUBCULT TOOL` and the violet block in the mark points at the parent without redrawing the SC_ master.

## What the system means

- **Rack units** are the fleet. Every list of hosts or installed trees is drawn as rack units: ears, a slot number, the host name in display caps, its role in body text, a lamp and a state label. The rack carries real deployment information; it is never decoration.
- **Registered plates** explain verify and drift. Three flat plates, offset by one spacing step, stand for the installed tree (line color, back), the plan with its expected and desired trees (acid, middle) and the source tree (paper, front). A crosshair sits at the front plate's top right. Registration means the three trees agree on SHA-256 hashes, file modes and symlink targets. A misaligned plate is a refused apply.
- **Status labels are true.** `[ACTIVE]`, `[WARNING]`, `[VETO]` and `[ARCHIVE]` are semantic. Color and text always agree with the installer's real result. Never use a state color for emphasis.
- **Violet marks the tool, never a state.** The lineage cue stays in the mark, the tag and poster fields.

## Color roles

| Token | Color | Use |
| --- | --- | --- |
| `background` | #100b19 | Ground. Pages, posters, the terminal. |
| `surface` | #1f1830 | Panels, rack bodies, code blocks. |
| `line` | #3b2470 | Rules, borders, the back plate. |
| `text` | #f0ece4 | Paper. Headlines, body, the front plate and rack units. |
| `muted` | #a89fb8 | Secondary text, roles, footnotes. Also the archive state. |
| `accent` | #00ff88 | Acid. The live signal: the lit lamp, [ACTIVE], the plan plate, filled buttons with ground-colored text. |
| `identity` | #8b5cf6 | Violet. SUBCULT lineage: the mark block, the lineage tag, poster fields. Large text only on the ground. |
| `warning` | #f28c28 | Orange. [WARNING]: an external owner changed since the baseline. |
| `critical` | #ff4055 | Red. [VETO]: apply refused. Use critical_on_paper on light grounds. |

Measured with WCAG relative luminance from the hex values above. Ordinary text needs 4.5:1, large text 3:1.

| Pair | Contrast |
| --- | --- |
| text/background | 16.44:1 |
| muted/background | 7.67:1 |
| accent/background | 14.45:1 |
| identity/background | 4.58:1 |
| warning/background | 7.89:1 |
| critical/background | 5.64:1 |
| text/surface | 14.47:1 |
| background/accent | 14.45:1 |
| background/identity | 4.58:1 |
| background/text | 16.44:1 |
| critical_on_paper/text | 4.37:1 |

Violet on the ground passes only for large text; small lineage tags in violet sit inside a line-colored border at 10 to 11 px and should move to muted paper when they must be read at a glance. Acid on violet (3.16:1) is decorative only. Orange on paper is a filled square beside an ink label, not text.

## States

| Label | Color | Meaning |
| --- | --- | --- |
| [ACTIVE] | #00ff88 | The installed copy matches the source snapshot. Hashes, modes and symlink targets verified. |
| [WARNING] | #f28c28 | An external owner (OS, Codex system or Omarchy) changed since the baseline. Listed, never written. |
| [VETO] | #ff4055 | Apply refused. A destination drifted from the recorded baseline or last installed snapshot. Nothing written. |
| [ARCHIVE] | #a89fb8 | A retired name. Mapped to its owner in catalog/retired-names.json; no compatibility entrypoint is created. |

## Typography and spacing

- **Display:** Oswald 700, uppercase, letter-spacing 1% of the size. Headlines, host names, the wordmark `PATSTACK`. In prose write `patstack` in lowercase.
- **Body:** Space Grotesk, sentence case. Explanations, roles, descriptions.
- **Label:** JetBrains Mono, uppercase with 8 to 12% tracking for small labels; normal case for paths and commands. Status labels, slot numbers, metadata.
- Spacing steps: 8, 16, 24, 32, 48, 64, 96 pixels. Corners are square. One-pixel rules in the line color separate rows; two pixels frame a panel on paper.
- Texture: scanlines at 4% opacity on posters only. Documentation, interfaces and the terminal stay undecorated.

## Mark

Original rack mark authored in build.py: three paper units with one acid lamp lit, behind them a violet block tilted 3.6 degrees as the SUBCULT lineage cue. It does not reuse the SC_ master geometry. Unlit lamps are gaps in the unit bar, so the mark reads on any ground.

- Variants: `mark-primary` (paper units, acid lamp, violet block) for dark grounds; `mark-light` (ground-colored units) for paper; `mark-mono-dark` and `mark-mono-light` outline the block and keep the lit lamp solid.
- Clear space: one quarter of the mark height on every side. Minimum size: 32 pixels on screen; use the mono mark below 24 pixels. Minimum lockup width: 220 pixels; use the mark alone below that.
- Do not stretch, rotate further, add effects or redraw the units. Where the fonts are not installed, use the outlined lockup exports.

## The fleet rack

| Slot | Host | Role | State |
| --- | --- | --- | --- |
| U1 | kvant | canonical checkout · deployer | [ACTIVE] |
| U2 | sputnik | operator laptop | [ACTIVE] |
| U3 | soyuz | macOS workstation | [ACTIVE] |
| U4 | dozor | monitoring | [ACTIVE] |
| U5 | almaz | public edge | [ACTIVE] |
| U6 | nuc | internal apps | [ACTIVE] |

States from the 2026-11-03 fleet deployment record (the Subsets category rebuild, patstack PR #26, deployed and verified on all six hosts; Machinum report Subsets category rebuild 2026-11-03), not a live readout. Rebuild the pack after a verified fleet deployment and update `brand.json` so the rack stays true. A public post should check whether host names belong in it.

## Surfaces

- **Repository:** `product/repo-avatar.png` is the Gitea avatar, `product/og.png` the link preview, `product/readme-banner.png` the README header, `product/favicon-64.png` a small icon.
- **Documentation pages:** ground, paper text, rack units for hosts, registered plates for the verify diagram, real commands in surface-colored code blocks, no web buttons where there is no web app. Focus rings are 2 px acid on the ground.
- **Terminal:** the installed Omarchy `subcult` theme already carries this palette. A proposed summary line format uses the four labels in their state colors; the installer currently prints JSON.
- **Posters and posts:** the violet block and scanlines are allowed. Keep one headline, the rack or the plates, and the lineage tag.

## Files and rebuilding

`brand.json` and `build.py` are the source configuration and generator. `logos/` holds the four mark and lockup variants with outlined copies; `social/` the avatar, banners, square, landscape, story, quote, release and screenshot layouts; `video/` the title, thumbnail, end card, transparent lower third and a caption style; `product/` the repository exports; `brand-board.svg` is editable and its PNG is the pack preview. `tokens.json` and `tokens.css` record the roles. `source-register.json` records ownership and sources; `asset-manifest.json` binds every file to its SHA-256.

From the repository root:

```sh
rtk proxy python3 studio/brands/patstack/build.py
rtk proxy python3 studio/brands/patstack/build.py --export /path/to/patstack/brand
```

The export copies an explicit selection of original artwork, tokens and licensed fonts and writes `studio-assets.json` with source hashes beside them. The eight-second video preview was not produced; add it when a video surface exists.

## Copy, alt text and sources

Facts come from the patstack README and `docs/OPERATING-MODEL.md`: 52 curated personal skills, 5 shared skills, a 326-skill library, retired names mapped in `catalog/retired-names.json`. The headline `Author once. Deploy guarded.` is sample copy in the SUBCULT voice. Replace template text before publication and describe the finished image in alt text; `alt-text.md` has starters. Studio selection is not permission to publish a post or change a profile.
