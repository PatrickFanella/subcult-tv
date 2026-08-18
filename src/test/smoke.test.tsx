import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider } from '@/context/AuthContext';
import { EffectsProvider } from '@/context/EffectsContext';
import App from '@/App';

// Deterministic localStorage for EffectsContext/AuthContext.
const store = new Map<string, string>();

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <EffectsProvider>
          <App />
        </EffectsProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('smoke: app shell', () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    });
  });

  it('renders the home hero', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'SUBCULT' })).toBeInTheDocument();
    expect(screen.getByRole('navigation').textContent).toContain('SUBCULT');
  });

  it('renders the projects grid and filters it', async () => {
    const user = userEvent.setup();
    renderApp('/projects');

    const heading = await screen.findByRole('heading', { name: 'Work' });
    expect(heading).toBeInTheDocument();

    // Without filters the "Current Focus" section layout is shown.
    expect(screen.getByRole('heading', { name: /Current Focus/i })).toBeInTheDocument();

    // Apply TYPE: software + STATUS: active filters.
    await user.click(screen.getByRole('button', { name: 'SOFTWARE' }));
    await user.click(screen.getByRole('button', { name: 'ACTIVE' }));

    const count = await screen.findByText(/(\d+) projects? found/);
    expect(count).toBeInTheDocument();
  });

  it('renders a project detail page from the catalog', async () => {
    renderApp('/projects/clpr');
    // Unique detail-page marker: the project description in the catalog.
    expect((await screen.findAllByText(/Twitch clip curation platform/i)).length).toBeGreaterThan(0);
  });

  it('renders 404 for unknown projects', async () => {
    renderApp('/projects/definitely-not-a-project');
    expect(await screen.findByText(/ERROR 404: project not found/i)).toBeInTheDocument();
  });
});

describe('smoke: contact', () => {
  it('submits the form via the API', async () => {
    const api = await import('@/lib/api');
    const submit = vi.fn().mockResolvedValue({ message: 'signal received' });
    vi.spyOn(api, 'submitContact').mockImplementation(submit);

    const user = userEvent.setup();
    renderApp('/contact');

    await user.type(await screen.findByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Message'), 'A test transmission.');
    await user.click(screen.getByRole('button', { name: /transmit/i }));

    expect(await screen.findByText(/signal received/i)).toBeInTheDocument();
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada Lovelace', email: 'ada@example.com' }),
    );
  });
});

describe('smoke: zine post', () => {
  it('renders a post and its next-in-series link', async () => {
    renderApp('/zine/boot-sequence');
    expect(await screen.findByText(/Foundations Series — Week 1 of 8/i)).toBeInTheDocument();
    expect(screen.getByText(/Next:/i)).toBeInTheDocument();
  });
});