// Pure helpers for the private social review queue. No network access here.
import type { BufferHistoryPost, DraftDecision, PostingDraft, PostingPlatform } from './api';

/** Older snapshots lack `platform`: Changemaker prepares Instagram, plan/radar prepare X. */
export function draftPlatform(draft: Pick<PostingDraft, 'platform' | 'mode'>): PostingPlatform {
  if (draft.platform === 'instagram' || draft.platform === 'x' || draft.platform === 'bluesky')
    return draft.platform;
  return draft.mode === 'changemaker' ? 'instagram' : 'x';
}

/** Drafts without an explicit expiry expire once their proposed time passes. */
export function draftExpiry(draft: Pick<PostingDraft, 'expires_at' | 'due_at'>): string {
  return draft.expires_at || draft.due_at || '';
}

export function isExpired(draft: Pick<PostingDraft, 'expires_at' | 'due_at'>, now: number) {
  const value = draftExpiry(draft);
  if (!value) return false;
  const at = new Date(value).valueOf();
  return Number.isNaN(at) || at <= now;
}

const REVIEW_PREFIX = 'Draft for human review.';

/** Early stored editions begin with a reviewer note that must never publish. */
export function stripReviewPrefix(body: string) {
  const trimmed = body.replace(/^\s+/, '');
  if (!trimmed.startsWith(REVIEW_PREFIX)) return body;
  return trimmed.slice(REVIEW_PREFIX.length).replace(/^\s+/, '');
}

const URL_PATTERN = /https?:\/\/\S+/g;

/** X counts every link as 23 characters, whatever its length. */
export function xLength(text: string) {
  const links = text.match(URL_PATTERN) || [];
  const rest = text.replace(URL_PATTERN, '');
  return [...rest].length + links.length * 23;
}

export const X_LIMIT = 280;
export const INSTAGRAM_LIMIT = 2200;
/** Instagram truncates feed captions with "more" after roughly this many characters. */
export const INSTAGRAM_FOLD = 125;

export function platformLabel(platform: PostingPlatform) {
  return platform === 'instagram' ? 'Instagram' : platform === 'x' ? 'X' : 'Bluesky';
}

export function laneLabel(mode: string) {
  return mode === 'changemaker' ? 'Changemaker' : mode === 'radar' ? 'Timely' : 'Weekly';
}

/** What a re-roll regenerates, for messages: "caption", "image" or "caption and image". */
export function rerollLabel(mode: 'text' | 'image' | 'both') {
  return mode === 'text' ? 'caption' : mode === 'image' ? 'image' : 'caption and image';
}

export function firstLine(text: string, limit = 90) {
  const line = text.trim().split('\n')[0] || '';
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}

const HOUR = 3600000;
const DAY = 24 * HOUR;
export const MAX_LEAD_MS = 90 * DAY;

function zoneParts(at: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(at));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/** UTC instant of a wall-clock time in `timeZone`, handling DST changes. */
export function zonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const offset = (at: number) => {
    const p = zoneParts(at, timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(at / 60000) * 60000;
  };
  const first = wall - offset(wall);
  const second = wall - offset(first);
  return second;
}

export interface Slot {
  at: number;
  taken: boolean;
}

/**
 * The account's cadence times ("09:11") over the next `days`, in the
 * configured time zone, limited to the future 90-day approval window.
 */
export function cadenceSlots(
  times: string[],
  timeZone: string,
  now: number,
  taken: number[] = [],
  days = 14,
) {
  const today = zoneParts(now, timeZone);
  const slots: Slot[] = [];
  for (let offset = 0; offset <= days; offset += 1) {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day + offset));
    for (const time of times) {
      const match = /^(\d{1,2}):(\d{2})$/.exec(time);
      if (!match) continue;
      const at = zonedTime(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        Number(match[1]),
        Number(match[2]),
        timeZone,
      );
      if (at <= now || at > now + MAX_LEAD_MS) continue;
      slots.push({ at, taken: taken.some((t) => Math.abs(t - at) < HOUR) });
    }
  }
  return slots.sort((a, b) => a.at - b.at);
}

/** First free slot at or after the proposed time, else the first free slot. */
export function defaultSlot(slots: Slot[], proposed: number) {
  const free = slots.filter((s) => !s.taken);
  return free.find((s) => s.at >= proposed) || free[0] || null;
}

export function leadProblem(at: number, now: number) {
  if (Number.isNaN(at)) return 'Choose a publish time.';
  if (at <= now) return 'Choose a publish time in the future.';
  if (at > now + MAX_LEAD_MS) return 'Choose a time within 90 days.';
  return '';
}

export function relativeTime(at: number, now: number) {
  const diff = at - now;
  const abs = Math.abs(diff);
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
  if (abs < HOUR) return format.format(Math.round(diff / 60000), 'minute');
  if (abs < 48 * HOUR) return format.format(Math.round(diff / HOUR), 'hour');
  return format.format(Math.round(diff / DAY), 'day');
}

/** "Tue, Oct 6, 9:11 AM, in 2 days" in the cadence time zone. */
export function slotLabel(at: number, now: number, timeZone: string) {
  const when = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(at));
  return `${when}, ${relativeTime(at, now)}`;
}

/** The PostyBirb account whose profile or name matches the draft's account. */
export function matchAccount(
  draftAccount: string,
  accounts: { id: string; name: string; profile: string; disabled: boolean }[],
) {
  const wanted = draftAccount.toLowerCase();
  const matches = accounts.filter(
    (a) =>
      !a.disabled &&
      [a.profile, a.name, a.id].some((value) => (value || '').toLowerCase().startsWith(wanted)),
  );
  return matches.length === 1 ? matches[0].id : '';
}

/** Discrete things to verify, from `checklist` or split from next_check. */
export function checklistItems(draft: Pick<PostingDraft, 'checklist' | 'next_check'>) {
  if (draft.checklist?.length) return draft.checklist.slice(0, 12);
  return (draft.next_check || '')
    .split(/\n+|;\s+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((item) => item.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

const SCORE_LABELS: Record<string, string> = {
  reason: 'reason to care',
  reader_value: 'reader value',
};

/** "Average 4.2/5 · strongest hook 5 · weakest ending 3", or '' without scores. */
export function scoreSummary(scores: Partial<Record<string, number>> | undefined) {
  const entries = Object.entries(scores || {}).filter(
    (e): e is [string, number] => typeof e[1] === 'number',
  );
  if (!entries.length) return '';
  const average = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const name = (key: string) => SCORE_LABELS[key] || key.replaceAll('_', ' ');
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const parts = [`Average ${average.toFixed(1)}/5`];
  if (best[1] !== worst[1]) {
    parts.push(`strongest ${name(best[0])} ${best[1]}`, `weakest ${name(worst[0])} ${worst[1]}`);
  }
  return parts.join(' · ');
}

export type HiddenReason = '' | 'rejected' | 'revision_requested' | 'snoozed' | 'superseded';

/**
 * Latest decision per draft, from decisions returned oldest first. A "good post"
 * mark is feedback only and never changes where a draft sits in the queue.
 */
export function latestDecisions(decisions: DraftDecision[]) {
  const latest = new Map<string, DraftDecision>();
  for (const d of decisions) if (d.decision !== 'favorited') latest.set(d.draft_id, d);
  return latest;
}

/** Drafts the owner marked as particularly good. */
export function favoritedDrafts(decisions: DraftDecision[]) {
  return new Set(decisions.filter((d) => d.decision === 'favorited').map((d) => d.draft_id));
}

/** Why a draft is out of the active queue: rejected, awaiting revision, snoozed or replaced. */
export function hiddenReason(
  draft: Pick<PostingDraft, 'id'>,
  latest: Map<string, DraftDecision>,
  superseded: Set<string>,
  now: number,
): HiddenReason {
  if (superseded.has(draft.id)) return 'superseded';
  const decision = latest.get(draft.id);
  if (!decision) return '';
  if (decision.decision === 'rejected' || decision.decision === 'revision_requested')
    return decision.decision;
  if (decision.decision === 'snoozed' && decision.snooze_until) {
    return new Date(decision.snooze_until).valueOf() > now ? 'snoozed' : '';
  }
  return '';
}

/** Instagram shows feed images between 4:5 portrait and 1.91:1 landscape, cropping anything outside. */
export const FEED_MIN_RATIO = 4 / 5;
export const FEED_MAX_RATIO = 1.91;

export function feedRatio(width: number, height: number): number {
  if (!width || !height) return FEED_MIN_RATIO;
  return Math.min(FEED_MAX_RATIO, Math.max(FEED_MIN_RATIO, width / height));
}

const METRIC_LABELS: Record<string, string> = {
  impressions: 'views',
  reactions: 'likes',
  reposts: 'reposts',
  comments: 'replies',
  clicks: 'clicks',
};

/** "473 views · 5 likes · 2.7% engagement" parts from Buffer's daily post metrics. */
export function metricSummary(post: Pick<BufferHistoryPost, 'metrics'>) {
  const parts: string[] = [];
  for (const m of post.metrics ?? []) {
    if (m.type === 'engagementRate') {
      if (m.value) parts.push(`${Number(m.value).toFixed(1)}% engagement`);
    } else if (METRIC_LABELS[m.type]) {
      parts.push(`${Number(m.value).toLocaleString()} ${METRIC_LABELS[m.type]}`);
    }
  }
  return parts;
}

const LANE_NAMES: Record<string, string> = {
  plan: 'Weekly X plan',
  radar: 'Timely X check',
  review: 'Weekly delivery review',
  changemaker: 'Instagram draft from Changemaker',
};

/** What a preparation lane does, in words. */
export function laneName(mode: string) {
  return LANE_NAMES[mode] || mode;
}

const RUN_STATUS: Record<string, string> = {
  success: 'Drafts prepared',
  no_fresh_sources: 'Nothing new to draft',
};

export function runStatusLabel(status: string) {
  return RUN_STATUS[status] || status.replaceAll('_', ' ');
}

const WEEKDAYS: Record<string, string> = {
  Mon: 'Mondays',
  Tue: 'Tuesdays',
  Wed: 'Wednesdays',
  Thu: 'Thursdays',
  Fri: 'Fridays',
  Sat: 'Saturdays',
  Sun: 'Sundays',
};

/**
 * A systemd calendar line such as "Mon *-*-* 10:00:00 America/Chicago" as
 * "Mondays at 10:00 AM", in the browser's time zone. Unrecognized lines are
 * returned unchanged.
 */
export function describeCalendar(spec: string, now = Date.now()) {
  const match = /^(?:([A-Z][a-z]{2}) )?\*-\*-\* (\d{1,2}):(\d{2})(?::\d{2})? ?(\S+)?$/.exec(
    spec.trim(),
  );
  if (!match) return spec;
  const [, day, hour, minute, zone = Intl.DateTimeFormat().resolvedOptions().timeZone] = match;
  if (day && !WEEKDAYS[day]) return spec;
  let at: number;
  try {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(new Date(now));
    const [y, m, d] = today.split('-').map(Number);
    at = zonedTime(y, m, d, Number(hour), Number(minute), zone);
  } catch {
    return spec;
  }
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(at),
  );
  return `${day ? WEEKDAYS[day] : 'Every day'} at ${time}`;
}

/** "Oct 8, 1:57 PM · Weekly X plan" from a run ID like "20261008T185712.659892Z-plan". */
export function runLabel(runId: string) {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z-(\w+)$/.exec(runId);
  if (!match) return runId;
  const [, y, mo, d, h, mi, s, mode] = match;
  const at = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  const when = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(at);
  return `${when} · ${laneName(mode)}`;
}
