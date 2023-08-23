import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';
import i18n from './i18n-setup';
const pinia = createPinia();

registerSW({
  immediate: true,
});

createApp(App).use(pinia).use(i18n).mount('#app');

