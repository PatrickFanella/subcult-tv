# Product landings: brand audit, October 13, 2026

Audit mode. Nothing was changed except this folder. Part one covers the eight products with `featured: true` in `content/projects.json` (clpr, Patchwork, HasanAra, Undertow, Kork, Tadooer, Chatty Cat, Arkhiv): their landing pages at `/products/<slug>`, their blocks on the home page, their share images and their Studio packs. Part two, at the end, covers the other fifteen products with the same method.

## How it was inspected

- Source: worktree `t3/1a7ab3ff` at `67e88f8` (clean). Landing copy in `src/lib/product-landings.ts` and `src/lib/showcase.ts`; themes in `src/styles/product-landings.css`; served fonts in `src/styles/product-fonts.css`; marks in `src/lib/product-marks.ts`; catalog in `content/projects.json`.
- Baseline: each pack's `GUIDE.md` and `tokens.json` under `studio/brands/`, the `WEBSITE.md` files for Patchwork, HasanAra and Chatty Cat, `studio/content/VOICE.md` and the claims register.
- Rendered: Vite dev server on loopback (no API, so pages used the curated catalog) in the T3 collaborative browser, each landing at 1280×800 and 390×844, the home page at 1280×800. Computed fonts, colours and WCAG contrast ratios were read from the page; `document.fonts` was listed to separate fonts the site serves from fonts installed on this machine. Screenshots in this folder are from those sessions.
- Not inspected: the deployed site, the product sites themselves, hover states, keyboard traversal beyond reading the focus rule, and the social or video layouts in each pack.

## Findings, by impact

### 1. Tadooer renders in the site's default theme, not its pack (defect, high)

`product-landings.css` has no `[data-product='tadooer']` block and never has (checked with `git log -S`). The page therefore uses the generic fallback: canvas `#16201b`, Arial for every heading and paragraph, lime `#b8df72` buttons and a lime focus ring. The pack, which the owner approved on October 10, specifies Catppuccin base `#1e1e2e`, text `#e2e6f6`, purple `#bd93f9` as the one action colour (6.8:1 on base), Inter for headlines and body and Atkinson Hyperlegible Mono for labels. Neither font is served by `product-fonts.css`; the pack carries both with licences in `studio/brands/tadooer/fonts/`.

The share image `public/og/tadooer.jpg` is a capture of this unthemed hero (plain screenshot, no mark, no colour), while the pack has an owner-approved `product/og.png` at 1200×630 that `studio/scripts/export_site_brands.py` does not select.

Evidence: `tadooer-desktop-1280.png`; computed `h1` font-family Arial, `--lp-focus` `#b8df72`.
Fix (subcult-tv): add the Tadooer theme and `@font-face` rules from the pack tokens; add `tadooer` to the export selection so the pack OG and fonts are copied with provenance; recapture nothing, since the pack OG replaces the capture.

### 2. Kork's body font is not served (defect, medium)

The Kork theme asks for Atkinson Hyperlegible Next, as the pack does, but no `@font-face` exists for it, so visitors read the summary, features and FAQ in `system-ui`. It looked right in this session only because the font is installed on Kvant. The pack ships `AtkinsonHyperlegibleNext-Regular.otf`, `-Bold.otf` and the OFL.

Evidence: `document.fonts` lists no Atkinson family; `kork-desktop-1280.png` is therefore not what a visitor sees.
Fix (subcult-tv): serve the two OTFs from `public/brand/fonts/` with their licence and declare them in `product-fonts.css`.

### 3. Arkhiv's red fails as a button fill and as a small number (defect, medium)

- Landing primary button: paper `#f3efe4` text on accent `#d8262c` at 14px/600 measures 4.32:1 (needs 4.5:1).
- Home page: the "08" product number in `#d8262c` on `#0a0a0a` at 12px measures 3.99:1.

The pack rates the accent at 4.32:1 for "the lit element and emphasis", a 3:1 role; it is not rated for text. The theme already defines `--lp-accent-text: #b31f24`, which gives 5.82:1 under paper text.

Fix (subcult-tv): fill Arkhiv buttons with `#b31f24` (or set `--lp-accent` to it for interactive fills) and give the home block a lighter number colour, as `#left-field` already does in `index.css`. Arkhiv's identity is still marked proposed and unreviewed by the owner (see specification gaps), so any colour change should go through the pack.

### 4. Four featured products have no mark on their pages (inconsistency, medium)

Kork, Tadooer, Chatty Cat and Arkhiv show their mark beside the name on the landing and in the home index. clpr, Patchwork, HasanAra and Undertow show the name alone, and the index draws a coloured square for them. Each of the four has `logos/mark-primary.svg` in its pack, and clpr's guide records that clpr.tv already uses the play mark. `public/brand/kork-mark.svg` and `rekolekt-mark.svg` also sit outside `docs/site-brand-provenance.json`, so `scripts/check-public-assets.py` does not cover them.

Fix (subcult-tv, owner choice on HasanAra's PBS artwork): extend `export_site_brands.py` to the four packs and `product-marks.ts` to the four slugs, and record Kork and Rekolekt marks in the provenance file.

### 5. Phone layout: three navigation strips before the product (usability, medium)

At 390px the site header, the featured bar and the 23-link "All products" nav stack to about 450px before the hero begins; the product nav alone is 307 to 321px tall and repeats on every landing. No element overflows, but the first screen of every product page is navigation.

Evidence: `kork-phone-390.png`; hero top 461px on clpr, 447px on Tadooer.
Fix (subcult-tv): collapse the product nav to a single "All products" link or a `<select>` below the `md` breakpoint.

### 6. Patchwork labels fall back to the browser monospace (defect, low)

The Patchwork theme sets no `--lp-mono`, so eyebrows and feature numbers render in `ui-monospace`. Both the pack and `WEBSITE.md` specify JetBrains Mono, which the site already serves for Backline (`product-fonts.css`).

Fix: add `--lp-mono: 'JetBrains Mono', monospace;` to the Patchwork block.

### 7. Chatty Cat: only the bold Cascadia Mono is served (defect, low)

`product-fonts.css` declares Cascadia Mono at 700 only. The eyebrow (400) and the headline and feature titles (600) resolve to the bold face, so the 11px eyebrow renders bold. The pack carries `CascadiaMono-Regular.ttf`. Separately, the `h1` lowercases the name to "chatty cat", which is neither the prose form (Chatty Cat) nor the wordmark (`chatty_cat`) the guide allows; an owner call.

### 8. Copy claims to check before they stay (claims, medium for Undertow)

- Undertow: "H.264 MP4, 720p to 4K", "export several formats in one go", "render a 15-second preview first", "word-by-word timing works for karaoke", and "looping video and particles" layers are not in register entry C-UNDERTOW, which supports layers, six templates, three layouts, lyrics and local MP4 export. The register also warns against guaranteed 4K rendering. Verify against the Undertow source or trim.
- Tadooer: the register has no Tadooer entry, yet the landing states Google Calendar sync, offline task queueing, Super Productivity import, focus takeover between devices and an Android shell. The pack's October 10 approval covers the pack's artwork and copy, not these page claims. Add a C-TADOOER entry from the product README before the next copy change.
- clpr: "See what's trending" is not in C-CLPR (creator, topic, tag, playlists, sharing). The screenshot shows Feed, Discover and Saved; "trending" was not observed.
- Arkhiv: the page says 699 documents, and the screenshot beside it shows "6707 items". The register already notes the mismatch; the live catalogue count needs a recheck.
- Kork: the FAQ mentions custom domains and a planned Pro plan to deny them. The register permits denial; the voice guide says leave both subjects out. Owner call.

### 9. Small deviations from pack values (low)

- HasanAra: landing accent is `#ff5b52` (the catalog cover colour) where the pack and hasanara.tv use `#ff3333`; both pass contrast (6.27:1 and 5.27:1).
- Undertow: the chromatic offset is applied to 23px feature titles; the guide limits it to large titles. Body copy uses `system-ui` while the pack lists Public Sans; the pack itself says the site uses a system stack, so this is a pack-versus-product gap rather than a page error.
- Spelling differs by product (Patchwork "neighbors", Chatty Cat "colour", Arkhiv "catalogue"). The voice guide allows each surface its spelling; noted only.

## Specification gaps

- Arkhiv's pack is a generated, proposed identity the owner has not reviewed (`GUIDE.md`, `brands/README.md`). The landing applies it as if selected.
- No claims register entry exists for Tadooer (see finding 8).
- Undertow's pack lists Liberation Mono and Public Sans; the product and the landing use system stacks. Decide which is canonical and record it.

## What matched

- clpr: canvas `#0e0c13`, text `#eeedf7`, accent `#8c5cff`, Barlow Condensed 700 uppercase headings, Barlow body and IBM Plex Mono labels all served and rendered; the name is lowercase as the guide requires; no clip-stack graphic appears inside the interface.
- Patchwork: paper `#f2efe7`, ink `#172019`, pine `#12664f`, the `2px 18px` card corner, the `3px 12px` button corner and flat ink shadows follow the product interface tokens; the darker ink is the documented site difference. Fraunces and Public Sans are served.
- HasanAra: canvas, text, Newsreader and Inter Tight match the night edition; 3px rules on sections follow the product's panel rule.
- Kork: cork, ink, paper and cobalt are exact; Archivo Black is served; cards tilt within ±7° with one straight; one pin pun and one exclamation mark on the page.
- Chatty Cat: the phosphor palette (`#0b0f0c`, `#cfeedd`, `#7dff9a`, `#e8a33d` focus) is exact; the mark renders pixelated; copy says "in migration" and does not claim sending or moderation.
- Arkhiv: canvas, text, Newsreader, Public Sans and IBM Plex Mono match the pack; the rights position and provisional titles are stated.
- All eight: body and muted text at or above 6:1 on their canvases; a 3px per-product focus ring on links and summaries; no horizontal overflow at 390px; titles under 60 characters and descriptions under 160; 1200×630 share images present.

## Files

| File | What it shows |
| --- | --- |
| `tadooer-desktop-1280.png` | Finding 1: Arial and lime on dark green |
| `kork-desktop-1280.png` | Kork as rendered with the font installed locally (finding 2) |
| `kork-phone-390.png` | Finding 5: navigation before the hero |
| `arkhiv-desktop-1280.png` | Finding 3 button and finding 8 item count |
| `home-desktop-1280.png` | Home hero and featured bar |

## Part two: the other fifteen products

Same method and the same session: Rekolekt, Subcult OS, Prichal, Left Field, Subsets, Backline, Overlaid, Pirs, tmux-popups, Omarchy Multi-Monitor Bar, Super Productivity for Omarchy, Spool, Shelfish, Metronome + Tuner and super-productivity-mcp, each at 1280×800 and 390×844. Baselines were each pack's `GUIDE.md` and `tokens.json` and the October 12 claims register entries. Ten of these packs are generated, proposed identities the owner has not reviewed; the landings apply them as if selected.

### Findings, by impact

**11. Rekolekt renders in Arial (defect, medium).** The only Rekolekt rule in `product-landings.css` lowercases the name. Everything else comes from the `.product-landing` fallback, whose colours are Rekolekt's own (`#16201b`, `#f2eee5`, `#b8df72`) but whose fonts are Arial and `ui-monospace`. The pack asks for Space Grotesk headlines, Public Sans body and JetBrains Mono labels; all three are already served for Backline, so the fix is a three-line theme block. This also explains part one, finding 1: the site fallback is Rekolekt's palette, so any product without a theme looks like Rekolekt. Evidence: `rekolekt-desktop-1280.png`.

**12. Two primary buttons fail text contrast (defect, medium).**

| Page | Button | Measured | Passing alternative from the same theme |
| --- | --- | --- | --- |
| Spool | paper `#f1ecff` on violet `#8a5cff`, 14px/600 | 3.60:1 | ink `#120f1c` on the violet, 4.55:1; or ink on the lime `#b9ff3b`, 15.69:1 |
| Metronome + Tuner | paper `#fffdf9` on pink `#e04e7a`, 14px/600 | 3.73:1 | paper on `--lp-accent-text` `#b82e5a`, 5.78:1 |

Both packs rate the accent for emphasis at 3:1, not for text. Evidence: `spool-desktop-1280.png`, `metronome-tuner-desktop-1280.png`.

**13. Subcult OS and Prichal show no mark (inconsistency, medium).** Both packs have selected marks (the OS lettermark with cyan cursor in `subcult-os/product/`, the docking node in `prichal/logos/`) and both product sites use them, but `product-marks.ts` lists neither, so the landing shows the name alone and the home index a coloured square. This extends part one, finding 4, to six products in total: clpr, Patchwork, HasanAra, Undertow, Subcult OS and Prichal.

**14. Left Field's figure is captioned "concept illustration" (defect, low).** The figure is the pack's brand hero (`/brand/left-field/hero.svg`, "Where the field bends."), but `left-field` is not in `BRAND_HEROES`, so the caption falls through to "Left Field / concept illustration". Overlaid, Pirs and super-productivity-mcp, which use the same kind of hero, are captioned "brand mark" correctly.

**15. Claims to check (low).**

- Backline: "an audio module with approved SomaFM stations" is not in C-BACKLINE-01, which lists audio only as a module group. "Release candidate" and "two SUBCULT servers" are supported.
- Pirs: the page title "An extensible AT Protocol server" overstates C-PIRS-02 ("not production software and no plugin runs yet"); the page body is accurate.
- Prichal and Left Field have no register entries at all (the register says so). Prichal's "use a domain you own as your handle" and "accounts can move to another host" and Left Field's component scores and source ledger are unverified by the register.
- Rekolekt's FAQ names the `subculture-collective/rekolekt` repository; the register's source record still names `transcript-create`. The pack guide says the source moved; the register needs the same update.

**16. Small deviations (low).**

- Left Field's `h1` is Public Sans 700 uppercase where the pack sets the wordmark as LEFT FIELD and display type as Liberation Serif; the pack's `WEBSITE.md` says the product site uses system fonts, so this may be the intended site treatment. Record the decision.
- Prichal's eyebrow and muted text use `#4f5866` where the pack's label steel is `#5d6675`; both pass (6.37:1).
- Long names reduce the `h1` size (tmux-popups 57.6px, super-productivity-mcp 51.2px; 32px at phone width). The pattern holds, but "Omarchy Multi-Monitor Bar" wraps to three lines beside its mark at 1280px.

### What matched

- Subcult OS: black canvas, white text, purple `#7c3aed` fills with white text (5.70:1), cyan `#00ffff` labels and focus, Oswald capitals for the headline, Space Mono for the wordmark, body, labels and buttons, 8px corners, the tilted admit-one stub with "01 / PLAN" cues. This is the closest match of the twenty-three.
- Prichal: paper, ink, signal red `#b23a26` for the rule and numbers, Oswald Bold uppercase wordmark, Public Sans body, JetBrains Mono labels and buttons; "dock" and "port" are the only docking words; the approved tagline and call to action appear verbatim; no pronunciation note.
- Subsets: silver, charcoal, mint and the served Subsets Display and Subsets Mono match the approved identity; the figure is the actual TUI render the pack supplies, captioned as such.
- Backline: paper, ink, the green `#00ff88` action with ink text (14.45:1), muted violet numbers, Backline Display, Body and Mono all served; the private-pilot limits are stated in three places.
- Overlaid, Pirs, tmux-popups, Omarchy Multi-Monitor Bar, Super Productivity for Omarchy, Shelfish, super-productivity-mcp: canvas, text, accent and secondary colours and all three fonts match their generated packs; every text pair measured at or above 6.5:1 apart from the two buttons above; each page carries its mark and the proposed packs' marks render cleanly at 56px.
- All fifteen: no horizontal overflow at 390px; the per-product focus colour is set; titles fit 60 characters; install commands are quoted as the READMEs give them; maturity limits (experiment, in development, private pilot, private preview, marketplace pending) appear in the hero or steps of every page that needs one.

### Additional files

| File | What it shows |
| --- | --- |
| `rekolekt-desktop-1280.png` | Finding 11: Arial on the Rekolekt palette |
| `spool-desktop-1280.png` | Finding 12: paper on violet button |
| `metronome-tuner-desktop-1280.png` | Finding 12: paper on pink button |

## Fixes applied, October 13, 2026

Every finding above was repaired in the same worktree, then re-rendered in the same browser session. Checks: lint, typecheck, Vitest (164 tests), catalog check, public-asset provenance and Studio checks passed after the changes; `make check` output is in the session record.

| Finding | Change | Verified after |
| --- | --- | --- |
| 1, 11 | Tadooer and Rekolekt theme blocks in `product-landings.css`; Inter and Atkinson Hyperlegible Mono served from the Tadooer pack; Rekolekt uses the served Space Grotesk, Public Sans and JetBrains Mono | Tadooer canvas `#1e1e2e`, Inter and Atkinson Hyperlegible Mono loaded, button 7.77:1; Rekolekt headings Space Grotesk, labels JetBrains Mono (`*-after.png`) |
| 1 | Tadooer share image and fonts now come from the pack through `export_site_brands.py`; `capture-og-images.ts` skips Tadooer | `public/og/tadooer.jpg` is the owner-approved pack image, recorded in `docs/site-brand-provenance.json` |
| 2 | Atkinson Hyperlegible Next 400/700 served from `public/brand/kork/fonts/` with its OFL | Both faces load on the Kork page |
| 3, 12 | Arkhiv fills use `#b31f24`; Spool buttons use ink on violet; Metronome fills use `#b82e5a`; Arkhiv home number is `#ff7276` | Buttons measure 5.82:1, 4.55:1 and 5.78:1; the home number 7.47:1 |
| 4, 13 | Marks for clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal and Kork exported from their packs with provenance; the loose `kork-mark.svg` and `rekolekt-mark.svg` were removed and the references repointed | 103 public brand assets match their hashes; each page shows its mark |
| 5 | Below 900px the 23-link product list is hidden and the "All products" link stays | Hero top moved from 447px to 221px at 390px wide (`tadooer-phone-390-after.png`) |
| 6 | Patchwork theme sets JetBrains Mono for labels | Rendered by the same rule as HasanAra |
| 7 | Cascadia Mono Regular served; the Chatty Cat heading keeps the prose form | Both weights load; `h1` reads "Chatty Cat" |
| 8, 15 | clpr says "the feed" instead of "trending"; Undertow's export line follows the README; Kork drops the custom-domain and paid-plan lines; Backline drops the station list; Pirs's title says "experimental"; Prichal's domain handle and migration are described as planned; Tadooer's Super Productivity import is described as on the roadmap | Register entries C-UNDERTOW-02/03, C-TADOOER-01 to 04, C-PRICHAL-01/02 and C-LEFTFIELD-01/02 added with source revisions |
| 9 | HasanAra accent `#ff3333` with `#140303` text, as the pack and site use; Undertow's chromatic offset limited to the wordmark | Accent pairs pass at 5.53:1 and above |
| 14 | Left Field added to the brand-hero list; its figure is captioned "brand mark" | Caption and alt text verified |

Owner decision, October 13, 2026: the ten generated site packs (Arkhiv, Overlaid, Pirs, tmux-popups, Omarchy Multi-Monitor Bar, Super Productivity for Omarchy, Spool, Shelfish, Metronome + Tuner, super-productivity-mcp) are accepted; their guides, tokens and manifests were rebuilt with `status: accepted`. Not changed: the Undertow pack's font list still differs from the product's system stack; Arkhiv's document count stays at the README figure until the live catalogue is rechecked; the Tadooer catalog entry's Android line matches the current README.
