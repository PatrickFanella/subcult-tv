# Cursor — design-system study

[Live source](https://cursor.com/) · [Refero reference](https://styles.refero.design/style/4e3b4717-84c8-4599-baaf-a343c3d619b6) · study prepared 2026-10-02 · **Distinctive / warm developer-tool presentation**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A modest left-aligned introduction sits above a large product window on a painterly background. Dark capsule actions stand out without a giant hero headline.

## Layout and content hierarchy

A restrained introduction precedes a large product-window image over a painterly field. The marketing shell and the depicted application have distinct component vocabularies.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Introduction | Keep one primary message and bounded supporting copy. |
| Action group | Download and demo/contact roles need a clear hierarchy. |
| Product window | Use a repeatable frame and caption for the working application. |
| Background art | Painterly scenery supports the product image rather than UI controls. |

## Color and surface roles

Warm neutral marketing surfaces should not be confused with syntax colors or application statuses inside screenshots.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Map marketing headline/body/labels separately from the application's code and editorial content; confirm actual font roles from source.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 16px / 400 | rgb(237, 236, 236) / rgb(20, 18, 11) |
| HEADER | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 16px / 400 | rgb(237, 236, 236) / rgb(20, 18, 11) |
| A | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 14px / 400 | rgb(20, 18, 11) / rgb(237, 236, 236) |
| A | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 16px / 400 | rgb(237, 236, 236) / rgba(0, 0, 0, 0) |
| A | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 14px / 400 | rgb(237, 236, 236) / rgba(0, 0, 0, 0) |
| BUTTON | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 14px / 400 | rgb(237, 236, 236) / rgba(0, 0, 0, 0) |
| A | CursorGothic, "CursorGothic Fallback", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif | 14px / 400 | rgb(237, 236, 236) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Window frames may overlap, but their key content should remain readable. Provide a simpler product still on narrow screens.

## State and motion specification

Verify platform download labels, product-demo motion, foreground/background contrast and which radius rules belong to each surface.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The image's rounded actions need distinguishing from the sharp/small-radius recommendation in Refero. Product UI and marketing UI are separate scopes.

Live observation: `2026-10-02T21:16:35.248Z` at `https://cursor.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
