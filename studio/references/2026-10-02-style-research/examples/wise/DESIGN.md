# Wise — design-system study

[Live source](https://wise.com/) · [Refero reference](https://styles.refero.design/style/367c0c6e-73a7-441c-a8ff-91d139ac60dc) · study prepared 2026-10-02 · **Distinctive / economical brand roles**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Heavy display letters and a lime action sit in a broad near-white field; a globe image provides the larger visual metaphor. Navigation remains compact.

## Layout and content hierarchy

Heavy display text, a concise explanation and a small action group lead into a larger globe/media metaphor. Navigation occupies a compact band above.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Display statement | Specify line breaks and minimum readable sizes for the heavy face. |
| Action group | A filled primary and quieter alternative need distinct roles. |
| Region/navigation control | Language/location changes should be explicit. |
| Media metaphor | The globe illustrates the message without becoming essential control chrome. |

## Color and surface roles

The lime/dark pairing can provide identity through a small number of roles. Separate decorative globe colors from account/action and feedback colors.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use the heavy display face sparingly; supporting copy and functional controls need a less emphatic hierarchy.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Inter, Helvetica, Arial, sans-serif | 18px / 400 | rgb(69, 71, 69) / rgba(0, 0, 0, 0) |
| A | Inter, Helvetica, Arial, sans-serif | 20px / 600 | rgb(159, 232, 112) / rgb(22, 51, 0) |
| A | Inter, Helvetica, Arial, sans-serif | 14px / 600 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |
| A | Inter, Helvetica, Arial, sans-serif | 14px / 600 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |
| P | "Wise Sans", Inter, sans-serif | 40px / 900 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |
| P | Inter, Helvetica, Arial, sans-serif | 16px / 400 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |
| P | Inter, Helvetica, Arial, sans-serif | 16px / 600 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |
| P | Inter, Helvetica, Arial, sans-serif | 16px / 400 | rgb(22, 51, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

A globe scene should have a still fallback. Its implied service coverage is content, not a design-system claim.

## State and motion specification

Verify region differences, light/dark surface inversion, action focus and media pause. Account/financial behavior is outside this study.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

This is a design reference, not a review of financial claims or account flows. Region-specific pages may differ.

Live observation: `2026-10-02T21:16:28.224Z` at `https://wise.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
