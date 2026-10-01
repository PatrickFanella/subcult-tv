import { describe, expect, it } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { getAllPageMeta, jsonLdDocument, metaTags } from '@/lib/seo';

describe('page metadata', () => {
  const pages = getAllPageMeta();

  it('covers the static pages and every product', () => {
    const paths = pages.map((meta) => meta.path);
    expect(paths).toEqual(
      expect.arrayContaining(['/', '/products', '/about', '/contact', '/support']),
    );
    expect(paths.filter((path) => path.startsWith('/products/'))).toHaveLength(6);
  });

  it.each(pages.map((meta) => [meta.path, meta] as const))(
    '%s has a search-sized title and description and an existing image',
    (_path, meta) => {
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeGreaterThan(40);
      expect(meta.description.length).toBeLessThanOrEqual(160);
      expect(existsSync(join(process.cwd(), 'public', meta.image))).toBe(true);
    },
  );

  it('gives each product its own social image and SoftwareApplication data', () => {
    for (const meta of pages.filter((page) => page.path.startsWith('/products/'))) {
      expect(meta.image).toMatch(/^\/og\/.+\.jpg$/);
      const ld = JSON.parse(jsonLdDocument(meta)!);
      expect(ld['@graph'][0]['@type']).toBe('SoftwareApplication');
      const tags = metaTags(meta);
      expect(tags.find((tag) => tag.key === 'og:image:type')?.content).toBe('image/jpeg');
    }
  });

  it('keeps the confirmation page out of search', () => {
    const confirmed = pages.find((meta) => meta.path === '/newsletter/confirmed')!;
    expect(metaTags(confirmed).find((tag) => tag.key === 'robots')?.content).toBe(
      'noindex, nofollow',
    );
  });
});
