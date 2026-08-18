# subcult.tv Review Plan

Sources: `clean-code-review.md` (2026-02-23, 52 TS + 22 Go files) · full re-review 2026-08-18 (frontend, Go API, scripts, CI, content).

## 0. Purpose

A durable, prioritized record of every finding from the subcult.tv review plus the catalog integration plan for the 20 sibling projects. Each item is actionable and traceable to a file.

## 1. Findings Inventory

### 1.1 Resolved since 2026-02-23 (verified in this review)

- **#3** auth context key bug — `Me()` now uses typed `middleware.UserIDKey` (`api/internal/handlers/auth.go`)
- **#2** Go Scan chains — `scanProject` (20 fields) / `scanPost` (11 fields) extracted (`projects.go`, `posts.go`)
- **#5** rate limit magic numbers — named consts `GeneralRateLimit=100`, `LoginRateLimit=5`, `FormRateLimit=10`, `RateLimitWindow=time.Minute` (`router.go`)
- **#13** string-concat SQL — `ListPosts` now uses `fmt.Sprintf` for LIMIT/OFFSET (`posts.go`)
- **#14** pagination defaults — named `DefaultPerPage=20`, `MaxPerPage=100` (`handlers.go`)

### 1.2 Still open from clean-code-review.md (all frontend)

| # | Finding | Location | Fix |
|---|---------|----------|-----|
| 1 | Duplicated admin CRUD skeleton (~200 lines × 4) | AdminProjects, AdminPosts, AdminContacts, AdminSubscribers | generic `AdminCRUD<T>` / `useAdminCRUD` hook |
| 4 | Duplicated inline input class string (10+ copies) | Contact ×4, NewsletterSignup, AdminLogin, FormFields | shared `TextInput` in FormFields |
| 7 | statusColors/statusLabels triplicated | ProjectCard, ProjectDetail, FormFields.StatusBadge | move to `lib/project-utils.ts` |
| 8 | Inline `stripHTML` + `apiTierToDisplay` in Patreon.tsx | Patreon.tsx | extract to lib |
| 9 | AdminSubscribers generic `data` state | AdminSubscribers.tsx | rename state |
| 10 | Duplicated 404 JSX blocks (lines 32–44 / 55–67) | PostPage.tsx | single `PostNotFound` component |
| 11 | COVER_PATTERNS in 3 files (github.ts, CoverArt.tsx type, types.ts) | multiple | derive type from const array in types.ts |
| 12 | AdminProjects 270+ lines local helpers | AdminProjects.tsx | use shared FormFields |
| 15 | COVER_COLOR_ROTATION alias dup (scan === vhs-magenta) | tokens.ts | drop the alias duplicate |
| 17 | `FALLBACK_PROJECTS` lastUpdated always "today" | github.ts | static date |
| 18 | Hardcoded form ids | AdminLogin (`login-username`), AdminProjects (`featured`), AdminPosts (`published`) | `useId()` |

### 1.3 New findings — HIGH

- **(A) Zero frontend tests.** No vitest in package.json; CI runs only `lint` + `typecheck` + `build`. No unit, no e2e, no a11y, no coverage gates.
- **(B) No ErrorBoundary anywhere.** Any render error → white screen. Needs a root boundary + per-section boundary (deck/admin).
- **(C) No code splitting.** All 22 pages statically imported in `App.tsx` (deck ×4 + admin ×5 + heavy pages ship on every load).
- **(D) Investor content factually wrong.** PitchDeck/OnePager/PitchDeckBrand/OnePagerBrand describe **clpr as "Clipboard manager and snippet tool"** — real clpr is a Twitch clip platform (React/TS, HLS, watch parties). Also Cutroom & Subcorp claimed but not in the catalog. Shipped as PDFs (`public/press-kit/*.pdf`).

### 1.4 New findings — MEDIUM

- **(E) Newsletter double opt-in not implemented.** README documents `/api/v1/newsletter/confirm/:token`; router has NO confirm route; `Subscribe` inserts `confirmed=true` directly (`newsletter.go`). Fix by adding the flow or fixing README + landing copy.
- **(F) Rate limiter trusts `X-Forwarded-For` directly** (`ratelimit.go:88-90`) — spoofable bypass of 5/min login limit; duplicates chi RealIP. Use `RemoteAddr` only (or require trusted proxy gating).
- **(G) Contact.tsx reports success on API failure.** Catch falls to mailto fallback but sets `submitted=true`, showing "✓ Signal received" in the success panel alongside the error.
- **(H) Metrics page hardcoded + stale.** `lastUpdated '2026-02-15'`, milestone '2026-02-17', shipped 3 / repos 5; today Aug 2026. Only Patreon `patron_count` is live; everything else silently drifts.
- **(I) Deck content duplicated across 4 files** (`WHAT_WE_BUILD`, `ACTIVE_PROJECTS`, `ROADMAP`, `FUND_ALLOCATION` verbatim in PitchDeck + PitchDeckBrand; variants in OnePager + OnePagerBrand). Extract to `lib/investor-content.ts`.
- **(J) EffectsContext default is `'full'`, README says `'mild'`** (`EffectsContext.tsx`). Default should be mild glitch, full VHS opt-in.
- **(K) Umami script absent from index.html** despite README claim + earlier exploration notes. Analytics claim unfulfilled.
- **(L) PressKit `BRAND_COLORS` (12 hex values) duplicates `index.css` `@theme` tokens.**

### 1.5 New findings — LOW

- **(M)** CoverArt `hexToRgb` fallback is hardcoded red `rgb(255,51,51)` — should be signal `#8b5cf6`.
- **(N)** Links.tsx external branch is dead code (all PRIMARY_LINKS `external:false`).
- **(O)** AdminDashboard "system.log" shows hardcoded `api: CONNECTED / database: ONLINE` — not fetched.
- **(P)** `generate-pdfs.ts` requires a separately-running `npm run preview` + `printBackground:false`; could use Playwright programmatic preview server.
- **(Q)** `GET /projects` returns a bare unpaginated array; posts/contacts/subscribers are paginated — inconsistent API shape.
- **(R)** CSP `default-src 'self'` has no `connect-src` for Umami/API — may break prod analytics/cross-origin (comment admits it).
- **(S)** No token refresh/rotation; logout is client-only clear (no server revocation).
- **(T)** `users.role` is seeded but never used for authorization (only `RequireAuth` blanket gate).

### 1.6 Strengths to protect

- Design system: token-driven `index.css` (827 lines), 3 FX levels + high-contrast + `prefers-reduced-motion`, print CSS with deck pagination + URL printing.
- Context pattern: `def` + `provider` + `hook` split (idiomatic).
- Disciplined Go backend: middleware chain, embedded migrations, graceful shutdown, Patreon OAuth2 client with stale-cache fallback.
- Clean MDX pipeline (remark-gfm, rehype-slug/autolink, lazy MDX load) + RSS generation.
- `SEOHead` imperative head manager (no helmet dep). A11y baseline: skip-link, focus-visible, aria-expanded nav, `aria-label` terminal panels, sr-only labels.

## 2. Remediation Plan (prioritized)

- **P0 — Truth (ship-visible correctness):** ✅ DONE 2026-08-18
  1. Fix clpr claim in all 4 deck/one-pager files (or import real catalog data). ✅ [`(D)`]
  2. Contact.tsx: separate success from mailto fallback; don't show ✓ on failure. ✅ [`(G)`]
  3. Metrics page: live data or honest "last updated" timestamps. ✅ [`(H)`]
  4. Newsletter: implement confirm flow OR correct README + remove suggestion of double opt-in. ✅ (README corrected — removed non-existent confirm route, unsubscribe is POST) [`(E)`]
  5. EffectsContext default → `'mild'`. ✅ [`(J)`]
  6. Rate limiter: stop trusting `X-Forwarded-For`. ✅ [`(F)`]
  7. Umami: add script to index.html or remove README claim. ✅ (self-healing inline guard reads VITE_UMAMI_URL/ID) [`(K)`]

- **P1 — Resilience:** ✅ DONE 2026-08-18
  8. Add root `ErrorBoundary` (+ deck/admin boundaries). ✅ [`(B)`]
  9. `React.lazy` deck ×4 + admin ×5. ✅ [`(C)`]
  10. Extract `lib/investor-content.ts`; single source for deck/press content. ✅ [`(I)`]
  11. CSP: add `connect-src` for API + Umami. ✅ [`(R)`]
  12. Auth: token expiry handling + server-side revocation + use `users.role`. ✅ [`(S)`,`(T)`]

- **P2 — Test foundation:** ✅ DONE 2026-08-18
  13. Add vitest; smoke tests: App renders, Projects filters, Contact submit (mock), PostPage MDX load. Wire `npm test` into CI. ✅ [`(A)`] — vitest 4.1.11 / jsdom / @testing-library; `src/test/setup.ts` (matchMedia stub), `src/test/smoke.test.tsx` (6 tests, all green); `test: vitest run` added to package.json; ci.yml frontend job gained `npm test` step.

- **P3 — Dedup & sweep:**
  14. `AdminCRUD<T>` / `useAdminCRUD` (kills #1 + phase2/pagination dup). 
  15. Shared `TextInput` (#4), consolidate status maps (#7), derive `CoverPattern` type (#11).
  16. Low sweep: M–P, Q (paginate projects or standardize), plus remaining open items #8 #9 #10 #12 #15 #17 #18.

## 3. Catalog Integration Plan (20 sibling projects)

`content/projects.json` currently has 28 entries. Of the 21 examined projects: **already in catalog (11)**: subcults, artemis, clustr, augr, clpr, echo-trails, edda, jury-rigged, patchwork, subcult-tv, transcript-create (= hasanara repo). **Missing (12)**: clustr-galaxy, blacktower, switchyard, dsa-seats, roberts-rules, hasanara (proper), productivity-suite, subcult-pds, subcult-os, dsa-slate, invisible-museum, tmux-popups.

### Phase 1 — Add 12 entries

Skeleton per entry (mirror existing shape):
```json
{
  "slug": "...", "name": "...", "description": "...", "longDescription": "...",
  "whyItExists": "...", "status": "active|incubating|archived",
  "type": ["software|media|tools|social"],
  "stack": [...], "topics": [...],
  "url": "https://<slug>.subcult.tv", "repoUrl": "https://git.subcult.tv/<owner>/<slug>",
  "lastUpdated": "2026-08-18T00:00:00Z",
  "featured": false, "order": <next>,
  "coverColor": "<rotate COVER_COLOR_ROTATION>", "coverPattern": "<rotate>"
}
```

| slug | stack | topics | status | type |
|------|-------|--------|--------|------|
| clustr-galaxy | Unity, C#, URP, XR Interaction Toolkit | spatial-web, xr, visualization | incubating | software |
| blacktower | TypeScript, React, OpenCode SDK, Biome | agent-orchestration, developer-tools, automation | active | tools |
| switchyard | TypeScript, React, Tailwind | automation, workflows, agents | active | tools |
| dsa-seats | Next.js, React, TypeScript, PostgreSQL, Drizzle | civic-tech, elections, data | active | software |
| roberts-rules | TypeScript, AT Protocol | civic-tech, governance, atproto | active | software |
| hasanara | React, TypeScript, Python, OpenAI, Whisper | video, transcription, search | active | software |
| productivity-suite | React, TypeScript, Electron, CalDAV | productivity, local-first, sync | active | tools |
| subcult-pds | Docker, Compose, AT Protocol | atproto, self-hosting, infra | active | tools |
| subcult-os | Vite, React, TypeScript, Expo, React Native | events, ticketing, mobile | active | software |
| dsa-slate | Vite, React, TypeScript, Go, PostgreSQL, Docker | templates, starter-kit | incubating | tools |
| invisible-museum | Swift, SwiftUI, ARKit | ar, museums, ios | incubating | media |
| tmux-popups | Shell, tmux | developer-tools, terminal | active | tools |

Verify `repoUrl` exists on git.subcult.tv before committing (blacktower/switchyard live under `~/Projects/tools`, echo-trails/invisible-museum under `~/Projects/rork` — ownership may differ).

### Phase 2 — Corrections

1. Rename `transcript-create` → `hasanara` (slug, name, description; stack ⊃ React 19, ky, Python/FastAPI backend).
2. Fix clpr fact-error in PitchDeck/OnePager/Brand variants (or import `lib/investor-content.ts` from catalog).
3. Resolve Cutroom/Subcorp: either add real catalog entries or remove from deck claims (replace with dsa-seats / hasanara / productivity-suite).
4. Audit existing 28 entries: all say `lastUpdated 2026-06-04` — refresh to 2026-08-18 where still accurate.

### Phase 3 — Supporting

- Screenshot convention: `/screenshots/{slug}-home-1440.webp`.
- Add live-demo `url` where verifiable.
- Consider promoting dsa-seats / hasanara to featured (optional).
- Add catalog integrity check (unique slugs, valid type/status/coverPattern, non-empty stack) to CI.

### Phase 4 — Verification

`npm run typecheck` → `npm run lint` → `npm run build` (includes generate-rss). Spot-check /projects grid + detail pages + CoverArt fallback. Regenerate PDFs if deck claims edited (`npm run preview` then `npm run generate-pdfs`).

### Phase 5 — Optional follow-ups (priority order)

1. vitest + smoke tests. 2. Extract deck content to `lib/investor-content.ts`. 3. `React.lazy` heavy pages. 4. Newsletter/Contact UX + Metrics staleness. 5. Generic `AdminCRUD<T>`.