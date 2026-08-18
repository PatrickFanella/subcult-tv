import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import Card from '@/components/ui/Card';
import TerminalPanel from '@/components/effects/TerminalPanel';
import { Target } from 'lucide-react';
import { getPatreonCampaign } from '@/lib/api';
import { getCuratedProjects } from '@/lib/github';

// Live-derived metric: public repo count = catalog size (single source of truth).
const REPO_COUNT = getCuratedProjects().length;

function nextSunday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().slice(0, 10);
}

// Baseline metrics - these are updated manually; supporters come from the Patreon API.
const METRICS = {
  lastUpdated: '2026-08-18',
  nextMilestone: {
    date: nextSunday(),
    description: 'Next weekly metrics update',
  },
  stats: [
    {
      key: 'subscribers',
      label: 'Newsletter Subscribers',
      value: 0,
      unit: '',
      trend: null,
    },
    {
      key: 'supporters',
      label: 'Patreon Supporters',
      value: 0,
      unit: '',
      trend: null,
    },
    {
      key: 'shipped',
      label: 'Proof Shipped (This Week)',
      value: 3,
      unit: 'items',
      trend: null,
    },
    {
      key: 'repos',
      label: 'Public Repositories',
      value: REPO_COUNT,
      unit: '',
      trend: null,
    },
  ],
};

export default function Metrics() {
  const [patronCount, setPatronCount] = useState<number | null>(null);

  useEffect(() => {
    getPatreonCampaign()
      .then((data) => {
        if (data.campaign) {
          setPatronCount(data.campaign.patron_count);
        }
      })
      .catch(() => {
        // Silent fallback — keep default value
      });
  }, []);

  const stats = METRICS.stats.map((s) =>
    s.key === 'supporters' && patronCount !== null ? { ...s, value: patronCount } : s,
  );

  return (
    <>
      <SEOHead
        title="Metrics"
        noIndex
        description="SUBCULT transparency dashboard. Real numbers, updated weekly. No vanity metrics."
        path="/metrics"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-dust mb-3">&gt; TELEMETRY.report()</p>
          <h1 className="mb-6">Metrics Dashboard</h1>
          <p className="text-bone max-w-2xl mx-auto text-lg leading-relaxed">
            Real numbers. No vanity metrics. We publish what we track.
          </p>
        </div>

        {/* Update Notice */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-fog">
            Last updated: {METRICS.lastUpdated} • Updated every Sunday
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <Card key={stat.key} className="p-6 text-center">
              <p className="font-mono text-xs text-dust uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="font-display text-4xl text-glow font-bold">
                {stat.value}
                {stat.unit && <span className="text-lg text-bone ml-1">{stat.unit}</span>}
              </p>
              {stat.trend && (
                <p
                  className={`font-mono text-xs mt-2 ${
                    stat.trend > 0 ? 'text-static' : stat.trend < 0 ? 'text-signal' : 'text-dust'
                  }`}
                >
                  {stat.trend > 0 ? '↑' : stat.trend < 0 ? '↓' : '→'} {Math.abs(stat.trend)}% vs
                  last week
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Next Milestone */}
        <div className="mb-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Next Milestone
          </h2>

          <Card className="p-6 border-signal max-w-xl">
            <div className="flex items-center gap-4">
              <Target className="w-10 h-10 text-signal" aria-hidden="true" />
              <div>
                <p className="font-mono text-sm text-cyan">{METRICS.nextMilestone.date}</p>
                <p className="text-lg text-glow">{METRICS.nextMilestone.description}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transparency Note */}
        <div className="mb-16">
          <TerminalPanel title="transparency.policy" className="max-w-2xl mx-auto">
            <div>
              <span className="text-dust"># why we publish metrics:</span>
              <br />
              <br />
              <span className="text-chalk">1. </span>
              <span className="text-bone">accountability — we track what matters</span>
              <br />
              <span className="text-chalk">2. </span>
              <span className="text-bone">honesty — zeros are fine if true</span>
              <br />
              <span className="text-chalk">3. </span>
              <span className="text-bone">no vanity — downloads ≠ users ≠ value</span>
              <br />
              <span className="text-chalk">4. </span>
              <span className="text-bone">open source ethos — transparency by default</span>
              <br />
              <br />
              <span className="text-dust"># we'll add more metrics as they become meaningful.</span>
            </div>
          </TerminalPanel>
        </div>

        {/* What We Track */}
        <div className="text-center py-12 border-t border-fog">
          <h2 className="mb-4">What We Track</h2>
          <p className="text-bone max-w-xl mx-auto">
            <span className="text-static">✓</span> Newsletter subscribers (real people who signed
            up)
            <br />
            <span className="text-static">✓</span> Supporters (people who pay monthly)
            <br />
            <span className="text-static">✓</span> Shipped work (PRs merged, releases published)
            <br />
            <span className="text-signal">✗</span> Page views, impressions, or other noise
          </p>
        </div>
      </div>
    </>
  );
}
