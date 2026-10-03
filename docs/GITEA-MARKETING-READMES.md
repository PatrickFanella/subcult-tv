# Gitea marketing README refresh

Prepared October 3, 2026. Scope: the twelve repositories with product identities in Studio, excluding the personal Patrick__Eff brand. Archived repositories, scaffolds and products without a selected pack are outside this pass.

READMEs lead with the product, its audience and current availability. Each selects one local PNG from Studio and records its source revision, source path and SHA-256 in `docs/assets/readme/provenance.json`. The banners are identity artwork; example tape labels, handles, decorative QR artwork and planner tasks are labelled as samples. No application code or social dispatch configuration changes.

The existing seven development guides remain in place. The five repositories whose technical overviews still occupied README.md preserve those original bytes in root-level DEVELOPMENT.md.

## Repositories

| Product repository | Review | Voice and scope |
| --- | --- | --- |
| subcult-tv | This repository’s README PR | Collective workshop; public product destinations and private source boundaries |
| clpr | [PR #41](https://git.subcult.tv/subculture-collective/clpr/pulls/41) | Chat regular; clips, playlists and current release limits |
| patchwork | [PR #124](https://git.subcult.tv/subculture-collective/patchwork/pulls/124) | Neighbor; pre-alpha demo and exact location rules |
| hasanara | [PR #50](https://git.subcult.tv/subculture-collective/hasanara/pulls/50) | Broadcast continuity; the record and automatic-transcript corrections |
| rekolekt | [PR #46](https://git.subcult.tv/subculture-collective/rekolekt/pulls/46) | Archivist; deployed software and timestamped passages |
| subcult-os | [PR #212](https://git.subcult.tv/subculture-collective/subcult-os/pulls/212) | Stage manager; free reservations and alpha operation |
| undertow | [PR #19](https://git.subcult.tv/subculture-collective/undertow/pulls/19) | Liner notes; layers, lyrics and device-dependent local export |
| kork | [PR #30](https://git.subcult.tv/subculture-collective/kork/pulls/30) | Corkboard keeper; free pages, direct payments and publication wait |
| prichal | [PR #132](https://git.subcult.tv/subculture-collective/prichal/pulls/132) | Operations desk; private preview with no sign-up |
| left-field | [PR #60](https://git.subcult.tv/subculture-collective/left-field/pulls/60) | Research desk; versioned scores, missing records and no forecasts |
| dedhed | [PR #25](https://git.subcult.tv/subculture-collective/dedhed/pulls/25) | Taper; on-demand shows, shared schedule and private relay boundary |
| tadooer | [PR #126](https://git.subcult.tv/subculture-collective/tadooer/pulls/126) | Quiet planner; private one-owner tool and sample promotion |

## Verification

Local verification covered 125 Markdown destinations, twelve banner hash matches, and byte-for-byte preservation of five former README overviews. All 38 public URL checks returned HTTP 200, including four retained screenshots. HTTP success establishes reachability, not completion of authenticated product journeys.

The selected banners were visually inspected together. Gitea branch rendering initially redirected the unsigned browser to sign-in; authenticated API readback and subsequent rendered-page evidence are separate checks. Hosted CI results and merges must be read from each PR before claiming publication.

Repository descriptions and website fields are updated independently through the Gitea API, with before/after snapshots and readback of visibility, archive state and default branch. Private products receive no invented public URL.

## Asset ownership

Studio is the source for artwork; copies in `docs/assets/readme/` are selected README exports. Do not edit a banner copy independently. Select or regenerate the source in Studio, then refresh the copy and its hash record. This export does not publish the whole brand pack, private references, fonts, runtime bundles, or acquired recordings.
