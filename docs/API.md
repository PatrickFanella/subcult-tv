# API contracts

The route authority is `api/internal/router/router.go`. JSON application routes use `/api/v1`; `/healthz` reports process health and `/metrics` exposes Prometheus metrics. Health alone does not prove database, provider or Studio behavior.

## Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Authenticate and obtain a JWT |
| GET | `/api/v1/catalog/projects` | Same approved snapshots as `/projects` (catalog alias) |
| GET | `/api/v1/projects` | List approved project snapshots (status/type filters supported) |
| GET | `/api/v1/projects/{slug}` | Read one approved project snapshot |
| GET | `/api/v1/posts` | List published database posts |
| GET | `/api/v1/posts/{slug}` | Read one published post |
| POST | `/api/v1/contacts` | Store a contact message |
| GET | `/api/v1/patreon/campaign` | Read configured Patreon campaign data |
| GET | `/api/v1/stats` | Read public statistics |
| POST | `/api/v1/newsletter/subscribe` | Record a subscription and request configured double opt-in |
| POST | `/api/v1/newsletter/unsubscribe` | Unsubscribe with the required token |
| POST | `/api/v1/webhooks/brevo` | Receive authenticated provider feedback |
| POST | `/api/v1/posting-preparation` | Preparation-key route: ingest prepared website/Patreon editions |
| POST | `/api/v1/posting-preparation/rerolls/claim` | Preparation-key route: lease one queued re-roll (the reply includes `attempts`) |
| POST | `/api/v1/posting-preparation/rerolls/{id}` | Preparation-key route: record `status` (`done`/`failed`) and optionally the claimed `attempts` |
| POST | `/api/v1/posting-preparation/tweets/claim` | Preparation-key route: lease one tweet request |
| POST | `/api/v1/posting-preparation/tweets/{id}` | Preparation-key route: record a tweet request result |
| GET | `/api/v1/posting-preparation/feedback` | Preparation-key route: owner decisions for prompt tuning |
| GET | `/api/v1/posting-media/{id}` | Approved JPEG for a retained PostyBirb schedule |

The public roster, claims and artwork come from `content/projects.json` and the showcase source. Approved database project snapshots update that roster in the browser. Editable registry rows are available only through the authenticated `/api/v1/admin/projects` route; public project routes expose approved snapshots. API outages retain the curated website fallback. New registry projects need a selected public page before joining the roster.

## Authenticated routes

Admin requests require `Authorization: Bearer <token>` with the `admin` role; any other role receives `403 {"error":"Admin access required"}` from the router before a handler runs. Server-side logout revocations (`POST /api/v1/auth/logout`) are kept in process memory and reset when the API restarts; a token issued in the same second as the logout is also revoked.

| Method | Route | Purpose |
| --- | --- | --- |
| GET / POST | `/api/v1/auth/me`, `/api/v1/auth/logout` | Read identity / revoke tokens |
| GET | `/api/v1/admin/stats` | Admin dashboard statistics |
| GET | `/api/v1/admin/studio` | Private asset catalog |
| GET | `/api/v1/admin/studio/jobs` | Bounded historical runner status |
| GET | `/api/v1/admin/studio/posting` | Preparation queue and receipt snapshot |
| GET | `/api/v1/admin/studio/posting-media/{sha256}` | One prepared review JPEG referenced by a current Instagram draft |
| GET | `/api/v1/admin/studio/review` | Prepared drafts with saved edits for review |
| PUT | `/api/v1/admin/studio/review/{id}` | Save an edited draft (caption, account, due time, media) |
| GET | `/api/v1/admin/studio/review/{id}/media` | Media attached to a review draft |
| POST | `/api/v1/admin/studio/review/{id}/approve` | Approve a reviewed draft for scheduling |
| POST | `/api/v1/admin/studio/review/{id}/decision` | Record an owner decision (approve/skip/feedback) on a draft |
| PUT | `/api/v1/admin/studio/review/{id}/schedule` | Edit an already scheduled Instagram post |
| POST | `/api/v1/admin/studio/review/{id}/reroll` | Queue a regeneration of an unsubmitted Instagram draft |
| GET | `/api/v1/admin/studio/rerolls` | Re-roll queue and results |
| GET / POST | `/api/v1/admin/studio/tweets` | List tweet requests / request one account's unapproved draft with `account` and optional `note` |
| GET | `/api/v1/admin/studio/decisions` | Recorded draft decisions |
| GET / POST | `/api/v1/admin/studio/delivery` | Observe PostyBirb accounts and schedules / approve one Instagram schedule |
| GET | `/api/v1/admin/studio/bluesky` | Bluesky drafts and schedules |
| POST | `/api/v1/admin/studio/bluesky/{id}/approve` | Approve a Bluesky draft through PostyBirb |
| GET | `/api/v1/admin/studio/buffer` | X drafts and Buffer queue state |
| GET | `/api/v1/admin/studio/buffer/history` | Recent Buffer posts for the configured channels |
| POST | `/api/v1/admin/studio/buffer/{id}/approve` | Approve an X draft into Buffer |
| PUT | `/api/v1/admin/studio/buffer/{id}/schedule` | Edit a Buffer-scheduled X draft |
| GET | `/api/v1/admin/studio/assets/{id}` | Allowlisted private asset |
| GET | `/api/v1/admin/studio/references` | Paginated reference search |
| GET | `/api/v1/admin/studio/references/facets` | Reference filters |
| GET | `/api/v1/admin/studio/references/{id}` | One reference and attachments |
| GET | `/api/v1/admin/projects` | Read editable project registry |
| GET | `/api/v1/admin/posts` | List every site article, including unpublished |
| GET | `/api/v1/admin/publications` | Prepared website/Patreon editions awaiting review |
| PUT | `/api/v1/admin/publications/{id}` | Save an edited edition body |
| POST | `/api/v1/admin/publications/{id}/approve` | Approve an edition (Patreon submits through PostyBirb) |
| POST / DELETE | `/api/v1/admin/projects/{id}/approve`, `/api/v1/admin/projects/{id}/publication` | Approve the exact saved version / remove its public update |
| POST | `/api/v1/projects`, `/api/v1/posts` | Create a registry project (`status` in active/incubating/archived, `type[]` in software/media/tools/social) or site article (`date` as YYYY-MM-DD) |
| PUT / DELETE | `/api/v1/projects/{id}`, `/api/v1/posts/{id}` | Update / delete a registry record |
| GET | `/api/v1/contacts` | List stored contacts |
| PATCH | `/api/v1/contacts/{id}/read` | Update read status |
| DELETE | `/api/v1/contacts/{id}` | Delete a contact |
| GET | `/api/v1/newsletter/subscribers` | List subscribers |
| POST | `/api/v1/newsletter/subscribers/sync` | Mark local sign-ups confirmed when Brevo lists them |

The Studio posting snapshot observes preparation data and keeps every prepared draft unapproved. `GET /api/v1/admin/studio/delivery` observes live PostyBirb accounts and posts for the configured account IDs. Admin-only `POST /api/v1/admin/studio/delivery` accepts multipart `request_id`, `account_id`, `caption`, `due_at` (RFC3339), `approved=true` and a JPEG `media` file. It requires a `due_at` in the future and within 90 days (the `GET` response reports `minimum_lead_hours`, currently 0) and records approval before submitting a schedule. Request IDs prevent repeat dispatch, including after uncertain responses. PostyBirb receives the approved JPEG privately; the legacy `GET /api/v1/posting-media/{random-id}.jpg` endpoint remains for retained approvals. The private Studio library retains its authentication and catalog allowlist. Site article CRUD remains separate. See [Studio configuration and recovery](STUDIO.md).

Write failures return `404` for a missing row, `409` for a duplicate slug, `400` for a malformed UUID or date, and a generic `500` otherwise; driver messages are logged, not returned.

The preparation worker uses the server-only preparation key, separately from admin sessions. `POST /api/v1/posting-preparation/tweets/claim` leases one request. `POST /api/v1/posting-preparation/tweets/{id}` records `status` (`done` or `failed`), the claimed `attempts` number, and either `result_draft_id` or `error`. Completion requires the generated draft to be present in the private snapshot for the requested X account. These endpoints do not approve or schedule a post.

## Configuration

The API requires `DATABASE_URL` and `JWT_SECRET`; `PORT` defaults to 8080 and `BIND_HOST` controls the listener address. `CORS_ORIGINS` lists permitted frontend origins. `TRUSTED_PROXY_CIDRS` (comma-separated) names the reverse-proxy networks whose `X-Forwarded-For` is used to derive the client IP for rate limiting and request logs; when unset it defaults to loopback, RFC 1918 and `fc00::/7`. The right-most forwarded address that is not a trusted proxy is used; `X-Real-IP` and `True-Client-IP` are ignored, and a request from an untrusted address is keyed on that address alone. `ADMIN_USER`, `ADMIN_PASSWORD` and `ADMIN_EMAIL` seed the first account only when no users exist. See `.env.example` for deployment settings.

`STUDIO_ROOT` points at a private exported bundle. `STUDIO_STATE_ROOT` optionally points at a bounded read-only receipt directory. Reference indexing applies migration `004_studio_references` and reads the private export on startup; `api/cmd/studio-index` provides explicit reindexing.

Brevo and Patreon are optional. Without Brevo credentials no email is sent; stored contact or subscription data does not prove delivery or opt-in confirmation. Without Patreon credentials the API returns empty campaign data. Provider feedback and the release gate are documented separately from repository checks.
