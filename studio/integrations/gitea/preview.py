#!/usr/bin/env python3
"""Loopback-only anonymous Gitea theme review; never forwards mutations."""
import argparse
import mimetypes
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, unquote
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "custom/public/assets"


class Preview(BaseHTTPRequestHandler):
    def respond(self, data, content_type, status=200):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if path == "/__subcult/specimen":
            with urlopen(self.server.upstream + "/", timeout=20) as response:
                home = response.read().decode()
            stylesheet = re.search(r'href="(/assets/css/index\.[^"]+)"', home)[1]
            html = ('<!doctype html><html lang="en" data-theme="subcult-studio"><head>'
                    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                    '<title>SUBCULT / Studio — review fixtures</title>'
                    f'<link rel="stylesheet" href="{stylesheet}">'
                    '<link rel="stylesheet" href="/assets/css/theme-subcult-studio.css"></head><body>'
                    + (HERE / "specimen.html").read_text() + '</body></html>')
            self.respond(html.encode(), "text/html; charset=utf-8")
            return
        if path.startswith("/assets/subcult-studio/") or path in (
            "/assets/css/theme-subcult-theme.css", "/assets/css/theme-subcult-studio.css"
        ):
            local = (ASSETS / path.removeprefix("/assets/")).resolve()
            if path.startswith("/assets/css/"):
                local = ASSETS / "css/theme-subcult-studio.css"
            if not local.is_relative_to(ASSETS.resolve()) or not local.is_file():
                self.send_error(404)
                return
            self.respond(local.read_bytes(), mimetypes.guess_type(local)[0] or "application/octet-stream")
            return
        try:
            request = Request(self.server.upstream + self.path, headers={"Host": "git.subcult.tv"})
            with urlopen(request, timeout=20) as response:
                data = response.read()
                content_type = response.headers.get("Content-Type", "application/octet-stream")
                if "text/html" in content_type:
                    text = data.decode().replace('data-theme="subcult-theme"', 'data-theme="subcult-studio"')
                    text = text.replace("https://git.subcult.tv/", "/")
                    data = text.encode()
                self.respond(data, content_type, response.status)
        except HTTPError as exc:
            self.respond(exc.read(), exc.headers.get("Content-Type", "text/plain"), exc.code)
        except (URLError, TimeoutError):
            self.send_error(502, "Anonymous Gitea upstream unavailable")

    def log_message(self, format, *args):
        # Request URLs may contain sensitive query parameters; log only status.
        pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upstream", required=True)
    parser.add_argument("--port", type=int, default=18771)
    args = parser.parse_args()
    upstream = urlsplit(args.upstream)
    if upstream.scheme != "http" or upstream.username or upstream.password or upstream.path not in ("", "/"):
        parser.error("Use an HTTP container origin without credentials or a path")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Preview)
    server.upstream = args.upstream.rstrip("/")
    print(f"SUBCULT review: http://127.0.0.1:{args.port}/ (anonymous, GET only)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
