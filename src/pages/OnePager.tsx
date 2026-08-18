import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';

export default function OnePager() {
  return (
    <>
      <SEOHead
        title="One-Pager"
        noIndex
        description="SUBCULT executive summary. Tools, media, and infrastructure for the counterculture."
        path="/onepager"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="onepager-content">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-fog">
            <h1 className="mb-2 text-4xl">SUBCULT</h1>
            <p className="text-lg text-bone">
              Tools, media, and infrastructure for the counterculture.
            </p>
            <p className="font-mono text-xs text-dust mt-2">subcult.tv — February 2026</p>
          </div>

          {/* What We Do */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-fog pb-1">What We Do</h2>
            <p className="text-sm text-bone">
              SUBCULT builds open-source developer tools, self-hosted software, and media production
              pipelines. Everything we ship is privacy-first, community-funded, and built in the
              open. We serve developers, creators, and anyone who refuses to be optimized by
              surveillance-economy defaults.
            </p>
          </div>

          {/* Problem / Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Problem</h2>
              <ul className="space-y-2 text-sm text-bone">
                <li className="flex items-start gap-2">
                  <span className="text-signal font-mono mt-0.5">-</span>
                  <span>
                    Creator and dev tools are surveillance machines that monetize your workflow data
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-signal font-mono mt-0.5">-</span>
                  <span>
                    Infrastructure is consolidated under a few corporations — lock-in is the default
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-signal font-mono mt-0.5">-</span>
                  <span>
                    Open source powers the internet but is underfunded and running on burnout
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Solution</h2>
              <ul className="space-y-2 text-sm text-bone">
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>Privacy-first, open-source tools — no telemetry, no tracking, no ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>Community-funded via Patreon and commercial tiers — not VC extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>
                    Ship weekly with public roadmap — trust is earned through transparent execution
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Active Projects */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-fog pb-1">Active Projects</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'subcult.tv', desc: 'Portfolio + zine hub' },
                { name: 'clpr', desc: 'Twitch clip curation platform' },
                { name: 'Cutroom', desc: 'AI video production pipeline' },
                { name: 'Subcorp', desc: 'Self-hosted multi-agent system' },
              ].map((p) => (
                <div key={p.name} className="bg-ash border border-fog p-3">
                  <p className="font-mono text-xs text-glow mb-1">{p.name}</p>
                  <p className="text-xs text-bone">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Traction / Business Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Traction</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">5+</p>
                  <p className="font-mono text-[10px] text-dust">Public Repos</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">Weekly</p>
                  <p className="font-mono text-[10px] text-dust">Ship Cadence</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">[TBD]</p>
                  <p className="font-mono text-[10px] text-dust">Newsletter</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">[TBD]</p>
                  <p className="font-mono text-[10px] text-dust">Patreon</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Business Model</h2>
              <ul className="space-y-1.5 text-sm text-bone">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-static text-void px-1.5 py-0.5">
                    ACTIVE
                  </span>
                  <span>Patreon community funding</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">
                    PLANNED
                  </span>
                  <span>Commercial tool tiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">
                    PLANNED
                  </span>
                  <span>Implementation consulting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">
                    PLANNED
                  </span>
                  <span>Project sponsorships</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-fog pb-1">Roadmap 2026</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
              <span>
                <span className="text-signal">Q1</span>{' '}
                <span className="text-bone">Public launch + Zine series</span>
              </span>
              <span>
                <span className="text-signal">Q2</span>{' '}
                <span className="text-bone">Commercial tool beta</span>
              </span>
              <span>
                <span className="text-signal">Q3</span>{' '}
                <span className="text-bone">Media suite v1</span>
              </span>
              <span>
                <span className="text-signal">Q4</span>{' '}
                <span className="text-bone">Platform expansion</span>
              </span>
            </div>
          </div>

          {/* The Ask + Contact */}
          <div className="pt-4 border-t border-fog">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg mb-1">The Ask</h2>
                <p className="text-xs text-bone">
                  60% Engineering / 20% Infrastructure / 10% Community / 10% Ops
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button as="a" href="mailto:invest@subcult.tv" size="sm">
                  Email Us
                </Button>
                <Button as="link" to="/contact" variant="secondary" size="sm">
                  Contact Us
                </Button>
              </div>
            </div>
            <p className="font-mono text-[10px] text-dust mt-2">invest@subcult.tv — subcult.tv</p>
          </div>
        </div>
      </div>
    </>
  );
}
