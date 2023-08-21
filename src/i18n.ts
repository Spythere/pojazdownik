import localePL from './locales/pl.json';
import localeEN from './locales/en.json';

export type LocaleMessageSchema = typeof localePL;
type LocaleKey = 'en' | 'pl';

export const locales: { [key in LocaleKey]: LocaleMessageSchema } = {
  en: localeEN,
  pl: localePL,
};
