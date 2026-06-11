import type { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
