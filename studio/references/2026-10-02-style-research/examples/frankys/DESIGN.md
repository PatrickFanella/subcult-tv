# FRANKY'S — design-system study

[Live source](https://frankys-hats.com/) · [Refero reference](https://styles.refero.design/style/7c84da5d-b7a0-436f-bfaa-68d0a14f8e86) · study prepared 2026-10-02 · **Strong retro arcade reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Checkerboard scenery, pixel-like controls, compact product cards and scanline texture turn commerce into a small arcade cabinet.

## Layout and content hierarchy

The older reference splits a large product viewer from a tight product grid and anchors purchase information below. Checkerboard imagery and pixel-like texture provide the historical arcade direction.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Product viewer | Image/3D/AR states belong to one media component with explicit controls. |
| Product card | Keep price, availability and add-to-cart treatment consistent. |
| Purchase band | Primary action and selected product information stay adjacent. |
| Announcement strip | The marquee should have a readable, pausable/static form. |

## Color and surface roles

Separate cream/dark UI surfaces and buy/availability roles from checkerboard texture and colored products.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

The reference's pixel-like lettering and current frankysDailySlab samples represent different evidence states. Choose the dated direction before mapping production font roles.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | frankysDailySlab, "frankysDailySlab Fallback" | 16px / unrecorded | rgb(0, 0, 0) / rgb(243, 229, 223) |
| BUTTON | frankysDailySlab, "frankysDailySlab Fallback" | 16px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H1 | frankysDailySlab, "frankysDailySlab Fallback" | 16px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | frankysDailySlab, "frankysDailySlab Fallback" | 48px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | frankysDailySlab, "frankysDailySlab Fallback" | 16px / unrecorded | rgb(0, 0, 0) / rgb(243, 229, 223) |
| H2 | frankysDailySlab, "frankysDailySlab Fallback" | 20px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | frankysDailySlab, "frankysDailySlab Fallback" | 12px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | frankysDailySlab, "frankysDailySlab Fallback" | 12px / unrecorded | rgb(255, 255, 255) / rgb(0, 0, 0) |
| BUTTON | frankysDailySlab, "frankysDailySlab Fallback" | 16px / unrecorded | rgb(255, 255, 255) / rgb(0, 0, 0) |
| A | frankysDailySlab, "frankysDailySlab Fallback" | 12px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Provide a conventional image fallback for 3D/AR and keep product color choices usable without the immersive viewer.

## State and motion specification

Verify selected product, out-of-stock, cart feedback, 3D/AR entry, texture legibility and reduced-motion behavior.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The current live page requests frankysDailySlab rather than the Arcade family reported for the reference. This entry records a historical image, not an unchanged current system.

Live observation: `2026-10-02T20:58:20.566Z` at `https://www.frankys-hats.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
