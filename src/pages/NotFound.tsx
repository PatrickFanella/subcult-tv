import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';

export default function NotFound() {
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
          <p>&gt; attempted route: {window.location.pathname}</p>
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
