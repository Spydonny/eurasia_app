import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="not-found">
      <h1>{t('not_found.title')}</h1>
      <p>{t('not_found.text')}</p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 8 }}>
        {t('not_found.go_home')}
      </Link>
    </div>
  );
}
