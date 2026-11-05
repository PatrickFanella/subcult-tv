# Public-site CI deployment

The Gitea workflow keeps the existing frontend, backend, API-image and Studio
checks. All four must pass before the public-site image job runs. Pull requests
build and check that image; a verified push to Gitea `main` also deploys it to the
existing `subcult-tv-frontend` service on NUC. Manual dispatch retries the current
main commit and reuses an immutable image already accepted by the host.

The deployment job checks out the exact revision and fetches `public/**` LFS
objects through the job's repository credential. The existing Studio job checks
approved public-asset provenance first. The frontend Dockerfile copies selected
application/public inputs; `.dockerignore` excludes Studio, runtime state and
environment files. CI checks that the resulting public tree contains no Studio
source directory, runtime directory, `.env` or `.git` directory.

The image check also starts nginx without a network connection and requests
`/admin` and `/admin/studio`. Both must serve the application shell with
`X-Robots-Tag: noindex`. The admin `try_files` rule keeps that fallback in the
admin location so an internal redirect cannot discard its header.

The production build explicitly leaves `VITE_API_URL` empty, retaining same-origin
API requests. The app-scoped host profile retains the frontend's existing
networks, private listener, restart policy and runtime configuration. It resolves
only a reviewed frontend baseline, without reading the API's environment file.

`HOMELAB_DEPLOY_KEY` can invoke only the pinned fleet receiver and this app's
profile. `HOMELAB_KNOWN_HOSTS` pins NUC's host key. The operator owns those secrets
and their rotation; application/runtime credentials stay on NUC. Deployment
steps run only on this Gitea instance and on `main` push/manual-dispatch events.

The receiver accepts only the current main revision and matching image labels,
retains the previous image, checks the existing runtime configuration and verifies
public readiness after activation. Failed activation/readiness restores the
previous image and keeps private host diagnostics. CI then compares live root
HTML with the accepted image. A host-local receipt records the exact image and
rollback command under `~/.local/state/fleet-deploy/subcult-tv/releases/`.

This lane updates the public frontend. The Go API, database, authenticated Studio
source/data delivery and installed preparation jobs retain their existing release
procedures. It does not update their images, migrate data, install preparation
bundles or authorize social publication. The publication hold in the historical
release record remains in force.
