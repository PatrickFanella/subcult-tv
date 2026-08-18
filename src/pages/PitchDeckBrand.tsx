import SEOHead from '@/components/SEOHead';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import GlitchFrame from '@/components/effects/GlitchFrame';
import TerminalPanel from '@/components/effects/TerminalPanel';
import {
  WHAT_WE_BUILD,
  ACTIVE_PROJECTS,
  ROADMAP,
  FUND_ALLOCATION,
} from '@/lib/investor-content';

export default function PitchDeckBrand() {
  return (
    <>
      <SEOHead
        title="Pitch Deck (Brand Edition)"
        noIndex
        description="SUBCULT investor pitch deck — brand edition. Tools, media, and infrastructure for the counterculture."
        path="/deck/brand"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Slide 1: Cover */}
        <section className="deck-slide min-h-[80vh] py-20">
          <GlitchFrame
            enableScanlines
            enableNoise
            enableTracking
            className="flex flex-col items-center justify-center text-center h-full"
          >
            <div className="zine-margin inline-block mb-6">
              <span className="font-mono text-xs text-dust tracking-widest uppercase">
                CLASSIFIED // INTERNAL
              </span>
            </div>
            <h1 className="mb-6 chromatic glitch-text">SUBCULT</h1>
            <p className="text-xl text-bone max-w-2xl leading-relaxed mb-4">
              Tools, media, and infrastructure for the counterculture.
            </p>
            <p className="font-mono text-sm text-dust">subcult.tv — February 2026</p>
            <div className="mt-8 font-mono text-xs text-dust opacity-50">
              &gt; LOADING DECK... [OK]
              <br />
              &gt; CLASSIFICATION: PARTNER_EYES_ONLY
            </div>
          </GlitchFrame>
        </section>

        {/* Slide 2: Problem */}
        <section className="deck-slide py-20">
          <GlitchFrame enableScanlines>
            <div className="zine-margin mb-4">
              <span className="font-mono text-xs text-dust">$ cat /var/log/failures.txt</span>
            </div>
            <h2 className="mb-10 text-center chromatic">The Problem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="halftone h-full">
                <Card className="p-6 border-signal h-full flex flex-col">
                  <h4 className="text-signal font-mono text-sm mb-3 uppercase tracking-wider">
                    Surveillance Tools
                  </h4>
                  <p className="text-bone text-sm flex-1">
                    Creator and developer tools are built on surveillance economics. Your workflow
                    data funds someone else's ad business. Privacy is an afterthought.
                  </p>
                </Card>
              </div>
              <div className="halftone-offset-1 h-full">
                <Card className="p-6 border-signal h-full flex flex-col">
                  <h4 className="text-signal font-mono text-sm mb-3 uppercase tracking-wider">
                    Consolidated Infra
                  </h4>
                  <p className="text-bone text-sm flex-1">
                    A handful of corporations control the platforms, hosting, and distribution
                    channels. Lock-in is the default. Portability is a fantasy.
                  </p>
                </Card>
              </div>
              <div className="halftone-offset-2 h-full">
                <Card className="p-6 border-signal h-full flex flex-col">
                  <h4 className="text-signal font-mono text-sm mb-3 uppercase tracking-wider">
                    Underfunded OSS
                  </h4>
                  <p className="text-bone text-sm flex-1">
                    The open-source ecosystem powers the internet but runs on burnout and good will.
                    Sustainable funding models are rare.
                  </p>
                </Card>
              </div>
            </div>
          </GlitchFrame>
        </section>

        {/* Slide 3: Solution */}
        <section className="deck-slide py-20">
          <div className="zine-margin mb-4">
            <span className="font-mono text-xs text-dust">&gt; COUNTERMEASURES INITIALIZED</span>
          </div>
          <h2 className="mb-10 text-center chromatic">Our Approach</h2>
          <GlitchFrame enableScanlines enableNoise>
            <TerminalPanel title="approach.manifest" className="max-w-3xl mx-auto">
              <div className="space-y-4">
                <div>
                  <span className="text-signal">01 //</span>{' '}
                  <span className="text-glow uppercase font-bold">Privacy-First, Open Source</span>
                  <br />
                  <span className="text-bone ml-6 inline-block">
                    Every tool we ship is open source. No telemetry, no tracking, no ads. You own
                    your data.
                  </span>
                </div>
                <div>
                  <span className="text-signal">02 //</span>{' '}
                  <span className="text-glow uppercase font-bold">Community-Funded</span>
                  <br />
                  <span className="text-bone ml-6 inline-block">
                    Funded by users. Patreon, commercial tiers, and consulting — not VC extraction
                    loops.
                  </span>
                </div>
                <div>
                  <span className="text-signal">03 //</span>{' '}
                  <span className="text-glow uppercase font-bold">Ship Weekly</span>
                  <br />
                  <span className="text-bone ml-6 inline-block">
                    Public roadmap, weekly releases, transparent development. Trust is earned.
                  </span>
                </div>
              </div>
            </TerminalPanel>
          </GlitchFrame>
        </section>

        {/* Slide 4: What We Build */}
        <section className="deck-slide py-20">
          <div className="zine-margin mb-4">
            <span className="font-mono text-xs text-dust">$ ls -la /subcult/projects/</span>
          </div>
          <h2 className="mb-10 text-center chromatic">What We Build</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_WE_BUILD.map((cat) => (
              <GlitchFrame key={cat.label} enableScanlines className="h-full">
                <Card className="p-5 h-full flex flex-col">
                  <h4 className="font-mono text-sm text-glow mb-2 uppercase tracking-wider">
                    {cat.label}
                  </h4>
                  <p className="text-xs text-bone flex-1">{cat.desc}</p>
                </Card>
              </GlitchFrame>
            ))}
          </div>
        </section>

        {/* Slide 5: Active Projects */}
        <section className="deck-slide py-20">
          <div className="torn-edge-top bg-smoke pt-8 pb-2 px-4 mb-8">
            <p className="font-mono text-xs text-dust text-center uppercase tracking-widest">
              // ACTIVE DEPLOYMENTS //
            </p>
          </div>
          <h2 className="mb-10 text-center chromatic">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACTIVE_PROJECTS.map((proj) => (
              <GlitchFrame key={proj.name} enableScanlines enableNoise className="h-full">
                <Card className="p-6 border-signal h-full flex flex-col">
                  <h4 className="font-mono text-sm text-glow mb-2 uppercase tracking-wider">
                    {proj.name}
                  </h4>
                  <p className="text-sm text-bone mb-3 flex-1">{proj.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {proj.stack.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs bg-smoke text-static px-2 py-0.5 border border-fog"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              </GlitchFrame>
            ))}
          </div>
          <div className="torn-edge-bottom bg-smoke mt-8 pt-2 pb-8 px-4">
            <p className="font-mono text-xs text-dust text-center">&gt; all systems nominal</p>
          </div>
        </section>

        {/* Slide 6: Market Opportunity */}
        <section className="deck-slide py-20">
          <GlitchFrame enableScanlines>
            <div className="zine-margin mb-4">
              <span className="font-mono text-xs text-dust">&gt; MARKET_ANALYSIS.scan()</span>
            </div>
            <h2 className="mb-10 text-center chromatic">Market Opportunity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="p-6 text-center border-signal">
                <p className="text-3xl font-display text-signal mb-2 chromatic">$32B+</p>
                <p className="font-mono text-xs text-dust uppercase">OSS Market (2026)</p>
              </Card>
              <Card className="p-6 text-center border-signal">
                <p className="text-3xl font-display text-signal mb-2 chromatic">40%</p>
                <p className="font-mono text-xs text-dust uppercase">Self-Hosted Growth YoY</p>
              </Card>
              <Card className="p-6 text-center border-signal">
                <p className="text-3xl font-display text-signal mb-2 chromatic">68%</p>
                <p className="font-mono text-xs text-dust uppercase">Devs Prefer Privacy Tools</p>
              </Card>
            </div>
            <p className="text-center text-xs text-dust font-mono">
              * Market estimates based on industry reports. Survey data from developer community
              polls.
            </p>
          </GlitchFrame>
        </section>

        {/* Slide 7: Traction */}
        <section className="deck-slide py-20">
          <div className="zine-margin mb-4">
            <span className="font-mono text-xs text-dust">$ uptime && echo "still shipping"</span>
          </div>
          <h2 className="mb-10 text-center chromatic">Traction</h2>
          <TerminalPanel title="traction.metrics" className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-display text-glow mb-1">5+</p>
                <p className="font-mono text-xs text-dust">Public Repos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-glow mb-1">Weekly</p>
                <p className="font-mono text-xs text-dust">Ship Cadence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-glow mb-1">[TBD]</p>
                <p className="font-mono text-xs text-dust">Newsletter</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-glow mb-1">[TBD]</p>
                <p className="font-mono text-xs text-dust">Patreon</p>
              </div>
            </div>
          </TerminalPanel>
          <GlitchFrame enableScanlines>
            <Card className="p-6">
              <h4 className="font-mono text-sm text-glow mb-3 uppercase tracking-wider">
                Key Milestones
              </h4>
              <ul className="space-y-2 text-sm text-bone">
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono">[+]</span>
                  <span>
                    Fully operational website with portfolio, zine, and investor materials
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono">[+]</span>
                  <span>Go API backend with admin dashboard and metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono">[+]</span>
                  <span>
                    Active development across multiple projects with public commit history
                  </span>
                </li>
              </ul>
            </Card>
          </GlitchFrame>
        </section>

        {/* Slide 8: Business Model */}
        <section className="deck-slide py-20">
          <GlitchFrame enableScanlines enableNoise>
            <div className="zine-margin mb-4">
              <span className="font-mono text-xs text-dust">&gt; REVENUE_STREAMS.init()</span>
            </div>
            <h2 className="mb-10 text-center chromatic">Business Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-signal h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs bg-static text-void px-2 py-0.5">ACTIVE</span>
                  <h4 className="font-mono text-sm text-glow uppercase tracking-wider">Patreon</h4>
                </div>
                <p className="text-sm text-bone flex-1">
                  Community funding via tiers. Early access, BTS updates, roadmap input.
                </p>
              </Card>
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">
                    PLANNED
                  </span>
                  <h4 className="font-mono text-sm text-glow uppercase tracking-wider">
                    Commercial Tiers
                  </h4>
                </div>
                <p className="text-sm text-bone flex-1">
                  Premium features and hosted versions for teams and businesses.
                </p>
              </Card>
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">
                    PLANNED
                  </span>
                  <h4 className="font-mono text-sm text-glow uppercase tracking-wider">
                    Consulting
                  </h4>
                </div>
                <p className="text-sm text-bone flex-1">
                  Implementation consulting for orgs adopting open-source infra.
                </p>
              </Card>
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">
                    PLANNED
                  </span>
                  <h4 className="font-mono text-sm text-glow uppercase tracking-wider">
                    Sponsorships
                  </h4>
                </div>
                <p className="text-sm text-bone flex-1">
                  Project sponsorships from aligned companies. No surveillance sponsors.
                </p>
              </Card>
            </div>
          </GlitchFrame>
        </section>

        {/* Slide 9: Roadmap */}
        <section className="deck-slide py-20">
          <div className="torn-edge-top bg-smoke pt-6 pb-2 px-4 mb-6">
            <p className="font-mono text-xs text-dust text-center uppercase tracking-widest">
              // DEPLOYMENT SCHEDULE //
            </p>
          </div>
          <h2 className="mb-10 text-center chromatic">Roadmap</h2>
          <TerminalPanel title="roadmap.2026" className="max-w-3xl mx-auto">
            <div className="space-y-3">
              {ROADMAP.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-cyan font-bold flex-shrink-0">{item.q}</span>
                  <span className="text-dust">=&gt;</span>
                  <span className="text-chalk">{item.item}</span>
                </div>
              ))}
            </div>
          </TerminalPanel>
          <div className="torn-edge-bottom bg-smoke mt-6 pt-2 pb-6 px-4">
            <p className="font-mono text-xs text-dust text-center">
              &gt; schedule confirmed. deploying...
            </p>
          </div>
        </section>

        {/* Slide 10: The Ask + Contact */}
        <section className="deck-slide py-20">
          <GlitchFrame enableScanlines enableNoise enableTracking>
            <div className="zine-margin mb-4">
              <span className="font-mono text-xs text-dust">&gt; FUNDING.allocate()</span>
            </div>
            <h2 className="mb-10 text-center chromatic">The Ask</h2>

            <div className="max-w-3xl mx-auto mb-12">
              <TerminalPanel title="fund.allocation">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FUND_ALLOCATION.map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-3xl font-display text-signal mb-1">{item.pct}%</p>
                      <p className="font-mono text-xs text-dust uppercase">{item.label}</p>
                    </div>
                  ))}
                </div>
              </TerminalPanel>
            </div>

            <div className="text-center py-8 border-t border-fog">
              <h3 className="mb-4 chromatic">Let's Talk</h3>
              <p className="text-bone max-w-xl mx-auto mb-8 text-sm">
                Interested in partnering? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button as="a" href="mailto:invest@subcult.tv" size="lg">
                  Email Us
                </Button>
                <Button as="link" to="/contact" variant="signal" size="lg">
                  Contact Us
                </Button>
              </div>
              <p className="font-mono text-xs text-dust mt-6">invest@subcult.tv — subcult.tv</p>
              <p className="font-mono text-[10px] text-dust mt-4 opacity-40">
                &gt; END TRANSMISSION // SUBCULT {new Date().getFullYear()}
              </p>
            </div>
          </GlitchFrame>
        </section>
      </div>
    </>
  );
}
