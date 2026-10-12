# Chat Thing — Website design specification

Written October 11, 2026 from the `subculture-collective/chatty-cat` checkout, not from the live site. `chat.subcult.tv` is the intended origin; public HTTPS routing and the Twitch callback had not passed acceptance when this was written, so nothing below is a live observation.

This document records how the product interface relates to the pack. The product's own `docs/design-system.md` is the editing source for interface rules; this pack copies it into `design-system/` with hashes. The [brand guide](GUIDE.md) governs marks and promotional artwork.

## Ownership

| Owner | What it owns |
| --- | --- |
| `chatty-cat` repository | Layout, components, `web/src/style.css`, `web/src/palettes.css`, `web/src/fonts.css`, the display data and the PWA manifest |
| This pack | The mark, lockups, link preview, the `product/` web assets and promotional layouts |
| Upstream app (mxmilkiib, AGPL-3.0) | The retained palette axes, presets, fonts and curated resource content, attributed in the product `NOTICE.md` |

Change the product first, then rerun `build.py --product-root` so the copied rules and provenance match.

## Product identity and copy

| Element | Current value in source |
| --- | --- |
| Name | Chat Thing (`<strong>` in the header; manifest name "Subcult Chat Thing", short name "Chat Thing") |
| Stage label beside the name | migration preview |
| Document title | Chat Thing · rebuild |
| Manifest description | Self-hosted Twitch chat client |
| Notice bar | Migration preview. The original app remains available while its features are rebuilt. |
| Operator | Subcult; source at git.subcult.tv/subculture-collective/chatty-cat |

New copy follows the Chat Thing voice in [the voice guide](../../content/VOICE.md) and the C-CHAT entries of the claims register.

## Visual application

The interface has two layers. The shell (header, notice bars, composer, panels, dialogs) reads `--bg`, `--panel`, `--fg`, `--muted`, `--line` and `--accent`. The chat log reads the palette axes in `palettes.css`: a colour (fourteen), a shade (twelve) and a finish (four), which derive `--bg`, `--text`, `--panel`, `--line`, `--text-dim`, `--aux` and `--popline` in OKLCH and set `--accent`, `--good`, `--danger`, `--vip`, `--wiki` and `--spark` per colour. The default is the gray colour at shade 7, which gives the brand its log surface and amber accent.

| Role | Default dark | Light shell |
| --- | --- | --- |
| Shell | `#151519` | `#faf8f3` |
| Panel | `#1d1d24` | `#efebe3` |
| Log canvas | `oklch(.25 .016 255)`, about `#1d2229` | cream at shade 1, about `#f3eee6` |
| Text | `#e8e6e3` | `#27232c` |
| Muted | `#aaa4b7` | `#665d70` |
| Line | `#34343e` | `#d5cedc` |
| Accent | `#e8a33d` | `#654394` shell, `#a8750e` cream palette |
| Connected status | `#63ba8e` | the same |

Type: the chat font defaults to the system sans stack at 14px/1.3 and is selectable from 29 stacks, 7 to 32px. Chrome inherits the chat font. Labels and status are 11 to 12px. The brand faces appear only in the wordmark, icons and marketing.

Shape: controls have a 4px corner and panels 6px. Gutters are 20px, 12px below 600px. Rows have 5px vertical padding. Borders are 1px `--line`. Keyboard focus is a 2px accent outline with 2px offset. Reduced-motion settings stop all animation, including nick shimmer and rainbow names.

## Differences from the promotional pack

| Item | Pack | Product |
| --- | --- | --- |
| Canvas | One shell black with a log-surface panel | Shell black plus whichever palette, shade and finish the user chose |
| Accent | Amber everywhere | Amber in the default palette only; each colour sets its own accent set |
| Type | Atkinson Hyperlegible Next and Mono | The user's chosen chat font; the brand faces are two of the 29 options |
| Spark green | The live block and sparkline | `--spark` colours the header rate graph in dark schemes; phosphor retints it toward the palette hue |
| Mark | The log tile | The same tile as favicon, PWA icons and Apple touch icon after export; the header still shows the name as text |
| Six room chips | Drawn in the header strip | Channel chips and the send-target select exist; the strip is a simplification |

## Assets the product carries

After `build.py --export web/public`: `favicon.svg`, `favicon.ico`, `icon-src.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `og.png` and the `brand-export.json` receipt. The manifest's theme and background colours are already `#151519` and match the shell.

## Verification and limits

Checked in source on October 11, 2026: the default display options, the palette axes, the shell tokens, the reduced-motion rules and the manifest. Not checked: the live site, the light shell on a device, phone widths, and the icons as installed by a browser. The export had not been applied when this specification was written; see the product's `brand-export.json` for the state after export.
