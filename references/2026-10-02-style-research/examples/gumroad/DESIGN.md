# Gumroad — design-system study

[Live source](https://gumroad.com/) · study prepared 2026-10-02 · **Historical association; current style match unconfirmed**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

## Direction

The current live heading samples are large ABC Favorit type with white text. Sampled links and headings do not establish the thick borders and hard offset shadows that define the requested direction.

## Layout and content hierarchy

The current sample establishes large Favorit headings and a commercial navigation structure. It does not establish the old pink/yellow hard-shadow system often shown in historical examples.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Marketing statement | Large display copy with one primary selling action. |
| Marketplace search | A real search control needs results, empty and error states. |
| Creator/product unit | Keep creator identity, product information and action separate. |
| Commercial navigation | Pricing, feature discovery and account entry need clear roles. |

## Color and surface roles

Do not import historical pink/yellow values as current brand roles without a matching source state.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

ABC Favorit is observed in current heading samples. Other roles remain unconfirmed.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "ABC Favorit", Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif | 16px / unrecorded | rgb(221, 221, 221) / rgb(36, 36, 35) |
| A | "ABC Favorit" | 16px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "ABC Favorit" | 16px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "ABC Favorit" | 18px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "ABC Favorit" | 18px / unrecorded | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | "ABC Favorit" | 18px / unrecorded | rgb(255, 255, 255) / rgb(0, 0, 0) |
| A | "ABC Favorit" | 18px / unrecorded | rgb(0, 0, 0) / rgb(255, 144, 232) |
| H1 | "ABC Favorit" | 96px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "ABC Favorit" | 20px / unrecorded | rgb(0, 0, 0) / rgb(255, 144, 232) |
| BUTTON | Arial | 13.3333px / unrecorded | rgb(255, 255, 255) / rgb(36, 36, 35) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Creator illustrations and product art should be separated from permanent interface assets.

## State and motion specification

Verify current control borders/shadows, search feedback and cart/account entry before classifying the current site as Neo-Brutalism.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Do not assume an older Gumroad redesign remains current. No successful new screenshot was captured, and absence in this sample is not proof of absence site-wide.

Live observation: `2026-10-02T20:57:57.202Z` at `https://gumroad.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
