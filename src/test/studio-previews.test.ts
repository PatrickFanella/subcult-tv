import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearToken, getStudioPreview, setToken } from '@/lib/api';

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  clearToken();
  setToken('preview-session-a');
});
afterEach(() => vi.unstubAllGlobals());

it('reuses concurrent and revisited previews without reusing another session', async () => {
  const blob = new Blob(['preview']);
  const fetch = vi.fn().mockResolvedValue({ ok: true, blob: async () => blob });
  vi.stubGlobal('fetch', fetch);
  const [first, duplicate] = await Promise.all([getStudioPreview('a'), getStudioPreview('a')]);
  expect(first).toBe(duplicate);
  expect(await getStudioPreview('a')).toBe(first);
  expect(fetch).toHaveBeenCalledOnce();
  clearToken();
  setToken('preview-session-b');
  await getStudioPreview('a');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer preview-session-b');
});

it('does not cache a failed preview request', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 429 })
    .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(['preview']) });
  vi.stubGlobal('fetch', fetch);
  await expect(getStudioPreview('a')).rejects.toMatchObject({ status: 429 });
  await expect(getStudioPreview('a')).resolves.toBeInstanceOf(Blob);
  expect(fetch).toHaveBeenCalledTimes(2);
});
