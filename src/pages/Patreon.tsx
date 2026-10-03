import { useEffect, useState } from 'react';
import { getPatreonCampaign } from '@/lib/api';
import { publishedTiers, type SupportTier } from '@/lib/patreon-tiers';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import { PATREON_URL } from '@/lib/links';

const SUPPORT_OUTCOMES = [
  {
    label: 'Hosting',
    detail: 'Domains, storage, servers and the services that keep public software reachable.',
  },
  {
    label: 'Hours',
    detail:
      'Bug fixes, security updates, documentation and releases. Maintenance is most of the work, and nobody sees it when it goes well.',
  },
  {
    label: 'Early research',
    detail:
      'Time to look into a community need before anyone knows whether the idea can pay for itself.',
  },
];

// Reference list for an unavailable Patreon API. Names and prices follow
// studio/content/patreon/support-redesign-2026-10/patreon-copy.md.
const TIERS: SupportTier[] = [
  {
    name: 'Follow free',
    price: '$0',
    amountCents: 0,
    includes: ['Public posts and announcements on Patreon'],
  },
  {
    name: 'Supporter',
    price: '$5 / month',
    amountCents: 500,
    includes: [
      'Private supporter channels in our Discord',
      'Supporter posts on Patreon',
      'Behind-the-scenes material and exclusive releases, occasionally, when we share them',
    ],
  },
  {
    name: 'Backer',
    price: '$10 / month',
    amountCents: 1000,
    includes: [
      'Same access as Supporter',
      'The extra five dollars goes toward tools, hosting and time',
    ],
  },
  {
    name: 'Patron',
    price: '$25 / month',
    amountCents: 2500,
    includes: [
      'Same access as Supporter and Backer',
      'A larger contribution, and that is the whole difference',
    ],
  },
  {
    name: 'Groceries',
    price: '$400 / month',
    amountCents: 40000,
    includes: [
      'Feed the person making the things.',
      'Same supporter access as the other paid tiers, with no extra deliverables',
    ],
  },
  {
    name: 'Rent',
    price: '$1,500 / month',
    amountCents: 150000,
    includes: [
      'Pay my rent. Literally.',
      'Same supporter access as the other paid tiers, and no extra deliverables',
    ],
  },
];

// Tiers at or above this amount are listed apart from the everyday ones.
const LARGE_TIER_CENTS = 10000;

const OTHER_WAYS = [
  {
    label: 'Work on the code',
    detail: 'Read the source, open an issue, fix the documentation or send a patch.',
    href: 'https://git.subcult.tv/subculture-collective',
    action: 'Open the repositories ↗',
    external: true,
  },
  {
    label: 'Use it and report what breaks',
    detail:
      'A report from real use is worth more to us than applause. Tell us where it falls short.',
    href: '/contact',
    action: 'Tell us what broke',
    external: false,
  },
  {
    label: 'Back a specific project',
    detail:
      'If you or your organization want to pay for a defined piece of public work, we can talk about scope.',
    href: '/contact',
    action: 'Write to us',
    external: false,
  },
];

const FAQS = [
  {
    question: 'Does payment unlock the software?',
    answer:
      'No. The products, repositories and releases stay public either way. A paid membership gets you into the private channels in our Discord and the supporter posts on Patreon.',
  },
  {
    question: 'Do higher tiers get more?',
    answer:
      'No. Every paid tier has the same access. The amount you choose is the size of your contribution.',
  },
  {
    question: 'How often do you post?',
    answer:
      'There is no fixed schedule. Supporter posts, behind-the-scenes material and exclusive releases appear when we have something to share.',
  },
  {
    question: 'What do I need for the Discord channels?',
    answer:
      'A Discord account. The community rules apply there. Membership gets you into the channels; it does not promise a reply from any one of us.',
  },
  {
    question: 'What does support not include?',
    answer:
      'Ownership, a vote, a release schedule, commissions or private consulting. You can share ideas in the supporter channels. They are input, and the decisions stay with us.',
  },
  {
    question: 'Can I follow without paying?',
    answer:
      'Yes. Follow SUBCULT for free on Patreon for the public posts, or get the monthly newsletter by email at the bottom of any page.',
  },
  {
    question: 'Can I help without spending money?',
    answer:
      'Yes. Use the software and report specific problems. Fix the documentation. Send a patch. Show it to a group that could use it.',
  },
  {
    question: 'How do I check where the effort goes?',
    answer:
      'The repositories and their release history are public, so the work is on the record whether or not we post about it.',
  },
];

const SHELL = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
const RAIL = 'grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-10';

function TierList({ tiers }: { tiers: SupportTier[] }) {
  return (
    <div className="support-tiers">
      {tiers.map((tier) => (
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
  );
}

export default function Patreon() {
  const [tiers, setTiers] = useState<SupportTier[] | null>(null);
  useEffect(() => {
    let active = true;
    getPatreonCampaign()
      .then((data) => {
        if (active && data.campaign) setTiers(publishedTiers(data.tiers));
      })
      .catch(() => {
        /* Keep the reference list when the provider is unavailable. */
      });
    return () => {
      active = false;
    };
  }, []);
  const shown = tiers ?? TIERS;
  const everyday = shown.filter((tier) => tier.amountCents < LARGE_TIER_CENTS);
  const large = shown.filter((tier) => tier.amountCents >= LARGE_TIER_CENTS);
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
                  Paying doesn’t unlock the software. It stays public either way. A paid membership
                  helps cover hosting, tools and hours, and gets you into the private channels in
                  our Discord and the supporter posts on Patreon. We post when we have something to
                  share, not on a schedule. Following is free.
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
              <a href="#support-work">
                <span>01</span> Where the money goes
              </a>
              <a href="#memberships">
                <span>02</span> Memberships
              </a>
              <a href="#support-questions">
                <span>03</span> Before you pay
              </a>
            </nav>
          </div>
        </section>

        <section id="support-work" className="border-b border-fog py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">01 / THE LEDGER</p>
            <div className="min-w-0">
              <div className="max-w-3xl mb-10">
                <h2 className="mb-4">Where your money goes</h2>
                <p className="text-bone leading-relaxed">
                  Three lines on the ledger. The first two keep what exists running. The third is
                  how new work starts.
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
                <h2 className="mb-4">Memberships</h2>
                <p className="text-bone leading-relaxed">
                  Every paid tier gets the same things: the private channels in our Discord and the
                  supporter posts on Patreon. The price is how much you want to put in. Following is
                  free.
                </p>
              </div>
              {tiers === null && (
                <p className="font-mono text-xs text-dust mb-5">
                  Reference tiers shown below, not live data. Check Patreon for the current tiers
                  and prices.
                </p>
              )}
              {tiers?.length === 0 && (
                <p>
                  Patreon lists no published tiers right now. Check the Patreon page for details.
                </p>
              )}
              <TierList tiers={everyday} />
              {large.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl mb-3">Feeling unusually generous?</h3>
                  <p className="text-bone leading-relaxed max-w-3xl mb-5">
                    The names are a joke. The monthly payments are real. Same access as the other
                    paid tiers, nothing extra, and nobody is expected to pick these.
                  </p>
                  <TierList tiers={large} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="support-agreement py-12 md:py-16">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-signal pt-2">03 / THE AGREEMENT</p>
            <blockquote className="min-w-0 font-display text-3xl md:text-5xl uppercase tracking-wide text-glow leading-tight break-words">
              Paying doesn’t unlock the software. It stays public either way.
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
                  A bug report we can reproduce is worth as much to us as a subscription. So is a
                  documentation fix. Give what you can keep giving.
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
              <h2 className="mb-10">Before you pay</h2>
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
            <p className="font-mono text-xs text-dust pt-2">06 / PATREON</p>
            <div className="min-w-0 max-w-3xl">
              <h2 className="mb-5">Follow, or back the workshop</h2>
              <p className="text-bone leading-relaxed mb-8 max-w-2xl">
                Both happen on Patreon. If money is tight, use the software and tell us what broke.
                That counts.
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
