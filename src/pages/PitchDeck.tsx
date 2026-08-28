import SEOHead from '@/components/SEOHead';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WHAT_WE_BUILD, ACTIVE_PROJECTS, ROADMAP, FUND_ALLOCATION } from '@/lib/investor-content';

export default function PitchDeck() {
  return (
    <>
      <SEOHead
        title="Pitch Deck"
        noIndex
        description="SUBCULT investor pitch deck. Tools, media, and infrastructure for the counterculture."
        path="/deck"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Slide 1: Cover */}
        <section className="deck-slide flex flex-col items-center justify-center min-h-[80vh] text-center py-20">
          <p className="font-mono text-xs text-dust mb-6 tracking-widest uppercase">
            Investor Presentation
          </p>
          <h1 className="mb-6">SUBCULT</h1>
          <p className="text-xl text-bone max-w-2xl leading-relaxed mb-4">
            Tools, media, and infrastructure for the counterculture.
          </p>
          <p className="font-mono text-sm text-dust">subcult.tv | August 2026</p>
        </section>

        {/* Slide 2: Problem */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">The Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 h-full flex flex-col">
              <h4 className="text-signal font-mono text-sm mb-3">Surveillance Tools</h4>
              <p className="text-bone text-sm flex-1">
                Hosted tools can collect workflow data and tie core work to vendor accounts and
                policies.
              </p>
            </Card>
            <Card className="p-6 h-full flex flex-col">
              <h4 className="text-signal font-mono text-sm mb-3">Consolidated Infrastructure</h4>
              <p className="text-bone text-sm flex-1">
                Hosted infrastructure can make migration, independent operation, and long-term
                access difficult.
              </p>
            </Card>
            <Card className="p-6 h-full flex flex-col">
              <h4 className="text-signal font-mono text-sm mb-3">Underfunded Open Source</h4>
              <p className="text-bone text-sm flex-1">
                Public software requires ongoing engineering, documentation, maintenance, and
                hosting.
              </p>
            </Card>
          </div>
        </section>

        {/* Slide 3: Solution */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Our Approach</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-signal text-lg">01</span>
                  <div>
                    <h4 className="text-glow font-mono text-sm mb-1">Public and Self-Hosted</h4>
                    <p className="text-bone text-sm">
                      The catalog links to public repositories. Projects offer self-hosting where
                      their current implementation supports it.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-mono text-signal text-lg">02</span>
                  <div>
                    <h4 className="text-glow font-mono text-sm mb-1">Public-Work Funding</h4>
                    <p className="text-bone text-sm">
                      Patreon support funds public work. It does not buy private access or roadmap
                      control. Commercial services remain planned.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-mono text-signal text-lg">03</span>
                  <div>
                    <h4 className="text-glow font-mono text-sm mb-1">Published Project States</h4>
                    <p className="text-bone text-sm">
                      The public catalog records active and incubating work. Repository history
                      shows the work behind each listed project.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Slide 4: What We Build */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">What We Build</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_WE_BUILD.map((cat) => (
              <Card key={cat.label} className="p-5 h-full flex flex-col">
                <h4 className="font-mono text-sm text-glow mb-2">{cat.label}</h4>
                <p className="text-xs text-bone flex-1">{cat.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Slide 5: Selected Projects */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Selected Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACTIVE_PROJECTS.map((proj) => (
              <Card key={proj.name} className="p-6 h-full flex flex-col">
                <h4 className="font-mono text-sm text-glow mb-2">{proj.name}</h4>
                <p className="text-sm text-bone mb-3 flex-1">{proj.desc}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {proj.stack.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs bg-smoke text-dust px-2 py-0.5 border border-fog"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Slide 6: Market Opportunity */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Operating Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 text-center">
              <p className="text-3xl font-display text-signal mb-2">Public</p>
              <p className="font-mono text-xs text-dust uppercase">
                Repositories Linked in Catalog
              </p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-display text-signal mb-2">Mixed</p>
              <p className="font-mono text-xs text-dust uppercase">Active and Incubating Work</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-3xl font-display text-signal mb-2">Four Uses</p>
              <p className="font-mono text-xs text-dust uppercase">Defined Funding Allocation</p>
            </Card>
          </div>
          <p className="text-center text-xs text-dust font-mono">
            Project states come from the public catalog. Funding uses are listed in this deck.
          </p>
        </section>

        {/* Slide 7: Traction */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Project Evidence</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 text-center">
              <p className="text-2xl font-display text-glow mb-1">37</p>
              <p className="font-mono text-xs text-dust">Catalogued Repos</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-display text-glow mb-1">Active</p>
              <p className="font-mono text-xs text-dust">Current Work</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-display text-glow mb-1">Incubating</p>
              <p className="font-mono text-xs text-dust">Earlier-Stage Work</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-2xl font-display text-glow mb-1">Public</p>
              <p className="font-mono text-xs text-dust">Repository Links</p>
            </Card>
          </div>
          <div className="mt-8">
            <Card className="p-6">
              <h4 className="font-mono text-sm text-glow mb-3">Key Milestones</h4>
              <ul className="space-y-2 text-sm text-bone">
                <li className="flex items-start gap-2">
                  <span className="text-static">+</span>
                  <span>Public website with project catalog, zine, and investor materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static">+</span>
                  <span>Go API backend with admin dashboard and metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-static">+</span>
                  <span>
                    Project catalog with active and incubating states and repository links
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Slide 8: Business Model */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Business Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-signal h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs bg-static text-void px-2 py-0.5">ACTIVE</span>
                <h4 className="font-mono text-sm text-glow">Patreon</h4>
              </div>
              <p className="text-sm text-bone flex-1">
                Support funds public work. It does not buy private access or roadmap control.
              </p>
            </Card>
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">PLANNED</span>
                <h4 className="font-mono text-sm text-glow">Commercial Tiers</h4>
              </div>
              <p className="text-sm text-bone flex-1">
                Premium features and hosted versions of open-source tools for teams and businesses.
              </p>
            </Card>
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">PLANNED</span>
                <h4 className="font-mono text-sm text-glow">Consulting</h4>
              </div>
              <p className="text-sm text-bone flex-1">
                Implementation consulting for organizations adopting open-source infrastructure.
              </p>
            </Card>
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs bg-flicker text-void px-2 py-0.5">PLANNED</span>
                <h4 className="font-mono text-sm text-glow">Sponsorships</h4>
              </div>
              <p className="text-sm text-bone flex-1">
                Project and content sponsorships reviewed against the scope of the public work.
              </p>
            </Card>
          </div>
        </section>

        {/* Slide 9: Roadmap */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">Roadmap</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {ROADMAP.map((item, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-24">
                    <span className="font-mono text-sm text-signal font-bold">{item.q}</span>
                  </div>
                  <div className="flex-1">
                    <Card className="p-4">
                      <p className="text-sm text-bone">{item.item}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 10: The Ask + Contact */}
        <section className="deck-slide py-20">
          <h2 className="mb-10 text-center">The Ask</h2>

          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="font-mono text-sm text-dust mb-6 text-center">Investment Allocation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FUND_ALLOCATION.map((item) => (
                <Card key={item.label} className="p-5 text-center">
                  <p className="text-3xl font-display text-signal mb-1">{item.pct}%</p>
                  <p className="font-mono text-xs text-dust">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center py-8 border-t border-fog">
            <h3 className="mb-4">Investor Contact</h3>
            <p className="text-bone max-w-xl mx-auto mb-8 text-sm">
              For funding or partnership questions, email invest@subcult.tv or use the contact form.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="mailto:invest@subcult.tv" size="lg">
                Email invest@subcult.tv
              </Button>
              <Button as="link" to="/contact" variant="secondary" size="lg">
                Contact form
              </Button>
            </div>
            <p className="font-mono text-xs text-dust mt-6">invest@subcult.tv | subcult.tv</p>
          </div>
        </section>
      </div>
    </>
  );
}
