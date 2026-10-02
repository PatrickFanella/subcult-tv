# Steep — design-system study

[Live source](https://steep.app/) · [Refero reference](https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e) · study prepared 2026-10-02 · **Innovative / editorial analytics**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A serif headline sits among detached chart cards and a composer field. The screenshot uses a soft colored glow and small shadows to keep the fragments distinct.

## Layout and content hierarchy

A centered editorial statement is surrounded by detached charts, metric cards and a composer field. The fragments explain a product without requiring a full dashboard frame.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Editorial statement | Serif display and selective italic emphasis need controlled wrapping. |
| Metric artifact | Value, label, context and chart should remain a coherent unit. |
| Composer artifact | Distinguish demonstration art from a real input. |
| Action pair | Provide clear product-entry and demo-request priorities. |

## Color and surface roles

A warm/glowing media ground and chart accents are separate from basic text/action surfaces. The screenshot's shadows need measurement before creating global elevation tokens.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Pair an editorial serif display with practical sans labels and metrics. Preserve numeric readability and meaning.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 15px / 430 | rgb(23, 25, 28) / oklab(0 0 0 / 0.04) |
| H2 | Signifier, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif | 90px / 400 | rgb(23, 25, 28) / rgba(0, 0, 0, 0) |
| A | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(23, 25, 28) / rgba(0, 0, 0, 0) |
| BUTTON | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 430 | rgb(255, 255, 255) / rgb(23, 25, 28) |
| BUTTON | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 430 | rgb(23, 25, 28) / rgba(0, 0, 0, 0) |
| BUTTON | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(255, 255, 255) / rgb(0, 0, 0) |
| H2 | Signifier, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif | 64px / 400 | rgb(23, 25, 28) / rgba(0, 0, 0, 0) |
| P | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(93, 42, 26) / rgba(0, 0, 0, 0) |
| P | Sohne, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 16px / 400 | rgb(76, 76, 76) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Chart fragments should have explanations and sensible static arrangements when animation is disabled.

## State and motion specification

Verify demo versus interactive input, chart meaning, focus states, fragment reflow and actual shadow/glow values.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The image visibly contains glow and shadows despite prose emphasizing near-flat surfaces. Exact effects require source inspection.

Live observation: `2026-10-02T21:16:20.223Z` at `https://steep.app/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
