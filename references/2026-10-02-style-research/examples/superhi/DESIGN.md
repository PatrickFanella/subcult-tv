# SuperHi — design-system study

[Live source](https://superhi.com/) · [Refero reference](https://styles.refero.design/style/90b8631c-4e2c-407e-86a3-d2bff456dc93) · study prepared 2026-10-02 · **Strong contemporary Memphis-influenced reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Oversized circles, polygons and a starburst sit asymmetrically around centered content. A pale ground, simple typography and capsule actions keep the decorative shapes from obscuring the task.

## Layout and content hierarchy

The centered message has a protected reading area surrounded by large asymmetrically cropped shapes. Navigation and paired actions use calmer, repeatable surfaces.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Shape field | Choose a small vocabulary of circles, polygons and starbursts with placement and crop rules. |
| Hero statement | Set a controlled line length with a clear supporting paragraph. |
| Action pair | Primary and secondary actions use distinct fills and a shared capsule grammar. |
| Course/navigation surface | Keep transactional controls predictable even when the decoration changes. |

## Color and surface roles

Separate decorative shape colors from action and text roles. The reference's bright geometric layer should not compete with the CTA.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Large sans display text carries the statement; smaller supporting text and navigation provide continuity. The sampled live heading family is evidence for that viewport only.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(17, 17, 24) / rgb(255, 255, 255) |
| BUTTON | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 24px / unrecorded | rgb(255, 255, 255) / rgb(39, 39, 230) |
| BUTTON | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(255, 255, 255) / rgb(0, 0, 0) |
| BUTTON | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| BUTTON | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | __haasGrotText_7ea857, __haasGrotText_Fallback_7ea857 | 16px / unrecorded | rgb(17, 17, 24) / rgba(0, 0, 0, 0) |
| BUTTON | __haasGrotDisp_332926, __haasGrotDisp_Fallback_332926 | 24px / unrecorded | rgb(17, 17, 24) / rgba(0, 0, 0, 0) |
| A | __haasGrotDisp_332926, __haasGrotDisp_Fallback_332926 | 24px / unrecorded | rgb(17, 17, 24) / rgba(0, 0, 0, 0) |
| H1 | __haasGrotDisp_332926, __haasGrotDisp_Fallback_332926 | 92px / unrecorded | rgb(17, 17, 24) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Flat shapes can be vector assets with simple crop rules. Record any shape motion independently from hover and navigation transitions.

## State and motion specification

Verify the two actions, catalog navigation, offer-strip dismissal, shape reflow and reduced-motion behavior.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The current live heading uses a generated Haas Grotesk Display family at 92px. Motion and small-screen placement remain untested.

Live observation: `2026-10-02T20:58:09.200Z` at `https://www.superhi.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
