import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccess, landingPath, type Section } from '../data/access';

// Blocks direct navigation to a section the current user can't access,
// redirecting them to the first section they can.
export default function SectionGuard({
  section,
  children,
}: {
  section: Section;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!canAccess(user?.email, section)) {
    return <Navigate to={landingPath(user?.email)} replace />;
  }
  return <>{children}</>;
}
