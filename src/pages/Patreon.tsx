import { Code2, FlaskConical, HeartHandshake, Server, ShieldCheck, Wrench } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import TerminalPanel from '@/components/effects/TerminalPanel';

const SUPPORT_OUTCOMES = [
  {
    icon: Server,
    label: 'Pay the infrastructure bills',
    detail:
      'Contributions pay for domains, storage, hosting, and the services that keep public software available.',
  },
  {
    icon: Wrench,
    label: 'Fund maintenance time',
    detail:
      'Support pays for the hours spent fixing bugs, applying security updates, writing documentation, and preparing releases.',
  },
  {
    icon: FlaskConical,
    label: 'Test useful ideas',
    detail:
      'Support pays for early research into a community need before the idea has a business model.',
  },
];

const OTHER_WAYS = [
  {
    icon: Code2,
    label: 'Contribute to the code',
    detail: 'Read the source, open an issue, improve the documentation, or send a patch.',
    href: 'https://git.subcult.tv/subculture-collective',
    action: 'Open the repositories ↗',
    external: true,
  },
  {
    icon: ShieldCheck,
    label: 'Use it and report what breaks',
    detail: 'Real-world feedback is more useful than applause. Tell us where the work falls short.',
    href: '/contact',
    action: 'Send useful feedback',
    external: false,
  },
  {
    icon: HeartHandshake,
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
      'No. The software and useful project materials stay public. A payment funds the work and never unlocks a private-access tier.',
  },
  {
    question: 'What do supporters receive?',
    answer:
      'The same project updates, releases, and repositories as everyone else. Patreon support does not buy exclusive content, early access, or private status.',
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

const SHELL = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
const RAIL = 'grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)] gap-6 md:gap-10';

export default function Patreon() {
  return (
    <>
      <SEOHead path="/support" />

      <div className="overflow-x-clip">
        <section className="border-b border-fog">
          <div className={`${SHELL} py-16 md:py-24`}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-10 lg:gap-16 items-center">
              <div className="min-w-0">
                <p className="font-mono text-xs text-dust mb-4">&gt; MEMBERSHIP_WITHOUT_A_GATE</p>
                <h1 className="mb-6 max-w-4xl text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98] break-words">
                  Fund public tools for independent culture
                </h1>
                <p className="text-bone max-w-3xl text-lg md:text-xl leading-relaxed mb-8">
                  Support CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow. Monthly
                  support pays hosting bills and funds maintenance, documentation, and research. The
                  resulting work stays public.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                  <Button
                    as="a"
                    href="https://www.patreon.com/subcult"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Support monthly ↗
                  </Button>
                  <Button
                    as="link"
                    to="/products"
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    See the work first
                  </Button>
                </div>
              </div>

              <TerminalPanel title="support.status" className="min-w-0 w-full">
                <div className="break-words">
                  <span className="text-chalk">access: </span>
                  <span className="text-static">PUBLIC</span>
                  <br />
                  <span className="text-chalk">funding: </span>
                  <span className="text-flicker">COMMUNITY SUPPORTED</span>
                  <br />
                  <span className="text-chalk">proof: </span>
                  <span className="text-cyan">REPOS // RELEASES // NOTES</span>
                  <br />
                  <br />
                  <span className="text-dust"># contributions fund public work.</span>
                </div>
              </TerminalPanel>
            </div>
          </div>
        </section>

        <section className="bg-soot border-b border-fog py-16 md:py-24">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">// 01 · WHY SUPPORT</p>
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
                  <article key={item.label} className="min-w-0 bg-ash border border-fog p-6 md:p-7">
                    <div className="flex items-center justify-between mb-6">
                      <item.icon className="w-7 h-7 text-signal" aria-hidden="true" />
                      <span className="font-mono text-xs text-fog">0{index + 1}</span>
                    </div>
                    <h3 className="text-xl mb-3 break-words">{item.label}</h3>
                    <p className="text-sm text-bone leading-relaxed">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-fog py-14 md:py-20">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-signal pt-2">// 02 · CONTRACT</p>
            <blockquote className="min-w-0 font-display text-3xl md:text-5xl uppercase tracking-wide text-glow leading-tight break-words">
              Supporters fund public work. They do not buy a private-access tier.
            </blockquote>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">// 03 · CONTRIBUTE</p>
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
                  <article
                    key={item.label}
                    className="min-w-0 flex flex-col bg-ash border border-fog p-6"
                  >
                    <item.icon className="w-7 h-7 text-static mb-5" aria-hidden="true" />
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

        <section className="bg-soot border-y border-fog py-16 md:py-24">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">// 04 · FAQ</p>
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

        <section className="py-16 md:py-24">
          <div className={`${SHELL} ${RAIL}`}>
            <p className="font-mono text-xs text-dust pt-2">// 05 · ACT</p>
            <div className="min-w-0 max-w-3xl">
              <h2 className="mb-5">Keep the work going</h2>
              <p className="text-bone leading-relaxed mb-8 max-w-2xl">
                Become a monthly supporter to fund infrastructure and maintenance. If you cannot
                contribute money, use the work and report what needs improvement.
              </p>
              <Button
                as="a"
                href="https://www.patreon.com/subcult"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="w-full sm:w-auto"
              >
                Support SUBCULT on Patreon ↗
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
