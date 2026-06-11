import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui';

export function OnboardingPage() {
  const { t } = useTranslation();
  const { dismissOnboarding } = useAuth();
  const navigate = useNavigate();

  const finish = () => {
    dismissOnboarding();
    navigate('/', { replace: true });
  };

  return (
    <div className="onboarding">
      <div className="onboarding__icon"><Icons.celebrate size={48} /></div>
      <h1 className="onboarding__title">{t('onboarding.welcome')}</h1>
      <p className="onboarding__subtitle">
        {t('onboarding.subtitle')}
      </p>
      <div className="onboarding__tokens">
        <Icons.balance size={20} />
        <span>{t('onboarding.tokens_earned')}</span>
      </div>
      <button className="onboarding__btn" onClick={finish}>
        {t('onboarding.get_started')}
      </button>
    </div>
  );
}
