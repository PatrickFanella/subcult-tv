# Left Field — Website design specification

Updated 2 October 2026 from the site at [seats.dsaslate.com](https://seats.dsaslate.com/), revision [`dbc17f65f3ad71a40a6932fd9835c6bd8706bc95`](https://git.subcult.tv/subculture-collective/left-field/src/commit/dbc17f65f3ad71a40a6932fd9835c6bd8706bc95/src/app). The app container has run this revision since 2 October 2026, 18:31 UTC. It replaced `afa0b7d`, built 9 August 2026, which served Priority Index model v0.8 for 430 House seats. The release carried 79 commits, five database migrations, and the interface originality audit merged as [PR 54](https://git.subcult.tv/subculture-collective/left-field/pulls/54). The published factual release is unchanged: `rel_full_20260804_v2`.

The product repository owns the interface rules. `src/app/globals.css` holds the values and `src/components/presentational.tsx` holds the shared shell, formatters and status labels. Change the product first, then update this file and the `product_interface` block in `tokens.json` through `left_field_product.py`.

## Product identity and copy

Left Field is a research index of seats in Congress, governorships and state legislatures. It scores each seat from public election, geography and campaign-finance records and shows the inputs behind every score. A score orders where investigation may be most useful. It is not a forecast, a poll or an endorsement, and the site does not profile voters.

| Element | Implemented copy or destination |
| --- | --- |
| Wordmark | LEFT FIELD, set in text; links to the Priority Index |
| Primary navigation | Priority index, Browse, Sources, Method |
| Index headline | Where the field bends. |
| Index lede | 430 House seats, 100 Senate seats, 50 governorships, and 5,146 state-legislative seats in 36 states, ordered by how much reason the retained evidence gives to investigate each one. A score is a research priority, not a forecast. |
| Index note | This view opens on seats scored on two or more inputs. 4,444 seats carry a single input and often tie; choose “Any evidence” under Evidence to include them. |
| Browse headline | Browse the active record |
| Sources headline | What we have, and what we do not. |
| Method headline | How the Priority Index works |
| About headline | Who publishes this |
| Release strip | FACTUAL FEDERAL RECORD · nationwide release scope, then the release label, status and source cutoff. Shown on Browse, seat records, Sources and Method. |
| Footer | LEFT FIELD · Seat research for Congress, governorships, and state legislatures · Published by SUBCULT, subcult.tv. Links: Priority index, Method, Source ledger, Corrections, About. |
| Not found | Page not found |

The counts in the lede and note come from the index data at render time; the figures above are those of model v1.14.

Copy rules the site follows:

- A missing input reads “Not in this score”. A missing fact reads “Unavailable”, followed by the reason. Neither is shown as zero.
- Seats with the same score share one rank, and the row says “Tie of” the number of seats.
- Every row and brief states how many inputs were measured.
- Counts use thousands separators. Dates read “Sep 30, 2026”.
- Party names are capitalised. An unrecorded incumbency status reads “incumbency not recorded”.
- Record identifiers such as snapshot ids stay as published and are set in the browser's monospace face.
- The model version and ranked totals on Sources and Method are read from the index, so the three pages agree.

## Visual application

The site is a printed ledger: warm paper, dark green ink, rust annotations, ruled rows and no ornament.

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

The site uses system fonts and loads no font files, analytics or third-party scripts.

### Differences from the promotional pack

| Item | Pack | Site |
| --- | --- | --- |
| Display face | Liberation Serif | Georgia |
| Body and label faces | Public Sans and JetBrains Mono | Arial; browser monospace for identifiers |
| Mark | LF monogram | Not used. The header is the text wordmark. |
| Favicon and app icons | `product/favicon.svg`, touch and app icons | The site's earlier `src/app/icon.svg` |
| Share card and hero | `product/og.*`, `product/hero.*` | Not installed; pages declare no share image |
| Extra colours | None | Muted text, rule, status and route-tag colours listed above |

Paper `#f4f0e6`, ink `#16221f`, rust `#a33c26` and wash `#e5eadc` are the same in both.

## Page structure

- **Shell.** A skip link, then the masthead with the wordmark and four navigation links. Pages that read the factual release add the release strip. The footer names the publisher.
- **Priority Index (`/`).** Headline, lede and note beside two totals: seats scored, and seats with two or more inputs. A filter form follows: search, state, chamber, next election, route and evidence. Four figures summarise the current view: seats in view, score range, seats with three or more inputs, and Republican-held seats. The list shows 50 seats per page with previous and next links.
- **Index row.** Index rank and score, with the tie size when shared. Seat label and the incumbent's name, which links to the brief. One bar per measured input. The route tag and the measured-input count. “Why it ranks here” opens the score and district explanations.
- **Brief (`/priorities/<seat>`).** Name, summary and the score seal with rank, total and tie size. Two columns give the member record and the district or state facts. Score anatomy has one column per input. Then recorded service, the formula, and links to Method, Sources and, for House and Senate seats, the factual seat record.
- **Browse (`/browse`).** Factual House and Senate records in a table of 50 with a cursor link. Filters cover chamber, state, party, election year, order and direction. The first column stays in place when the table scrolls sideways.
- **Seat record (`/seats/<seat>`).** Identity, the release-pinned district boundary drawn from published GeoJSON, the presidential margin and cash on hand with their lineage, then member, election, district, finance and source sections, and a correction link.
- **Sources (`/sources`).** Three totals, the seven House inputs with their coverage and one context card, then release coverage and the retained snapshots behind disclosure rows.
- **Method (`/methodology`).** Three principles, the weight matrix, the two routes with formulas, the component dictionary as a table, missing-data rules, chamber sections, worked examples, score bands and limits.
- **About (`/about`).** Publisher, purpose, what the site collects, and contact.
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
- At 390px the index, Browse, Sources and Method do not scroll sideways.

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

## Verification and limits

The product's checks passed on the merged revision: typecheck, lint, the fast unit lane (131 tests), the production contract, source-lock verification, the production build, and both hosted CI jobs on PR 54. After the release, six routes were loaded from the live site at 1280px: each rendered, none logged a console error, and an axe WCAG A/AA scan of each found no violations. The district map drew on a live House seat record. The production monitor passed after the switch, and a full backup was taken before it.

Known limits on the live site:

- Seat records scroll sideways at 390px because long snapshot identifiers in the source list do not wrap. The previous build did the same.
- Address lookup and correction intake are off, so their forms have not been exercised on the live site.
- The About page gives subcult.tv as the contact. It lists no email address.
- The pack's LF mark, favicon, app icons and share card are not installed.
- The repository's Caddy example still names `seats.dsaslate.us`, which does not resolve. The public address is `seats.dsaslate.com`.
