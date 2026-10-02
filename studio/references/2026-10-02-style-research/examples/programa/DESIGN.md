# Programa — design-system study

[Live source](https://programa.design/) · [Refero reference](https://styles.refero.design/style/41af8353-6a8f-416d-947b-57932f591497) · study prepared 2026-10-02 · **Search-match discrepancy; not a primary Swiss example**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

The supplied image centers a large serif headline above a product window, with small floating object cards. It differs from the austere sans-serif Swiss description.

## Layout and content hierarchy

The supplied screenshot has a centered serif introduction, floating material/object cards and a large product frame below. That composition differs from the source's more austere Swiss description.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Introduction | Separate display serif, supporting copy and paired actions. |
| Object card | Small image-based accents should have consistent bounds and avoid obscuring text. |
| Product frame | An application screenshot needs a caption or explanation when it demonstrates workflow. |
| Trust strip | Keep supporting logos/review marks subordinate. |

## Color and surface roles

Use calm surfaces and reserve highlights for meaningful emphasis. Do not infer a full palette from product screenshots or material cards.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

The pictured serif display is a distinct role from navigation and product UI. A pure Swiss sans hierarchy is not established by this image.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(26, 26, 26) / rgb(255, 255, 255) |
| MAIN | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 16px / 400 | rgb(26, 26, 26) / rgba(0, 0, 0, 0) |
| HEADER | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 16px / 400 | rgb(26, 26, 26) / rgba(0, 0, 0, 0) |
| A | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 16px / 400 | rgb(26, 26, 26) / rgba(0, 0, 0, 0) |
| A | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 14px / 400 | rgb(26, 25, 22) / rgba(0, 0, 0, 0) |
| A | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 16px / 400 | rgb(26, 25, 22) / rgba(0, 0, 0, 0) |
| P | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 14px / 500 | rgb(26, 25, 22) / rgba(0, 0, 0, 0) |
| P | Inter, "Inter Fallback", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial | 14px / 400 | rgb(123, 115, 108) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Product frames may have different rules from decorative cards. Keep both separate from real interactive application controls.

## State and motion specification

Verify object movement, product-demo transitions, CTA focus and narrow-screen ordering before selecting this direction.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Do not map Refero's sans-serif description onto this screenshot without finding a matching state.

Live observation: `2026-10-02T21:15:04.223Z` at `https://programa.design/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
