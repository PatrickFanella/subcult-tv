# Notion — design-system study

[Live source](https://notion.so/) · [Refero reference](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9) · study prepared 2026-10-02 · **Hand-drawn accent layer within a product site**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Illustrated faces and small doodled objects surround otherwise conventional typography and product screenshots. Selective colored backgrounds make the line drawings feel like annotations.

## Layout and content hierarchy

A product message and actions occupy the center; illustrated faces and doodled objects add personality around the edges. A large product example follows.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Illustration motif | Define line, fill, scale and safe placement rules. |
| Verb highlight | A colored emphasis capsule should be separate from an actionable button. |
| Action pair | Signup and demo actions retain ordinary controls. |
| Product example | Screenshot content needs explanation independent from decorative figures. |

## Color and surface roles

Use selective illustration and highlight fills rather than giving every control a hand-drawn treatment. Keep action roles consistent.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use a clear sans hierarchy for product copy and controls; illustration lettering belongs to artwork rather than the general reading system.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | sans-serif | 16px / 400 | rgb(0, 0, 0) / rgb(25, 25, 25) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Illustration and product screenshots have separate ownership and accessibility needs. Drawn styling does not establish how an asset was produced.

## State and motion specification

Verify rotating emphasis, illustration movement, signup/demo focus, screenshot scaling and reduced-motion behavior.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The reference supports the illustration layer. It does not establish a hand-drawn application UI or the motion timing claimed in the source.

Live observation: `2026-10-02T21:16:41.234Z` at `https://www.notion.so/login`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
