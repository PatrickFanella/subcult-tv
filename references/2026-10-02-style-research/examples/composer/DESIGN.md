# Composer — design-system study

[Live source](https://www.composer.trade/) · [Refero reference](https://styles.refero.design/style/1e675740-7935-4a49-b4c8-e5aa9fda06dd) · study prepared 2026-10-02 · **Bauhaus / Memphis-adjacent**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A faint grid organizes colored rectangular blocks behind an oversized headline. The palette behaves like a composition system rather than a single accent.

## Layout and content hierarchy

A faint structural grid supports a large headline and colored rectangular modules. Copy and the action sit on a stable left edge while the modules build a separate visual rhythm.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Grid field | Define column and row alignment; the visual grid should not imply every module is interactive. |
| Color module | A bounded fill may support emphasis, pattern or media, with a declared purpose. |
| Display block | Large text needs line-break and overlap rules. |
| Action group | Separate product entry from editorial navigation. |

## Color and surface roles

The reference uses several saturated blocks over a neutral field. Define which blocks communicate information and which are decorative.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use an oversized sans display role and a quieter UI role. Avoid shrinking the entire desktop display composition to fit mobile.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | neue-haas-grotesk-display, system-ui, sans-serif | 16px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | neue-haas-grotesk-display, system-ui, sans-serif | 16px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| P | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 400 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 400 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| HEADER | neue-haas-grotesk-display, system-ui, sans-serif | 16px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 500 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 500 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| A | neue-haas-grotesk-display, system-ui, sans-serif | 14px / 600 | rgb(255, 255, 255) / rgb(0, 0, 0) |
| MAIN | neue-haas-grotesk-display, system-ui, sans-serif | 16px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

A modular pattern should have a simple static form. Product imagery and charts require their own semantic labels and accessible explanations.

## State and motion specification

Verify display wrapping, module overlap, primary action and whether any pattern animation conveys information.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Bauhaus geometry is the closer label. The image provides useful comparison to Memphis but lacks its characteristic squiggle/pattern layer.

Live observation: `2026-10-02T21:14:57.227Z` at `https://www.composer.trade/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
