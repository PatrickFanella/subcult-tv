import SEOHead from '@/components/SEOHead';
import NewsletterSignup from '@/components/NewsletterSignup';

// A standalone sign-up page, so posts and profiles can link straight to it.
export default function Newsletter() {
  return (
    <>
      <SEOHead path="/newsletter" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <p className="showcase-eyebrow">SUBCULT / MONTHLY NEWSLETTER</p>
        <h1 className="mb-6">The newsletter</h1>
        <p className="text-bone text-lg leading-relaxed mb-8">
          One email a month with releases and what we’re working on. You confirm by clicking the
          link in the first email, and every email has an unsubscribe link.
        </p>
        <NewsletterSignup />
      </div>
    </>
  );
}
