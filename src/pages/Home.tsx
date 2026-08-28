import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';
import TerminalPanel from '@/components/effects/TerminalPanel';
import GlitchFrame from '@/components/effects/GlitchFrame';
import { useEffects } from '@/context/useEffects';
import { getCuratedProjects } from '@/lib/github';
import { getLatestPosts } from '@/lib/posts';

export default function Home() {
  const { effectLevel } = useEffects();
  const latestPosts = getLatestPosts(3);

  const frontPageProjectSlugs = ['clpr', 'patchwork', 'hasanara'];

  const projects = getCuratedProjects();

  const featuredProjects = frontPageProjectSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is NonNullable<ReturnType<typeof projects.find>> =>
      Boolean(project),
    );

  return (
    <>
      <SEOHead title="Home" path="/" />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        <GlitchFrame enableTracking className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
            <div className="max-w-3xl">
              {/* Overline */}
              <p className="font-mono text-xs text-dust mb-4 animate-fade-in-up">
                &gt; SUBCULTURE COLLECTIVE // EST. 2026
              </p>

              {/* Title */}
              <h1
                className={`mb-6 animate-fade-in-up animation-delay-100 ${
                  effectLevel !== 'clean' ? 'chromatic' : ''
                }`}
              >
                SUBCULT
              </h1>

              {/* Positioning */}
              <p className="text-lg md:text-xl text-bone leading-relaxed mb-8 max-w-2xl animate-fade-in-up animation-delay-200">
                Open-source tools for culture outside the platforms.
              </p>
              <p className="text-base text-dust leading-relaxed mb-8 max-w-2xl animate-fade-in-up animation-delay-200">
                We build and run software for underground scenes, mutual aid, archives, and
                independent media so the people who use it can understand, self-host, and change it.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
                <Button as="link" to="/projects" size="lg">
                  Inspect projects
                </Button>
                <Button as="link" to="/zine" variant="secondary" size="lg">
                  Read field notes
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative grid lines */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none hidden lg:block">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="hero-grid"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)" />
            </svg>
          </div>
        </GlitchFrame>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
      </section>

      {/* ═══════ FOCUS BLOCK ═══════ */}
      <section className="bg-soot torn-edge-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Independent on purpose</h2>
            <p className="text-bone leading-relaxed mb-4">
              SUBCULT is an independent software studio. We build tools where commercial platforms
              flatten communities, capture their history, or tie participation to surveillance.
            </p>
            <p className="text-bone leading-relaxed mb-6">
              We publish our work and document its current state. The catalog marks projects as
              active, incubating, or archived.
            </p>
            <TerminalPanel title="subcult.status" className="text-left max-w-md mx-auto">
              <div>
                <span className="text-chalk">practice: </span>
                <span className="text-static">OPEN SOURCE</span>
                <br />
                <span className="text-chalk">focus: </span>
                <span className="text-flicker">INDEPENDENT CULTURE</span>
                <br />
                <span className="text-chalk">method: </span>
                <span className="text-cyan">BUILD // TEST // DOCUMENT // PUBLISH STATUS</span>
              </div>
            </TerminalPanel>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED PROJECTS ═══════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2>
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Selected projects
            </h2>
            <Link
              to="/projects"
              className="font-mono text-sm text-bone hover:text-signal transition-colors"
            >
              Open the full catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LATEST POSTS ═══════ */}
      <section className="py-16 md:py-24 bg-soot border-t border-fog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2>
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Latest field notes
            </h2>
            <Link
              to="/zine"
              className="font-mono text-sm text-bone hover:text-signal transition-colors"
            >
              Read all notes →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PATREON CTA ═══════ */}
      <section className="py-16 md:py-24 border-t border-fog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-mono text-xs text-dust mb-4">&gt; KEEP THE WORK INDEPENDENT</p>
          <h2 className="mb-6">Support the work</h2>
          <p className="text-bone max-w-2xl mx-auto mb-8 leading-relaxed">
            Contributions help pay for hosting, research, and maintenance. The code stays open
            whether or not you contribute.
          </p>
          <Button
            as="a"
            href="https://www.patreon.com/subcult"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            Support on Patreon ↗
          </Button>
        </div>
      </section>
    </>
  );
}
