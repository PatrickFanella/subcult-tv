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
            <p className="font-mono text-xs text-dust mt-2">subcult.tv | August 2026</p>
          </div>

          {/* What We Do */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-fog pb-1">What We Do</h2>
            <p className="text-sm text-bone">
              SUBCULT builds developer tools, self-hosted software, media pipelines, and community
              software. The public catalog links to repositories and records whether each project is
              active or incubating.
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
                    Hosted tools can collect workflow data and tie core work to vendor accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-signal font-mono mt-0.5">-</span>
                  <span>
                    Hosted infrastructure can make migration and independent operation difficult
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-signal font-mono mt-0.5">-</span>
                  <span>
                    Public software requires ongoing engineering, documentation, and hosting
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Solution</h2>
              <ul className="space-y-2 text-sm text-bone">
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>
                    Public repositories and self-hosted options where each project supports them
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>
                    Patreon support funds public work without private access or roadmap control
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static font-mono mt-0.5">+</span>
                  <span>Current project states and planned work are published on subcult.tv</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Selected Projects */}
          <div className="mb-6">
            <h2 className="text-lg mb-2 border-b border-fog pb-1">Selected Projects</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'subcult.tv', desc: 'Active: site, catalog, and zine' },
                { name: 'clpr', desc: 'Active: Twitch clip curation' },
                { name: 'Cutroom', desc: 'Incubating: video pipeline' },
                { name: 'Subcorp', desc: 'Incubating: multi-agent system' },
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
              <h2 className="text-lg mb-2 border-b border-fog pb-1">Project Snapshot</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">37</p>
                  <p className="font-mono text-[10px] text-dust">Catalogued Repos</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">Active</p>
                  <p className="font-mono text-[10px] text-dust">Current Work</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">Incubating</p>
                  <p className="font-mono text-[10px] text-dust">Earlier-Stage Work</p>
                </div>
                <div className="bg-ash border border-fog p-2 text-center">
                  <p className="font-display text-lg text-glow">Public</p>
                  <p className="font-mono text-[10px] text-dust">Repository Links</p>
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
                  <span>Patreon funding for public work</span>
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
            <h2 className="text-lg mb-2 border-b border-fog pb-1">Roadmap</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
              <span>
                <span className="text-signal">Current</span>{' '}
                <span className="text-bone">Maintain active projects and catalog</span>
              </span>
              <span>
                <span className="text-signal">Next</span>{' '}
                <span className="text-bone">Advance incubating projects</span>
              </span>
              <span>
                <span className="text-signal">Next</span>{' '}
                <span className="text-bone">Evaluate commercial services</span>
              </span>
              <span>
                <span className="text-signal">Later</span>{' '}
                <span className="text-bone">Project sponsorships and partnerships</span>
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
            <p className="font-mono text-[10px] text-dust mt-2">invest@subcult.tv | subcult.tv</p>
          </div>
        </div>
      </div>
    </>
  );
}
