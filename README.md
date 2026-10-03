# SUBCULT website and Studio

Private source for the public [subcult.tv](https://subcult.tv) website, its authenticated admin workspace and Studio production library. Product pages, brand sources and the interfaces that consume them share one repository and one PR.

The application uses React 19, TypeScript, Vite and Tailwind CSS, with a Go/Chi API and PostgreSQL. Studio uses Python for asset exports and preparation jobs. Binary media and fonts use Git LFS.

## Start here

```sh
rtk proxy git lfs pull
rtk proxy make setup
rtk proxy make dev
```

`make dev` starts a local database and API, then Vite on loopback. The development profile uses synthetic local accounts and does not load deployment credentials. See [development setup](docs/DEVELOPMENT.md) for ports, separate processes, tests and cleanup.

## Repository map

| Path | Owns |
| --- | --- |
| `src/` | Public website and authenticated admin UI |
| `api/` | Go HTTP API, authentication, migrations and private asset access |
| `content/` | Public product catalog and site articles |
| `public/` | Explicit public assets |
| `studio/branding/library/` | Current brand packs, generators, fonts and editable masters |
| `studio/branding/patrick/` | Authoritative Patrick design system and approved logo treatments |
| `studio/media/library/` | Reviewed media catalog, original files and recipes |
| `studio/references/` | Private searchable design-reference catalog and source evidence |
| `studio/content/` | Social and Patreon planning material |
| `studio/automation/` | Preparation jobs and tracked unit sources |
| `studio/branding/archive/` | Retired studies and original artwork, outside production exports |
| `docs/` | Maintained development, API and repository procedures |
| `ops/` | Explicit host deployment overlays and analytics tooling |

## Common commands

| Command | Result |
| --- | --- |
| `make check` | Lint, TypeScript, product catalog and Studio source/export checks |
| `make test` | Frontend, Go and disposable Studio preparation tests |
| `make build` | API binary and public frontend output |
| `make check-import` | Verify the original Studio import against retained Git history |
| `make studio-export` | Private bundle plus the explicit public SUBCULT asset selection |
| `make studio-export-left-field` | Explicit public Left Field asset selection |
| `make studio-package` | Brand download ZIPs under ignored `studio/runtime/packages/` |
| `make studio-preview` | Private local source galleries on loopback |
| `make dev-down` | Stop this checkout’s local services while retaining its database |

Public routes are `/`, `/products`, `/products/:slug`, `/about`, `/contact`, `/support` and `/newsletter/confirmed`. Legacy `/projects` routes retain their redirects. Admin routes include the dashboard, projects, contacts, subscribers, Studio assets, posting preparation and design references. See [API contracts](docs/API.md) and [Studio integration](docs/STUDIO.md).

## Source and publication boundaries

Studio originals stay private. Public assets are explicitly selected and hash-bound to their sources; private browsing bundles are served through the authenticated API. The frontend build excludes Studio sources, and Tailwind scans only application inputs.

Prepared drafts, approval, scheduling, dispatch and delivery remain distinct. This repository refresh does not authorize social publication, activate timers or deploy the website. Installed consumers still use the original Studio checkout until the [consolidation activation](docs/REPOSITORY-CONSOLIDATION.md) is verified.

Read [the asset and artifact policy](docs/ASSETS.md), [the cleanup record](docs/REPOSITORY-CLEANUP.md) and [contribution instructions](CONTRIBUTING.md) before changing sources. Historical observations are under `docs/history/` and `studio/docs/history/`; they do not describe current runtime state.

## License

Application code uses the [MIT license](LICENSE). Bundled fonts, reference studies and media retain the licenses, ownership and rights recorded alongside them.
