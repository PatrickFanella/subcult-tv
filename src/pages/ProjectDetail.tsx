import { Navigate, useParams } from 'react-router-dom';
import { getProductPath, PRODUCT_ROUTES } from '@/lib/product-paths';
import NotFound from '@/pages/NotFound';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  return slug && PRODUCT_ROUTES[slug] ? (
    <Navigate to={getProductPath(slug)} replace />
  ) : (
    <NotFound />
  );
}
