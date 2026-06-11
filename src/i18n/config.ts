import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import kk from './locales/kk.json';
import be from './locales/be.json';
import ky from './locales/ky.json';
import hy from './locales/hy.json';
import ro from './locales/ro.json';
import tg from './locales/tg.json';
import tk from './locales/tk.json';
import uz from './locales/uz.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk },
      be: { translation: be },
      ky: { translation: ky },
      hy: { translation: hy },
      ro: { translation: ro },
      tg: { translation: tg },
      tk: { translation: tk },
      uz: { translation: uz },
    },
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
