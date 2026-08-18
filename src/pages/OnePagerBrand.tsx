import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import GlitchFrame from '@/components/effects/GlitchFrame';
import TerminalPanel from '@/components/effects/TerminalPanel';

export default function OnePagerBrand() {
  return (
    <>
      <SEOHead
        title="One-Pager (Brand Edition)"
        noIndex
        description="SUBCULT executive summary — brand edition. Tools, media, and infrastructure for the counterculture."
        path="/onepager/brand"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="onepager-content">
          {/* Header */}
          <GlitchFrame
            enableScanlines
            enableNoise
            enableTracking
            className="mb-8 pb-6 border-b border-signal"
          >
            <div className="text-center">
              <div className="zine-margin inline-block mb-3">
                <span className="font-mono text-[10px] text-dust tracking-widest uppercase">
                  CLASSIFIED // PARTNER BRIEF
                </span>
              </div>
              <h1 className="mb-2 text-4xl chromatic glitch-text">SUBCULT</h1>
              <p className="text-lg text-bone">
                Tools, media, and infrastructure for the counterculture.
              </p>
              <p className="font-mono text-xs text-dust mt-2">&gt; subcult.tv — February 2026</p>
            </div>
          </GlitchFrame>

          {/* What We Do */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-signal pb-1 chromatic-mild font-mono uppercase tracking-wider">
              <span className="text-dust text-xs mr-2">//</span>What We Do
            </h2>
            <p className="text-sm text-bone">
              SUBCULT builds open-source developer tools, self-hosted software, and media production
              pipelines. Everything we ship is privacy-first, community-funded, and built in the
              open. We serve developers, creators, and anyone who refuses to be optimized by
              surveillance-economy defaults.
            </p>
          </div>

          {/* Problem / Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <GlitchFrame enableScanlines>
              <div className="halftone p-4">
                <h2 className="text-lg mb-2 border-b border-signal pb-1 font-mono uppercase tracking-wider text-signal">
                  Problem
                </h2>
                <ul className="space-y-2 text-sm text-bone">
                  <li className="flex items-start gap-2">
                    <span className="text-scan font-mono mt-0.5">[!]</span>
                    <span>
                      Creator and dev tools are surveillance machines that monetize your workflow
                      data
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-scan font-mono mt-0.5">[!]</span>
                    <span>
                      Infrastructure consolidated under a few corps — lock-in is the default
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-scan font-mono mt-0.5">[!]</span>
                    <span>Open source powers the internet but is underfunded and burning out</span>
                  </li>
                </ul>
              </div>
            </GlitchFrame>
            <GlitchFrame enableScanlines>
              <div className="halftone p-4">
                <h2 className="text-lg mb-2 border-b border-static pb-1 font-mono uppercase tracking-wider text-static">
                  Solution
                </h2>
                <ul className="space-y-2 text-sm text-bone">
                  <li className="flex items-start gap-2">
                    <span className="text-static font-mono mt-0.5">[+]</span>
                    <span>
                      Privacy-first, open-source tools — no telemetry, no tracking, no ads
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-static font-mono mt-0.5">[+]</span>
                    <span>
                      Community-funded via Patreon and commercial tiers — not VC extraction
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-static font-mono mt-0.5">[+]</span>
                    <span>
                      Ship weekly with public roadmap — trust earned through transparent execution
                    </span>
                  </li>
                </ul>
              </div>
            </GlitchFrame>
          </div>

          {/* Active Projects */}
          <div className="mb-6">
            <div className="torn-edge-top bg-smoke pt-4 pb-1 px-3 mb-3">
              <h2 className="text-lg font-mono uppercase tracking-wider text-center chromatic-mild">
                Active Projects
              </h2>
            </div>
            <TerminalPanel title="ls -la /projects/" prompt="$ ">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'subcult.tv', desc: 'Portfolio + zine hub' },
                  { name: 'clpr', desc: 'Twitch clip curation' },
                  { name: 'Cutroom', desc: 'AI video pipeline' },
                  { name: 'Subcorp', desc: 'Multi-agent system' },
                ].map((p) => (
                  <div key={p.name}>
                    <p className="text-glow text-xs font-bold">{p.name}</p>
                    <p className="text-bone text-[10px]">{p.desc}</p>
                  </div>
                ))}
              </div>
            </TerminalPanel>
            <div className="torn-edge-bottom bg-smoke mt-3 pt-1 pb-4 px-3" />
          </div>

          {/* Traction / Business Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <GlitchFrame enableScanlines>
              <div>
                <h2 className="text-lg mb-2 border-b border-signal pb-1 font-mono uppercase tracking-wider chromatic-mild">
                  <span className="text-dust text-xs mr-2">//</span>Traction
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-ash border border-signal p-2 text-center">
                    <p className="font-display text-lg text-signal">5+</p>
                    <p className="font-mono text-[10px] text-dust">Public Repos</p>
                  </div>
                  <div className="bg-ash border border-signal p-2 text-center">
                    <p className="font-display text-lg text-signal">Weekly</p>
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
            </GlitchFrame>
            <div>
              <h2 className="text-lg mb-2 border-b border-signal pb-1 font-mono uppercase tracking-wider chromatic-mild">
                <span className="text-dust text-xs mr-2">//</span>Revenue
              </h2>
              <ul className="space-y-1.5 text-sm text-bone">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-static text-void px-1.5 py-0.5">LIVE</span>
                  <span>Patreon community funding</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">NEXT</span>
                  <span>Commercial tool tiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">NEXT</span>
                  <span>Implementation consulting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-flicker text-void px-1.5 py-0.5">NEXT</span>
                  <span>Project sponsorships</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Roadmap */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-signal pb-1 font-mono uppercase tracking-wider chromatic-mild">
              <span className="text-dust text-xs mr-2">//</span>Roadmap 2026
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
              <span>
                <span className="text-cyan font-bold">Q1</span>{' '}
                <span className="text-bone">Public launch + Zine</span>
              </span>
              <span>
                <span className="text-cyan font-bold">Q2</span>{' '}
                <span className="text-bone">Commercial beta</span>
              </span>
              <span>
                <span className="text-cyan font-bold">Q3</span>{' '}
                <span className="text-bone">Media suite v1</span>
              </span>
              <span>
                <span className="text-cyan font-bold">Q4</span>{' '}
                <span className="text-bone">Platform expansion</span>
              </span>
            </div>
          </div>

          {/* The Ask + Contact */}
          <GlitchFrame enableScanlines enableNoise>
            <div className="pt-4 border-t border-signal">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg mb-1 chromatic-mild font-mono uppercase tracking-wider">
                    The Ask
                  </h2>
                  <p className="text-xs text-bone font-mono">
                    <span className="text-signal">60%</span> Eng /{' '}
                    <span className="text-signal">20%</span> Infra /{' '}
                    <span className="text-signal">10%</span> Community /{' '}
                    <span className="text-signal">10%</span> Ops
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Button as="a" href="mailto:invest@subcult.tv" size="sm">
                    Email Us
                  </Button>
                  <Button as="link" to="/contact" variant="signal" size="sm">
                    Contact Us
                  </Button>
                </div>
              </div>
              <p className="font-mono text-[10px] text-dust mt-2">
                &gt; invest@subcult.tv — subcult.tv — END TRANSMISSION
              </p>
            </div>
          </GlitchFrame>
        </div>
      </div>
    </>
  );
}
