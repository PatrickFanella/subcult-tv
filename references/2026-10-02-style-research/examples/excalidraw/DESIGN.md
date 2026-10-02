# Excalidraw — design-system study

[Live source](https://excalidraw.com/) · study prepared 2026-10-02 · **Hand-drawn output with conventional controls**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

## Direction

The application is a useful reference for sketch-style diagram output alongside a regular tool palette. Rough.js names Excalidraw as a supporting project with a hand-drawn diagram feel.

## Layout and content hierarchy

The working canvas is the main content surface, with tool controls and property settings around it. The sketch aesthetic belongs mainly to the drawing output.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Canvas | Selection, drawing and viewport movement are distinct interaction modes. |
| Tool selector | Active tool and shortcuts must remain understandable without drawn decoration. |
| Property controls | Stroke, fill, text and geometry settings need consistent feedback. |
| Document actions | Save/export/share actions require clear scope and destination. |

## Color and surface roles

Separate drawing colors from tool selection, focus and error roles. A user's canvas palette is not the application brand palette.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Keep handwriting/sketch text options distinct from ordinary interface labels. The sampled default Times heading is not treated as a brand role.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | Times | 16px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H1 | Times | 32px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| BUTTON | Arial | 14px / unrecorded | rgb(153, 153, 153) / rgba(0, 0, 0, 0) |
| A | Assistant, system-ui, "system-ui", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif | 14px / unrecorded | rgb(153, 153, 153) / rgba(0, 0, 0, 0) |
| BUTTON | Assistant, system-ui, "system-ui", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif | 13.3328px / unrecorded | rgb(27, 27, 31) / rgb(236, 236, 244) |
| H2 | Assistant, system-ui, "system-ui", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif | 24px / unrecorded | rgb(27, 27, 31) / rgba(0, 0, 0, 0) |
| BUTTON | Assistant, system-ui, "system-ui", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif | 16px / unrecorded | rgb(27, 27, 31) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Drawing primitives, rendered output and UI controls are separate artifacts; preserve editability and meaningful export choices.

## State and motion specification

Verify selection, undo, text entry, zoom, export and collaboration in a dedicated interaction pass. No canvas content was changed in this review.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The live canvas was not modified. No drawing, save, share or account action was performed; the default Times H1 is not treated as a visual brand token.

Live observation: `2026-10-02T20:58:00.199Z` at `https://excalidraw.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
