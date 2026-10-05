// Pure helpers for the private social review queue. No network access here.
import type { PostingDraft, PostingPlatform } from './api';

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

export function firstLine(text: string, limit = 90) {
  const line = text.trim().split('\n')[0] || '';
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}
