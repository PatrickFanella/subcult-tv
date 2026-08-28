import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TerminalPanel from '@/components/effects/TerminalPanel';

const WHAT_WE_BUILD = [
  'Developer tools and infrastructure with public repositories',
  'Self-hosted productivity and creative software',
  'Audio, video, transcription, and publishing tools',
  'Data, research, and source-tracing tools',
  'Technical documentation and zines',
  'Software for events, governance, mutual aid, and community discovery',
];

const WHY_NOW = [
  {
    title: 'Public Work',
    detail: 'The project catalog links to working repositories and records each project state.',
  },
  {
    title: 'Operating Model',
    detail: 'Patreon support funds public work. It does not buy private access or roadmap control.',
  },
  {
    title: 'Funding Use',
    detail: 'Funds are allocated to engineering, infrastructure, community work, and operations.',
  },
];

const WHATS_NEXT = [
  { milestone: 'Current', item: 'Maintain active projects and the public project catalog' },
  { milestone: 'Next', item: 'Move incubating projects toward usable releases' },
  { milestone: 'Next', item: 'Evaluate commercial tiers and implementation consulting' },
  { milestone: 'Later', item: 'Fund project work through sponsorships and partnerships' },
];

export default function Invest() {
  return (
    <>
      <SEOHead
        title="Invest"
        noIndex
        description="SUBCULT investor materials covering public repositories, project states, funding, and planned work."
        path="/invest"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-dust mb-3">&gt; PARTNERSHIP.inquiry()</p>
          <h1 className="mb-6">Partner with SUBCULT</h1>
          <p className="text-bone max-w-2xl mx-auto text-lg leading-relaxed">
            Review the public repositories, current project states, operating model, and planned use
            of funds.
          </p>
        </div>

        {/* What We're Building */}
        <div className="mb-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            What We're Building
          </h2>

          <Card className="p-6">
            <ul className="space-y-3">
              {WHAT_WE_BUILD.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-bone">
                  <span className="text-static font-mono">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Why Now */}
        <div className="mb-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Current Position
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_NOW.map((item) => (
              <Card key={item.title} className="p-5">
                <h4 className="font-mono text-sm text-glow mb-2">{item.title}</h4>
                <p className="text-sm text-bone">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* What's Next - Roadmap */}
        <div className="mb-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            What's Next
          </h2>

          <TerminalPanel title="roadmap.current" className="max-w-2xl">
            <div className="space-y-2">
              {WHATS_NEXT.map((item, i) => (
                <div key={i}>
                  <span className="text-cyan">{item.milestone}</span>
                  <span className="text-dust"> → </span>
                  <span className="text-chalk">{item.item}</span>
                </div>
              ))}
            </div>
          </TerminalPanel>
        </div>

        {/* Materials */}
        <div className="mb-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Investor Materials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <Card className="p-5 border-signal">
              <h4 className="font-mono text-sm text-glow mb-1">Pitch Deck</h4>
              <p className="text-[10px] text-dust font-mono mb-2">STANDARD</p>
              <p className="text-xs text-bone mb-4">
                Public work, current project states, operating model, roadmap, and use of funds.
              </p>
              <div className="flex gap-2">
                <Button
                  as="link"
                  to="/deck"
                  aria-label="View standard deck"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  View standard
                </Button>
                <Button
                  as="a"
                  href="/press-kit/subcult-deck.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download standard deck PDF"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Standard PDF ↗
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-mono text-sm text-glow mb-1">Pitch Deck</h4>
              <p className="text-[10px] text-dust font-mono mb-2">BRAND EDITION</p>
              <p className="text-xs text-bone mb-4">The same facts in the SUBCULT visual style.</p>
              <div className="flex gap-2">
                <Button
                  as="link"
                  to="/deck/brand"
                  aria-label="View brand deck"
                  variant="signal"
                  size="sm"
                  className="flex-1"
                >
                  View brand
                </Button>
                <Button
                  as="a"
                  href="/press-kit/subcult-deck-brand.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download brand deck PDF"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Brand PDF ↗
                </Button>
              </div>
            </Card>

            <Card className="p-5 border-signal">
              <h4 className="font-mono text-sm text-glow mb-1">One-Pager</h4>
              <p className="text-[10px] text-dust font-mono mb-2">STANDARD</p>
              <p className="text-xs text-bone mb-4">
                Concise brief on projects, funding, and planned work.
              </p>
              <div className="flex gap-2">
                <Button
                  as="link"
                  to="/onepager"
                  aria-label="View standard one-pager"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  View standard
                </Button>
                <Button
                  as="a"
                  href="/press-kit/subcult-onepager.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download standard one-pager PDF"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Standard PDF ↗
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="font-mono text-sm text-glow mb-1">One-Pager</h4>
              <p className="text-[10px] text-dust font-mono mb-2">BRAND EDITION</p>
              <p className="text-xs text-bone mb-4">
                The same concise brief in the SUBCULT visual style.
              </p>
              <div className="flex gap-2">
                <Button
                  as="link"
                  to="/onepager/brand"
                  aria-label="View brand one-pager"
                  variant="signal"
                  size="sm"
                  className="flex-1"
                >
                  View brand
                </Button>
                <Button
                  as="a"
                  href="/press-kit/subcult-onepager-brand.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download brand one-pager PDF"
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Brand PDF ↗
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center py-12 border-t border-fog">
          <h2 className="mb-4">Investor Contact</h2>
          <p className="text-bone max-w-xl mx-auto mb-8">
            For funding or partnership questions, email invest@subcult.tv or use the contact form.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="a" href="mailto:invest@subcult.tv" size="lg">
              Email invest@subcult.tv ↗
            </Button>
            <Button as="link" to="/contact" variant="secondary" size="lg">
              Contact form
            </Button>
          </div>

          <p className="font-mono text-xs text-dust mt-6">invest@subcult.tv</p>
        </div>
      </div>
    </>
  );
}
