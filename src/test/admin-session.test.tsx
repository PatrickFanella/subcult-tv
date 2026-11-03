import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import * as api from '@/lib/api';

// The real client against a stubbed fetch: these cover the 401 → sign-in path
// and the request bodies the server limits.

type Reply = { status: number; body?: unknown; text?: string };
const replies = new Map<string, Reply>();
const calls: { url: string; init?: RequestInit }[] = [];
const store = new Map<string, string>();
const admin = {
  id: '1',
  username: 'owner',
  email: 'o@example.com',
  role: 'admin',
  created_at: '',
  updated_at: '',
};

function fakeFetch(url: string, init?: RequestInit) {
  calls.push({ url, init });
  const key = `${init?.method ?? 'GET'} ${url}`;
  const reply = replies.get(key) ?? { status: 404, body: { error: 'missing route ' + key } };
  return Promise.resolve({
    ok: reply.status >= 200 && reply.status < 300,
    status: reply.status,
    statusText: 'status',
    json: () =>
      reply.text !== undefined
        ? Promise.reject(new SyntaxError('Unexpected token'))
        : Promise.resolve(reply.body),
  } as Response);
}

function Probe() {
  const location = useLocation();
  const [error, setError] = React.useState('');
  return (
    <div>
      <p data-testid="where">{location.pathname}</p>
      <button
        type="button"
        onClick={() => api.getDashboardStats().catch((e) => setError(e.message))}
      >
        Load stats
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
import React from 'react';

function renderAdmin(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Probe />} />
            <Route path="contacts" element={<Probe />} />
          </Route>
        </Routes>
        <Outlet />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  replies.clear();
  calls.length = 0;
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, v),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  });
  vi.stubGlobal('fetch', vi.fn(fakeFetch));
  api.clearToken();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('expired admin sessions', () => {
  it('returns to sign-in on a 401 and comes back to the same page after login', async () => {
    store.set('subcult-token', 'stale');
    replies.set('GET /api/v1/auth/me', { status: 200, body: admin });
    replies.set('GET /api/v1/admin/stats', { status: 401, body: { error: 'Token expired' } });
    replies.set('POST /api/v1/auth/login', {
      status: 200,
      body: { token: 'fresh', user: admin },
    });
    renderAdmin('/admin/contacts');
    expect(await screen.findByTestId('where')).toHaveTextContent('/admin/contacts');
    fireEvent.click(screen.getByRole('button', { name: 'Load stats' }));
    await screen.findByText('Admin sign-in');
    expect(store.get('subcult-token')).toBeUndefined();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'owner' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'SIGN IN' }));
    expect(await screen.findByTestId('where')).toHaveTextContent('/admin/contacts');
    expect(store.get('subcult-token')).toBe('fresh');
  });

  it('does not treat a failed sign-in as an expired session', async () => {
    replies.set('POST /api/v1/auth/login', { status: 401, body: { error: 'Wrong password' } });
    const expired = vi.fn();
    const stop = api.onUnauthorized(expired);
    await expect(api.login('owner', 'nope')).rejects.toThrow('Wrong password');
    expect(expired).not.toHaveBeenCalled();
    stop();
  });

  it('refuses a non-admin account at sign-in', async () => {
    replies.set('POST /api/v1/auth/login', {
      status: 200,
      body: { token: 'editor-token', user: { ...admin, role: 'editor' } },
    });
    renderAdmin('/admin/login');
    fireEvent.change(await screen.findByLabelText('Username'), { target: { value: 'ed' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'SIGN IN' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('not an admin');
    expect(screen.queryByTestId('where')).not.toBeInTheDocument();
    await waitFor(() => expect(store.get('subcult-token')).toBeUndefined());
  });
});

describe('API client bodies and error handling', () => {
  it('sends only the fields the publication handler reads', async () => {
    api.setToken('t');
    replies.set('PUT /api/v1/admin/publications/pub-1', { status: 200, body: { version: 3 } });
    await api.savePublication({
      id: 'pub-1',
      platform: 'website',
      title: 'Title',
      body: 'Body',
      excerpt: 'Excerpt',
      due_at: '2026-12-01T12:00:00Z',
      audience: 'public',
      version: 2,
      status: 'draft',
      provider_url: 'https://example.com/huge',
      source: { items: 'x'.repeat(70000) },
    });
    const sent = JSON.parse(String(calls[0].init?.body));
    expect(Object.keys(sent).sort()).toEqual(
      ['audience', 'body', 'due_at', 'excerpt', 'title', 'version'].sort(),
    );
    expect(sent.version).toBe(2);
  });

  it('reports a non-JSON error body as an API error, not a parse failure', async () => {
    api.setToken('t');
    replies.set('PUT /api/v1/admin/studio/review/d1', { status: 502, text: 'Bad Gateway' });
    replies.set('POST /api/v1/admin/studio/delivery', { status: 504, text: 'Gateway timeout' });
    await expect(api.saveReviewDraft('d1', new FormData())).rejects.toMatchObject({
      name: 'APIError',
      message: 'Saving failed',
      status: 502,
    });
    await expect(api.approveSocialSchedule(new FormData())).rejects.toMatchObject({
      name: 'APIError',
      message: 'Scheduling failed',
      status: 504,
    });
  });

  it('clears the token and notifies on a 401 from a multipart request', async () => {
    api.setToken('t');
    replies.set('PUT /api/v1/admin/studio/review/d1', { status: 401, body: { error: 'Expired' } });
    const expired = vi.fn();
    const stop = api.onUnauthorized(expired);
    await expect(api.saveReviewDraft('d1', new FormData())).rejects.toThrow('Expired');
    expect(expired).toHaveBeenCalledOnce();
    expect(api.getToken()).toBeNull();
    stop();
  });
});
