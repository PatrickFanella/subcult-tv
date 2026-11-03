import '@/styles/development.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEOHead from '@/components/SEOHead';
import { getPost, listPosts, type APIPost } from '@/lib/api';
import { developmentPostMeta } from '@/lib/seo';

type LoadError = 'missing' | 'unavailable';

const PAGER_BUTTON =
  'text-signal hover:text-glow cursor-pointer disabled:text-dust disabled:cursor-default disabled:opacity-50';

export default function DevelopmentLog() {
  const { slug } = useParams();
  return <DevelopmentLogContent key={slug || 'index'} slug={slug} />;
}
function DevelopmentLogContent({ slug }: { slug?: string }) {
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [post, setPost] = useState<APIPost | null>(null);
  const [error, setError] = useState<LoadError | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const request = slug
      ? getPost(slug).then((p) => {
          if (active) {
            if (!p.tags.includes('development-log')) {
              setError('missing');
              return;
            }
            setPost(p);
          }
        })
      : listPosts({ page, perPage: 20, tag: 'development-log' }).then((result) => {
          if (active) {
            setPosts(result.data.filter((p) => p.tags.includes('development-log')));
            setPages(result.total_pages);
          }
        });
    request
      .catch((e: unknown) => {
        if (!active) return;
        const message = e instanceof Error ? e.message : '';
        setError(slug && /not found|404/i.test(message) ? 'missing' : 'unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, page, attempt]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      {slug ? (
        <SEOHead path={`/development/${slug}`} meta={developmentPostMeta(slug, post)} />
      ) : (
        <SEOHead path="/development" />
      )}
      <p className="font-mono text-signal text-sm">SUBCULT / WORK IN PROGRESS</p>
      <h1 className="font-display text-5xl my-6">{post?.title || 'Development log'}</h1>
      {slug && (
        <Link to="/development" className="text-cyan">
          ← All updates
        </Link>
      )}
      {!slug && (
        <p className="text-bone mb-10">
          Updates from the SUBCULT workshop: what changed and what we’re working on.
        </p>
      )}
      {loading && <p role="status">Loading updates…</p>}
      {error === 'missing' && (
        <div role="alert" className="border border-fog p-6 mt-6">
          <p className="text-bone">
            There is no update at this address. It may have been renamed or taken down.
          </p>
          <Link to="/development" className="text-cyan inline-block mt-4">
            See all updates →
          </Link>
        </div>
      )}
      {error === 'unavailable' && (
        <div role="alert" className="border border-fog p-6 mt-6">
          <p className="text-bone">
            The updates could not be loaded right now. Nothing is wrong on your end; try again in a
            minute.
          </p>
          <button
            type="button"
            onClick={retry}
            className="font-mono text-sm text-signal hover:text-glow cursor-pointer mt-4"
          >
            ↺ Try again
          </button>
        </div>
      )}
      {post && (
        <article className="development-article">
          <p className="font-mono text-sm text-dust">
            {post.date.slice(0, 10)} · {post.author || 'SUBCULT'}
          </p>
          <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
        </article>
      )}
      {!slug &&
        !loading &&
        posts.map((p) => (
          <article key={p.id} className="border-t border-fog py-8">
            <p className="font-mono text-sm text-dust">{p.date.slice(0, 10)}</p>
            <h2 className="font-display text-3xl my-3">
              <Link to={`/development/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="text-bone">{p.excerpt}</p>
            <Link className="text-cyan inline-block mt-4" to={`/development/${p.slug}`}>
              Read update →
            </Link>
          </article>
        ))}
      {!slug && !loading && !error && !posts.length && (
        <div className="border border-fog p-6 mt-6">
          <p className="text-bone">
            No updates have been published yet. The next workshop update will appear here after
            review.
          </p>
          <p className="text-sm text-bone mt-4">
            Until then, the{' '}
            <Link to="/products" className="text-cyan">
              product pages
            </Link>{' '}
            say what each one does and how finished it is.
          </p>
        </div>
      )}
      {!slug && !loading && pages > 1 && (
        <nav
          aria-label="Development log pages"
          className="flex items-center justify-between gap-6 border-t border-fog mt-8 pt-6 font-mono text-sm"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => {
              setError(null);
              setLoading(true);
              setPage((p) => p - 1);
            }}
            className={PAGER_BUTTON}
          >
            ← Previous
          </button>
          <span className="text-dust">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => {
              setError(null);
              setLoading(true);
              setPage((p) => p + 1);
            }}
            className={PAGER_BUTTON}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
