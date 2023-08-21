import localePL from './locales/pl.json';
import localeEN from './locales/en.json';
import { createI18n } from 'vue-i18n';
import axios from 'axios';

type LocaleMessageSchema = typeof localePL;
type LocaleKey = 'en' | 'pl';

const locales: { [key in LocaleKey]: LocaleMessageSchema } = {
  en: localeEN,
  pl: localePL,
};

const i18n = createI18n<[LocaleMessageSchema], 'en' | 'pl'>({
  locale: /^pl\b/.test(navigator.language) ? 'pl' : 'en',
  fallbackLocale: 'pl',
  legacy: false,
  globalInjection: true,
  messages: locales,
});

async function fetchBackendTranslations() {
  const localeData = (await axios.get(`https://spythere.github.io/api/td2/data/locales.json`)).data;

  i18n.global.mergeLocaleMessage('pl', localeData.pl);
  i18n.global.mergeLocaleMessage('en', localeData.en);
}

fetchBackendTranslations();

export default i18n;
