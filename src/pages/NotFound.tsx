import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import { useLocation } from 'react-router-dom';
import { useHydrated } from '@/lib/use-hydrated';

export default function NotFound() {
  const { pathname } = useLocation();
  // The static 404 page is served at any unknown address, so the address is
  // filled in after hydration instead of being baked into the markup.
  const attempted = useHydrated() ? pathname : '';
  return (
    <>
      <SEOHead path="/404" notFound />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <p className="font-mono text-xs text-bone mb-4">&gt; ERROR 404</p>
        <h1 className="mb-6 chromatic">SIGNAL LOST</h1>
        <p className="text-bone max-w-md mx-auto mb-8 leading-relaxed">
          There’s no page at this address. It may have moved or never existed. Check the URL, or
          start again from the homepage.
        </p>
        <div className="font-mono text-sm text-bone mb-8 space-y-1">
          <p>&gt; attempted route: {attempted}</p>
          <p>&gt; status: NOT_FOUND</p>
          <p>&gt; suggestion: return home</p>
        </div>
        <Button as="link" to="/" size="lg">
          ← Back to the homepage
        </Button>
      </div>
    </>
  );
}
