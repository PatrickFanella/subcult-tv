import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function LibraryMarkdown({ children }: { children: string }) {
  return (
    <div className="library-markdown">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ alt }) => (
            <span className="studio-note">Image: {alt || 'see source attachment'}</span>
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
