import { inputClass } from '@/components/ui/TextInput';
import { useId, useState, type FormEvent } from 'react';
import { subscribe } from '@/lib/api';
import { trackCampaignEvent } from '@/lib/analytics';

interface NewsletterSignupProps {
  /** Heading level that fits the page outline: h3 in the footer, h2 on /newsletter. */
  headingLevel?: 'h2' | 'h3';
}

export default function NewsletterSignup({ headingLevel: Heading = 'h3' }: NewsletterSignupProps) {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const res = await subscribe(email);
      setStatus('success');
      trackCampaignEvent('newsletter-signup');
      setMessage(res.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error
          ? err.message
          : 'The sign-up did not go through. Try again in a minute.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="bg-ash border border-static p-6 text-center">
        <div className="font-mono text-sm text-static mb-1">✓ REQUEST RECEIVED</div>
        <p className="font-mono text-xs text-dust">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-ash border border-fog p-6">
      <div className="text-center mb-4">
        <p className="font-mono text-xs text-dust mb-2">SUBCULT / MONTHLY NEWSLETTER</p>
        <Heading className="text-lg mb-1">One email a month</Heading>
        <p className="text-sm text-bone">Releases, and what we’re working on.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <label htmlFor={emailInputId} className="sr-only">
          Email address
        </label>
        <input
          type="email"
          id={emailInputId}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          placeholder="you@example.com"
          className={`min-w-0 flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full sm:w-auto px-4 py-2 bg-signal text-void font-mono text-sm font-bold shrink-0
                     hover:bg-glow transition-colors cursor-pointer disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'SUBSCRIBE'}
        </button>
      </form>

      {status === 'error' && (
        <p role="alert" className="font-mono text-xs text-glow text-center mt-2">
          Not subscribed. {message}
        </p>
      )}

      <p className="font-mono text-xs text-dust text-center mt-3">
        Every email has an unsubscribe link.{' '}
        <a href="/privacy#newsletter" className="underline underline-offset-4">
          How we use your email
        </a>
      </p>
    </div>
  );
}
