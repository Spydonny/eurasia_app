import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from './icons';

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((lang) => i18n.language?.startsWith(lang.code)) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function select(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className="language-switcher" ref={ref}>
      <button
        type="button"
        className="language-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icons.language size={16} />
        <span className="language-switcher__current">{current.label}</span>
      </button>

      {open && (
        <div className="language-switcher__menu" role="listbox">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={current.code === lang.code}
              onClick={() => select(lang.code)}
              className={`language-switcher__option ${
                current.code === lang.code ? 'language-switcher__option--active' : ''
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
