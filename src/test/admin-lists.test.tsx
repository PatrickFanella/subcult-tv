import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminBlogPosts from '@/pages/admin/AdminBlogPosts';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import {
  listContacts,
  deleteContact,
  listPosts,
  listProjects,
  getPublishedProjects,
  updateProject,
  getDashboardStats,
  getPostingDashboard,
  getReviewDrafts,
  getPublications,
  getDraftDecisions,
  getSocialDelivery,
  getBufferDelivery,
  getBufferHistory,
  type APIContact,
  type APIPost,
  type APIProject,
} from '@/lib/api';

vi.mock('@/lib/api', () => ({
  listContacts: vi.fn(),
  toggleContactRead: vi.fn(),
  deleteContact: vi.fn(),
  listPosts: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  listProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  getPublishedProjects: vi.fn(),
  approveProject: vi.fn(),
  unpublishProject: vi.fn(),
  getDashboardStats: vi.fn(),
  getPostingDashboard: vi.fn(),
  getReviewDrafts: vi.fn(),
  getPublications: vi.fn(),
  getDraftDecisions: vi.fn(),
  getSocialDelivery: vi.fn(),
  getBufferDelivery: vi.fn(),
  getBufferHistory: vi.fn(),
}));

const contact = (id: string, read = false): APIContact => ({
  id,
  name: `Person ${id}`,
  email: `${id}@example.com`,
  message: 'Hello',
  read,
  created_at: '2026-10-01T12:00:00Z',
});
const post = (id: string): APIPost => ({
  id,
  slug: `post-${id}`,
  title: `Article ${id}`,
  excerpt: '',
  content: '',
  tags: [],
  published: false,
  date: '2026-10-01',
  created_at: '',
  updated_at: '',
});
const project = (over: Partial<APIProject> = {}): APIProject => ({
  id: 'p1',
  slug: 'clpr',
  name: 'CLPR',
  description: 'Clips',
  type: ['software'],
  status: 'active',
  stack: [],
  topics: [],
  cover_pattern: 'grid',
  featured: true,
  sort_order: 3,
  stars: 0,
  created_at: '',
  updated_at: 'v1',
  ...over,
});
const page = <T,>(data: T[], current: number, total_pages: number) => ({
  data,
  total: data.length,
  page: current,
  per_page: 20,
  total_pages,
});

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('confirm', () => true);
});

describe('contact list', () => {
  it('steps back when a delete empties the last page and marks unread without colour alone', async () => {
    vi.mocked(listContacts)
      .mockResolvedValueOnce(page([contact('a', true), contact('b')], 1, 2))
      .mockResolvedValueOnce(page([contact('c')], 2, 2))
      .mockResolvedValueOnce(page([], 2, 1))
      .mockResolvedValue(page([contact('a', true), contact('b')], 1, 1));
    vi.mocked(deleteContact).mockResolvedValue(undefined);
    render(<AdminContacts />);
    await screen.findByText('Person b');
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    await screen.findByText('Person c');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(listContacts).toHaveBeenLastCalledWith({ page: 1, perPage: 20 }));
    await screen.findByText('Person a');
    expect(screen.getByText(/^2 messages/)).toBeInTheDocument();
  });
});

describe('articles list', () => {
  it('pages at 25 per request and opens new articles on the local date', async () => {
    vi.mocked(listPosts).mockResolvedValue({
      ...page([post('1'), post('2')], 1, 3),
      total: 60,
      per_page: 25,
    });
    render(
      <MemoryRouter>
        <AdminBlogPosts />
      </MemoryRouter>,
    );
    await screen.findByText('Article 1');
    expect(listPosts).toHaveBeenCalledWith({ all: true, page: 1, perPage: 25 });
    expect(screen.getByText('60 articles · page 1 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    await waitFor(() =>
      expect(listPosts).toHaveBeenLastCalledWith({ all: true, page: 2, perPage: 25 }),
    );
    const today = new Date();
    const local = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    fireEvent.click(screen.getByRole('button', { name: '+ New article' }));
    expect(screen.getByLabelText('Date')).toHaveValue(local);
  });
});

describe('projects', () => {
  it('refreshes the open review panel after a save and keeps the sort order editable', async () => {
    vi.mocked(listProjects)
      .mockResolvedValueOnce([project()])
      .mockResolvedValue([project({ name: 'CLPR renamed', updated_at: 'v2', sort_order: 7 })]);
    vi.mocked(getPublishedProjects).mockResolvedValue([]);
    vi.mocked(updateProject).mockResolvedValue(project({ updated_at: 'v2' }));
    render(<AdminProjects />);
    await screen.findByText('CLPR');
    expect(screen.getByRole('img', { name: 'Featured' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review update' }));
    expect(screen.getByRole('heading', { name: 'Review public update: CLPR' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const order = screen.getByLabelText('Sort order');
    expect(order).toHaveAttribute('type', 'number');
    expect(order).toHaveAttribute('inputmode', 'numeric');
    fireEvent.change(order, { target: { value: '' } });
    expect(order).toHaveValue(null);
    fireEvent.change(order, { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'CLPR renamed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(updateProject).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ name: 'CLPR renamed', sort_order: 7 }),
      ),
    );
    await screen.findByRole('heading', { name: 'Review public update: CLPR renamed' });
    const panel = screen.getByRole('region', { name: /Review public update/ });
    expect(within(panel).getByText('7')).toBeInTheDocument();
  });
});

describe('dashboard', () => {
  it('shows an unconfigured provider as a status line and keeps real failures in the alert', async () => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      total_projects: 1,
      total_posts: 1,
      total_contacts: 0,
      unread_contacts: 0,
      total_subscribers: 0,
    });
    vi.mocked(getPostingDashboard).mockRejectedValue(
      Object.assign(new Error('Snapshot unavailable'), { status: 503 }),
    );
    vi.mocked(getReviewDrafts).mockResolvedValue([]);
    vi.mocked(getPublications).mockResolvedValue({
      drafts: [],
      patreon_connected: false,
      minimum_lead_hours: 24,
    });
    vi.mocked(getDraftDecisions).mockResolvedValue([]);
    vi.mocked(getSocialDelivery).mockRejectedValue(
      Object.assign(new Error('PostyBirb delivery is not configured'), { status: 503 }),
    );
    vi.mocked(getBufferDelivery).mockResolvedValue({
      configured: false,
      channels: [],
      receipts: [],
    });
    vi.mocked(getBufferHistory).mockResolvedValue({ configured: false, posts: [] });
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>,
    );
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Preparation: Snapshot unavailable');
    expect(alert).not.toHaveTextContent('not configured');
    expect(
      screen.getByText('PostyBirb delivery is not configured.', { selector: '[role="status"]' }),
    ).toBeInTheDocument();
  });
});
