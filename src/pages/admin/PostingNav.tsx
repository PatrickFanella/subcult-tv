import { NavLink } from 'react-router-dom';

/** Sub-navigation shared by every publishing page. */
export default function PostingNav() {
  return (
    <nav className="posting-navigation" aria-label="Publishing pages">
      <NavLink end to="/admin/posts">
        Review
      </NavLink>
      <NavLink to="/admin/posts/delivery">Scheduled & delivered</NavLink>
      <NavLink end to="/admin/posts/articles">
        Development log
      </NavLink>
      <NavLink to="/admin/posts/patreon">Patreon</NavLink>
      <NavLink to="/admin/posts/articles/manage">Articles</NavLink>
      <NavLink to="/admin/posts/automation">Automation</NavLink>
    </nav>
  );
}
