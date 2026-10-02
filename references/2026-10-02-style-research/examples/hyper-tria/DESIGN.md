# Hyper Tria — design-system study

[Live source](https://hypertria.com/) · [Refero reference](https://styles.refero.design/style/6665a3dd-606f-4fd1-80dd-a84e3b3a6226) · study prepared 2026-10-02 · **Secondary candidate; verify hero**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

The reference image shows a white, two-column gallery with a futuristic project render and italic explanatory copy. It does not show the chrome-letter hero described in Refero.

## Layout and content hierarchy

The supplied state is a white portfolio spread: navigation above an image/copy pair, with an identity badge near the lower corner. Refero describes an additional chrome hero that is not pictured here.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Project spread | Pair one dominant image with a controlled copy measure; maintain aligned edges. |
| Identity badge | Treat the circular mark as supplied art, with clear space and a static fallback if animated. |
| Portfolio navigation | Keep current project and agency-level destinations distinguishable. |

## Color and surface roles

The pictured white/black shell is distinct from the colored project rendering. Additional hero colors require a matching capture.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use a navigation role, an editorial project-description role and a supplied identity role. The pictured italic copy should not automatically become the universal body style.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 28px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| HEADER | -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 28px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 28px / 400 | rgb(0, 123, 255) / rgba(0, 0, 0, 0) |
| A | "Aeonik Regular" | 26px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | "Aeonik Regular" | 19px / 400 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "Aeonik Regular" | 19px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| MAIN | -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 28px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" | 30px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H2 | "Aeonik Regular" | 75px / 300 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | "Aeonik Regular" | 90px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Preserve project image ratios and captions. Do not redraw the mark or promote image colors to brand tokens.

## State and motion specification

Verify project selection, language navigation, long-copy wrapping and the unpictured hero transition.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Refero's prose describes a different state from the supplied image. The chrome/Y2K claim is not visually established here.

Live observation: `2026-10-02T21:14:36.224Z` at `https://hypertria.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
