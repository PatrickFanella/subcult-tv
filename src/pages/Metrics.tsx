import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import Card from '@/components/ui/Card';
import TerminalPanel from '@/components/effects/TerminalPanel';
import { Target } from 'lucide-react';
import { getPatreonCampaign, getPublicStats } from '@/lib/api';
import { getCuratedProjects } from '@/lib/github';

// Live-derived metric: public repo count = catalog size (single source of truth).
const REPO_COUNT = getCuratedProjects().length;

// Baseline metrics - updated manually; supporters come from the Patreon API,
// subscribers come from the public /api/v1/stats endpoint.
const BASELINE = {
  nextMilestone: {
    description: 'Next weekly metrics update',
  },
  stats: [
    {
      key: 'subscribers',
      label: 'Newsletter Subscribers',
      unit: '',
      trend: null,
    },
    {
      key: 'supporters',
      label: 'Patreon Supporters',
      unit: '',
      trend: null,
    },
    {
      key: 'shipped',
      label: 'Core Public Counts',
      value: 3,
      unit: 'sources',
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

function nextSunday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().slice(0, 10);
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

type RemoteSource<T> =
  { status: 'loading' } | { status: 'available'; data: T } | { status: 'unavailable' };

export default function Metrics() {
  const [patreon, setPatreon] = useState<RemoteSource<{ supporters: number }>>({
    status: 'loading',
  });
  const [publicStats, setPublicStats] = useState<
    RemoteSource<{ subscribers: number; lastUpdated: string }>
  >({ status: 'loading' });

  useEffect(() => {
    getPatreonCampaign()
      .then((data) => {
        if (data.campaign) {
          setPatreon({
            status: 'available',
            data: { supporters: data.campaign.patron_count },
          });
        } else {
          setPatreon({ status: 'unavailable' });
        }
      })
      .catch(() => {
        setPatreon({ status: 'unavailable' });
      });

    getPublicStats()
      .then((stats) =>
        setPublicStats({
          status: 'available',
          data: { subscribers: stats.subscribers, lastUpdated: stats.last_updated },
        }),
      )
      .catch(() => {
        setPublicStats({ status: 'unavailable' });
      });
  }, []);

  const stats = BASELINE.stats.map((s) => {
    if (s.key === 'supporters') {
      return {
        ...s,
        value:
          patreon.status === 'available'
            ? patreon.data.supporters
            : patreon.status === 'loading'
              ? 'Loading…'
              : 'Unavailable',
      };
    }
    if (s.key === 'subscribers') {
      return {
        ...s,
        value:
          publicStats.status === 'available'
            ? publicStats.data.subscribers
            : publicStats.status === 'loading'
              ? 'Loading…'
              : 'Unavailable',
      };
    }
    return s;
  });

  const publicStatsStatus =
    publicStats.status === 'available'
      ? `Updated ${formatUpdatedAt(publicStats.data.lastUpdated)}`
      : publicStats.status === 'loading'
        ? 'Loading…'
        : 'Unavailable';
  const patreonStatus =
    patreon.status === 'available'
      ? 'Available'
      : patreon.status === 'loading'
        ? 'Loading…'
        : 'Unavailable';

  return (
    <>
      <SEOHead
        title="Metrics"
        noIndex
        description="SUBCULT dashboard for public repository, newsletter, and Patreon counts."
        path="/metrics"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-dust mb-3">&gt; TELEMETRY.report()</p>
          <h1 className="mb-6">Metrics Dashboard</h1>
          <p className="text-bone max-w-2xl mx-auto text-lg leading-relaxed">
            Public repository counts and live newsletter and Patreon data when the APIs are online.
          </p>
        </div>

        {/* Update Notice */}
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-fog">Newsletter/public stats: {publicStatsStatus}</p>
          <p className="font-mono text-xs text-fog">Patreon: {patreonStatus}</p>
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
                <p className="font-mono text-sm text-cyan">{nextSunday()}</p>
                <p className="text-lg text-glow">{BASELINE.nextMilestone.description}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transparency Note */}
        <div className="mb-16">
          <TerminalPanel title="transparency.policy" className="max-w-2xl mx-auto">
            <div>
              <span className="text-dust"># what this page reports:</span>
              <br />
              <br />
              <span className="text-chalk">1. </span>
              <span className="text-bone">public counts from named sources</span>
              <br />
              <span className="text-chalk">2. </span>
              <span className="text-bone">
                unavailable sources are labeled unavailable, never zero
              </span>
              <br />
              <span className="text-chalk">3. </span>
              <span className="text-bone">repository counts are not user counts</span>
              <br />
              <span className="text-chalk">4. </span>
              <span className="text-bone">source and update state shown on the page</span>
              <br />
              <br />
              <span className="text-dust"># new metrics require a reliable source.</span>
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
            <span className="text-static">✓</span> Core counts (newsletter, Patreon, project
            catalog)
            <br />
            <span className="text-signal">✗</span> Page views and impressions
          </p>
        </div>
      </div>
    </>
  );
}
