# OLIPOP — design-system study

[Live source](https://drinkolipop.com/) · [Refero reference](https://styles.refero.design/style/c6ec55c7-0bd9-47c5-a4d2-669b7790c9cc) · study prepared 2026-10-02 · **Strong retro packaging / commerce reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A heavy, rounded display serif gives the promotion a vintage soda-shop voice. Saturated seasonal imagery sits beside a readable copy panel, with calmer product surfaces below.

## Layout and content hierarchy

Campaign artwork occupies one half of a promotion while headline, copy and action occupy the other. Calmer product-card sections follow the expressive campaign.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Campaign split | Define image/copy proportions and a sensible stacked order. |
| Product card | Keep flavor, format, price and shopping action independent from promotional imagery. |
| Promotional badge | A starburst or label has crop and text-length limits. |
| Action | Shopping controls retain a stable grammar across campaigns. |

## Color and surface roles

Distinguish stable brand roles from seasonal hero and packaging colors. The vivid berry promotion should not redefine every interface surface.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Expressive rounded serif display type provides nostalgia, with a simpler supporting and commerce hierarchy.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Ano | 16px / 400 | rgb(20, 67, 61) / rgba(0, 0, 0, 0) |
| P | Ano | 16px / 400 | rgb(3, 70, 56) / rgba(0, 0, 0, 0) |
| A | Ano | 16px / 400 | rgb(3, 70, 56) / rgba(0, 0, 0, 0) |
| BUTTON | Ano | 16px / 700 | rgb(3, 70, 56) / rgba(0, 0, 0, 0) |
| BUTTON | Ano | 16px / 700 | rgb(255, 255, 255) / rgb(3, 70, 56) |
| BUTTON | Helvetica, Arial, sans-serif | 16px / 400 | rgb(58, 58, 58) / rgba(255, 255, 255, 0) |
| P | Ano | 14px / 400 | rgb(3, 70, 56) / rgba(0, 0, 0, 0) |
| BUTTON | Ano | 14px / 400 | rgb(24, 99, 220) / rgba(255, 255, 255, 0) |
| A | Ano | 14px / 400 | rgb(24, 99, 220) / rgba(0, 0, 0, 0) |
| BUTTON | Ano | 16px / 700 | rgb(3, 70, 56) / rgba(255, 255, 255, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Packaging and campaign imagery need text alternatives; preserve product information outside decorative artwork.

## State and motion specification

Verify campaign reflow, carousel navigation, flavor selection, cart feedback and text contrast over promotional colors.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The supplied campaign image is much more colorful than Refero's cream/teal summary. Do not flatten seasonal artwork into brand-role tokens.

Live observation: `2026-10-02T21:15:23.238Z` at `https://drinkolipop.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
