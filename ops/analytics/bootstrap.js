(() => {
  const websites = {
    'clpr.tv': 'b3e6e31d-b944-4c7e-8cf1-2818de87a773',
    'subcult.tv': '7c602313-7a18-400b-bcaf-8e605e8dfdd2',
    'hasanara.tv': '6ba0d7df-1290-4f9e-a824-25eb02e919ff',
    'seats.dsaslate.com': '7256b32d-7fb9-41df-85b3-76aa75fa4051',
    'www2.onnwee.me': 'ec34e94f-2c4c-474a-856a-dc071b0c6f26',
    'patchwork.subcult.tv': '7d0cea8b-54bc-4d88-be71-bccae97459f3',
    'os.subcult.tv': '84d0802e-b281-40fe-b543-86fd627e561b',
    'subcults.subcult.tv': '84d0802e-b281-40fe-b543-86fd627e561b',
    'undertow.subcult.tv': '2f82f9b2-0f39-4717-98a4-d1d57ae3ab6b',
  };
  const website = websites[location.hostname];
  if (!website || document.querySelector('script[data-subcult-umami]') ||
      navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

  window.subcultUmamiBeforeSend = (type, payload) => {
    if (type !== 'event') return false;
    if (payload.name && (location.hostname !== 'subcult.tv' ||
        !['patreon-outbound', 'newsletter-signup'].includes(payload.name))) return false;
    const url = new URL(payload.url || location.href, location.origin);
    if (location.hostname === 'subcult.tv' &&
        (url.origin !== location.origin || /^\/admin(?:\/|$)/.test(url.pathname))) return false;
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname
      .replace(/\/(tickets|reset-password|verify-email)\/[^/]+/g, '/$1/:token')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
    payload.url = url.pathname;
    payload.title = location.hostname;
    payload.website = website;
    delete payload.data;
    delete payload.id;
    if (payload.referrer) {
      try { payload.referrer = new URL(payload.referrer).origin + '/'; }
      catch { payload.referrer = ''; }
    }
    return payload;
  };

  const script = document.createElement('script');
  script.defer = true;
  script.src = '/umami/script.js';
  script.dataset.subcultUmami = 'true';
  script.dataset.websiteId = website;
  script.dataset.hostUrl = location.origin + '/umami';
  script.dataset.domains = location.hostname;
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  script.dataset.doNotTrack = 'true';
  script.dataset.beforeSend = 'subcultUmamiBeforeSend';
  document.head.appendChild(script);
})();
