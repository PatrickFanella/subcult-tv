# Slush — design-system study

[Live source](https://slush.app/) · [Refero reference](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b) · study prepared 2026-10-02 · **Innovative / sculptural typography and stickers**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Huge black letters overlap a textured blue tubular form, while outlined sticker illustrations and pill navigation sit in front. The layers are strong enough to identify the site without a conventional photo hero.

## Layout and content hierarchy

A large display word acts as a foreground shape over a textured blue tube. Stickers sit above both; a conventional nav and paired actions preserve the task hierarchy.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Display layer | Specify scale, line breaks and overlap regions. |
| Ribbon layer | A signature textured object is media, not a button surface. |
| Sticker layer | Use bounded illustration sizes and avoid covering actions. |
| Navigation/action layer | Pill controls retain conventional labels and consistent focus feedback. |

## Color and surface roles

Keep saturated illustration colors distinct from semantic actions and status. High-contrast outlines connect stickers and controls visually.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

The massive condensed display role should not spread into body copy or controls. Supporting sans text needs a clear scale contrast.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(255, 255, 255) / rgb(0, 0, 0) |
| P | "Aeonik Pro", Arial, sans-serif | 13.3333px / 700 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| BUTTON | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| MAIN | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "Aeonik Pro", Arial, sans-serif | 11.3778px / 700 | rgb(0, 0, 0) / rgb(233, 204, 255) |
| H1 | Lateral, Impact, sans-serif | 568.889px / 800 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H2 | "Aeonik Pro", Arial, sans-serif | 56.8889px / 500 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | "Aeonik Pro", Arial, sans-serif | 14.2222px / 500 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Raster/3D ribbon artwork and vector stickers need independent responsive rules and fallback assets.

## State and motion specification

Verify display overlap, sticker placement, nav overflow, app-entry actions and reduced-motion/resting states.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Reference image and interpreted guide reviewed; application/wallet behavior and motion not tested.

Live observation: `2026-10-02T21:16:14.230Z` at `https://slush.app/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
