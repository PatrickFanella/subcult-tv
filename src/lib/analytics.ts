// The same-origin edge bootstrap owns the tracker and its privacy filter.
// Fixed names carry no email, URL, token, or other user-entered properties.
type CampaignEvent = 'patreon-outbound' | 'newsletter-signup';
declare global {
  interface Window {
    umami?: { track: (name: CampaignEvent) => unknown };
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}
export function trackCampaignEvent(name: CampaignEvent) {
  if (
    navigator.doNotTrack === '1' ||
    navigator.globalPrivacyControl === true ||
    location.pathname.startsWith('/admin')
  )
    return;
  try {
    void Promise.resolve(window.umami?.track(name)).catch(() => {
      /* A failed collection request never affects the form or link. */
    });
  } catch {
    /* Analytics never blocks a user action. */
  }
}
export function installCampaignLinkTracking() {
  const onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[href]');
    if (link && new URL(link.href, location.origin).hostname === 'support.subcult.tv')
      trackCampaignEvent('patreon-outbound');
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
