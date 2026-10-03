# Refero public export downloader

`pull_refero.py` uses the Python standard library. It checks the current robots rules, discovers public style pages from the sitemap, extracts validated Markdown blocks from their HTML and downloads each displayed reference screenshot. It does not access private APIs or use browser automation.

From the repository root:

```bash
cd studio/references
python scripts/pull_refero.py --dry-run
python scripts/pull_refero.py --limit 3
python scripts/pull_refero.py
```

The final command selects every URL in the cached public style sitemap. The default archive is `refero-archive/`, separate from the original research collections. Rerun the same command to resume: completed files with matching hashes are skipped, and cached HTML can finish extraction without another page request. An existing Markdown-only archive is upgraded with screenshots without re-downloading valid Markdown. Ctrl+C preserves completed exports. A file lock prevents two processes from writing the same archive concurrently.

At the observed 1,342 pages and the default two-second interval, request spacing alone is roughly 90 minutes for pages plus screenshots, or 45 minutes with `--no-images`. Network time and retries can extend the run. The script prints progress for every selected page and writes the manifest after each success or failure.

## Output

```text
refero-archive/
  README.md
  manifest.json
  styles/<style-id>/
    DESIGN.md
    screenshot.jpg
    metadata.json
  .cache/
    robots.txt
    styles.xml
    <style-id>.html
    <style-id>.json
```

Each metadata file records the source URL, retrieval and extraction dates, page hash and export hashes. Screenshot metadata includes its displayed CDN URL, retrieval date, size and hash; the original screenshot capture date stays unknown. The filename extension is detected from image bytes, so PNG, WebP, GIF and AVIF are also supported. Related-site cards and icons are excluded: the parser selects the primary image labeled “Screenshot of …”. An absent or ambiguous primary image is reported rather than replaced with another asset.

Additional distinct Markdown blocks are saved as `DESIGN.2.md`, etc.; the script does not invent compact/extended labels for unlabelled blocks. The default public HTML may expose only one export variant. Fonts, unrelated media, tokens in other export tabs and authenticated content are outside this downloader's scope.

The manifest records successful and failed style IDs, selected/discovered counts, per-run outcomes and the coverage boundary. A sitemap archive is not proof of all systems advertised on the homepage. Raw HTML and download locks are ignored by Git; Markdown exports and provenance remain available to commit deliberately.

## Useful options

```bash
# Refresh discovery while preserving completed page exports.
python scripts/pull_refero.py --refresh-sitemap

# Re-fetch one specific public entry, replacing its saved default export.
python scripts/pull_refero.py --url https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b --refresh

# Use a different destination and a slower request interval.
python scripts/pull_refero.py --output /path/to/archive --delay 5

# Skip screenshots when only Markdown is needed.
python scripts/pull_refero.py --no-images
```

`--refresh` refetches all selected pages. Without it, the archive is a resumable dated snapshot; it does not silently update existing exports. `--refresh-sitemap` refreshes only discovery. `--limit` selects the first N URLs, including previously completed entries. To continue after a three-page trial, omit `--limit`.

Network timeouts, HTTP 429 and server errors use bounded retries. Retry-After is honored when supplied. Permanent failures are recorded and the run continues. Missing or ambiguous Markdown blocks fail rather than saving an error page as a document. Screenshot failures preserve the Markdown and record a `partial` status; rerunning retries missing/invalid assets. Exit codes: 0 for success/dry run, 1 when some pages or screenshots failed, 2 for setup/discovery errors, and 130 for interruption. Review failures in `manifest.json`; use a targeted `--url ... --refresh` to retry a bad cached response.

The downloader identifies itself as `DesignReferencesDownloader/1.0`. It checks robots rules for both the public page host and image CDN, and refuses redirects outside the permitted routes. The archived guides and screenshots remain attributed third-party references, separate from the repository's original analyses.

## Verification

```bash
python scripts/test_pull_refero.py
```

Eleven offline checks cover sitemap image filtering, Markdown/entity preservation, duplicate and multiple blocks, invalid/truncated responses, URL and robots boundaries, export integrity, primary-image selection and screenshot integrity. A live one-page sequence verified Markdown-only extraction, adding its missing screenshot, asset hashes and a repeat run skipping both. The temporary archive was removed. The full download has not been run by the agent.
