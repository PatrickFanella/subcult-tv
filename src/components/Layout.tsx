import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import ProjectCatalogProvider from '@/context/ProjectCatalogProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GlitchFrame from '@/components/effects/GlitchFrame';

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <span className="font-mono text-dust text-sm cursor-blink">&gt; fetching signal...</span>
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </GlitchFrame>
    </ProjectCatalogProvider>
  );
}
