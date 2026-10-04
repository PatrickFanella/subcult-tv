import '@/styles/development.css';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost, listPosts, type APIPost } from '@/lib/api';

export default function DevelopmentLog() {
  const { slug } = useParams();
  return <DevelopmentLogContent key={slug || 'index'} slug={slug} />;
}
function DevelopmentLogContent({ slug }: { slug?: string }) {
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [post, setPost] = useState<APIPost | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    let active = true;
    const request = slug
      ? getPost(slug).then((p) => {
          if (active) {
            if (!p.tags.includes('development-log'))
              throw new Error('Development log entry not found');
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
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, page]);
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
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
      {error && <p role="alert">{error}</p>}
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
        <p>The next workshop update will appear here after review.</p>
      )}
      {!slug && pages > 1 && (
        <div className="flex gap-6 mt-8">
          <button
            disabled={page === 1}
            onClick={() => {
              setLoading(true);
              setPage((p) => p - 1);
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
