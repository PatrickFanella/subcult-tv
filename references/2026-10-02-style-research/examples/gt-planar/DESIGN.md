# Gt-planar — design-system study

[Live source](https://gt-planar.com/) · [Refero reference](https://styles.refero.design/style/3f22028a-05d4-4648-a6d1-591134af06a4) · study prepared 2026-10-02 · **Y2K-adjacent / sci-fi typography**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

The supplied image puts a warp-speed field beneath an instrument-like navigation strip. Outlined rectangular controls and sparse warning colors carry the futuristic register.

## Layout and content hierarchy

An instrument-like strip spans the top of a full-screen graphic field. Navigation, warnings and specimen controls must remain legible while the background changes.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Instrument strip | Rectangular grouped labels with consistent outline thickness and alignment. |
| Type specimen | The face being demonstrated should have explicit size, weight and text-input states. |
| HUD scene | Warp lines and instrument details form the media layer; they must not obscure navigation. |

## Color and surface roles

Use the black/white scene as the main field. Separate warning, action and specimen-highlight colors rather than calling all bright hues an accent.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Typography is both content and interface. Record the specimen face separately from small navigation and status text.

| Sample | Requested family | Size / weight | Text / surface |
|---|---|---|---|
| BODY | "GT Planar", "Comic Sans MS", cursive | 16px / 300 | rgb(255, 255, 255) / rgb(0, 0, 0) |
| H1 | "GT Planar", "Comic Sans MS", cursive | 14px / 300 | rgb(252, 255, 118) / rgb(0, 0, 0) |
| A | "GT Planar", "Comic Sans MS", cursive | 14px / 300 | rgb(148, 148, 148) / rgba(0, 0, 0, 0) |
| A | "GT Planar", "Comic Sans MS", cursive | 17px / 300 | rgb(0, 0, 0) / rgb(0, 255, 133) |
| A | "GT Planar", "Comic Sans MS", cursive | 17px / 300 | rgb(0, 255, 133) / rgba(0, 0, 0, 0) |
| A | "GT Planar", "Comic Sans MS", cursive | 17px / 300 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| A | "GT Planar", "Comic Sans MS", cursive | 32px / 300 | rgb(255, 255, 255) / rgba(0, 0, 0, 0) |
| BUTTON | "GT Planar", "Comic Sans MS", cursive | 17px / 400 | rgb(97, 0, 255) / rgba(0, 0, 0, 0) |

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

The reference supports a single warp-field state. Document rendering cost, load poster and contrast-safe control backgrounds before adapting it.

## State and motion specification

Verify text entry, specimen settings, focus outlines, scene pause and reduced-motion behavior.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

This is a futuristic/HUD branch of the brief, rather than a universal example of Y2K. Image evidence is a single state.

Live observation: `2026-10-02T21:14:28.231Z` at `https://gt-planar.com/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
