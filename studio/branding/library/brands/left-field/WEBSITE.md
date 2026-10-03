# Left Field — Website design specification

Updated 2 October 2026 from the site at [left-field.subcult.tv](https://left-field.subcult.tv/), revision [`5f41c5fd5cc5441ded34f8efe3a1fab6ce2c9707`](https://git.subcult.tv/subculture-collective/left-field/src/commit/5f41c5fd5cc5441ded34f8efe3a1fab6ce2c9707/src/app). The app container has run this revision since 2 October 2026, 23:05 UTC. Three releases went out that day. The first, `dbc17f6` at 18:31 UTC, replaced `afa0b7d`, built 9 August 2026, which served Priority Index model v0.8 for 430 House seats; it carried 79 commits, five database migrations, and the interface originality audit merged as [PR 54](https://git.subcult.tv/subculture-collective/left-field/pulls/54). The second, `1b071f2` at 21:23 UTC, installed the pack assets and rebuilt the About page ([PR 55](https://git.subcult.tv/subculture-collective/left-field/pulls/55)). The third added the contact address ([PR 56](https://git.subcult.tv/subculture-collective/left-field/pulls/56)) and moved the public address to `left-field.subcult.tv` ([PR 57](https://git.subcult.tv/subculture-collective/left-field/pulls/57)); `seats.dsaslate.com` now redirects there. The published factual release is unchanged: `rel_full_20260804_v2`.

The product repository owns the interface rules. `src/app/globals.css` holds the values and `src/components/presentational.tsx` holds the shared shell, formatters and status labels. Change the product first, then update this file and the `product_interface` block in `tokens.json` through `left_field_product.py`.

## Product identity and copy

Left Field is a research index of seats in Congress, governorships and state legislatures. It scores each seat from public election, geography and campaign-finance records and shows the inputs behind every score. A score orders where investigation may be most useful. It is not a forecast, a poll or an endorsement, and the site does not profile voters.

| Element | Implemented copy or destination |
| --- | --- |
| Wordmark | The LF mark, then LEFT FIELD set in text; links to the Priority Index |
| Primary navigation | Priority index, Browse, Sources, Method |
| Index headline | Where the field bends. |
| Index lede | 430 House seats, 100 Senate seats, 50 governorships, and 5,146 state-legislative seats in 36 states, ordered by how much reason the retained evidence gives to investigate each one. A score is a research priority, not a forecast. |
| Index note | This view opens on seats scored on two or more inputs. 4,444 seats carry a single input and often tie; choose “Any evidence” under Evidence to include them. |
| Browse headline | Browse the active record |
| Sources headline | What we have, and what we do not. |
| Method headline | How the Priority Index works |
| About headline | Who publishes this |
| About banner | The pack share artwork: Read the field. Trace the evidence. |
| Release strip | FACTUAL FEDERAL RECORD · nationwide release scope, then the release label, status and source cutoff. Shown on Browse, seat records, Sources and Method. |
| Footer | LEFT FIELD · Seat research for Congress, governorships, and state legislatures · Published by SUBCULT, subcult.tv. Links: Priority index, Method, Source ledger, Corrections, About. |
| Contact | info@subcult.tv as a mail link, and subcult.tv |
| Not found | Page not found |

The counts in the lede and note come from the index data at render time; the figures above are those of model v1.14.

The table records the deployed copy word for word. New copy follows the Left Field voice in [the voice guide](../../../../content/VOICE.md).

Copy rules the site follows:

- A missing input reads “Not in this score”. A missing fact reads “Unavailable”, followed by the reason. Neither is shown as zero.
- Seats with the same score share one rank, and the row says “Tie of” the number of seats.
- Every row and brief states how many inputs were measured.
- Counts use thousands separators. Dates read “Sep 30, 2026”.
- Party names are capitalised. An unrecorded incumbency status reads “incumbency not recorded”.
- Record identifiers such as snapshot ids stay as published and are set in the browser's monospace face.
- The model version and ranked totals on Sources and Method are read from the index, so the three pages agree.

## Visual application

The site looks like a printed ledger: warm paper, dark green ink, rust annotations, ruled rows and no ornament.

| Role | Website treatment |
| --- | --- |
| Paper | `#f4f0e6` page; `#faf8f1` inputs; `#e9e4d8` notices; `#f8f5ed` ledger panels |
| Ink | `#16221f` text, heavy rules, buttons and the list header |
| Rust | `#a33c26` eyebrows, score bars, link underlines, the focus outline and button hover |
| Wash | `#e5eadc` release strip, expanded explanations and the map field |
| Muted text | `#5c6862`, at least 4.58:1 on every surface it sits on |
| Rule | `#aeb4a5` row dividers; `#c8c7bb` empty bar track |
| Status labels | Outlined text: published and certified `#245e46`, unavailable `#754f13`, reported or unfinalised `#8a4126`, modelled or estimated `#6a4a86` |
| Route tags | AIPAC-supported blue: paper on ink. Deep blue: ink on wash. Republican-held flip: `#742d1e` on `#ead8cf`. Democratic incumbent: ink outline. |
| Reading face | Georgia, with Times New Roman as fallback, for headlines and body text |
| Labels and controls | Arial, bold, uppercase with 0.04–0.08em tracking for eyebrows, navigation, table headings and buttons |
| Headlines | Tight tracking (−0.045em) and line height below 1. The index headline scales from 3.2rem to 7.5rem. |
| Corners | Square everywhere. The score seal on a brief is the one circle. |
| Rules | 3px ink under the masthead and at section ends; 4px under a hero; 1px rule colour between rows |
| Depth and motion | None. No shadows, gradients or animation. |
| Width | 1320px, 1440px on the index. Layout changes at 1000px, 800px and 700px. |

The site uses system fonts and loads no font files or third-party scripts. The edge (Almaz Caddy through `umami-site-proxy`) injects `/umami-init.js`, a self-hosted Umami page-view counter served from the site's own domain; the About page says so.

### Pack assets on the site

The site carries these pack files unchanged. `docs/brand/site-assets.json` in the product repository records each file's source path and hash and the Studio revision they came from. Replace them from Studio; do not edit them in the product.

| Pack file | Site use |
| --- | --- |
| `product/favicon.svg` | `src/app/icon.svg`, the browser icon |
| `product/apple-touch-icon.png` | `src/app/apple-icon.png` |
| `product/icon-192.png`, `product/icon-512.png` | `public/icons/`, listed in the web manifest |
| `product/og.png` | `src/app/opengraph-image.png` and `twitter-image.png`, the share card on every page, with alt text |
| `product/hero-outlined.svg` | `public/brand/left-field-hero.svg`, the About banner |
| `logos/mark-primary.svg` | Redrawn inline in the masthead and on About, with the page's ink and rust, so it needs no extra request |

### Differences from the promotional pack

| Item | Pack | Site |
| --- | --- | --- |
| Display face | Liberation Serif | Georgia |
| Body and label faces | Public Sans and JetBrains Mono | Arial; browser monospace for identifiers |
| Fonts | Bundled font files | None loaded. Pack type appears only inside the share card and the About banner, as outlines or pixels. |
| Extra colours | None | Muted text, rule, status and route-tag colours listed above |

Paper `#f4f0e6`, ink `#16221f`, rust `#a33c26` and wash `#e5eadc` are the same in both.

## Page structure

- **Shell.** A skip link, then the masthead with the LF mark, the wordmark and four navigation links. Pages that read the factual release add the release strip. The footer names the publisher.
- **Priority Index (`/`).** Headline, lede and note beside two totals: seats scored, and seats with two or more inputs. A filter form follows: search, state, chamber, next election, route and evidence. Four figures summarise the current view: seats in view, score range, seats with three or more inputs, and Republican-held seats. The list shows 50 seats per page with previous and next links.
- **Index row.** Index rank and score, with the tie size when shared. Seat label and the incumbent's name, which links to the brief. One bar per measured input. The route tag and the measured-input count. “Why it ranks here” opens the score and district explanations.
- **Brief (`/priorities/<seat>`).** Name, summary and the score seal with rank, total and tie size. Two columns give the member record and the district or state facts. Score anatomy has one column per input. Then recorded service, the formula, and links to Method, Sources and, for House and Senate seats, the factual seat record.
- **Browse (`/browse`).** Factual House and Senate records in a table of 50 with a cursor link. Filters cover chamber, state, party, election year, order and direction. The first column stays in place when the table scrolls sideways.
- **Seat record (`/seats/<seat>`).** Identity, the release-pinned district boundary drawn from published GeoJSON, the presidential margin and cash on hand with their lineage, then member, election, district, finance and source sections, and a correction link.
- **Sources (`/sources`).** Three totals, the seven House inputs with their coverage and one context card, then release coverage and the retained snapshots behind disclosure rows.
- **Method (`/methodology`).** Three principles, the weight matrix, the two routes with formulas, the component dictionary as a table, missing-data rules, chamber sections, worked examples, score bands and limits.
- **About (`/about`).** The banner, the publisher statement, and three current figures: index model, publication date and seats scored. Then what the index is, how to read a score, what the site collects (including the page-view counter), a note on the mark, and contact with the mail address.
- **Lookup and Corrections.** Both are off in this deployment. Each page says so and shows no form.
- **Not found.** Unknown addresses return 404 with links to the index and Browse.

## Components

The shell, release strip, status label, lineage line, notice and route-state page live in `presentational.tsx`. Buttons are ink with paper text and turn rust on hover. Inputs and selects are square with an ink outline. Tables sit in a scroll region that takes keyboard focus and has a caption. Score bars are 5px rust fills on a grey track. Disclosure rows on the index, Sources and Method use native `details` with a visible control. `src/lib/priority-index-view.ts` holds the tie ranking, the measured-input count, the default evidence threshold and paging.

## Interaction states

- The index never renders the full list. Each response holds one page of 50.
- A filter that matches nothing shows “No seats match these filters.” When only the evidence threshold hid the matches, it says how many and links to include them.
- Loading shows “Loading the record”. A failed load shows “Record unavailable” with Try again.
- A seat missing from the release shows “Seat not in this release”. An invalid filter shows “Request not available”.
- The boundary map says when a boundary is loading, missing or unavailable.
- Keyboard focus is a 3px rust outline on links, buttons, fields and disclosure controls.
- At 390px no page scrolls sideways. Long snapshot identifiers on a seat record wrap.

## Audit changes, 2 October 2026

1. Tied scores share a rank. Before, 1,298 one-input state-legislative seats were numbered 1 to 1,298 in alphabetical order.
2. The index opens on seats with two or more measured inputs and pages 50 at a time. The single-page view of all 5,726 seats, 33 MB of HTML, was removed.
3. A missing input no longer draws the same empty bar as a measured zero.
4. The incumbent's name became the link to the brief, and the expand control became visible.
5. Sources and Method take totals and the model version from the index. Method no longer says state-legislative seats are unranked.
6. Every page got its own title, and unknown addresses got a not-found page.
7. Muted text moved from `#64706a` to `#5c6862` to pass 4.5:1 on wash and hover surfaces.
8. The Method component dictionary became a table and the three principles a ruled list.
9. A skip link, a consistent focus outline, a pinned first column in Browse and fixes for overflow at 390px were added.
10. The footer names SUBCULT, and the About page was added.

## Asset release, 2 October 2026

1. The LF favicon and touch icon replaced the earlier app icon, and a web manifest lists the 192px and 512px icons.
2. Every page declares the pack share card, with alt text, for Open Graph and Twitter previews.
3. The LF mark joined the wordmark in the masthead.
4. About gained the banner, the current index figures, a guide to reading a score and a note on the mark.
5. Snapshot identifiers in a seat record's source list wrap, which removed the sideways scroll at 390px.
6. The pack's `favicon.svg`, `og.svg` and `hero.svg` were re-serialized without an `ns0:` prefix, which Next rejected as an app icon. Geometry and rendered output are unchanged.

## Address and contact release, 2 October 2026

1. The public address became `left-field.subcult.tv`. Almaz Caddy serves it through the same analytics proxy and origin as before and answers `seats.dsaslate.com` with a permanent redirect. The app's `metadataBase`, the Caddy examples and the monitor defaults follow.
2. The About page lists `info@subcult.tv` and describes the self-hosted page-view counter instead of claiming the pages load no analytics.
3. The flaky focus assertion in the lookup-form test now waits for the effect that moves focus.

## Verification and limits

The product's checks passed on each merged revision: typecheck, lint, the fast unit lane (131 tests), the production contract, source-lock verification, the production build, and both hosted CI jobs on PRs 54 to 57. On PR 55 the static job failed once on a focus-timing test of the lookup form, which the change does not touch, and passed when rerun. After the third release, five routes were loaded from the live site at 1280px and 390px: each rendered with the mark in the masthead, none scrolled sideways, none logged a console error, and an axe WCAG A/AA scan of each found no violations. The icon, touch icon, share card, manifest, manifest icon and banner each returned 200, and the share-card tags carry the public address and alt text. The district map drew on a live House seat record. The production monitor passed after each switch, and a full backup was taken before the first. The new hostname returned 200 on five routes with the counter injected, the old hostname redirected, and the production monitor passed with its public and Caddy probes pointed at the new host.

Known limits on the live site:

- Address lookup and correction intake are off, so their forms have not been exercised on the live site.
- Links published before 2 October 2026 point at `seats.dsaslate.com` and reach the site through a redirect; the share-card URLs in those pages were absolute and also redirect.
