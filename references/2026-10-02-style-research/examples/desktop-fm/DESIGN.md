# Desktop.fm — design-system study

[Live source](https://desktop.fm/) · [Refero reference](https://styles.refero.design/style/cb266ff9-f168-4a42-a522-f0e84508f90f) · study prepared 2026-10-02 · **Strong Y2K reference**.

This document reconstructs the selected reference and proposes a useful component breakdown. The component contracts, role descriptions and follow-up checks below are original analysis. They are not claims that the owner publishes or implements this exact system.

![Supplied reference; original capture date unknown](refero-reference.jpg)

## Direction

A silver compact disc, green laser lines and a tiny desktop-window panel establish late-1990s/early-2000s digital nostalgia. The quiet gray interface keeps the object readable.

## Layout and content hierarchy

The reference uses an almost empty field with one central disc and a small action window near the bottom. The object establishes identity; the window provides the task. Treat them as independently positioned layers rather than one flattened hero image.

## Component vocabulary

| Component | Suggested contract to document |
|---|---|
| Scene | Disc, laser paths and background form one media layer. Keep essential copy outside the effect. |
| Action window | A compact title, optional utility controls and one primary action. Its bounds should remain predictable while the scene moves. |
| Primary action | A wide dark control within the window; use a distinct disabled/loading treatment for submission. |

## Color and surface roles

Neutral gray is the visual ground; reflected silver and neon belong to the scene. Reserve high contrast for the action window and its control.

Measured colors are recorded as element observations in [tokens.json](tokens.json). Canonical background, text, accent and secondary fields remain null until a source state confirms their roles. This avoids combining project imagery, consent controls, campaign artwork and permanent UI into one palette.

## Typography

Use a compact, heavy sans role for identity and actions, with a smaller supporting role. Confirm actual font loading before promoting a family.

No usable computed-style samples were returned. The token files preserve unconfirmed roles rather than inventing measurements.

These are computed requests at one recorded viewport. They may include offscreen, loader-covered or split-text elements; a requested font family is not proof of a downloaded font. Size samples do not establish a modular scale. The raw [live observation](live-observation.json) preserves the source values.

## Media, illustration and assets

Keep a static disc poster and a lighter mobile scene. Scene materials should be a separate art-direction specification from ordinary UI colors.

## State and motion specification

Verify scene loading/failure, keyboard access to the window, waiting-list feedback and a reduced-motion still state.

These are verification requirements for adaptation, not completed interaction tests. Define loading, empty, error, selected, focused and disabled states where the component needs them. Decorative motion should have a legible resting state; product demonstrations should be distinguished from working inputs.

## Responsive adaptation

Preserve the reading order and primary task when the desktop composition changes. Define the behavior of each component rather than scaling the whole screenshot: line lengths, image crops, column collapse, control wrapping and touch targets need explicit rules. No breakpoint values or mobile conformance are established by this study.

## Studio expression

Use this document for direction and component rules, [tokens.json](tokens.json) for observations and uncertainty, and [tokens.css](tokens.css) as a CSS view of measured values. Numbered observed variables deliberately do not impersonate semantic production tokens. Keep media and identity assets separate from UI roles; a production pack requires licensed assets, approved font roles and verified layouts/states.

## Source differences and evidence limits

The supplied image supports the CD and window motifs. The live page yielded few text samples; motion remains unverified.

Live observation: `2026-10-02T20:58:04.518Z` at `https://desktop.fm/`; viewport `{'height': 800, 'width': 1280}`.

Supplied Refero images retain an unknown original capture date. Their retrieval date and source URL are recorded in [SOURCES.json](SOURCES.json). T3 screenshot capture failed, so computed-style passes are not new live visual proof. No complete motion, mobile or accessibility audit is claimed. See the shorter [reference assessment](GUIDE.md) and the collection's [Refero review](../../REFERO-REVIEW.md) for selection context.
