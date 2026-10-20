import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import Footer from '@/components/Footer';
import { getCuratedProjects } from '@/lib/project-catalog';
import { PRODUCT_SUPPORT } from '@/lib/product-support';

afterEach(cleanup);

it('covers every catalog product with a studio support explanation', () => {
  for (const project of getCuratedProjects()) {
    expect(PRODUCT_SUPPORT[project.slug], project.slug).toContain('SUBCULT');
  }
});

it.each(['/support', '/products/patchwork', '/missing-page'])(
  'keeps the footer quiet on %s',
  (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('heading', { name: 'Help build the next release.' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Support SUBCULT' })).toHaveAttribute(
      'href',
      '/support',
    );
  },
);
