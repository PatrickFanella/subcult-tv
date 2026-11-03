import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import ProjectCatalogProvider from '@/context/ProjectCatalogProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { RouteFallback } from '@/components/RouteFallback';
import GlitchFrame from '@/components/effects/GlitchFrame';

export default function Layout() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  // A new entry (PUSH) starts at the top, or at the hash target, and moves
  // keyboard focus to the main region. Back/forward (POP) keeps the browser's
  // restored scroll position; REPLACE (redirects) keeps the current one.
  useEffect(() => {
    if (navigationType !== 'PUSH') return;
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname, hash, key, navigationType]);

  return (
    <ProjectCatalogProvider>
      <GlitchFrame
        enableScanlines
        enableNoise
        enableTracking
        className="min-h-screen flex flex-col"
      >
        <Nav />
        <main id="main-content" className="flex-1 scroll-mt-28" tabIndex={-1}>
          <Suspense fallback={<RouteFallback label="fetching signal" />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </GlitchFrame>
    </ProjectCatalogProvider>
  );
}
