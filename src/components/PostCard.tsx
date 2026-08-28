import { Link } from 'react-router-dom';
import type { Post } from '@/types';
import Tag from '@/components/ui/Tag';

interface PostCardProps {
  post: Post;
  disabled?: boolean;
}

export default function PostCard({ post, disabled }: PostCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-xs text-dust">{post.date}</span>
        {!disabled && (
          <span className="font-mono text-xs text-signal opacity-0 group-hover:opacity-100 transition-opacity">
            OPEN POST →
          </span>
        )}
        {disabled && <span className="font-mono text-xs text-dust">NOT YET PUBLISHED</span>}
      </div>

      <h3 className="font-display text-xl uppercase tracking-wider text-glow group-hover:text-signal transition-colors mb-2">
        {post.title}
      </h3>

      <p className="text-sm text-bone mb-3">{post.excerpt}</p>

      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className="block bg-ash border border-fog p-5 opacity-40 pointer-events-none select-none">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/zine/${post.slug}`}
      className="group block bg-ash border border-fog hover:border-signal transition-all duration-200 p-5 no-underline"
    >
      {content}
    </Link>
  );
}
