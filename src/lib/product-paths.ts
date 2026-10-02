export const PRODUCT_ROUTES: Record<string, string> = {
  clpr: 'clpr',
  patchwork: 'patchwork',
  hasanara: 'hasanara',
  'transcript-create': 'rekolekt',
  'subcult-os': 'subcult-os',
  undertow: 'undertow',
  prichal: 'prichal',
  kork: 'kork',
};

export function getProductPath(slug: string): string {
  return PRODUCT_ROUTES[slug] ? `/products/${PRODUCT_ROUTES[slug]}` : `/projects/${slug}`;
}
