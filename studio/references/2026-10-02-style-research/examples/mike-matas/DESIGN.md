# Mike Matas — design-system study

[Live source](https://mikematas.com/) · [Refero reference](https://styles.refero.design/style/04f6cb02-de90-4d78-9c5f-0eb52f826484) · study prepared 2026-10-02 · **Strong minimalist portfolio reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

Small identity and social links sit in a wide white field above large device images. Most color belongs to the work, giving the interface a quiet supporting role.

## Layout and content hierarchy

A small identity block and compact link list sit above large work images with generous empty space. The work, rather than ornamental interface elements, creates visual variation.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Identity block | Name/date or introduction needs stable placement and text wrapping. |
| Link list | Quiet links must still expose focus and hover states. |
| Work image | Device mockups and screenshots form the main content unit. |
| Project context | Add enough caption/destination information to explain each image. |

## Color and surface roles

Keep the UI palette restrained and separate it from colors shown inside project screenshots.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

A small, consistent hierarchy can carry identity, links and project descriptions; very thin text should be checked at real display sizes.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "Lab Grotesque", -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif | 20px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |
| H2 | "Lab Grotesque", -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif | 16px / unrecorded | rgb(0, 0, 0) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Large work images need loading, crop and aspect-ratio rules. Avoid flattening all project descriptions into image pixels.

## State and motion specification

Verify project destinations, keyboard order, image failure, captions and the spacing rhythm at narrow widths.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The live page has limited semantic text samples. The reference supports composition, not complete component or mobile coverage.

Live observation: `2026-10-02T20:58:23.200Z` at `https://mikematas.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
