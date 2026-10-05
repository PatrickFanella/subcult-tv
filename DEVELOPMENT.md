# SUBCULT website and Studio

This private repository holds the public [subcult.tv](https://subcult.tv) website, its authenticated admin workspace and the Studio production library. A change to a brand source and the pages that use it goes in one PR.

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
| `studio/brands/` | One folder per brand: guide, tokens, logos, social, video and product assets |
| `studio/brand-tools/` | Pack generators, shared fonts, editable masters, the starter kit and Patrick's design-system source |
| `studio/studies/` | Direction studies, logo reviews, portrait experiments and retired material, outside production exports |
| `studio/media/` | Reviewed media catalog, original files and recipes |
| `studio/references/` | Private searchable design-reference catalog and source evidence |
| `studio/content/` | Voice guide, social guidance and drafts, Patreon material |
| `studio/automation/` | Preparation jobs and tracked unit sources |
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

Studio originals stay private. Each public asset is selected by name and recorded with its source hash. Private browsing bundles are served through the authenticated API. The frontend build excludes Studio sources, and Tailwind scans only application inputs.

Preparing a draft, approving it, scheduling it, dispatching it and confirming delivery are separate steps. A source change does not authorize social publication, activate timers or deploy the website.

Read [the asset and artifact policy](docs/ASSETS.md), [the cleanup record](docs/REPOSITORY-CLEANUP.md) and [contribution instructions](CONTRIBUTING.md) before changing sources. Historical observations are under `docs/history/` and `studio/docs/history/`; they do not describe current runtime state.

## License

Application code uses the [MIT license](LICENSE). Bundled fonts, reference studies and media retain the licenses, ownership and rights recorded alongside them.
