import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <SEOHead title="404 | Signal Lost" path="/404" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <p className="font-mono text-xs text-bone mb-4">&gt; ERROR 404</p>
        <h1 className="mb-6 chromatic">SIGNAL LOST</h1>
        <p className="text-bone max-w-md mx-auto mb-8 leading-relaxed">
          No page exists at this frequency. Check the route below or return to the home signal.
        </p>
        <div className="font-mono text-sm text-bone mb-8 space-y-1">
          <p>&gt; attempted route: {window.location.pathname}</p>
          <p>&gt; status: NOT_FOUND</p>
          <p>&gt; suggestion: return to base frequency</p>
        </div>
        <Button as="link" to="/" size="lg">
          ← Return to Home
        </Button>
      </div>
    </>
  );
}
