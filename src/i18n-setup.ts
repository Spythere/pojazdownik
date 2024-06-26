import localePL from './locales/pl.json';
import localeEN from './locales/en.json';
import { createI18n } from 'vue-i18n';

type LocaleMessageSchema = typeof localePL;
type LocaleKey = 'en' | 'pl';

const locales: { [key in LocaleKey]: LocaleMessageSchema } = {
  en: localeEN,
  pl: localePL,
};

const locale =
  window.localStorage.getItem('locale') || (/^pl\b/.test(navigator.language) ? 'pl' : 'en');

const i18n = createI18n<[LocaleMessageSchema], 'en' | 'pl'>({
  locale,
  fallbackLocale: 'pl',
  legacy: false,
  globalInjection: true,
  messages: locales,
});

export default i18n;
