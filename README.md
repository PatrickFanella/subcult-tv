# subcult.tv

> **SUBCULT — Subculture Collective**
> We build curated projects, tools, media, and infrastructure for the counterculture.

[![Build](https://img.shields.io/badge/build-passing-00ff88)](https://subcult.tv)
[![License](https://img.shields.io/badge/license-MIT-ff3333)](LICENSE)

---

## Stack

| Layer         | Choice                                      | Why                                                                  |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| **Frontend**  | Vite + React 19                             | Fast builds, HMR, modern ESM-first bundling                          |
| **Language**  | TypeScript + Go                             | Type safety on both sides                                            |
| **Styling**   | Tailwind CSS v4                             | Utility-first with custom design tokens in CSS                       |
| **Routing**   | React Router v7                             | Client-side SPA routing with nested layouts                          |
| **Content**   | MDX (via @mdx-js/rollup)                    | Markdown + JSX for zine posts with rich components                   |
| **API**       | Go + Chi v5                                 | Lightweight, idiomatic HTTP router with middleware                   |
| **Database**  | PostgreSQL 16                               | Relational storage for projects, posts, contacts, subscribers        |
| **Auth**      | JWT (HMAC SHA256)                           | Stateless auth with bcrypt password hashing                          |
| **Analytics** | Umami                                       | Self-hosted, privacy-first analytics                                 |
| **Data**      | Curated local JSON + DB                     | Manual project catalog, edited locally, synced via self-hosted Gitea |
| **Fonts**     | Oswald / Libre Baskerville / JetBrains Mono | Display / body / mono — punk + editorial + terminal                  |
| **Infra**     | Docker Compose                              | PostgreSQL, Go API, and Umami in containers                          |

## Quick Start

```bash
# Clone
git clone https://git.subcult.tv/subculture-collective/subcult-tv.git
cd subcult-tv

# Copy environment config
cp .env.example .env
# Edit .env with your values (DB password, JWT secret, admin password)

# Install frontend dependencies
npm install

# Start everything (Docker services + dev server)
make dev

# Or start services individually:
make docker-up       # Start PostgreSQL, API, Umami
make dev-frontend    # Start Vite dev server at http://localhost:5175
make dev-api         # Start Go API locally (outside Docker)
```

### Without Docker (API only)

```bash
# Install Go dependencies
cd api && go mod download && cd ..

# Start PostgreSQL separately, then:
make dev-api         # Runs Go server on :8080
```

### All Make targets

```bash
make help            # Show all available commands
make setup           # Install all dependencies (npm + Go)
make dev             # Docker services + Vite dev server
make build           # Build frontend + API for production
make lint            # ESLint
make typecheck       # TypeScript check
make check           # lint + typecheck
make format          # Prettier
make docker-up       # Start Docker services
make docker-down     # Stop Docker services
make docker-logs     # Tail Docker logs
make docker-rebuild  # Rebuild and restart containers
make db-shell        # Open psql shell
make db-reset        # Drop and recreate database (data loss!)
make clean           # Remove build artifacts
```

## Environment Variables

```bash
# Database
POSTGRES_USER=subcult
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=subcult_db
DATABASE_URL=postgres://subcult:your_secure_password@localhost:5432/subcult_db?sslmode=disable

# API
JWT_SECRET=your_jwt_secret_here_min_32_chars
ADMIN_USER=admin
ADMIN_PASSWORD=your_admin_password
CORS_ORIGINS=http://localhost:5173,https://subcult.tv
PORT=8080

# Umami Analytics
UMAMI_DATABASE_URL=postgresql://subcult:your_secure_password@postgres:5432/umami

# Frontend (optional)
VITE_API_URL=                                # Override API base URL (defaults to /api via proxy)
```

## Routes

### Public Pages

| Route             | Page               | Description                                                                        |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `/`               | Home               | Product showcase for CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow |
| `/products`       | Products           | Directory of the six featured products                                             |
| `/products/:slug` | Product            | Product landing page using its own design system                                   |
| `/about`          | Studio             | The studio and the products it builds                                              |
| `/contact`        | Contact            | Product questions, collaborations, and bug reports                                 |
| `/support`        | Support            | Contributions toward hosting and maintenance                                       |
| `/projects`       | Redirect           | Redirects to `/products`                                                           |
| `/projects/:slug` | Legacy product URL | Redirects for the six retained products; other slugs return not found              |

### Admin Pages

| Route                | Page          | Description                                             |
| -------------------- | ------------- | ------------------------------------------------------- |
| `/admin/login`       | Login         | Admin authentication                                    |
| `/admin`             | Dashboard     | Stats overview (projects, posts, contacts, subscribers) |
| `/admin/projects`    | Projects CRUD | Create, edit, delete projects                           |
| `/admin/posts`       | Posts CRUD    | Create, edit, delete posts (with publish toggle)        |
| `/admin/contacts`    | Contacts      | View contact submissions, mark read, delete             |
| `/admin/subscribers` | Subscribers   | View newsletter subscribers                             |

## API Endpoints

All API routes are prefixed with `/api/v1`.

### Public

| Method | Endpoint                         | Description                                                         |
| ------ | -------------------------------- | ------------------------------------------------------------------- |
| `GET`  | `/api/health`                    | Health check                                                        |
| `GET`  | `/api/v1/projects`               | List projects (`?status=`, `?type=`) — backed by curated local data |
| `GET`  | `/api/v1/projects/:slug`         | Get project by slug                                                 |
| `GET`  | `/api/v1/posts`                  | List published posts (paginated)                                    |
| `GET`  | `/api/v1/posts/:slug`            | Get post by slug                                                    |
| `POST` | `/api/v1/contacts`               | Submit contact form                                                 |
| `POST` | `/api/v1/newsletter/subscribe`   | Subscribe to newsletter                                             |
| `POST` | `/api/v1/newsletter/unsubscribe` | Unsubscribe using a token                                           |

### Protected (requires `Authorization: Bearer <token>`)

| Method   | Endpoint                         | Description                  |
| -------- | -------------------------------- | ---------------------------- |
| `POST`   | `/api/v1/auth/login`             | Login → returns JWT          |
| `POST`   | `/api/v1/auth/logout`            | Revoke current user's tokens |
| `GET`    | `/api/v1/auth/me`                | Current user info            |
| `POST`   | `/api/v1/projects`               | Create project               |
| `PUT`    | `/api/v1/projects/:id`           | Update project               |
| `DELETE` | `/api/v1/projects/:id`           | Delete project               |
| `POST`   | `/api/v1/posts`                  | Create post                  |
| `PUT`    | `/api/v1/posts/:id`              | Update post                  |
| `DELETE` | `/api/v1/posts/:id`              | Delete post                  |
| `GET`    | `/api/v1/contacts`               | List contacts (paginated)    |
| `PATCH`  | `/api/v1/contacts/:id/read`      | Toggle read status           |
| `DELETE` | `/api/v1/contacts/:id`           | Delete contact               |
| `GET`    | `/api/v1/newsletter/subscribers` | List subscribers (paginated) |
| `GET`    | `/api/v1/admin/stats`            | Dashboard statistics         |

## Project Structure

```
subcult_tv/
├── api/                          # Go backend
│   ├── cmd/server/main.go        # Entry point, graceful shutdown, admin seeding
│   ├── internal/
│   │   ├── config/               # Environment-based config
│   │   ├── database/             # PostgreSQL connection + migrations
│   │   │   └── migrations/       # Embedded SQL migrations
│   │   ├── handlers/             # HTTP handlers (auth, projects, posts, contacts, newsletter, admin)
│   │   ├── middleware/           # JWT auth + request logger
│   │   ├── models/               # Domain types
│   │   └── router/               # Chi router setup with CORS
│   ├── Dockerfile                # Multi-stage Alpine build
│   ├── go.mod
│   └── go.sum
├── content/
│   ├── posts/                    # MDX blog posts
│   │   ├── subcult-manifesto.mdx
│   │   ├── release-log-field-notes.mdx
│   │   └── how-we-build.mdx
│   └── projects.json             # Local project overrides
├── docker/
│   └── postgres/init.sql         # Creates umami database
├── public/
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── admin/                # AdminLayout
│   │   ├── effects/              # GlitchFrame, TerminalPanel, CoverArt
│   │   ├── ui/                   # Button, Card, Tag
│   │   ├── NewsletterSignup.tsx
│   │   └── ...
│   ├── context/                  # EffectsContext, AuthContext
│   ├── lib/
│   │   ├── api.ts                # Typed API client for Go backend
│   │   ├── catalog helpers       # Curated project data access
│   │   └── posts.ts              # Post registry
│   ├── pages/
│   │   ├── admin/                # Admin pages (Login, Dashboard, Projects, Posts, Contacts, Subscribers)
│   │   └── ...                   # Public pages
│   ├── App.tsx                   # Route definitions (public + admin)
│   ├── main.tsx                  # Entry point (AuthProvider + EffectsProvider)
│   ├── types.ts                  # Shared types
│   └── index.css                 # Full design system + effects
├── docker-compose.yml            # PostgreSQL, API, Umami services
├── Makefile                      # Development commands
├── DESIGN_NOTES.md
├── CONTENT_CHECKLIST.md
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

## Design System

### Colors

| Token     | Hex       | Usage                        |
| --------- | --------- | ---------------------------- |
| `void`    | `#0a0a0a` | Primary background           |
| `signal`  | `#ff3333` | Primary accent (CTAs, links) |
| `static`  | `#00ff88` | Terminal green, success      |
| `flicker` | `#ffcc00` | Warning, highlights          |
| `scan`    | `#6633ff` | Secondary accent             |
| `chalk`   | `#e8e0d0` | Primary text                 |
| `bone`    | `#c4b9a7` | Body text                    |

### Effects

Three configurable levels via the `FX` toggle in the nav:

- **Clean** — No visual effects. Maximum readability.
- **Mild Glitch** — Subtle scanlines, light noise. Default.
- **Full VHS** — Scanlines, noise, VHS tracking lines, chromatic aberration.

All effects respect `prefers-reduced-motion` and are CSS-first (no GPU shaders).

## Deployment

### Full Stack (recommended)

Deploy the Go API + PostgreSQL + Umami on a VPS, and the frontend on Vercel/Cloudflare Pages with `VITE_API_URL` pointing to your API domain.

```bash
# On your VPS:
cp .env.example .env
# Edit .env with production values
docker compose up -d

# Umami will be available at http://your-server:3001
# API at http://your-server:8080
```

### Frontend Only (Vercel)

```bash
npm i -g vercel && vercel --prod
```

`vercel.json` is included for SPA fallback rewrites.

Set environment variables in Vercel dashboard:

- `VITE_API_URL` — Your API server URL (e.g., `https://api.subcult.tv`)
- `VITE_UMAMI_URL` — Optional if you self-host Umami elsewhere

### Frontend Only (Cloudflare Pages)

1. Connect your Gitea-hosted repo → Build command: `npm run build` → Output: `dist`
2. Add environment variables in the dashboard

### Umami Analytics Setup

1. After `docker compose up`, visit `http://localhost:3001`
2. Default login: `admin` / `umami`
3. Add your website, copy the Website ID
4. Update `index.html` with the Website ID in `data-website-id`
5. For production, update the Umami script `src` to your Umami domain

### DNS

Point `subcult.tv` to your deployment provider. Point `api.subcult.tv` to your API server.

## Admin Access

After starting the services, the admin user is automatically seeded from `.env`:

```
Username: $ADMIN_USER (default: admin)
Password: $ADMIN_PASSWORD
```

Navigate to `/admin/login` to access the admin dashboard.

## License

MIT — do what you want, credit appreciated.

## Product showcase and working branding

The homepage features six products, with HasanAra linked to the shared transcript
archive application. Rekolekt is the working name for Transcript Creator; its
repository remains `transcript-create`; its public landing page is `/products/rekolekt`. See the
[Rekolekt identity direction](docs/branding/rekolekt.md) and
[concept sheet](docs/branding/rekolekt-concept.svg).

## Product landing pages

The six featured products have dedicated pages at `/products/clpr`,
`/products/patchwork`, `/products/hasanara`, `/products/rekolekt`,
`/products/subcult-os`, and `/products/undertow`. Their earlier `/projects/:slug`
addresses redirect to the corresponding product page. Products outside this set
are no longer listed and their old detail URLs return the not-found page.

Landing content is in `src/lib/product-landings.ts`; route mapping is in
`src/lib/product-paths.ts`. The pages use scoped adaptations of each product's
source design tokens in `src/styles/product-landings.css`, including CLPR's
Barlow typography, Patchwork's paper and moss palette, HasanAra's lime archive
palette, Subcult OS's amber and serif system, Undertow's default Neon system,
and Rekolekt's working identity. Interface previews use existing screenshots;
illustrations are labeled as concepts.

### Public site scope

The public site centers on CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow. The homepage, directory, global navigation, footer, studio page, and contact links all lead to these products. Only these six entries remain in the public project catalog.

The broader catalog, zine, memo, investor pages, decks, one-pagers, metrics dashboard, press placeholders, link hub, generated PDFs, and RSS feed have been removed from the public site. Existing article source and admin tools remain available in the repository. The build generates a sitemap for the eleven current public pages.
