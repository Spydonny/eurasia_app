import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, isFirstLogin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect new users to onboarding
  if (isFirstLogin && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
