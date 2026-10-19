export const PRODUCT_ROUTES: Record<string, string> = {
  clpr: 'clpr',
  patchwork: 'patchwork',
  hasanara: 'hasanara',
  'transcript-create': 'rekolekt',
  'subcult-os': 'subcult-os',
  undertow: 'undertow',
  prichal: 'prichal',
  kork: 'kork',
  subsets: 'subsets',
  'left-field': 'left-field',
  tadooer: 'tadooer',
  'chatty-cat': 'chatty-cat',
  headcount: 'headcount',
  backline: 'backline',
  arkhiv: 'arkhiv',
  overlaid: 'overlaid',
  pirs: 'pirs',
  'tmux-popups': 'tmux-popups',
  'omarchy-monitor-bar': 'omarchy-monitor-bar',
  'omarchy-superproductivity': 'omarchy-superproductivity',
  'omarchy-plugin-spool': 'spool',
  'omarchy-plugin-shelfish': 'shelfish',
  'obsidian-plugin-metronome-tuner': 'metronome-tuner',
  'super-productivity-mcp': 'super-productivity-mcp',
};

export function getProductPath(slug: string): string {
  return PRODUCT_ROUTES[slug] ? `/products/${PRODUCT_ROUTES[slug]}` : `/projects/${slug}`;
}
