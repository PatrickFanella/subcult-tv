# Spacelab — design-system study

[Live source](https://spacelab.co.uk/) · [Refero reference](https://styles.refero.design/style/7fdcf5eb-4d65-49a2-b887-60119bca4edc) · study prepared 2026-10-02 · **Strong Swiss-influenced reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A left index rail and a broad right content column create an asymmetric, aligned composition. A single sans-serif heading and architecture photograph dominate the white field.

## Layout and content hierarchy

A narrow left index and a broad right story column create the main asymmetric grid. The heading and photograph share a strong content edge.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Index rail | Category links need an active state, consistent alignment and a clear mobile replacement. |
| Story block | Heading, image and caption form one editorial unit. |
| Photo region | Use large architectural imagery without decorative card chrome. |
| Utility navigation | Keep contact/about distinct from content filters. |

## Color and surface roles

White space and dark text form the main system. Project photographs supply most variation; a sparse accent should have a declared action role.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

A restrained sans hierarchy supports display, paragraph and index text. Current samples identify HelveticaNeue; no global scale is inferred.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | HelveticaNeue | 18.6624px / unrecorded | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | HelveticaNeue | 18.6624px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | HelveticaNeue | 18.6624px / unrecorded | rgb(178, 180, 177) / rgba(0, 0, 0, 0) |
| H1 | HelveticaNeue | 55.3154px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | HelveticaNeue | 18.6624px / unrecorded | rgb(0, 0, 0) / rgb(220, 170, 170) |
| A | HelveticaNeue | 18.6624px / unrecorded | rgb(0, 0, 0) / rgba(255, 255, 255, 0.85) |
| A | HelveticaNeue | 18.6624px / unrecorded | rgb(255, 255, 255) / rgb(73, 84, 114) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Use consistent architectural image ratios and meaningful descriptions; preserve the relationship between image and story context.

## State and motion specification

Verify selected category, index focus, long heading wraps, story pagination and mobile rail collapse.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Current live samples confirm HelveticaNeue and an approximately 55.3px heading at the recorded desktop viewport; this is not a universal type scale.

Live observation: `2026-10-02T20:58:17.210Z` at `https://spacelab.co.uk/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
