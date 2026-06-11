import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'ru', label: 'Рус' },
  { code: 'kk', label: 'Қаз' },
  { code: 'be', label: 'Бел' },
  { code: 'ky', label: 'Кыр' },
  { code: 'hy', label: 'Հայ' },
  { code: 'ro', label: 'Rom' },
  { code: 'tg', label: 'Тоҷ' },
  { code: 'tk', label: 'Tkm' },
  { code: 'uz', label: 'Oʻz' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current =
    LANGUAGES.find((lang) => i18n.language?.startsWith(lang.code))?.code ?? 'ru';

  return (
    <div className="language-switcher">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`language-switcher__btn ${
            current === lang.code ? 'language-switcher__btn--active' : ''
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
