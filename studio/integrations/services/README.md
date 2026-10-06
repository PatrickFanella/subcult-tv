# SUBCULT service branding

SUBCULT Studio's Culture / poster press identity is applied to thirteen third-party web interfaces: Jellyfin, Immich, Navidrome, qBittorrent, Sonarr, Radarr, Lidarr, Prowlarr, Whisparr, Bazarr, Authelia, Uptime Kuma and Grafana. Dash has a separate source-level integration at `/home/onnwee/Projects/subcult/dash`, revision `1fb5022554d1`.

The styles use ink `#100b19`, purple `#8b5cf6`, green `#00ff88`, paper `#f0ece4`, Space Grotesk body text, Oswald display text and JetBrains Mono system text. `build.py` copies exact selected Studio masters, preserves the font licenses and flattens the pinned local theme.park CSS imports. `vendor-provenance.json` records the upstream source commit and byte hashes; `asset-manifest.json` records the generated output.

The deployment adds a stylesheet and favicon to HTML responses at the existing service hostnames. A small Go reverse proxy serves the same-origin assets and retains the original security policy. Caddy sends browser page requests and `/_subcult/*` assets through it. Other traffic, including API calls, uploads, downloads and sockets, retains the original upstream. Existing authentication imports remain in place. Uptime Kuma's brand assets are public alongside its existing public status-page assets.

If the branding proxy is unavailable, Caddy retries GET/HEAD page requests against the original application. The application then renders its native interface. Passive failures expire after ten seconds. No inline script is added, no CSP directive is weakened, and no application database or password is changed.

This applies to web interfaces reached through the named hosts. Native clients and direct LAN application URLs use their own interfaces. Application updates may change CSS selectors, so review the rendered interfaces after upgrades. Existing app palettes may retain some semantic colors.

Build and validate:

```sh
python3 build.py
go test ./...
CGO_ENABLED=0 go build -trimpath -o brandproxy .
docker build -t local/subcult-service-branding:studio-20261003-v2 .
```

Copy `routes.example.json` to the ignored `routes.json` and fill in the upstream addresses before deploying. Keep live inventory and verification receipts in private operations storage.

The production deployment is in `/opt/server/management/subcult-branding`. Its Compose service is unprivileged, read-only, capped at 192 MiB/one CPU, and exposes its diagnostic port only on Almaz loopback. It joins the existing management, cloud and media networks. Private deployment and rollback evidence is retained in the operations vault and runtime backup directory.
