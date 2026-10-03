import { useState, useEffect } from 'react';
import { getDashboardStats, type DashboardStats } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-dust mb-1">SUBCULT / ADMIN</p>
        <h1 className="text-2xl">Dashboard</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-ash border border-signal font-mono text-sm text-signal">
          Could not load the dashboard: {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Projects" value={stats?.total_projects} icon="▣" color="text-signal" />
        <StatCard label="Posts" value={stats?.total_posts} icon="▤" color="text-cyan" />
        <StatCard
          label="Subscribers"
          value={stats?.total_subscribers}
          icon="▥"
          color="text-static"
        />
        <StatCard
          label="Contact messages"
          value={stats?.total_contacts}
          icon="▧"
          color="text-flicker"
        />
        <StatCard
          label="Unread messages"
          value={stats?.unread_contacts}
          icon="●"
          color="text-signal"
          highlight={!!stats?.unread_contacts && stats.unread_contacts > 0}
        />
      </div>

      {/* Quick info */}
      <div className="bg-soot border border-fog p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-dust ml-2">system.log</span>
        </div>
        <div className="font-mono text-sm space-y-1">
          <p className="text-dust"># SUBCULT Control Panel</p>
          <p className="text-dust"># ─────────────────────</p>
          <p>
            <span className="text-chalk">api: </span>
            <span className="text-static">CONNECTED</span>
          </p>
          <p>
            <span className="text-chalk">database: </span>
            <span className="text-static">ONLINE</span>
          </p>
          <p>
            <span className="text-chalk">session: </span>
            <span className="text-flicker">ACTIVE</span>
          </p>
          <p className="text-dust mt-3"># Use the sidebar to manage content.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: number | undefined;
  icon: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-soot border p-5 transition-colors ${
        highlight ? 'border-signal' : 'border-fog'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xl ${color}`}>{icon}</span>
        <span className="font-mono text-xs text-dust uppercase">{label}</span>
      </div>
      <div className="font-display text-3xl text-glow">{value !== undefined ? value : '—'}</div>
    </div>
  );
}
