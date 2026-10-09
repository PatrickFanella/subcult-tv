# Lessons from the October 2026 drafting work

These findings come from rebuilding the SUBCULT social drafting system on October 4–5, 2026, judged blind on saved October 3–4 evidence. Product voices stay in `studio/content/VOICE.md`. This file records what went wrong in practice and what changed the results.

## Why drafts go flat

- **Purpose gets lost upstream.** Each stage passed caveats forward and none added a reason to care. The Switchyard digest was evidence-only and cut PR bodies at 600 characters, and the Studio prompts asked for evidence before story.
- **Check the digest first.** When drafts read like notes for a reviewer again, look at what the digest gave the writer before tuning the writer. The digest is Switchyard `changemaker-daily-digest`, and its "What people notice" section exists for post editors.
- **Thin days produce no post.** Infrastructure-only days should come out empty. A post that only proves activity is worse than none.

## Voice in captions

- **Account voices.**
  - `subcult` is the collective, "we".
  - `patrick` is Patrick, "I". Patrick owns a bug ("a race I wrote") only when the evidence shows his earlier change caused it.
  - Never invent authorship, feelings ("felt friendlier"), users or incidents.
- **Moves that won blind comparisons:**
  - Open on a familiar phrase made strange.
  - Use second person to put the reader in the moment the bug happens.
  - Use an exact, absurd number from the evidence as the hook.
  - Explain the mechanism in one plain sentence.
  - End on a dry aside that is true by observation, not a moral.
  - Put the product line after the reader cares, and the maturity note in a few words at the end.
- **Lines that scored well:**
  - "The leaderboard managed to cause trouble after leaving."
  - "Dialog open. Undertow's editor shortcuts sit this one out."
  - "A listener taps your Kork tip button, and it opens your own Cash App."
- **Marketing, not documentation (October 8).** Drafts that led with caveats read like developer docs. One told readers Undertow needs a capable laptop. The owner asked for marketing posts: lead with what the reader gets, say the maturity limit once near the end, and leave device requirements and other fine print to the product page. Patrick writes most of his own posts; prepared Patrick drafts are at most three a week and personal.
- **Recurring failures to reject:**
  - "A useful…" verdict openings.
  - Two-fragment headlines.
  - A-or-B polls.
  - An internal process (audit, review, ticket) given as the reason.
  - Caveats in the image kicker.
  - "Will" for a failure seen only in tests. Use "could".
  - Invented next steps ("We'll start with…"). State next steps only when the evidence names them.
  - The "Draft for human review." prefix leaking into copy.

## Critique

- **Separate calls.** Generation and fact-checking happen in different model calls.
- **Protect the lines that work.** A literal-minded critic deletes the lines that work. Tell it to keep them and to rephrase unsupported lines truthfully in the same voice. Judge honesty on the final caption, not on the drafts.
- **Draft three.** Results vary between runs, and three drafts per story reduces the spread.

## Evaluating changes

- **Blind pairwise judge.** Compare prompts with a blind pairwise judge on saved fixtures: `craft/judge.md` for captions, `judge-long.md` for editions. October 5 samples and reports are in `~/.local/state/social-posting/craft-samples-20261005/`.
- **Keep examples off the test set.** A reference example built from a fixture's facts biases that fixture, so exclude the fixture from evaluation.
- **October 5 results:**
  - Staged Instagram beat the original batch (stop 7 vs 1, voice 7 vs 3) and tuned single-pass (stop 7 vs 5).
  - The staged website/Patreon edition lost to single-pass (stop 5 vs 7), so `craft_publications` stays off. A weekly edition built from the best stories is the recommended next experiment.
  - "Reason to care" tops out near 5/10 for small fixes to products strangers don't use. The showcase lane (`showcase.py`) writes about what a live product does today instead.

## Images

- **Designed text is allowed.** Type cards and screenshots contain text by design. The visual check must not fail them for that. A faint lockup is a rendering problem, not an art problem.
- **Choose lockups by contrast.** `render.py` picks lockups by measured contrast, because variant names are unreliable. Some lockups embed base64 SVG.
- **Rights check on third-party content.** Screenshots that show other people's material, such as a streamer's clpr thumbnail, carry a rights check in the checklist.
- **Vary the image kind** (illustration, type, screenshot) across a week. Generated art from the Codex image tool lands in `~/.codex/generated_images/`.

## Pipeline gotchas

- **Source IDs.** A caption's `source_ids` must be collected evidence IDs. Claims-register IDs (`C-…`) made the October 5 09:20 UTC run fall back to single-pass.
- **Retries.** Retry a stage only on a nonzero exit or `turn.failed`. Model capacity errors do happen.
- **Slots.** Posting slots are 11:30 and 17:30 Chicago, at least 48 hours ahead, with one draft per slot (`taken_slots`).
- **Owner feedback.** `feedback.py` pulls review decisions (rejections, revision requests, edited approvals, re-roll notes and Good post marks) into `state/owner-feedback.json` hourly. The Instagram stages, the weekly and timely prompts and the short editor read it. `tune.py` proposes prompt changes from new feedback as a Saturday pull request; review its diff and compare it blind on saved fixtures before deploying.

## X media and link placement

Use the dated evidence in Studio's research and Posting Best Practices guide. Text and images both work; an image is useful when it shows the work or makes the offer clearer. Prefer original artwork for launches/supporter campaigns and real captures for demonstrations; personal observations and political quotes can stay text-only. Lower engagement on link posts does not prove a current blanket penalty or that first-reply links improve traffic or conversion. Test inline versus first self-reply placement by account and goal across comparable posts, holding other variables steady. Measure visits and supporter actions where available alongside impressions and engagement; missing analytics stay unknown.

X drafts carry a `replies` list: up to three self-replies that Buffer posts under the tweet as one thread (`metadata.twitter.thread`, checked against Buffer's API on October 9, 2026). Most posts need none. The first tweet must stand alone; a reply carries the link, one concrete detail or the next step. Moving a required link into the first reply is a placement test, named in next_check, with the link kept in exactly one place. Buffer's plan allows one scheduled thread per X account at a time, so the runner rejects a second threaded draft for the same account in one run. The short editor rewrites the first tweet only. Replies stay drafts until the owner approves the whole thread. Keep X and Bluesky guidance separate.

## Lessons from prompt tuning

Written by `tune.py` from the owner's review feedback. Each bullet is dated with the newest feedback it used.

- **2026-10-08.** The owner's approved Instagram edits for Undertow, Subcult OS and Rekolekt open on a maker's note or a concrete product behavior, not on a stranger's problem. A maker or product-name opening is fine when the same sentence names something concrete.
- **2026-10-08.** The owner cuts closing asides and repeated status paragraphs. A caption ends when the last necessary detail is told, and each required maturity limit appears once.
