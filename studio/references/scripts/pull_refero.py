#!/usr/bin/env python3
"""Archive public Refero DESIGN.md exports and reference screenshots; standard library only."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

BASE = 'https://styles.refero.design'
SITEMAP = BASE + '/sitemaps/styles.xml'
USER_AGENT = 'DesignReferencesDownloader/1.0 (public DESIGN.md archive)'
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / 'refero-archive'
MAX_RESPONSE = 10 * 1024 * 1024
STYLE_PATH = re.compile(r'^/style/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})/?$')
IMAGE_BASE = 'https://images.refero.design'
IMAGE_PATH = re.compile(r'^/styles/refero\.design/image/[0-9a-f-]+\.(?:jpe?g|png|webp|avif|gif)$')


def timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + '.tmp')
    with temporary.open('wb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    temporary.replace(path)


def write_json(path: Path, data: object) -> None:
    atomic_write(path, (json.dumps(data, indent=2, ensure_ascii=False) + '\n').encode())


def style_id(url: str) -> str:
    parsed = urlparse(url)
    match = STYLE_PATH.fullmatch(parsed.path)
    if parsed.scheme != 'https' or parsed.netloc != 'styles.refero.design' or parsed.query or parsed.fragment or not match:
        raise ValueError(f'Expected a public {BASE}/style/<uuid> URL: {url}')
    return match.group(1)


def sitemap_urls(xml: bytes) -> list[str]:
    root = ET.fromstring(xml)
    if root.tag.rsplit('}', 1)[-1] != 'urlset':
        raise ValueError('Expected a style urlset, not a sitemap index')
    result = []
    # Only direct url/loc entries: image:loc is not another style page.
    for entry in root:
        if entry.tag.rsplit('}', 1)[-1] != 'url':
            continue
        for child in entry:
            if child.tag.rsplit('}', 1)[-1] == 'loc':
                url = (child.text or '').strip()
                style_id(url)
                result.append(url.rstrip('/'))
                break
    if not result:
        raise ValueError('No public style URLs found in the sitemap')
    return list(dict.fromkeys(result))


class MarkdownBlocks(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_pre = False
        self.parts: list[str] = []
        self.blocks: list[str] = []
        self.screenshots: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == 'img':
            attributes = dict(attrs)
            src = attributes.get('src') or ''
            if (attributes.get('alt') or '').lower().startswith('screenshot of ') and public_image_url(src):
                self.screenshots.append(src)
        if tag == 'pre':
            if self.in_pre:
                raise ValueError('Nested pre elements; export markup is ambiguous')
            self.in_pre = True
            self.parts = []
        elif self.in_pre and tag == 'br':
            self.parts.append('\n')

    def handle_endtag(self, tag: str) -> None:
        if tag == 'pre' and self.in_pre:
            self.blocks.append(''.join(self.parts))
            self.in_pre = False

    def handle_data(self, data: str) -> None:
        if self.in_pre:
            self.parts.append(data)


def extract_markdown(page: str) -> list[str]:
    parser = MarkdownBlocks()
    parser.feed(page)
    parser.close()
    if parser.in_pre:
        raise ValueError('Unclosed Markdown block; response may be truncated')
    result = []
    for block in parser.blocks:
        candidate = block.strip()
        if candidate.startswith('# ') and ('Style Reference' in candidate.splitlines()[0] or '\n## Tokens' in candidate) and '\n## ' in candidate:
            candidate += '\n'
            if candidate not in result:
                result.append(candidate)
    if not result:
        raise ValueError('No validated DESIGN.md block found; inspect cached HTML before retrying')
    return result


def public_image_url(url: str) -> bool:
    parsed = urlparse(url)
    return bool(parsed.scheme == 'https' and parsed.netloc == 'images.refero.design' and not parsed.query and not parsed.fragment and IMAGE_PATH.fullmatch(parsed.path))


def extract_screenshot_url(page: str) -> str:
    parser = MarkdownBlocks()
    parser.feed(page)
    parser.close()
    candidates = list(dict.fromkeys(parser.screenshots))
    if len(candidates) != 1:
        raise ValueError(f'Expected one unique primary screenshot, found {len(candidates)}; related-card images are not substituted')
    return candidates[0]


def image_extension(data: bytes) -> str:
    if data.startswith(b'\xff\xd8\xff'):
        return 'jpg'
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    if data[:6] in (b'GIF87a', b'GIF89a'):
        return 'gif'
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        return 'webp'
    if data[4:8] == b'ftyp' and any(brand in data[8:32] for brand in (b'avif', b'avis')):
        return 'avif'
    raise ValueError('Screenshot response is not a recognized image; refusing to save an HTML/error response as an asset')


def existing_screenshot(folder: Path, metadata: dict) -> bool:
    screenshot = metadata.get('screenshot', {})
    name = screenshot.get('path', '')
    if not re.fullmatch(r'screenshot\.(jpg|png|gif|webp|avif)', name):
        return False
    path = folder / name
    return path.is_file() and digest(path.read_bytes()) == screenshot.get('sha256')


def save_screenshot(folder: Path, url: str, data: bytes) -> dict:
    if not public_image_url(url):
        raise ValueError('Screenshot source is outside the public Refero image route')
    extension = image_extension(data)
    name = 'screenshot.' + extension
    atomic_write(folder / name, data)
    return {'path': name, 'sourceUrl': url, 'fetchedAt': timestamp(), 'sha256': digest(data), 'bytes': len(data),
            'originalCaptureDate': 'unknown', 'kind': 'Refero-supplied reference screenshot, not a new live-site capture'}


def retry_delay(value: str | None, attempt: int) -> float:
    if value:
        try:
            return max(0, float(value))
        except ValueError:
            try:
                parsed = parsedate_to_datetime(value)
                return max(0, parsed.timestamp() - time.time())
            except (ValueError, TypeError, OverflowError):
                pass
    return min(60, 2 ** (attempt + 1))


class PublicRedirects(HTTPRedirectHandler):
    def __init__(self, allowed):
        self.allowed = allowed

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not self.allowed(newurl):
            raise ValueError(f'Redirect outside permitted public Refero routes: {newurl}')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class Fetcher:
    def __init__(self, delay: float, retries: int, timeout: float) -> None:
        self.delay, self.retries, self.timeout = delay, retries, timeout
        self.last_request = 0.0
        self.robot: RobotFileParser | None = None
        self.image_robot: RobotFileParser | None = None
        self.opener = build_opener(PublicRedirects(self.allowed))

    def allowed(self, url: str) -> bool:
        parsed = urlparse(url)
        if parsed.netloc == 'images.refero.design':
            if url == IMAGE_BASE + '/robots.txt':
                return True
            return bool(public_image_url(url) and self.image_robot is not None and self.image_robot.can_fetch(USER_AGENT, url))
        public = parsed.scheme == 'https' and parsed.netloc == 'styles.refero.design' and not parsed.query and not parsed.fragment
        public = public and (parsed.path in ['/robots.txt', '/sitemaps/styles.xml'] or bool(STYLE_PATH.fullmatch(parsed.path)))
        return bool(public and (self.robot is None or self.robot.can_fetch(USER_AGENT, url)))

    def fetch(self, url: str) -> bytes:
        if not self.allowed(url):
            raise ValueError(f'URL is outside public routes or denied by robots.txt: {url}')
        for attempt in range(self.retries + 1):
            time.sleep(max(0, self.delay - (time.monotonic() - self.last_request)))
            self.last_request = time.monotonic()
            try:
                accept = 'image/*' if public_image_url(url) else 'text/html, application/xml, text/plain'
                request = Request(url, headers={'User-Agent': USER_AGENT, 'Accept': accept})
                with self.opener.open(request, timeout=self.timeout) as response:
                    data = response.read(MAX_RESPONSE + 1)
                    if len(data) > MAX_RESPONSE:
                        raise ValueError('Response exceeds 10 MiB; refusing truncated extraction')
                    return data
            except HTTPError as error:
                retry = error.code == 429 or 500 <= error.code <= 599
                if not retry or attempt == self.retries:
                    raise
                delay = retry_delay(error.headers.get('Retry-After'), attempt)
                error.close()
                print(f'HTTP {error.code}; retrying in {delay:.0f}s', file=sys.stderr, flush=True)
                time.sleep(delay)
            except (URLError, TimeoutError):
                if attempt == self.retries:
                    raise
                delay = retry_delay(None, attempt)
                print(f'Network error; retrying in {delay:.0f}s', file=sys.stderr, flush=True)
                time.sleep(delay)
        raise RuntimeError('Retry loop ended unexpectedly')


def existing_exports(folder: Path) -> dict | None:
    path = folder / 'metadata.json'
    if not path.is_file():
        return None
    metadata = json.loads(path.read_text(encoding='utf-8'))
    exports = metadata.get('exports', [])
    if not exports:
        return None
    for export in exports:
        name = export.get('path', '')
        if not re.fullmatch(r'DESIGN(?:\.\d+)?\.md', name):
            return None
        file = folder / name
        if not file.is_file() or digest(file.read_bytes()) != export['sha256']:
            return None
    return metadata


def save_exports(folder: Path, url: str, page: bytes, fetched_at: str, cache: Path, cached: bool) -> dict:
    blocks = extract_markdown(page.decode('utf-8'))
    exports = []
    for index, block in enumerate(blocks):
        name = 'DESIGN.md' if index == 0 else f'DESIGN.{index + 1}.md'
        content = block.encode('utf-8')
        atomic_write(folder / name, content)
        exports.append({'path': name, 'sha256': digest(content), 'bytes': len(content), 'variant': 'server-rendered; compact/extended identity not inferred'})
    metadata = {'styleId': style_id(url), 'sourceUrl': url, 'fetchedAt': fetched_at, 'extractedAt': timestamp(),
                'userAgent': USER_AGENT, 'title': blocks[0].splitlines()[0].removeprefix('# '),
                'htmlSha256': digest(page), 'cache': str(cache), 'usedCachedHTML': cached, 'exports': exports,
                'scope': 'Public server-rendered export only; interpreted third-party reference, not an official source design system.'}
    write_json(folder / 'metadata.json', metadata)
    return metadata


def positive_float(value: str) -> float:
    number = float(value)
    if number <= 0 or not number < float('inf'):
        raise argparse.ArgumentTypeError('must be finite and greater than zero')
    return number


def nonnegative_int(value: str) -> int:
    number = int(value)
    if number < 0:
        raise argparse.ArgumentTypeError('must be zero or greater')
    return number


def arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=DEFAULT_OUTPUT, help='archive directory (default: repository/refero-archive)')
    parser.add_argument('--limit', type=nonnegative_int, default=0, help='select the first N URLs; 0 selects all sitemap URLs')
    parser.add_argument('--url', action='append', default=[], help='explicit public style URL; repeat to select multiple pages instead of sitemap')
    parser.add_argument('--delay', type=positive_float, default=2.0, help='minimum seconds between requests (default: 2)')
    parser.add_argument('--timeout', type=positive_float, default=30.0, help='network timeout in seconds (default: 30)')
    parser.add_argument('--retries', type=nonnegative_int, default=3, help='retries for network/429/5xx errors (default: 3)')
    parser.add_argument('--refresh', action='store_true', help='refetch selected pages even when archived or cached')
    parser.add_argument('--refresh-sitemap', action='store_true', help='fetch a new sitemap instead of using its cache')
    parser.add_argument('--no-images', action='store_true', help='archive Markdown only; screenshots are downloaded by default')
    parser.add_argument('--dry-run', action='store_true', help='check robots and discover URLs; do not create or change archive files')
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = arguments(argv)
    output = args.output.expanduser().resolve()
    lock = None
    if not args.dry_run:
        output.mkdir(parents=True, exist_ok=True)
        import fcntl
        lock = (output / '.download.lock').open('a+')
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('Another downloader holds this output directory; use a different --output or wait for it.', file=sys.stderr)
            lock.close()
            return 2
    try:
        fetcher = Fetcher(args.delay, args.retries, args.timeout)
        robots = fetcher.fetch(BASE + '/robots.txt')
        robot = RobotFileParser(BASE + '/robots.txt')
        robot.parse(robots.decode('utf-8').splitlines())
        fetcher.robot = robot
        crawl_delay = robot.crawl_delay(USER_AGENT)
        if crawl_delay:
            fetcher.delay = max(fetcher.delay, crawl_delay)
        if args.url:
            urls = list(dict.fromkeys(url.rstrip('/') for url in args.url))
            for url in urls:
                style_id(url)
            sitemap = None
            sitemap_cached = False
        else:
            cached_sitemap = output / '.cache' / 'styles.xml'
            sitemap_cached = cached_sitemap.is_file() and not args.refresh_sitemap
            sitemap = cached_sitemap.read_bytes() if sitemap_cached else fetcher.fetch(SITEMAP)
            urls = sitemap_urls(sitemap)
        discovered = len(urls)
        if args.limit:
            urls = urls[:args.limit]
        for url in urls:
            if not fetcher.allowed(url):
                raise ValueError(f'Public style URL denied by robots.txt: {url}')
        print(f'Discovered {discovered}; selected {len(urls)}. Output: {output}', flush=True)
        if args.dry_run:
            for url in urls[:5]:
                print(url)
            print('Dry run: no archive files changed. Discovery is sitemap-only, not proof of the full advertised catalog.')
            return 0
        cache_root = output / '.cache'
        atomic_write(cache_root / 'robots.txt', robots)
        if not args.no_images:
            try:
                image_robots = fetcher.fetch(IMAGE_BASE + '/robots.txt')
            except HTTPError as error:
                if error.code not in (404, 410):
                    raise
                # An absent robots file imposes no rules; other failures stop discovery.
                image_robots = b'User-agent: *\nAllow: /\n'
                error.close()
            image_robot = RobotFileParser(IMAGE_BASE + '/robots.txt')
            image_robot.parse(image_robots.decode('utf-8').splitlines())
            fetcher.image_robot = image_robot
            crawl_delay = image_robot.crawl_delay(USER_AGENT)
            if crawl_delay:
                fetcher.delay = max(fetcher.delay, crawl_delay)
            atomic_write(cache_root / 'image-robots.txt', image_robots)
        if sitemap is not None:
            atomic_write(cache_root / 'styles.xml', sitemap)
        manifest_path = output / 'manifest.json'
        manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {'schema': 1, 'styles': {}}
        manifest.update({'source': BASE, 'sitemap': SITEMAP if sitemap is not None else None, 'userAgent': USER_AGENT,
                         'scope': 'Sitemap-listed or explicitly selected public exports; full catalog coverage is unverified.',
                         'runStartedAt': timestamp(), 'discoveredURLs': discovered, 'selectedURLs': len(urls), 'usedCachedSitemap': sitemap_cached})
        manifest['screenshotsRequested'] = not args.no_images
        counts: Counter = Counter()
        atomic_write(output / 'README.md', b'# Refero export archive\n\nAttributed third-party DESIGN.md exports and Refero-supplied reference screenshots. See manifest.json for coverage and failures, and styles/<id>/metadata.json for source URLs, retrieval dates and hashes. These are normalized, interpreted references, not official production design systems. Screenshot retrieval dates do not establish their original capture dates.\n')
        for index, url in enumerate(urls, start=1):
            sid = style_id(url)
            folder = output / 'styles' / sid
            cache = cache_root / (sid + '.html')
            cache_metadata = cache.with_suffix('.json')
            try:
                page = None
                existing = existing_exports(folder) if not args.refresh else None
                if existing and not args.refresh:
                    metadata = existing
                    outcome = 'skipped'
                else:
                    cached = cache.is_file() and cache_metadata.is_file() and not args.refresh
                    if cached:
                        page = cache.read_bytes()
                        cached_info = json.loads(cache_metadata.read_text(encoding='utf-8'))
                        if digest(page) != cached_info['sha256'] or cached_info['sourceUrl'] != url:
                            raise ValueError('Cached HTML identity/hash mismatch; rerun with --refresh')
                        fetched_at = cached_info['fetchedAt']
                    else:
                        page = fetcher.fetch(url)
                        fetched_at = timestamp()
                        atomic_write(cache, page)
                        write_json(cache_metadata, {'sourceUrl': url, 'fetchedAt': fetched_at, 'sha256': digest(page)})
                    metadata = save_exports(folder, url, page, fetched_at, cache.relative_to(output), cached)
                    outcome = 'cached' if cached else 'downloaded'
                asset_error = None
                asset_outcome = 'not requested'
                if not args.no_images:
                    try:
                        if existing_screenshot(folder, metadata) and not args.refresh:
                            asset_outcome = 'screenshot skipped'
                        else:
                            image_url = metadata.get('screenshot', {}).get('sourceUrl')
                            if not image_url:
                                if page is None:
                                    if cache.is_file() and digest(cache.read_bytes()) == metadata['htmlSha256']:
                                        page = cache.read_bytes()
                                    else:
                                        page = fetcher.fetch(url)
                                        fetched_at = timestamp()
                                        atomic_write(cache, page)
                                        write_json(cache_metadata, {'sourceUrl': url, 'fetchedAt': fetched_at, 'sha256': digest(page)})
                                image_url = extract_screenshot_url(page.decode('utf-8'))
                            image_data = fetcher.fetch(image_url)
                            metadata['screenshot'] = save_screenshot(folder, image_url, image_data)
                            metadata.pop('screenshotError', None)
                            write_json(folder / 'metadata.json', metadata)
                            counts['screenshotsDownloaded'] += 1
                            asset_outcome = 'screenshot downloaded'
                    except (ValueError, KeyError, OSError, HTTPError, URLError) as error:
                        asset_error = str(error)
                        metadata['screenshotError'] = {'checkedAt': timestamp(), 'error': asset_error}
                        write_json(folder / 'metadata.json', metadata)
                        counts['partial'] += 1
                        asset_outcome = 'SCREENSHOT FAILED'
                        print(f'[{index}/{len(urls)}] screenshot failure: {asset_error}', file=sys.stderr, flush=True)
                manifest['styles'][sid] = {'status': 'partial' if asset_error else 'success', 'sourceUrl': url,
                                           'metadata': str((folder / 'metadata.json').relative_to(output)),
                                           'exports': metadata['exports'], 'screenshot': metadata.get('screenshot'), 'checkedAt': timestamp()}
                if asset_error:
                    manifest['styles'][sid]['screenshotError'] = asset_error
                counts[outcome] += 1
                print(f'[{index}/{len(urls)}] {outcome}; {asset_outcome}: {metadata["title"]}', flush=True)
            except (ValueError, KeyError, OSError, HTTPError, URLError) as error:
                counts['failed'] += 1
                manifest['styles'][sid] = {'status': 'failed', 'sourceUrl': url, 'checkedAt': timestamp(), 'error': str(error)}
                print(f'[{index}/{len(urls)}] FAILED {sid}: {error}', file=sys.stderr, flush=True)
            manifest['updatedAt'] = timestamp()
            manifest['runCounts'] = dict(counts)
            write_json(manifest_path, manifest)
        manifest['runCompletedAt'] = timestamp()
        write_json(manifest_path, manifest)
        print(json.dumps({'run': dict(counts), 'archive': dict(Counter(s['status'] for s in manifest['styles'].values()))}), flush=True)
        return 1 if counts['failed'] or counts['partial'] else 0
    except KeyboardInterrupt:
        print('\nInterrupted. Completed exports are preserved; rerun the same command to resume.', file=sys.stderr)
        return 130
    except (ValueError, OSError, HTTPError, URLError, ET.ParseError) as error:
        print(f'Downloader stopped: {error}', file=sys.stderr)
        return 2
    finally:
        if lock is not None:
            lock.close()


if __name__ == '__main__':
    raise SystemExit(main())
