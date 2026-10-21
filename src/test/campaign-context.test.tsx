import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignContext from '@/pages/admin/CampaignContext';
import type { PostingDraft } from '@/lib/api';

describe('Campaign context', () => {
  it('explains older drafts without inventing packet attribution', () => {
    render(<CampaignContext draft={{} as PostingDraft} />);
    expect(screen.getByText(/Prepared before packet tracking/)).toBeInTheDocument();
  });
  it('shows the selected revision, reader action and readiness flags', () => {
    render(<CampaignContext draft={{ craft: { campaign: {
      project: 'undertow', project_name: 'Undertow', status: 'needs_review',
      packet_revision: 'abc123', packet_sha256: 'def456', theme: 'Timed lyrics',
      pillar_id: 'undertow-2', reader_action: 'Open the editor', destination: 'https://undertow.subcult.tv/',
      measurement: 'Successful exports / attempts', asset_task: 'Inspect a local export',
      flags: ['No inspected demonstration recorded'],
    } } } as PostingDraft} />);
    expect(screen.getByText(/Campaign: Undertow/)).toBeInTheDocument();
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.getByText(/No inspected demonstration recorded/)).toBeInTheDocument();
  });
});
