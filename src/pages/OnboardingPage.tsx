import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui';

const INTERESTS = [
  'environment', 'education', 'health', 'animals',
  'culture', 'sports', 'technology', 'social',
];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { dismissOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (i: string) => {
    setSelected((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  const next = () => {
    if (step === 0) {
      setStep(1);
    } else {
      dismissOnboarding();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="onboarding">
      {step === 0 ? (
        <>
          <div className="onboarding__icon"><Icons.celebrate size={48} /></div>
          <h1 className="onboarding__title">{t('onboarding.welcome')}</h1>
          <p className="onboarding__subtitle">
            {t('onboarding.subtitle')}
          </p>
          <div className="onboarding__tokens">
            <Icons.balance size={20} />
            <span>{t('onboarding.tokens_earned')}</span>
          </div>
          <button className="onboarding__btn" onClick={next}>
            {t('onboarding.continue')}
          </button>
        </>
      ) : (
        <>
          <div className="onboarding__icon"><Icons.mission size={48} /></div>
          <h1 className="onboarding__title">{t('onboarding.interests_title')}</h1>
          <p className="onboarding__subtitle">
            {t('onboarding.interests_subtitle')}
          </p>
          <div className="interest-selector">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`interest-option ${selected.includes(i) ? 'interest-option--selected' : ''}`}
              >
                {t(`category.${i}`)}
              </button>
            ))}
          </div>
          <button className="onboarding__btn" onClick={next}>
            {selected.length > 0 ? t('onboarding.get_started') : t('onboarding.skip')}
          </button>
        </>
      )}
    </div>
  );
}
