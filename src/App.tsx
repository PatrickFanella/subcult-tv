import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';

// Public pages (code-split)
const Home = lazy(() => import('@/pages/Home'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const ProductLanding = lazy(() => import('@/pages/ProductLanding'));
const Patreon = lazy(() => import('@/pages/Patreon'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages (code-split)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'));
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'));
const AdminContacts = lazy(() => import('@/pages/admin/AdminContacts'));
const AdminSubscribers = lazy(() => import('@/pages/admin/AdminSubscribers'));

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <span className="font-mono text-dust text-sm cursor-blink">&gt; loading signal...</span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public site */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Projects />} />
            <Route path="projects" element={<Navigate to="/products" replace />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="products/:slug" element={<ProductLanding />} />
            <Route path="support" element={<Patreon />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
