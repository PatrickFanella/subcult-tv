import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';

// Brevo redirects here after someone clicks the double opt-in link.
export default function NewsletterConfirmed() {
  return (
    <>
      <SEOHead path="/newsletter/confirmed" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <p className="showcase-eyebrow">SUBCULT / PRODUCT UPDATES</p>
        <h1 className="mb-6">You’re subscribed.</h1>
        <p className="text-bone text-lg leading-relaxed mb-8">
          You’ll get product releases and development updates by email. Every email has an
          unsubscribe link.
        </p>
        <Button as="link" to="/products" variant="secondary">
          See the products →
        </Button>
      </div>
    </>
  );
}
