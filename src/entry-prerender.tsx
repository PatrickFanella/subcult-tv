import { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { Route, Routes, StaticRouter } from 'react-router-dom';
import { EffectsProvider } from '@/context/EffectsContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import { RouteFallback } from '@/components/RouteFallback';
import DevelopmentLog from '@/pages/DevelopmentLog';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProductLanding from '@/pages/ProductLanding';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Patreon from '@/pages/Patreon';
import Newsletter from '@/pages/Newsletter';
import NewsletterConfirmed from '@/pages/NewsletterConfirmed';
import NotFound from '@/pages/NotFound';

// Only public, source-owned pages enter this build. No network requests or
// authenticated state run while rendering; effects run later in the browser.
// The wrapper tree (ErrorBoundary, Suspense, Layout) mirrors src/App.tsx so the
// browser can hydrate this markup instead of replacing it.
export function render(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <EffectsProvider>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback label="loading signal" />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Projects />} />
                <Route path="products/:slug" element={<ProductLanding />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="support" element={<Patreon />} />
                <Route path="development" element={<DevelopmentLog />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="newsletter/confirmed" element={<NewsletterConfirmed />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </EffectsProvider>
    </StaticRouter>,
  );
}
