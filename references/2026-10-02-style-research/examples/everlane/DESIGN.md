# Everlane — design-system study

[Live source](https://everlane.com/) · [Refero reference](https://styles.refero.design/style/34b4856c-cc2b-4164-ab90-1b87cf8e0213) · study prepared 2026-10-02 · **Minimalist editorial commerce reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Thin navigation, a centered wordmark and large fashion photography create a lookbook. Text actions carry little visual weight; promotion is isolated in a horizontal band.

## Layout and content hierarchy

Compact navigation and a centered identity frame full-width fashion photography. Promotion appears in a separate horizontal band, keeping its urgency distinct from the lookbook.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Catalog navigation | Separate category, search and account/cart utilities. |
| Editorial hero | Set explicit safe areas for overlay text. |
| Promotion band | One offer with clear destinations and a bounded height. |
| Product tile | Product imagery, names and price must remain usable without hover. |

## Color and surface roles

A restrained shell allows campaign imagery to dominate. Promotional hues should have a distinct temporary role.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Track short labels deliberately while keeping longer supporting text readable. Identity and product labels have different responsibilities.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "Maison Neue Book", sans-serif | 16px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | "Maison Neue Book", sans-serif | 16px / 700 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | "Maison Neue Book", sans-serif | 15px / 400 | rgb(255, 255, 255) / rgb(18, 18, 18) |
| BUTTON | Arial | 13.3333px / 400 | rgb(18, 18, 18) / rgba(0, 0, 0, 0) |
| A | "Maison Neue Book", sans-serif | 14px / 400 | rgb(22, 25, 18) / rgba(0, 0, 0, 0) |
| A | "Maison Neue Book", sans-serif | 12px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| HEADER | "Maison Neue Book", sans-serif | 16px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| H1 | "Maison Neue Book", sans-serif | 32px / 400 | rgb(18, 18, 18) / rgba(0, 0, 0, 0) |
| A | "Maison Neue Book", sans-serif | 14px / 700 | rgb(18, 18, 18) / rgba(0, 0, 0, 0) |
| BUTTON | "Maison Neue Book", sans-serif | 12px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Define crop/focal-point rules for people and apparel; preserve product details in text rather than relying on lifestyle images.

## State and motion specification

Verify search, category selection, product-card alternatives, cart feedback and contrast across changing hero photographs.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

This is one campaign state. Search, cart, catalog filtering and checkout were not inspected.

Live observation: `2026-10-02T21:16:03.264Z` at `https://www.everlane.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
