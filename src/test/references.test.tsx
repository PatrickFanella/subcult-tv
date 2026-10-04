import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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
    await user.type(screen.getByRole('searchbox'), 'Helvetica');
    await user.click(screen.getByRole('button', { name: /^Search$/ }));
    await waitFor(() =>
      expect(vi.mocked(getStudioReferences).mock.lastCall?.[0].get('q')).toBe('Helvetica'),
    );
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
