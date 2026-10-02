import { useEffect, useState } from 'react';
import { getPatreonCampaign } from '@/lib/api';
import { publishedTiers } from '@/lib/patreon-tiers';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import { PATREON_URL } from '@/lib/links';

const SUPPORT_OUTCOMES = [
  {
    label: 'Pay for hosting',
    detail:
      'Contributions pay for domains, storage, hosting, and the services that keep public software available.',
  },
  {
    label: 'Fund maintenance time',
    detail:
      'Support pays for the hours spent fixing bugs, applying security updates, writing documentation, and preparing releases.',
  },
  {
    label: 'Test useful ideas',
    detail:
      'Support pays for early research into a community need before the idea has a business model.',
  },
];

// Reviewed fallback for an unavailable Patreon API.
const TIERS = [
  {
    name: 'Free follow',
    price: '$0',
    includes: ['Public updates and occasional previews', 'Invitations to try new work and respond'],
  },
  {
    name: 'Backer',
    price: '$10 / month',
    includes: [
      'One field note a week from the workshop',
      'A monthly studio ledger: what shipped, changed, stalled, and comes next',
      'Selected early previews and drafts when they exist',
      'Occasional advisory questions, with their scope stated up front',
      'The supporter archive',
    ],
  },
];

const OTHER_WAYS = [
  {
    label: 'Contribute to the code',
    detail: 'Read the source, open an issue, improve the documentation, or send a patch.',
    href: 'https://git.subcult.tv/subculture-collective',
    action: 'Open the repositories ↗',
    external: true,
  },
  {
    label: 'Use it and report what breaks',
    detail: 'Real-world feedback is more useful than applause. Tell us where the work falls short.',
    href: '/contact',
    action: 'Send useful feedback',
    external: false,
  },
  {
    label: 'Back a specific project',
    detail: 'Organizations and individuals can discuss supporting a defined piece of public work.',
    href: '/contact',
    action: 'Start a conversation',
    external: false,
  },
];

const FAQS = [
  {
    question: 'Does payment unlock the software?',
    answer:
      'No. The products, repositories, and releases stay public. Backers get the workshop behind them: field notes, the ledger, and early previews.',
  },
  {
    question: 'What does support not include?',
    answer:
      'Ownership, governance, a release schedule, or private consulting. Advisory questions are input, and each one says what it can and cannot change.',
  },
  {
    question: 'Can I follow without paying?',
    answer:
      'Yes. Follow SUBCULT for free on Patreon, or get the monthly newsletter by email at the bottom of any page.',
  },
  {
    question: 'Can I help without spending money?',
    answer:
      'Yes. Use the projects, report specific problems, improve documentation, contribute code, or introduce the work to a community that needs it.',
  },
  {
    question: 'How can I verify where the effort goes?',
    answer:
      'Follow the product pages, repositories, and release history. The work is public, so you can check it yourself.',
  },
];

const SHELL = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
const RAIL = 'grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-10';

export default function Patreon() {
  const [tiers, setTiers] = useState<typeof TIERS | null>(null);
  useEffect(() => {
    let active = true;
    getPatreonCampaign()
      .then((data) => {
        if (active && data.campaign) setTiers(publishedTiers(data.tiers));
      })
      .catch(() => {
        /* Keep the reviewed fallback when the provider is unavailable. */
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <SEOHead path="/support" />

      <div className="support-page overflow-x-clip">
        <section className="showcase-hero support-hero">
          <div className={SHELL}>
            <img src="/brand/subcult/master.svg" alt="" className="subcult-hero-mark" />
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-20 items-end">
              <div className="min-w-0">
                <p className="showcase-eyebrow">SUBCULT / THE WORKSHOP</p>
                <h1 className="showcase-title">
                  Support the workshop
                  <br />
                  <span>behind the products.</span>
                </h1>
              </div>
              <div className="min-w-0">
                <p className="text-bone text-lg leading-relaxed mb-6">
                  CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow stay public. Patreon
                  is the workshop behind them: weekly field notes, a monthly studio ledger, and
                  early previews. Follow for free, or back the work at $10 a month.
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  <Button
                    as="a"
                    href={PATREON_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="support-primary"
                  >
                    Join on Patreon ↗
                  </Button>
                  <a href="/products" className="support-secondary font-mono text-sm">
                    See the work first →
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="subcult-product-bar">
            <nav className={`showcase-index ${SHELL}`} aria-label="Support sections">
              <a href="#memberships">
                <span>01</span> Memberships
              </a>
              <a href="#support-work">
                <span>02</span> What support funds
              </a>
              <a href="#support-questions">
                <span>03</span> Before you contribute
              </a>
            </nav>
          </div>
        </section>

        <section id="support-work" className="border-b border-fog py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">01 / WHY SUPPORT</p>
            <div className="min-w-0">
              <div className="max-w-3xl mb-10">
                <h2 className="mb-4">Where your money goes</h2>
                <p className="text-bone leading-relaxed">
                  Contributions cover two costs: keeping the software online, and the time it takes
                  to maintain it.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {SUPPORT_OUTCOMES.map((item, index) => (
                  <article key={item.label} className="support-item min-w-0">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-sm text-static">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl mb-3 break-words">{item.label}</h3>
                    <p className="text-sm text-bone leading-relaxed">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="memberships" className="border-b border-fog py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">02 / MEMBERSHIPS</p>
            <div className="min-w-0">
              <div className="max-w-3xl mb-10">
                <h2 className="mb-4">Membership options</h2>
                <p className="text-bone leading-relaxed">
                  Start by following for free. Back the work when the process is useful to you.
                </p>
              </div>
              {tiers === null && (
                <p className="font-mono text-xs text-dust mb-5">
                  Reference benefits shown below. Check Patreon for the current offer.
                </p>
              )}
              {tiers?.length === 0 && (
                <p>No published tiers are available. Visit Patreon for membership details.</p>
              )}
              <div className="support-tiers">
                {(tiers ?? TIERS).map((tier) => (
                  <article key={tier.name} className="support-tier min-w-0">
                    <div className="support-tier-heading">
                      <h3 className="text-xl break-words">{tier.name}</h3>
                      <span className="font-mono text-lg text-static">{tier.price}</span>
                    </div>
                    <ul className="space-y-2 text-sm text-bone leading-relaxed">
                      {tier.includes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-static" aria-hidden="true">
                            +
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="support-agreement py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-signal pt-2">03 / THE AGREEMENT</p>
            <blockquote className="min-w-0 font-display text-3xl md:text-5xl uppercase tracking-wide text-glow leading-tight break-words">
              The products stay public. Support pays for the work and opens the workshop.
            </blockquote>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">04 / CONTRIBUTE</p>
            <div className="min-w-0">
              <div className="max-w-3xl mb-10">
                <h2 className="mb-4">Other ways to help</h2>
                <p className="text-bone leading-relaxed">
                  A useful bug report, a documentation fix, or an honest introduction can matter as
                  much as a subscription. Choose the contribution you can sustain.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {OTHER_WAYS.map((item) => (
                  <article key={item.label} className="support-item min-w-0 flex flex-col">
                    <h3 className="text-xl mb-3 break-words">{item.label}</h3>
                    <p className="text-sm text-bone leading-relaxed mb-6 flex-1">{item.detail}</p>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-signal hover:text-glow break-words"
                      >
                        {item.action}
                      </a>
                    ) : (
                      <Button
                        as="link"
                        to={item.href}
                        variant="ghost"
                        className="self-start max-w-full px-0 text-left whitespace-normal"
                      >
                        {item.action} →
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="support-questions" className="border-y border-fog py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">05 / QUESTIONS</p>
            <div className="min-w-0">
              <h2 className="mb-10">Before you contribute</h2>
              <div className="divide-y divide-fog border-y border-fog">
                {FAQS.map((item) => (
                  <div
                    key={item.question}
                    className="py-6 grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-3 lg:gap-8"
                  >
                    <h3 className="font-mono text-sm text-glow break-words">{item.question}</h3>
                    <p className="min-w-0 text-sm text-bone leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">06 / FOLLOW THE WORK</p>
            <div className="min-w-0 max-w-3xl">
              <h2 className="mb-5">Keep the work going</h2>
              <p className="text-bone leading-relaxed mb-8 max-w-2xl">
                Follow for free or back the workshop on Patreon. If you can’t contribute money, use
                the work and tell us what needs fixing.
              </p>
              <Button
                as="a"
                href={PATREON_URL}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="w-full sm:w-auto"
              >
                Go to Patreon ↗
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
