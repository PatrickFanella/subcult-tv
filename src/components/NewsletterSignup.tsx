import { inputClass } from '@/components/ui/TextInput';
import { useState, type FormEvent } from 'react';
import { subscribe } from '@/lib/api';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await subscribe(email);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'subscription failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-ash border border-static p-6 text-center">
        <div className="font-mono text-sm text-static mb-1">✓ SUBSCRIBED</div>
        <p className="font-mono text-xs text-dust">{message}</p>
      </div>
    );
  }

  return (
    <div className="bg-ash border border-fog p-6">
      <div className="text-center mb-4">
        <p className="font-mono text-xs text-dust mb-2">&gt; SIGNAL BROADCAST</p>
        <h3 className="text-lg mb-1">Stay in the Loop</h3>
        <p className="text-sm text-bone">
          Get notified when we ship new projects or drop new zine entries.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          type="email"
          id="newsletter-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@signal.freq"
          className={`min-w-0 flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full sm:w-auto px-4 py-2 bg-signal text-void font-mono text-sm font-bold shrink-0
                     hover:bg-signal-dim transition-colors cursor-pointer disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'SUBSCRIBE'}
        </button>
      </form>

      {status === 'error' && (
        <p className="font-mono text-xs text-signal text-center mt-2">ERR: {message}</p>
      )}

      <p className="font-mono text-xs text-fog text-center mt-3">
        No spam. No tracking. Unsubscribe anytime.
      </p>
    </div>
  );
}
