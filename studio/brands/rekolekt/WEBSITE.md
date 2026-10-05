# Rekolekt — Website design specification

Updated 2 October 2026 from the landing-page implementation at [rekolekt.subcult.tv](https://rekolekt.subcult.tv/), revision [`cc43e1d6365d24663c882284e92164e38fc4f4d7`](https://git.subcult.tv/subculture-collective/rekolekt/src/commit/cc43e1d6365d24663c882284e92164e38fc4f4d7/landing). This document records the implemented design and the five corrections from the interface originality audit. The [brand guide](GUIDE.md) governs marks, color roles, fonts and asset editing.

## Product identity and copy

Rekolekt is open-source software for running a searchable recording archive. HasanAra is a live archive powered by Rekolekt, with its own collection and client brand profile. The product landing page introduces the software and directs people to a working archive or self-hosting documentation.

Use lowercase `rekolekt` in the wordmark, `Rekolekt` in prose, and “Rekolekt by SUBCULT” for endorsement. The current source repository is `subculture-collective/rekolekt`; the contact route retains `product=transcript-create` for compatibility.

| Element | Implemented copy or destination |
| --- | --- |
| Hero headline | Keep the conversation within reach. |
| Product explanation | Open-source software for running your own searchable recording archive. |
| Supporting copy | Turn long-form recordings into searchable, timestamped transcripts. Find a passage. Read what came before it. Share it with the context attached. |
| Primary action | Explore HasanAra → `https://hasanara.tv` |
| Secondary action | Self-host Rekolekt → the “Your archive” section |
| Relationship note | HasanAra is a live archive powered by Rekolekt. · Apache 2.0 |
| Closing action | Read the installation guide → the product repository’s `DEVELOPMENT.md` |

The table records the deployed copy word for word. New copy follows the Rekolekt voice in [the voice guide](../../content/VOICE.md).

Describe a passage link as a link to the selected range in the recording and transcript that are currently available. State that automated transcripts can contain errors and should be checked against the recording before quoting. Which features are available depends on server configuration.

## Visual application

Keep the selected **A / Index / original concept** identity and the original bracketed waveform geometry. Use the supplied outlined mark and lockup with self-hosted, licensed fonts.

| Role | Website treatment |
| --- | --- |
| Canvas and main text | Index green `#16201b` and warm white `#f2eee5` |
| Accent | `#b8df72` for headline emphasis, selection, highlights and focus |
| Supporting artwork | `#8d9e8a`; keep small text on a contrast-qualified color |
| Display | Space Grotesk, weight 600, large tightly spaced headings |
| Body and actions | Public Sans |
| Metadata and timecodes | JetBrains Mono |
| Archive panel | Dark green `#1c2922`, visible rules, lime top edge and an offset dark shadow |
| Focus | Visible 3px accent outline, offset 6px |

The hero sets product copy beside a working transcript excerpt. The excerpt is the evidence for the product: recording metadata, timecodes, the selected-passage style and the source actions. The mark identifies the product and is not a substitute for that evidence.

## Page structure

1. Header: lockup, “How it works”, “Your archive”, and source code.
2. Hero: product explanation, two distinct actions, relationship note and interactive transcript excerpt.
3. Signature strip: “Searchable recordings. Quotable moments. Source intact.”
4. Workflow: make recordings searchable, return to the source, and share a passage with context.
5. Your archive: client profile configuration and concrete infrastructure requirements. Explain archive name, logo, artwork and light/dark theme; API, PostgreSQL, frontend, transcription workers, storage and compute. Pair this with the HasanAra example.
6. FAQ: audience, self-hosting and the limits of passage links.
7. Closing: installation guide and a reminder that features depend on server settings.
8. Footer: code/documentation, SUBCULT and recording/trademark attribution.

Each section below the hero adds a practical detail or a destination. Do not fill a section by repeating the hero’s promise.

## Transcript evidence and interactions

The current excerpt comes from **HasanAbi September 17, 2026**, channel **HasanAbi VODs**, retrieved 2 October 2026. Three automated transcript segments cover 00:11:44.350–00:11:58.210. The product repository’s [`landing/source-example.json`](https://git.subcult.tv/subculture-collective/rekolekt/src/commit/cc43e1d6365d24663c882284e92164e38fc4f4d7/landing/source-example.json) records exact text, ranges, retrieval date and source URLs. Link the [original recording](https://www.youtube.com/watch?v=mObKJZC5L7g&t=704) and disclose that automated text may contain errors.

| State or action | Required behavior |
| --- | --- |
| Initial state | First passage selected; source action shows its timestamp. |
| Search | Highlight case-insensitive matches in the three displayed segments as the user types. Report the match count. Search is limited to this excerpt. |
| Empty query | Restore plain transcript text and the three-segment explanation. |
| No matches | Show “No matches here. Try ‘broadcasting’ or ‘people’.” Keep the passages available. |
| Select passage | Update the selected style, `aria-pressed`, timestamp status and source link. Clear previous copy feedback. Selection does not start playback. |
| Open source | Navigate to the actual recording at the selected start time. |
| Copy passage link | Copy a URL containing the selected start and end in milliseconds; confirm the selected timestamp. |
| Clipboard denied/unavailable | Expose the complete range link for manual copying. Allow long URLs to wrap. |
| Keyboard | Use native input, button, link and disclosure semantics with visible focus. Do not show an Enter shortcut unless implemented. |
| FAQ disclosure | Native `details`/`summary`, with visible open/closed indicator. |

Source-link example: `https://hasanara.tv/v/f8d3484a-dcaf-48ab-b58d-f604f6631294?t=708&t_ms=708590#moment-708590`. The corresponding copied passage link adds `end_ms=712470` before the fragment. Preserve exact segment ranges when changing the example.

## Readability and responsive layout

Body text defaults to 16px. Transcript text and source/copy actions use 14px; timecodes, search status, attribution and functional captions use 12px. Source/copy controls and navigation links have a minimum 44px height. Decorative metadata can differ, but must remain readable at the intended viewport.

The desktop canvas is capped at 1280px. Below 760px, stack the hero and lower grids, wrap header navigation, hide the decorative recording-art tile, and place each timecode above its passage. Allow action groups and metadata to wrap. Keep text and links inside the viewport at 320px and 390px widths. Respect reduced-motion preferences and retain the skip-to-content link.

## Verification and maintenance

The 2 October implementation was checked in rendered desktop and mobile browser views, including 320px and 390px widths, search matches/no matches, passage selection, keyboard activation, clipboard success and denial, and a linked range in the real HasanAra archive. JavaScript syntax, Docker build and diff checks passed. These observations apply to that revision. Recheck any changed behavior before claiming that a later revision passes.

For updates, verify the excerpt against its source and refresh its provenance together. Check font loading, overflow, focus, selected state, copy feedback and FAQ disclosure. Version CSS and JavaScript URLs by content hash and revalidate mutable landing files, so that a cached asset cannot hide a design update. Keep deployment operations in the product repository’s `landing/README.md`.

This specification is maintained by hand. The pack generator links it from `GUIDE.md`, and `asset-manifest.json` binds both documents to their current bytes. Copy in the social and video templates is a placeholder until it is replaced and reviewed for its destination.
