import { Suspense } from 'react';
import '@/styles/admin-production.css';
import { Navigate, Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '◈' },
  { to: '/admin/studio', label: 'Brand library', icon: '◩' },
  { to: '/admin/studio/references', label: 'References', icon: '▦' },
  { to: '/admin/projects', label: 'Projects', icon: '▣' },
  { to: '/admin/posts', label: 'Posts', icon: '▤' },
  { to: '/admin/contacts', label: 'Contacts', icon: '▧' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: '▥' },
];

export default function AdminLayout() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-shell min-h-screen bg-void flex items-center justify-center">
        <div className="font-mono text-signal animate-pulse">LOADING CONTROL PANEL...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell min-h-screen bg-void flex">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="admin-sidebar w-64 bg-soot border-r border-fog flex flex-col shrink-0">
        <div className="p-4 border-b border-fog">
          <Link
            to="/"
            aria-label="SUBCULT home"
            className="subcult-nav-brand font-display text-xl text-glow tracking-wider no-underline"
          >
            <img src="/brand/subcult/fisheye-circle.png?v=fisheye-20261003" className="subcult-nav-mark" alt="" />
            <span>SUBCULT</span>
          </Link>
          <div className="font-mono text-xs text-dust mt-1">PRODUCTION / ADMIN</div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/admin/studio'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 font-mono text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-smoke text-static border-l-2 border-static'
                    : 'text-bone hover:text-glow hover:bg-ash border-l-2 border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-fog">
          <div className="font-mono text-xs text-dust mb-2">&gt; {user?.username}@subcult</div>
          <button
            onClick={logout}
            className="w-full px-3 py-1.5 bg-ash border border-fog text-dust font-mono text-xs hover:border-signal hover:text-signal transition-colors cursor-pointer"
          >
            DISCONNECT
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="font-mono text-dust text-sm cursor-blink">&gt; loading signal...</div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
