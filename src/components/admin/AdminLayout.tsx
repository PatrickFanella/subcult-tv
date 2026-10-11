import { Suspense, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Layers,
  Library,
  LogOut,
  Mail,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import '@/styles/admin-production.css';
import '@/styles/studio.css';
import { Navigate, Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Only highlight on an exact match, so nested pages do not light two items. */
  end?: boolean;
}

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Workshop',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'Publishing',
    items: [
      { to: '/admin/posts', label: 'Posts', icon: Send },
      { to: '/admin/projects', label: 'Projects', icon: Layers },
    ],
  },
  {
    heading: 'Studio',
    items: [
      { to: '/admin/studio', label: 'Brand library', icon: Palette, end: true },
      { to: '/admin/studio/references', label: 'References', icon: Library },
      { to: '/admin/studio/text', label: 'Text library', icon: BookOpen },
    ],
  },
  {
    heading: 'Audience',
    items: [
      { to: '/admin/contacts', label: 'Contacts', icon: Mail },
      { to: '/admin/subscribers', label: 'Subscribers', icon: Users },
    ],
  },
];

// Matches the CSS breakpoint where the sidebar becomes a drawer.
const DRAWER_QUERY = '(max-width: 800px)';

export default function AdminLayout() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('subcult-admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  // Close the drawer after navigation.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    navigation.current?.querySelector<HTMLElement>('a')?.focus();
    const media = window.matchMedia?.(DRAWER_QUERY);
    const leave = () => {
      if (!media?.matches) setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    media?.addEventListener('change', leave);
    document.addEventListener('keydown', escape);
    return () => {
      media?.removeEventListener('change', leave);
      document.removeEventListener('keydown', escape);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }

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
    <div className={`admin-shell min-h-screen bg-void flex ${menuOpen ? 'admin-menu-open' : ''}`}>
      {/* ── Phone top bar ────────────────────────────────────── */}
      <header className="admin-topbar">
        <Link
          to="/"
          aria-label="SUBCULT home"
          className="subcult-nav-brand font-display text-xl text-glow tracking-wider no-underline"
        >
          <img
            src="/brand/subcult/fisheye-circle.png?v=fisheye-flat-20261004"
            className="subcult-nav-mark"
            alt=""
          />
          <span>SUBCULT</span>
        </Link>
        <button
          ref={menuButton}
          type="button"
          className="admin-menu-button"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </header>
      {menuOpen && <div className="admin-drawer-backdrop" aria-hidden="true" onClick={closeMenu} />}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar flex flex-col shrink-0 ${collapsed ? 'admin-sidebar-collapsed' : ''}`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand-row">
            <Link
              to="/"
              aria-label="SUBCULT home"
              className="subcult-nav-brand font-display text-xl text-glow tracking-wider no-underline"
            >
              <img
                src="/brand/subcult/fisheye-circle.png?v=fisheye-flat-20261004"
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
          <div className="admin-sidebar-label admin-sidebar-tagline">Admin</div>
        </div>

        <nav
          ref={navigation}
          id="admin-navigation"
          aria-label="Admin navigation"
          className="admin-nav flex-1"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="admin-nav-group">
              <div className="admin-sidebar-label admin-nav-heading" aria-hidden="true">
                {group.heading}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  end={item.end}
                  className="admin-nav-link"
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span className="admin-sidebar-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-label admin-sidebar-user" title={user?.username}>
            Signed in as <strong>{user?.username}</strong>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title={collapsed ? 'Sign out' : undefined}
            className="admin-button admin-sidebar-signout"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="admin-sidebar-label">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main id="main-content" className="flex-1 min-w-0 overflow-auto" inert={menuOpen}>
        <div className="admin-content">
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
