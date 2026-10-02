# teenage engineering — design-system study

[Live source](https://teenage.engineering/) · [Refero reference](https://styles.refero.design/style/aecf9dda-5cba-4dc7-9e73-59b65d895cdf) · study prepared 2026-10-02 · **Industrial minimalism; scene-specific evidence**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

The supplied image gives almost all space to a photographed device. A yellow triangular consent panel is conspicuous and uses the visual language of a warning sign.

## Layout and content hierarchy

The supplied state is an immersive product photograph rather than a catalog grid. The product and a conspicuous triangular consent panel are separate components with different purposes.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Product scene | Give hardware imagery space without hiding the route to specifications or purchase. |
| Catalog/specification unit | Technical information needs a repeatable hierarchy independent from the hero. |
| Consent panel | A distinctive shape still requires clear settings and accept controls. |
| Product navigation | Compact controls should remain discoverable on media-heavy pages. |

## Color and surface roles

Separate product material/color, neutral interface roles and warning-like consent art. A yellow consent panel does not establish a universal brand accent.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Record the custom requested families as observations; do not adopt ultra-thin text without testing actual size and contrast.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | te-20, Unicode, sans-serif | 16px / 300 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | te-20, Unicode, sans-serif | 16px / 100 | rgb(15, 14, 18) / rgba(0, 0, 0, 0) |
| BUTTON | te-20, Unicode, sans-serif | 16px / 100 | rgb(15, 14, 18) / rgba(0, 0, 0, 0) |
| MAIN | te-20, Unicode, sans-serif | 16px / 300 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | te-20, Unicode, sans-serif | 16px / 300 | rgb(229, 229, 229) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

A product scene needs a poster/fallback and a clear path to technical content. Photograph colors are art direction rather than CSS tokens.

## State and motion specification

Verify consent without changing it during research, product navigation, media loading, specifications and mobile discoverability.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The screenshot does not show the white catalog layout described in the text. Thin font-weight recommendations need independent legibility checks.

Live observation: `2026-10-02T21:16:09.225Z` at `https://teenage.engineering/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
