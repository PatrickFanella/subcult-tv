# Collection verification

Checked 2026-10-02:

- All 37 requested sites have `GUIDE.md`, `SOURCES.md`, `tokens.json`, `tokens.css`, `manifest.json` and initial raw evidence.
- All JSON files parse.
- Every file hash in each site manifest matches the saved artifact.
- Local links in the root documents, site guides, source notes and gallery resolve.
- The gallery contains 37 cards and references 37 available thumbnail files.
- The gallery JavaScript passes `node --check`.
- 65 images are preserved across initial, later and scrolled states. Image count does not imply 65 complete page renders; some are loaders or a browser error.

The gallery's rendered appearance and interactive filters could not be verified in T3: both direct loopback navigation and the environment-port target returned preview automation errors, and evaluate/snapshot failed afterward. This is a browser verification limit. Syntax and link checks are complete; browser interaction proof remains pending.

Site evidence is classified separately: 22 desktop visual/style studies, 14 with partial visual coverage and styled document evidence, and one unavailable live render (Low-tech Magazine). No mobile, complete motion, accessibility or transaction-flow audit is claimed.

## Repository move

Moved to `~/Documents/Design References/2026-10-02-websites/` at the user’s request. All 348 files matched their original SHA-256 hashes immediately after the move. Root documentation and the generator were then updated for the new location; raw observations, per-site guides, token files and all 65 screenshots were preserved. Per-site hashes and local links were rechecked, and the collection manifest was refreshed. The prior gallery browser-verification limit still applies.
