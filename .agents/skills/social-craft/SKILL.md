---
name: social-craft
description: Write, critique or rework SUBCULT social posts, captions, devlog entries, Patreon editions, supporter copy and product copy so strangers stop and read. Use when drafting or reviewing copy or post images by hand, or when tuning the staged drafting prompts; facts, approval and publication stay with their owners.
---

# Social craft

Work from the subcult-tv checkout (`studio/` holds the sources). The canonical Kvant checkout may sit on another agent's feature branch; read from `origin/main` or a worktree when its files are older. Read these before writing:

1. `studio/content/VOICE.md`: the account and product voices. It wins over everything below.
2. `studio/content/social/Product Claims Register.md` and the change's own evidence: the only source of facts.
3. `studio/content/social/research/DIGEST.md`: evidence-tagged rules, platform notes, rejected myths and the reviewer rubric. Open the long files beside it (`engagement-psychology.md`, `platform-playbooks.md`, `growth-strategy.md`, `visuals.md`, and `exemplars.md` / `post-patterns.md` when present) only for the question at hand.
4. `studio/automation/social-posting/craft/examples.md`: reference captions. Copy their moves, never their facts.
5. [Lessons](references/lessons.md): account voices, the moves that won blind comparisons, the recurring failures and the pipeline gotchas. Read it before tuning a prompt or judging a draft.

## Writing a post

Work out the story before the words: who meets the change, what was in their way, what is different now, the reason as the evidence states it, and the one concrete detail that makes it real. Internal process (an audit, a review, a ticket) is not a reason. A documented failure is described as what happens to whoever meets it, never as an incident with a person the evidence does not report.

Write two versions with different structures, then critique both as a stranger on a phone and as a fact-checker, using the DIGEST rubric. Keep the lines that are alive; fix unsupported lines by rephrasing them truthfully in the same voice. State maturity once, in reader terms, after the story. No review-pipeline words (merged, PR, deployment, live check, verification, confirmed), no verdict framing ("A useful…"), no A-or-B polls, no moral or summary endings, no engagement bait.

## Supporter and product copy

Supporter and Patreon page copy follows `studio/content/patreon/support-redesign-2026-10/`: light shared rewards, private Discord access and occasional releases, with no promised schedule. Prices, tiers and access stay proposed until the owner approves them and the live account reads back. Product copy states what the product does, who it is for and how finished it is, in that product's voice; brand metaphors are optional and never replace the explanation.

## Images

`studio/automation/social-posting/render.py` sets brand-pack type, the product lockup and an optional image into a 1080 × 1350 JPEG under 900 KB: `illustration` (original generated art in the product's art direction from `craft/art-direction.json`, no text, no fake screens, no real people), `type` (a typographic card with the brand's signature motif) or `screenshot` (a public page, only when the post is about the product as it is live). Look at the result at phone size before offering it.

## The automated path

The Instagram and website/Patreon jobs run the same method as separate model calls (`craft.py`: brief, drafts, review, final, image, visual check); X and Bluesky drafts get an editor pass (`craft/short.md`). Change those prompts in subcult-tv and compare them blind against the installed version on a saved fixture before deploying ([lessons](references/lessons.md#evaluating-changes)). Read [the runtime](references/runtime.md) before running, deploying or debugging a job. Drafts stay unapproved: approval, scheduling and publication need the owner and provider readback.
