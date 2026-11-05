#!/usr/bin/env bash
set -euo pipefail
image=${1:?image is required}
docker run --rm --network none --entrypoint nginx "$image" -t
docker run --rm --network none --entrypoint sh "$image" -ec '
  test ! -e /usr/share/nginx/html/studio
  test ! -e /usr/share/nginx/html/runtime
  test ! -e /usr/share/nginx/html/.env
  test ! -e /usr/share/nginx/html/.git
'
umask 077
scratch=$(mktemp -d)
fixture=$(docker create --network none "$image")
trap 'docker rm -f "$fixture" >/dev/null; rm -rf "$scratch"' EXIT
docker start "$fixture" >/dev/null
for _attempt in {1..20}; do
  if docker exec "$fixture" wget -q -T 2 -O /dev/null http://127.0.0.1/; then
    break
  fi
  sleep 0.2
done
docker exec "$fixture" wget -q -T 2 -O /dev/null http://127.0.0.1/
for path in /admin /admin/studio; do
  docker exec "$fixture" wget -S -T 2 -O /dev/null "http://127.0.0.1$path" 2> "$scratch/headers"
  /usr/bin/grep -qi '^[[:space:]]*X-Robots-Tag:[[:space:]]*noindex' "$scratch/headers"
done
