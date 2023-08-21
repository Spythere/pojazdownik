import localePL from './locales/pl.json';
import localeEN from './locales/en.json';
import { I18n } from 'vue-i18n';

export type LocaleMessageSchema = typeof localePL;
type LocaleKey = 'en' | 'pl';

export const locales: { [key in LocaleKey]: LocaleMessageSchema } = {
  en: localeEN,
  pl: localePL,
};

export async function fetchBackendTranslations(i18n: I18n) {
  const localeData = await (await fetch(`https://spythere.github.io/api/td2/data/locales.json`)).json();

  i18n.global.mergeLocaleMessage('pl', localeData.pl);
  i18n.global.mergeLocaleMessage('en', localeData.en);
}
