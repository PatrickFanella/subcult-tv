import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';

// Public pages (code-split)
const Home = lazy(() => import('@/pages/Home'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const Patreon = lazy(() => import('@/pages/Patreon'));
const About = lazy(() => import('@/pages/About'));
const Zine = lazy(() => import('@/pages/Zine'));
const PostPage = lazy(() => import('@/pages/PostPage'));
const Contact = lazy(() => import('@/pages/Contact'));
const PressKit = lazy(() => import('@/pages/PressKit'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Memo = lazy(() => import('@/pages/Memo'));
const Invest = lazy(() => import('@/pages/Invest'));
const Metrics = lazy(() => import('@/pages/Metrics'));
const Links = lazy(() => import('@/pages/Links'));
const PitchDeck = lazy(() => import('@/pages/PitchDeck'));
const OnePager = lazy(() => import('@/pages/OnePager'));
const PitchDeckBrand = lazy(() => import('@/pages/PitchDeckBrand'));
const OnePagerBrand = lazy(() => import('@/pages/OnePagerBrand'));

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
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="support" element={<Patreon />} />
            <Route path="about" element={<About />} />
            <Route path="zine" element={<Zine />} />
            <Route path="zine/:slug" element={<PostPage />} />
            <Route path="contact" element={<Contact />} />
            <Route path="press" element={<PressKit />} />
            <Route path="memo" element={<Memo />} />
            <Route path="invest" element={<Invest />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="links" element={<Links />} />
            <Route path="deck" element={<PitchDeck />} />
            <Route path="onepager" element={<OnePager />} />
            <Route path="deck/brand" element={<PitchDeckBrand />} />
            <Route path="onepager/brand" element={<OnePagerBrand />} />
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