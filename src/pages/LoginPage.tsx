import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card } from '@/components/ui';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    } catch {
      setError(t('error.failed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Card className="auth-form">
        <div className="auth-form__header">
          <img src="/logo.png" alt={t('app.name')} className="auth-form__logo" />
          <h1 className="auth-form__title">{t('auth.log_in_title')}</h1>
          <p className="auth-form__subtitle">{t('auth.welcome_back')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert--error">{error}</div>}

          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

          <Button type="submit" loading={loading} className="auth-form__submit">
            {t('auth.sign_in')}
          </Button>

          <p className="auth-form__footer">
            {t('auth.dont_have_account')} <Link to="/register">{t('auth.sign_up')}</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
