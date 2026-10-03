---
title: SUBCULT Website Copy
type: documentation
status: reference
created: 2026-09-30
updated: 2026-10-03
tags:
- topic/publishing
---

# SUBCULT website copy

Current references for product copy: [[one-sheet-subcult]] for positioning, [[001 Projects/Works/Social Posts/Product Claims Register]] for facts, and the [voice guide](../../VOICE.md) for how each product sounds. The earlier umbrella-wide website drafts and their status audit were retired. As of October 2 they no longer described the site, which then had six products.

## Corrections prepared September 30

Catalog heading: **Software for independent culture.**

Catalog introduction: “From a clip worth keeping to a night worth putting on: six products, each built for a different part of independent culture.”

Patchwork privacy copy: “Requests use approximate areas; approved public resources can show their addresses.” Always keep its pre-alpha demonstration label.

Undertow should point to https://undertow.subcult.tv/ for the public editor. Local editing and exports are available. Cloud rendering is being tested and live paid billing is disabled.

As recorded then, a separate subcult-tv worktree held these source changes and they were not deployed; the public catalog still needed that publication step. Patchwork's own home copy needs a separate correction in the app for the same privacy overstatement.

## Kork, observed October 2

Kork launched October 2, 2026 at https://kork.subcult.tv. As observed that day, the live catalog listed six products and had no Kork entry. Adding Kork needed a subcult-tv change: a catalog card, a product landing and "seven products" in the introduction. Use the C-KORK description in [[Product Claims Register]], and leave out custom domains, paid plans and prices.

## Source check, October 3

The current subcult-tv source (`src/lib/showcase.ts`, checked at `0a09bb1`) lists nine products: clpr, Patchwork, HasanAra, Rekolekt, Subcult OS, Undertow, Prichal, Kork and Left Field. The catalog introduction in source now says "nine products". None of this was checked against the live deployment, so the October 2 observations above stand as dated.

Two things in that source differ from the corrections above. The introduction keeps the "From a clip worth keeping to a night worth putting on" opening, a shape the voice guide asks the site to stop repeating. The Patchwork card and landing still say "Public views show approximate areas, never exact addresses", which the claims register retires.
