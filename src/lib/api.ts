// ═══════════════════════════════════════════════════════════
// SUBCULT API Client
// Typed fetch wrapper for the Go backend.
// ═══════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Token management ─────────────────────────────────────────

let authToken: string | null = null;

export function setToken(token: string | null) {
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
  return apiFetch<APIProject[]>(`/api/v1/projects${qs ? '?' + qs : ''}`);
}

export async function getProject(slug: string) {
  return apiFetch<APIProject>(`/api/v1/projects/${slug}`);
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

export async function listPosts(opts?: { page?: number; perPage?: number; all?: boolean }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.perPage) params.set('per_page', String(opts.perPage));
  if (opts?.all) params.set('all', 'true');
  const qs = params.toString();
  return apiFetch<PaginatedResponse<APIPost>>(`/api/v1/posts${qs ? '?' + qs : ''}`);
}

export async function getPost(slug: string) {
  return apiFetch<APIPost>(`/api/v1/posts/${slug}`);
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

export async function unsubscribe(token: string) {
  return apiFetch<{ message: string }>('/api/v1/newsletter/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

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

export interface PublicStats {
  projects: number;
  posts: number;
  subscribers: number;
  last_updated: string;
}

export async function getPublicStats() {
  return apiFetch<PublicStats>('/api/v1/stats');
}

export interface StudioBrand {
  slug: string;
  name: string;
  direction: string;
  guide: string;
  preview: string;
  logos: string[];
  tokens: { colors: Record<string, string>; fonts: Record<string, string> };
}
export interface StudioMedia {
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
  tags: { name: string; count: number }[];
  collections: { name: string; count: number }[];
}
export const getStudioReferences = (params: URLSearchParams, signal?: AbortSignal) =>
  apiFetch<ReferenceResults>(`/api/v1/admin/studio/references?${params}`, { signal });
export const getStudioReferenceFacets = (signal?: AbortSignal) =>
  apiFetch<ReferenceFacets>('/api/v1/admin/studio/references/facets', { signal });
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
