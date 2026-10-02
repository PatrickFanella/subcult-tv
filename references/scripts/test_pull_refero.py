"""Focused parser, integrity and access-boundary tests; no network requests."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from urllib.robotparser import RobotFileParser

SPEC = importlib.util.spec_from_file_location('pull_refero', Path(__file__).with_name('pull_refero.py'))
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)
ID = '8b6b547f-a357-4f1b-9842-4579c62dd42b'
URL = module.BASE + '/style/' + ID


class ExportTests(unittest.TestCase):
    def test_sitemap_ignores_image_urls_and_deduplicates_pages(self):
        xml = f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>{URL}</loc><image:image><image:loc>https://images.refero.design/test.jpg</image:loc></image:image></url><url><loc>{URL}</loc></url></urlset>'
        self.assertEqual(module.sitemap_urls(xml.encode()), [URL])

    def test_markdown_preserves_entities_newlines_and_nested_code(self):
        page = '<script>"# Wrong — Style Reference\\n## Tokens"</script><pre><code># A &amp; B — Style Reference\n\n## Tokens\n```css\na &gt; b {}\n```</code></pre>'
        self.assertEqual(module.extract_markdown(page), ['# A & B — Style Reference\n\n## Tokens\n```css\na > b {}\n```\n'])

    def test_duplicate_blocks_and_non_markdown_pre_are_filtered(self):
        block = '# A — Style Reference\n## Tokens\ntext'
        self.assertEqual(module.extract_markdown(f'<pre>{block}</pre><pre>{block}</pre><pre>body {{}}</pre>'), [block + '\n'])

    def test_multiple_valid_exports_remain_distinct(self):
        first = '# A — Style Reference\n## Tokens\nshort'
        second = first + '\n## Components\nlong'
        self.assertEqual(module.extract_markdown(f'<pre>{first}</pre><pre>{second}</pre>'), [first + '\n', second + '\n'])

    def test_missing_and_truncated_exports_fail(self):
        for page in ['<html>Access denied</html>', '<pre># A — Style Reference\n## Tokens']:
            with self.subTest(page=page), self.assertRaises(ValueError):
                module.extract_markdown(page)

    def test_urls_cannot_escape_archive_or_use_api(self):
        for url in ['https://example.com/style/' + ID, module.BASE + '/api/styles', module.BASE + '/style/../../etc/passwd', URL + '?x=1']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                module.style_id(url)

    def test_robots_and_redirect_boundaries(self):
        fetcher = module.Fetcher(2, 0, 10)
        robot = RobotFileParser()
        robot.parse(['User-agent: *', 'Disallow: /style/'])
        fetcher.robot = robot
        self.assertFalse(fetcher.allowed(URL))
        self.assertFalse(fetcher.allowed(module.BASE + '/api/data'))
        self.assertFalse(fetcher.allowed('https://example.com/'))

    def test_resume_detects_changed_export_and_keeps_attribution(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            page = b'<pre># A - Style Reference\n## Tokens\ntext</pre>'
            metadata = module.save_exports(folder, URL, page, '2026-10-02T00:00:00Z', Path('.cache/page.html'), False)
            self.assertEqual(module.existing_exports(folder)['sourceUrl'], URL)
            self.assertEqual(metadata['fetchedAt'], '2026-10-02T00:00:00Z')
            (folder / 'DESIGN.md').write_text('changed')
            self.assertIsNone(module.existing_exports(folder))

    def test_primary_screenshot_ignores_related_images_and_deduplicates(self):
        image = module.IMAGE_BASE + '/styles/refero.design/image/' + ID + '.jpg'
        related = module.IMAGE_BASE + '/styles/refero.design/image/00000000-0000-0000-0000-000000000000.jpg'
        page = f'<img alt="Related site" src="{related}"><img alt="Screenshot of A" src="{image}"><img alt="Screenshot of A" src="{image}">'
        self.assertEqual(module.extract_screenshot_url(page), image)
        with self.assertRaises(ValueError):
            module.extract_screenshot_url(f'<img alt="Related site" src="{related}">')

    def test_image_error_pages_are_rejected_and_asset_hashes_checked(self):
        with self.assertRaises(ValueError):
            module.image_extension(b'<html>Access denied</html>')
        image = module.IMAGE_BASE + '/styles/refero.design/image/' + ID + '.jpg'
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            screenshot = module.save_screenshot(folder, image, b'\xff\xd8\xfftest')
            metadata = {'screenshot': screenshot}
            self.assertTrue(module.existing_screenshot(folder, metadata))
            self.assertEqual(screenshot['originalCaptureDate'], 'unknown')
            (folder / screenshot['path']).write_bytes(b'changed')
            self.assertFalse(module.existing_screenshot(folder, metadata))

    def test_image_redirects_require_approved_host_path_and_robots(self):
        fetcher = module.Fetcher(2, 0, 10)
        image = module.IMAGE_BASE + '/styles/refero.design/image/' + ID + '.jpg'
        self.assertFalse(fetcher.allowed(image))
        robot = RobotFileParser()
        robot.parse(['User-agent: *', 'Allow: /'])
        fetcher.image_robot = robot
        self.assertTrue(fetcher.allowed(image))
        self.assertFalse(fetcher.allowed('https://example.com/image.jpg'))
        self.assertFalse(fetcher.allowed(module.IMAGE_BASE + '/private/file.jpg'))


if __name__ == '__main__':
    unittest.main()
