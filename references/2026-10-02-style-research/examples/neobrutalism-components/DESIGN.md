# Neobrutalism components — design-system study

[Live source](https://www.neobrutalism.dev/) · study prepared 2026-10-02 · **Strong Neo-Brutalism component reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

## Direction

Current computed styles show 2px black borders and hard black shadows offset 4px horizontally and vertically with zero blur. The primary action uses a bright blue fill.

## Layout and content hierarchy

A practical component-library shell combines navigation/search with a large introductory statement and example controls. The repeated border/shadow recipe is more important than a one-off hero scene.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Button | A bordered, hard-shadowed surface with explicit hover, pressed, disabled and focus states. |
| Search | A compact command/search trigger that exposes a predictable dialog or input. |
| Card | Apply the same edge grammar without making every card interactive. |
| Chart | Preserve chart labels and semantic colors while using the surrounding border language. |

## Color and surface roles

Bright fills and dark outlines should have separate semantic roles. State colors must remain understandable beyond the aesthetic.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Current samples request DM Sans. Use a clear display/body/label hierarchy instead of assuming thick outlines require novelty type.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "DM Sans", sans-serif | 16px / unrecorded | oklch(0 0 0) / rgba(0, 0, 0, 0) |
| A | "DM Sans", sans-serif | 22px / unrecorded | oklch(0 0 0) / rgb(82, 148, 255) |
| A | "DM Sans", sans-serif | 16px / unrecorded | oklch(0 0 0) / rgba(0, 0, 0, 0) |
| BUTTON | "DM Sans", sans-serif | 16px / unrecorded | oklch(0 0 0) / oklch(1 0 0) |
| H2 | "DM Sans", sans-serif | 18px / unrecorded | oklch(0 0 0) / rgba(0, 0, 0, 0) |
| A | "DM Sans", sans-serif | 16px / unrecorded | oklch(0 0 0) / rgba(0, 0, 0, 0) |
| H1 | "DM Sans", sans-serif | 60px / unrecorded | oklch(0 0 0) / rgba(0, 0, 0, 0) |
| A | "DM Sans", sans-serif | 20px / unrecorded | oklch(0 0 0) / rgb(82, 148, 255) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Geometric star/shape assets can support identity, but should not replace labels or status indicators.

## State and motion specification

Verify pressed shadow displacement, focus rings, disabled appearance, dark-mode contrast and chart keyboard/reading alternatives.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

Live styles were captured but T3 screenshot capture remains unavailable. This is a component library rather than a commercial product case study.

Live observation: `2026-10-02T20:57:55.201Z` at `https://www.neobrutalism.dev/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
