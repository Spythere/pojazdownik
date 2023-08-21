import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import { createI18n } from 'vue-i18n';

import App from './App.vue';
import { LocaleMessageSchema, locales } from './i18n';

const pinia = createPinia();

const i18n = createI18n<[LocaleMessageSchema], 'en' | 'pl'>({
  locale: 'pl',
  fallbackLocale: 'pl',
  legacy: false,
  globalInjection: true,
  messages: locales,
});

registerSW({
  immediate: true,
});

createApp(App).use(pinia).use(i18n).mount('#app');

