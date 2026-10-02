# Rough.js — design-system study

[Live source](https://roughjs.com/) · study prepared 2026-10-02 · **Hand-drawn graphics implementation reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

## Direction

The official examples demonstrate irregular outlines and patterned fills on ordinary geometric primitives. The site's own navigation is conventional; the output is the design reference.

## Layout and content hierarchy

A documentation page introduces the library, then demonstrates geometric primitives and fill styles. Its conventional website shell differs from the generated sketch output.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Sketch primitive | Line, polygon, ellipse and path output need stable parameters. |
| Fill pattern | Hatching, solid and other patterns should have independent spacing/weight rules. |
| Example block | Pair a rendered result with concise explanatory code. |
| Documentation navigation | Keep API destinations distinct from sponsorship/project links. |

## Color and surface roles

Drawing colors are input parameters, not a site-wide semantic palette. Specify stroke and fill independently.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

The documentation's sans typography is separate from any sketch-like lettering an application adds.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 18px / unrecorded | rgb(96, 108, 113) / rgba(0, 0, 0, 0) |
| H1 | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 40px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| H2 | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 24px / unrecorded | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 14.4px / unrecorded | rgba(255, 255, 255, 0.8) / rgba(255, 255, 255, 0.08) |
| A | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 18px / unrecorded | rgb(21, 87, 153) / rgba(0, 0, 0, 0) |
| H2 | "SF Pro Display", -apple-system, "system-ui", "San Francisco", "Helvetica Neue", Helvetica, Ubuntu, Roboto, Noto, "Segoe UI", Arial, sans-serif | 28px / unrecorded | rgb(21, 153, 87) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Treat roughness, bowing, hatch gap and stroke width as drawing-system parameters. Canvas and SVG output have different accessibility/editing implications.

## State and motion specification

Verify deterministic rendering where required, small-scale legibility, pattern density and the consuming application's interaction states.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

This is a library/demo source rather than a wholly hand-drawn website. No current package version or performance claim is inferred.

Live observation: `2026-10-02T20:58:02.201Z` at `https://roughjs.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
