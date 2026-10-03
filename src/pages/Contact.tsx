import { inputClass } from '@/components/ui/TextInput';
import { useState, type FormEvent } from 'react';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import { useSearchParams } from 'react-router-dom';
import { getShowcaseProducts } from '@/lib/showcase';
import { submitContact } from '@/lib/api';
import { PATREON_URL } from '@/lib/links';

const SOCIAL_LINKS = [
  {
    name: 'Gitea',
    url: 'https://git.subcult.tv/subculture-collective',
    handle: 'subculture-collective',
  },
  {
    name: 'Patreon',
    url: PATREON_URL,
    handle: 'support.subcult.tv',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/subcult.tv',
    handle: '@subcult.tv',
  },
  {
    name: 'X',
    url: 'https://x.com/subcult_tv',
    handle: '@subcult_tv',
  },
  {
    name: 'Email',
    url: 'mailto:info@subcult.tv',
    handle: 'info@subcult.tv',
  },
];

export default function Contact() {
  const [searchParams] = useSearchParams();
  const product = getShowcaseProducts().find(
    ({ project }) => project.slug === searchParams.get('product'),
  )?.project;
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: product ? `${product.name} question` : '',
    message: '',
  });
  const mailtoUrl = `mailto:info@subcult.tv?subject=${encodeURIComponent(
    formData.subject || 'Contact from subcult.tv',
  )}&body=${encodeURIComponent(
    `From: ${formData.name} (${formData.email})\n\n${formData.message}`,
  )}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || undefined,
        message: formData.message,
      });
      setSubmitted(true);
    } catch {
      setError(
        'We could not send your message. Nothing you typed was lost. Try again, or send it as an email.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead path="/contact" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-12">
          <p className="font-mono text-xs text-dust mb-3">SUBCULT / CONTACT</p>
          <h1 className="mb-4">Contact</h1>
          <p className="text-bone max-w-2xl">
            Ask about a product, report a bug, or tell us what you’re working on.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="mb-6">
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Send a message
            </h2>

            {submitted ? (
              <div className="border border-static p-6" role="status">
                <h3 className="mb-3">Message received</h3>
                <p className="text-bone">We have it. We’ll reply to the email address you gave.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-mono text-xs text-bone uppercase mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block font-mono text-xs text-bone uppercase mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block font-mono text-xs text-bone uppercase mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClass}
                    placeholder="what's this about?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block font-mono text-xs text-bone uppercase mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputClass + ' resize-y'}
                    placeholder="what happened, or what you need"
                  />
                </div>

                {error && !submitted && (
                  <div className="p-3 bg-signal/10 border border-signal text-signal font-mono text-xs">
                    <p>⚠ {error}</p>
                    <a href={mailtoUrl} className="inline-block mt-2 text-glow underline">
                      Open your message as an email draft
                    </a>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send message'}
                </Button>

                <p className="font-mono text-xs text-fog text-center mt-2">
                  Your message goes to Subculture Collective.
                </p>
              </form>
            )}
          </div>

          {/* Social / Direct */}
          <div>
            <h2 className="mb-6">
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Direct channels
            </h2>

            <div className="space-y-4 mb-8">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="flex items-center justify-between p-4 bg-ash border border-fog hover:border-signal transition-colors no-underline group"
                >
                  <div>
                    <span className="font-mono text-sm text-glow group-hover:text-signal transition-colors">
                      {link.name}
                    </span>
                    <span className="block font-mono text-xs text-dust mt-0.5">{link.handle}</span>
                  </div>
                  <span className="text-dust group-hover:text-signal transition-colors">↗</span>
                </a>
              ))}
            </div>

            <div className="border-t border-fog pt-6">
              <h3 className="mb-3">Reporting a problem</h3>
              <p className="text-bone">
                Tell us which product you’re using, what you expected, and what happened instead. A
                link or the steps to reproduce it help us find the cause.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
