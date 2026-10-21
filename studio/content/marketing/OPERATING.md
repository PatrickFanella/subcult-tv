# Packet-guided preparation and campaign reviews

Studio maintains campaign direction for all 25 projects in `packets/<project>/packet.md`. Product repositories retain technical claims. `packets.json` selects the exact Studio bytes and the upstream packet documents. CLPR also owns an upstream packet; preparation fetches its main branch and reads selected documents at one resolved commit. A failed refresh uses the selected, hash-checked captured revision and adds a warning. Other project packets currently originate in Studio; this does not imply their product repositories contain a packet or that an audience study has been performed.

Edit a packet and its selected SHA-256 together. `review_after` sets the next review date. Missing selections, modified bytes and an invalid registry stop loading; stale packets and upstream fallback are explicit review flags. Do not silently substitute a README for a missing marketing packet. The strategy file is a compact theme index; the selected packet documents accompany it as input. Both are campaign direction, not evidence of product capabilities.

Every new short-post editor result selects a project and theme explicitly. Instagram showcase themes are selected before writing; change posts retain their actual angle and flag an angle outside the maintained themes. The private export allows only campaign labels, packet revision/hash, theme, action, measures, evidence record IDs and review flags. Raw packet documents and local file paths stay on Kvant. Older drafts retain their copy and approvals and are labeled as predating tracking.

## Register a real demonstration

Keep captures in private runtime storage or the existing selected media library. Inspect the actual task and its output. Supply one JSON record to:

```
python studio/automation/social-posting/campaign_review.py --state ~/.local/state/social-posting --record /private/path/asset-record.json
```

The record needs `kind: "asset"`, a unique `id`, `project`, exact `pillar_id`, `source`, timezone-qualified `observed_at`, `file`, its `sha256`, `rights`, `journey`, product `revision`, a plain `result`, `inspected: true` and `passed: true` or `false`. Record failure honestly; it creates a fix-journey task. Rights must identify the permitted use; an inspected private capture does not grant public reuse. Public media selection still follows the existing asset allowlist and rights review. A storyboard or generated product screen does not qualify.

## Register an observed result

Use the same command with `kind: "result"`, unique `id`, `project`, exact `pillar_id`, `source`, `observed_at`, `draft_id`, `metric`, `window_start`, `window_end`, `numerator`, `denominator` and `action_metric` (a boolean). Use the same metric definition and denominator unit for comparable records. Record account, platform and attribution method in the source description. Provider impressions are exposure measures; they are not product actions. A zero denominator is recorded as unavailable for a rate. Missing analytics are unavailable, not zero. No attribution claim follows merely from a visit after a post.

Records are append-only by ID. Repeating an identical record is safe; a changed observation requires a new ID. Dates, numeric counts, windows, project/theme membership and capture hashes are validated. Invalidated or changed captures are excluded at review time.

## Use the review

Run the command without `--record` to write `campaign-review.json`. Preparation also computes this report as part of its strategy context, so current evidence and project-linked owner feedback reach the next generator. The review step is:

- Capture demonstration: no valid inspected asset is registered. The report includes the first-use task to capture.
- Fix journey before distribution: an inspected task failed. Resolve and record the new observation before expanding promotion.
- Collect comparable results: assets exist, but fewer than two distinct posts have comparable product-action observations.
- Review results: at least two distinct posts have observations for the same product-action metric. Inspect the counts, windows, feedback and effort before retaining or changing the theme. This is a review threshold, not proof of a winning campaign.

The model receives these observations to guide its next angle. It cannot automatically rewrite the maintained packet, increase posting caps or publish. Owner feedback informs style and direction; measured outcomes inform the campaign decision. There are no fabricated baselines or automatic success claims. Initial reports may consist entirely of capture and instrumentation tasks until real evidence is registered.

Sunday delivery review requests per-post Buffer analytics through read-only tools. The runner stores only selected numeric metrics, provider/channel IDs, sent/freshness timestamps and a hash of the text in `provider-metrics.json`. Preparation matches an account and exact prepared text to a single campaign theme; ambiguous or edited unmatched text stays unattributed. These exposure and interaction observations accompany the campaign report. They do not replace product-action measures. A first read on October 21 saved ten recent provider observations; older posts without theme tracking remain unattributed.
