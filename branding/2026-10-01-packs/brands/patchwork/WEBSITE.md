# Patchwork — Website design specification

Updated 2 October 2026 from the web app at [patchwork.subcult.tv](https://patchwork.subcult.tv/), revision [`c1adb374306ae3d4d0f75cdc6fda18b002012d1c`](https://git.subcult.tv/subculture-collective/patchwork/src/commit/c1adb374306ae3d4d0f75cdc6fda18b002012d1c/apps/web). The web service has run this revision since 2 October 2026, 17:38 UTC. The audit changes first went live at 17:17 UTC as `7a5f29b`; neither release changed the API, indexer or moderation services. This document records the implemented interface and the changes from the interface originality audit, merged as [PR 119](https://git.subcult.tv/subculture-collective/patchwork/pulls/119) with a font follow-up in [PR 120](https://git.subcult.tv/subculture-collective/patchwork/pulls/120). The [brand guide](GUIDE.md) governs marks, promotional artwork and asset editing.

The product repository owns the interface rules. `docs/design-system.md` states them and `apps/web/src/styles/tokens.css` holds the values. Change the product first, then update this file and the `product_interface` block in `tokens.json` through `patchwork_product.py`.

## Product identity and copy

Patchwork is a pre-alpha mutual-aid site: requests and offers from neighbours, a map, and a directory of public resources, built on AT Protocol accounts. It is not approved to operate as a public mutual-aid service and is not an emergency service. A notice strip at the top of every page says so.

| Element | Implemented copy or destination |
| --- | --- |
| Notice strip | Pre-alpha preview. Patchwork is in testing and is not yet a public mutual-aid service. Some listings are labelled examples. |
| Tagline | Mutual aid, block by block |
| Home headline | A little help, from a friend. |
| Home explanation | Patchwork brings local requests, willing neighbors, and trusted resources into one shared place—without putting anyone's precise location on a public map. |
| Primary action | See what's nearby → the map |
| Call to action | Ask for help → the posting form, behind sign-in |
| Location promise | Public discovery uses approximate areas, never exact addresses. |
| Boundary | Patchwork is not an emergency service. |

Copy rules the site follows:

- Headings say what a person can do. Protocol and internal terms stay out of public copy: no "PDS", "DID", "AT identity", "NO-GO", "deferred" or "API sync".
- Sign-in is "Sign in with Bluesky". Account hosting is described as Subcult's community server.
- Distances are shown in miles, because the site covers US ZIP areas. Stored values stay metric. Privacy precision statements keep kilometres ("1 km precision").
- Example listings carry a text label. Public-source listings say where their information came from; they do not imply endorsement or current availability.
- English and Spanish carry the same copy.

## Visual application

The site is an editorial neighbourhood bulletin: heavy serif headlines, ink outlines, flat offset shadows and a few saturated patch colours on warm paper.

| Role | Website treatment |
| --- | --- |
| Paper | `#f2efe7` page, with a 30px grid texture; `#fffdf7` cards and inputs; `#e8e2d4` quiet fills; `#d9d1c0` panel shells and toolbars |
| Ink | `#172019` text and outlines; `#4f5a51` secondary text |
| Pine | `#12664f` primary actions, selected state and links |
| Mustard | `#f2c14e` panel title bars, emphasis, the header ring |
| Terracotta | `#e85d3f` brand mark; `#c2462b` fill for the "Ask for help" button, once per screen |
| Sage | `#9ec5ad` information badges |
| Danger | `#b93b2c` errors and destructive actions only |
| Focus | `#0b62d6` ring with a paper offset, distinct from every brand colour |
| Display | Fraunces 600–900, tracking −0.03em to −0.05em. The 900-weight home headline uses −0.04em so words stay apart. |
| Body and controls | Public Sans, 16px minimum |
| Eyebrows and metadata | JetBrains Mono, uppercase, 0.12em tracking |
| Corners | The patch corner: `2px 18px 2px 18px` on cards, `3px 12px 3px 12px` on buttons and chips, `2px 12px 2px 12px` on inputs. Pills only for badges. |
| Outline and depth | 1.5px ink outline. Flat offset shadows of 2, 4 and 7px with no blur. |
| Motion | 150ms transitions; hover lifts a button 1px; everything stops under reduced motion. |

The three typefaces ship with the app through `@fontsource-variable` packages. No page contacts a third-party font host, and the content security policy allows fonts from the site only. Font files are never inlined as data URIs, which that policy would block, and a browser test fails on any policy violation.

### Differences from the promotional pack

The pack's Neighbourhood fabric direction is for promotional artwork. The site does not use all of it.

| Item | Pack | Site |
| --- | --- | --- |
| Text and outline ink | Soft green `#365448` | `#172019` |
| Action tomato | `#b33e28` | `#c2462b` |
| Card corners | `2px 22px 2px 22px` | `2px 18px 2px 18px` |
| Shadow | Sage `#b2bba1`, 5px by 6px | Ink at 16–22% opacity, 2/4/7px |
| Stitching and fabric weave | On the mark, buttons and patches | Not used. The site's patch detail is the corner shape, the four-square patch ornament and the mustard ring. |

Paper `#f2efe7`, pine `#12664f`, tomato `#e85d3f` and the three typefaces are the same in both.

## Page structure

- **Shell.** Notice strip, then a header with the P mark, wordmark, tagline, language switch and sign-in. Desktop shows Home, Map, Feed and Resources, with Volunteer and Organizations under More. Below 1024px a Menu button opens a side sheet and a fixed tab bar carries the four main destinations. The footer links the terms, privacy and community-guideline drafts.
- **Home.** The headline, two actions and the location promise sit beside a card titled "Near" the visitor's area. The card lists up to three public places from the directory, and open requests when any exist, with a count and links to the map and directory. Below: three path cards (I need support, I can lend a hand, I run a local service), a search band, a three-step handoff list that carries the privacy facts, and the emergency boundary.
- **Map.** One page header for both tabs, with the Community resources and Neighbor requests switch as its action. Resources show a toolbar (ZIP code, keyword, Filters, Use my location), a clustered map and a nearest-first list. Requests show search, ZIP, a filter disclosure, the area map and the request list. Phones switch between Map and List.
- **Feed.** Requests with a location line, search, Latest and Nearby, and a Filters sheet.
- **Resources.** The directory. The results heading reads "All places" until an area is chosen and "Places near you" after. Each card has Details and a neutral "Ask for help here" button.
- **Volunteer and Organizations.** Titled panels for search, a sign-in panel with a button, and resource claims.
- **Sign-in gates.** Posting, My requests, Chat, Inbox, Scheduling, Notifications, Moderation, Groups and Settings keep their page title and say what signing in unlocks.
- **Not found.** Unknown addresses show "Page not found" with links to home and the map.
- **Login and sign-up.** A split layout on the paper grid. Sign-up notes that the policies are drafts under review.

## Components

`PageHeader` renders each route's only `h1`, with the mustard ring in a reserved gutter at 640px and wider. `Surface` is the one container: with a title it is the panel (panel-toned shell, mustard title bar, grid-paper sheet); `plain` is an outlined card with an inline heading; `quiet` is a card inside a panel. Buttons are pine, terracotta, neutral, danger or ghost. Chips select filters with a mustard fill; segmented controls choose one of a few with a pine fill. Banners carry info, success, warning and danger with text. Empty states have a dashed outline and a next action. Sheets hold the mobile menu and filters.

The Map, Feed and Resources toolbars share one look: panel-toned box, ink outline, patch corners, hard shadow and uppercase field labels.

Map tiles use a paper-toned flavour so the basemap recedes behind pine markers: land `#efeadd`, water `#b9d2cd`, parks `#dbe5d3`, roads `#fffdf7`, ink labels. The values live in `apps/web/src/components/map/basemap-theme.ts`.

## Interaction states

- Loading uses skeleton blocks on the home card, map, result lists and directory.
- A failed directory load shows one danger banner with Retry and no filter advice.
- Empty results use the empty state with a next action, such as Clear filters or Create request.
- Keyboard focus is always visible. A skip link leads to the main content. Touch targets are at least 44px, including footer links.
- The header ring is not drawn below 640px, where it used to overlap text.

## Audit changes, 2 October 2026

1. Home replaced the "How Patchwork works" card with the live nearby card, cut the hero to two actions, and merged the steps and privacy rows.
2. Both Map tabs moved under one page header, and the three discovery toolbars took one style.
3. Public copy lost protocol and internal terms in both languages.
4. Sign-in gates kept their page titles; unknown addresses got a not-found page; `/feedback` was removed.
5. The home headline tracking moved from −0.06em to −0.04em.
6. The directory error state became a single banner; its per-card button became neutral.
7. A pre-alpha strip replaced the green "Demonstration environment" pill.
8. Fonts moved from Google Fonts to bundled files.
9. Distances moved from kilometres to miles.
10. The basemap took the paper flavour.
11. Every `Panel`, `Card` and hand-written route header moved to `Surface` and `PageHeader`; raw colours outside the token file were replaced with tokens.
12. Follow-up: the first release inlined one small JetBrains Mono subset as a data URI, which the font policy blocked on every page. PR 120 keeps font files as files.

## Verification and limits

The product's checks passed on the merged revision: unit tests, 204 browser tests with 16 skipped, and 14 visual baselines at 390px and 1280px that now render the bundled fonts. Signed-out routes were reviewed on screen at both widths. Signed-in routes are covered by the browser tests and were not reviewed on screen. After the second release, ten signed-out routes were loaded from the live site at both widths: each showed its heading and the bundled fonts, none requested a third-party host, and none logged a console error apart from the expected anonymous session check.

The demo feed has no example requests yet, so the home card shows places only. The directory lists every area until a visitor chooses one. Terms, privacy and community guidelines are unapproved drafts.
