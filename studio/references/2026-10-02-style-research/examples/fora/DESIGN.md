# FORA — design-system study

[Live source](https://fora-concept.com/) · [Refero reference](https://styles.refero.design/style/9929101b-90d4-4306-bc4a-4d8f65b527f5) · study prepared 2026-10-02 · **Swiss grid with an editorial serif identity**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A strict mosaic partitions identity, copy, news and photographs into discrete panels. Terracotta and lilac occupy entire cells; the large serif mark adds a contrasting identity role.

## Layout and content hierarchy

A strict mosaic divides identity, positioning, team, news and projects into independently useful cells. Color can establish a cell's role without extra card framing.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Mosaic cell | Declare permitted content types and a minimum useful height for each. |
| Identity cell | The large serif mark is supplied identity art with its own placement rules. |
| News cell | Allow variable copy length and a visible destination. |
| Image cell | Pair a full-bleed photograph with a small section action or caption. |

## Color and surface roles

Large terracotta and lilac panels work as section surfaces. Text and action contrast must be checked per surface rather than inherited indiscriminately.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Keep the serif identity distinct from sans content and small navigation. This hybrid can use a Swiss grid without requiring exclusively sans identity.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| HEADER | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 15px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H1 | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 15px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| MAIN | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 18px / 400 | rgb(0, 0, 0) / rgb(169, 85, 60) |
| P | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 15px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H2 | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 23px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | Theinhardt, ui-sans-serif, system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 15px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Images should fit declared cell ratios and preserve the intended crop at each breakpoint.

## State and motion specification

Verify mosaic reordering, long news copy, focus states inside colored cells and image loading/failure.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The serif mark is visually prominent despite the source summary emphasizing sans-serif type. Treat this as a hybrid, not orthodox Swiss typography.

Live observation: `2026-10-02T21:15:10.224Z` at `https://www.fora-concept.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
