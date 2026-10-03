# HasanAra — Website design specification

Updated 2 October 2026 from the live site at [hasanara.tv](https://hasanara.tv/). The site has run this release since 2 October 2026, 09:42 UTC:

- Application: Rekolekt at [`19124a7fec867057919d8ce3aac474c7c25695cf`](https://git.subcult.tv/subculture-collective/rekolekt/src/commit/19124a7fec867057919d8ce3aac474c7c25695cf/frontend), pinned as `core`.
- Deployment: `subculture-collective/hasanara` at [`c9b09b2`](https://git.subcult.tv/subculture-collective/hasanara/src/commit/c9b09b2), which holds the brand profile and artwork.
- Frontend image: `hasanara-frontend@sha256:236cb873157aa27cdc1363a2f2d531225f722027a94b7e1206d5ad44000bf801`. The other images are unchanged from the previous release.

This document records the implemented interface. The [brand guide](GUIDE.md) governs marks, promotional artwork and asset editing.

Two repositories own the site. The Rekolekt application owns layout, components and the default stylesheet (`frontend/src/index.css`, described in its `docs/DESIGN_SYSTEM.md`). The HasanAra deployment repository owns the name, copy fields, accent colours and artwork (`branding/brand.json`, `branding/assets/`). Change those first, then update this file and the `product_interface` block in `tokens.json` through `hasanara_product.py`.

## Product identity and copy

HasanAra is a searchable archive of HasanAbi broadcasts. A visitor searches the transcripts, opens a result in the transcript at its timestamp, and shares a passage with its context. It is an independent archive operated by Subcult.

| Element | Implemented copy or destination |
| --- | --- |
| Name | HasanAra |
| Tagline, under the name in the header | Piker Broadcasting Service |
| Description, used in metadata and link previews | Search every HasanAbi broadcast, read the cited transcript, and share the exact moment. |
| Home eyebrow | HasanAbi archive · the date · searchable transcripts |
| Home headline | Find the moment. Read the record. |
| Home explanation | Search years of broadcasts by topic or exact phrase, then move from the result straight into the cited transcript and VOD. |
| Home actions | Explore the archive → · Browse every VOD · Support the archive |
| Search panel | Search the record, with example terms under "Try" |
| How it works | From broadcast to evidence: Search, Inspect, Read |
| Project notice | HasanAra is an independent archive. Broadcasts and trademarks belong to their respective owners. |
| Operator | Subcult → `https://subcult.tv` |

The name, tagline, description, notice and operator come from the brand profile. The home headline and section copy belong to the application and are shared with other Rekolekt archives.

The table records the deployed copy word for word. New copy follows the HasanAra voice in [the voice guide](../../../../content/VOICE.md).

Passage sharing is enabled. The community, clip export and AT Protocol features are disabled on this deployment. Sign-in is offered through Google and Twitch.

## Visual application

The site uses the application's Broadsheet design, which is laid out like a newspaper front page: heavy ink rules, serif headlines and square corners. HasanAra's profile replaces only the accent colours. The night edition is the primary design; the paper edition follows the visitor's system preference until they use the toggle.

| Role | Night edition | Paper edition |
| --- | --- | --- |
| Canvas | `#0f0f0f` | `#faf9f5` |
| Surface | `#161616`; muted `#1f1f1f`; raised `#262626` | `#ffffff`; muted `#f1efe8` |
| Border | `#2f2f2f`; strong `#5a5650` | `#dad6cc`; strong `#3a3a3a` |
| Ink | `#eeeae1` | `#121212` |
| Secondary text | `#b5afa3`; subtle `#968f84` | `#464646`; subtle `#5d5d5d` |
| Accent | `#ff3333`; hover `#ff6b6b`; soft fill `#3d1212` | `#cd3333`; hover `#a32424`; soft fill `#fbe3dc` |
| Text on accent | `#140303` | `#ffffff` |
| Call to action | `#ff6633` | `#cd3333` |
| Player accent | `#ff3333` | `#ff3333` |

The three colours of the PBS artwork, orange `#ff6633`, brick `#cd3333` and red `#ff3333`, form a stripe across the top of the header and under the ticker label. They also colour topic-density and chart marks. The masthead halftone uses the orange. These three are decorative and are not used for text.

| Type role | Website treatment |
| --- | --- |
| Headlines, chapter headings, transcript text | Newsreader, weights 400–800. Page titles and the home headline are 700. Episode titles and chapter headings are italic. |
| Interface text and controls | Inter Tight, 400–700 |
| Small labels | JetBrains Mono 500, 11px, uppercase, 0.12em tracking. This covers the eyebrow, meta-label and rule-title classes through the `--font-label` token. Eyebrows are accent red; the others use the subtle text colour. |
| Timecodes, counts, slugs | JetBrains Mono |

Fonts are requested from Google Fonts. The content security policy allows `fonts.googleapis.com` for the stylesheet and `fonts.gstatic.com` for the files. The request also loads Alegreya Sans for another client font option; HasanAra does not use it.

Shape and texture:

- Corners are 0 to 3px.
- Panels have no border or shadow. They carry a 3px ink rule on top, or 2px on feed and discovery cards. The site header ends in a 3px double rule.
- A fixed noise layer adds newsprint grain behind the content. Mastheads carry a halftone dot pattern that fades in from one side.
- Keyboard focus is a 2px accent outline with a 2px offset.
- Panel rules draw across on arrival and chart bars rise. Content does not fade or slide in. Reduced-motion settings stop all animation, including the ticker.

### Differences from the promotional pack

The pack's Broadcast archive direction was built from the live theme, so base, text, accent and secondary colours and the three typefaces match. These items differ.

| Item | Pack | Site |
| --- | --- | --- |
| Headline | Find the passage. Keep the context. | Find the moment. Read the record. |
| Label copy | BROADCAST ARCHIVE and PIKER BROADCASTING SERVICE in mono capitals | "Piker Broadcasting Service" under the name in Inter Tight; "HasanAbi archive" as the home eyebrow in mono capitals |
| Editions | Dark only | Night and paper editions |
| Colours | Base, text, accent, secondary | Adds brick `#cd3333`, surface, border and secondary text roles, and a darker accent for the paper edition |
| Fonts | Bundled static regular and bold files | Hosted variable files with italics and intermediate weights |
| Mark | PBS artwork on a transparent ground | The same artwork on a black rounded rectangle, in the header and the home masthead |
| Link preview | Banner and landscape layouts with a mono label and red rule | The broadcast badge beside the name and two lines of copy |

## Assets

The deployment repository mounts `branding/assets/` at `/branding` on the site.

| File | Use |
| --- | --- |
| `logo.svg` | PBS wordmark on a black rounded rectangle. Header and home masthead. |
| `favicon.svg` | The same artwork on a square. |
| `badge.svg` | The television-shaped Piker Broadcasting Service badge. Used inside the social card. |
| `social-card.svg` | 1200×630 link preview: the tri-colour stripe, the badge, "HasanAra" in Newsreader Bold, "Every broadcast, searchable." in orange Inter Tight Bold and "Read the transcript. Cite the moment." in muted Inter Tight. |

The frontend converts `social-card.svg` to `/social-preview.png` when it starts. Its image has only DejaVu fonts installed, so the text in the served file is converted to outlines. The editable version with live text is `branding/social-card.source.svg`, outside the public mount. Export it with this pack's `fonts/` directory as the only font source; the deployment repository's `DEVELOPMENT.md` has the command. Restart the frontend after replacing the file.

## Page structure

- **Shell.** The tri-colour stripe, then a header with the logo, name, tagline, a transcript search field, navigation, the edition toggle and sign-in. Navigation lists Home, Search, Explore, Timeline, VODs, Saved and Support. The footer has the copyright line with the operator link, then About, Privacy, Terms and Support in mono capitals.
- **The Wire.** A ticker under the header scrolls archive topics with their mention counts for the last 90 days, then popular searches. It pauses on hover or focus and is hidden below 40rem.
- **Home.** A masthead with the eyebrow, headline, explanation and three text actions beside the logo and the search panel. A four-cell data strip follows: searchable VODs, recorded runtime, transcript words and the index refresh date. Below: a sign-in prompt, recently indexed VODs, popular searches, the newest transcript, and the three-step explanation.
- **Search, Explore, Timeline, VODs.** Result and browse pages built from the same ruled panels, eyebrows and mono metadata.
- **Episode.** On wide screens the player, timeline strip and navigator (Chapters, Topics, Moments, Related) sit in a rail beside the transcript. Below 64rem the player docks at the top and a sheet holds Transcript, Chapters, Topics and Info. Selecting a sentence opens passage actions: play from here, copy quote, copy link, save and share.
- **Saved, Support, About, Privacy, Terms.** Account and information pages in the same shell.

## Verification and limits

Checked on the live site after the 2 October release:

- Running image digests matched the deployment's `release-images.json`.
- The home page and `/api/health` returned 200.
- The eyebrow and meta labels computed to JetBrains Mono at weight 500, and the font was loaded.
- `/social-preview.png` rendered in Newsreader and Inter Tight.

Limits of that check:

- Only the home page was reviewed on screen, at desktop width in the night edition. The paper edition, other routes and phone widths were not reviewed for this release.
- The application's frontend lint, format check, tests and production build passed in an isolated local environment. Its hosted verification stopped at a dependency audit failure that predates this release, so the hosted browser tests did not run.
- Text contrast was not measured for this document. The application's design system requires 4.5:1 for text tokens on every surface where they are used.
- Search answered in 27 to 41 seconds on three requests after the release restart. This is a known backend problem and not part of the interface.
