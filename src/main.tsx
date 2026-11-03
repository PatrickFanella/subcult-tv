import { createRoot, hydrateRoot } from 'react-dom/client';
import AppRoot from '@/components/AppRoot';
import { installCampaignLinkTracking } from '@/lib/analytics';
import { normalizePath } from '@/lib/normalize-path';
import '@/index.css';
import '@/styles/subcult-brand.css';

installCampaignLinkTracking();

const root = document.getElementById('root')!;

// scripts/prerender-meta.ts writes each public route's markup into #root and
// records the route it was rendered for. nginx serves that file for the same
// path, so the markup matches and React hydrates it instead of blanking the
// page until the route chunk loads. Any other case (dev server, the shell
// served for /development/* and /admin, a 404 page at an unknown path) starts
// from an empty root.
const prerenderedFor = root.dataset.prerendered;
if (
  root.hasChildNodes() &&
  prerenderedFor !== undefined &&
  normalizePath(prerenderedFor) === normalizePath(window.location.pathname)
) {
  hydrateRoot(root, <AppRoot />);
} else {
  root.replaceChildren();
  createRoot(root).render(<AppRoot />);
}
