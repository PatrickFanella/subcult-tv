---
title: Visuals for social posts
type: research
status: active
created: 2026-10-05
review-after: 2026-12-05
---

# Visuals for social posts

Research checked 2026-10-05. Images, screenshots, cards, alt text, aspect ratios and text on images. Tags follow [engagement-psychology.md](engagement-psychology.md#evidence-tags). Production procedure and the asset library are in [Social Media Production](../Social%20Media%20Production.md) and [Social Media Library](../Social%20Media%20Library.md).

## 1. What kind of image

**Image quality helps; faces help on some platforms.** Across two Twitter datasets and one Instagram dataset (airline and SUV brand posts), high-quality, professionally shot images were linked to more engagement on both platforms; human faces and image–text fit helped on Twitter but not Instagram; colorfulness depended on category. *[research-backed, observational]* ([Li & Xie 2020, Journal of Marketing Research](https://www.jstor.org/stable/26967290))

**On Instagram in 2014, photos with faces got more likes and comments.** In one million Instagram photos, those with faces were 38% more likely to receive likes and 32% more likely to receive comments, controlling for the poster's reach and activity; the number, age and gender of faces made no difference. *[research-backed, observational, dated]* ([Bakhshi, Shamma & Gilbert 2014, CHI](https://dl.acm.org/doi/10.1145/2556288.2557403))

The two studies disagree on faces for Instagram, use different samples and are years old. A safe reading: a real person using the thing (a hand on the controller, Patrick at the desk, a door volunteer with a phone) is a good option, not a requirement.

**Polish is cheap now; real captures signal a real maker.** Instagram's head wrote on December 31, 2025 that "raw" imagery now signals authenticity because AI makes polish easy. *[platform-documented, executive opinion]* ([Engadget](https://www.engadget.com/social-media/instagram-chief-ai-is-so-ubiquitous-it-will-be-more-practical-to-fingerprint-real-media-than-fake-media-202620080.html)) Players tell glamour shots from real gameplay and prefer the latter. *[practitioner consensus]* ([Xsolla on Zukowski](https://accelerator.xsolla.com/blog/howtomarketagame))

**Generated images are labeled and can backfire.** Meta labels AI-generated images detected through C2PA/IPTC metadata and requires disclosure for realistic AI video and audio (February 2024, updated April 2025). *[platform-documented]* ([Meta](https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/)) Consumers rate AI-made emotional marketing as less authentic. *[research-backed]* ([Kirk & Givi 2025](https://www.sciencedirect.com/science/article/abs/pii/S0148296324004880)) Our rule stands: generated illustrations only for concepts, never simulated product screens, news scenes or real people.

**Choosing per post (local rule, built on the above):**

| Post is about | Use |
|---|---|
| A feature or workflow | A real capture of the product, cropped to the part that matters |
| A sequence (before/after, steps) | A short carousel (Instagram) or 2–4 images (X, Bluesky) |
| Motion (Undertow output, clpr clips) | A short clip that shows the result in the first second |
| A concept, a teaser, Common House fiction | An original illustration, labeled as such if generated |
| A short opinion or quote | Text alone; no image is better than a decorative one |
| A release or event | A card with one line of large text and the real artwork |

## 2. Screenshots

- **Crop to the relevant region and enlarge it.** A full-window desktop screenshot shrinks to unreadable at phone width. NN/g found difficult content is slower to process on phones. *[research-backed]* ([NN/g, Reading Content on Mobile](https://www.nngroup.com/articles/mobile-content/)) Text in a capture should be readable at about 360–400 px wide (local rule).
- **Use real data or clearly sample data.** A capture of HasanAra search results with real timestamps is evidence; a mockup is not. Captures with private or third-party personal data need redaction.
- **Do not post code or long text as an image.** W3C says images of text should be rare and the alt text must contain the same text. *[platform-documented, W3C guidance]* ([W3C WAI, Images of Text](https://www.w3.org/WAI/tutorials/images/textual/)) Put code in the devlog and link to it.
- **Annotations:** one arrow or outline at most, in a color that meets contrast (below). Many arrows mean the capture is the wrong crop.

## 3. Text on images and contrast

- **Meta dropped its 20% text rule for ads in September 2020 but still suggests less text.** *[platform-documented as reported]* ([Social Media Today](https://www.socialmediatoday.com/news/facebooks-removing-its-restrictions-on-text-content-in-facebook-ad-images/585705/), [Business Standard](https://www.business-standard.com/article/technology/facebook-quietly-removes-20-text-limit-on-ad-images-120101200170_1.html)) Organic posts had no such rule. Keep image text to a headline-length line; the caption carries the explanation.
- **Contrast:** WCAG 1.4.3 requires 4.5:1 for normal text and 3:1 for large text (at least 18 pt, or 14 pt bold). *[platform-documented, W3C standard]* ([W3C Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)) High-contrast text is also judged more credible in experiments. *[research-backed]* ([Reber & Schwarz 1999](https://www.semanticscholar.org/paper/Effects-of-Perceptual-Fluency-on-Judgments-of-Truth-Reber-Schwarz/5a14c99cae5603943848d43273242a4c06e9e72c)) Text over a busy photo needs a solid band or scrim.
- **Safe zones:** Meta's ad guide for Reels and Stories advises keeping roughly the top 14%, bottom 35% and 6% on each side free of text and logos because interface elements cover them. *[platform-documented as reported]* ([Solid Labs summary](https://www.solidlabs.com/social-safe-zones), [AdNabu summary](https://blog.adnabu.com/meta-ads/meta-safe-zones/)) For 9:16 masters, keep text in the middle band.
- **Captions on video:** the "85% of Facebook video is watched without sound" figure came from a few publishers' self-reports in a 2016 Digiday article, not from Facebook. *[folklore/unverified as a general figure]* ([Nieman Lab](https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/), [critique](https://st4.ca/blog/85-really-facebook-without-sound)) Burned-in or native captions are still right for accessibility and for anyone scrolling with sound off.

## 4. Aspect ratios and sizes

| Platform | What is documented (date found) | Our default |
|---|---|---|
| Instagram feed | Photos 1.91:1 to 3:4, up to 1080 px wide; other ratios are cropped ([Instagram Help](https://help.instagram.com/1631821640426723/), page did not render for quoting on 2026-10-05). Profile grid thumbnails are 3:4 since January 2025 ([Kapwing](https://www.kapwing.com/resources/instagrams-new-grid-layout-size-and-dimensions-2025/)). Buffer documents 4:5 to 1.91:1 in one guide and 3:4 in another ([earlier note](../Posting%20Best%20Practices.md)). | 4:5 (1080×1350) master; 1:1 when the same image goes everywhere. Test 3:4 in the actual channel before relying on it. Keep the subject inside a centered 3:4 area so the grid crop works. |
| Instagram carousel | Up to 20 items (August 2024) ([MacRumors](https://www.macrumors.com/2024/08/08/instagram-20-photos-carousel-posts/)) | 3–6 frames; the first must stand alone |
| Instagram Reels / Stories | 9:16; Reels up to 3 minutes (January 2025) | 9:16 with text in the safe zone |
| X | Images in standard ratios (16:9, 4:3, 2:1, 3:4) show uncropped in the timeline since May 2021 ([TechCrunch](https://techcrunch.com/2021/05/05/twitter-image-cropping-changes/)); up to four images | 16:9 or 1:1; 4:5 is cropped or letterboxed depending on client |
| Bluesky | Up to four images, 2 MB each, with an optional stored aspect ratio ([images lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json)) | 1:1 or 16:9; set the aspect ratio when posting through the API |
| Link cards | Bluesky stores card title, description and a thumbnail up to 1 MB in the post ([external lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/external.json)); X builds its own preview from the page | Every devlog page carries Open Graph title, description and a 1200×630 image (common practice; check each platform's card validator) |

Instagram's uploader keeps width up to 1080 px; larger masters are downscaled (per the same help page). Export at 1080 wide for Instagram and at least 1200 wide for X and cards. Keep originals in the library and make variants rather than recropping one master repeatedly.

## 5. Single image, carousel or video

- Buffer's 2026 data: Instagram carousels earned about 12% more engagement, Reels about 36% more reach; on X, text posts had a higher median engagement rate than video. *[practitioner consensus, observational]* ([Buffer](https://buffer.com/resources/state-of-social-media-engagement-2026/))
- Watch time and sends are the Instagram signals Mosseri names; a carousel holds attention across frames and a Reel is measured on watch time. *[platform-documented as reported]* ([Social Media Today](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/))
- For indie games, short clips that open on the strongest visual outperform full trailers in Zukowski's small sample. *[practitioner consensus, small sample]* ([How To Market A Game, 2026](https://howtomarketagame.com/2026/05/07/2026-tips-for-making-your-tweets-go-viral/))

Use a single image for one point, a carousel for a sequence, a clip when the product moves. Do not make a carousel from one idea cut into slides.

## 6. Alt text

**Describe what the image communicates, not every pixel.** W3C: an informative image's alternative "should convey the meaning or content that is displayed visually", usually briefly; images that only decorate get empty alt. *[platform-documented, W3C guidance]* ([W3C WAI, Informative Images](https://www.w3.org/WAI/tutorials/images/informative/), [alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/))

**Limits:** X 1,000 characters ([X Help](https://help.x.com/en/using-x/picture-descriptions)); Bluesky's app allows about 2,000 ([practitioner summary](https://typecount.com/blog/bluesky-character-limit)) and every image record has an `alt` field ([lexicon](https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json)); Instagram via Advanced settings, editable later ([Instagram Help](https://help.instagram.com/503708446705527)). *[platform-documented]*

**Bluesky users expect it.** Only about 20% of image posts had descriptions in a July 2025 sample, but the norm is enforced socially. *[research-backed, independent analysis]* ([Digital Seams](https://digitalseams.com/blog/image-descriptions-on-bluesky))

How to write it (W3C guidance applied to our posts):
1. Start with what kind of thing it is only when that matters ("Screenshot of Kork's editor"). Skip "image of".
2. State what the reader should take from it: the content, the result, the number on screen.
3. Include any text shown in the image, verbatim if short.
4. Do not repeat the caption; do not add claims the caption avoids.
5. No brand voice and no hashtags in alt text.
6. For a chart, give the takeaway in alt and the data in the devlog.

Example shape (not approved copy): "Kork page editor on a phone. Five links with drag handles above a tips button." Any on-screen text quoted in alt text must match the capture and the claims register.

## 7. Checklist for a reviewer

- Does the image show the real thing, or is a generated image used only for a concept and labeled where required?
- Is the important part readable at phone width, with 4.5:1 contrast for text?
- Is text in the image short, inside safe zones, and repeated in alt text?
- Is the aspect ratio right for the channel, with the subject inside the crop?
- Does every image have alt text that conveys meaning without repeating the caption?
- Are credits, licenses and source hashes recorded in the media library?
