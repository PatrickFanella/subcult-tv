import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminReferences from '@/pages/admin/AdminReferences';
import {
  getStudioPreview,
  getStudioReference,
  getStudioReferenceFacets,
  getStudioReferences,
} from '@/lib/api';

vi.mock('@/lib/api', () => ({
  getStudioAsset: vi.fn(),
  getStudioPreview: vi.fn(),
  getStudioReferences: vi.fn(),
  getStudioReferenceFacets: vi.fn(),
  getStudioReference: vi.fn(),
}));

const entry = {
  id: 'study-alpha',
  name: 'Alpha',
  url: 'https://example.invalid',
  collection: 'Style studies',
  summary: 'A quiet typographic reference.',
  preview: '',
  tags: ['Swiss', 'Minimalist'],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStudioReferences).mockResolvedValue({
    items: [entry],
    total: 25,
    page: 1,
    per_page: 24,
    total_pages: 2,
  });
  vi.mocked(getStudioReferenceFacets).mockResolvedValue({
    tags: [
      { name: 'Swiss', count: 1 },
      { name: 'Minimalist', count: 1 },
    ],
    collections: [{ name: 'Style studies', count: 1 }],
  });
  vi.mocked(getStudioReference).mockResolvedValue({
    ...entry,
    guide:
      '# Alpha\n\n| Font | Role |\n| --- | --- |\n| Helvetica | Heading |\n\n<script>window.untrusted=true</script>',
    images: [],
    attachments: [],
    provenance: { limits: 'Single desktop state.' },
  });
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
});

describe('design reference browsing', () => {
  it('uses collection pages and keeps their scope when clearing search filters', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/studio/references/styles?q=font&page=2&view=list']}>
        <Routes>
          <Route path="/admin/studio/references/:section" element={<AdminReferences />} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('table');
    expect(screen.getByRole('heading', { level: 1, name: 'Style studies' })).toBeInTheDocument();
    expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('collection')).toBe(
      'Style studies',
    );
    expect(screen.queryByRole('combobox', { name: 'Collection' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('q')).toBe(''),
    );
    expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('collection')).toBe(
      'Style studies',
    );
    expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('page')).toBe('1');
    await user.click(screen.getByRole('link', { name: /Web history/ }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('collection')).toBe(
        'Web history',
      ),
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Web history' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('opens table documents without fetching previews for list rows', async () => {
    vi.mocked(getStudioReferences).mockResolvedValue({
      items: [{ ...entry, preview: 'private-preview' }],
      total: 1,
      page: 1,
      per_page: 24,
      total_pages: 1,
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/studio/references?view=list']}>
        <AdminReferences />
      </MemoryRouter>,
    );
    await screen.findByRole('table');
    expect(getStudioPreview).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Read Alpha' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close reference' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows pagination before the cards and waits for visible thumbnails', async () => {
    let visible: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          visible = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    vi.mocked(getStudioReferences).mockResolvedValue({
      items: [{ ...entry, preview: 'preview-a' }],
      total: 25,
      page: 1,
      per_page: 24,
      total_pages: 2,
    });
    vi.mocked(getStudioPreview).mockResolvedValue(new Blob(['image']));
    const create = vi.fn(() => 'blob:preview');
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }));
    try {
      const { container } = render(
        <MemoryRouter>
          <AdminReferences />
        </MemoryRouter>,
      );
      await screen.findByRole('button', { name: 'Read Alpha' });
      const pagination = screen.getByRole('navigation', { name: 'Reference pages' });
      const cards = container.querySelector('.reference-cards')!;
      expect(
        pagination.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.getByRole('combobox', { name: 'Page' })).toHaveValue('1');
      await waitFor(() => expect(visible).toBeTypeOf('function'));
      expect(getStudioPreview).not.toHaveBeenCalled();
      visible!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      await screen.findByRole('img', { name: 'Alpha reference screenshot' });
      expect(getStudioPreview).toHaveBeenCalledOnce();
      await userEvent.setup().selectOptions(screen.getByRole('combobox', { name: 'Page' }), '2');
      await waitFor(() =>
        expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('page')).toBe('2'),
      );
    } finally {
      cleanup();
      vi.unstubAllGlobals();
    }
  });
  it('keeps search, AND tags, and page changes in the request while switching views locally', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter initialEntries={['/admin/studio/references']}>
        <AdminReferences />
      </MemoryRouter>,
    );
    await screen.findByRole('button', { name: 'Read Alpha' });
    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(container.querySelector('.reference-list')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Reference' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Collection' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open source for Alpha' })).toHaveAttribute(
      'href',
      entry.url,
    );
    await user.type(screen.getByRole('searchbox', { name: 'Search the library' }), 'Helvetica');
    await user.click(screen.getByRole('button', { name: /^Search$/ }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('q')).toBe('Helvetica'),
    );
    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    await user.click(screen.getByRole('checkbox', { name: /Swiss/ }));
    await user.click(screen.getByRole('checkbox', { name: /Minimalist/ }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].getAll('tag')).toEqual([
        'Swiss',
        'Minimalist',
      ]),
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next →' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Next →' }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('page')).toBe('2'),
    );
  });

  it('keeps grouped alternatives, contextual facets and removable chips in sync', async () => {
    vi.mocked(getStudioReferenceFacets).mockResolvedValue({
      groups: [
        { id: 'style', label: 'Visual style' },
        { id: 'color', label: 'Color & tone' },
      ],
      tags: [
        { name: 'Swiss', label: 'Swiss / International style', group: 'style', count: 1 },
        { name: 'Minimalist', group: 'style', count: 1 },
        { name: 'Dark', label: 'Dark palette', group: 'color', count: 1 },
      ],
      collections: [{ name: 'Style studies', count: 1 }],
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin/studio/references?view=list&page=2']}>
        <AdminReferences />
      </MemoryRouter>,
    );
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: /^Filters/ }));
    await user.click(screen.getByRole('checkbox', { name: /Swiss/ }));
    await user.click(screen.getByRole('checkbox', { name: /Minimalist/ }));
    await user.click(screen.getByRole('checkbox', { name: /Dark palette/ }));
    await waitFor(() => {
      const query = vi.mocked(getStudioReferences).mock.lastCall![0];
      expect(query.getAll('filter_style')).toEqual(['Swiss', 'Minimalist']);
      expect(query.getAll('filter_color')).toEqual(['Dark']);
      expect(query.get('page')).toBe('1');
      expect(vi.mocked(getStudioReferenceFacets).mock.lastCall![1]?.getAll('filter_style')).toEqual(
        ['Swiss', 'Minimalist'],
      );
    });
    await user.click(screen.getByRole('button', { name: 'Remove Swiss / International style' }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall![0].getAll('filter_style')).toEqual([
        'Minimalist',
      ]),
    );
    await user.type(screen.getByRole('searchbox', { name: 'Search the library' }), 'Helvetica');
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall![0].get('q')).toBe('Helvetica'),
    );
    await user.click(screen.getByRole('button', { name: 'Remove search' }));
    await waitFor(() =>
      expect(screen.getByRole('searchbox', { name: 'Search the library' })).toHaveValue(''),
    );
  });

  it('keeps unavailable choices visible and dismisses the panel with keyboard focus restored', async () => {
    const initial = {
      groups: [
        { id: 'style', label: 'Visual style' },
        { id: 'color', label: 'Color & tone' },
      ],
      tags: [
        { name: 'Swiss', group: 'style', count: 1 },
        { name: 'Dark', group: 'color', count: 1 },
      ],
      collections: [],
    };
    vi.mocked(getStudioReferenceFacets)
      .mockResolvedValueOnce(initial)
      .mockResolvedValue({ ...initial, tags: [initial.tags[0], { ...initial.tags[1], count: 0 }] });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminReferences />
      </MemoryRouter>,
    );
    await screen.findByRole('button', { name: 'Read Alpha' });
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    expect(screen.getByRole('searchbox', { name: 'Find a filter' })).toHaveFocus();
    await user.click(screen.getByRole('checkbox', { name: /Swiss/ }));
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /Dark/ })).toBeDisabled());
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Reference filters' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(trigger).toHaveFocus();
  });

  it('opens a readable document with tables, limits, and inert raw HTML', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <AdminReferences />
      </MemoryRouter>,
    );
    await user.click(await screen.findByRole('button', { name: 'Read Alpha' }));
    await screen.findByRole('table');
    expect(screen.getByText('Single desktop state.')).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Close reference' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows empty and failed queries with a working retry', async () => {
    vi.mocked(getStudioReferences)
      .mockRejectedValueOnce(new Error('Index unavailable'))
      .mockResolvedValueOnce({ items: [], total: 0, page: 1, per_page: 24, total_pages: 0 });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminReferences />
      </MemoryRouter>,
    );
    await screen.findByText('Index unavailable');
    await user.click(screen.getByRole('button', { name: 'Retry library' }));
    await screen.findByText('No references match');
  });
});
