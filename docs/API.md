# API contracts

The route authority is `api/internal/router/router.go`. JSON application routes use `/api/v1`; `/healthz` reports process health and `/metrics` exposes Prometheus metrics. Health alone does not prove database, provider or Studio behavior.

## Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Authenticate and obtain a JWT |
| GET | `/api/v1/projects` | Query database-backed projects |
| GET | `/api/v1/projects/{slug}` | Read one project |
| GET | `/api/v1/posts` | List published database posts |
| GET | `/api/v1/posts/{slug}` | Read one published post |
| POST | `/api/v1/contacts` | Store a contact message |
| GET | `/api/v1/patreon/campaign` | Read configured Patreon campaign data |
| GET | `/api/v1/stats` | Read public statistics |
| POST | `/api/v1/newsletter/subscribe` | Record a subscription and request configured double opt-in |
| POST | `/api/v1/newsletter/unsubscribe` | Unsubscribe with the required token |
| POST | `/api/v1/webhooks/brevo` | Receive authenticated provider feedback |

The public website’s curated product catalog comes from `content/projects.json`; it is distinct from the database-backed admin project registry. Removing unused frontend client wrappers does not remove these public API routes.

## Authenticated routes

Admin requests require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET / POST | `/api/v1/auth/me`, `/api/v1/auth/logout` | Read identity / revoke tokens |
| GET | `/api/v1/admin/stats` | Admin dashboard statistics |
| GET | `/api/v1/admin/studio` | Private asset catalog |
| GET | `/api/v1/admin/studio/jobs` | Bounded historical runner status |
| GET | `/api/v1/admin/studio/posting` | Preparation queue and receipt snapshot |
| GET | `/api/v1/admin/studio/assets/{id}` | Allowlisted private asset |
| GET | `/api/v1/admin/studio/references` | Paginated reference search |
| GET | `/api/v1/admin/studio/references/facets` | Reference filters |
| GET | `/api/v1/admin/studio/references/{id}` | One reference and attachments |
| POST | `/api/v1/projects`, `/api/v1/posts` | Create a registry project or site article |
| PUT / DELETE | `/api/v1/projects/{id}`, `/api/v1/posts/{id}` | Update / delete a registry record |
| GET | `/api/v1/contacts` | List stored contacts |
| PATCH | `/api/v1/contacts/{id}/read` | Update read status |
| DELETE | `/api/v1/contacts/{id}` | Delete a contact |
| GET | `/api/v1/newsletter/subscribers` | List subscribers |

The Studio posting view observes preparation data. It does not approve, schedule or publish social posts. Site article CRUD is a separate application feature. Private assets stay behind authentication and the catalog allowlist.

## Configuration

The API requires `DATABASE_URL` and `JWT_SECRET`; `PORT` defaults to 8080 and `BIND_HOST` controls the listener address. `CORS_ORIGINS` lists permitted frontend origins. `ADMIN_USER`, `ADMIN_PASSWORD` and `ADMIN_EMAIL` seed the first account only when no users exist. See `.env.example` for deployment settings.

`STUDIO_ROOT` points at a private exported bundle. `STUDIO_STATE_ROOT` optionally points at a bounded read-only receipt directory. Reference indexing applies migration `004_studio_references` and reads the private export on startup; `api/cmd/studio-index` provides explicit reindexing.

Brevo and Patreon are optional. Without Brevo credentials no email is sent; stored contact or subscription data does not prove delivery or opt-in confirmation. Without Patreon credentials the API returns empty campaign data. Provider feedback and the release gate are documented separately from repository checks.
