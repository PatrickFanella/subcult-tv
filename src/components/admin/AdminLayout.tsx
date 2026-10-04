import { Suspense, useState } from 'react';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import '@/styles/admin-production.css';
import '@/styles/studio.css';
import { Navigate, Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '◈' },
  { to: '/admin/studio', label: 'Brand library', icon: '◩' },
  { to: '/admin/studio/references', label: 'References', icon: '▦' },
  { to: '/admin/studio/text', label: 'Text library', icon: '▤' },
  { to: '/admin/projects', label: 'Projects', icon: '▣' },
  { to: '/admin/posts', label: 'Posts', icon: '▤' },
  { to: '/admin/contacts', label: 'Contacts', icon: '▧' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: '▥' },
];

export default function AdminLayout() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('subcult-admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('subcult-admin-sidebar-collapsed', String(next));
    } catch {
      // Keep the toggle usable when browser storage is unavailable.
    }
  }

  if (loading) {
    return (
      <div className="admin-shell min-h-screen bg-void flex items-center justify-center">
        <div className="font-mono text-signal animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-shell min-h-screen bg-void flex">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`admin-sidebar w-64 bg-soot border-r border-fog flex flex-col shrink-0 ${collapsed ? 'admin-sidebar-collapsed' : ''}`}
      >
        <div className="admin-sidebar-header p-4 border-b border-fog">
          <div className="admin-sidebar-brand-row">
            <Link
              to="/"
              aria-label="SUBCULT home"
              className="subcult-nav-brand font-display text-xl text-glow tracking-wider no-underline"
            >
              <img
                src="/brand/subcult/fisheye-circle.png?v=fisheye-20261003"
                className="subcult-nav-mark"
                alt=""
              />
              <span className="admin-sidebar-label">SUBCULT</span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              aria-controls="admin-navigation"
              className="admin-sidebar-toggle"
            >
              {collapsed ? (
                <PanelLeftOpen size={20} aria-hidden="true" />
              ) : (
                <PanelLeftClose size={20} aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="admin-sidebar-label font-mono text-xs text-dust mt-1">
            PRODUCTION / ADMIN
          </div>
        </div>

        <nav id="admin-navigation" aria-label="Admin navigation" className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
              end={item.to === '/admin' || item.to === '/admin/studio'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 font-mono text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-smoke text-static border-l-2 border-static'
                    : 'text-bone hover:text-glow hover:bg-ash border-l-2 border-transparent'
                }`
              }
            >
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              <span className="admin-sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer p-4 border-t border-fog">
          <div className="admin-sidebar-label font-mono text-xs text-dust mb-2">
            &gt; {user?.username}@subcult
          </div>
          <button
            onClick={logout}
            aria-label="Disconnect"
            title={collapsed ? 'Disconnect' : undefined}
            className="w-full px-3 py-1.5 bg-ash border border-fog text-dust font-mono text-xs hover:border-signal hover:text-signal transition-colors cursor-pointer"
          >
            {collapsed ? <LogOut size={18} aria-hidden="true" /> : 'DISCONNECT'}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 lg:p-8">
          <Suspense
            fallback={<div className="font-mono text-dust text-sm cursor-blink">Loading…</div>}
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
