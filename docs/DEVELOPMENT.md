# Development

Work from the combined repository root. Use Node 22, the Go version declared in `api/go.mod`, Python 3, Docker Compose and Git LFS. Brand rendering additionally needs Pillow, fontconfig, rsvg-convert, Inkscape and ffmpeg; ordinary application checks do not rebuild brand artwork.

## Local application

```sh
rtk proxy git lfs pull
rtk proxy make setup
rtk proxy make dev
```

`compose.dev.yml` starts PostgreSQL 16 and the Go API on a project-specific network. `DEV_PROJECT` defaults to a hash of the checkout path, so different worktrees have different containers and volumes. It has no fixed container names or external deployment networks. Local defaults are PostgreSQL at `127.0.0.1:15435`, API at `127.0.0.1:18085` and Vite at `127.0.0.1:5175`. Ports still need to be distinct for simultaneous worktrees.

For another worktree, set ports before starting it:

```sh
rtk proxy env DEV_API_PORT=18086 DEV_DATABASE_PORT=15436 make dev
```

The local API uses `local-admin` / `local-development-only`. These synthetic values are scoped to the development profile. No Patreon or Brevo provider credentials are configured. The profile passes `--env-file /dev/null`, and the API image has no deployment `.env`.

Use `make dev-down` with the same port/project environment to stop local services. It retains the local database. `make clean` removes only frontend/API build output. There is no automatic database reset target.

## Separate processes

`make dev-up` starts the local services. Then `make dev-frontend` starts Vite; supply `DEV_API_TARGET=http://127.0.0.1:18085` for its API proxy. `make dev-api` instead runs Go directly and requires an explicitly configured disposable `DATABASE_URL`, `JWT_SECRET` and admin seed settings.

A private Studio bundle is optional. `make studio-export` writes the ignored bundle at `studio/runtime/studio/` and updates the explicit public SUBCULT selection. The local API mounts that path read-only at `/studio`. Export before starting the API if you want the reference index populated on startup. Do not mount preparation-job state into a test database.

## Checks

```sh
rtk proxy make check
rtk proxy make test
rtk proxy make build
rtk proxy make check-import
```

`typecheck` builds the TypeScript project references; it checks `src/` and public content rather than stopping at the empty root project. Frontend lint and Vitest exclude private Studio source files. Studio checks validate current manifests, SVG parsing, private export boundaries and disposable preparation tests. Original-import verification uses retained Git history, so it needs a clone containing the Studio ancestry rather than a shallow application-only checkout.

Go tests without `TEST_DATABASE_URL` do not establish database integration. For integration, point that variable at this checkout’s disposable PostgreSQL or use hosted CI. `make db-shell` opens the local database.

## Deployment definitions

`docker-compose.yml` defines the deployed API and frontend, using an external database and external `projects`/`dev` networks. It does not provision PostgreSQL or Umami. `.env.example` documents the required application settings.

The former automatic host override is now explicit at `ops/compose/nuc.yml`. To review the NUC configuration from the root, after supplying the intended deployment `.env`:

```sh
rtk proxy docker compose -f docker-compose.yml -f ops/compose/nuc.yml config --quiet
```

The overlay binds the existing NUC addresses and ports. It is not loaded by local development commands. Runtime deployment, migration, bundle installation and installed-timer cutover require their own destination checks; building this repository does not perform them.
