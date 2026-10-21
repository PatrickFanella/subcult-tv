# Subsets context and written voice

## Product context

**Name:** Subsets. **Destination:** [subsets.subcult.tv](https://subsets.subcult.tv). **Maker:** [SUBCULT](https://subcult.tv).

**One sentence:** Subsets finds agent skills on disk, lets you organize them into groups, and previews a selected set before applying it to folders you explicitly adopt.

**Reader's task:** “I have a collection of skills. Help me choose the set for this job and keep a way back.”

**Audience hypothesis:** people who use coding agents with local skill collections, maintain several projects, and want to switch between writing, development, or research sets. There is no attached audience-size or demand study.

**Positioning:** a terminal tool for choosing and applying sets from a local skill collection, with visible ownership and checked recovery. Describe the workflow rather than promising model quality, lower token bills, or automatic cross-device synchronization.

**Primary action:** Explore Subsets at the product website. Technical posts can use the current npm alpha installation command after verifying that package and the reader's prerequisites.

## Written voice

The approved Personal Utility identity uses a selected-tile mark, silver, charcoal, and mint selection states. Marketing typography uses Space Grotesk, Public Sans, and JetBrains Mono. Masters and exported hashes are documented in [branding](../branding.md), [asset provenance](../../assets/brand/brand-export.json), and [site asset provenance](../../site/assets/brand/brand-export.json). Preserve the logo, mark geometry, and palette. This packet adds a proposed written guide consistent with the existing README; it does not revise the visual identity.

| Attribute | Writing decision | Example |
| --- | --- | --- |
| Practical | Name an action and its visible result | “Preview which skills will be active before applying the set.” |
| Calm | Explain ownership and recovery without alarm or sweeping safety promises | “If files changed after the saved state, recovery stops so you can inspect them.” |
| Personal | Let the user choose the groups; use ordinary task names | “A writing set today. A development set tomorrow.” |
| Precise | Keep product and proof boundaries visible | “Discovery shows files on disk. Start a new agent session after applying a different set.” |

Preferred terms: collection, group, set, preview, apply, adopt, ownership, transaction, rollback. Explain “adopt” as explicitly allowing Subsets to manage an eligible folder. Avoid treating discovery as proof of what an agent loaded. Do not claim every tool or OS is supported.

Promotion can be brief and lightly playful: “All your skills. Only the set you need.” Onboarding should show the exact command and prerequisites. Errors should identify the changed path and next inspection step. Recovery copy should explain why a later edit prevents rollback. These examples are proposed copy, not descriptions of newly tested messages.

## Claims register

| ID | Statement | Evidence | Limit |
| --- | --- | --- | --- |
| S1 | Finds skills in supported user/project folders and displays ownership | README; [usage](../usage.md) | Disk discovery, not a live agent-context audit |
| S2 | Organizes skills into groups and combines group selections | Usage: organize/apply workflow | Use names present in the user's collection |
| S3 | Previews and applies sets to explicitly adopted eligible folders | Usage; [ownership guide](../discovery-ownership.md) | Do not silently adopt plugin, package, or installer-owned roots |
| S4 | Keeps inactive skills in a private library and records transactions for checked rollback | Usage: state/recovery | Later edits can block recovery; no arbitrary-power-loss guarantee |
| S5 | Native npm edition requires Node 22+; standalone workflow needs no Python | [npm guide](../npm.md), package.json | Existing codex-skills adapter uses its Python helpers; TUI needs an interactive terminal |
| S6 | Alpha package is on npmjs.org; `alpha` resolves to 0.2.0-alpha.3 | Live registry metadata, October 19 | Package metadata only; no new exact-tarball install was performed for this packet |
| S7 | Linux is tested in repository qualification; macOS remains unverified; Windows unsupported | README, usage/npm guides | Do not advertise broad cross-platform qualification |
| S8 | Source is AGPL-3.0-only | package.json and [license](../../LICENSE) | Sponsorship is separate from access; no commercial offer assumed |
| S9 | Does not rewrite instructions or run skill scripts | README and usage guide | Applying sets changes files; it is not a quality or compatibility endorsement |
| S10 | Native and Python registries are separate; no automatic migration | npm guide | Do not present the editions as interchangeable |

**Unsupported promises:** smarter agents, proven context/token reduction, universal skill compatibility, cloud synchronization, Windows support, qualified macOS operation, customer totals, and automatic profile selection. This task's fleet file deployment is an operator action, not a Subsets product feature.

## Demonstration evidence needed

Use disposable skill folders and isolated state for the public demo. Show collection → group → preview → apply → verification → checked rollback. Record package version, source fixture, terminal size, and actual result. Current packet work does not repeat that full journey. Never demonstrate adoption against the user's real plugin or managed skill roots.
