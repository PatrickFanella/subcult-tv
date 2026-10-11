import type { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/crud';
import PostingNav from './PostingNav';
import '@/styles/studio.css';

export default function PostingShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="studio-page posting-page">
      <AdminHeader
        overline="Publishing"
        title={title}
        description={description}
        action={action}
        nav={<PostingNav />}
      />
      {children}
    </section>
  );
}
