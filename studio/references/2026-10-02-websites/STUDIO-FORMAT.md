# How these references map to Subcult Studio

Studio expresses a design system as a written direction, reusable roles, editable assets and evidence of what was generated. The current local SUBCULT pack is a concrete example: [GUIDE.md](../../../Work/Subcult/subcult-studio/branding/library/brands/subcult/GUIDE.md) explains the selected direction and usage rules; [tokens.json](../../../Work/Subcult/subcult-studio/branding/library/brands/subcult/tokens.json) records colors, font roles, spacing and master identity; the neighboring CSS, previews and asset manifest support implementation and review.

The inspected SUBCULT direction is **Culture / poster press**. It assigns purple `#8b5cf6` to the main canvas, dark `#100b19` to text, acid green `#00ff88` to artwork and emphasis, and `#f0ece4` to supporting artwork. Its typography roles are Oswald for display, Space Grotesk for body and JetBrains Mono for labels. The spacing scale is 8, 16, 24, 32, 48, 64 and 96 pixels. The guide also distinguishes decorative color from safe small-text color, preserves user-authored SVG geometry and records clear-space and size rules.

That level of intent is stronger than a screenshot palette. These website studies use the same separation of concerns while recording the limits of reverse-engineering a public page.

| Studio expression | Reference collection equivalent | What remains before production |
|---|---|---|
| Written direction and usage rules | Per-site `GUIDE.md`, with layout, component grammar and adaptation notes | Approve a direction and specify reusable component states |
| Semantic colors and font roles | `tokens.json`, computed samples and explicit null values for unconfirmed roles | Confirm roles, contrast, licensed fonts and a spacing scale |
| Implementable token view | `tokens.css`, containing measured BODY values where available | Build an approved semantic CSS contract and responsive rules |
| Visual previews | `images/`, preserving initial and later browser states | Render intentional, representative preview layouts |
| Provenance and asset identity | `SOURCES.md`, `evidence/*.json` and `manifest.json` with SHA-256 hashes | Record approved source assets and transformation history |
| Protected masters and redistributable fonts | No third-party masters or font binaries copied | Obtain authorized assets and keep their licenses with the pack |

Each reference keeps the familiar `brand`, `direction`, `status`, `colors`, `fonts` and `spacing` fields, but uses `status: reference-observation` and a separate schema identifier. Unknown roles are null; an unestablished spacing scale is empty. Additional observations preserve measured element styles and readable root variables. These files are not a drop-in replacement for Studio's production brand tokens: a production generator may require complete roles, a string source field or approved master metadata.

The gallery is an index of captured references. It does not redraw the sites or manufacture identity assets. Initial captures may show loaders, intros, missing styles or a browser error. Later DOM observations remain useful evidence, but they cannot substitute for a missing styled screenshot. Read the individual guide before treating a value or composition as verified.

For a future Studio pack, begin with the design principle worth adapting—such as metadata density, typography roles or image sequencing—then write original rules and create approved assets. Preserve the reference and its uncertainty alongside that work so the resulting pack has a clear source and a distinct identity.

This collection was initially prepared under Studio’s `branding/design-references/` and then moved into `~/Documents/Design References/2026-10-02-websites/` at the user’s request. Design References now owns these reports; Studio retains its production brand packs. The links above point to the local Studio checkout outside this repository. Existing packs, protected SVG masters, generated automation work and unrelated checkout changes were preserved. No publication or deployment occurred.
