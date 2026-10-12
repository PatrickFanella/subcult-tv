# Chatty Cat — Website design specification

Written October 11, 2026 from the `subculture-collective/chatty-cat` checkout, not from the live site, and updated the same day for the rename to Chatty Cat. `chat.subcult.tv` is the intended origin; public HTTPS routing and the Twitch callback had not passed acceptance when this was written, so nothing below is a live observation.

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
| Name | Chatty Cat (header: the inline themed cat beside the name; manifest name "Chatty Cat", short name "Chatty Cat") |
| Stage label beside the name | migration preview |
| Document title | Chatty Cat · rebuild |
| Manifest description | Self-hosted Twitch chat client |
| Notice bar | Migration preview. The original app remains available while its features are rebuilt. |
| Operator | Subcult; source at git.subcult.tv/subculture-collective/chatty-cat |

New copy follows the Chatty Cat voice in [the voice guide](../../content/VOICE.md) and the C-CHAT entries of the claims register.

## Visual application

The interface has two layers. The shell (header, notice bars, composer, panels, dialogs) reads `--bg`, `--panel`, `--fg`, `--muted`, `--line` and `--accent`. The chat log reads the palette axes in `palettes.css`: a colour (fourteen), a shade (twelve) and a finish (four), which derive `--bg`, `--text`, `--panel`, `--line`, `--text-dim`, `--aux` and `--popline` in OKLCH and set `--accent`, `--good`, `--danger`, `--vip`, `--wiki` and `--spark` per colour. The default is the gray colour at shade 7. The brand's sixteen palettes are those fourteen colours at their default shades plus the two phosphor looks, so the cat always has a matching palette.

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
| Canvas | The phosphor palette by default | Whichever colour, shade and finish the user chose; a brand palette exists for each colour's default shade |
| Face and cursor | `face` and `cursor` from the build palette | The inline header cat reads `--cat-face` and `--cat-cursor`, which the product maps to `--accent` and `--good`, so it follows the user's palette |
| Type | Cascadia Mono and Public Sans | The user's chosen chat font; the wordmark is image or inline SVG, never a loaded brand font |
| Mark | Pixel cat on a tile | The same cat as favicon, PWA icons and Apple touch icon after export, in the phosphor palette |
| Six room chips | Drawn in the header strip | Channel chips and the send-target select exist; the strip is a simplification |

## Assets the product carries

After `build.py --export web/public`: `favicon.svg`, `favicon.ico`, `icon-src.svg`, `mark-themed.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `og.png`, `palettes.json` and the `brand-export.json` receipt. The manifest's theme and background colours stay `#151519`, the shell fallback; the icons carry the phosphor canvas.

## Verification and limits

Checked in source on October 11, 2026: the default display options, the palette axes, the shell tokens, the reduced-motion rules and the manifest. Not checked: the live site, the light shell on a device, phone widths, and the icons as installed by a browser. The export had not been applied when this specification was written; see the product's `brand-export.json` for the state after export.
