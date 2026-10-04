import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import '@/styles/studio.css';

export default function PostingShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="studio-page posting-page">
      <header className="production-heading">
        <div>
          <p className="studio-label">SUBCULT / PUBLISHING</p>
          <h1>{title}</h1>
        </div>
      </header>
      <nav className="posting-navigation" aria-label="Publishing pages">
        <NavLink end to="/admin/posts">
          Review
        </NavLink>
        <NavLink to="/admin/posts/delivery">Scheduled & delivered</NavLink>
        <NavLink to="/admin/posts/articles">Development log</NavLink>
        <NavLink to="/admin/posts/patreon">Patreon</NavLink>
        <NavLink to="/admin/posts/automation">Automation</NavLink>
      </nav>
      {children}
    </section>
  );
}
