import { describe, expect, it } from 'vitest';
import { getAllPageMeta, jsonLdDocument, metaTags } from '@/lib/seo';
import { getShowcaseProducts } from '@/lib/showcase';

// Files in public/, keyed like '../../public/og/clpr.jpg'.
const publicImages = new Set(
  Object.keys(import.meta.glob('../../public/**/*.{png,jpg}')).map((key) =>
    key.replace('../../public', ''),
  ),
);

describe('page metadata', () => {
  const pages = getAllPageMeta();

  it('covers the static pages and every product', () => {
    const paths = pages.map((meta) => meta.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/products',
        '/about',
        '/contact',
        '/privacy',
        '/support',
        '/newsletter',
      ]),
    );
    expect(paths.filter((path) => path.startsWith('/products/'))).toHaveLength(
      getShowcaseProducts({ includeUnlisted: true }).length,
    );
  });

  it.each(pages.map((meta) => [meta.path, meta] as const))(
    '%s has a search-sized title and description and an existing image',
    (_path, meta) => {
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeGreaterThan(40);
      expect(meta.description.length).toBeLessThanOrEqual(160);
      expect(publicImages.has(meta.image)).toBe(true);
    },
  );

  it('gives each product an existing social image and SoftwareApplication data', () => {
    for (const meta of pages.filter((page) => page.path.startsWith('/products/'))) {
      expect(publicImages.has(meta.image)).toBe(true);
      const ld = JSON.parse(jsonLdDocument(meta)!);
      expect(ld['@graph'][0]['@type']).toBe('SoftwareApplication');
      const breadcrumbs = ld['@graph'].find(
        (entry: Record<string, unknown>) => entry['@type'] === 'BreadcrumbList',
      );
      expect(breadcrumbs.itemListElement.at(-1).item).toBe(`https://subcult.tv${meta.path}`);
      const tags = metaTags(meta);
      expect(tags.find((tag) => tag.key === 'og:image:type')?.content).toBe(
        meta.image.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
      );
    }
  });

  it('keeps the confirmation page out of search', () => {
    const confirmed = pages.find((meta) => meta.path === '/newsletter/confirmed')!;
    expect(metaTags(confirmed).find((tag) => tag.key === 'robots')?.content).toBe(
      'noindex, nofollow',
    );
  });
});
