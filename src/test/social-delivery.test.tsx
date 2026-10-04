import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SocialDelivery from '@/pages/admin/SocialDelivery';
import { getSocialDelivery, approveSocialSchedule } from '@/lib/api';
vi.mock('@/lib/api', () => ({ getSocialDelivery: vi.fn(), approveSocialSchedule: vi.fn() }));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getSocialDelivery).mockResolvedValue({
    accounts: [
      {
        id: 'patrick',
        name: 'Patrick',
        profile: 'patrick__eff',
        identifier: 'instagram-standalone',
        disabled: false,
      },
    ],
    posts: [],
    checked_at: new Date().toISOString(),
    approval_mode: 'manual',
    minimum_lead_hours: 24,
  });
});
describe('Instagram approval', () => {
  it('requires account, image, future time and explicit approval; editing clears approval', async () => {
    render(<SocialDelivery draft={null} revision={0} />);
    await screen.findByText('patrick__eff');
    const button = screen.getByRole('button', { name: 'Approve & schedule' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Instagram account'), { target: { value: 'patrick' } });
    fireEvent.change(screen.getByLabelText('Instagram caption'), {
      target: { value: 'Reviewed caption' },
    });
    fireEvent.change(screen.getByLabelText('JPEG image'), {
      target: { files: [new File(['jpeg'], 'image.jpg', { type: 'image/jpeg' })] },
    });
    const date = new Date(Date.now() + 26 * 3600000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    fireEvent.change(screen.getByLabelText('Publish time'), {
      target: { value: date.toISOString().slice(0, 16) },
    });
    expect(button).toBeDisabled();
    fireEvent.click(
      screen.getByLabelText('I approve this caption, image, account and publish time.'),
    );
    expect(button).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Instagram caption'), {
      target: { value: 'Changed caption' },
    });
    expect(button).toBeDisabled();
    expect(approveSocialSchedule).not.toHaveBeenCalled();
  });
  it('does not treat a provider queue state as delivery', async () => {
    vi.mocked(getSocialDelivery).mockResolvedValue({
      accounts: [],
      posts: [
        {
          id: 'p1',
          content: 'Caption',
          publishDate: new Date().toISOString(),
          releaseURL: '',
          state: 'QUEUE',
          integration: { id: 'patrick', name: 'Patrick' },
        },
      ],
      checked_at: new Date().toISOString(),
      approval_mode: 'manual',
      minimum_lead_hours: 24,
    });
    render(<SocialDelivery draft={null} revision={0} />);
    await screen.findByText('Scheduled');
    expect(screen.getByText('No published link')).toBeInTheDocument();
    expect(screen.queryByText('View Instagram post ↗')).not.toBeInTheDocument();
  });
});
