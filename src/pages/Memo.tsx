import SEOHead from '@/components/SEOHead';
import NewsletterSignup from '@/components/NewsletterSignup';
import TerminalPanel from '@/components/effects/TerminalPanel';
import Card from '@/components/ui/Card';
import { Radio, Rocket, Film, Sparkles } from 'lucide-react';

const WHAT_YOU_GET = [
  {
    icon: Radio,
    label: 'A monthly workshop report',
    detail: "Read a clear record of each month's releases and failures, with lessons from repairs.",
  },
  {
    icon: Rocket,
    label: 'New release alerts',
    detail: 'Hear when a new tool or project is ready to use.',
  },
  {
    icon: Film,
    label: 'Work in progress',
    detail: 'See process notes, experiments, and prototypes before publication.',
  },
  {
    icon: Sparkles,
    label: 'Roadmap notes',
    detail: 'See what we plan to build next. Some memos invite you to vote on priorities.',
  },
];

export default function Memo() {
  return (
    <>
      <SEOHead
        title="Memo | Newsletter"
        description="Subscribe to the monthly Subcult Infrastructure Memo for build reports, release alerts, and workshop notes."
        path="/memo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-dust mb-3">&gt; BROADCAST.subscribe()</p>
          <h1 className="mb-6">Subcult Infrastructure Memo</h1>
          <p className="text-bone max-w-2xl mx-auto text-lg leading-relaxed">
            Subscribe for one plain monthly email from the workshop. Each issue covers recent
            releases and failures. It also shows the next work on the bench.
          </p>
        </div>

        {/* Newsletter Signup - Hero CTA */}
        <div className="max-w-xl mx-auto mb-16">
          <NewsletterSignup />
        </div>

        {/* What You'll Receive */}
        <div className="mb-16">
          <h2 className="text-center mb-8">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            What You Will Receive
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {WHAT_YOU_GET.map((item) => (
              <Card key={item.label} className="p-4">
                <item.icon className="w-6 h-6 text-signal mb-2" aria-hidden="true" />
                <h4 className="font-mono text-sm text-glow mb-1">{item.label}</h4>
                <p className="text-xs text-bone">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Cadence Info */}
        <div className="mb-16">
          <TerminalPanel title="memo.config" className="max-w-2xl mx-auto">
            <div>
              <span className="text-chalk">frequency: </span>
              <span className="text-static">monthly</span>
              <br />
              <span className="text-chalk">format: </span>
              <span className="text-flicker">plaintext + links</span>
              <br />
              <span className="text-chalk">tracking: </span>
              <span className="text-signal">none</span>
              <br />
              <span className="text-chalk">unsubscribe: </span>
              <span className="text-cyan">one-click, always</span>
              <br />
              <br />
              <span className="text-dust"># we do not sell your address.</span>
              <br />
              <span className="text-dust"># no tracking or spam.</span>
            </div>
          </TerminalPanel>
        </div>
      </div>
    </>
  );
}
