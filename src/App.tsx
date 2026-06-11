import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { IconContext } from 'phosphor-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/routes';
import '@/i18n/config';

export function App() {
  const { t } = useTranslation();
  return (
    <IconContext.Provider value={{ color: 'currentColor', size: 20, weight: 'regular' }}>
      <AuthProvider>
        <Suspense fallback={<div className="page-loader">{t('common.loading')}</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </IconContext.Provider>
  );
}
