import { Link, useLocation } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/crud';

/** Unknown address inside the admin shell: keep the sidebar and point back home. */
export default function AdminNotFound() {
  const { pathname } = useLocation();
  return (
    <section>
      <AdminHeader
        overline="Error 404"
        title="Page not found"
        description={
          <>
            There is no admin page at <code className="font-mono">{pathname}</code>. The address may
            have changed; the sidebar lists every page.
          </>
        }
      />
      <Link to="/admin" className="admin-button admin-button-primary">
        ← Back to the dashboard
      </Link>
    </section>
  );
}
