/// <reference types="node" />
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { installCampaignLinkTracking, trackCampaignEvent } from '@/lib/analytics';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});
describe('campaign analytics', () => {
  it('counts the Patreon redirect link without user properties', () => {
    const track = vi.fn();
    window.umami = { track };
    const remove = installCampaignLinkTracking();
    document.body.innerHTML =
      '<a href="https://support.subcult.tv"><span>Support</span></a><a href="https://example.com">Other</a>';
    document.querySelector('span')!.click();
    document.querySelectorAll('a')[1].click();
    remove();
    delete window.umami;
    expect(track).toHaveBeenCalledExactlyOnceWith('patreon-outbound');
  });
  it('honors GPC and tolerates an unavailable tracker', () => {
    const track = vi.fn();
    window.umami = { track };
    vi.stubGlobal('navigator', { globalPrivacyControl: true });
    trackCampaignEvent('newsletter-signup');
    expect(track).not.toHaveBeenCalled();
    delete window.umami;
    expect(() => trackCampaignEvent('newsletter-signup')).not.toThrow();
  });
});

const bootstrap = readFileSync('ops/analytics/bootstrap.js', 'utf8');
function edge(host = 'subcult.tv', gpc = false) {
  const window: Record<
    string,
    (type: string, payload: Record<string, unknown>) => Record<string, unknown> | false
  > = {};
  const appendChild = vi.fn();
  runInNewContext(bootstrap, {
    window,
    URL,
    location: { hostname: host, origin: `https://${host}`, href: `https://${host}/support` },
    navigator: { globalPrivacyControl: gpc },
    document: {
      querySelector: () => null,
      createElement: () => ({ dataset: {} }),
      head: { appendChild },
    },
  });
  return { filter: window.subcultUmamiBeforeSend, appendChild };
}
describe('edge privacy filter candidate', () => {
  it('accepts only the two fixed campaign events and drops user properties', () => {
    const { filter } = edge();
    expect(
      filter('event', {
        name: 'newsletter-signup',
        url: 'https://subcult.tv/support?email=private#token',
        data: { email: 'private' },
        id: 'private',
      }),
    ).toMatchObject({ name: 'newsletter-signup', url: '/support', title: 'subcult.tv' });
    const result = filter('event', {
      name: 'patreon-outbound',
      url: '/support',
      data: { email: 'private' },
      id: 'private',
    });
    expect(result).not.toHaveProperty('data');
    expect(result).not.toHaveProperty('id');
    expect(filter('event', { name: 'email-private', url: '/support' })).toBe(false);
    expect(filter('event', { url: '/admin/studio' })).toBe(false);
    expect(filter('event', { url: 'https://other.example/support' })).toBe(false);
  });
  it('preserves pageviews on other sites and suppresses their custom events', () => {
    const { filter } = edge('clpr.tv');
    expect(filter('event', { url: '/discover?query=private' })).toMatchObject({ url: '/discover' });
    expect(filter('event', { name: 'newsletter-signup', url: '/' })).toBe(false);
    expect(edge('subcult.tv', true).appendChild).not.toHaveBeenCalled();
  });
});
