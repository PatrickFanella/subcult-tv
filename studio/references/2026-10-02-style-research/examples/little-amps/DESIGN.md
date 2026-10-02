# Little Amps — design-system study

[Live source](https://littleampscoffee.com/) · [Refero reference](https://styles.refero.design/style/ca522706-03ed-48cb-acb3-1bb2a22f2eda) · study prepared 2026-10-02 · **Strong analog retro reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A record player fills the opening image, with warm yellow framing, an expressive serif title and a ruled monospace navigation band below.

## Layout and content hierarchy

A broad documentary media scene establishes the opening, followed by a ruled navigation strip. Warm framing makes the media and interface feel related.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Media opener | One image/video with a reliable poster and readable identity overlay. |
| Ruled navigation | Group commerce, informational destinations and utilities without relying only on dividers. |
| Product listing | Keep prices and options readable in the label typography. |
| Community/editorial block | Dates and categories can use the same metadata grammar. |

## Color and surface roles

Warm framing and dark supporting text are separate from photographed wood, records and coffee. Image colors are not the whole UI palette.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use expressive serif display alongside compact monospace labels. Long copy needs a deliberate reading role.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "Inclusive Sans" | 16px / 400 | rgb(82, 44, 37) / rgb(255, 249, 242) |
| A | "Necto Mono" | 13.6px / 400 | rgb(192, 48, 1) / rgba(0, 0, 0, 0) |
| HEADER | "Necto Mono" | 14px / 400 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| BUTTON | "Roboto Mono", monospace | 12px / 400 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| BUTTON | "Little Amps" | 33px / 500 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| A | "Little Amps" | 33px / 500 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| A | "Necto Mono" | 13.6px / 400 | rgb(255, 249, 242) / rgb(82, 44, 37) |
| A | "Necto Mono" | 13.6px / 400 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| H1 | "Little Amps" | 45.85px / 500 | rgb(82, 44, 37) / rgba(0, 0, 0, 0) |
| A | "Little Amps" | 45.85px / 500 | rgb(192, 48, 1) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Documentary images should retain captions/context; moving media needs a still fallback and pause control where applicable.

## State and motion specification

Verify overlay contrast, navigation focus, shop/cart states and narrow-screen navigation order.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Playback and shopping states are untested. The reference image's original capture date is not supplied.

Live observation: `2026-10-02T21:15:31.225Z` at `https://littleampscoffee.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
