import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import LibraryMarkdown from '@/components/admin/LibraryMarkdown';
import Projects from '@/pages/Projects';
import { ProjectCatalogContext } from '@/context/ProjectCatalogContext';
import type { APIProject } from '@/lib/api';
vi.mock('@/lib/api', () => ({
  getDashboardStats: vi.fn().mockRejectedValue(new Error('Database unavailable')),
  getPostingDashboard: vi.fn().mockRejectedValue(new Error('Receipts unavailable')),
  getReviewDrafts: vi.fn().mockRejectedValue(new Error('Review unavailable')),
  getPublications: vi.fn().mockRejectedValue(new Error('Publications unavailable')),
}));
afterEach(cleanup);
it('shows unavailable dashboard counts and actual read failures instead of healthy status', async () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable');
  expect(screen.getByText('Preparation status is unavailable.')).toBeInTheDocument();
  expect(screen.getByText('Patreon readiness is unavailable.')).toBeInTheDocument();
  expect(screen.queryByText('CONNECTED')).not.toBeInTheDocument();
  expect(screen.queryByText('ONLINE')).not.toBeInTheDocument();
  expect(screen.getByText('Instagram drafts to review').previousElementSibling).toHaveTextContent(
    '—',
  );
});
it('renders Markdown structure while suppressing executable HTML and remote images', () => {
  const { container } = render(
    <LibraryMarkdown>
      {
        '# Usage\n\n- Keep the mark\n\n<script>alert(1)</script>\n\n![private image](https://example.com/tracker.png)'
      }
    </LibraryMarkdown>,
  );
  expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument();
  expect(screen.getByRole('listitem')).toHaveTextContent('Keep the mark');
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('img')).toBeNull();
});
it('uses approved project snapshots on public products and retains the curated roster', () => {
  const approved: APIProject[] = [
    {
      id: 'reviewed',
      cover_pattern: 'grid',
      stars: 0,
      created_at: '2026-10-04T00:00:00Z',
      updated_at: '2026-10-04T00:00:00Z',
      slug: 'clpr',
      name: 'Reviewed clip library',
      description: 'Reviewed public summary',
      type: ['software'],
      status: 'active',
      stack: [],
      topics: [],
      sort_order: 0,
      featured: true,
    },
  ];
  render(
    <MemoryRouter>
      <ProjectCatalogContext.Provider value={approved}>
        <Projects />
      </ProjectCatalogContext.Provider>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Reviewed clip library' })).toBeInTheDocument();
  expect(screen.getByText('Reviewed public summary')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Patchwork' })).toBeInTheDocument();
});
