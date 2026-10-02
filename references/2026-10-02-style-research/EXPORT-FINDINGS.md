# Programmatic DESIGN.md export — findings

Checked 2026-10-02. An ordinary script can technically enumerate and extract the public exports without running a browser for every page.

## Verified discovery and extraction

- [The sitemap index](https://styles.refero.design/sitemap.xml) points to collection and style sitemaps.
- [The style sitemap](https://styles.refero.design/sitemaps/styles.xml) contains **1,342 unique style-page URLs**. Count direct `url/loc` elements: image metadata also has `loc` elements, so counting every descendant would incorrectly double the count to 2,684.
- A sampled [Slush style page](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b) returns public HTML containing a `pre` element, Markdown headings and the style-reference text. No login was needed for that sample.
- The gallery's search uses public URLs such as `/?q=Y2K`. Search returns broad associations; relevance still needs review.

This proves a workable public-page extraction route for the sampled export. It does not prove that every page has identical markup or that the sitemap covers the advertised full catalog.

## Script identity and crawl rules

The fetched [robots.txt](https://styles.refero.design/robots.txt) disallows several named AI crawlers, including GPTBot. Its general `User-Agent: *` group allows `/` and disallows `/api/`, `/admin/`, `/extract/` and `/playground/`. A normal downloader should identify itself honestly, follow the applicable public-page rules and avoid those excluded routes. Replacing a crawler with a script is not a reason to spoof its identity or bypass access controls.

## Recommended archive behavior

1. Record the sitemap and retrieval date, then deduplicate page URLs by style ID.
2. Fetch public pages slowly, cache responses and back off on rate limits or server failures.
3. Parse the intended Markdown block and validate its heading/content. Report missing or ambiguous blocks rather than saving the whole HTML as DESIGN.md.
4. Store each export beside its source URL, style ID, timestamp and content hash. If compact and extended exports are both present, keep them separately rather than combining them.
5. Maintain a manifest of successes and failures so interrupted runs can resume.
6. Compare the saved set with additional public discovery routes before calling it complete. Label a sitemap-only archive accordingly.

[The implemented downloader](../scripts/README.md) uses these findings and also saves the primary displayed screenshot. It has passed offline parsing/integrity checks and a live single-entry resume trial. The agent has not run a bulk pull. The selected research remains separate from the downloader's `refero-archive/` output.
