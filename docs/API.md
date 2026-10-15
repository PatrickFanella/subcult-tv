# API contracts

The route authority is `api/internal/router/router.go`. JSON application routes use `/api/v1`; `/healthz` reports process health and `/metrics` exposes Prometheus metrics. Health alone does not prove database, provider or Studio behavior.

## Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Authenticate and obtain a JWT |
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

The public roster, claims and artwork come from `content/projects.json` and the showcase source. Approved database project snapshots update that roster in the browser. Editable registry rows are available only through the authenticated `/api/v1/admin/projects` route; public project routes expose approved snapshots. API outages retain the curated website fallback. New registry projects need a selected public page before joining the roster.

## Authenticated routes

Admin requests require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET / POST | `/api/v1/auth/me`, `/api/v1/auth/logout` | Read identity / revoke tokens |
| GET | `/api/v1/admin/stats` | Admin dashboard statistics |
| GET | `/api/v1/admin/studio` | Private asset catalog |
| GET | `/api/v1/admin/studio/jobs` | Bounded historical runner status |
| GET | `/api/v1/admin/studio/posting` | Preparation queue and receipt snapshot |
| GET / POST | `/api/v1/admin/studio/tweets` | List tweet requests / request one account's unapproved draft with `account` and optional `note` |
| GET | `/api/v1/admin/studio/assets/{id}` | Allowlisted private asset |
| GET | `/api/v1/admin/studio/references` | Paginated reference search |
| GET | `/api/v1/admin/studio/references/facets` | Reference filters |
| GET | `/api/v1/admin/studio/references/{id}` | One reference and attachments |
| GET | `/api/v1/admin/projects` | Read editable project registry |
| POST / DELETE | `/api/v1/admin/projects/{id}/approve`, `/api/v1/admin/projects/{id}/publication` | Approve the exact saved version / remove its public update |
| POST | `/api/v1/projects`, `/api/v1/posts` | Create a registry project or site article |
| PUT / DELETE | `/api/v1/projects/{id}`, `/api/v1/posts/{id}` | Update / delete a registry record |
| GET | `/api/v1/contacts` | List stored contacts |
| PATCH | `/api/v1/contacts/{id}/read` | Update read status |
| DELETE | `/api/v1/contacts/{id}` | Delete a contact |
| GET | `/api/v1/newsletter/subscribers` | List subscribers |

The Studio posting snapshot observes preparation data and keeps every prepared draft unapproved. `GET /api/v1/admin/studio/delivery` observes live PostyBirb accounts and posts for the configured account IDs. Admin-only `POST /api/v1/admin/studio/delivery` accepts multipart `request_id`, `account_id`, `caption`, `due_at` (RFC3339), `approved=true` and a JPEG `media` file. It requires 24 hours of lead time and records approval before submitting a schedule. Request IDs prevent repeat dispatch, including after uncertain responses. PostyBirb receives the approved JPEG privately; the legacy `GET /api/v1/posting-media/{random-id}.jpg` endpoint remains for retained approvals. The private Studio library retains its authentication and catalog allowlist. Site article CRUD remains separate. See [Studio configuration and recovery](STUDIO.md).

The preparation worker uses the server-only preparation key, separately from admin sessions. `POST /api/v1/posting-preparation/tweets/claim` leases one request. `POST /api/v1/posting-preparation/tweets/{id}` records `status` (`done` or `failed`), the claimed `attempts` number, and either `result_draft_id` or `error`. Completion requires the generated draft to be present in the private snapshot for the requested X account. These endpoints do not approve or schedule a post.

## Configuration

The API requires `DATABASE_URL` and `JWT_SECRET`; `PORT` defaults to 8080 and `BIND_HOST` controls the listener address. `CORS_ORIGINS` lists permitted frontend origins. `ADMIN_USER`, `ADMIN_PASSWORD` and `ADMIN_EMAIL` seed the first account only when no users exist. See `.env.example` for deployment settings.

`STUDIO_ROOT` points at a private exported bundle. `STUDIO_STATE_ROOT` optionally points at a bounded read-only receipt directory. Reference indexing applies migration `004_studio_references` and reads the private export on startup; `api/cmd/studio-index` provides explicit reindexing.

Brevo and Patreon are optional. Without Brevo credentials no email is sent; stored contact or subscription data does not prove delivery or opt-in confirmation. Without Patreon credentials the API returns empty campaign data. Provider feedback and the release gate are documented separately from repository checks.
