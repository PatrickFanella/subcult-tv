import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterSignup from '@/components/NewsletterSignup';
import { subscribe } from '@/lib/api';
vi.mock('@/lib/api', () => ({ subscribe: vi.fn() }));
afterEach(() => {
  cleanup();
  delete window.umami;
  vi.resetAllMocks();
});
describe('newsletter campaign event', () => {
  it('counts a successful signup request without the email', async () => {
    const track = vi.fn();
    window.umami = { track };
    vi.mocked(subscribe).mockResolvedValue({ message: 'Check your inbox.' });
    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'test@example.invalid');
    await user.click(screen.getByRole('button', { name: 'SUBSCRIBE' }));
    await screen.findByText('Check your inbox.');
    expect(track).toHaveBeenCalledExactlyOnceWith('newsletter-signup');
  });
  it('does not count failed signup requests', async () => {
    const track = vi.fn();
    window.umami = { track };
    vi.mocked(subscribe).mockRejectedValue(new Error('Could not send confirmation.'));
    const user = userEvent.setup();
    render(<NewsletterSignup />);
    await user.type(screen.getByRole('textbox', { name: 'Email address' }), 'test@example.invalid');
    await user.click(screen.getByRole('button', { name: 'SUBSCRIBE' }));
    await screen.findByText(/Could not send confirmation/);
    expect(track).not.toHaveBeenCalled();
  });
});
