// ═══════════════════════════════════════════════════════════
// SUBCULT API Client
// Typed fetch wrapper for the Go backend.
// ═══════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Token management ─────────────────────────────────────────

let authToken: string | null = null;

export function setToken(token: string | null) {
  if (authToken !== token) clearStudioPreviews();
  authToken = token;
  if (token) {
    localStorage.setItem('subcult-token', token);
  } else {
    localStorage.removeItem('subcult-token');
  }
}

export function getToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('subcult-token');
  }
  return authToken;
}

export function clearToken() {
  clearStudioPreviews();
  authToken = null;
  localStorage.removeItem('subcult-token');
}

// ── Fetch wrapper ────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new APIError(body.error || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// ── Types ────────────────────────────────────────────────────

export interface APIUser {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface APIProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description?: string;
  why_it_exists?: string;
  type: string[];
  status: string;
  stack: string[];
  topics: string[];
  repo_url?: string;
  homepage?: string;
  cover_pattern: string;
  cover_color?: string;
  featured: boolean;
  sort_order: number;
  stars: number;
  last_updated?: string;
  created_at: string;
  updated_at: string;
}

export interface APIPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  author?: string;
  published: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface APIContact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface APISubscriber {
  id: string;
  email: string;
  confirmed: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DashboardStats {
  total_projects: number;
  total_posts: number;
  total_contacts: number;
  unread_contacts: number;
  total_subscribers: number;
}

// ── Patreon ──────────────────────────────────────────────────

export interface APIPatreonCampaign {
  patron_count: number;
  creation_name: string;
  url: string;
}

export interface APIPatreonTier {
  title: string;
  amount_cents: number;
  patron_count: number;
  description: string;
  published: boolean;
}

export interface APIPatreonData {
  campaign: APIPatreonCampaign | null;
  tiers: APIPatreonTier[];
  cached_at: string | null;
}

export async function getPatreonCampaign() {
  return apiFetch<APIPatreonData>('/api/v1/patreon/campaign');
}

// ── Auth ─────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const res = await apiFetch<{ token: string; user: APIUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(res.token);
  return res;
}

export async function getMe() {
  return apiFetch<APIUser>('/api/v1/auth/me');
}

export async function logout() {
  // Best-effort server-side token revocation (P1.12): fire and forget.
  // If it fails we still clear the local token; the JWT will expire on its own.
  try {
    await apiFetch('/api/v1/auth/logout', { method: 'POST' });
  } catch {
    // ignore — client logout proceeds regardless
  } finally {
    clearToken();
  }
}

// ── Projects ─────────────────────────────────────────────────

export async function listProjects(filters?: { status?: string; type?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.type) params.set('type', filters.type);
  const qs = params.toString();
  return apiFetch<APIProject[]>(`/api/v1/admin/projects${qs ? '?' + qs : ''}`);
}

export async function createProject(
  data: Omit<APIProject, 'id' | 'stars' | 'last_updated' | 'created_at' | 'updated_at'>,
) {
  return apiFetch<APIProject>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string,
  data: Omit<APIProject, 'id' | 'stars' | 'last_updated' | 'created_at' | 'updated_at'>,
) {
  return apiFetch<APIProject>(`/api/v1/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return apiFetch<void>(`/api/v1/projects/${id}`, { method: 'DELETE' });
}

// ── Posts ─────────────────────────────────────────────────────

export async function listPosts(opts?: {
  page?: number;
  perPage?: number;
  all?: boolean;
  tag?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.perPage) params.set('per_page', String(opts.perPage));
  if (opts?.all) params.set('all', 'true');
  if (opts?.tag) params.set('tag', opts.tag);
  const qs = params.toString();
  return apiFetch<PaginatedResponse<APIPost>>(
    `${opts?.all ? '/api/v1/admin/posts' : '/api/v1/posts'}${qs ? '?' + qs : ''}`,
  );
}

export async function createPost(data: Omit<APIPost, 'id' | 'created_at' | 'updated_at'>) {
  return apiFetch<APIPost>('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  id: string,
  data: Omit<APIPost, 'id' | 'created_at' | 'updated_at'>,
) {
  return apiFetch<APIPost>(`/api/v1/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string) {
  return apiFetch<void>(`/api/v1/posts/${id}`, { method: 'DELETE' });
}

// ── Contacts ─────────────────────────────────────────────────

export async function submitContact(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  return apiFetch<{ message: string; id: string }>('/api/v1/contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listContacts(opts?: { page?: number; perPage?: number }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.perPage) params.set('per_page', String(opts.perPage));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<APIContact>>(`/api/v1/contacts${qs ? '?' + qs : ''}`);
}

export async function toggleContactRead(id: string) {
  return apiFetch<APIContact>(`/api/v1/contacts/${id}/read`, { method: 'PATCH' });
}

export async function deleteContact(id: string) {
  return apiFetch<void>(`/api/v1/contacts/${id}`, { method: 'DELETE' });
}

// ── Newsletter ───────────────────────────────────────────────

export async function subscribe(email: string) {
  return apiFetch<{ message: string }>('/api/v1/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export const syncSubscribers = () =>
  apiFetch<{ confirmed: number; brevo_members: number }>('/api/v1/newsletter/subscribers/sync', {
    method: 'POST',
  });

export async function listSubscribers(opts?: { page?: number; perPage?: number }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.perPage) params.set('per_page', String(opts.perPage));
  const qs = params.toString();
  return apiFetch<PaginatedResponse<APISubscriber>>(
    `/api/v1/newsletter/subscribers${qs ? '?' + qs : ''}`,
  );
}

// ── Admin ────────────────────────────────────────────────────

export async function getDashboardStats() {
  return apiFetch<DashboardStats>('/api/v1/admin/stats');
}

// ── Public metrics ──────────────────────────────────────────

export interface StudioDocument {
  id: string;
  title: string;
  name: string;
  section: string;
  tags: string[];
  body: string;
  asset: string;
  status: string;
}
export interface StudioBrandAsset {
  status?: string;
  id: string;
  name: string;
  category: string;
  title?: string;
  tags?: string[];
  metadata_basis?: string;
}
export interface StudioBrand {
  slug: string;
  name: string;
  direction: string;
  guide: string;
  preview: string;
  logos: string[];
  assets?: StudioBrandAsset[];
  tokens: { colors: Record<string, string>; fonts: Record<string, string> };
}
export interface StudioMedia {
  tags?: string[];
  platforms?: string[];
  metadata_basis?: string;
  id: string;
  title: string;
  products: string[];
  rights: string;
  kind: string;
  status: string;
  alt_text: string;
  source: string;
  asset: string;
}
export interface StudioCatalog {
  documents?: StudioDocument[];
  version: number;
  brands: StudioBrand[];
  media: StudioMedia[];
  files: Record<string, { name: string; path: string; sha256: string }>;
}
export interface StudioJobs {
  connected: boolean;
  stale?: boolean;
  observed_at?: string;
  receipt: {
    status: string;
    mode: string;
    week: string;
    run_id: string;
    draft_count: number;
    checked_at: string;
  } | null;
}
export const getStudioCatalog = () => apiFetch<StudioCatalog>('/api/v1/admin/studio');
export const getStudioJobs = () => apiFetch<StudioJobs>('/api/v1/admin/studio/jobs');

export interface StudioReference {
  id: string;
  name: string;
  url: string;
  collection: string;
  summary: string;
  preview: string;
  tags: string[];
  guide?: string;
  images?: string[];
  attachments?: { name: string; asset: string }[];
  provenance?: Record<string, string>;
}
export interface ReferenceResults {
  items: StudioReference[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
export interface ReferenceFacets {
  tags: { name: string; label?: string; group?: string; count: number }[];
  groups?: { id: string; label: string }[];
  collections: { name: string; count: number }[];
}
export const getStudioReferences = (params: URLSearchParams, signal?: AbortSignal) =>
  apiFetch<ReferenceResults>(`/api/v1/admin/studio/references?${params}`, { signal });
export const getStudioReferenceFacets = (signal?: AbortSignal, params = new URLSearchParams()) =>
  apiFetch<ReferenceFacets>(`/api/v1/admin/studio/references/facets?${params}`, { signal });
export const getStudioReference = (id: string, signal?: AbortSignal) =>
  apiFetch<StudioReference>(`/api/v1/admin/studio/references/${encodeURIComponent(id)}`, {
    signal,
  });
export async function getStudioAsset(id: string, signal?: AbortSignal): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/v1/admin/studio/assets/${encodeURIComponent(id)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  });
  if (!response.ok) throw new APIError('Unable to load Studio asset', response.status);
  return response.blob();
}

// Keep private previews in memory for this session only. Returning to a page
// reuses its thumbnails; downloads and other API requests keep their own behavior.
const previewCache = new Map<string, Blob>();
const previewRequests = new Map<string, Promise<Blob>>();
let previewBytes = 0;
let previewSession: string | null = null;
function clearStudioPreviews() {
  previewCache.clear();
  previewRequests.clear();
  previewBytes = 0;
  previewSession = null;
}
export function getStudioPreview(id: string): Promise<Blob> {
  const session = getToken();
  if (session !== previewSession) {
    clearStudioPreviews();
    previewSession = session;
  }
  const cached = previewCache.get(id);
  if (cached) {
    previewCache.delete(id);
    previewCache.set(id, cached);
    return Promise.resolve(cached);
  }
  const pending = previewRequests.get(id);
  if (pending) return pending;
  const request = getStudioAsset(id)
    .then((blob) => {
      if (session === previewSession && blob.size <= 16 * 1024 * 1024) {
        while (previewCache.size >= 80 || previewBytes + blob.size > 16 * 1024 * 1024) {
          const oldest = previewCache.keys().next().value!;
          previewBytes -= previewCache.get(oldest)!.size;
          previewCache.delete(oldest);
        }
        previewCache.set(id, blob);
        previewBytes += blob.size;
      }
      return blob;
    })
    .finally(() => {
      if (previewRequests.get(id) === request) previewRequests.delete(id);
    });
  previewRequests.set(id, request);
  return request;
}

export interface PostingRun {
  mode: string;
  status: string;
  week: string;
  run_id: string;
  draft_count: number;
  checked_at: string;
  observed_at: string;
}
export type PostingPlatform = 'instagram' | 'x' | 'bluesky';
/** A prepared JPEG; the image bytes are served privately by SHA-256. */
export interface PreparedImage {
  sha256: string;
  width: number;
  height: number;
  bytes: number;
}
export interface PostingCraft {
  angle: string;
  reader: string;
  reason: string;
  pattern: string;
  predicted: string;
  scores: Partial<Record<string, number>>;
  alternatives: string[];
}
export interface PostingDraft {
  id: string;
  run_id: string;
  mode: string;
  /** Older snapshots omit the platform; derive it with draftPlatform(). */
  platform?: PostingPlatform;
  week: string;
  account: string;
  text: string;
  /** X self-replies posted under the text as one thread. */
  replies?: string[];
  due_at: string;
  expires_at: string;
  evidence: string;
  next_check: string;
  approval: 'unapproved';
  media: {
    mode: string;
    asset_ids: string[];
    alt_text: string;
    brief: string;
    kind?: string;
    headline?: string;
    image?: PreparedImage;
    candidates?: PreparedImage[];
  };
  craft?: PostingCraft;
  checklist?: string[];
  sources?: string[];
  supersedes?: string;
}
export interface PostingDashboard {
  connected: boolean;
  generated_at: string;
  stale: boolean;
  publishing_enabled: false;
  timezone: string;
  first_week: string;
  schedules: { mode: string; calendar: string[] }[];
  accounts: { account: string; times: string[]; weekly_cap: number }[];
  runs: PostingRun[];
  drafts: PostingDraft[];
  checks: { run_id: string; text: string }[];
}
export const getPostingDashboard = () => apiFetch<PostingDashboard>('/api/v1/admin/studio/posting');

// Prepared review JPEGs are private and immutable by hash; keep a small
// per-session cache so rows and the review sheet share one download.
const preparedCache = new Map<string, Promise<Blob>>();
let preparedSession: string | null = null;
export function getPreparedMedia(sha256: string): Promise<Blob> {
  const session = getToken();
  if (session !== preparedSession) {
    preparedCache.clear();
    preparedSession = session;
  }
  const cached = preparedCache.get(sha256);
  if (cached) return cached;
  const request = fetch(
    `${API_BASE}/api/v1/admin/studio/posting-media/${encodeURIComponent(sha256)}`,
    { headers: session ? { Authorization: `Bearer ${session}` } : {} },
  ).then((response) => {
    if (!response.ok) throw new APIError('Prepared image unavailable', response.status);
    return response.blob();
  });
  request.catch(() => preparedCache.delete(sha256));
  if (preparedCache.size >= 40) preparedCache.delete(preparedCache.keys().next().value!);
  preparedCache.set(sha256, request);
  return request;
}

export interface SocialAccount {
  id: string;
  name: string;
  identifier: string;
  profile: string;
  disabled: boolean;
}
export interface SocialDelivery {
  accounts: SocialAccount[];
  posts: {
    id: string;
    content: string;
    publishDate: string;
    releaseURL: string;
    state: string;
    integration: { id: string; name: string };
  }[];
  checked_at: string;
  approval_mode: 'manual';
  minimum_lead_hours: number;
}
export const getSocialDelivery = () => apiFetch<SocialDelivery>('/api/v1/admin/studio/delivery');
export async function approveSocialSchedule(form: FormData) {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/v1/admin/studio/delivery`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const result = await response.json();
  if (!response.ok) throw new APIError(result.error || 'Scheduling failed', response.status);
  return result as { status: string; post_id: string };
}

export interface ReviewDraft {
  draft_id: string;
  version: number;
  account_id: string;
  caption: string;
  due_at: string;
  has_media: boolean;
  status: 'draft' | 'submitting' | 'scheduled' | 'uncertain';
  post_id: string;
  updated_at: string;
}
export const getReviewDrafts = () => apiFetch<ReviewDraft[]>('/api/v1/admin/studio/review');
export async function saveReviewDraft(id: string, form: FormData) {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/v1/admin/studio/review/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const result = await response.json();
  if (!response.ok) throw new APIError(result.error || 'Saving failed', response.status);
  return result as { version: number };
}
/** Edit a queued post, or explicitly retry/reschedule a confirmed failed Instagram post. */
export async function editScheduledDraft(id: string, form: FormData) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE}/api/v1/admin/studio/review/${encodeURIComponent(id)}/schedule`,
    { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new APIError(result.error || 'The change could not be saved', response.status);
  return result as {
    status: string;
    post_id: string;
    version: number;
    changed: boolean;
    replaced?: boolean;
    retried?: boolean;
  };
}

export type RerollMode = 'text' | 'image' | 'both';
export interface DraftReroll {
  id: number;
  draft_id: string;
  mode: RerollMode;
  note: string;
  caption: string;
  image_sha256: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  error: string;
  result_draft_id: string;
  requested_at: string;
  finished_at: string | null;
}
export const getRerolls = () => apiFetch<DraftReroll[]>('/api/v1/admin/studio/rerolls');
export const requestReroll = (
  id: string,
  input: { mode: RerollMode; note?: string; caption?: string; image_sha256?: string },
) =>
  apiFetch<DraftReroll>(`/api/v1/admin/studio/review/${encodeURIComponent(id)}/reroll`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

export interface ChecklistState {
  item: string;
  checked: boolean;
}
export const approveReviewDraft = (id: string, version: number, checklist: ChecklistState[] = []) =>
  apiFetch<{ status: string; post_id: string }>(
    `/api/v1/admin/studio/review/${encodeURIComponent(id)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ version, approved: true, checklist }),
    },
  );

export type DecisionKind =
  | 'approved_as_is'
  | 'approved_edited'
  | 'rejected'
  | 'revision_requested'
  | 'snoozed'
  | 'favorited';
export interface DraftDecision {
  id: number;
  draft_id: string;
  platform: PostingPlatform;
  account: string;
  decision: DecisionKind;
  original_text: string;
  final_text: string;
  diff_stats: Record<string, number | boolean>;
  image_choice: 'prepared' | 'candidate' | 'uploaded' | 'none';
  original_due_at: string | null;
  final_due_at: string | null;
  reason_codes: string[];
  note: string;
  checklist: ChecklistState[];
  snooze_until: string | null;
  decided_by: string;
  decided_at: string;
}
export const getDraftDecisions = (since: string) =>
  apiFetch<DraftDecision[]>(`/api/v1/admin/studio/decisions?since=${encodeURIComponent(since)}`);
export const recordDraftDecision = (
  id: string,
  input: {
    decision: 'rejected' | 'revision_requested' | 'snoozed' | 'favorited';
    reasons?: string[];
    note?: string;
    checklist?: ChecklistState[];
    snooze_until?: string;
  },
) =>
  apiFetch<{ draft_id: string; decision: string }>(
    `/api/v1/admin/studio/review/${encodeURIComponent(id)}/decision`,
    { method: 'POST', body: JSON.stringify(input) },
  );
export async function getReviewDraftMedia(
  id: string,
  version: number,
  signal?: AbortSignal,
): Promise<Blob> {
  const token = getToken();
  const response = await fetch(
    `${API_BASE}/api/v1/admin/studio/review/${encodeURIComponent(id)}/media?version=${version}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    },
  );
  if (!response.ok) throw new APIError('Unable to load saved image', response.status);
  return response.blob();
}

export const getPost = (slug: string) =>
  apiFetch<APIPost>(`/api/v1/posts/${encodeURIComponent(slug)}`);
export interface PublicationDraft {
  id: string;
  platform: 'website' | 'patreon';
  title: string;
  body: string;
  excerpt: string;
  due_at: string;
  audience: string;
  version: number;
  status: string;
  provider_url: string;
  source: unknown;
}
export interface Publications {
  development_auto_publish?: boolean;
  drafts: PublicationDraft[];
  patreon_connected: boolean;
  patreon_audiences?: { value: string; label: string }[];
  patreon_connection_reason?: string;
  minimum_lead_hours: number;
}
export const getPublications = () => apiFetch<Publications>('/api/v1/admin/publications');
export const savePublication = (draft: PublicationDraft) =>
  apiFetch<{ version: number }>(`/api/v1/admin/publications/${encodeURIComponent(draft.id)}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  });
export const approvePublication = (id: string, version: number) =>
  apiFetch<{ status: string }>(`/api/v1/admin/publications/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify({ version, approved: true }),
  });

export const getPublishedProjects = () => apiFetch<APIProject[]>('/api/v1/catalog/projects');
export const approveProject = (project: APIProject) =>
  apiFetch<{ status: string }>(`/api/v1/admin/projects/${project.id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approved: true, updated_at: project.updated_at }),
  });
export const unpublishProject = (id: string) =>
  apiFetch<void>(`/api/v1/admin/projects/${id}/publication`, { method: 'DELETE' });

export interface BufferChannel {
  id: string;
  name: string;
  service: string;
  isDisconnected: boolean;
  isLocked: boolean;
  isQueuePaused: boolean;
}
export interface BufferReceipt {
  draft_id: string;
  version: number;
  channel_id: string;
  caption: string;
  replies?: string[] | null;
  due_at: string;
  status: 'submitting' | 'scheduled' | 'uncertain';
  post_id: string;
}
export interface BufferDelivery {
  configured: boolean;
  channels: BufferChannel[];
  receipts: BufferReceipt[];
}
export const getBufferDelivery = () => apiFetch<BufferDelivery>('/api/v1/admin/studio/buffer');
/** A Buffer X post with its delivery outcome; read-only. */
export interface BufferHistoryPost {
  id: string;
  text: string;
  channelId: string;
  dueAt: string;
  status: 'draft' | 'needs_approval' | 'scheduled' | 'sending' | 'sent' | 'error' | string;
  sentAt: string | null;
  externalLink: string | null;
  via: string;
  error: { message: string } | null;
  metrics: { type: string; value: number }[] | null;
  metricsUpdatedAt: string | null;
}
export interface BufferHistory {
  configured: boolean;
  checked_at?: string;
  posts: BufferHistoryPost[];
}
export const getBufferHistory = (refresh = false) =>
  apiFetch<BufferHistory>(`/api/v1/admin/studio/buffer/history${refresh ? '?refresh=1' : ''}`);
export const approveBufferDraft = (
  id: string,
  input: {
    channel_id: string;
    caption: string;
    replies: string[];
    original_text: string;
    due_at: string;
    approved: boolean;
  },
) =>
  apiFetch<BufferReceipt>(`/api/v1/admin/studio/buffer/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
export const editBufferDraft = (
  id: string,
  input: {
    channel_id: string;
    caption: string;
    replies: string[];
    due_at: string;
    approved: boolean;
    version: number;
  },
) =>
  apiFetch<BufferReceipt>(`/api/v1/admin/studio/buffer/${encodeURIComponent(id)}/schedule`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
