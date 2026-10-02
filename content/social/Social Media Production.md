---
title: Social Media Production
type: work
status: active
stage: production
updated: 2026-10-02
---

# Social media production

Use a real screen capture for a product workflow, original illustration for a concept, and an edited recording when motion helps explain the interaction. The library preserves originals, derivatives, captions, hashes and review state. No new paid media service was added.

## Produced October 1

| Asset | Format | Evidence and review |
| --- | --- | --- |
| HasanAra archive home, MEDIA-899878915b7cb292 | Screenshot, 1280 × 800 PNG | Live public UI, logged out; needs editorial review |
| CLPR discovery, MEDIA-199c5eb66379bf70 | Screenshot, 1280 × 800 PNG | Live public UI; third-party thumbnail/content scope pending |
| HasanAra home to search, MEDIA-7003233f283440b5 | Original MP4 recording, 14.8 seconds | Original preserved; third-party content scope pending |
| HasanAra search to VOD, MEDIA-05051f6dac434aa8 | Original MP4 recording, 11.6 seconds | Search result opened the cited VOD interface; exact transcript/player alignment was not qualified |
| HasanAra search short, MEDIA-04c8ad3729cd9c55 | Captioned silent H.264 MP4, 1280 × 800, 8 seconds | Original capture trimmed and captioned; source/output hashes and recipe retained; editorial scope pending |
| Archive illustration, MEDIA-991fc8ba846e0e1d | 495 KB JPEG | Bluesky derivative of original MEDIA-5e7870f5bc934f2b; needs review |
| CLPR illustration, MEDIA-1d7fa4896e1067c1 | 305 KB JPEG | Bluesky derivative of original MEDIA-12c8b3fbf77f61af; needs review |

The gallery now contains nine files including the two original generated illustrations. Captures with visible third-party thumbnails, transcript text or footage have `unknown` rights and are excluded from automatic choices until editorial scope is resolved. These are interface demonstrations, not endorsements or verified political quotations. The short edit has explanatory on-screen captions and no speech/audio to transcribe. Its caption describes only the observed search interface.

## Produced October 2: Kork

| Asset | Format | Evidence and review |
| --- | --- | --- |
| Kork landing, desktop, MEDIA-7737213742695f96 | Screenshot, 1280 × 800 PNG | Live public landing at kork.subcult.tv, logged out, headless Chromium; needs editorial review |
| Kork landing, phone, MEDIA-e9e40cfc33921aef | Screenshot, 780 × 1688 PNG (390 × 844 at 2x) | Same live landing; needs editorial review |
| Kork published page, MEDIA-43cbc92b89d28839 | Screenshot, 780 × 1688 PNG | Local build of kork 22477c1 with a disposable database and placeholder handles; not a live page |
| Kork page editor, MEDIA-631300b9fc74f9ce | Screenshot, 1440 × 900 PNG | Same local build; the page address shows localhost:8099, so crop it or caption the image as a local demonstration |
| Kork share image, MEDIA-1ad9fefcdaeaa2bc | 1200 × 630 PNG | Kork pack render (`brands/kork/product/og.png`) |
| Kork launch square, landscape and story, MEDIA-513f428164d9a529, MEDIA-70425e778378e394, MEDIA-15f9dbe2ae1da260 | 1080 × 1080, 1600 × 900 and 1080 × 1920 PNG | Rendered by `kork_launch_assets.py` from the pack artwork; copy limited to C-KORK; recipe `recipes/kork-launch-assets.recipe.json` |

The local server and database used for the two placeholder captures were stopped after capture. The published-page and editor captures show third-party service icons as Kork renders them (Simple Icons, CC0; the marks belong to their owners). The launch landscape embeds the published-page capture. Its use in brand artwork needs the owner's confirmation, because the Kork guide keeps platform logos out of brand artwork. Drafts that use these assets are in [[Kork Launch Drafts]].

## Repeatable local short edits

`edit_video.py` uses installed FFmpeg to trim a source capture, remove audio, preserve the full picture in a 1280 × 800 frame, and add a concise caption. It creates an H.264 MP4 with fast-start metadata and a source/hash recipe. It refuses to overwrite the source, existing output or recipe. Input duration is capped at 60 seconds as a local production choice, not a platform limit. The original recording remains intact.

```bash
rtk proxy python3 scripts/social-posting/edit_video.py /path/to/original.mp4 /path/to/new-short.mp4 --start 0 --duration 15 --caption 'Show one useful product action.'
```

Import the result with `media.py add`, attach the recipe/provenance, review it, and rebuild the gallery. This command does not capture a browser unattended or deliver a post. T3 browser recording was used for the initial masters. Do not label a slideshow as a screen recording or generated UI as product evidence.

## Next useful captures

- HasanAra/Rekolekt: a fully checked search-to-transcript demonstration without third-party video playback; do not present unverified transcript text as a quotation.
- CLPR: discovery filters and a synthetic-account playlist flow, after the actual save/share path is verified.
- Patchwork: a labeled pre-alpha fixture demonstration; exclude real aid requests and private locations.
- Subcult OS: synthetic reservation-to-door flow, explicitly labeled development demonstration.
- Undertow: a short visual edit made from user-owned audio/art, with a freshly checked local export.
- Kork: a short editor recording on a placeholder account: add a service, pick a theme, publish. No real handles.
- Common House: occasional selected, spoiler-safe original development asset; no fabricated playable-release claim.

Produce one clear action per edit. Keep captions readable, inspect first/middle/last frames, record source version/date and review privacy before selection. Portrait edits can use a deliberate crop or stacked layout after checking that controls and context remain visible; do not automatically crop important UI. Match final codec, dimensions, size and duration to the actual authenticated destination before upload.

[[Social Media Library]] · [[Bluesky Posting Plan]] · [[Posting Best Practices]]
