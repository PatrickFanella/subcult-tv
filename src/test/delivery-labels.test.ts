import { describe, expect, it } from 'vitest';
import { describeCalendar, metricSummary, runLabel, runStatusLabel } from '@/lib/review-queue';

describe('automation labels', () => {
  it('describes systemd calendar lines in words', () => {
    expect(describeCalendar('Mon *-*-* 10:00:00 America/Chicago')).toMatch(
      /^Mondays at \d{1,2}:00 (AM|PM)$/,
    );
    expect(describeCalendar('*-*-* 09:20:00 UTC')).toMatch(/^Every day at \d{1,2}:20 (AM|PM)$/);
    expect(describeCalendar('weekly')).toBe('weekly');
  });
  it('names runs and their results', () => {
    expect(runLabel('20261008T185712.659892Z-plan')).toContain('Weekly X plan');
    expect(runLabel('odd-id')).toBe('odd-id');
    expect(runStatusLabel('no_fresh_sources')).toBe('Nothing new to draft');
    expect(runStatusLabel('some_state')).toBe('some state');
  });
});

describe('metricSummary', () => {
  it('lists Buffer metrics in plain words and skips zero engagement', () => {
    expect(
      metricSummary({
        metrics: [
          { type: 'impressions', value: 473 },
          { type: 'reactions', value: 5 },
          { type: 'engagementRate', value: 0 },
          { type: 'unknown', value: 9 },
        ],
      }),
    ).toEqual(['473 views', '5 likes']);
    expect(metricSummary({ metrics: [{ type: 'engagementRate', value: 2.72 }] })).toEqual([
      '2.7% engagement',
    ]);
    expect(metricSummary({ metrics: null })).toEqual([]);
  });
});
