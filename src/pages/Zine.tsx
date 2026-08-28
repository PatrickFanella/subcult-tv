import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPublishedPosts } from '@/lib/posts';
import type { Post } from '@/types';

type SeriesGroup = {
  name: string;
  total: number;
  posts: Post[];
};

function buildSeriesGroups(publishedPosts: Post[]): SeriesGroup[] {
  const groups: SeriesGroup[] = [];
  const lookup = new Map<string, SeriesGroup>();

  for (const post of publishedPosts) {
    if (!post.series) continue;

    const existing = lookup.get(post.series.name);
    if (existing) {
      existing.posts.push(post);
      continue;
    }

    const created: SeriesGroup = {
      name: post.series.name,
      total: post.series.total,
      posts: [post],
    };

    lookup.set(post.series.name, created);
    groups.push(created);
  }

  return groups;
}

export default function Zine() {
  const publishedPosts = getPublishedPosts();
  const seriesGroups = buildSeriesGroups(publishedPosts);

  return (
    <>
      <SEOHead
        title="The Zine"
        description="Read Foundations and Field Systems, two complete zine series about building tools and practices for independent culture."
        path="/zine"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="font-mono text-xs text-dust mb-3">&gt; cat /zine/index</p>
          <h1 className="mb-4">The Zine</h1>
          <p className="font-mono text-sm text-flicker mb-6">
            Two complete series. Sixteen dispatches from the workshop.
          </p>
          <p className="text-bone max-w-2xl mx-auto text-lg leading-relaxed">
            Start with Foundations to learn how the collective works. Then read Field Systems to see
            those principles applied to the tools and habits that keep cultural work going.
          </p>
        </div>

        {/* Series chooser */}
        <div className="grid gap-4 lg:grid-cols-2 mb-12 md:mb-16">
          <Link
            to="/zine/boot-sequence"
            className="block h-full no-underline focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
          >
            <Card className="group relative h-full overflow-hidden border-fog p-6 md:p-8 transition-all duration-200 hover:border-signal hover:shadow-glow">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fog to-transparent" />
              <div className="relative flex h-full flex-col">
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-dust mb-3">
                  Series One · Foundations
                </p>
                <h2 className="font-display text-3xl text-glow mb-3 group-hover:text-signal transition-colors">
                  Start here
                </h2>
                <p className="text-bone text-base leading-relaxed max-w-xl">
                  Eight posts on the mission, metrics, discovery, moderation, and operating
                  principles behind Subculture Collective. Begin here.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-ash border border-fog p-3">
                    <p className="font-display text-2xl text-glow">8/8</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-dust mt-1">
                      Published
                    </p>
                  </div>
                  <div className="bg-ash border border-fog p-3">
                    <p className="font-display text-2xl text-glow">Complete</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-dust mt-1">
                      Read in order
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-fog pt-4 font-mono text-xs uppercase tracking-[0.3em] text-dust group-hover:text-signal transition-colors">
                  <span>Open Foundations</span>
                  <span>→</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link
            to="/zine/the-signal-tower"
            className="block h-full no-underline focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
          >
            <Card className="group relative h-full overflow-hidden border-signal p-6 md:p-8 shadow-glow transition-all duration-200 hover:border-signal-dim">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
              <div className="relative flex h-full flex-col">
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-signal mb-3">
                  Series Two · Field Systems
                </p>
                <h2 className="font-display text-3xl text-glow mb-3 group-hover:text-signal transition-colors">
                  Field Systems
                </h2>
                <p className="text-bone text-base leading-relaxed max-w-xl">
                  Eight posts on community legibility, search, memory, structured disagreement,
                  media, and the infrastructure communities use to coordinate care.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-ash border border-signal p-3">
                    <p className="font-display text-2xl text-signal">8/8</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-dust mt-1">
                      Published
                    </p>
                  </div>
                  <div className="bg-ash border border-signal p-3">
                    <p className="font-display text-2xl text-glow">Complete</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-dust mt-1">
                      Read in order
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-signal pt-4 font-mono text-xs uppercase tracking-[0.3em] text-signal group-hover:text-glow transition-colors">
                  <span>Open Field Systems</span>
                  <span>→</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Published posts grouped by series */}
        <div className="space-y-12 max-w-5xl mx-auto">
          {seriesGroups.map((group, groupIndex) => {
            const seriesLabel = groupIndex === 0 ? 'Series One' : 'Series Two';
            const isFieldSystems = group.name === 'Field Systems';

            return (
              <section key={group.name}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.35em] text-dust mb-2">
                      {seriesLabel}
                    </p>
                    <h2 className="font-display text-2xl md:text-3xl text-glow">{group.name}</h2>
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-dust">
                    {group.posts.length}/{group.total} published
                  </p>
                </div>

                {isFieldSystems && (
                  <p className="max-w-2xl text-sm text-bone mb-4">
                    Read how a collective turns its values into tools, interfaces, archives, and
                    working practices that last.
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {group.posts.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/zine/${post.slug}`}
                      className="block no-underline focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
                    >
                      <Card hoverable className="group h-full p-6 transition-all duration-200">
                        <div className="flex items-start gap-4">
                          <div className="font-mono text-2xl text-dust">
                            {String(post.series?.week ?? 0).padStart(2, '0')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.25em] font-mono text-dust">
                              <span>{group.name}</span>
                              <span className="text-fog">//</span>
                              <span>Week {post.series?.week}</span>
                            </div>
                            <h3 className="font-display text-xl text-glow mb-2 group-hover:text-signal transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-bone mb-4 leading-relaxed">{post.excerpt}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-dust">
                              <span>{post.date}</span>
                              {isFieldSystems && <span>Field Systems</span>}
                            </div>
                          </div>
                          <div className="font-mono text-sm text-signal">→</div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="text-center py-12 mt-12 border-t border-fog">
          <h2 className="mb-4">Read What Comes Next</h2>
          <p className="text-bone max-w-xl mx-auto mb-8">
            You can read both series now. Subscribe to the monthly memo to get the next series and
            new workshop dispatches in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="link" to="/memo" size="lg">
              Subscribe to the Memo
            </Button>
            <Button as="link" to="/support" variant="secondary" size="lg">
              Support the Collective
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
