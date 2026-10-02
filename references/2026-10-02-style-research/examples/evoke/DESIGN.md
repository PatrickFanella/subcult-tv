# EVOKE — design-system study

[Live source](https://studioevoke.co.uk/) · [Refero reference](https://styles.refero.design/style/a69de146-6ff1-4ea8-b4a4-9d182ca2de31) · study prepared 2026-10-02 · **Memphis-adjacent / graphic portfolio**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Three equal project tiles mix photography, flat geometry and character illustration above an enormous black wordmark. Bright color comes largely from displayed work.

## Layout and content hierarchy

A repeated three-column work strip precedes a very large identity wordmark. The work tiles carry varied visual languages while the page frame remains simple.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Work tile | A consistent slot for a project image, destination and accessible name; the project art may vary. |
| Work strip | Define column count, gutter and overflow behavior rather than hard-coding one screenshot width. |
| Wordmark band | Identity artwork has its own scale and crop rules. |

## Color and surface roles

Separate site colors from project-specific photography, illustration and licensed character art. A colorful tile is not evidence of a global interface role.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use a stable small navigation/caption role around a dramatically larger identity role.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | tt_norms_pronormal | 0px / 400 | rgb(0, 0, 0) / rgb(255, 255, 255) |
| A | tt_norms_pronormal | 0px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| P | tt_norms_pronormal | 28.8462px / 400 | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| P | tt_norms_pronormal | 28.8462px / 400 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Image and illustration assets need attribution, aspect-ratio rules and fallback handling; a reference screenshot grants no reuse rights.

## State and motion specification

Verify work-tile focus/hover, captions, project detail navigation and how the wordmark scales on narrow screens.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The image is not proof of a full Memphis interface. Classification applies to geometric/color influence, with portfolio artwork kept distinct.

Live observation: `2026-10-02T21:14:51.224Z` at `https://studioevoke.co.uk/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
